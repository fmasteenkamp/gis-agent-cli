import type {
  CaPaKeySearchResult, CaPaKeyLookupResult, LocationResult,
  LocationResponse, ParcelResponse, SuggestionResponse, ReverseResult, CRS,
} from '../models/geopunt.js';
import services from '../data/services.json' with { type: 'json' };

const GEOLOCATION_BASE = services.geolocation;
const CAPAKEY_BASE = services.capakey;

async function geocode(address: string, count: number): Promise<LocationResult[]> {
  const url = `${GEOLOCATION_BASE}/location?q=${encodeURIComponent(address)}&c=${count}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Geocode failed: ${res.status} ${res.statusText}`);
  const data = await res.json() as LocationResponse;
  return data.LocationResult ?? [];
}

async function getParcel(x: number, y: number, includeGeometry = false): Promise<ParcelResponse | null> {
  const geomParam = includeGeometry ? '&geometry=full' : '';
  const url = `${CAPAKEY_BASE}/parcel?x=${x.toFixed(2)}&y=${y.toFixed(2)}&buffer=10&srs=31370${geomParam}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  return res.json() as Promise<ParcelResponse>;
}

// --- Public API ---

export async function suggest(query: string, count: number): Promise<string[]> {
  const url = `${GEOLOCATION_BASE}/suggestion?q=${encodeURIComponent(query)}&c=${count}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Suggestion failed: ${res.status} ${res.statusText}`);
  const data = await res.json() as SuggestionResponse;
  return data.SuggestionResult ?? [];
}

export async function reverseGeocode(
  coord1: number, coord2: number, count: number, crs: CRS = '31370',
): Promise<ReverseResult[]> {
  const param = crs === '4326'
    ? `latlon=${coord2},${coord1}`
    : `xy=${coord1},${coord2}`;
  const url = `${GEOLOCATION_BASE}/location?${param}&c=${count}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status} ${res.statusText}`);
  const data = await res.json() as LocationResponse;
  const locations = data.LocationResult ?? [];

  const settled = await Promise.allSettled(
    locations.map(loc => getParcel(loc.Location.X_Lambert72, loc.Location.Y_Lambert72))
  );

  return locations.map((loc, i) => {
    const outcome = settled[i];
    const parcel = outcome.status === 'fulfilled' ? outcome.value : null;

    const result: ReverseResult = {
      formattedAddress: loc.FormattedAddress,
      locationType: loc.LocationType,
      coordinates: {
        lambert72: { x: loc.Location.X_Lambert72, y: loc.Location.Y_Lambert72 },
        wgs84: { lat: loc.Location.Lat_WGS84, lon: loc.Location.Lon_WGS84 },
      },
    };

    if (parcel) {
      result.capaKey = parcel.capakey;
      result.municipality = parcel.municipalityName;
      result.section = parcel.sectionCode;
      result.perceelnummer = parcel.perceelnummer;
    }

    return result;
  });
}

export async function lookupCaPaKey(capakey: string, includeGeometry = false): Promise<CaPaKeyLookupResult> {
  const encoded = encodeURIComponent(capakey);
  const geomParam = includeGeometry ? '&geometry=full' : '&geometry=bbox';
  const url = `${CAPAKEY_BASE}/parcel/${encoded}?srs=31370&data=adp&status=actual${geomParam}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`CaPaKey lookup failed: ${res.status} ${res.statusText}`);
  const parcel = await res.json() as ParcelResponse;

  const result: CaPaKeyLookupResult = {
    capaKey:       parcel.capakey,
    municipality:  parcel.municipalityName,
    department:    parcel.departmentName,
    section:       parcel.sectionCode,
    perceelnummer: parcel.perceelnummer,
    grondnummer:   parcel.grondnummer,
    addresses:     parcel.adres ?? [],
  };

  if (parcel.geometry?.center) {
    const center = JSON.parse(parcel.geometry.center);
    if (center?.coordinates) {
      result.centroid = { x: center.coordinates[0], y: center.coordinates[1] };
    }
  }

  if (includeGeometry && parcel.geometry?.shape) {
    result.geometry = JSON.parse(parcel.geometry.shape);
  }

  return result;
}

export async function searchCaPaKey(
  address: string,
  maxResults: number,
  options: { includeCoordinates?: boolean; includeGeometry?: boolean } = {},
): Promise<CaPaKeySearchResult[]> {
  const locations = await geocode(address, maxResults);
  const { includeCoordinates = false, includeGeometry = false } = options;

  const settled = await Promise.allSettled(
    locations.map(loc => getParcel(loc.Location.X_Lambert72, loc.Location.Y_Lambert72, includeGeometry))
  );

  const results: CaPaKeySearchResult[] = [];

  for (let i = 0; i < locations.length; i++) {
    const outcome = settled[i];
    if (outcome.status !== 'fulfilled' || !outcome.value) continue;

    const loc = locations[i];
    const parcel = outcome.value;

    const result: CaPaKeySearchResult = {
      formattedAddress: loc.FormattedAddress,
      locationType:     loc.LocationType,
      capaKey:          parcel.capakey        ?? 'N/A',
      municipality:     parcel.municipalityName ?? 'N/A',
      section:          parcel.sectionCode    ?? 'N/A',
      perceelnummer:    parcel.perceelnummer   ?? 'N/A',
    };

    if (includeCoordinates) {
      result.coordinates = {
        lambert72: { x: loc.Location.X_Lambert72, y: loc.Location.Y_Lambert72 },
        wgs84: { lat: loc.Location.Lat_WGS84, lon: loc.Location.Lon_WGS84 },
      };
    }

    if (includeGeometry && parcel.geometry?.shape) {
      result.geometry = JSON.parse(parcel.geometry.shape);
    }

    results.push(result);
  }

  return results;
}

export async function addressInfo(address: string): Promise<CaPaKeyLookupResult | null> {
  const results = await searchCaPaKey(address, 1);
  if (results.length === 0) return null;
  return lookupCaPaKey(results[0].capaKey, true);
}

