import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { lookupCaPaKey } from '../../services/geopunt.js';
import { renderCaPaKeyLookup } from '../../utils/output.js';
export function buildCaPaKeyCommand() {
    const capakey = new Command('capakey').description('CaPaKey (parcel) commands');
    capakey
        .command('lookup <capakey>')
        .description('Look up parcel details by CaPaKey (e.g. 41342B0558/00V000)')
        .option('-f, --format <format>', 'Output format: table|json|geojson|wkt|kml', 'table')
        .option('-g, --geometry', 'Include GeoJSON geometry in output')
        .action(async (capakey, opts) => {
        const format = opts.format;
        if (!['table', 'json', 'geojson', 'wkt', 'kml'].includes(format)) {
            console.error(chalk.red('Error: --format must be "table", "json", "geojson", "wkt", or "kml"'));
            process.exit(1);
        }
        const includeGeometry = opts.geometry || format === 'geojson' || format === 'wkt' || format === 'kml';
        const spinner = ora('Looking up CaPaKey...').start();
        try {
            const result = await lookupCaPaKey(capakey, includeGeometry);
            spinner.stop();
            renderCaPaKeyLookup(result, format);
        }
        catch (err) {
            spinner.fail('Lookup failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    return capakey;
}
