type Coord = [number, number];
export declare function lambert72ToWgs84(x: number, y: number): Coord;
export declare function wgs84ToLambert72(lon: number, lat: number): Coord;
export declare function transformCoords(coords: number[], fromCrs: string, toCrs: string): number[];
/**
 * Transform a GeoJSON geometry from Lambert72 to WGS84 (or vice versa).
 */
export declare function transformGeometry(geojson: unknown, toCrs: 'EPSG:4326' | 'EPSG:31370'): unknown;
/**
 * Transform all geometries in a GeoJSON FeatureCollection.
 */
export declare function transformFeatureCollection(fc: unknown, toCrs: 'EPSG:4326' | 'EPSG:31370'): unknown;
export declare function createBufferPolygon(x: number, y: number, radiusMeters: number): {
    type: string;
    coordinates: number[][][];
};
export declare function toWkt(geojson: unknown): string;
export declare function toGeoJsonFeature(geometry: unknown, properties: Record<string, unknown>): unknown;
export declare function featureCollectionToKml(fc: unknown, docName?: string): string;
export declare function toGoogleMapsUrl(lat: number, lon: number): string;
export {};
