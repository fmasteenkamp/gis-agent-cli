import services from '../data/services.json' with { type: 'json' };

const BASE = services.natuurbeheerplan;

function headers(token: string): Record<string, string> {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data)}`);
  return data as T;
}

// --- Plans ---

export async function listPlannen(token: string): Promise<unknown[]> {
  return get('/api/v1/backoffice/plan', token);
}

export async function getPlan(id: string, token: string): Promise<unknown> {
  return get(`/api/v1/backoffice/plan/${encodeURIComponent(id)}`, token);
}

// --- Dossiers ---

export async function getDossierByNummer(nummer: string, token: string): Promise<unknown> {
  return get(`/api/v1/backoffice/dossier/number/${encodeURIComponent(nummer)}`, token);
}

export async function getDossierById(id: number, token: string): Promise<unknown> {
  return get(`/api/v1/backoffice/dossier/id/${id}`, token);
}

// --- Status ---

export async function getStatusHistory(planId: string, token: string): Promise<unknown[]> {
  return get(`/api/v1/backoffice/status/history/${encodeURIComponent(planId)}`, token);
}

export async function getPossibleActions(planId: string, token: string): Promise<unknown[]> {
  return get(`/api/v1/backoffice/status/possible-actions/${encodeURIComponent(planId)}`, token);
}

// --- Notities ---

export async function getNotities(referentieId: string, token: string): Promise<unknown[]> {
  return get(`/api/v1/backoffice/notitie/referentie/${encodeURIComponent(referentieId)}`, token);
}

// --- Me ---

export async function getMe(token: string): Promise<unknown> {
  return get('/api/v1/auth/me', token);
}
