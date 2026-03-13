import type { OverlapLayerConfig } from '../models/overlap-layers.js';
import services from '../data/services.json' with { type: 'json' };

const OVERLAP_BASE = services.overlap;

export interface OverlapResult {
  layerName?: string;
  intersecting?: unknown[];
  [key: string]: unknown;
}

export async function queryOverlap(
  config: OverlapLayerConfig,
  feature: { type: 'Feature'; geometry: unknown; properties: Record<string, unknown> },
): Promise<OverlapResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  let res: Response;
  try {
    res = await fetch(`${OVERLAP_BASE}${config.path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feature),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === 'AbortError') {
      throw new Error(`Overlap query timed out (${config.keyword}) — server may be offline`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Overlap query failed (${config.keyword}): ${res.status} ${JSON.stringify(data)}`);
  }

  return data as OverlapResult;
}
