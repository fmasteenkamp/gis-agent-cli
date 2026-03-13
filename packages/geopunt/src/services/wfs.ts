import type { WfsLayerConfig } from '../models/wfs-layers.js';

export interface WfsFeatureCollection {
  type: 'FeatureCollection';
  features: WfsFeature[];
}

export interface WfsFeature {
  type: 'Feature';
  geometry: unknown;
  properties: Record<string, unknown>;
}

export async function queryWfs(
  config: WfsLayerConfig,
  x: number, y: number,
  radius: number,
  maxFeatures: number,
): Promise<WfsFeatureCollection> {
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

  if (!res.ok) throw new Error(`WFS query failed (${config.typeName}): ${res.status} ${res.statusText}`);
  return res.json() as Promise<WfsFeatureCollection>;
}
