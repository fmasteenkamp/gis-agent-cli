# Print Service

Map image generation via ArcGIS print endpoint.

## CLI Command (preferred)

Use `anb-gis print` for map image generation:

```bash
# By address
anb-gis print "Termurenlaan 14, Brussel" --buffer 750 --ortho

# By Lambert72 coordinates
anb-gis print 150000,170000 --buffer 500

# By CaPaKey parcel
anb-gis print --capakey "41042C1030/00A000" --buffer 500

# With MapServer overlay layers (registry keywords or direct URLs)
anb-gis print 150000,170000 --buffer 500 --layers globaalkader --dpi 150

# With direct MapServer URL (auto-discovers and enables all sublayers)
anb-gis print "Termurenlaan 21, Aalst" --buffer 3000 --layers "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/PAS/ProgrammatischeAanpakStikstof/MapServer"

# With specific sublayer
anb-gis print 150000,170000 --buffer 500 --layers "https://...MapServer/2"

# With highlighted GeoJSON
anb-gis print 150000,170000 --buffer 500 --highlight @parcel.geojson --ortho

# High-quality output, open in browser
anb-gis print --capakey "41042C1030/00A000" --buffer 500 --dpi 150 --size 1000x750 --format PNG --open
```

**Options:** `--capakey`, `--buffer` (default 500), `--ortho`, `--dpi` (72-300), `--size` (WxH), `--format` (JPG|PNG), `--layers` (MapServer keywords), `--highlight` (GeoJSON @file or inline), `--crs` (31370|4326), `--open`.

The command resolves location (address geocode, coordinate parse, or CaPaKey parcel extent), builds the web map JSON, and returns the generated image URL.

## Direct API Fallback

Use direct API calls when the CLI is unavailable.

### Endpoint

- `https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute`

### Preconditions

- Prefer extent from direct capakey lookup and client-side extent calculation.

### Core Request Fields

- `Web_Map_as_JSON` (required)
- `Format` (example `JPG` or `PNG`)
- `f=json`

### Layer Notes

- Default grey base map is always included.
- Optional `includeOrthoPhoto` overlays orthophoto at 55% opacity.
- Add `additionalLayers` for feature highlights, WMS, or ArcGIS map layers.
- The `--layers` flag accepts registry keywords (`anb-gis mapserver --list`) or direct MapServer URLs.
- When a MapServer URL is used without a sublayer ID, all sublayers are auto-discovered and enabled via `visibleLayers`.
- For a specific sublayer, append the ID to the URL (e.g. `.../MapServer/2`).

### Service Availability

07:30-19:00 Brussels time (CET/CEST). Requests outside this window will fail.

See snippets:

- `print-service/curl-snippets.md`
- `print-service/js-snippets.md`
