import type { CaPaKeySearchResult, CaPaKeyLookupResult, ReverseResult, OutputFormat, CRS } from '../models/geopunt.js';
export declare function renderCaPaKeyResults(results: CaPaKeySearchResult[], format: OutputFormat, crs?: CRS): void;
export declare function renderCaPaKeyLookup(result: CaPaKeyLookupResult, format: OutputFormat): void;
export declare function renderReverseResults(results: ReverseResult[], format: OutputFormat, crs?: CRS): void;
export declare function renderSuggestions(suggestions: string[], format: 'table' | 'json'): void;
export declare function renderBatchResults(batch: {
    query: string;
    results: CaPaKeySearchResult[];
}[], format: OutputFormat, crs?: CRS): void;
