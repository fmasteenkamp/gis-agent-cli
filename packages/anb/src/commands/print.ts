import { Command } from 'commander';
import { readFileSync } from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import { geocodeAddress, wgs84ToLambert72, createBufferPolygon, transformGeometry, fromWkt } from '@gis/shared';
import {
  exportWebMap,
  getParcelExtent,
  geojsonToFeatureCollectionLayer,
  type Extent,
  type PrintOptions,
} from '../services/print.js';
import { findMapServerLayer } from '../models/mapserver-layers.js';

export function buildPrintCommand(): Command {
  return new Command('print')
    .description('Generate a map image via the ArcGIS Print Service')
    .argument('[location]', 'Address, "x,y" Lambert72 coords, or omit when using --capakey')
    .option('--capakey <capakey>', 'Use parcel extent from CaPaKey instead of address')
    .option('--buffer <meters>', 'Extent buffer in meters', '500')
    .option('--ortho', 'Include orthophoto base layer', false)
    .option('--dpi <dpi>', 'Output DPI (72-300)', '96')
    .option('--size <WxH>', 'Output size in pixels', '1200x800')
    .option('--format <format>', 'Output format: JPG|PNG', 'JPG')
    .option('--layers <keywords>', 'Comma-separated MapServer layer keywords to overlay')
    .option('--highlight <data...>', 'GeoJSON/WKT to highlight (@file, inline JSON, or WKT string; repeatable)')
    .option('--crs <crs>', 'Input CRS: 31370|4326', '31370')
    .option('--open', 'Open result URL in default browser', false)
    .action(async (location: string | undefined, opts: {
      capakey?: string;
      buffer: string;
      ortho: boolean;
      dpi: string;
      size: string;
      format: string;
      layers?: string;
      highlight?: string[];
      crs: string;
      open: boolean;
    }) => {
      // --- Validate inputs ---
      if (!location && !opts.capakey) {
        console.error(chalk.red('Error: provide a <location> or --capakey'));
        process.exit(1);
      }

      const buffer = parseFloat(opts.buffer);
      if (isNaN(buffer) || buffer < 0) {
        console.error(chalk.red('Error: --buffer must be a non-negative number'));
        process.exit(1);
      }

      const dpi = parseInt(opts.dpi, 10);
      if (isNaN(dpi) || dpi < 72 || dpi > 300) {
        console.error(chalk.red('Error: --dpi must be between 72 and 300'));
        process.exit(1);
      }

      const sizeMatch = opts.size.match(/^(\d+)x(\d+)$/);
      if (!sizeMatch) {
        console.error(chalk.red('Error: --size must be WxH (e.g. 1200x800)'));
        process.exit(1);
      }
      const outputWidth = parseInt(sizeMatch[1], 10);
      const outputHeight = parseInt(sizeMatch[2], 10);

      const format = opts.format.toUpperCase();
      if (format !== 'JPG' && format !== 'PNG') {
        console.error(chalk.red('Error: --format must be JPG or PNG'));
        process.exit(1);
      }

      const spinner = ora('Preparing map...').start();

      try {
        // --- Resolve extent ---
        let extent: Extent;

        if (opts.capakey) {
          spinner.text = `Looking up parcel ${opts.capakey}...`;
          extent = await getParcelExtent(opts.capakey, buffer);
        } else {
          // Location: coords or address
          const loc = location as string;
          const isCoords = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(loc);
          let x: number, y: number;

          if (isCoords) {
            const [c1, c2] = loc.split(',').map(s => parseFloat(s.trim()));
            if (opts.crs === '4326') {
              [x, y] = wgs84ToLambert72(c1, c2);
            } else {
              x = c1;
              y = c2;
            }
          } else {
            spinner.text = 'Geocoding address...';
            const coord = await geocodeAddress(loc);
            if (!coord) {
              spinner.fail('Address not found');
              process.exit(1);
            }
            x = coord.x;
            y = coord.y;
          }

          extent = {
            xmin: x - buffer,
            ymin: y - buffer,
            xmax: x + buffer,
            ymax: y + buffer,
            spatialReference: { wkid: 31370 },
          };
        }

        // --- Build additional layers ---
        const additionalLayers: unknown[] = [];

        // MapServer overlay layers (keywords or direct URLs)
        if (opts.layers) {
          const keywords = opts.layers.split(',').map(k => k.trim());
          for (const kw of keywords) {
            const url = kw.startsWith('http') ? kw : (() => {
              const config = findMapServerLayer(kw);
              if (!config) {
                spinner.fail(`Unknown MapServer layer "${kw}". Use: anb-gis mapserver --list`);
                process.exit(1);
              }
              return config.url;
            })();
            const layer = await resolveMapServerLayer(url, spinner);
            additionalLayers.push(layer);
          }
        }

        // Highlight layers from GeoJSON/WKT
        if (opts.highlight) {
          for (const input of opts.highlight) {
            const geometry = parseHighlightInput(input, opts.crs);
            additionalLayers.push(geojsonToFeatureCollectionLayer(geometry));
          }
        }

        // --- Generate map ---
        spinner.text = 'Generating map image...';

        const printOpts: PrintOptions = {
          extent,
          includeOrthoPhoto: opts.ortho,
          additionalLayers: additionalLayers as PrintOptions['additionalLayers'],
          dpi,
          outputWidth,
          outputHeight,
          format: format as 'JPG' | 'PNG',
        };

        const result = await exportWebMap(printOpts);
        spinner.succeed('Map image generated!');

        console.log(`\n${chalk.bold('URL:')} ${result.url}`);

        // Open in browser
        if (opts.open) {
          const { exec } = await import('child_process');
          const cmd = process.platform === 'win32' ? 'start' :
                      process.platform === 'darwin' ? 'open' : 'xdg-open';
          exec(`${cmd} "${result.url}"`);
        }
      } catch (err) {
        spinner.fail('Map generation failed');
        console.error(chalk.red((err as Error).message));
        process.exit(1);
      }
    });
}

async function resolveMapServerLayer(url: string, spinner: ReturnType<typeof ora>): Promise<unknown> {
  // If URL points to a specific sublayer (e.g. /MapServer/2), use it directly
  if (/\/MapServer\/\d+$/.test(url)) {
    const id = url.match(/\/(\d+)$/)?.[1];
    return { url, type: 'MapServer', opacity: 0.7, visibleLayers: [id] };
  }

  // Otherwise fetch sublayer list and enable all
  try {
    const res = await fetch(`${url}?f=json`);
    if (res.ok) {
      const data = await res.json() as { layers?: Array<{ id: number; name: string }> };
      if (data.layers?.length) {
        const ids = data.layers.map(l => String(l.id));
        return { url, type: 'MapServer', opacity: 0.7, visibleLayers: ids };
      }
    }
  } catch {
    // Fall through to default
  }

  return { url, type: 'MapServer', opacity: 0.7 };
}

const WKT_PREFIXES = ['POINT', 'LINESTRING', 'POLYGON', 'MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON', 'GEOMETRYCOLLECTION'];

function isWkt(s: string): boolean {
  const upper = s.trimStart().toUpperCase();
  return WKT_PREFIXES.some(p => upper.startsWith(p));
}

function parseHighlightInput(input: string, crs: string): unknown {
  let raw: string;

  // @file — read from disk
  if (input.startsWith('@')) {
    const filePath = input.slice(1);
    try {
      raw = readFileSync(filePath, 'utf-8').trim();
    } catch {
      console.error(chalk.red(`Error: cannot read file "${filePath}"`));
      process.exit(1);
    }
  } else {
    raw = input.trim();
  }

  // Detect format and parse to GeoJSON geometry
  let geometry: unknown;

  if (isWkt(raw)) {
    // WKT input
    try {
      geometry = fromWkt(raw);
    } catch (err) {
      console.error(chalk.red(`Error: invalid WKT — ${(err as Error).message}`));
      process.exit(1);
    }
  } else {
    // JSON input (GeoJSON Feature, FeatureCollection, or bare geometry)
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error(chalk.red('Error: --highlight must be valid GeoJSON or WKT'));
      process.exit(1);
    }

    const obj = parsed as Record<string, unknown>;

    if (obj.type === 'Feature') {
      geometry = (parsed as { geometry: unknown }).geometry;
    } else if (obj.type === 'FeatureCollection') {
      const fc = parsed as { features: Array<{ geometry: unknown }> };
      if (!fc.features?.length) {
        console.error(chalk.red('Error: FeatureCollection has no features'));
        process.exit(1);
      }
      geometry = fc.features[0].geometry;
    } else if (obj.type && obj.coordinates) {
      geometry = parsed;
    } else {
      console.error(chalk.red('Error: --highlight must be a GeoJSON Feature, FeatureCollection, Geometry, or WKT string'));
      process.exit(1);
    }
  }

  // Transform WGS84 → Lambert72 if needed
  if (crs === '4326') {
    geometry = transformGeometry(geometry, 'EPSG:31370');
  }

  return geometry;
}
