# Capakey Lookup Direct JavaScript Snippets

These snippets call upstream APIs directly for capakey lookup.

```js
const GEOLOCATION_BASE = "https://geo.api.vlaanderen.be/geolocation";
const CAPAKEY_BASE = "https://geo.api.vlaanderen.be/capakey/v2";

function assertOk(response, label) {
  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${response.statusText}`);
  }
}

async function searchAddress(q) {
  const url = new URL(`${GEOLOCATION_BASE}/location`);
  url.searchParams.set("q", q);
  url.searchParams.set("type", "Housenumber");
  url.searchParams.set("c", "5");

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  assertOk(response, "Address lookup");
  return response.json();
}

async function findParcelByCoordinates(x, y, buffer = 10) {
  const url = new URL(`${CAPAKEY_BASE}/parcel`);
  url.searchParams.set("x", String(x));
  url.searchParams.set("y", String(y));
  url.searchParams.set("buffer", String(buffer));
  url.searchParams.set("geometry", "full");
  url.searchParams.set("srs", "31370");

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  assertOk(response, "Parcel by coordinates");
  return response.json();
}

async function getParcelByCapakey(capakey) {
  const encoded = encodeURIComponent(capakey);
  const url = new URL(`${CAPAKEY_BASE}/parcel/${encoded}`);
  url.searchParams.set("geometry", "full");
  url.searchParams.set("srs", "31370");
  url.searchParams.set("data", "adp");
  url.searchParams.set("status", "actual");

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  assertOk(response, "Parcel by capakey");
  return response.json();
}

function parseApiGeometryShape(parcelApiResponse) {
  const shape = parcelApiResponse?.geometry?.shape;
  if (!shape) {
    return null;
  }
  return JSON.parse(shape);
}

function computeExtentFromPolygon(shapeGeoJson, buffer = 0) {
  if (!shapeGeoJson || shapeGeoJson.type !== "Polygon") {
    throw new Error("Only Polygon shape is supported in this helper");
  }

  const ring = shapeGeoJson.coordinates?.[0] || [];
  if (ring.length === 0) {
    throw new Error("Polygon has no coordinates");
  }

  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);

  return {
    xmin: Math.min(...xs) - buffer,
    ymin: Math.min(...ys) - buffer,
    xmax: Math.max(...xs) + buffer,
    ymax: Math.max(...ys) + buffer,
    spatialReference: { wkid: 31370 }
  };
}

async function runCapakeyFlow() {
  const addressResult = await searchAddress("Korenmarkt 1 Gent");
  const first = addressResult?.LocationResult?.[0];

  if (!first?.Location) {
    throw new Error("No address results");
  }

  const x = first.Location.X_Lambert72;
  const y = first.Location.Y_Lambert72;

  const parcelFromXY = await findParcelByCoordinates(x, y, 10);
  const capakey = parcelFromXY?.capakey;

  if (!capakey) {
    throw new Error("No capakey found for coordinates");
  }

  const parcel = await getParcelByCapakey(capakey);
  const shape = parseApiGeometryShape(parcel);
  const extent750 = computeExtentFromPolygon(shape, 750);

  console.log({
    address: first.FormattedAddress,
    capakey,
    municipality: parcel.municipalityName,
    section: parcel.sectionCode,
    perceelnummer: parcel.perceelnummer,
    extent750
  });
}

runCapakeyFlow().catch((err) => {
  console.error(err);
  process.exit(1);
});
```
