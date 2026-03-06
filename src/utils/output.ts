import chalk from 'chalk';
import Table from 'cli-table3';
import type { CaPaKeySearchResult, CaPaKeyLookupResult, OutputFormat } from '../models/geopunt.js';
import { toWkt, toGeoJsonFeature } from './geometry.js';

export function renderCaPaKeyResults(results: CaPaKeySearchResult[], format: OutputFormat): void {
  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const table = new Table({
    head: [
      chalk.bold('CaPaKey'),
      chalk.bold('Address'),
      chalk.bold('Municipality'),
      chalk.bold('Section'),
      chalk.bold('Perceelnr'),
      chalk.bold('Type'),
    ],
    style: { head: ['cyan'] },
  });

  for (const r of results) {
    table.push([
      chalk.cyan(r.capaKey),
      r.formattedAddress,
      r.municipality,
      r.section,
      r.perceelnummer,
      chalk.gray(r.locationType),
    ]);
  }

  console.log(table.toString());
}

export function renderCaPaKeyLookup(result: CaPaKeyLookupResult, format: OutputFormat): void {
  if (format === 'geojson') {
    if (!result.geometry) {
      console.error(chalk.red('No geometry available. Use -g to include geometry.'));
      process.exit(1);
    }
    const { geometry, ...properties } = result;
    console.log(JSON.stringify(toGeoJsonFeature(geometry, properties), null, 2));
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

  if (result.geometry) {
    table.push({ [chalk.bold('Geometry')]: JSON.stringify(result.geometry, null, 2) });
  }

  console.log(table.toString());
}
