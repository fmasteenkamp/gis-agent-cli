export async function getLayerInfo(url) {
    const res = await fetch(`${url}?f=json`);
    if (!res.ok)
        throw new Error(`Failed to fetch layer info: ${res.status}`);
    const data = await res.json();
    if (data.error)
        throw new Error(`ArcGIS error: ${JSON.stringify(data.error)}`);
    return {
        name: data.name,
        geometryType: data.geometryType,
        fields: data.fields ?? [],
    };
}
export async function queryFeatures(url, opts) {
    const params = new URLSearchParams({
        where: opts.where,
        outFields: opts.outFields ?? '*',
        returnGeometry: String(opts.returnGeometry ?? true),
        f: 'geojson',
    });
    if (opts.outSR)
        params.set('outSR', opts.outSR);
    const res = await fetch(`${url}/query?${params}`);
    if (!res.ok)
        throw new Error(`Query failed: ${res.status}`);
    const data = await res.json();
    if (data.error)
        throw new Error(`ArcGIS error: ${JSON.stringify(data.error)}`);
    return data;
}
