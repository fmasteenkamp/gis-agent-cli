const GEOLOCATION_BASE = 'https://geo.api.vlaanderen.be/geolocation';

interface LocationResult {
  Location: { X_Lambert72: number; Y_Lambert72: number };
}

interface LocationResponse {
  LocationResult: LocationResult[];
}

/** Resolve a Flemish address to Lambert72 coordinates (x, y). Returns null if not found. */
export async function geocodeAddress(address: string): Promise<{ x: number; y: number } | null> {
  const url = `${GEOLOCATION_BASE}/location?q=${encodeURIComponent(address)}&c=1`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Geocode failed: ${res.status} ${res.statusText}`);
  const data = await res.json() as LocationResponse;
  const loc = data.LocationResult?.[0];
  if (!loc) return null;
  return { x: loc.Location.X_Lambert72, y: loc.Location.Y_Lambert72 };
}
