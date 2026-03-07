import { Command } from 'commander';
import { readFileSync } from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import GeometryFactory from 'jsts/org/locationtech/jts/geom/GeometryFactory.js';
import Coordinate from 'jsts/org/locationtech/jts/geom/Coordinate.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js';
import DistanceOp from 'jsts/org/locationtech/jts/operation/distance/DistanceOp.js';
import { searchCaPaKey } from '../services/geopunt.js';
import { wgs84ToLambert72, lambert72ToWgs84, transformGeometry } from '../utils/geometry.js';
const factory = new GeometryFactory();
const reader = new GeoJSONReader(factory);
export function buildDistanceCommand() {
    return new Command('distance')
        .description('Calculate distance between two locations/geometries')
        .argument('<locationA>', 'Address, "x,y" coords, GeoJSON string, or @file.geojson')
        .argument('<locationB>', 'Address, "x,y" coords, GeoJSON string, or @file.geojson')
        .option('-f, --format <format>', 'Output format: text|json', 'text')
        .option('--crs <crs>', 'Coordinate system for input coords: 31370|4326', '31370')
        .action(async (locationA, locationB, opts) => {
        const crs = opts.crs;
        if (crs !== '31370' && crs !== '4326') {
            console.error(chalk.red('Error: --crs must be "31370" or "4326"'));
            process.exit(1);
        }
        if (!['text', 'json'].includes(opts.format)) {
            console.error(chalk.red('Error: --format must be "text" or "json"'));
            process.exit(1);
        }
        const spinner = ora('Resolving locations...').start();
        try {
            const [geomA, labelA] = await resolveGeometry(locationA, crs, spinner, 'A');
            const [geomB, labelB] = await resolveGeometry(locationB, crs, spinner, 'B');
            spinner.text = 'Calculating distance...';
            const op = new DistanceOp(geomA, geomB);
            const distance = op.distance();
            const nearestPts = op.nearestPoints();
            const ptA = { x: nearestPts[0].x, y: nearestPts[0].y };
            const ptB = { x: nearestPts[1].x, y: nearestPts[1].y };
            spinner.stop();
            if (opts.format === 'json') {
                const result = {
                    distance_m: Math.round(distance * 100) / 100,
                    nearestPoints: {
                        a: { lambert72: ptA, wgs84: toWgs84Obj(ptA) },
                        b: { lambert72: ptB, wgs84: toWgs84Obj(ptB) },
                    },
                };
                if (labelA)
                    result.locationA = labelA;
                if (labelB)
                    result.locationB = labelB;
                console.log(JSON.stringify(result, null, 2));
            }
            else {
                if (labelA)
                    console.log(chalk.gray(`A: ${labelA}`));
                if (labelB)
                    console.log(chalk.gray(`B: ${labelB}`));
                console.log();
                const formatted = distance >= 1000
                    ? `${(distance / 1000).toFixed(2)} km`
                    : `${distance.toFixed(2)} m`;
                console.log(`${chalk.bold('Distance:')} ${chalk.green(formatted)}`);
                const [lonA, latA] = lambert72ToWgs84(ptA.x, ptA.y);
                const [lonB, latB] = lambert72ToWgs84(ptB.x, ptB.y);
                console.log(chalk.gray(`Nearest point A: ${ptA.x.toFixed(2)}, ${ptA.y.toFixed(2)}  (${latA.toFixed(6)}, ${lonA.toFixed(6)})`));
                console.log(chalk.gray(`Nearest point B: ${ptB.x.toFixed(2)}, ${ptB.y.toFixed(2)}  (${latB.toFixed(6)}, ${lonB.toFixed(6)})`));
            }
        }
        catch (err) {
            spinner.fail('Distance calculation failed');
            console.error(chalk.red(err.message));
            process.exit(1);
        }
    });
}
function toWgs84Obj(pt) {
    const [lon, lat] = lambert72ToWgs84(pt.x, pt.y);
    return { lat: Math.round(lat * 1e6) / 1e6, lon: Math.round(lon * 1e6) / 1e6 };
}
async function resolveGeometry(location, crs, spinner, label) {
    // @file
    if (location.startsWith('@')) {
        const filePath = location.slice(1);
        let raw;
        try {
            raw = readFileSync(filePath, 'utf-8');
        }
        catch {
            throw new Error(`cannot read file "${filePath}"`);
        }
        return [parseGeoJsonGeometry(raw, crs), filePath];
    }
    // Inline JSON
    if (location.startsWith('{') || location.startsWith('[')) {
        return [parseGeoJsonGeometry(location, crs), null];
    }
    // Coordinates
    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(location)) {
        const [c1, c2] = location.split(',').map(s => parseFloat(s.trim()));
        let x, y;
        if (crs === '4326') {
            [x, y] = wgs84ToLambert72(c1, c2);
        }
        else {
            x = c1;
            y = c2;
        }
        return [factory.createPoint(new Coordinate(x, y)), `${x.toFixed(2)}, ${y.toFixed(2)}`];
    }
    // Address
    spinner.text = `Geocoding ${label}: ${location}...`;
    const results = await searchCaPaKey(location, 1, { includeCoordinates: true });
    if (results.length === 0 || !results[0].coordinates) {
        throw new Error(`address not found: "${location}"`);
    }
    const { x, y } = results[0].coordinates.lambert72;
    return [factory.createPoint(new Coordinate(x, y)), results[0].formattedAddress];
}
function parseGeoJsonGeometry(raw, crs) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw new Error('invalid JSON in GeoJSON input');
    }
    const obj = parsed;
    let geometry;
    if (obj.type === 'Feature') {
        geometry = parsed.geometry;
    }
    else if (obj.type === 'FeatureCollection') {
        const fc = parsed;
        if (!fc.features || fc.features.length === 0) {
            throw new Error('FeatureCollection has no features');
        }
        geometry = fc.features[0].geometry;
    }
    else if (obj.type && obj.coordinates) {
        geometry = parsed;
    }
    else {
        throw new Error('input must be a GeoJSON Feature, FeatureCollection, or Geometry');
    }
    if (crs === '4326') {
        geometry = transformGeometry(geometry, 'EPSG:31370');
    }
    return reader.read(geometry);
}
