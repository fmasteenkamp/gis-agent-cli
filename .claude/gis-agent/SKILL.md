# GIS Agent Skill

Use this skill when the task involves Belgian parcel lookup, overlap checks, ArcGIS REST queries, or map image generation.

This skill combines CLI tools (`gis-geopunt`, `anb-gis`, `dossiers`) with direct-API fallback using upstream services.

## Scope

- Capakey parcel lookup and geometry retrieval
- Overlap service discovery and intersection checks
- ArcGIS REST connection and service queries
- ArcGIS print service map image generation (CLI and direct API)

## Quick Rules

- Always start by resolving location to Lambert72 (EPSG:31370) when geometry is involved.
- For address lookups with multiple matches, present a numbered option list and ask the user to pick one before continuing.
- For overlaps, discover available paths from swagger before calling intersection endpoints.
- For print/maps, prefer the `anb-gis print` CLI command; fall back to direct API calls when the CLI is unavailable.
- Use GeoJSON `Feature` objects (not raw geometry) for overlap and ArcGIS feature query tools.
- For overlap calls, vet payload before request: `type=Feature`, valid `geometry`, `properties` present, Lambert72 coordinates.
- In user-facing responses, default to concise main details; do not include raw geometry/shape unless explicitly requested.

## CLI Tools

### anb-gis

| Command | Description |
|---|---|
| `anb-gis overlap [layer] [location] [radius]` | Check overlap with environmental/policy layers |
| `anb-gis mapserver fields <layer>` | Show MapServer layer field info |
| `anb-gis mapserver query <layer> --where <sql>` | Query MapServer features with SQL filter |
| `anb-gis mapserver plan <id>` | Get GeoJSON for a natuurbeheerplan |
| `anb-gis print [location]` | Generate a map image via ArcGIS Print Service |

### anb-gis print

Generate map images with configurable extent, layers, and output parameters.

```bash
# By address
anb-gis print "Termurenlaan 14, Brussel" --buffer 750 --ortho

# By Lambert72 coordinates
anb-gis print 150000,170000 --buffer 500

# By CaPaKey parcel
anb-gis print --capakey "41042C1030/00A000" --buffer 500

# With MapServer overlay layers (keywords from `anb-gis mapserver --list`)
anb-gis print 150000,170000 --buffer 500 --layers globaalkader --dpi 150

# With direct MapServer URL (for layers not in the registry)
anb-gis print "Termurenlaan 21, Aalst" --buffer 3000 --layers "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/PAS/ProgrammatischeAanpakStikstof/MapServer"

# With a specific sublayer by ID
anb-gis print 150000,170000 --buffer 500 --layers "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/PAS/ProgrammatischeAanpakStikstof/MapServer/2"

# Highlight with WKT
anb-gis print 150000,170000 --buffer 500 --highlight "POLYGON ((149800 169800, 150200 169800, 150200 170200, 149800 170200, 149800 169800))"

# Highlight with GeoJSON file
anb-gis print 150000,170000 --buffer 500 --highlight @parcel.geojson --ortho

# Multiple highlights (repeatable)
anb-gis print 150000,170000 --buffer 500 --highlight "POLYGON (...)" "POINT (150000 170000)" @area.geojson

# Combined: PAS layer + parcel highlight
anb-gis print "Termurenlaan 21, Aalst" --buffer 3000 --layers "https://...PAS/.../MapServer" --highlight "POLYGON (...)"

# High-quality output
anb-gis print --capakey "41042C1030/00A000" --buffer 500 --dpi 150 --size 1000x750 --format PNG
```

**Options:**

| Flag | Description | Default |
|---|---|---|
| `--capakey <key>` | Use parcel extent from CaPaKey | — |
| `--buffer <meters>` | Extent buffer in meters | `500` |
| `--ortho` | Include orthophoto base layer | `false` |
| `--dpi <n>` | Output resolution (72-300) | `96` |
| `--size <WxH>` | Output dimensions in pixels | `1200x800` |
| `--format <fmt>` | JPG or PNG | `JPG` |
| `--layers <keys>` | Comma-separated MapServer layer keywords or direct URLs | — |
| `--highlight <data...>` | GeoJSON/WKT to highlight (`@file`, inline JSON, or WKT; repeatable) | — |
| `--crs <crs>` | Input CRS: 31370 or 4326 | `31370` |
| `--open` | Open result URL in browser | `false` |

**Highlight input formats:**
- **WKT**: `"POLYGON ((...))"`  — auto-detected by geometry prefix
- **GeoJSON**: inline `'{"type":"Polygon",...}'` or bare geometry
- **File**: `@path.geojson` or `@path.wkt` — format auto-detected from content
- **Repeatable**: pass multiple values to overlay several features (each gets yellow fill + red outline)

**Location resolution order:** address geocoding > coordinate parsing > `--capakey` parcel extent.

**Output:** prints the generated image URL to stdout.

## Direct API Mode

Use these upstream services as fallback when CLI tools are unavailable:

- Capakey API: `https://geo.api.vlaanderen.be/capakey/v2`
- Geolocation API: `https://geo.api.vlaanderen.be/geolocation`
- Overlap API: `https://gisoverlap-api-ontwikkel.natuurenbos.be`
- ArcGIS REST: `https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services`
- ArcGIS Print: `https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute`

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
- `print-service/`: extent-first map generation patterns and CLI usage.

## Suggested Execution Sequence

1. Resolve address or coordinates in `capakey-lookup`.
2. If environmental constraints are needed, use `overlap-services`.
3. If GIS service data is needed, use `arcgis-connection`.
4. If visual output is required, use `print-service` (prefer `anb-gis print` CLI).

## Notes

- Print service availability: 07:30-19:00 Brussels time (CET/CEST). Requests outside this window will fail.
- Flanders coverage assumptions apply to these services.
- Where geometry transformation/processing is needed in scripts, use `proj4` and `jsts` npm packages.
