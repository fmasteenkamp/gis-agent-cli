interface FieldInfo {
    name: string;
    type: string;
    alias: string;
}
interface LayerInfo {
    name: string;
    geometryType: string;
    fields: FieldInfo[];
}
export declare function getLayerInfo(url: string): Promise<LayerInfo>;
export interface QueryOptions {
    where: string;
    outFields?: string;
    returnGeometry?: boolean;
    outSR?: string;
}
export declare function queryFeatures(url: string, opts: QueryOptions): Promise<unknown>;
export {};
