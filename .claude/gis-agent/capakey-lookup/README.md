# Capakey Lookup

Use the `gis-tools` CLI for address and parcel workflows.

## Commands

- `gis-tools address search <address>` — find parcel by address
- `gis-tools capakey lookup <capakey>` — get parcel details by CaPaKey

## Typical Flow: Address → WKT

```bash
# 1. Search with multiple results
gis-tools address search "Korenmarkt 1, Gent" -r 5 -f json

# 2. Pick the capakey from the chosen result, then get WKT
gis-tools capakey lookup "44803C0346/00E000" -f wkt
```

## Multiple Results

When `address search` returns multiple matches (`-r 2..5`):
- Present a **numbered list** showing FormattedAddress and CaPaKey.
- **Ask the user to pick one** before continuing to lookup/overlap/print steps.
- Never auto-select — always confirm.

## Output Formats

| Flag | Description |
|---|---|
| `-f table` | Human-readable (default) |
| `-f json` | Raw JSON |
| `-f geojson` | GeoJSON Feature (lookup only, auto-includes geometry) |
| `-f wkt` | WKT string (lookup only, auto-includes geometry) |
| `-g` | Include geometry in table/json output (lookup only) |

## Fallback

If the CLI is unavailable, use direct API calls — see `curl-snippets.md` and `js-snippets.md`.
