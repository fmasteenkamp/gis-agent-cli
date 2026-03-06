# Overlap Services Direct JavaScript Snippets

```js
const OVERLAP_BASE = process.env.OVERLAP_SERVICE_URL || "https://gisoverlap-api-ontwikkel.natuurenbos.be";
const SWAGGER_URL = `${OVERLAP_BASE}/swagger/v1/swagger.json`;

function pathToEndpointId(path) {
  return path
    .replace(/^\/api\/v1\//, "")
    .replace(/\//g, "_")
    .replace(/-/g, "_");
}

async function loadOverlapRegistry() {
  const response = await fetch(SWAGGER_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Failed to load swagger: ${response.status} ${response.statusText}`);
  }

  const spec = await response.json();
  const entries = [];

  for (const [path, item] of Object.entries(spec.paths || {})) {
    if (!path.startsWith("/api/v1/")) {
      continue;
    }

    for (const [method, op] of Object.entries(item || {})) {
      entries.push({
        id: pathToEndpointId(path),
        path,
        method: method.toUpperCase(),
        summary: op.summary || "",
        operationId: op.operationId || "",
        tags: op.tags || []
      });
    }
  }

  return entries;
}

async function callOverlap(path, geoJsonFeature, xUsername) {
  const response = await fetch(`${OVERLAP_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(xUsername ? { "X-Username": xUsername } : {})
    },
    body: JSON.stringify(geoJsonFeature)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Overlap call failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

const sampleFeature = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [[[140154.46, 162047.59], [141935.63, 164152.62], [143392.96, 164800.32], [140100.48, 166311.62], [139884.58, 163289.02], [140154.46, 162047.59]]]
  },
  properties: {}
};

async function run() {
  const registry = await loadOverlapRegistry();
  const beheerregio = registry.find((e) => e.id === "beheerregio_intersection_polygon");

  if (!beheerregio) {
    throw new Error("Endpoint not found: beheerregio_intersection_polygon");
  }

  const result = await callOverlap(beheerregio.path, sampleFeature, "skill-test@local");

  console.log({
    endpointId: beheerregio.id,
    path: beheerregio.path,
    intersectingCount: Array.isArray(result.intersecting) ? result.intersecting.length : 0,
    layerName: result.layerName
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```
