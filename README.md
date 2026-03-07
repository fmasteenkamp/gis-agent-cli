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

### `nearby <layer> <location> [radius]`

Find features from Flemish WFS services near an address or coordinates.

```bash
gis-tools nearby haltes "Veldstraat 1, Gent" 500
gis-tools nearby jacht "Korenlei 1, Gent" 5000 -f json
gis-tools nearby bos "Brugge" 3000 -f geojson --crs 4326
gis-tools nearby haltes "104683,193910" 300 -f kml
gis-tools nearby landgebruik "Veldstraat 1, Gent" 200 --year 1778
gis-tools nearby landgebruik "Grote Markt, Antwerpen" 500 --year 1969 -f json
```

| Option | Description | Default |
|---|---|---|
| `<layer>` | WFS layer to query (see below) | — |
| `[radius]` | Search radius in meters | `500` |
| `-f, --format <fmt>` | `table` \| `json` \| `geojson` \| `kml` | `table` |
| `-n, --max <n>` | Max features to return | `50` |
| `--crs <crs>` | Coordinate system | `31370` |
| `--year <year>` | Year variant (for layers with historical data) | — |

**Available layers:**

| Layer | Description | `--year` |
|-------|-------------|----------|
| `haltes` | De Lijn bus/tram/belbus stops | — |
| `bos` | Forest areas (Bosreferentielaag 2000) | — |
| `jacht` | Hunting grounds (Jachtterreinen) | — |
| `landbouw` | Agricultural parcels with crop data | — |
| `landgebruik` | Historical land use | `1778`, `1873`, `1969` |

### `overlap [layer] <location> [radius]`

Check overlap with ANB (Agentschap Natuur en Bos) environmental and policy layers. Creates a buffer polygon around a location and checks for intersections.

```bash
gis-tools overlap --list                                    # list all 53 layers
gis-tools overlap --search habitat                          # search layers by keyword
gis-tools overlap beheerregio "Veldstraat 1, Gent" 100      # check single layer
gis-tools overlap habitat "Brugge" 500 -f json              # JSON output
gis-tools overlap gewestplan "104683,193910" 200             # coordinates input
gis-tools overlap erfgoed "Grote Markt, Antwerpen" 100      # heritage check
gis-tools overlap --all "Veldstraat 1, Gent" 50             # check ALL layers
```

| Option | Description | Default |
|---|---|---|
| `[layer]` | Layer keyword (use `--list` to see all) | — |
| `[radius]` | Buffer radius in meters | `50` |
| `-f, --format <fmt>` | `table` \| `json` | `table` |
| `--crs <crs>` | Input coordinate system | `31370` |
| `--list` | List all available overlap layers | — |
| `--search <query>` | Search layers by keyword/description | — |
| `--all` | Check all overlap layers at once | — |

**Layer categories** (53 total — use `--list` for full list):

| Category | Keywords |
|---|---|
| Administrative | `gemeente`, `provincie`, `beheerregio`, `boswachterijen`, `bosgroep` |
| Nature/conservation | `habitat`, `vogelrichtlijn`, `ramsar`, `venivon`, `vnr`, `enr`, `bosreservaten`, `sigma` |
| Policy/planning | `beheerplan`, `natuurrichtplan`, `natuurdoelenlaag`, `gewestplan`, `pas`, `sbp` |
| Heritage | `erfgoed`, `beschermdarcheologisch`, `beschermdmonument`, `beschermdchlandschap` |
| Land use | `bwk`, `bwkwaarde`, `boswaardering`, `bodemkaart`, `historischgrasland`, `duinen` |

### `distance <locationA> <locationB>`

Calculate the minimum distance between two locations or geometries (closest point to closest point).

```bash
gis-tools distance "Veldstraat 1, Gent" "Korenmarkt 1, Gent"
gis-tools distance "Gent" "Brugge" -f json
gis-tools distance "104683,193910" "105000,194000"
gis-tools distance @poly1.geojson @poly2.geojson
gis-tools distance "Veldstraat 1, Gent" @area.geojson
```

| Option | Description | Default |
|---|---|---|
| `-f, --format <fmt>` | `text` \| `json` | `text` |
| `--crs <crs>` | Input coordinate system | `31370` |

Each location can be an address, `"x,y"` coordinates, inline GeoJSON string, or `@file.geojson`. Distance is calculated in Lambert72 using JSTS DistanceOp (result in meters). Output includes nearest points in both Lambert72 and WGS84.

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
- **De Lijn Haltes WFS** — `https://geo.api.vlaanderen.be/Haltes/wfs` — public transit stop locations
- **Bosref WFS** — `https://geo.api.vlaanderen.be/Bosref/wfs` — forest reference data
- **Jacht WFS** — `https://geo.api.vlaanderen.be/Jacht/wfs` — hunting ground boundaries
- **Landbgebrperc WFS** — `https://geo.api.vlaanderen.be/Landbgebrperc/wfs` — agricultural parcels and crop data
- **HistLandgebruik WFS** — `https://geo.api.vlaanderen.be/HistLandgebruik/wfs` — historical land use (1778, 1873, 1969)
- **ANB Overlap API** — `https://gisoverlap-api-ontwikkel.natuurenbos.be` — environmental/policy layer intersection checks (53 layers)

## License

MIT
