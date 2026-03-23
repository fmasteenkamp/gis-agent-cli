export interface MapServerLayerConfig {
    keyword: string;
    service: string;
    label: string;
    url: string;
    idField: string;
    description: string;
}
export declare const MAPSERVER_LAYERS: MapServerLayerConfig[];
export declare function findMapServerLayer(keyword: string): MapServerLayerConfig | undefined;
export declare function searchMapServerLayers(query: string): MapServerLayerConfig[];
export declare function filterByService(service: string): MapServerLayerConfig[];
export declare function getServices(): string[];
