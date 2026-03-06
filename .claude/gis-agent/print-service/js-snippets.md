# Print Service Direct JavaScript Snippets

```js
const CAPAKEY_BASE = "https://geo.api.vlaanderen.be/capakey/v2";
const PRINT_URL = process.env.ARCGIS_PRINT_URL || "https://gis-ontwikkel.natuurenbos.be/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute";

async function getParcelByCapakey(capakey) {
  const url = new URL(`${CAPAKEY_BASE}/parcel/${encodeURIComponent(capakey)}`);
  url.searchParams.set("geometry", "full");
  url.searchParams.set("srs", "31370");
  url.searchParams.set("data", "adp");
  url.searchParams.set("status", "actual");

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Capakey lookup failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function computeExtentFromShape(shapeString, buffer = 750) {
  const shape = JSON.parse(shapeString);
  const ring = shape.coordinates?.[0] || [];
  if (ring.length === 0) {
    throw new Error("No polygon ring in parcel shape");
  }
  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);
  return {
    xmin: Math.min(...xs) - buffer,
    ymin: Math.min(...ys) - buffer,
    xmax: Math.max(...xs) + buffer,
    ymax: Math.max(...ys) + buffer,
    spatialReference: { wkid: 31370 }
  };
}

async function exportMap(webMap) {
  const form = new URLSearchParams();
  form.set("f", "json");
  form.set("Format", "JPG");
  form.set("Layout_Template", "MAP_ONLY");
  form.set("Web_Map_as_JSON", JSON.stringify(webMap));

  const response = await fetch(PRINT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form
  });

  if (!response.ok) {
    throw new Error(`Print export failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function run() {
  const parcel = await getParcelByCapakey("41042C1030/00A000");
  const extent = computeExtentFromShape(parcel.geometry.shape, 750);

  const webMap = {
    mapOptions: {
      extent,
      spatialReference: { wkid: 31370 }
    },
    operationalLayers: [],
    baseMap: {
      baseMapLayers: [
        {
          url: "https://geo.api.vlaanderen.be/GRB-basiskaart-grijs/wms",
          type: "WMS",
          version: "1.0.0",
          format: "JPG",
          opacity: 1
        }
      ]
    },
    exportOptions: {
      dpi: 150,
      outputSize: [1000, 750]
    }
  };

  const result = await exportMap(webMap);
  console.log(result);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```
