import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { searchCaPaKey } from '../../services/geopunt.js';
import { renderCaPaKeyResults } from '../../utils/output.js';
export function buildAddressCommand() {
    const address = new Command('address').description('Address and parcel lookup commands');
    address
        .command('search <address>')
        .description('Search CaPaKey by address')
        .option('-r, --results <number>', 'Number of results to return [1-5]', '1')
        .option('-f, --format <format>', 'Output format: table|json', 'table')
        .action(async (address, opts) => {
        const maxResults = parseInt(opts.results, 10);
        if (isNaN(maxResults) || maxResults < 1 || maxResults > 5) {
            console.error(chalk.red('Error: --results must be a number between 1 and 5'));
            process.exit(1);
        }
        const format = opts.format;
        if (!['table', 'json'].includes(format)) {
            console.error(chalk.red('Error: --format must be "table" or "json"'));
            process.exit(1);
        }
        const spinner = ora('Querying Geopunt...').start();
        try {
            const results = await searchCaPaKey(address, maxResults);
            spinner.stop();
            if (results.length === 0) {
                console.log(chalk.yellow('No parcels found for the given address.'));
                return;
            }
            renderCaPaKeyResults(results, format);
        }
        catch (err) {
            spinner.fail('Request failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    return address;
}
