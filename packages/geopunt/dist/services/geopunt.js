import services from '../data/services.json' with { type: 'json' };
const GEOLOCATION_BASE = services.geolocation;
const CAPAKEY_BASE = services.capakey;
async function geocode(address, count) {
    const url = `${GEOLOCATION_BASE}/location?q=${encodeURIComponent(address)}&c=${count}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok)
        throw new Error(`Geocode failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.LocationResult ?? [];
}
async function getParcel(x, y, includeGeometry = false) {
    const geomParam = includeGeometry ? '&geometry=full' : '';
    const url = `${CAPAKEY_BASE}/parcel?x=${x.toFixed(2)}&y=${y.toFixed(2)}&buffer=10&srs=31370${geomParam}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok)
        return null;
    return res.json();
}
// --- Public API ---
export async function suggest(query, count) {
    const url = `${GEOLOCATION_BASE}/suggestion?q=${encodeURIComponent(query)}&c=${count}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok)
        throw new Error(`Suggestion failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.SuggestionResult ?? [];
}
export async function reverseGeocode(coord1, coord2, count, crs = '31370') {
    const param = crs === '4326'
        ? `latlon=${coord2},${coord1}`
        : `xy=${coord1},${coord2}`;
    const url = `${GEOLOCATION_BASE}/location?${param}&c=${count}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok)
        throw new Error(`Reverse geocode failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    const locations = data.LocationResult ?? [];
    const settled = await Promise.allSettled(locations.map(loc => getParcel(loc.Location.X_Lambert72, loc.Location.Y_Lambert72)));
    return locations.map((loc, i) => {
        const outcome = settled[i];
        const parcel = outcome.status === 'fulfilled' ? outcome.value : null;
        const result = {
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
export async function lookupCaPaKey(capakey, includeGeometry = false) {
    const encoded = encodeURIComponent(capakey);
    const geomParam = includeGeometry ? '&geometry=full' : '&geometry=bbox';
    const url = `${CAPAKEY_BASE}/parcel/${encoded}?srs=31370&data=adp&status=actual${geomParam}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok)
        throw new Error(`CaPaKey lookup failed: ${res.status} ${res.statusText}`);
    const parcel = await res.json();
    const result = {
        capaKey: parcel.capakey,
        municipality: parcel.municipalityName,
        department: parcel.departmentName,
        section: parcel.sectionCode,
        perceelnummer: parcel.perceelnummer,
        grondnummer: parcel.grondnummer,
        addresses: parcel.adres ?? [],
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
export async function searchCaPaKey(address, maxResults, options = {}) {
    const locations = await geocode(address, maxResults);
    const { includeCoordinates = false, includeGeometry = false } = options;
    const settled = await Promise.allSettled(locations.map(loc => getParcel(loc.Location.X_Lambert72, loc.Location.Y_Lambert72, includeGeometry)));
    const results = [];
    for (let i = 0; i < locations.length; i++) {
        const outcome = settled[i];
        if (outcome.status !== 'fulfilled' || !outcome.value)
            continue;
        const loc = locations[i];
        const parcel = outcome.value;
        const result = {
            formattedAddress: loc.FormattedAddress,
            locationType: loc.LocationType,
            capaKey: parcel.capakey ?? 'N/A',
            municipality: parcel.municipalityName ?? 'N/A',
            section: parcel.sectionCode ?? 'N/A',
            perceelnummer: parcel.perceelnummer ?? 'N/A',
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
export async function addressInfo(address) {
    const results = await searchCaPaKey(address, 1);
    if (results.length === 0)
        return null;
    return lookupCaPaKey(results[0].capaKey, true);
}
