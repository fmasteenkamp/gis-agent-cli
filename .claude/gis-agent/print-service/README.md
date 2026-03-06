# Print Service

Map image generation via ArcGIS print endpoint.

## Endpoint

- `https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute`

## Preconditions

- Prefer extent from direct capakey lookup and client-side extent calculation.

## Core Request Fields

- `Web_Map_as_JSON` (required)
- `Format` (example `JPG` or `PNG32`)
- `Layout_Template` (usually `MAP_ONLY`)
- `f=json`

## Layer Notes

- Default grey base map is included.
- Optional `includeOrthoPhoto` overlays orthophoto.
- Add `additionalLayers` for feature highlights, WMS, or ArcGIS map layers.

See snippets:

- `print-service/curl-snippets.md`
- `print-service/js-snippets.md`
