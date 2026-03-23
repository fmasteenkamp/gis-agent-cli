import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getLayerInfo, queryFeatures } from '../services/mapserver.js';
import { MAPSERVER_LAYERS, findMapServerLayer, searchMapServerLayers, filterByService } from '../models/mapserver-layers.js';
function resolveUrl(layerOrUrl) {
    if (layerOrUrl.startsWith('http'))
        return layerOrUrl;
    const config = findMapServerLayer(layerOrUrl);
    if (!config) {
        const suggestions = searchMapServerLayers(layerOrUrl);
        if (suggestions.length > 0) {
            console.error(chalk.red(`Unknown layer "${layerOrUrl}". Did you mean:`));
            for (const s of suggestions.slice(0, 5)) {
                console.error(chalk.yellow(`  ${s.keyword.padEnd(20)} ${s.description}`));
            }
        }
        else {
            console.error(chalk.red(`Unknown layer "${layerOrUrl}". Use --list to see available layers.`));
        }
        process.exit(1);
    }
    return config.url;
}
export function buildMapServerCommand() {
    const cmd = new Command('mapserver')
        .alias('ms')
        .description('Query ArcGIS MapServer layers')
        .option('--list', 'List all known MapServer layers')
        .option('--search <query>', 'Search layers by keyword/description')
        .option('--service <service>', 'Filter layers by service (e.g. natuurbeheerplannen, utilities)')
        .action((opts) => {
        if (opts.list || opts.service) {
            let layers = opts.service ? filterByService(opts.service) : MAPSERVER_LAYERS;
            if (opts.search) {
                const q = opts.search.toLowerCase();
                layers = layers.filter(l => l.keyword.includes(q) || l.label.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
            }
            if (layers.length === 0) {
                console.log(chalk.yellow('No matching layers.'));
                return;
            }
            printLayerList(layers);
            return;
        }
        if (opts.search) {
            const results = searchMapServerLayers(opts.search);
            if (results.length === 0) {
                console.log(chalk.yellow(`No layers matching "${opts.search}"`));
                return;
            }
            printLayerList(results);
            return;
        }
        cmd.help();
    });
    // --- fields ---
    cmd
        .command('fields <layerOrUrl>')
        .description('Show fields for a MapServer layer (keyword or full URL)')
        .action(async (layerOrUrl) => {
        const url = resolveUrl(layerOrUrl);
        const spinner = ora('Fetching layer info...').start();
        try {
            const info = await getLayerInfo(url);
            spinner.stop();
            console.log(`${chalk.bold('Layer:')} ${info.name}`);
            console.log(`${chalk.bold('Geometry:')} ${info.geometryType}\n`);
            const table = new Table({
                head: [chalk.bold('Field'), chalk.bold('Type'), chalk.bold('Alias')],
                style: { head: ['cyan'] },
            });
            for (const f of info.fields) {
                table.push([f.name, chalk.gray(f.type.replace('esriFieldType', '')), f.alias]);
            }
            console.log(table.toString());
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- query ---
    cmd
        .command('query <layerOrUrl>')
        .description('Query features from a MapServer layer with a SQL filter')
        .requiredOption('--where <sql>', 'ArcGIS SQL where clause')
        .option('--fields <fields>', 'Comma-separated field names (default: all)', '*')
        .option('--no-geometry', 'Omit geometry from results')
        .option('--crs <crs>', 'Output CRS: 31370 or 4326', '31370')
        .option('-f, --format <format>', 'Output format: geojson|json', 'geojson')
        .action(async (layerOrUrl, opts) => {
        const url = resolveUrl(layerOrUrl);
        const spinner = ora('Querying features...').start();
        try {
            const data = await queryFeatures(url, {
                where: opts.where,
                outFields: opts.fields,
                returnGeometry: opts.geometry,
                outSR: opts.crs,
            });
            spinner.stop();
            if (opts.format === 'json') {
                console.log(JSON.stringify(data, null, 2));
            }
            else {
                // geojson — already in GeoJSON format from the API
                const fc = data;
                console.log(JSON.stringify(data, null, 2));
                if (fc.features) {
                    console.error(chalk.gray(`\n${fc.features.length} feature(s) returned`));
                }
            }
        }
        catch (err) {
            spinner.fail('Query failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // --- plan ---
    cmd
        .command('plan <beheerplanId>')
        .description('Get GeoJSON for a natuurbeheerplan by BeheerplanId (shortcut for globaalkader query)')
        .option('--crs <crs>', 'Output CRS: 31370 or 4326', '31370')
        .option('-f, --format <format>', 'Output format: geojson|json', 'geojson')
        .action(async (beheerplanId, opts) => {
        const config = findMapServerLayer('globaalkader');
        if (!config) {
            console.error(chalk.red('globaalkader layer not found in registry'));
            process.exit(1);
        }
        const spinner = ora(`Fetching plan ${beheerplanId}...`).start();
        try {
            const data = await queryFeatures(config.url, {
                where: `${config.idField}='${beheerplanId.replace(/'/g, "''")}'`,
                outFields: '*',
                returnGeometry: true,
                outSR: opts.crs,
            });
            spinner.stop();
            const fc = data;
            if (!fc.features || fc.features.length === 0) {
                console.log(chalk.yellow(`No plan found for BeheerplanId "${beheerplanId}"`));
                return;
            }
            console.log(JSON.stringify(data, null, 2));
            console.error(chalk.gray(`\n${fc.features.length} feature(s) returned`));
        }
        catch (err) {
            spinner.fail('Failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    return cmd;
}
function printLayerList(layers = MAPSERVER_LAYERS) {
    const table = new Table({
        head: [chalk.bold('Keyword'), chalk.bold('Service'), chalk.bold('Label'), chalk.bold('ID Field'), chalk.bold('Description')],
        style: { head: ['cyan'] },
    });
    for (const l of layers) {
        table.push([chalk.cyan(l.keyword), chalk.gray(l.service), l.label, chalk.gray(l.idField || '—'), l.description]);
    }
    console.log(table.toString());
}
