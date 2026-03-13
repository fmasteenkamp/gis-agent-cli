import services from '../data/services.json' with { type: 'json' };
const BASE = services.natuurbeheerplan;
function headers(token) {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}
async function get(path, token) {
    const res = await fetch(`${BASE}${path}`, { headers: headers(token) });
    const data = await res.json();
    if (!res.ok)
        throw new Error(`${res.status} ${JSON.stringify(data)}`);
    return data;
}
async function post(path, token, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok)
        throw new Error(`${res.status} ${JSON.stringify(data)}`);
    return data;
}
// --- Plans ---
export async function listPlannen(token) {
    return get('/api/v1/backoffice/plan', token);
}
export async function getPlan(id, token) {
    return get(`/api/v1/backoffice/plan/${encodeURIComponent(id)}`, token);
}
// --- Dossiers ---
export async function getDossierByNummer(nummer, token) {
    return get(`/api/v1/backoffice/dossier/number/${encodeURIComponent(nummer)}`, token);
}
export async function getDossierById(id, token) {
    return get(`/api/v1/backoffice/dossier/id/${id}`, token);
}
// --- Status ---
export async function getStatusHistory(planId, token) {
    return get(`/api/v1/backoffice/status/history/${encodeURIComponent(planId)}`, token);
}
export async function getPossibleActions(planId, token) {
    return get(`/api/v1/backoffice/status/possible-actions/${encodeURIComponent(planId)}`, token);
}
export async function setStatus(planId, toStatus, token) {
    return post(`/api/v1/backoffice/status/${encodeURIComponent(planId)}`, token, { toStatus });
}
// --- Notities ---
export async function getNotities(referentieId, token) {
    return get(`/api/v1/backoffice/notitie/referentie/${encodeURIComponent(referentieId)}`, token);
}
export async function addNotitie(referentieId, tekst, token) {
    return post('/api/v1/backoffice/notitie', token, { referentieId, tekst });
}
// --- Me ---
export async function getMe(token) {
    return get('/api/v1/auth/me', token);
}
