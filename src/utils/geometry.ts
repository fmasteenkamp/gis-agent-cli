type Coord = [number, number];
type Ring = Coord[];

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
