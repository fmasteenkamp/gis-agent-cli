export interface OverlapLayerConfig {
    path: string;
    keyword: string;
    label: string;
    description: string;
}
export declare const OVERLAP_LAYERS: OverlapLayerConfig[];
export declare const VALID_OVERLAP_KEYWORDS: string[];
export declare function findOverlapLayer(keyword: string): OverlapLayerConfig | undefined;
export declare function searchOverlapLayers(query: string): OverlapLayerConfig[];
