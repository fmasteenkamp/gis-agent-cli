---
name: gis-vlaanderen
description: >
  Flemish GIS utilities for address geocoding, parcel (CaPaKey) lookup, reverse geocoding,
  buffer geometry, nearby feature search, overlap analysis, and format conversion using
  Vlaanderen/Geopunt/ANB APIs via the `gis-tools` CLI. Use this skill whenever the user asks
  about Belgian/Flemish addresses, cadastral parcels, CaPaKey codes, geocoding in Flanders,
  proximity searches, bus/tram stops, forests, hunting grounds, environmental overlaps, nature
  reserves, habitat areas, heritage constraints, zoning, or needs to find features near a location
  in Belgium. Also trigger when the user mentions Geopunt, CaPaKey, Lambert72, kadaster,
  perceelnummer, De Lijn, haltes, bushalte, bos, jacht, overlap, ANB, Natuur en Bos, beheerplan,
  beheerregio, habitat, vogelrichtlijn, VEN, IVON, Ramsar, erfgoed, gewestplan, BWK, bodemkaart,
  SBP, PAS, duinen, natuurreservaat, or any Flemish GIS/WFS/overlap data. Supports KML, GeoJSON,
  WKT, and Google Maps URL output.
  Werkt ook in het Nederlands — activeer bij vragen over adressen, percelen, kadaster,
  bufferanalyse, bushaltes, bossen, jachtgebieden, overlaps, natuurgebieden, erfgoed,
  beschermde zones of GIS-gegevens in Vlaanderen.
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
| `nearby <layer> <location> [radius]` | `-f` `-n` `--crs` | Find WFS features near address/coords |
| `overlap [layer] <location> [radius]` | `-f` `--crs` `--list` `--search` `--all` | Check ANB environmental/policy overlaps |
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

### Overlap options
- `[layer]` — overlap layer keyword (use `--list` to see all 53 layers)
- `<location>` — one of: address string, `"x,y"` coords, inline GeoJSON string, or `@file.geojson`
- `[radius]` — buffer radius in meters (default: 50, ignored for GeoJSON input)
- `-f` — output format: `table` (default), `json`
- `--crs <31370|4326>` — coordinate system for coords/GeoJSON input (default: 31370)
- `--list` — list all available overlap layers with keywords and descriptions
- `--search <query>` — search layers by keyword, label, or description
- `--all` — check all overlap layers at once
- GeoJSON input: accepts Feature, FeatureCollection (uses first feature), or bare Geometry
- Validates: type, coordinates range (Lambert72/WGS84 detection), polygon ring closure
- For address/coords input, creates a buffer polygon; GeoJSON input is sent directly

### Overlap layer categories (use `--list` for full list)
- Administrative: gemeente, provincie, beheerregio, boswachterijen, bosgroep
- Nature/conservation: habitat, vogelrichtlijn, ramsar, venivon, vnr, enr, bosreservaten, sigma
- Policy/planning: beheerplan, natuurrichtplan, natuurdoelenlaag, gewestplan, pas, sbp
- Heritage: erfgoed, beschermdarcheologisch, beschermdmonument, beschermdchlandschap
- Land use: bwk, bwkwaarde, boswaardering, bodemkaart, landbouw, historischgrasland, duinen
- Other: jachtterrein, ruimteboekhouding, vegetatiebesluit, hag

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
- **Overlap API** may be offline outside business hours (weekends/maintenance). If a query times out, do not retry — report that the server is unavailable
- **nearby** results are not sorted by distance. To find the single closest feature, use `nearby` with a small radius, or combine `nearby` + `distance` to rank results

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
gis-tools nearby haltes "Veldstraat 1, Gent" 500
gis-tools nearby jacht "Korenlei 1, Gent" 5000 -f json
gis-tools nearby bos "Brugge" 3000 -f geojson --crs 4326
gis-tools nearby landgebruik "Veldstraat 1, Gent" 200 --year 1778
gis-tools nearby landgebruik "Grote Markt, Antwerpen" 500 --year 1969 -f json
gis-tools overlap --list
gis-tools overlap --search habitat
gis-tools overlap beheerregio "Veldstraat 1, Gent" 100
gis-tools overlap habitat "Brugge" 500 -f json
gis-tools overlap gewestplan "104683,193910" 200
gis-tools overlap erfgoed "Grote Markt, Antwerpen" 100 -f json
gis-tools overlap --all "Veldstraat 1, Gent" 50
gis-tools overlap habitat '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[104600,193800],[104700,193800],[104700,193900],[104600,193900],[104600,193800]]]},"properties":{}}'
gis-tools overlap habitat @parcel.geojson
gis-tools overlap habitat @parcel-wgs84.geojson --crs 4326
gis-tools distance "Veldstraat 1, Gent" "Korenmarkt 1, Gent"
gis-tools distance "Gent" "Brugge" -f json
gis-tools distance @poly1.geojson @poly2.geojson
gis-tools distance "Veldstraat 1, Gent" @area.geojson
gis-tools convert parcels.geojson -f kml
gis-tools convert parcels.geojson -f wkt
gis-tools convert lambert.geojson -f geojson --crs 4326
```
