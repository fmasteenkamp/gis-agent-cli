---
name: dossiers
description: >
  Dossiers CLI for querying the ANB (Agentschap Natuur en Bos) natuurbeheerplan backoffice API.
  Use this skill when the user asks about natuurbeheerplannen, dossiers, status changes, notities,
  or needs to interact with the ANB backoffice. Requires a JWT token via --token or DOSSIERS_TOKEN
  env var. Trigger on: natuurbeheerplan, NBP, dossier, backoffice, beheerplan opvragen, status
  wijzigen, notitie, behandelaar, begunstigde, or any request to query/update ANB dossier data.
---

# `dossiers` CLI

Run with: `dossiers` (installed globally).

**Install:** `cd c:\Dev\gis-agent-cli\packages\dossiers && npm run build && npm link`

## Authentication

JWT token required for all commands. Provide via flag or env var:

```bash
dossiers --token <jwt> <command>
# or
export DOSSIERS_TOKEN=<jwt>
dossiers <command>
```

## Commands

| Command | Description |
|---------|-------------|
| `nbp me` | Show current authenticated user |
| `nbp list` | List all natuurbeheerplannen |
| `nbp get <uuid>` | Get a plan by UUID |
| `nbp dossier nummer <nummer>` | Get dossier by dossier number |
| `nbp dossier id <id>` | Get dossier by numeric ID |
| `nbp status history <planId>` | Status history for a plan |
| `nbp status actions <planId>` | Possible status transitions for a plan |
| `nbp status set <planId> <toStatus>` | Change status of a plan |
| `nbp notitie list <referentieId>` | List notities for a reference |
| `nbp notitie add <referentieId> --tekst <text>` | Add a notitie |

`natuurbeheerplan` can be abbreviated as `nbp`.

## Options

- `--token <jwt>` — JWT bearer token (global, before subcommand)
- `-f, --format <format>` — `table` (default) or `json`

## Key Concepts

- **UUID**: plan IDs are UUIDs, e.g. `3fa85f64-5717-4562-b3fc-2c963f66afa6`
- **Dossier nummer**: human-readable dossier reference, e.g. `NBP-2024-001`
- **referentieId**: used to scope notities to a specific entity
- **toStatus**: status string as defined by the API — use `nbp status actions <planId>` to see valid transitions before calling `status set`
- Token can be set once via `DOSSIERS_TOKEN` env var to avoid repeating `--token` on every call

## Examples

```bash
export DOSSIERS_TOKEN=<jwt>

dossiers nbp me
dossiers nbp list
dossiers nbp list -f json
dossiers nbp get 3fa85f64-5717-4562-b3fc-2c963f66afa6
dossiers nbp dossier nummer NBP-2024-001
dossiers nbp dossier id 42
dossiers nbp status history 3fa85f64-5717-4562-b3fc-2c963f66afa6
dossiers nbp status actions 3fa85f64-5717-4562-b3fc-2c963f66afa6
dossiers nbp status set 3fa85f64-5717-4562-b3fc-2c963f66afa6 Goedgekeurd
dossiers nbp notitie list 3fa85f64-5717-4562-b3fc-2c963f66afa6
dossiers nbp notitie add 3fa85f64-5717-4562-b3fc-2c963f66afa6 --tekst "Dossier nagekeken"

# inline token
dossiers --token eyJ... nbp list -f json
```
