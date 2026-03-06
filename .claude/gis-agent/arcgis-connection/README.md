# ArcGIS Connection

ArcGIS REST service discovery and query workflows.

## Base URL

- `https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services`

## Core Operations

- List services/folders from ArcGIS REST catalog
- Query specific layer endpoints with geometry filters
- Convert GeoJSON geometry to ESRI JSON geometry where needed

## Query Notes

- ArcGIS `/query` accepts `geometry`, `geometryType`, `inSR`, `spatialRel`, `outFields`, `returnGeometry`, `f`.
- For Lambert72 workflows, set `inSR=31370` and `outSR=31370`.
- Use `f=json` for machine-readable responses.

See snippets:

- `arcgis-connection/curl-snippets.md`
- `arcgis-connection/js-snippets.md`
