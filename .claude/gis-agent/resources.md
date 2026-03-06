# GIS Resources and URL Overrides

Use this file as the source of truth for upstream service URLs when running in direct API mode.

If a request fails (DNS, timeout, 404, gateway), prompt for an override base URL and retry with the same path/payload.

## Default Service URLs

- Geopunt base: `https://geo.api.vlaanderen.be`
- Capakey base: `https://geo.api.vlaanderen.be/capakey/v2`
- Geolocation base: `https://geo.api.vlaanderen.be/geolocation`
- Overlap base (current): `https://gisoverlap-api-ontwikkel.natuurenbos.be`
- Overlap swagger: `https://gisoverlap-api-ontwikkel.natuurenbos.be/swagger/v1/swagger.json`
- Overlap base (legacy/common alias): `https://overlapservices.vlaanderen.be`
- ArcGIS base: `https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services`
- ArcGIS print endpoint: `https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute`
- GRB grey WMS: `https://geo.api.vlaanderen.be/GRB-basiskaart-grijs/wms`
- Orthophoto WMS: `https://geo.api.vlaanderen.be/OMWRGBMRVL/wms`

## Recommended Override Variables

- `GEOPUNT_BASE_URL`
- `GEOPUNT_CAPAKEY_PATH`
- `GEOPUNT_GEOLOCATION_PATH`
- `OVERLAP_SERVICE_URL`
- `ARCGIS_BASE_URL`
- `ARCGIS_PRINT_PATH`

## Retry Strategy

1. Try default URL.
2. On failure, ask for override base URL only (keep path/payload unchanged).
3. Retry once with override.
4. If still failing, return exact request URL, status, and error body.

## Prompt Template for URL Override

Use this exact style when a direct call fails:

"The call to `<service-name>` failed using `<failed-base-url>`. Please provide an override base URL. I will retry with the same endpoint path and payload."

## Notes

- Keep overlap endpoint discovery dynamic via swagger `paths`.
- Keep Lambert72 (`EPSG:31370`) for capakey/overlap geometry workflows.
