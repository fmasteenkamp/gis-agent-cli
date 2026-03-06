# Capakey Lookup Direct cURL Snippets

These calls use upstream APIs directly.

## 1) Address lookup (Geolocation API)

```bash
curl -s "https://geo.api.vlaanderen.be/geolocation/location?q=Korenmarkt%201%20Gent&type=Housenumber&c=5"
```

Expected key output fields:

- `LocationResult[].FormattedAddress`
- `LocationResult[].Location.X_Lambert72`
- `LocationResult[].Location.Y_Lambert72`

## 2) Parcel lookup by Lambert72 coordinates

```bash
curl -s "https://geo.api.vlaanderen.be/capakey/v2/parcel?x=104672.16&y=194105.82&buffer=10&geometry=full&srs=31370"
```

Expected key output fields:

- `capakey`
- `geometry.shape` (stringified GeoJSON)

## 3) Parcel lookup by Capakey

Note: URL-encode the slash in capakey as `%2F`.

```bash
curl -s "https://geo.api.vlaanderen.be/capakey/v2/parcel/41042C1030%2F00A000?geometry=full&srs=31370&data=adp&status=actual"
```

Expected key output fields:

- `municipalityName`
- `sectionCode`
- `perceelnummer`
- `geometry.shape` (stringified GeoJSON)

## 4) Derive extent with buffer (quick Node one-liner)

```bash
node -e "(async()=>{const r=await fetch('https://geo.api.vlaanderen.be/capakey/v2/parcel/41042C1030%2F00A000?geometry=full&srs=31370&data=adp&status=actual');const d=await r.json();const g=JSON.parse(d.geometry.shape);const ring=(g.coordinates[0]||[]);const xs=ring.map(p=>p[0]);const ys=ring.map(p=>p[1]);const b=750;console.log(JSON.stringify({xmin:Math.min(...xs)-b,ymin:Math.min(...ys)-b,xmax:Math.max(...xs)+b,ymax:Math.max(...ys)+b},null,2));})();"
```
