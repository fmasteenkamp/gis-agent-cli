export interface WfsLayerConfig {
    url: string;
    typeName: string;
    label: string;
    /** Property names to show as table columns (in order) */
    columns: {
        field: string;
        label: string;
    }[];
    /** If set, this layer accepts a --year option to select a variant */
    variants?: Record<string, {
        typeName: string;
        label: string;
    }>;
}
export declare const WFS_LAYERS: Record<string, WfsLayerConfig>;
export declare const VALID_LAYER_NAMES: string[];
