import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { createBufferPolygon, toWkt, featureCollectionToKml, transformFeatureCollection } from '../utils/geometry.js';
export function buildBufferCommand() {
    return new Command('buffer')
        .description('Generate a buffer polygon around an address or coordinates')
        .argument('<location>', 'Address string or "x,y" Lambert72 coordinates')
        .argument('<radius>', 'Buffer radius in meters')
        .option('-f, --format <format>', 'Output format: geojson|wkt|kml', 'geojson')
        .option('--crs <crs>', 'Coordinate system: 31370 (Lambert72) or 4326 (WGS84)', '31370')
        .action(async (location, radiusStr, opts) => {
        const radius = parseFloat(radiusStr);
        if (isNaN(radius) || radius <= 0) {
            console.error(chalk.red('Error: radius must be a positive number (meters)'));
            process.exit(1);
        }
        const format = opts.format;
        if (!['geojson', 'wkt', 'kml'].includes(format)) {
            console.error(chalk.red('Error: --format must be "geojson", "wkt", or "kml"'));
            process.exit(1);
        }
        const crs = opts.crs;
        if (crs !== '31370' && crs !== '4326') {
            console.error(chalk.red('Error: --crs must be "31370" (Lambert72) or "4326" (WGS84)'));
            process.exit(1);
        }
        const isCoords = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(location);
        try {
            let x, y;
            if (isCoords) {
                const [c1, c2] = location.split(',').map(s => parseFloat(s.trim()));
                if (crs === '4326') {
                    const { wgs84ToLambert72 } = await import('../utils/geometry.js');
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
                const spinner = ora('Geocoding address...').start();
                const { default: geocodeAddress } = await import('../services/geopunt.js').then(m => ({ default: m.searchCaPaKey }));
                const results = await geocodeAddress(location, 1, { includeCoordinates: true });
                spinner.stop();
                if (results.length === 0 || !results[0].coordinates) {
                    console.error(chalk.red('Address not found'));
                    process.exit(1);
                }
                x = results[0].coordinates.lambert72.x;
                y = results[0].coordinates.lambert72.y;
                console.error(chalk.gray(`Center: ${results[0].formattedAddress} (${x.toFixed(2)}, ${y.toFixed(2)})`));
            }
            const bufferGeom = createBufferPolygon(x, y, radius);
            switch (format) {
                case 'wkt':
                    console.log(toWkt(bufferGeom));
                    break;
                case 'kml': {
                    let fc = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: bufferGeom, properties: { radius, center_x: x, center_y: y } }] };
                    fc = transformFeatureCollection(fc, 'EPSG:4326');
                    console.log(featureCollectionToKml(fc, `Buffer ${radius}m`));
                    break;
                }
                case 'geojson':
                default: {
                    let fc = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: bufferGeom, properties: { radius, center_x: x, center_y: y } }] };
                    if (crs === '4326') {
                        fc = transformFeatureCollection(fc, 'EPSG:4326');
                    }
                    console.log(JSON.stringify(fc, null, 2));
                    break;
                }
            }
        }
        catch (err) {
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
}
