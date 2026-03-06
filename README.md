# gis-agent-cli

Flemish GIS utilities CLI — query CaPaKey parcel data from the Vlaanderen APIs.

## Install

```bash
npm install
npm run build
```

Requires Node.js >= 18.

## Usage

```bash
gis-tools <command> [options]
```

### `address search <address>`

Search for a cadastral parcel by address. Geocodes the address via the Vlaanderen Geolocation API, then looks up the matching parcel via the CaPaKey API.

```bash
gis-tools address search "Korenmarkt 1, Gent"
gis-tools address search "Termurenlaan 14, Aalst" -r 3
gis-tools address search "Grote Markt 1, Brussel" -f json
```

| Option | Description | Default |
|---|---|---|
| `-r, --results <number>` | Number of results to return (1–5) | `1` |
| `-f, --format <format>` | Output format: `table` or `json` | `table` |

### `capakey lookup <capakey>`

Look up full parcel details by CaPaKey identifier. Returns municipality, department, section, perceelnummer, grondnummer, and associated addresses.

```bash
gis-tools capakey lookup "41342B0558/00V000"
gis-tools capakey lookup "44803C0346/00E000" -f json
gis-tools capakey lookup "41342B0558/00V000" -g
gis-tools capakey lookup "41342B0558/00V000" -f geojson
gis-tools capakey lookup "41342B0558/00V000" -f wkt
```

| Option | Description | Default |
|---|---|---|
| `-f, --format <format>` | Output format: `table`, `json`, `geojson`, or `wkt` | `table` |
| `-g, --geometry` | Include GeoJSON geometry in output (auto-enabled for `geojson`/`wkt`) | off |

## APIs

This CLI uses the following public Vlaanderen services:

- **Geolocation API** — `https://geo.api.vlaanderen.be/geolocation` — address geocoding
- **CaPaKey API v2** — `https://geo.api.vlaanderen.be/capakey/v2` — parcel lookup by coordinates or CaPaKey

## License

MIT
