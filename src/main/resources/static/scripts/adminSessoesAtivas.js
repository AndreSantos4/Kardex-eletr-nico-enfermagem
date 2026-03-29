const PAGE_SIZE = 10;

let allRows     = [];
let filtered    = [];
let currentPage = 1;


function verificarDado(val) {
    return val ?? '---';
}

function fmtTime(value) {
    if (!value) return '---';

    const match = String(value).match(/(\d{2})\/(\d{2})\/\d{4}:(\d{2}:\d{2})/);
    if (match) return `${match[1]}/${match[2]} ${match[3]}`;

    try {
        return new Date(value).toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return value;
    }
}

async function fetchJson(url) {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function carregarDados() {
    try {
        const [sessionsResp, strangeResp] = await Promise.all([
            fetchJson(`http://localhost:8080/api/sessions`),
            fetchJson(`http://localhost:8080/api/sessions/attemps/strange`)
        ]);

        const sessions = (sessionsResp.data ?? []).map(s => ({ ...s, _type: 'session' }));
        const strange  = (strangeResp.data  ?? []).map(s => ({ ...s, _type: 'strange' }));

        allRows     = [...sessions, ...strange];
        filtered    = [...allRows];
        currentPage = 1;
        preencherDados();
    } catch (err) {
        mostrarErro('Não foi possível carregar os dados. Verifique a ligação à API.');
        console.error(err);
    }
}

function preencherDados() {
    const tbody = document.getElementById('sessions-body');
    const start = (currentPage - 1) * PAGE_SIZE;
    const page  = filtered.slice(start, start + PAGE_SIZE);

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <div class="table-row empty-state">
                <span style="grid-column:1/-1;text-align:center;color:var(--text-muted,#888);padding:2rem 0">
                    Nenhuma sessão encontrada.
                </span>
            </div>`;
        renderPagination();
        return;
    }

    tbody.innerHTML = page.map(row => criarLinha(row)).join('');

    tbody.querySelectorAll('[data-action="revogar"]').forEach(btn => {
        btn.addEventListener('click', () => handleRevogar(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="bloquear"]').forEach(btn => {
        btn.addEventListener('click', () => handleBloquear(btn.dataset.ip));
    });

    renderPagination();
}

function criarLinha(row) {
    if (row._type === 'session') {
        const u = row.utilizador ?? {};
        return `
        <div class="table-row">
            <div class="row-user">
                <span class="row-user-name">${u.nome ?? 'Desconhecido'}</span>
                <span class="row-user-id">Nº ${String(u.numeroMecanografico ?? '')}</span>
            </div>
            <span class="row-role">${verificarDado(u.role)}</span>
            <span class="row-ip">${verificarDado(row.enderecoIp)}</span>
            <span class="row-time">${fmtTime(row.inicio)}</span>
            <span class="row-time">${fmtTime(u.dataUltimaAtividade)}</span>
            <span class="row-desc">${verificarDado(u.email)}</span>
            <div class="row-actions">
                <button class="btn-revogar"
                        data-action="revogar"
                        data-id="${String(row.id ?? '')}">
                    REVOGAR
                </button>
            </div>
        </div>`;
    }

    return `
    <div class="table-row suspicious">
        <div class="row-user">
            <span class="row-user-name">${row.nomeUtilizador ?? 'Utilizador desconhecido'}</span>
            <span class="row-user-id">&nbsp;</span>
        </div>
        <span class="row-role">${verificarDado(row.role ?? 'Desconhecido')}</span>
        <span class="row-ip">${verificarDado(row.enderecoIp ?? row.ip)}</span>
        <span class="row-time">${fmtTime(row.dataHora ?? row.inicio)}</span>
        <span class="row-time">---</span>
        <span class="row-desc">${verificarDado(row.descricao ?? `Login Falhado x ${row.tentativas ?? '?'}`)}</span>
        <div class="row-actions">
            <button class="btn-bloquear"
                    data-action="bloquear"
                    data-ip="${String(row.enderecoIp ?? row.ip ?? '')}">
                BLOQUEAR IP
            </button>
        </div>
    </div>`;
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    let html = `<button class="page-btn" id="pg-prev" ${currentPage === 1 ? 'disabled' : ''}>&#8249;</button>`;

    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    if (start > 1) html += `<button class="page-btn" data-page="1">1</button><span class="page-ellipsis">…</span>`;

    for (let p = start; p <= end; p++) {
        html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }

    if (end < totalPages) html += `<span class="page-ellipsis">…</span><button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;

    html += `<button class="page-btn" id="pg-next" ${currentPage === totalPages ? 'disabled' : ''}>&#8250;</button>`;
    html += `<span class="page-info">${filtered.length} resultado(s)</span>`;

    container.innerHTML = html;

    container.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            preencherDados();
        });
    });

    const prev = container.querySelector('#pg-prev');
    const next = container.querySelector('#pg-next');
    if (prev) prev.addEventListener('click', () => { if (currentPage > 1)          { currentPage--; preencherDados(); } });
    if (next) next.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; preencherDados(); } });
}

function setupSearch() {
    const input = document.querySelector('.search-input-wrap input');
    if (!input) return;
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        filtered = q
            ? allRows.filter(r => {
                const u = r.utilizador ?? {};
                return (u.nome           ?? '').toLowerCase().includes(q) ||
                       (r.enderecoIp     ?? r.ip ?? '').toLowerCase().includes(q) ||
                       (u.role           ?? r.role ?? '').toLowerCase().includes(q) ||
                       (u.email          ?? '').toLowerCase().includes(q) ||
                       String(u.numeroMecanografico ?? '').includes(q);
              })
            : [...allRows];
        currentPage = 1;
        preencherDados();
    });
}

async function handleRevogar(sessionId) {
    if (!sessionId) return;
    if (!confirm('Revogar esta sessão?')) return;
    try {
        const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await carregarDados();
    } catch (err) {
        console.error(err);
    }
}

async function handleBloquear(ip) {
    if (!ip) return;
    if (!confirm(`Bloquear o IP ${ip}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/sessions/ip`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ipAddress: ip })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await carregarDados();
    } catch (err) {
        console.error(err);
    }
}

function mostrarErro(msg) {
    const tbody = document.getElementById('sessions-body');
    if (tbody) {
        tbody.innerHTML = `
            <div class="table-row empty-state">
                <span style="grid-column:1/-1;text-align:center;color:#e74c3c;padding:2rem 0">${msg}</span>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
    carregarDados();
});