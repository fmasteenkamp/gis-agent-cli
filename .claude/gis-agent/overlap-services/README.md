# Overlap Services (Direct API)

Call the overlap API directly.

## Base URLs

- Swagger: `https://gisoverlap-api-ontwikkel.natuurenbos.be/swagger/v1/swagger.json`
- API root: `https://gisoverlap-api-ontwikkel.natuurenbos.be`

If these fail, check `../resources.md` and request an override base URL.

## Required Payload

Send a GeoJSON `Feature` body (not raw geometry), with Lambert72 coordinates.

Payload vetting checklist (from overlap service guide):

- `type` must be exactly `Feature`.
- `geometry` must exist and be a valid GeoJSON geometry object.
- `properties` must exist (can be `{}`).
- Coordinates must be Lambert72 (`EPSG:31370`) ranges, not WGS84 lat/lon.
- For polygons, ring should be closed (first coordinate equals last coordinate).

If this checklist fails, do not call the overlap endpoint yet; fix payload first.

### JSTS validation snippet

Use this helper before POSTing to overlap endpoints.

Note: `jsts` buffer/distance operations use the geometry's current coordinate units. Convert WGS84 (`EPSG:4326`) to Lambert72 (`EPSG:31370`) first with `proj4` when you need metric outputs (meters).

```js
import jsts from "jsts";

export function validateOverlapFeaturePayload(feature) {
  const issues = [];

  if (!feature || feature.type !== "Feature") {
    issues.push("type must be Feature");
  }

  if (!feature || !feature.geometry || !feature.geometry.type || !feature.geometry.coordinates) {
    issues.push("geometry must be a valid GeoJSON geometry object");
  }

  if (!feature || typeof feature.properties !== "object" || feature.properties === null) {
    issues.push("properties must be present (can be {})");
  }

  // Basic Lambert72 range check (first coordinate sample)
  const first = feature?.geometry?.coordinates?.[0]?.[0] || feature?.geometry?.coordinates?.[0];
  if (Array.isArray(first) && first.length >= 2) {
    const [x, y] = first;
    const lambert72Like = x >= 20000 && x <= 260000 && y >= 150000 && y <= 250000;
    if (!lambert72Like) {
      issues.push("coordinates do not look like Lambert72 (EPSG:31370)");
    }
  }

  // Topology validity with JSTS
  try {
    const reader = new jsts.io.GeoJSONReader();
    const geom = reader.read(feature.geometry);
    if (!geom || !geom.isValid()) {
      issues.push("geometry is topologically invalid (JSTS)");
    }
  } catch (err) {
    issues.push(`JSTS parse error: ${err instanceof Error ? err.message : "unknown"}`);
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

// Example:
// const { valid, issues } = validateOverlapFeaturePayload(feature);
// if (!valid) throw new Error(`Invalid overlap payload: ${issues.join('; ')}`);
```

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[140154.46,162047.59],[141935.63,164152.62],[143392.96,164800.32],[140100.48,166311.62],[139884.58,163289.02],[140154.46,162047.59]]]
  },
  "properties": {}
}
```

## Endpoint Discovery Pattern

1. Fetch swagger JSON.
2. Enumerate `paths` keys like `/api/v1/.../intersection/polygon`.
3. Normalize path to endpoint ID using this rule:
   - remove `/api/v1/`
   - replace `/` with `_`
   - replace `-` with `_`

Example:

- Path: `/api/v1/beheerregio/intersection/polygon`
- Endpoint ID: `beheerregio_intersection_polygon`

## Call Pattern

- URL: `{OVERLAP_BASE}{path}`
- Method: `POST`
- Headers: `Content-Type: application/json`, optional `X-Username`

See snippets:

- `overlap-services/curl-snippets.md`
- `overlap-services/js-snippets.md`

## Overlap Path Catalog

Use `overlap-services/paths-catalog.md` for overlap paths, keywords, endpoint mapping, and usage guidance.
