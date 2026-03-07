import { Command } from 'commander';
import { readFileSync } from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import GeometryFactory from 'jsts/org/locationtech/jts/geom/GeometryFactory.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js';
import IsValidOp from 'jsts/org/locationtech/jts/operation/valid/IsValidOp.js';
import { searchCaPaKey } from '../services/geopunt.js';
import { queryOverlap } from '../services/overlap.js';
import { wgs84ToLambert72, createBufferPolygon, transformGeometry } from '../utils/geometry.js';
import { OVERLAP_LAYERS, findOverlapLayer, searchOverlapLayers } from '../models/overlap-layers.js';
import type { CRS } from '../models/geopunt.js';
import Table from 'cli-table3';

const VALID_FORMATS = ['table', 'json'];

export function buildOverlapCommand(): Command {
  const overlap = new Command('overlap')
    .description('Check overlap with ANB environmental/policy layers')
    .argument('[layer]', 'Layer keyword (use --list to see all)')
    .argument('[location]', 'Address, "x,y" coords, GeoJSON string, or @file.geojson')
    .argument('[radius]', 'Buffer radius in meters (default: 50, ignored for GeoJSON input)', '50')
    .option('-f, --format <format>', 'Output format: table|json', 'table')
    .option('--crs <crs>', 'Coordinate system for input: 31370|4326', '31370')
    .option('--list', 'List all available overlap layers')
    .option('--search <query>', 'Search layers by keyword/description')
    .option('--all', 'Check all overlap layers at once')
    .action(async (layer: string | undefined, location: string | undefined, radiusStr: string, opts: {
      format: string; crs: string; list?: boolean; search?: string; all?: boolean;
    }) => {
      // --list: show all layers
      if (opts.list) {
        printLayerList();
        return;
      }

      // --search: filter layers
      if (opts.search) {
        const results = searchOverlapLayers(opts.search);
        if (results.length === 0) {
          console.log(chalk.yellow(`No layers matching "${opts.search}"`));
          return;
        }
        printLayerList(results);
        return;
      }

      // Validate args
      if (!layer || !location) {
        console.error(chalk.red('Error: <layer> and <location> are required. Use --list to see available layers.'));
        process.exit(1);
      }

      const format = opts.format;
      if (!VALID_FORMATS.includes(format)) {
        console.error(chalk.red(`Error: --format must be one of: ${VALID_FORMATS.join(', ')}`));
        process.exit(1);
      }

      const crs = opts.crs as CRS;
      if (crs !== '31370' && crs !== '4326') {
        console.error(chalk.red('Error: --crs must be "31370" or "4326"'));
        process.exit(1);
      }

      // Resolve layers
      let layers;
      if (opts.all) {
        layers = OVERLAP_LAYERS;
      } else {
        const config = findOverlapLayer(layer);
        if (!config) {
          const suggestions = searchOverlapLayers(layer);
          if (suggestions.length > 0) {
            console.error(chalk.red(`Unknown layer "${layer}". Did you mean:`));
            for (const s of suggestions.slice(0, 5)) {
              console.error(chalk.yellow(`  ${s.keyword.padEnd(30)} ${s.description}`));
            }
          } else {
            console.error(chalk.red(`Unknown layer "${layer}". Use --list to see available layers.`));
          }
          process.exit(1);
        }
        layers = [config];
      }

      // Parse GeoJSON before starting spinner (validation may exit)
      const geojsonInput = parseGeoJsonInput(location, crs);

      const spinner = ora('Preparing overlap query...').start();

      try {
        let feature: { type: 'Feature'; geometry: unknown; properties: Record<string, unknown> };

        if (geojsonInput) {
          feature = geojsonInput;
          spinner.text = 'Using GeoJSON input...';
        } else {
          // Address or coordinate input — build buffer
          const radius = parseFloat(radiusStr);
          if (isNaN(radius) || radius <= 0) {
            spinner.fail('radius must be a positive number (meters)');
            process.exit(1);
          }

          const isCoords = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(location);
          let x: number, y: number;

          if (isCoords) {
            const [c1, c2] = location.split(',').map(s => parseFloat(s.trim()));
            if (crs === '4326') {
              [x, y] = wgs84ToLambert72(c1, c2);
            } else {
              x = c1;
              y = c2;
            }
          } else {
            spinner.text = 'Geocoding address...';
            const results = await searchCaPaKey(location, 1, { includeCoordinates: true });
            if (results.length === 0 || !results[0].coordinates) {
              spinner.fail('Address not found');
              process.exit(1);
            }
            x = results[0].coordinates.lambert72.x;
            y = results[0].coordinates.lambert72.y;
            spinner.text = `Found: ${results[0].formattedAddress}`;
          }

          const bufferGeom = createBufferPolygon(x, y, radius);
          feature = { type: 'Feature', geometry: bufferGeom, properties: {} };
        }

        // Query each layer
        const allResults: { keyword: string; label: string; result: unknown }[] = [];

        for (const cfg of layers) {
          spinner.text = `Checking ${cfg.label}...`;
          try {
            const result = await queryOverlap(cfg, feature);
            allResults.push({ keyword: cfg.keyword, label: cfg.label, result });
          } catch (err) {
            allResults.push({ keyword: cfg.keyword, label: cfg.label, result: { error: (err as Error).message } });
          }
        }

        spinner.stop();

        // Output
        if (format === 'json') {
          if (layers.length === 1) {
            console.log(JSON.stringify(allResults[0].result, null, 2));
          } else {
            const out: Record<string, unknown> = {};
            for (const r of allResults) out[r.keyword] = r.result;
            console.log(JSON.stringify(out, null, 2));
          }
          return;
        }

        // table format
        for (const r of allResults) {
          const data = r.result as Record<string, unknown>;

          if ('error' in data) {
            console.log(`${chalk.cyan(r.label)}: ${chalk.red(data.error)}`);
            continue;
          }

          const intersecting = data.intersecting as unknown[] | undefined;
          const count = intersecting?.length ?? 0;

          if (count === 0) {
            console.log(`${chalk.cyan(r.label)}: ${chalk.yellow('No intersections')}`);
            continue;
          }

          console.log(`\n${chalk.cyan(r.label)} ${chalk.gray(`(${r.keyword})`)}: ${chalk.green(`${count} intersection(s)`)}`);
          if (data.layerName) {
            console.log(chalk.gray(`  Layer: ${data.layerName}`));
          }

          // Build table from intersection properties
          if (intersecting && intersecting.length > 0) {
            const first = intersecting[0] as Record<string, unknown>;
            const keys = Object.keys(first).filter(k => k !== 'geometry' && k !== 'SHAPE');
            if (keys.length > 0) {
              const table = new Table({
                head: keys.map(k => chalk.bold(k)),
                style: { head: ['cyan'] },
              });
              for (const item of intersecting) {
                const row = item as Record<string, unknown>;
                table.push(keys.map(k => {
                  const v = row[k];
                  if (v == null) return '';
                  if (typeof v === 'object') return JSON.stringify(v);
                  return String(v);
                }));
              }
              console.log(table.toString());
            }
          }
        }
      } catch (err) {
        spinner.fail('Overlap query failed');
        console.error(chalk.red((err as Error).message));
        process.exit(1);
      }
    });

  return overlap;
}

function parseGeoJsonInput(
  location: string,
  crs: string,
): { type: 'Feature'; geometry: unknown; properties: Record<string, unknown> } | null {
  let raw: string | null = null;

  // @file.geojson
  if (location.startsWith('@')) {
    const filePath = location.slice(1);
    try {
      raw = readFileSync(filePath, 'utf-8');
    } catch {
      console.error(chalk.red(`Error: cannot read file "${filePath}"`));
      process.exit(1);
    }
  }

  // Inline JSON string (starts with { or [)
  if (!raw && (location.startsWith('{') || location.startsWith('['))) {
    raw = location;
  }

  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error(chalk.red('Error: invalid JSON in GeoJSON input'));
    process.exit(1);
  }

  const obj = parsed as Record<string, unknown>;
  let feature: { type: 'Feature'; geometry: unknown; properties: Record<string, unknown> };

  if (obj.type === 'Feature') {
    feature = parsed as typeof feature;
  } else if (obj.type === 'FeatureCollection') {
    const fc = parsed as { features: unknown[] };
    if (!fc.features || fc.features.length === 0) {
      console.error(chalk.red('Error: FeatureCollection has no features'));
      process.exit(1);
    }
    feature = fc.features[0] as typeof feature;
  } else if (obj.type && obj.coordinates) {
    // Bare geometry
    feature = { type: 'Feature', geometry: parsed, properties: {} };
  } else {
    console.error(chalk.red('Error: input must be a GeoJSON Feature, FeatureCollection, or Geometry'));
    process.exit(1);
  }

  // Validate
  const issues = validateOverlapFeature(feature, crs);
  if (issues.length > 0) {
    console.error(chalk.red('GeoJSON validation failed:'));
    for (const issue of issues) console.error(chalk.red(`  - ${issue}`));
    process.exit(1);
  }

  // Transform WGS84 to Lambert72 if needed
  if (crs === '4326') {
    feature = {
      ...feature,
      geometry: transformGeometry(feature.geometry, 'EPSG:31370'),
    };
  }

  // Ensure properties exists
  if (!feature.properties) feature.properties = {};

  return feature;
}

function validateOverlapFeature(feature: { type: string; geometry: unknown; properties?: unknown }, crs: string): string[] {
  const issues: string[] = [];

  if (feature.type !== 'Feature') {
    issues.push('type must be "Feature"');
  }

  const geom = feature.geometry as Record<string, unknown> | null;
  if (!geom || !geom.type || !geom.coordinates) {
    issues.push('geometry must have type and coordinates');
    return issues;
  }

  // API only accepts Polygon/MultiPolygon
  if (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon') {
    issues.push(`overlap API requires Polygon or MultiPolygon, got "${geom.type}"`);
  }

  if (typeof feature.properties !== 'object' || feature.properties === null) {
    issues.push('properties must be an object (can be {})');
  }

  // Sample first coordinate for Lambert72 range check
  const coords = geom.coordinates as unknown;
  const sample = extractFirstCoord(coords);
  if (sample) {
    const [x, y] = sample;
    const isLambert = x >= 20_000 && x <= 260_000 && y >= 150_000 && y <= 250_000;
    const isWgs84 = x >= -180 && x <= 180 && y >= -90 && y <= 90;
    if (!isLambert && !isWgs84) {
      issues.push(`coordinates [${x}, ${y}] don't look like Lambert72 or WGS84`);
    } else if (isWgs84 && !isLambert && crs !== '4326') {
      issues.push('coordinates appear to be WGS84 — add --crs 4326 to auto-transform to Lambert72');
    }
  }

  // Check polygon ring closure
  if (geom.type === 'Polygon') {
    const rings = geom.coordinates as number[][][];
    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i];
      if (ring.length < 4) {
        issues.push(`polygon ring ${i} has fewer than 4 coordinates`);
      } else {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          issues.push(`polygon ring ${i} is not closed (first coord must equal last)`);
        }
      }
    }
  }

  // JSTS topology validation
  if (issues.length === 0) {
    try {
      const reader = new GeoJSONReader(new GeometryFactory());
      const jstsGeom = reader.read(geom);
      const validOp = new IsValidOp(jstsGeom);
      if (!validOp.isValid()) {
        const err = validOp.getValidationError();
        issues.push(`geometry is topologically invalid: ${err?.toString() ?? 'unknown reason'}`);
      }
    } catch (err) {
      issues.push(`geometry parse error: ${(err as Error).message}`);
    }
  }

  return issues;
}

function extractFirstCoord(coords: unknown): [number, number] | null {
  if (!Array.isArray(coords)) return null;
  if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    return [coords[0], coords[1]];
  }
  return extractFirstCoord(coords[0]);
}

function printLayerList(layers = OVERLAP_LAYERS): void {
  const table = new Table({
    head: [chalk.bold('Keyword'), chalk.bold('Label'), chalk.bold('Description')],
    style: { head: ['cyan'] },
    colWidths: [32, 30, 50],
    wordWrap: true,
  });

  for (const l of layers) {
    table.push([chalk.cyan(l.keyword), l.label, l.description]);
  }

  console.log(chalk.bold(`\nAvailable overlap layers (${layers.length}):\n`));
  console.log(table.toString());
}
