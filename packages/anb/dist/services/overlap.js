import services from '../data/services.json' with { type: 'json' };
const OVERLAP_BASE = services.overlap;
export async function queryOverlap(config, feature) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    let res;
    try {
        res = await fetch(`${OVERLAP_BASE}${config.path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feature),
            signal: controller.signal,
        });
    }
    catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            throw new Error(`Overlap query timed out (${config.keyword}) — server may be offline`);
        }
        throw err;
    }
    finally {
        clearTimeout(timer);
    }
    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Overlap query failed (${config.keyword}): ${res.status} ${JSON.stringify(data)}`);
    }
    return data;
}
