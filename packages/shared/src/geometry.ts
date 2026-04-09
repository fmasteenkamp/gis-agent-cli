import GeometryFactory from 'jsts/org/locationtech/jts/geom/GeometryFactory.js';
import Coordinate from 'jsts/org/locationtech/jts/geom/Coordinate.js';
import BufferOp from 'jsts/org/locationtech/jts/operation/buffer/BufferOp.js';
import WKTReader from 'jsts/org/locationtech/jts/io/WKTReader.js';
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js';
import proj4 from 'proj4';

type Coord = [number, number];
type Ring = Coord[];

const factory = new GeometryFactory();

const LAMBERT72 = '+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs';

proj4.defs('EPSG:31370', LAMBERT72);

// --- Coordinate transforms ---

export function lambert72ToWgs84(x: number, y: number): Coord {
  const [lon, lat] = proj4('EPSG:31370', 'EPSG:4326', [x, y]);
  return [lon, lat];
}

export function wgs84ToLambert72(lon: number, lat: number): Coord {
  return proj4('EPSG:4326', 'EPSG:31370', [lon, lat]) as Coord;
}

export function transformCoords(coords: number[], fromCrs: string, toCrs: string): number[] {
  return proj4(fromCrs, toCrs, coords);
}

/**
 * Transform a GeoJSON geometry from Lambert72 to WGS84 (or vice versa).
 */
export function transformGeometry(geojson: unknown, toCrs: 'EPSG:4326' | 'EPSG:31370'): unknown {
  const fromCrs = toCrs === 'EPSG:4326' ? 'EPSG:31370' : 'EPSG:4326';
  const g = geojson as { type: string; coordinates: unknown; crs?: unknown };
  if (!g?.type || !g?.coordinates) return geojson;

  const transformPoint = (c: number[]): number[] => proj4(fromCrs, toCrs, [c[0], c[1]]);

  const transformed = JSON.parse(JSON.stringify(g));
  delete transformed.crs; // remove CRS link after transform

  switch (g.type) {
    case 'Point':
      transformed.coordinates = transformPoint(g.coordinates as number[]);
      break;
    case 'Polygon':
      transformed.coordinates = (g.coordinates as number[][][]).map(ring =>
        ring.map(transformPoint)
      );
      break;
    case 'MultiPolygon':
      transformed.coordinates = (g.coordinates as number[][][][]).map(poly =>
        poly.map(ring => ring.map(transformPoint))
      );
      break;
    case 'LineString':
      transformed.coordinates = (g.coordinates as number[][]).map(transformPoint);
      break;
    case 'MultiLineString':
      transformed.coordinates = (g.coordinates as number[][][]).map(line =>
        line.map(transformPoint)
      );
      break;
    case 'MultiPoint':
      transformed.coordinates = (g.coordinates as number[][]).map(transformPoint);
      break;
  }

  return transformed;
}

/**
 * Transform all geometries in a GeoJSON FeatureCollection.
 */
export function transformFeatureCollection(fc: unknown, toCrs: 'EPSG:4326' | 'EPSG:31370'): unknown {
  const collection = fc as { type: string; features: { geometry: unknown; [k: string]: unknown }[] };
  return {
    ...collection,
    features: collection.features.map(f => ({
      ...f,
      geometry: transformGeometry(f.geometry, toCrs),
    })),
  };
}

// --- Buffer ---

export function createBufferPolygon(
  x: number, y: number, radiusMeters: number,
): { type: string; coordinates: number[][][] } {
  const point = factory.createPoint(new Coordinate(x, y));
  const buffered = BufferOp.bufferOp(point, radiusMeters, 64);
  const coords: Coord[] = buffered.getCoordinates().map((c: { x: number; y: number }) => [c.x, c.y]);
  return { type: 'Polygon', coordinates: [coords] };
}

// --- WKT ---

export function toWkt(geojson: unknown): string {
  const g = geojson as { type: string; coordinates: unknown };
  if (!g?.type || !g?.coordinates) throw new Error('Invalid GeoJSON geometry');

  switch (g.type) {
    case 'Point': {
      const [x, y] = g.coordinates as Coord;
      return `POINT (${x} ${y})`;
    }
    case 'Polygon': {
      const rings = (g.coordinates as Ring[]).map(ring =>
        `(${ring.map(([x, y]) => `${x} ${y}`).join(', ')})`
      );
      return `POLYGON (${rings.join(', ')})`;
    }
    case 'MultiPolygon': {
      const polys = (g.coordinates as Ring[][]).map(poly => {
        const rings = poly.map(ring =>
          `(${ring.map(([x, y]) => `${x} ${y}`).join(', ')})`
        );
        return `(${rings.join(', ')})`;
      });
      return `MULTIPOLYGON (${polys.join(', ')})`;
    }
    default:
      throw new Error(`Unsupported geometry type: ${g.type}`);
  }
}

export function fromWkt(wkt: string): unknown {
  const reader = new WKTReader(factory);
  const geom = reader.read(wkt);
  const writer = new GeoJSONWriter();
  return writer.write(geom);
}

// --- GeoJSON ---

export function toGeoJsonFeature(
  geometry: unknown,
  properties: Record<string, unknown>,
): unknown {
  return {
    type: 'Feature',
    geometry,
    properties,
  };
}

// --- KML ---

function coordsToKmlString(coords: number[][]): string {
  return coords.map(c => `${c[0]},${c[1]},0`).join(' ');
}

function geometryToKml(geometry: unknown, name?: string): string {
  const g = geometry as { type: string; coordinates: unknown };
  const nameTag = name ? `<name>${escapeXml(name)}</name>` : '';

  switch (g.type) {
    case 'Point': {
      const [x, y] = g.coordinates as number[];
      return `<Placemark>${nameTag}<Point><coordinates>${x},${y},0</coordinates></Point></Placemark>`;
    }
    case 'Polygon': {
      const rings = g.coordinates as number[][][];
      const outer = `<outerBoundaryIs><LinearRing><coordinates>${coordsToKmlString(rings[0])}</coordinates></LinearRing></outerBoundaryIs>`;
      const inner = rings.slice(1).map(ring =>
        `<innerBoundaryIs><LinearRing><coordinates>${coordsToKmlString(ring)}</coordinates></LinearRing></innerBoundaryIs>`
      ).join('');
      return `<Placemark>${nameTag}<Polygon>${outer}${inner}</Polygon></Placemark>`;
    }
    case 'MultiPolygon': {
      const polys = (g.coordinates as number[][][][]).map(poly => {
        const outer = `<outerBoundaryIs><LinearRing><coordinates>${coordsToKmlString(poly[0])}</coordinates></LinearRing></outerBoundaryIs>`;
        const inner = poly.slice(1).map(ring =>
          `<innerBoundaryIs><LinearRing><coordinates>${coordsToKmlString(ring)}</coordinates></LinearRing></innerBoundaryIs>`
        ).join('');
        return `<Polygon>${outer}${inner}</Polygon>`;
      });
      return `<Placemark>${nameTag}<MultiGeometry>${polys.join('')}</MultiGeometry></Placemark>`;
    }
    case 'LineString': {
      const coords = g.coordinates as number[][];
      return `<Placemark>${nameTag}<LineString><coordinates>${coordsToKmlString(coords)}</coordinates></LineString></Placemark>`;
    }
    default:
      return '';
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function featureCollectionToKml(fc: unknown, docName = 'gis-tools export'): string {
  const collection = fc as { features: { geometry: unknown; properties?: Record<string, unknown> }[] };
  const placemarks = collection.features.map(f => {
    const name = (f.properties?.formattedAddress ?? f.properties?.capaKey ?? f.properties?.CAPAKEY ?? f.properties?._layer ?? '') as string;
    return geometryToKml(f.geometry, name);
  }).filter(Boolean);

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>${escapeXml(docName)}</name>
${placemarks.join('\n')}
</Document>
</kml>`;
}

// --- Google Maps URL ---

export function toGoogleMapsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/@${lat},${lon},18z`;
}
