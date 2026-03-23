---
name: anb-gis
description: >
  ANB (Agentschap Natuur en Bos) environmental/policy layer overlap analysis and ArcGIS MapServer
  querying for Flanders via the `anb-gis` CLI. Use this skill whenever the user asks about ANB
  environmental overlaps, nature reserves, habitat areas, heritage constraints, zoning, MapServer
  queries, or needs to get GeoJSON for a natuurbeheerplan. Trigger on: ANB, Natuur en Bos,
  beheerplan, beheerregio, boswachterijen, bosgroep, habitat, vogelrichtlijn, VEN, IVON, Ramsar,
  vnr, enr, bosreservaten, sigma, natuurrichtplan, natuurdoelenlaag, ihdzoekzone, PSN, ISN, PAS,
  HAG, erfgoed, beschermdarcheologisch, beschermdmonument, beschermdchlandschap, jachtterrein,
  ruimteboekhouding, gewestplan, BWK, bodemkaart, boswaardering, bwkwaarde, sbp, vegetatiebesluit,
  duinen, historischgrasland, landtuinbouwactiviteit, perceel, gemeente, provincie, mapserver,
  globaalkader, BeheerplanId, ArcGIS, or any ANB/environmental overlap or MapServer query in Flanders.
  Werkt ook in het Nederlands — activeer bij vragen over ANB-lagen, natuurgebieden, habitatrichtlijn,
  vogelrichtlijn, erfgoed, beschermde zones, gewestplan, bosreservaten, overlaps met ANB-data, of
  MapServer-lagen.
---

# `anb-gis` CLI

Run with: `anb-gis` (installed globally).

**Install:** `cd c:\Dev\gis-agent-cli\packages\anb && npm run build && npm link`

## Commands

| Command | Options | Description |
|---------|---------|-------------|
| `overlap [layer] <location> [radius]` | `-f` `--crs` `--list` `--search` `--all` | Check ANB environmental/policy layer overlaps |
| `mapserver fields <layerOrUrl>` | | Show fields for a MapServer layer |
| `mapserver query <layerOrUrl>` | `--where` `--fields` `--no-geometry` `--crs` `-f` | Query features with SQL filter, returns GeoJSON |
| `mapserver plan <beheerplanId>` | `--crs` `-f` | Get GeoJSON for a natuurbeheerplan by ID (shortcut) |
| `mapserver --list` | `--service` | List known MapServer layers (optionally filter by service) |
| `mapserver --search <query>` | `--service` | Search MapServer layers |

## Overlap options

- `[layer]` — overlap layer keyword (use `--list` to see all 53 layers)
- `<location>` — one of: address string (Flemish addresses only), `"x,y"` Lambert72 coords, inline GeoJSON string, or `@file.geojson`
- `[radius]` — buffer radius in meters (default: 50, ignored for GeoJSON input)
- `-f, --format` — output format: `table` (default), `json`
- `--crs <31370|4326>` — coordinate system for coords/GeoJSON input (default: 31370)
- `--list` — list all available overlap layers with keywords and descriptions
- `--search <query>` — search layers by keyword, label, or description
- `--all` — check all overlap layers at once
- GeoJSON input: accepts Feature, FeatureCollection (uses first feature), or bare Geometry
- Validates: type must be Polygon or MultiPolygon, coordinates range, ring closure, JSTS topology
- For address/coords input, creates a buffer polygon; GeoJSON input is sent directly

## Overlap layer categories (use `--list` for full list, `--search` to filter)

| Category | Keywords |
|----------|---------|
| Administrative | gemeente, provincie, beheerregio, boswachterijen, bosgroep, kadpercanb, perceel |
| Nature/conservation | habitat, vogelrichtlijn, ramsar, venivon, vnr, enr, bosreservaten, sigma, ihdzoekzone |
| Policy/planning | beheerplan, natuurrichtplan, natuurdoelenlaag, gewestplan, gewestplan-gemrup, gewestplan-gemrup-cert, pas, sbp, psn-basisidee, psn-projectgebied, psn-projectzone, isn |
| Heritage | erfgoed, erfgoed-archeologie, erfgoed-bouwkundig, erfgoed-tuinen, erfgoed-beplanting, erfgoed-landschap, erfgoed-landschap-beschermd, erfgoed-overgangszones, erfgoed-vastgesteld, beschermdarcheologisch, beschermdmonument, beschermdstaddorpsgezicht, beschermdchlandschap |
| Land use | bwk, bwkwaarde, boswaardering, bodemkaart, historischgrasland, duinen, landtuinbouwactiviteit, hag, vegetatiebesluit |
| Other | jachtterrein, ruimteboekhouding, natuurstreefbeeld |

## MapServer options

- `<layerOrUrl>` — either a registered keyword (e.g. `globaalkader`) or a full ArcGIS REST URL
- `--where <sql>` — ArcGIS SQL where clause (required for `query`)
- `--fields <f1,f2,...>` — comma-separated field names (default: all)
- `--no-geometry` — omit geometry from results
- `--crs <31370|4326>` — output coordinate system (default: 31370)
- `-f, --format` — `geojson` (default) or `json`
- `plan` is a shortcut that queries the `globaalkader` layer by `BeheerplanId`

### Known MapServer layers (use `--list` for full list)

| Keyword | Service | Description | ID Field |
|---------|---------|-------------|----------|
| `globaalkader` | natuurbeheerplannen | Natuurbeheerplan globaal kader polygonen | BeheerplanId |
| `perceel` | natuurbeheerplannen | Natuurbeheerplan percelen (CAPAKEY, gebruiksrechten) | BeheerplanId |
| `printingtools` | utilities | Utilities printing tools (requires token) | — |

New layers can be added to `packages/anb/src/data/mapserver-layers.json`.

## Key Concepts

- **Lambert72 (31370)**: Belgian coordinates — X ~20k-300k, Y ~150k-250k
- **WGS84 (4326)**: lat/lon — Belgium is ~lat 49.5-51.5, lon 2.5-6.5
- **Flemish addresses only** — address input uses Geopunt geocoding, which only covers Flanders. For non-Flemish locations use Lambert72 or WGS84 coordinates directly
- **Overlap API** may be offline outside business hours (weekends/maintenance). If a query times out, do not retry — report that the server is unavailable
- GeoJSON input must be Polygon or MultiPolygon (FeatureCollections and Points are not accepted)
- `--all` runs all 53 layers sequentially — only use if explicitly requested; prefer named layers
- **When saving GeoJSON to a file**, write only the raw JSON — no markdown headers, footers, comments, or code fences. Files passed to `overlap` via `@file.geojson` or piped between commands must be valid GeoJSON, or parsing will fail

## Examples

```bash
anb-gis overlap --list
anb-gis overlap --search habitat
anb-gis overlap --search erfgoed
anb-gis overlap beheerregio "Veldstraat 1, Gent" 100
anb-gis overlap habitat "Brugge" 500 -f json
anb-gis overlap gewestplan "104683,193910" 200
anb-gis overlap erfgoed "Grote Markt, Antwerpen" 100 -f json
anb-gis overlap --all "Veldstraat 1, Gent" 50
anb-gis overlap habitat '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[104600,193800],[104700,193800],[104700,193900],[104600,193900],[104600,193800]]]},"properties":{}}'
anb-gis overlap habitat @parcel.geojson
anb-gis overlap habitat @parcel-wgs84.geojson --crs 4326
anb-gis overlap gemeente "70000,212000"
anb-gis overlap beheerregio "70000,212000" -f json

# MapServer
anb-gis mapserver --list
anb-gis mapserver --list --service natuurbeheerplannen
anb-gis mapserver --list --service utilities
anb-gis mapserver fields globaalkader
anb-gis mapserver fields https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/.../MapServer/5
anb-gis mapserver query globaalkader --where "BeheerplanId='abc-123'"
anb-gis mapserver query globaalkader --where "Procesfase='Goedgekeurd'" --fields "Registratienummer,NaamNatuurbeheerplan" --crs 4326
anb-gis mapserver plan abc-123
anb-gis mapserver plan abc-123 --crs 4326 -f json
```
