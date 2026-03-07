import layerData from '../data/wfs-layers.json' with { type: 'json' };

export interface WfsLayerConfig {
  url: string;
  typeName: string;
  label: string;
  /** Property names to show as table columns (in order) */
  columns: { field: string; label: string }[];
  /** If set, this layer accepts a --year option to select a variant */
  variants?: Record<string, { typeName: string; label: string }>;
}

export const WFS_LAYERS: Record<string, WfsLayerConfig> = layerData;

export const VALID_LAYER_NAMES = Object.keys(WFS_LAYERS);
