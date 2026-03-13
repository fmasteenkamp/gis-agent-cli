import { Command } from 'commander';
import { createInterface } from 'readline/promises';
import { readFileSync } from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import { searchCaPaKey, suggest, reverseGeocode, addressInfo } from '../../services/geopunt.js';
import { renderCaPaKeyResults, renderReverseResults, renderSuggestions, renderCaPaKeyLookup, renderBatchResults } from '../../utils/output.js';
const VALID_FORMATS = ['table', 'json', 'geojson', 'wkt', 'kml', 'url'];
function validateFormat(format, allowed = VALID_FORMATS) {
    if (!allowed.includes(format)) {
        console.error(chalk.red(`Error: --format must be one of: ${allowed.join(', ')}`));
        process.exit(1);
    }
    return format;
}
function validateCrs(crs) {
    if (crs !== '31370' && crs !== '4326') {
        console.error(chalk.red('Error: --crs must be "31370" (Lambert72) or "4326" (WGS84)'));
        process.exit(1);
    }
    return crs;
}
export function buildAddressCommand() {
    const address = new Command('address').description('Address and parcel lookup commands');
    // --- address search ---
    address
        .command('search <address>')
        .description('Search CaPaKey by address')
        .option('-r, --results <number>', 'Number of results to return [1-5]', '1')
        .option('-f, --format <format>', 'Output format: table|json|geojson|wkt|kml|url', 'table')
        .option('-c, --coordinates', 'Include coordinates in output')
        .option('-g, --geometry', 'Include parcel geometry')
        .option('--crs <crs>', 'Coordinate system: 31370 (Lambert72) or 4326 (WGS84)', '31370')
        .action(async (addr, opts) => {
        const maxResults = parseInt(opts.results, 10);
        if (isNaN(maxResults) || maxResults < 1 || maxResults > 5) {
            console.error(chalk.red('Error: --results must be a number between 1 and 5'));
            process.exit(1);
        }
        const format = validateFormat(opts.format);
        const crs = validateCrs(opts.crs);
        const includeGeometry = opts.geometry || format === 'geojson' || format === 'wkt';
        const includeCoordinates = !!opts.coordinates;
        const spinner = ora('Querying Geopunt...').start();
        try {
            const results = await searchCaPaKey(addr, maxResults, { includeCoordinates, includeGeometry });
            spinner.stop();
            if (results.length === 0) {
                console.log(chalk.yellow('No parcels found for the given address.'));
                return;
            }
            renderCaPaKeyResults(results, format, crs);
        }
        catch (err) {
            spinner.fail('Request failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- address suggest ---
    address
        .command('suggest <query>')
        .description('Get address suggestions (autocomplete)')
        .option('-r, --results <number>', 'Number of suggestions [1-10]', '5')
        .option('-f, --format <format>', 'Output format: table|json', 'table')
        .action(async (query, opts) => {
        const count = parseInt(opts.results, 10);
        if (isNaN(count) || count < 1 || count > 10) {
            console.error(chalk.red('Error: --results must be a number between 1 and 10'));
            process.exit(1);
        }
        const format = validateFormat(opts.format, ['table', 'json']);
        try {
            const suggestions = await suggest(query, count);
            if (suggestions.length === 0) {
                console.log(chalk.yellow('No suggestions found.'));
                return;
            }
            renderSuggestions(suggestions, format);
        }
        catch (err) {
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- address reverse ---
    address
        .command('reverse <coord1> <coord2>')
        .description('Reverse geocode: find address from coordinates (default Lambert72 x y)')
        .option('-r, --results <number>', 'Number of results [1-5]', '1')
        .option('-f, --format <format>', 'Output format: table|json|geojson|wkt|kml|url', 'table')
        .option('--crs <crs>', 'Input coordinate system: 31370 (Lambert72 x y) or 4326 (WGS84 lat lon)', '31370')
        .action(async (c1, c2, opts) => {
        const coord1 = parseFloat(c1);
        const coord2 = parseFloat(c2);
        if (isNaN(coord1) || isNaN(coord2)) {
            console.error(chalk.red('Error: coordinates must be valid numbers'));
            process.exit(1);
        }
        const count = parseInt(opts.results, 10);
        if (isNaN(count) || count < 1 || count > 5) {
            console.error(chalk.red('Error: --results must be a number between 1 and 5'));
            process.exit(1);
        }
        const format = validateFormat(opts.format);
        const crs = validateCrs(opts.crs);
        const spinner = ora('Reverse geocoding...').start();
        try {
            const results = await reverseGeocode(coord1, coord2, count, crs);
            spinner.stop();
            if (results.length === 0) {
                console.log(chalk.yellow('No addresses found for the given coordinates.'));
                return;
            }
            renderReverseResults(results, format, crs);
        }
        catch (err) {
            spinner.fail('Request failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- address info ---
    address
        .command('info <address>')
        .description('Full parcel info for an address (search + lookup combined)')
        .option('-f, --format <format>', 'Output format: table|json|geojson|wkt|kml', 'table')
        .action(async (addr, opts) => {
        const format = validateFormat(opts.format);
        const spinner = ora('Looking up address...').start();
        try {
            const result = await addressInfo(addr);
            spinner.stop();
            if (!result) {
                console.log(chalk.yellow('No parcel found for the given address.'));
                return;
            }
            renderCaPaKeyLookup(result, format);
        }
        catch (err) {
            spinner.fail('Lookup failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- address batch ---
    address
        .command('batch <file>')
        .description('Search parcels for multiple addresses from a file (one address per line)')
        .option('-f, --format <format>', 'Output format: table|json|geojson|wkt|kml|url', 'table')
        .option('--crs <crs>', 'Coordinate system: 31370 or 4326', '31370')
        .option('-c, --coordinates', 'Include coordinates in output')
        .option('-g, --geometry', 'Include parcel geometry')
        .action(async (file, opts) => {
        const format = validateFormat(opts.format);
        const crs = validateCrs(opts.crs);
        let lines;
        try {
            lines = readFileSync(file, 'utf-8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        }
        catch {
            console.error(chalk.red(`Error: cannot read file "${file}"`));
            process.exit(1);
        }
        if (lines.length === 0) {
            console.error(chalk.red('Error: file is empty'));
            process.exit(1);
        }
        const includeGeometry = opts.geometry || format === 'geojson';
        const includeCoordinates = !!opts.coordinates;
        const spinner = ora(`Searching ${lines.length} addresses...`).start();
        try {
            const batch = [];
            for (const line of lines) {
                spinner.text = `Searching: ${line}`;
                const results = await searchCaPaKey(line, 1, { includeCoordinates, includeGeometry });
                batch.push({ query: line, results });
            }
            spinner.stop();
            renderBatchResults(batch, format, crs);
        }
        catch (err) {
            spinner.fail('Batch search failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- address interactive ---
    address
        .command('interactive')
        .description('Interactive address search with autocomplete suggestions')
        .option('-f, --format <format>', 'Output format: table|json', 'table')
        .option('--crs <crs>', 'Coordinate system: 31370 or 4326', '31370')
        .action(async (opts) => {
        const format = validateFormat(opts.format, ['table', 'json']);
        const crs = validateCrs(opts.crs);
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        console.log(chalk.gray('Type an address to search. Press Ctrl+C or type "q" to quit.\n'));
        try {
            while (true) {
                const query = await rl.question(chalk.cyan('Address> '));
                if (!query.trim() || query.trim().toLowerCase() === 'q')
                    break;
                const suggestions = await suggest(query.trim(), 5);
                if (suggestions.length === 0) {
                    console.log(chalk.yellow('  No suggestions found. Try a different query.\n'));
                    continue;
                }
                console.log();
                renderSuggestions(suggestions, 'table');
                console.log();
                const pick = await rl.question(chalk.cyan(`Pick [1-${suggestions.length}] or press Enter to skip> `));
                const idx = parseInt(pick, 10);
                if (isNaN(idx) || idx < 1 || idx > suggestions.length) {
                    console.log();
                    continue;
                }
                const selected = suggestions[idx - 1];
                const spinner = ora(`Searching: ${selected}`).start();
                try {
                    const results = await searchCaPaKey(selected, 1, { includeCoordinates: true });
                    spinner.stop();
                    if (results.length === 0) {
                        console.log(chalk.yellow('  No parcels found.\n'));
                    }
                    else {
                        renderCaPaKeyResults(results, format, crs);
                        console.log();
                    }
                }
                catch (err) {
                    spinner.fail('Search failed');
                    console.error(chalk.red(`  ${err.message}\n`));
                }
            }
        }
        finally {
            rl.close();
        }
    });
    return address;
}
