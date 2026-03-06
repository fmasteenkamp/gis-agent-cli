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
export declare function queryWfs(config: WfsLayerConfig, x: number, y: number, radius: number, maxFeatures: number): Promise<WfsFeatureCollection>;
