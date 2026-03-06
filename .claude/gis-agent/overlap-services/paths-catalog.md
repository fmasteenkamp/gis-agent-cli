# Overlap Paths Catalog

This file is a working catalog of overlap endpoints, with a keyword and practical use summary.

## Base Settings

- Active overlap base URL: `https://gisoverlap-api-ontwikkel.natuurenbos.be`
- Active swagger URL: `https://gisoverlap-api-ontwikkel.natuurenbos.be/swagger/v1/swagger.json`
- Coordinate system: `EPSG:31370` (Lambert72)
- Request body type: GeoJSON `Feature`

## Summary Table

| Overlap Group | Keyword | What it is used for | Section |
|---|---|---|---|
| Beheerplan | `beheerplan` | Check management plan applicability for a parcel/geometry | [beheerplan](#beheerplan) |
| Beheerregio | `beheerregio` | Identify ANB management region for responsibility routing | [beheerregio](#beheerregio) |
| Boswachterijen | `boswachterijen` | Find forest ranger district and operational contact zone | [boswachterijen](#boswachterijen) |
| Bosgroep | `bosgroep` | Determine relevant forest group support area | [bosgroep](#bosgroep) |
| Kad. perceel ANB | `kadpercanb` | Check ANB-owned/managed cadastral parcels | [kadpercanb](#kadpercanb) |
| Perceel | `perceel` | Generic parcel overlap checks against overlap API parcel layer | [perceel](#perceel) |
| Gemeente | `gemeente` | Determine municipality for reporting/routing | [gemeente](#gemeente) |
| Provincie | `provincie` | Determine province for reporting/routing | [provincie](#provincie) |
| Habitat | `habitat` | Check habitat area intersection for conservation constraints | [habitat](#habitat) |
| Vogelrichtlijn | `vogelrichtlijn` | Check bird directive area constraints | [vogelrichtlijn](#vogelrichtlijn) |
| Ramsar | `ramsar` | Check Ramsar wetland overlaps for international protection context | [ramsar](#ramsar) |
| VEN/IVON | `venivon` | Check VEN/IVON area designation constraints | [venivon](#venivon) |
| Vlaamse Natuurreservaten | `vnr` | Check overlap with Vlaamse natuurreservaten | [vnr](#vnr) |
| Erkenning NatuurReservaten | `enr` | Check recognized nature reserve overlap | [enr](#enr) |
| Bosreservaten | `bosreservaten` | Check overlap with forest reserves | [bosreservaten](#bosreservaten) |
| Natuurdoelenlaag | `natuurdoelenlaag` | Assess nature objective layer relevance | [natuurdoelenlaag](#natuurdoelenlaag) |
| Natuurdoelen Sigmaplan | `sigma` | Check Sigma plan nature objective overlaps | [sigma](#sigma) |
| Natuurrichtplan | `natuurrichtplan` | Check whether area falls in nature policy plan zones | [natuurrichtplan](#natuurrichtplan) |
| Natuurstreefbeelden | `natuurstreefbeeld` | Check target nature scenario overlap | [natuurstreefbeeld](#natuurstreefbeeld) |
| IHD zoekzone | `ihdzoekzone` | Check habitat directive search zones | [ihdzoekzone](#ihdzoekzone) |
| PSN | `psn` | Check PSN basisidee/projectgebied/projectzone participation | [psn](#psn) |
| ISN PSN historisch | `isn` | Check historical ISN/PSN overlays | [isn](#isn) |
| PAS | `pas` | Check nitrogen policy overlay relevance | [pas](#pas) |
| HAG | `hag` | Check reaffirmed agricultural area constraints | [hag](#hag) |
| Land/Tuinbouw Activiteit | `landtuinbouwactiviteit` | Check agricultural activity zoning overlaps | [landtuinbouwactiviteit](#landtuinbouwactiviteit) |
| Historisch Grasland | `historischgrasland` | Check historic permanent grassland restrictions | [historischgrasland](#historischgrasland) |
| Duinen | `duinen` | Check protected dune decree areas | [duinen](#duinen) |
| Bodemkaart | `bodemkaart` | Soil map overlap for land capability/context | [bodemkaart](#bodemkaart) |
| BWK | `bwk` | Biological valuation map overlap | [bwk](#bwk) |
| BWK Waarde | `bwkwaarde` | Valuable areas in BWK for sensitivity screening | [bwkwaarde](#bwkwaarde) |
| Boswaardering | `boswaardering` | Forest valuation overlap for management decisions | [boswaardering](#boswaardering) |
| Erfgoed (main + sublayers) | `erfgoed` | Heritage constraints including archeology/landscape/inventories | [erfgoed](#erfgoed) |
| Beschermd archeologisch | `beschermdarcheologisch` | Protected archeological sites overlap | [beschermdarcheologisch](#beschermdarcheologisch) |
| Beschermd monument | `beschermdmonument` | Protected monument overlap | [beschermdmonument](#beschermdmonument) |
| Beschermd stad/dorp | `beschermdstaddorpsgezicht` | Protected townscape/village-view overlap | [beschermdstaddorpsgezicht](#beschermdstaddorpsgezicht) |
| Beschermd cultuurhistorisch landschap | `beschermdchlandschap` | Protected cultural-historical landscape overlap | [beschermdchlandschap](#beschermdchlandschap) |
| Jachtterrein | `jachtterrein` | Hunting area checks for local operational context | [jachtterrein](#jachtterrein) |
| Ruimteboekhouding | `ruimteboekhouding` | Spatial accounting/planning context checks | [ruimteboekhouding](#ruimteboekhouding) |
| Gewestplan | `gewestplan` | Zoning/planning checks incl. gemrup variants | [gewestplan](#gewestplan) |
| SBP | `sbp` | Species protection program overlap | [sbp](#sbp) |
| Vegetatiebesluit | `vegetatiebesluit` | Vegetation decree constraint checks | [vegetatiebesluit](#vegetatiebesluit) |

## Endpoint Sections

### beheerplan
- Keyword: `beheerplan`
- Use: management plan applicability checks for permit and execution context.
- Path: `/api/v1/beheerplan/intersection/polygon`

### beheerregio
- Keyword: `beheerregio`
- Use: determine which ANB region manages a location.
- Path: `/api/v1/beheerregio/intersection/polygon`

### boswachterijen
- Keyword: `boswachterijen`
- Use: identify forest ranger district for operational assignment.
- Path: `/api/v1/boswachterijen/intersection/polygon`

### bosgroep
- Keyword: `bosgroep`
- Use: map parcel to forest group support/coordination context.
- Path: `/api/v1/bosgroep/intersection/polygon`

### kadpercanb
- Keyword: `kadpercanb`
- Use: check if parcel intersects ANB cadastral holdings.
- Path: `/api/v1/kadpercanb/intersection/polygon`

### perceel
- Keyword: `perceel`
- Use: generic parcel-related overlap checks where API layer uses parcel abstraction.
- Path: `/api/v1/perceel/intersection/polygon`

### gemeente
- Keyword: `gemeente`
- Use: administrative municipality attribution.
- Path: `/api/v1/gemeente/intersection/polygon`

### provincie
- Keyword: `provincie`
- Use: administrative province attribution.
- Path: `/api/v1/provincie/intersection/polygon`

### habitat
- Keyword: `habitat`
- Use: habitat conservation screening for ecological constraints.
- Path: `/api/v1/habitat/intersection/polygon`

### vogelrichtlijn
- Keyword: `vogelrichtlijn`
- Use: bird directive area screening for compliance checks.
- Path: `/api/v1/vogelrichtlijn/intersection/polygon`

### ramsar
- Keyword: `ramsar`
- Use: wetland protection screening under Ramsar designations.
- Path: `/api/v1/ramsar/intersection/polygon`

### venivon
- Keyword: `venivon`
- Use: VEN/IVON area designation checks.
- Path: `/api/v1/venivon/intersection/polygon`

### vnr
- Keyword: `vnr`
- Use: overlap with Vlaamse natuurreservaten.
- Path: `/api/v1/vnr/intersection/polygon`

### enr
- Keyword: `enr`
- Use: overlap with recognized nature reserves.
- Path: `/api/v1/enr/intersection/polygon`

### bosreservaten
- Keyword: `bosreservaten`
- Use: forest reserve protection checks.
- Path: `/api/v1/bosreservaten/intersection/polygon`

### natuurdoelenlaag
- Keyword: `natuurdoelenlaag`
- Use: nature objective layer screening.
- Path: `/api/v1/natuurdoelenlaag/intersection/polygon`

### sigma
- Keyword: `sigma`
- Use: Sigma plan nature objective overlap checks.
- Path: `/api/v1/sigma/intersection/polygon`

### natuurrichtplan
- Keyword: `natuurrichtplan`
- Use: nature policy planning context checks.
- Path: `/api/v1/natuurrichtplan/intersection/polygon`

### natuurstreefbeeld
- Keyword: `natuurstreefbeeld`
- Use: target-state nature planning overlap checks.
- Path: `/api/v1/natuurstreefbeeld/intersection/polygon`

### ihdzoekzone
- Keyword: `ihdzoekzone`
- Use: habitat directive search zone checks.
- Path: `/api/v1/ihdzoekzone/intersection/polygon`

### psn
- Keyword: `psn`
- Use: PSN project scope checks by phase/type.
- Paths:
  - `/api/v1/psn/intersection/polygon/basisidee`
  - `/api/v1/psn/intersection/polygon/projectgebied`
  - `/api/v1/psn/intersection/polygon/projectzone`

### isn
- Keyword: `isn`
- Use: historical ISN/PSN overlap checks.
- Path: `/api/v1/isn/intersection/polygon`

### pas
- Keyword: `pas`
- Use: nitrogen program (PAS) policy overlap screening.
- Path: `/api/v1/pas/intersection/polygon`

### hag
- Keyword: `hag`
- Use: reaffirmed agricultural area checks.
- Path: `/api/v1/hag/intersection/polygon`

### landtuinbouwactiviteit
- Keyword: `landtuinbouwactiviteit`
- Use: agricultural activity zone checks.
- Path: `/api/v1/landtuinbouwactiviteit/intersection/polygon`

### historischgrasland
- Keyword: `historischgrasland`
- Use: historical permanent grassland restriction checks.
- Path: `/api/v1/historischgrasland/intersection/polygon`

### duinen
- Keyword: `duinen`
- Use: dune decree protected area screening.
- Path: `/api/v1/duinen/intersection/polygon`

### bodemkaart
- Keyword: `bodemkaart`
- Use: soil context for environmental/agricultural assessment.
- Path: `/api/v1/bodemkaart/intersection/polygon`

### bwk
- Keyword: `bwk`
- Use: biological valuation map checks.
- Path: `/api/v1/bwk/intersection/polygon`

### bwkwaarde
- Keyword: `bwkwaarde`
- Use: identify valuable biological valuation areas.
- Path: `/api/v1/bwkwaarde/intersection/polygon`

### boswaardering
- Keyword: `boswaardering`
- Use: forest valuation overlay checks.
- Path: `/api/v1/boswaardering/intersection/polygon`

### erfgoed
- Keyword: `erfgoed`
- Use: umbrella heritage checks and targeted heritage sublayer checks.
- Paths:
  - `/api/v1/erfgoed/intersection/polygon`
  - `/api/v1/erfgoed/intersection/polygon/archeologische-zones`
  - `/api/v1/erfgoed/intersection/polygon/inventaris-bouwkundig`
  - `/api/v1/erfgoed/intersection/polygon/inventaris-historische-tuinen-parken`
  - `/api/v1/erfgoed/intersection/polygon/inventaris-houtig-beplanting`
  - `/api/v1/erfgoed/intersection/polygon/inventaris-landschaps-atlasrelicten`
  - `/api/v1/erfgoed/intersection/polygon/landschap`
  - `/api/v1/erfgoed/intersection/polygon/overgangszones`
  - `/api/v1/erfgoed/intersection/polygon/vastgesteld-landschappelijk`

### beschermdarcheologisch
- Keyword: `beschermdarcheologisch`
- Use: protected archaeological site checks (non-erfgoed grouped endpoint).
- Path: `/api/v1/beschermdarcheologisch/intersection/polygon`

### beschermdmonument
- Keyword: `beschermdmonument`
- Use: protected monument overlap checks.
- Path: `/api/v1/beschermdmonument/intersection/polygon`

### beschermdstaddorpsgezicht
- Keyword: `beschermdstaddorpsgezicht`
- Use: protected city/village view overlap checks.
- Path: `/api/v1/beschermdstaddorpsgezicht/intersection/polygon`

### beschermdchlandschap
- Keyword: `beschermdchlandschap`
- Use: protected cultural-historical landscape checks.
- Path: `/api/v1/beschermdchlandschap/intersection/polygon`

### jachtterrein
- Keyword: `jachtterrein`
- Use: hunting area context checks.
- Path: `/api/v1/jachtterrein/intersection/polygon`

### ruimteboekhouding
- Keyword: `ruimteboekhouding`
- Use: spatial accounting context checks.
- Path: `/api/v1/ruimteboekhouding/intersection/polygon`

### gewestplan
- Keyword: `gewestplan`
- Use: zoning/planning checks including GEMRUP and certificate variant endpoints.
- Paths:
  - `/api/v1/gewestplan/intersection/polygon`
  - `/api/v1/gewestplan/intersection/polygon/gemrup`
  - `/api/v1/gewestplan/intersection/polygon/gemrupwithcertificate`

### sbp
- Keyword: `sbp`
- Use: species protection program overlap checks.
- Path: `/api/v1/sbp/intersection/polygon`

### vegetatiebesluit
- Keyword: `vegetatiebesluit`
- Use: vegetation decree policy constraint checks.
- Path: `/api/v1/vegetatiebesluit/intersection/polygon`

## Normalization Rule (Path -> Endpoint ID)

Use this normalization rule:

1. Remove `/api/v1/`
2. Replace `/` with `_`
3. Replace `-` with `_`

Example:

- Path: `/api/v1/beheerregio/intersection/polygon`
- Endpoint ID: `beheerregio_intersection_polygon`
