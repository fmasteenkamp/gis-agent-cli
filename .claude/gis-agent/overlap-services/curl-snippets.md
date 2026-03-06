# Overlap Services Direct cURL Snippets

Base:

`https://gisoverlap-api-ontwikkel.natuurenbos.be`

Optional override:

```bash
export OVERLAP_SERVICE_URL="https://gisoverlap-api-ontwikkel.natuurenbos.be"
```

## 1) Fetch swagger and inspect available paths

```bash
curl -s "${OVERLAP_SERVICE_URL:-https://gisoverlap-api-ontwikkel.natuurenbos.be}/swagger/v1/swagger.json"
```

## 2) Derive normalized endpoint IDs from swagger paths

```bash
node -e "(async()=>{const b=process.env.OVERLAP_SERVICE_URL||'https://gisoverlap-api-ontwikkel.natuurenbos.be';const u=b+'/swagger/v1/swagger.json';const s=await fetch(u).then(r=>r.json());const paths=Object.keys(s.paths||{});for(const p of paths){if(!p.startsWith('/api/v1/')) continue;const id=p.replace(/^\/api\/v1\//,'').replace(/\//g,'_').replace(/-/g,'_');console.log(id+' -> '+p);} })();"
```

## 3) Call one overlap endpoint directly

```bash
curl -s -X POST "${OVERLAP_SERVICE_URL:-https://gisoverlap-api-ontwikkel.natuurenbos.be}/api/v1/beheerregio/intersection/polygon" \
  -H "Content-Type: application/json" \
  -H "X-Username: skill-test@local" \
  -d '{
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[140154.46,162047.59],[141935.63,164152.62],[143392.96,164800.32],[140100.48,166311.62],[139884.58,163289.02],[140154.46,162047.59]]]
    },
    "properties": {}
  }'
```

## 4) Example using a derived path (e.g. habitat_intersection_polygon)

```bash
curl -s -X POST "${OVERLAP_SERVICE_URL:-https://gisoverlap-api-ontwikkel.natuurenbos.be}/api/v1/habitat/intersection/polygon" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[140154.46,162047.59],[141935.63,164152.62],[143392.96,164800.32],[140100.48,166311.62],[139884.58,163289.02],[140154.46,162047.59]]]
    },
    "properties": {}
  }'
```
