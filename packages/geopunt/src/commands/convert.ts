import { Command } from 'commander';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import { toWkt, featureCollectionToKml, transformFeatureCollection } from '@gis/shared';
import type { OutputFormat, CRS } from '../models/geopunt.js';

export function buildConvertCommand(): Command {
  return new Command('convert')
    .description('Convert a GeoJSON file to another format')
    .argument('<file>', 'Input GeoJSON file path')
    .option('-f, --format <format>', 'Output format: geojson|wkt|kml', 'kml')
    .option('--crs <crs>', 'Transform to CRS: 31370 (Lambert72) or 4326 (WGS84)')
    .action(async (file: string, opts: { format: string; crs?: string }) => {
      const format = opts.format as OutputFormat;
      if (!['geojson', 'wkt', 'kml'].includes(format)) {
        console.error(chalk.red('Error: --format must be "geojson", "wkt", or "kml"'));
        process.exit(1);
      }

      if (opts.crs && opts.crs !== '31370' && opts.crs !== '4326') {
        console.error(chalk.red('Error: --crs must be "31370" (Lambert72) or "4326" (WGS84)'));
        process.exit(1);
      }

      let raw: string;
      try {
        raw = readFileSync(file, 'utf-8');
      } catch {
        console.error(chalk.red(`Error: cannot read file "${file}"`));
        process.exit(1);
      }

      let geojson: unknown;
      try {
        geojson = JSON.parse(raw);
      } catch {
        console.error(chalk.red('Error: file is not valid JSON'));
        process.exit(1);
      }

      const g = geojson as { type?: string; features?: unknown[]; geometry?: unknown; coordinates?: unknown };

      // Normalize to FeatureCollection
      let fc: unknown;
      if (g.type === 'FeatureCollection') {
        fc = geojson;
      } else if (g.type === 'Feature') {
        fc = { type: 'FeatureCollection', features: [geojson] };
      } else if (g.type && g.coordinates) {
        fc = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: geojson, properties: {} }] };
      } else {
        console.error(chalk.red('Error: input must be GeoJSON (FeatureCollection, Feature, or Geometry)'));
        process.exit(1);
      }

      // Apply CRS transform if requested
      if (opts.crs) {
        const toCrs = opts.crs === '4326' ? 'EPSG:4326' : 'EPSG:31370';
        fc = transformFeatureCollection(fc, toCrs as 'EPSG:4326' | 'EPSG:31370');
      }

      const collection = fc as { features: { geometry: unknown; properties?: Record<string, unknown> }[] };

      switch (format) {
        case 'kml': {
          // KML requires WGS84 — transform if not already
          let kmlFc = fc;
          if (opts.crs !== '4326') {
            kmlFc = transformFeatureCollection(fc, 'EPSG:4326');
          }
          console.log(featureCollectionToKml(kmlFc));
          break;
        }
        case 'wkt': {
          for (const f of collection.features) {
            const name = (f.properties?.capaKey ?? f.properties?.CAPAKEY ?? f.properties?.name ?? '') as string;
            const prefix = name ? `${name}\t` : '';
            console.log(`${prefix}${toWkt(f.geometry)}`);
          }
          break;
        }
        case 'geojson':
        default:
          console.log(JSON.stringify(fc, null, 2));
          break;
      }
    });
}
