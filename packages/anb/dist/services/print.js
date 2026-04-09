const PRINT_URL = 'https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute';
const CAPAKEY_BASE = 'https://geo.api.vlaanderen.be/capakey/v2';
// --- Web Map JSON builder ---
function buildWebMapJson(opts) {
    const operationalLayers = [];
    // 1. Grey base layer (always)
    operationalLayers.push({
        type: 'WMS',
        url: 'https://geo.api.vlaanderen.be/GRB-basiskaart-grijs/wms',
        version: '1.0.0',
        format: 'JPG',
        opacity: 1,
        visibleLayers: [],
    });
    // 2. Orthophoto (optional)
    if (opts.includeOrthoPhoto) {
        operationalLayers.push({
            type: 'WMS',
            url: 'https://geo.api.vlaanderen.be/OMWRGBMRVL/wms',
            version: '1.0.0',
            format: 'JPG',
            layers: [{ name: 'ORTHO' }],
            opacity: 0.55,
            visibleLayers: [],
        });
    }
    // 3. Additional layers
    if (opts.additionalLayers) {
        operationalLayers.push(...opts.additionalLayers);
    }
    return {
        mapOptions: {
            extent: opts.extent,
            spatialReference: opts.extent.spatialReference,
        },
        operationalLayers,
        exportOptions: {
            dpi: opts.dpi ?? 96,
            outputSize: [opts.outputWidth ?? 1200, opts.outputHeight ?? 800],
        },
    };
}
// --- API call ---
export async function exportWebMap(opts) {
    const webMapJson = buildWebMapJson(opts);
    const format = opts.format ?? 'JPG';
    const body = new URLSearchParams({
        Web_Map_as_JSON: JSON.stringify(webMapJson),
        Format: format,
        f: 'json',
    });
    const res = await fetch(PRINT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });
    if (!res.ok) {
        throw new Error(`Print service returned ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (data.error) {
        const err = data.error;
        const details = err.details?.join('; ') ?? '';
        throw new Error(`Print service error: ${err.message ?? 'unknown'}${details ? ` (${details})` : ''}`);
    }
    const results = data.results;
    const url = results?.[0]?.value?.url;
    if (!url) {
        throw new Error('Print service returned no output URL');
    }
    return { url };
}
export async function getParcelExtent(capakey, buffer) {
    const encoded = encodeURIComponent(capakey);
    const url = `${CAPAKEY_BASE}/parcel/${encoded}?srs=31370&data=adp&status=actual&geometry=full`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok)
        throw new Error(`CaPaKey lookup failed: ${res.status} ${res.statusText}`);
    const parcel = await res.json();
    if (!parcel.geometry?.shape) {
        throw new Error(`No geometry found for CaPaKey "${capakey}"`);
    }
    const shape = JSON.parse(parcel.geometry.shape);
    const coords = extractAllCoords(shape.coordinates);
    if (coords.length === 0) {
        throw new Error(`Empty geometry for CaPaKey "${capakey}"`);
    }
    let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
    for (const [x, y] of coords) {
        if (x < xmin)
            xmin = x;
        if (y < ymin)
            ymin = y;
        if (x > xmax)
            xmax = x;
        if (y > ymax)
            ymax = y;
    }
    return {
        xmin: xmin - buffer,
        ymin: ymin - buffer,
        xmax: xmax + buffer,
        ymax: ymax + buffer,
        spatialReference: { wkid: 31370 },
    };
}
function extractAllCoords(coords) {
    const result = [];
    function walk(c) {
        if (!Array.isArray(c))
            return;
        if (c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number') {
            result.push([c[0], c[1]]);
            return;
        }
        for (const item of c)
            walk(item);
    }
    walk(coords);
    return result;
}
// --- GeoJSON to feature collection layer ---
export function geojsonToFeatureCollectionLayer(geometry, options) {
    const g = geometry;
    const opts = options ?? {};
    let esriGeomType;
    switch (g.type) {
        case 'Polygon':
        case 'MultiPolygon':
            esriGeomType = 'esriGeometryPolygon';
            break;
        case 'Point':
            esriGeomType = 'esriGeometryPoint';
            break;
        case 'LineString':
        case 'MultiLineString':
            esriGeomType = 'esriGeometryPolyline';
            break;
        default:
            esriGeomType = 'esriGeometryPolygon';
    }
    // Convert GeoJSON geometry to Esri JSON
    const esriGeometry = geojsonGeomToEsri(g);
    return {
        id: opts.id ?? 'highlight',
        title: opts.title ?? 'Highlight',
        opacity: opts.opacity ?? 0.95,
        featureCollection: {
            layers: [{
                    layerDefinition: {
                        geometryType: esriGeomType,
                        drawingInfo: {
                            renderer: {
                                type: 'simple',
                                symbol: esriGeomType === 'esriGeometryPolygon'
                                    ? {
                                        type: 'esriSFS',
                                        style: 'esriSFSSolid',
                                        color: opts.fillColor ?? [255, 255, 0, 100],
                                        outline: {
                                            type: 'esriSLS',
                                            style: 'esriSLSSolid',
                                            color: opts.outlineColor ?? [255, 0, 0, 255],
                                            width: opts.outlineWidth ?? 2,
                                        },
                                    }
                                    : esriGeomType === 'esriGeometryPolyline'
                                        ? {
                                            type: 'esriSLS',
                                            style: 'esriSLSSolid',
                                            color: opts.outlineColor ?? [255, 0, 0, 255],
                                            width: opts.outlineWidth ?? 2,
                                        }
                                        : {
                                            type: 'esriSMS',
                                            style: 'esriSMSCircle',
                                            color: opts.fillColor ?? [255, 0, 0, 255],
                                            size: 10,
                                            outline: {
                                                type: 'esriSLS',
                                                style: 'esriSLSSolid',
                                                color: opts.outlineColor ?? [255, 255, 255, 255],
                                                width: 1,
                                            },
                                        },
                            },
                        },
                    },
                    featureSet: {
                        geometryType: esriGeomType,
                        features: [{ geometry: esriGeometry }],
                    },
                }],
        },
    };
}
function geojsonGeomToEsri(geom) {
    const sr = { wkid: 31370 };
    switch (geom.type) {
        case 'Polygon':
            return { rings: geom.coordinates, spatialReference: sr };
        case 'MultiPolygon': {
            const rings = geom.coordinates.flat();
            return { rings, spatialReference: sr };
        }
        case 'Point': {
            const [x, y] = geom.coordinates;
            return { x, y, spatialReference: sr };
        }
        case 'LineString':
            return { paths: [geom.coordinates], spatialReference: sr };
        case 'MultiLineString':
            return { paths: geom.coordinates, spatialReference: sr };
        default:
            return { rings: geom.coordinates, spatialReference: sr };
    }
}
