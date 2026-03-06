import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { searchCaPaKey } from '../services/geopunt.js';
import { queryHaltes } from '../services/haltes.js';
import { renderHaltes } from '../utils/output.js';
import { wgs84ToLambert72 } from '../utils/geometry.js';
const VALID_FORMATS = ['table', 'json', 'geojson', 'kml'];
export function buildHaltesCommand() {
    return new Command('haltes')
        .description('Find De Lijn public transit stops near an address or coordinates')
        .argument('<location>', 'Address string or "x,y" Lambert72 coordinates')
        .argument('[radius]', 'Search radius in meters', '500')
        .option('-f, --format <format>', 'Output format: table|json|geojson|kml', 'table')
        .option('-n, --max <number>', 'Max number of stops', '20')
        .option('--crs <crs>', 'Coordinate system: 31370 (Lambert72) or 4326 (WGS84)', '31370')
        .action(async (location, radiusStr, opts) => {
        const radius = parseFloat(radiusStr);
        if (isNaN(radius) || radius <= 0) {
            console.error(chalk.red('Error: radius must be a positive number (meters)'));
            process.exit(1);
        }
        const format = opts.format;
        if (!VALID_FORMATS.includes(format)) {
            console.error(chalk.red(`Error: --format must be one of: ${VALID_FORMATS.join(', ')}`));
            process.exit(1);
        }
        const crs = opts.crs;
        if (crs !== '31370' && crs !== '4326') {
            console.error(chalk.red('Error: --crs must be "31370" (Lambert72) or "4326" (WGS84)'));
            process.exit(1);
        }
        const maxFeatures = parseInt(opts.max, 10);
        if (isNaN(maxFeatures) || maxFeatures < 1) {
            console.error(chalk.red('Error: --max must be a positive number'));
            process.exit(1);
        }
        const isCoords = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(location);
        const spinner = ora('Searching for stops...').start();
        try {
            let x, y;
            if (isCoords) {
                const [c1, c2] = location.split(',').map(s => parseFloat(s.trim()));
                if (crs === '4326') {
                    const [lx, ly] = wgs84ToLambert72(c1, c2);
                    x = lx;
                    y = ly;
                }
                else {
                    x = c1;
                    y = c2;
                }
            }
            else {
                const results = await searchCaPaKey(location, 1, { includeCoordinates: true });
                if (results.length === 0 || !results[0].coordinates) {
                    spinner.fail('Address not found');
                    process.exit(1);
                }
                x = results[0].coordinates.lambert72.x;
                y = results[0].coordinates.lambert72.y;
                spinner.text = `Found: ${results[0].formattedAddress} — searching stops...`;
            }
            const haltes = await queryHaltes(x, y, radius, maxFeatures);
            spinner.stop();
            if (haltes.features.length === 0) {
                console.log(chalk.yellow(`No stops found within ${radius}m.`));
                return;
            }
            console.log(chalk.gray(`Found ${haltes.features.length} stop(s) within ${radius}m\n`));
            renderHaltes(haltes, format, crs);
        }
        catch (err) {
            spinner.fail('Query failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
}
