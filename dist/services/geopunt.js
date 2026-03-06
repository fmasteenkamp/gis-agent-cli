const GEOLOCATION_BASE = 'https://geo.api.vlaanderen.be/geolocation';
const CAPAKEY_BASE = 'https://geo.api.vlaanderen.be/capakey/v2';
async function geocode(address, count) {
    const url = `${GEOLOCATION_BASE}/location?q=${encodeURIComponent(address)}&c=${count}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok)
        throw new Error(`Geocode failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.LocationResult ?? [];
}
async function getParcel(x, y) {
    const url = `${CAPAKEY_BASE}/parcel?x=${x.toFixed(2)}&y=${y.toFixed(2)}&buffer=10&geometry=full&srs=31370`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok)
        return null;
    return res.json();
}
export async function lookupCaPaKey(capakey, includeGeometry = false) {
    const encoded = encodeURIComponent(capakey);
    const geomParam = includeGeometry ? '&geometry=full' : '';
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
    if (includeGeometry && parcel.geometry?.shape) {
        result.geometry = JSON.parse(parcel.geometry.shape);
    }
    return result;
}
export async function searchCaPaKey(address, maxResults) {
    const locations = await geocode(address, maxResults);
    const settled = await Promise.allSettled(locations.map(loc => getParcel(loc.Location.X_Lambert72, loc.Location.Y_Lambert72)));
    const results = [];
    for (let i = 0; i < locations.length; i++) {
        const outcome = settled[i];
        if (outcome.status !== 'fulfilled' || !outcome.value)
            continue;
        const loc = locations[i];
        const parcel = outcome.value;
        results.push({
            formattedAddress: loc.FormattedAddress,
            locationType: loc.LocationType,
            capaKey: parcel.capakey ?? 'N/A',
            municipality: parcel.municipalityName ?? 'N/A',
            section: parcel.sectionCode ?? 'N/A',
            perceelnummer: parcel.perceelnummer ?? 'N/A',
        });
    }
    return results;
}
