# gis-agent-cli

Flemish GIS utilities CLI — query addresses, parcels, and spatial data from the Vlaanderen APIs.

## Install

```bash
npm install
npm run build
npm link   # makes `gis-tools` available globally
```

Requires Node.js >= 18.

## Usage

```bash
gis-tools <command> [options]
```

## Commands

### `address search <address>`

Search for cadastral parcels by address.

```bash
gis-tools address search "Korenmarkt 1, Gent"
gis-tools address search "Veldstraat 1, Gent" -r 3 -f json --crs 4326 -c -g
gis-tools address search "Meir 1, Antwerpen" -f url -c
gis-tools address search "Grote Markt, Brussel" -f kml -g
```

| Option | Description | Default |
|---|---|---|
| `-r, --results <n>` | Number of results (1–5) | `1` |
| `-f, --format <fmt>` | `table` \| `json` \| `geojson` \| `wkt` \| `kml` \| `url` | `table` |
| `-c, --coordinates` | Include Lambert72 + WGS84 coordinates | off |
| `-g, --geometry` | Include parcel polygon (auto-enabled for geojson/wkt/kml) | off |
| `--crs <crs>` | Coordinate system: `31370` (Lambert72) or `4326` (WGS84) | `31370` |

### `address suggest <query>`

Get address autocomplete suggestions.

```bash
gis-tools address suggest "Koning" -r 10
gis-tools address suggest "Veld" -f json
```

| Option | Description | Default |
|---|---|---|
| `-r, --results <n>` | Number of suggestions (1–10) | `5` |
| `-f, --format <fmt>` | `table` \| `json` | `table` |

### `address reverse <coord1> <coord2>`

Reverse geocode: find address from coordinates.

```bash
gis-tools address reverse 104683 193910
gis-tools address reverse 51.0362 3.7160 --crs 4326
gis-tools address reverse 51.0362 3.7160 --crs 4326 -f kml
```

| Option | Description | Default |
|---|---|---|
| `-r, --results <n>` | Number of results (1–5) | `1` |
| `-f, --format <fmt>` | `table` \| `json` \| `geojson` \| `wkt` \| `kml` \| `url` | `table` |
| `--crs <crs>` | **Input** coordinate system: `31370` (x y) or `4326` (lat lon) | `31370` |

### `address info <address>`

Full parcel info for an address (search + lookup combined).

```bash
gis-tools address info "Meir 1, Antwerpen" -f geojson
gis-tools address info "Veldstraat 1, Gent" -f kml
```

| Option | Description | Default |
|---|---|---|
| `-f, --format <fmt>` | `table` \| `json` \| `geojson` \| `wkt` \| `kml` | `table` |

### `address batch <file>`

Search parcels for multiple addresses from a file (one address per line).

```bash
gis-tools address batch addresses.txt -f json -c -g
gis-tools address batch addresses.txt -f kml -g
```

| Option | Description | Default |
|---|---|---|
| `-f, --format <fmt>` | `table` \| `json` \| `geojson` \| `wkt` \| `kml` \| `url` | `table` |
| `-c, --coordinates` | Include coordinates | off |
| `-g, --geometry` | Include parcel polygon | off |
| `--crs <crs>` | Coordinate system | `31370` |

### `address interactive`

Interactive REPL with autocomplete suggestions.

```bash
gis-tools address interactive
gis-tools address interactive --crs 4326
```

### `capakey lookup <capakey>`

Look up full parcel details by CaPaKey identifier.

```bash
gis-tools capakey lookup "44803C0171/00H000" -g -f geojson
gis-tools capakey lookup "44803C0171/00H000" -f kml
```

| Option | Description | Default |
|---|---|---|
| `-f, --format <fmt>` | `table` \| `json` \| `geojson` \| `wkt` \| `kml` | `table` |
| `-g, --geometry` | Include polygon (auto-enabled for geojson/wkt/kml) | off |

### `buffer <location> <radius>`

Generate a buffer polygon (circle) around an address or coordinates.

```bash
gis-tools buffer "Veldstraat 1, Gent" 1000 -f geojson --crs 4326
gis-tools buffer "104683,193910" 500 -f wkt
gis-tools buffer "Veldstraat 1, Gent" 500 -f kml
```

| Option | Description | Default |
|---|---|---|
| `-f, --format <fmt>` | `geojson` \| `wkt` \| `kml` | `geojson` |
| `--crs <crs>` | Output coordinate system | `31370` |

Returns a single polygon representing the buffer zone. Buffer geometry is calculated in Lambert72 using JSTS.

### `convert <file>`

Convert a GeoJSON file to another format, with optional CRS transform.

```bash
gis-tools convert parcels.geojson -f kml
gis-tools convert parcels.geojson -f wkt
gis-tools convert lambert.geojson -f geojson --crs 4326
```

| Option | Description | Default |
|---|---|---|
| `-f, --format <fmt>` | `geojson` \| `wkt` \| `kml` | `kml` |
| `--crs <crs>` | Transform to target CRS before output | — |

Accepts GeoJSON FeatureCollection, Feature, or bare Geometry as input. KML output auto-transforms to WGS84.

## Output Formats

| Format | Description |
|--------|-------------|
| `table` | Human-readable table (default) |
| `json` | Raw JSON |
| `geojson` | GeoJSON FeatureCollection |
| `wkt` | Well-Known Text (tab-separated with ID) |
| `kml` | KML for Google Earth/Maps (always WGS84) |
| `url` | Google Maps URL per result |

## Key Concepts

- **CaPaKey** — cadastral parcel ID, e.g. `44803C0171/00H000`
- **Lambert72 (EPSG:31370)** — Belgian coordinate system (X ~20k–300k, Y ~150k–250k)
- **WGS84 (EPSG:4326)** — global lat/lon (Belgium: ~lat 49.5–51.5, lon 2.5–6.5)
- KML always uses WGS84 (per KML spec); coordinates are auto-transformed

## APIs

This CLI uses the following public Vlaanderen services:

- **Geolocation API** — `https://geo.api.vlaanderen.be/geolocation` — address geocoding, suggestions, reverse geocoding
- **CaPaKey API v2** — `https://geo.api.vlaanderen.be/capakey/v2` — parcel lookup by coordinates or CaPaKey

## License

MIT
