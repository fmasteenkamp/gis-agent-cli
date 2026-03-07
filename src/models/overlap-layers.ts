import layerData from '../data/overlap-layers.json' with { type: 'json' };

export interface OverlapLayerConfig {
  path: string;
  keyword: string;
  label: string;
  description: string;
}

export const OVERLAP_LAYERS: OverlapLayerConfig[] = layerData;

export const VALID_OVERLAP_KEYWORDS = OVERLAP_LAYERS.map(l => l.keyword);

export function findOverlapLayer(keyword: string): OverlapLayerConfig | undefined {
  return OVERLAP_LAYERS.find(l => l.keyword === keyword);
}

export function searchOverlapLayers(query: string): OverlapLayerConfig[] {
  const q = query.toLowerCase();
  return OVERLAP_LAYERS.filter(l =>
    l.keyword.toLowerCase().includes(q) ||
    l.label.toLowerCase().includes(q) ||
    l.description.toLowerCase().includes(q)
  );
}
