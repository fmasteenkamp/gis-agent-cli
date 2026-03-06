export interface LocationResponse {
    LocationResult: LocationResult[];
}
export interface LocationResult {
    FormattedAddress: string;
    Location: {
        Lat_WGS84: number;
        Lon_WGS84: number;
        X_Lambert72: number;
        Y_Lambert72: number;
    };
    LocationType: string;
}
export interface ParcelResponse {
    capakey: string;
    municipalityCode: string;
    municipalityName: string;
    departmentCode: string;
    departmentName: string;
    sectionCode: string;
    perceelnummer: string;
    grondnummer: string;
    adres: string[];
    geometry?: {
        boundingBox: string;
        center: string;
        shape: string;
    };
}
export interface CaPaKeySearchResult {
    formattedAddress: string;
    locationType: string;
    capaKey: string;
    municipality: string;
    section: string;
    perceelnummer: string;
}
export interface CaPaKeyLookupResult {
    capaKey: string;
    municipality: string;
    department: string;
    section: string;
    perceelnummer: string;
    grondnummer: string;
    addresses: string[];
    geometry?: unknown;
}
export type OutputFormat = 'table' | 'json' | 'geojson' | 'wkt';
