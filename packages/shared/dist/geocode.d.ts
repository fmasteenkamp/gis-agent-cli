/** Resolve a Flemish address to Lambert72 coordinates (x, y). Returns null if not found. */
export declare function geocodeAddress(address: string): Promise<{
    x: number;
    y: number;
} | null>;
