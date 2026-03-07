import layerData from '../data/wfs-layers.json' with { type: 'json' };
export const WFS_LAYERS = layerData;
export const VALID_LAYER_NAMES = Object.keys(WFS_LAYERS);
