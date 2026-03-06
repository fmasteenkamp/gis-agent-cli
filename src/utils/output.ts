import chalk from 'chalk';
import Table from 'cli-table3';
import type { CaPaKeySearchResult, CaPaKeyLookupResult, ReverseResult, OutputFormat, CRS } from '../models/geopunt.js';
import { toWkt, toGeoJsonFeature, toGoogleMapsUrl, featureCollectionToKml, transformFeatureCollection } from './geometry.js';

// --- Helper: apply CRS transform to a FeatureCollection if needed ---

function maybeToCrs(fc: unknown, crs: CRS): unknown {
  return crs === '4326' ? transformFeatureCollection(fc, 'EPSG:4326') : fc;
}

// --- Search results ---

export function renderCaPaKeyResults(results: CaPaKeySearchResult[], format: OutputFormat, crs: CRS = '31370'): void {
  if (format === 'geojson' || format === 'kml') {
    const features = results
      .filter(r => r.geometry)
      .map(r => {
        const { geometry, ...properties } = r;
        return toGeoJsonFeature(geometry, properties);
      });
    const fc = maybeToCrs({ type: 'FeatureCollection', features }, crs);
    if (format === 'kml') {
      console.log(featureCollectionToKml(fc));
    } else {
      console.log(JSON.stringify(fc, null, 2));
    }
    return;
  }

  if (format === 'wkt') {
    for (const r of results) {
      if (r.geometry) {
        console.log(`${r.capaKey}\t${toWkt(r.geometry)}`);
      }
    }
    return;
  }

  if (format === 'url') {
    for (const r of results) {
      if (r.coordinates) {
        const { lat, lon } = r.coordinates.wgs84;
        console.log(`${r.capaKey}\t${r.formattedAddress}\t${toGoogleMapsUrl(lat, lon)}`);
      }
    }
    return;
  }

  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const showCoords = results.some(r => r.coordinates);
  const head = [
    chalk.bold('CaPaKey'),
    chalk.bold('Address'),
    chalk.bold('Municipality'),
    chalk.bold('Section'),
    chalk.bold('Perceelnr'),
    chalk.bold('Type'),
  ];

  if (showCoords) {
    if (crs === '4326') {
      head.push(chalk.bold('Lat'), chalk.bold('Lon'));
    } else {
      head.push(chalk.bold('X'), chalk.bold('Y'));
    }
  }

  const table = new Table({ head, style: { head: ['cyan'] } });

  for (const r of results) {
    const row: string[] = [
      chalk.cyan(r.capaKey),
      r.formattedAddress,
      r.municipality,
      r.section,
      r.perceelnummer,
      chalk.gray(r.locationType),
    ];

    if (showCoords && r.coordinates) {
      if (crs === '4326') {
        row.push(r.coordinates.wgs84.lat.toFixed(6), r.coordinates.wgs84.lon.toFixed(6));
      } else {
        row.push(r.coordinates.lambert72.x.toFixed(2), r.coordinates.lambert72.y.toFixed(2));
      }
    }

    table.push(row);
  }

  console.log(table.toString());
}

// --- Lookup result ---

export function renderCaPaKeyLookup(result: CaPaKeyLookupResult, format: OutputFormat): void {
  if (format === 'geojson' || format === 'kml') {
    if (!result.geometry) {
      console.error(chalk.red('No geometry available. Use -g to include geometry.'));
      process.exit(1);
    }
    const { geometry, ...properties } = result;
    const feature = toGeoJsonFeature(geometry, properties);
    const fc = { type: 'FeatureCollection', features: [feature] };
    if (format === 'kml') {
      console.log(featureCollectionToKml(transformFeatureCollection(fc, 'EPSG:4326')));
    } else {
      console.log(JSON.stringify(fc, null, 2));
    }
    return;
  }

  if (format === 'wkt') {
    if (!result.geometry) {
      console.error(chalk.red('No geometry available. Use -g to include geometry.'));
      process.exit(1);
    }
    console.log(toWkt(result.geometry));
    return;
  }

  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const table = new Table({ style: { head: ['cyan'] } });

  table.push(
    { [chalk.bold('CaPaKey')]:       chalk.cyan(result.capaKey) },
    { [chalk.bold('Municipality')]:  result.municipality },
    { [chalk.bold('Department')]:    result.department },
    { [chalk.bold('Section')]:       result.section },
    { [chalk.bold('Perceelnr')]:     result.perceelnummer },
    { [chalk.bold('Grondnummer')]:   result.grondnummer },
    { [chalk.bold('Addresses')]:     result.addresses.length > 0 ? result.addresses.join('\n') : chalk.gray('none') },
  );

  if (result.centroid) {
    table.push({ [chalk.bold('Centroid')]: `X=${result.centroid.x.toFixed(2)}, Y=${result.centroid.y.toFixed(2)} (Lambert72)` });
  }

  if (result.geometry) {
    table.push({ [chalk.bold('Geometry')]: JSON.stringify(result.geometry, null, 2) });
  }

  console.log(table.toString());
}

// --- Reverse results ---

export function renderReverseResults(results: ReverseResult[], format: OutputFormat, crs: CRS = '31370'): void {
  if (format === 'geojson' || format === 'kml') {
    const features = results.map(r => {
      const geometry = { type: 'Point', coordinates: [r.coordinates.wgs84.lon, r.coordinates.wgs84.lat] };
      const { coordinates, ...properties } = r;
      return toGeoJsonFeature(geometry, { ...properties, ...coordinates });
    });
    const fc = { type: 'FeatureCollection', features };
    if (format === 'kml') {
      console.log(featureCollectionToKml(fc));
    } else {
      console.log(JSON.stringify(fc, null, 2));
    }
    return;
  }

  if (format === 'wkt') {
    for (const r of results) {
      const { x, y } = r.coordinates.lambert72;
      console.log(`${r.formattedAddress}\tPOINT (${x} ${y})`);
    }
    return;
  }

  if (format === 'url') {
    for (const r of results) {
      const { lat, lon } = r.coordinates.wgs84;
      console.log(`${r.formattedAddress}\t${toGoogleMapsUrl(lat, lon)}`);
    }
    return;
  }

  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const table = new Table({
    head: [
      chalk.bold('Address'),
      chalk.bold('Type'),
      crs === '4326' ? chalk.bold('Lat') : chalk.bold('X'),
      crs === '4326' ? chalk.bold('Lon') : chalk.bold('Y'),
      chalk.bold('CaPaKey'),
      chalk.bold('Municipality'),
    ],
    style: { head: ['cyan'] },
  });

  for (const r of results) {
    const coord1 = crs === '4326' ? r.coordinates.wgs84.lat.toFixed(6) : r.coordinates.lambert72.x.toFixed(2);
    const coord2 = crs === '4326' ? r.coordinates.wgs84.lon.toFixed(6) : r.coordinates.lambert72.y.toFixed(2);

    table.push([
      r.formattedAddress,
      chalk.gray(r.locationType),
      coord1,
      coord2,
      r.capaKey ? chalk.cyan(r.capaKey) : chalk.gray('N/A'),
      r.municipality ?? chalk.gray('N/A'),
    ]);
  }

  console.log(table.toString());
}

// --- Suggestions ---

export function renderSuggestions(suggestions: string[], format: 'table' | 'json'): void {
  if (format === 'json') {
    console.log(JSON.stringify(suggestions, null, 2));
    return;
  }

  for (let i = 0; i < suggestions.length; i++) {
    console.log(`  ${chalk.cyan(`${i + 1}.`)} ${suggestions[i]}`);
  }
}

// --- Batch results ---

export function renderBatchResults(
  batch: { query: string; results: CaPaKeySearchResult[] }[],
  format: OutputFormat,
  crs: CRS = '31370',
): void {
  if (format === 'geojson' || format === 'kml') {
    const features = batch.flatMap(b =>
      b.results.filter(r => r.geometry).map(r => {
        const { geometry, ...properties } = r;
        return toGeoJsonFeature(geometry, { ...properties, query: b.query });
      })
    );
    const fc = maybeToCrs({ type: 'FeatureCollection', features }, crs);
    if (format === 'kml') {
      console.log(featureCollectionToKml(fc));
    } else {
      console.log(JSON.stringify(fc, null, 2));
    }
    return;
  }

  if (format === 'wkt') {
    for (const b of batch) {
      for (const r of b.results) {
        if (r.geometry) {
          console.log(`${r.capaKey}\t${toWkt(r.geometry)}`);
        }
      }
    }
    return;
  }

  if (format === 'json') {
    console.log(JSON.stringify(batch, null, 2));
    return;
  }

  for (const b of batch) {
    console.log(chalk.bold(`\n${b.query}`));
    if (b.results.length === 0) {
      console.log(chalk.yellow('  No parcels found.'));
    } else {
      renderCaPaKeyResults(b.results, format, crs);
    }
  }
}

