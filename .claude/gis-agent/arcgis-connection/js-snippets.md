# ArcGIS Connection Direct JavaScript Snippets

```js
const ARCGIS_BASE = process.env.ARCGIS_BASE_URL || "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services";

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`GET failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function postForm(url, formData) {
  const body = new URLSearchParams(formData);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) {
    throw new Error(`POST failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function run() {
  const catalog = await getJson(`${ARCGIS_BASE}?f=pjson`);
  console.log("services:", (catalog.services || []).length);

  const queryUrl = `${ARCGIS_BASE}/KapMachtiging/KapmachtigingLokatie/MapServer/0/query`;
  const geometry = {
    rings: [[[150000, 170000], [151000, 170000], [151000, 171000], [150000, 171000], [150000, 170000]]],
    spatialReference: { wkid: 31370 }
  };

  const result = await postForm(queryUrl, {
    f: "json",
    where: "1=1",
    outFields: "*",
    returnGeometry: "true",
    spatialRel: "esriSpatialRelIntersects",
    inSR: "31370",
    outSR: "31370",
    geometryType: "esriGeometryPolygon",
    geometry: JSON.stringify(geometry)
  });

  console.log("features:", Array.isArray(result.features) ? result.features.length : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```
