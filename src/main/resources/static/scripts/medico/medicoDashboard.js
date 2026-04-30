const API_BASE = "";

const FLAG_MAP = {
    RISCO_FUGA: { label: "Risco Fuga", cls: "flag-fuga" },
    RISCO_AGRESSIVIDADE: { label: "Risco Agressividade", cls: "flag-agressividade" },
    RISCO_QUEDA: { label: "Risco Queda", cls: "flag-queda" },
    RISCO_AUTOMUTILACAO: { label: "Risco Automutilação", cls: "flag-automutilacao" },
};

let _allUtentes = [];

function updateClock() {
    const el = document.getElementById("current-datetime");
    if (!el) return;
    el.textContent = new Date().toLocaleString("pt-PT", {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function renderTopbar() {
    document.getElementById("nome-medico").textContent = sessionStorage.getItem("nomeUtilizador") ?? "—";
}

function diasInternado(dataEntrada) {
    if (!dataEntrada) return "—";
    const parts = dataEntrada.split(/[/:]/).slice(0, 3);
    if (parts.length < 3) return "—";
    const entrada = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    if (isNaN(entrada)) return "—";
    return Math.floor((Date.now() - entrada.getTime()) / 86400000);
}

function buildAlertas(utente) {
    const badges = [];
    (utente.flags ?? []).forEach(f => {
        const m = FLAG_MAP[f];
        if (m) badges.push(`<span class="flag-badge ${m.cls}">${m.label}</span>`);
    });
    if (utente.alergias?.length > 0)
        badges.push(`<span class="flag-badge flag-alergia">Alergias</span>`);
    return badges.join("") || "—";
}

function renderLinha(u) {
    const p = u.processo;
    return `
    <div class="table-row">
        <span class="row-user-id">${p?.id ?? "—"}</span>
        <span class="row-user-name">${u.nome ?? "—"}</span>
        <span class="row-role">${p?.cama?.id ?? "—"}</span>
        <span class="row-desc">${p?.diagnosticoPrincipal ?? "—"}</span>
        <span class="row-time">${diasInternado(p?.dataEntrada)}</span>
        <span class="row-ip">${buildAlertas(u)}</span>
        <div class="row-actions">
            <button class="btn-ver" onclick="verUtente(${u.id})">VER MAIS</button>
        </div>
    </div>`;
}

function renderLista(utentes) {
    const el = document.getElementById("utentes-list-body");
    if (!utentes || utentes.length === 0) {
        el.innerHTML = `<div class="table-row"><span style="padding:16px;color:#888;">Sem utentes internados.</span></div>`;
        return;
    }
    el.innerHTML = utentes.map(renderLinha).join("");
}

function renderStats(utentes) {
    document.getElementById("stat-utentes").textContent = utentes.length;
    document.getElementById("stat-acoes-pendentes").textContent = "—";
    document.getElementById("stat-exames").textContent = "—";
    document.getElementById("stat-altas").textContent = "—";
    document.getElementById("stat-contencao").textContent = "—";
}

function renderAcoesAtencao() {
    const el = document.getElementById("acoes-atencao-body");
    el.innerHTML = `<span style="color:#888;">— Sem dados disponíveis (endpoint pendente) —</span>`;
}

function filtrarLista(query) {
    if (!query.trim()) {
        renderLista(_allUtentes);
        return;
    }
    const q = query.toLowerCase();
    const filtrados = _allUtentes.filter(u =>
        (u.nome ?? "").toLowerCase().includes(q) ||
        String(u.processo?.id ?? "").includes(q) ||
        (u.processo?.cama?.id ?? "").toLowerCase().includes(q)
    );
    renderLista(filtrados);
}

function verUtente(id) {
    window.location.href = `/medicoKardexUtente?id=${id}`;
}

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/api/patients?f=HOSPITALIZED`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        _allUtentes = (json.data ?? []).filter(u => u.processo !== null);

        renderStats(_allUtentes);
        renderLista(_allUtentes);
        renderAcoesAtencao();

    } catch (err) {
        console.error("[MedicoDashboard]", err);
        document.getElementById("utentes-list-body").innerHTML =
            `<div class="table-row"><span style="padding:16px;color:#b91c1c;">Erro: ${err.message}</span></div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 60_000);
    renderTopbar();
    loadDashboard();

    document.getElementById("search-input").addEventListener("input", e => {
        filtrarLista(e.target.value);
    });
});