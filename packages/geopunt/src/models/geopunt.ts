// --- Geopunt Location API ---

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

export interface SuggestionResponse {
  SuggestionResult: string[];
}

// --- CaPaKey Parcel API ---

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

// --- Unified output ---

export interface Coordinates {
  lambert72: { x: number; y: number };
  wgs84: { lat: number; lon: number };
}

export interface CaPaKeySearchResult {
  formattedAddress: string;
  locationType: string;
  capaKey: string;
  municipality: string;
  section: string;
  perceelnummer: string;
  coordinates?: Coordinates;
  geometry?: unknown;
}

export interface CaPaKeyLookupResult {
  capaKey: string;
  municipality: string;
  department: string;
  section: string;
  perceelnummer: string;
  grondnummer: string;
  addresses: string[];
  centroid?: { x: number; y: number };
  geometry?: unknown;
}

export interface ReverseResult {
  formattedAddress: string;
  locationType: string;
  coordinates: Coordinates;
  capaKey?: string;
  municipality?: string;
  section?: string;
  perceelnummer?: string;
}

export type OutputFormat = 'table' | 'json' | 'geojson' | 'wkt' | 'kml' | 'url';
export type CRS = '31370' | '4326';
