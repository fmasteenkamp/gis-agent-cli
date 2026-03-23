interface FieldInfo {
  name: string;
  type: string;
  alias: string;
}

interface LayerInfo {
  name: string;
  geometryType: string;
  fields: FieldInfo[];
}

export async function getLayerInfo(url: string): Promise<LayerInfo> {
  const res = await fetch(`${url}?f=json`);
  if (!res.ok) throw new Error(`Failed to fetch layer info: ${res.status}`);
  const data = await res.json() as Record<string, unknown>;
  if (data.error) throw new Error(`ArcGIS error: ${JSON.stringify(data.error)}`);
  return {
    name: data.name as string,
    geometryType: data.geometryType as string,
    fields: (data.fields as FieldInfo[]) ?? [],
  };
}

export interface QueryOptions {
  where: string;
  outFields?: string;
  returnGeometry?: boolean;
  outSR?: string;
}

export async function queryFeatures(url: string, opts: QueryOptions): Promise<unknown> {
  const params = new URLSearchParams({
    where: opts.where,
    outFields: opts.outFields ?? '*',
    returnGeometry: String(opts.returnGeometry ?? true),
    f: 'geojson',
  });
  if (opts.outSR) params.set('outSR', opts.outSR);

  const res = await fetch(`${url}/query?${params}`);
  if (!res.ok) throw new Error(`Query failed: ${res.status}`);
  const data = await res.json() as Record<string, unknown>;
  if (data.error) throw new Error(`ArcGIS error: ${JSON.stringify(data.error)}`);
  return data;
}
