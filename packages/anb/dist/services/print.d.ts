export interface Extent {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: {
        wkid: number;
    };
}
export interface FeatureCollectionLayer {
    id?: string;
    title?: string;
    opacity?: number;
    featureCollection: {
        layers: Array<{
            layerDefinition: {
                geometryType: string;
                drawingInfo: {
                    renderer: unknown;
                };
            };
            featureSet: {
                geometryType: string;
                features: Array<{
                    geometry: unknown;
                    attributes?: Record<string, unknown>;
                }>;
            };
        }>;
    };
}
export interface MapServiceLayer {
    url: string;
    type?: string;
    opacity?: number;
    visibleLayers?: (number | string)[];
}
export interface WmsLayer {
    type: 'WMS';
    url: string;
    version?: string;
    format?: string;
    layers?: Array<{
        name: string;
    }>;
    opacity?: number;
    visibleLayers?: string[];
}
type OperationalLayer = FeatureCollectionLayer | MapServiceLayer | WmsLayer;
export interface PrintOptions {
    extent: Extent;
    includeOrthoPhoto?: boolean;
    additionalLayers?: OperationalLayer[];
    dpi?: number;
    outputWidth?: number;
    outputHeight?: number;
    format?: 'JPG' | 'PNG';
}
export interface PrintResult {
    url: string;
}
export declare function exportWebMap(opts: PrintOptions): Promise<PrintResult>;
export declare function getParcelExtent(capakey: string, buffer: number): Promise<Extent>;
export declare function geojsonToFeatureCollectionLayer(geometry: unknown, options?: {
    id?: string;
    title?: string;
    opacity?: number;
    fillColor?: number[];
    outlineColor?: number[];
    outlineWidth?: number;
}): FeatureCollectionLayer;
export {};
