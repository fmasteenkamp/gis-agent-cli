import type { OverlapLayerConfig } from '../models/overlap-layers.js';
export interface OverlapResult {
    layerName?: string;
    intersecting?: unknown[];
    [key: string]: unknown;
}
export declare function queryOverlap(config: OverlapLayerConfig, feature: {
    type: 'Feature';
    geometry: unknown;
    properties: Record<string, unknown>;
}): Promise<OverlapResult>;
