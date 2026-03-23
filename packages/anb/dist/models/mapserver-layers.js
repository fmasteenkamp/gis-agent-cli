import layerData from '../data/mapserver-layers.json' with { type: 'json' };
export const MAPSERVER_LAYERS = layerData;
export function findMapServerLayer(keyword) {
    return MAPSERVER_LAYERS.find(l => l.keyword === keyword.toLowerCase());
}
export function searchMapServerLayers(query) {
    const q = query.toLowerCase();
    return MAPSERVER_LAYERS.filter(l => l.keyword.includes(q) || l.label.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) || l.service.includes(q));
}
export function filterByService(service) {
    const s = service.toLowerCase();
    return MAPSERVER_LAYERS.filter(l => l.service.includes(s));
}
export function getServices() {
    return [...new Set(MAPSERVER_LAYERS.map(l => l.service))];
}
