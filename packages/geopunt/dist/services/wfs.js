export async function queryWfs(config, x, y, radius, maxFeatures) {
    const cql = `DWITHIN(SHAPE,POINT(${x} ${y}),${radius},meters)`;
    const params = new URLSearchParams({
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeName: config.typeName,
        outputFormat: 'application/json',
        srsName: 'EPSG:31370',
        CQL_FILTER: cql,
        count: String(maxFeatures),
    });
    const res = await fetch(`${config.url}?${params}`, {
        headers: { Accept: 'application/json' },
    });
    if (!res.ok)
        throw new Error(`WFS query failed (${config.typeName}): ${res.status} ${res.statusText}`);
    return res.json();
}
