# GIS Agent Skill

Use this skill when the task involves Belgian parcel lookup, overlap checks, ArcGIS REST queries, or map image generation.

This skill is direct-API only and uses upstream services with curl/fetch snippets.

## Scope

- Capakey parcel lookup and geometry retrieval
- Overlap service discovery and intersection checks
- ArcGIS REST connection and service queries
- ArcGIS print service image generation

## Quick Rules

- Always start by resolving location to Lambert72 (EPSG:31370) when geometry is involved.
- For address lookups with multiple matches, present a numbered option list and ask the user to pick one before continuing.
- For overlaps, discover available paths from swagger before calling intersection endpoints.
- For print/maps, call the ArcGIS print endpoint directly.
- Use GeoJSON `Feature` objects (not raw geometry) for overlap and ArcGIS feature query tools.
- For overlap calls, vet payload before request: `type=Feature`, valid `geometry`, `properties` present, Lambert72 coordinates.
- In user-facing responses, default to concise main details; do not include raw geometry/shape unless explicitly requested.

## Direct API Mode

Use these upstream services:

- Capakey API: `https://geo.api.vlaanderen.be/capakey/v2`
- Geolocation API: `https://geo.api.vlaanderen.be/geolocation`
- Overlap API: `https://gisoverlap-api-ontwikkel.natuurenbos.be`
- ArcGIS REST: `https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services`

Start with `capakey-lookup` first, then chain into overlap/arcgis/print as needed.

For fallback/override handling, use `resources.md` in this skill and prompt for a base URL override when a default endpoint fails.

## Core API Map

- Geolocation API `/geolocation/location`: forward/reverse geocoding.
- Capakey API `/capakey/v2/parcel`: lookup by capakey or coordinates.
- Overlap API `/api/v1/*/intersection/polygon`: dataset intersection checks.
- Overlap Swagger `/swagger/v1/swagger.json`: endpoint discovery.
- ArcGIS REST `/.../MapServer/.../query`: ArcGIS attribute/spatial query.
- ArcGIS Print `/Utilities/PrintingTools/.../execute`: map image export.

## Skill Layout

- `capakey-lookup/`: address-to-parcel and parcel detail workflows.
- `overlap-services/`: endpoint discovery and intersection workflows.
- `arcgis-connection/`: ArcGIS service connection and query patterns.
- `print-service/`: extent-first map generation patterns.

## Suggested Execution Sequence

1. Resolve address or coordinates in `capakey-lookup`.
2. If environmental constraints are needed, use `overlap-services`.
3. If GIS service data is needed, use `arcgis-connection`.
4. If visual output is required, use `print-service`.

## Notes

- Print service availability window is operationally constrained; if it fails, retry within service hours.
- Flanders coverage assumptions apply to these services.
- Where geometry transformation/processing is needed in scripts, use `proj4` and `jsts` npm packages.
