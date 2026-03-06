export interface HalteFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
    properties: {
        UIDN: number;
        OIDN: number;
        STOPID: number;
        NAAMHALTE: string;
        TYPEHALTE: number;
        LBLTYPEHAL: string;
        CODEGEM: string;
        NAAMGEM: string;
    };
}
export interface HalteFeatureCollection {
    type: 'FeatureCollection';
    features: HalteFeature[];
}
export declare function queryHaltes(x: number, y: number, radius: number, maxFeatures: number): Promise<HalteFeatureCollection>;
