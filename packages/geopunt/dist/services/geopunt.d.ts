import type { CaPaKeySearchResult, CaPaKeyLookupResult, ReverseResult, CRS } from '../models/geopunt.js';
export declare function suggest(query: string, count: number): Promise<string[]>;
export declare function reverseGeocode(coord1: number, coord2: number, count: number, crs?: CRS): Promise<ReverseResult[]>;
export declare function lookupCaPaKey(capakey: string, includeGeometry?: boolean): Promise<CaPaKeyLookupResult>;
export declare function searchCaPaKey(address: string, maxResults: number, options?: {
    includeCoordinates?: boolean;
    includeGeometry?: boolean;
}): Promise<CaPaKeySearchResult[]>;
export declare function addressInfo(address: string): Promise<CaPaKeyLookupResult | null>;
