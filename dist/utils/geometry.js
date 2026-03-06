export function toWkt(geojson) {
    const g = geojson;
    if (!g?.type || !g?.coordinates)
        throw new Error('Invalid GeoJSON geometry');
    switch (g.type) {
        case 'Point': {
            const [x, y] = g.coordinates;
            return `POINT (${x} ${y})`;
        }
        case 'Polygon': {
            const rings = g.coordinates.map(ring => `(${ring.map(([x, y]) => `${x} ${y}`).join(', ')})`);
            return `POLYGON (${rings.join(', ')})`;
        }
        case 'MultiPolygon': {
            const polys = g.coordinates.map(poly => {
                const rings = poly.map(ring => `(${ring.map(([x, y]) => `${x} ${y}`).join(', ')})`);
                return `(${rings.join(', ')})`;
            });
            return `MULTIPOLYGON (${polys.join(', ')})`;
        }
        default:
            throw new Error(`Unsupported geometry type: ${g.type}`);
    }
}
export function toGeoJsonFeature(geometry, properties) {
    return {
        type: 'Feature',
        geometry,
        properties,
    };
}
