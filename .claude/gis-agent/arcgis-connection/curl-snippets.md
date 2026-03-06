# ArcGIS Connection Direct cURL Snippets

Base:

`https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services`

## 1) List top-level services (catalog)

```bash
curl -s "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services?f=pjson"
```

## 2) List layers of one MapServer

```bash
curl -s "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/KapMachtiging/KapmachtigingLokatie/MapServer?f=pjson"
```

## 3) Spatial query with ESRI geometry (Lambert72)

```bash
curl -s -X POST "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/KapMachtiging/KapmachtigingLokatie/MapServer/0/query" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode 'f=json' \
  --data-urlencode 'where=1=1' \
  --data-urlencode 'outFields=*' \
  --data-urlencode 'returnGeometry=true' \
  --data-urlencode 'spatialRel=esriSpatialRelIntersects' \
  --data-urlencode 'inSR=31370' \
  --data-urlencode 'outSR=31370' \
  --data-urlencode 'geometryType=esriGeometryPolygon' \
  --data-urlencode 'geometry={"rings":[[[150000,170000],[151000,170000],[151000,171000],[150000,171000],[150000,170000]]],"spatialReference":{"wkid":31370}}'
```
