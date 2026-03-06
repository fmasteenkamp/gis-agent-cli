import type { CaPaKeySearchResult, CaPaKeyLookupResult } from '../models/geopunt.js';
export declare function lookupCaPaKey(capakey: string, includeGeometry?: boolean): Promise<CaPaKeyLookupResult>;
export declare function searchCaPaKey(address: string, maxResults: number): Promise<CaPaKeySearchResult[]>;
