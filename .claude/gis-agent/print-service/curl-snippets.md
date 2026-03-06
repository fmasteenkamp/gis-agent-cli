# Print Service Direct cURL Snippets

Base print endpoint:

`https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute`

## 1) Generate image for a simple extent

```bash
curl -s -X POST "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode 'f=json' \
  --data-urlencode 'Format=JPG' \
  --data-urlencode 'Layout_Template=MAP_ONLY' \
  --data-urlencode 'Web_Map_as_JSON={"mapOptions":{"extent":{"xmin":149250,"ymin":169250,"xmax":151750,"ymax":171750,"spatialReference":{"wkid":31370}},"spatialReference":{"wkid":31370}},"operationalLayers":[],"baseMap":{"baseMapLayers":[{"url":"https://geo.api.vlaanderen.be/GRB-basiskaart-grijs/wms","type":"WMS","version":"1.0.0","format":"JPG","opacity":1}]},"exportOptions":{"dpi":150,"outputSize":[1000,750]}}'
```

## 2) Generate image with PAS layer and highlighted polygon

```bash
curl -s -X POST "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode 'f=json' \
  --data-urlencode 'Format=JPG' \
  --data-urlencode 'Layout_Template=MAP_ONLY' \
  --data-urlencode 'Web_Map_as_JSON={"mapOptions":{"extent":{"xmin":149250,"ymin":169250,"xmax":151750,"ymax":171750,"spatialReference":{"wkid":31370}},"spatialReference":{"wkid":31370}},"operationalLayers":[{"url":"https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/PAS/ProgrammatischeAanpakStikstof/MapServer/2","opacity":0.7,"visibleLayers":["2"]},{"id":"lot_highlight","title":"Target Parcel","opacity":0.95,"featureCollection":{"layers":[{"layerDefinition":{"geometryType":"esriGeometryPolygon","drawingInfo":{"renderer":{"type":"simple","symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[255,255,0,120],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[255,0,0,255],"width":2}}}}},"featureSet":{"geometryType":"esriGeometryPolygon","features":[{"geometry":{"rings":[[[150000,170000],[151000,170000],[151000,171000],[150000,171000],[150000,170000]]],"spatialReference":{"wkid":31370}}}]}}]}}],"baseMap":{"baseMapLayers":[{"url":"https://geo.api.vlaanderen.be/GRB-basiskaart-grijs/wms","type":"WMS","version":"1.0.0","format":"JPG","opacity":1}]},"exportOptions":{"dpi":150,"outputSize":[1000,750]}}'
```
