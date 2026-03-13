---
name: gis-vlaanderen
description: >
  Flemish GIS utilities for address geocoding, parcel (CaPaKey) lookup, reverse geocoding,
  buffer geometry, nearby feature search, geometry distance, and format conversion using
  Vlaanderen/Geopunt APIs via the `gis-geopunt` CLI. Use this skill whenever the user asks
  about Belgian/Flemish addresses, cadastral parcels, CaPaKey codes, geocoding in Flanders,
  proximity searches, bus/tram stops, forests, hunting grounds, or needs to find features near
  a location in Belgium. Also trigger when the user mentions Geopunt, CaPaKey, Lambert72,
  kadaster, perceelnummer, De Lijn, haltes, bushalte, bos, jacht, or any Flemish GIS/WFS data.
  Supports KML, GeoJSON, WKT, and Google Maps URL output.
  Werkt ook in het Nederlands — activeer bij vragen over adressen, percelen, kadaster,
  bufferanalyse, bushaltes, bossen, jachtgebieden of GIS-gegevens in Vlaanderen.
---

# `gis-geopunt` CLI

Run with: `gis-geopunt` (installed globally).

**Install:** `cd c:\Dev\gis-agent-cli\packages\geopunt && npm run build && npm link`

## Commands

| Command | Options | Description |
|---------|---------|-------------|
| `address search <address>` | `-r` `-f` `-c` `-g` `--crs` | Search parcel by address |
| `address suggest <query>` | `-r` `-f`(table\|json) | Autocomplete suggestions |
| `address reverse <c1> <c2>` | `-r` `-f` `--crs` | Reverse geocode coordinates |
| `address info <address>` | `-f` | Full parcel details (search + lookup) |
| `address batch <file>` | `-f` `-c` `-g` `--crs` | Bulk search from file (one address/line) |
| `address interactive` | `-f`(table\|json) `--crs` | Interactive REPL with autocomplete |
| `capakey lookup <capakey>` | `-f` `-g` | Look up parcel by CaPaKey |
| `buffer <location> <radius>` | `-f` `--crs` | Generate buffer polygon around address/coords |
| `nearby <layer> <location> [radius]` | `-f` `-n` `--crs` | Find WFS features near address/coords |
| `distance <locationA> <locationB>` | `-f` `--crs` | Distance between two locations/geometries |
| `convert <file>` | `-f` `--crs` | Convert GeoJSON to another format |

## Options

- `-r, --results <n>` — number of results (search/reverse: 1-5, suggest: 1-10)
- `-f, --format` — `table` (default), `json`, `geojson`, `wkt`, `kml`, `url` (availability varies by command)
- `-g, --geometry` — include parcel polygon (search, batch, capakey lookup; auto-enabled for geojson/wkt/kml)
- `-c, --coordinates` — include Lambert72 + WGS84 coordinates (search, batch only)
- `--crs <31370|4326>` — coordinate system (default: 31370 Lambert72)

Note: `capakey lookup` always shows centroid coordinates. Use `-g` for full polygon geometry.

### Format details
- `table` — human-readable table (default)
- `json` — raw JSON
- `geojson` — GeoJSON FeatureCollection
- `wkt` — Well-Known Text (tab-separated with ID)
- `kml` — KML for Google Earth/Maps (geometry auto-transformed to WGS84)
- `url` — Google Maps URL per result (requires `-c` for coordinates)

### Buffer options
- `<location>` — address string or `"x,y"` Lambert72 coordinates (use `--crs 4326` for lat,lon)
- `<radius>` — buffer radius in meters
- `-f` — output format: `geojson` (default), `wkt`, `kml`
- `--crs` — output CRS: `31370` (default) or `4326`
- Returns a single buffer polygon (circle) as GeoJSON FeatureCollection, WKT, or KML

### Nearby options
- `<layer>` — WFS layer to query (see table below)
- `<location>` — address string or `"x,y"` Lambert72 coordinates (use `--crs 4326` for lat,lon)
- `[radius]` — search radius in meters (default: 500)
- `-f` — output format: `table` (default), `json`, `geojson`, `kml`
- `-n, --max <n>` — max features to return (default: 50)
- `-f url` outputs Google Maps links (point features only)

### Nearby layers
| Layer | Description | `--year` |
|-------|-------------|----------|
| `haltes` | De Lijn bus/tram/belbus stops | — |
| `bos` | Forest areas (Bosreferentielaag 2000) | — |
| `jacht` | Hunting grounds (Jachtterreinen) | — |
| `landbouw` | Agricultural parcels (crop type) | — |
| `landgebruik` | Historical land use | `1778`, `1873`, `1969` |

### Distance options
- `<locationA>`, `<locationB>` — address, `"x,y"` coords, inline GeoJSON, or `@file.geojson`
- `-f` — output format: `text` (default), `json`
- `--crs <31370|4326>` — coordinate system for coords/GeoJSON input
- Calculates minimum (closest-point-to-closest-point) distance in meters using JSTS DistanceOp
- Shows nearest points in both Lambert72 and WGS84

### Convert options
- `<file>` — input GeoJSON file (FeatureCollection, Feature, or bare Geometry)
- `-f` — output format: `geojson` (default if `--crs`), `wkt`, `kml` (default)
- `--crs` — transform coordinates to target CRS before output

## Key Concepts

- **CaPaKey**: cadastral parcel ID, e.g. `44803C0171/00H000`
- **Lambert72 (31370)**: Belgian coordinates — X ~20k-300k, Y ~150k-250k
- **WGS84 (4326)**: lat/lon — Belgium is ~lat 49.5-51.5, lon 2.5-6.5
- For `reverse`, `--crs` controls **input** coordinate system
- KML output always uses WGS84 (required by KML spec)
- All geojson output uses FeatureCollection format
- **Geopunt covers Flemish addresses only** — Brussels and Wallonia may not resolve. For non-Flemish locations, use Lambert72 or WGS84 coordinates directly instead of address strings
- **nearby** results are not sorted by distance. To find the single closest feature, use `nearby` with a small radius, or combine `nearby` + `distance` to rank results

## Examples

```bash
gis-geopunt address search "Veldstraat 1, Gent" -r 3 -f json --crs 4326 -c -g
gis-geopunt address search "Meir 1, Antwerpen" -f url -c
gis-geopunt address suggest "Koning" -r 10
gis-geopunt address reverse 51.0362 3.7160 --crs 4326
gis-geopunt address info "Meir 1, Antwerpen" -f geojson
gis-geopunt address info "Veldstraat 1, Gent" -f kml
gis-geopunt capakey lookup "44803C0171/00H000" -g -f kml
gis-geopunt address batch addresses.txt -f json -c -g
gis-geopunt buffer "Veldstraat 1, Gent" 1000 -f geojson --crs 4326
gis-geopunt buffer "104683,193910" 500 -f wkt
gis-geopunt buffer "Veldstraat 1, Gent" 500 -f kml
gis-geopunt nearby haltes "Veldstraat 1, Gent" 500
gis-geopunt nearby jacht "Korenlei 1, Gent" 5000 -f json
gis-geopunt nearby bos "Brugge" 3000 -f geojson --crs 4326
gis-geopunt nearby landgebruik "Veldstraat 1, Gent" 200 --year 1778
gis-geopunt nearby landgebruik "Grote Markt, Antwerpen" 500 --year 1969 -f json
gis-geopunt distance "Veldstraat 1, Gent" "Korenmarkt 1, Gent"
gis-geopunt distance "Gent" "Brugge" -f json
gis-geopunt distance @poly1.geojson @poly2.geojson
gis-geopunt distance "Veldstraat 1, Gent" @area.geojson
gis-geopunt convert parcels.geojson -f kml
gis-geopunt convert parcels.geojson -f wkt
gis-geopunt convert lambert.geojson -f geojson --crs 4326
```
