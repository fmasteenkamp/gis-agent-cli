const HALTES_WFS = 'https://geo.api.vlaanderen.be/Haltes/wfs';
export async function queryHaltes(x, y, radius, maxFeatures) {
    const cql = `DWITHIN(SHAPE,POINT(${x} ${y}),${radius},meters)`;
    const params = new URLSearchParams({
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeName: 'Haltes:Halte',
        outputFormat: 'application/json',
        srsName: 'EPSG:31370',
        CQL_FILTER: cql,
        count: String(maxFeatures),
    });
    const res = await fetch(`${HALTES_WFS}?${params}`, {
        headers: { Accept: 'application/json' },
    });
    if (!res.ok)
        throw new Error(`Haltes WFS query failed: ${res.status} ${res.statusText}`);
    return res.json();
}
