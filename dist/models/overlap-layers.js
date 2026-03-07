import layerData from '../data/overlap-layers.json' with { type: 'json' };
export const OVERLAP_LAYERS = layerData;
export const VALID_OVERLAP_KEYWORDS = OVERLAP_LAYERS.map(l => l.keyword);
export function findOverlapLayer(keyword) {
    return OVERLAP_LAYERS.find(l => l.keyword === keyword);
}
export function searchOverlapLayers(query) {
    const q = query.toLowerCase();
    return OVERLAP_LAYERS.filter(l => l.keyword.toLowerCase().includes(q) ||
        l.label.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q));
}
