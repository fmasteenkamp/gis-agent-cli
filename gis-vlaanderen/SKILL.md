---
name: gis-vlaanderen
description: >
  Flemish GIS utilities for address geocoding, parcel (CaPaKey) lookup, reverse geocoding,
  spatial buffer queries, and format conversion using the Vlaanderen/Geopunt APIs via the `gis-tools` CLI.
  Use this skill whenever the user asks about Belgian/Flemish addresses, cadastral parcels,
  CaPaKey codes, geocoding in Flanders, proximity/buffer searches, or needs to find features
  near a location in Belgium. Also trigger when the user mentions Geopunt, CaPaKey, Lambert72,
  kadaster, perceelnummer, GRB, or any Flemish GIS data. Supports KML, GeoJSON, WKT, and Google Maps URL output.
  Werkt ook in het Nederlands — activeer bij vragen over adressen, percelen, kadaster,
  bufferanalyse of GIS-gegevens in Vlaanderen.
---

# `gis-tools` CLI

Run with: `gis-tools` (installed globally).

**Install:** `cd c:\Dev\gis-agent-cli && npm run build && npm link`

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

## Examples

```bash
gis-tools address search "Veldstraat 1, Gent" -r 3 -f json --crs 4326 -c -g
gis-tools address search "Meir 1, Antwerpen" -f url -c
gis-tools address search "Grote Markt, Brussel" -f kml -g
gis-tools address suggest "Koning" -r 10
gis-tools address reverse 51.0362 3.7160 --crs 4326
gis-tools address info "Meir 1, Antwerpen" -f geojson
gis-tools address info "Veldstraat 1, Gent" -f kml
gis-tools capakey lookup "44803C0171/00H000" -g -f kml
gis-tools address batch addresses.txt -f json -c -g
gis-tools buffer "Veldstraat 1, Gent" 1000 -f geojson --crs 4326
gis-tools buffer "104683,193910" 500 -f wkt
gis-tools buffer "Veldstraat 1, Gent" 500 -f kml
gis-tools convert parcels.geojson -f kml
gis-tools convert parcels.geojson -f wkt
gis-tools convert lambert.geojson -f geojson --crs 4326
```
