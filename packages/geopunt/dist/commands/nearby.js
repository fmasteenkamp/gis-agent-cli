import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { searchCaPaKey } from '../services/geopunt.js';
import { queryWfs } from '../services/wfs.js';
import { wgs84ToLambert72, lambert72ToWgs84, featureCollectionToKml, transformFeatureCollection, toGoogleMapsUrl } from '@gis/shared';
import { WFS_LAYERS, VALID_LAYER_NAMES } from '../models/wfs-layers.js';
import Table from 'cli-table3';
const VALID_FORMATS = ['table', 'json', 'geojson', 'kml', 'url'];
export function buildNearbyCommand() {
    const nearby = new Command('nearby')
        .description('Find features near an address or coordinates')
        .argument('<layer>', `Layer: ${VALID_LAYER_NAMES.join(', ')}`)
        .argument('<location>', 'Address string or "x,y" Lambert72 coordinates')
        .argument('[radius]', 'Search radius in meters', '500')
        .option('-f, --format <format>', 'Output format: table|json|geojson|kml|url', 'table')
        .option('-n, --max <number>', 'Max features to return', '50')
        .option('--crs <crs>', 'Coordinate system: 31370 (Lambert72) or 4326 (WGS84)', '31370')
        .option('--year <year>', 'Year variant (for layers with historical data)')
        .option('--list', 'List available layers')
        .action(async (layer, location, radiusStr, opts) => {
        const format = opts.format;
        if (!VALID_FORMATS.includes(format)) {
            console.error(chalk.red(`Error: --format must be one of: ${VALID_FORMATS.join(', ')}`));
            process.exit(1);
        }
        const crs = opts.crs;
        if (crs !== '31370' && crs !== '4326') {
            console.error(chalk.red('Error: --crs must be "31370" or "4326"'));
            process.exit(1);
        }
        const baseConfig = WFS_LAYERS[layer];
        if (!baseConfig) {
            console.error(chalk.red(`Unknown layer "${layer}". Available: ${VALID_LAYER_NAMES.join(', ')}`));
            process.exit(1);
        }
        // Resolve variant (e.g. --year 1778)
        let config = { ...baseConfig };
        if (opts.year) {
            if (!baseConfig.variants) {
                console.error(chalk.red(`Layer "${layer}" does not support --year. Remove the option.`));
                process.exit(1);
            }
            const variant = baseConfig.variants[opts.year];
            if (!variant) {
                const valid = Object.keys(baseConfig.variants).join(', ');
                console.error(chalk.red(`Unknown year "${opts.year}" for layer "${layer}". Valid: ${valid}`));
                process.exit(1);
            }
            config = { ...config, typeName: variant.typeName, label: variant.label };
        }
        else if (baseConfig.variants) {
            // Default to first variant and inform
            const defaultYear = Object.keys(baseConfig.variants)[0];
            const variant = baseConfig.variants[defaultYear];
            config = { ...config, typeName: variant.typeName, label: variant.label };
        }
        const radius = parseFloat(radiusStr);
        if (isNaN(radius) || radius <= 0) {
            console.error(chalk.red('Error: radius must be a positive number (meters)'));
            process.exit(1);
        }
        const maxFeatures = parseInt(opts.max, 10);
        if (isNaN(maxFeatures) || maxFeatures < 1) {
            console.error(chalk.red('Error: --max must be a positive number'));
            process.exit(1);
        }
        const isCoords = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(location);
        const spinner = ora(`Searching ${config.label}...`).start();
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
                spinner.text = `Found: ${results[0].formattedAddress} — searching ${config.label}...`;
            }
            const fc = await queryWfs(config, x, y, radius, maxFeatures);
            spinner.stop();
            if (fc.features.length === 0) {
                console.log(chalk.yellow(`No features found within ${radius}m.`));
                return;
            }
            console.log(chalk.gray(`${config.label}: ${fc.features.length} feature(s) within ${radius}m\n`));
            // Render
            if (format === 'geojson' || format === 'kml') {
                let out = fc;
                if (format === 'kml' || crs === '4326') {
                    out = transformFeatureCollection(fc, 'EPSG:4326');
                }
                if (format === 'kml') {
                    console.log(featureCollectionToKml(out, config.label));
                }
                else {
                    console.log(JSON.stringify(out, null, 2));
                }
                return;
            }
            if (format === 'url') {
                for (const f of fc.features) {
                    const geom = f.geometry;
                    if (geom?.type === 'Point' && geom.coordinates) {
                        const [gx, gy] = geom.coordinates;
                        const [lon, lat] = lambert72ToWgs84(gx, gy);
                        const name = config.columns.map(c => f.properties[c.field] ?? '').join('\t');
                        console.log(`${name}\t${toGoogleMapsUrl(lat, lon)}`);
                    }
                }
                return;
            }
            if (format === 'json') {
                console.log(JSON.stringify(fc.features.map(f => {
                    const props = {};
                    for (const col of config.columns) {
                        props[col.label] = f.properties[col.field];
                    }
                    return props;
                }), null, 2));
                return;
            }
            // table
            const head = config.columns.map(c => chalk.bold(c.label));
            const geom0 = fc.features[0]?.geometry;
            if (geom0?.type === 'Point') {
                head.push(chalk.bold(crs === '4326' ? 'Lat' : 'X'), chalk.bold(crs === '4326' ? 'Lon' : 'Y'));
            }
            const table = new Table({ head, style: { head: ['cyan'] } });
            for (const f of fc.features) {
                const row = config.columns.map(c => {
                    const v = f.properties[c.field];
                    return v != null ? String(v) : '';
                });
                const geom = f.geometry;
                if (geom?.type === 'Point' && geom.coordinates) {
                    const [gx, gy] = geom.coordinates;
                    if (crs === '4326') {
                        const [lon, lat] = lambert72ToWgs84(gx, gy);
                        row.push(lat.toFixed(6), lon.toFixed(6));
                    }
                    else {
                        row.push(gx.toFixed(2), gy.toFixed(2));
                    }
                }
                table.push(row);
            }
            console.log(table.toString());
        }
        catch (err) {
            spinner.fail('Query failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
    // Add --list as a standalone action via a hook
    nearby.hook('preAction', (cmd) => {
        if (cmd.opts().list) {
            console.log(chalk.bold('Available layers:\n'));
            for (const [name, cfg] of Object.entries(WFS_LAYERS)) {
                console.log(`  ${chalk.cyan(name.padEnd(14))} ${cfg.label}`);
                if (cfg.variants) {
                    for (const [year, v] of Object.entries(cfg.variants)) {
                        console.log(`    ${chalk.gray(`--year ${year}`).padEnd(25)} ${v.label}`);
                    }
                }
            }
            process.exit(0);
        }
    });
    return nearby;
}
