const API_BASE = "";

const TURNO_STATUS_CLASS = {
    "Validado": "status-validado",
    "Em curso": "status-em-curso",
    "Agendado": "status-agendado",
    "Pendente": "status-pendente",
};

const STOCK_STATUS_CLASS = {
    "Crítico": "status-critico",
    "Baixo": "status-baixo",
    "Ok": "status-ok",
};

function updateClock() {
    const el = document.getElementById("current-datetime");
    if (!el) return;
    el.textContent = new Date().toLocaleString("pt-PT", {
        hour: "2-digit", minute: "2-digit",
    });
}

function updatePanelDatetime() {
    const el = document.getElementById("panel-datetime");
    if (!el) return;
    const now = new Date();
    const turno = sessionStorage.getItem("turno") ?? "—";
    el.textContent = now.toLocaleString("pt-PT", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }) + " - Turno " + turno;
}

function renderTopbar() {
    const nomeEl = document.getElementById("nome-chefe");
    if (nomeEl) nomeEl.textContent = sessionStorage.getItem("nomeEnfermeiro") ?? "—";
    const turnoEl = document.getElementById("turno-chefe");
    if (turnoEl) turnoEl.textContent = sessionStorage.getItem("turno") ?? "—";
}

function badge(text, cls) {
    return `<span class="flag-badge ${cls ?? ""}">${text}</span>`;
}

function renderTurnosHoje(turnos) {
    const el = document.getElementById("turnos-hoje-body");
    if (!turnos || turnos.length === 0) {
        el.innerHTML = `<div class="table-row compact-table-row"><span style="color:#888;padding:12px;">Sem turnos disponíveis.</span></div>`;
        return;
    }
    el.innerHTML = turnos.map(t => `
        <div class="table-row compact-table-row">
            <span class="row-shift">${t.nome ?? "—"}</span>
            <span class="row-time">${t.horario ?? "—"}</span>
            <span class="row-user-name">${(t.equipa ?? []).join(" - ") || "—"}</span>
            <span class="row-role">${badge(t.estado ?? "—", TURNO_STATUS_CLASS[t.estado] ?? "")}</span>
        </div>`).join("");
}

function renderPassagensValidacao(passagens) {
    const el = document.getElementById("passagens-validacao-body");
    if (!passagens || passagens.length === 0) {
        el.innerHTML = `<span style="color:#888;">Sem passagens pendentes.</span>`;
        document.getElementById("stat-turno-validacao").textContent = "0";
        return;
    }
    document.getElementById("stat-turno-validacao").textContent = passagens.length;
    el.innerHTML = passagens.map(p => `
        <div class="infomation-row">
            <span>${p.descricao ?? "—"}</span><br>
            <span>${p.detalhe ?? ""}</span>
        </div>`).join("");
}

function renderStockCritico(items) {
    const el = document.getElementById("stock-critico-body");
    if (!items || items.length === 0) {
        el.innerHTML = `<div class="table-row compact-table-row"><span style="color:#888;padding:12px;">Sem stock crítico.</span></div>`;
        document.getElementById("stat-stock-critico").textContent = "0";
        return;
    }
    const criticos = items.filter(i => i.estado === "Crítico" || i.estado === "Baixo").length;
    document.getElementById("stat-stock-critico").textContent = criticos;
    el.innerHTML = items.map(i => `
        <div class="table-row compact-table-row">
            <span class="row-shift">${i.nome ?? "—"}</span>
            <span class="row-user-name">${i.stock ?? "—"}</span>
            <span class="row-role">${i.minimo ?? "—"}</span>
            <span class="row-desc">${badge(i.estado ?? "—", STOCK_STATUS_CLASS[i.estado] ?? "")}</span>
        </div>`).join("");
}

function renderUltimasAtividades(atividades) {
    const el = document.getElementById("ultimas-atividades-body");
    if (!atividades || atividades.length === 0) {
        el.innerHTML = `<span style="color:#888;">Sem atividades recentes.</span>`;
        return;
    }
    el.innerHTML = atividades.map(a => `
        <div class="activity-item">
            <span class="activity-time">${a.hora ?? "—"}</span>${a.descricao ?? "—"}
        </div>`).join("");
}

async function fetchCounts() {
    const res = await fetch(`${API_BASE}/api/stats/counts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    const c = json.data ?? {};

    const setStat = (id, valor) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = valor == null ? "—" : String(valor);
    };

    setStat("stat-utentes-internados", c.hospitalizedPatients);
    setStat("stat-enfermeiros-servico", c.activeNurses);
    setStat("stat-admissoes-hoje", c.acceptedPatientsToday);
    setStat("stat-altas-hoje", c.dischargedPatientsToday);
}

async function loadDashboard() {
    try {
        await fetchCounts();
    } catch (err) {
        console.error("[ChefeDashboard] counts:", err);
        ["stat-utentes-internados", "stat-enfermeiros-servico", "stat-admissoes-hoje", "stat-altas-hoje"]
            .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = "Err"; });
    }

    renderTurnosHoje([]);
    renderPassagensValidacao([]);
    renderStockCritico([]);
    renderUltimasAtividades([]);
}

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 60_000);
    updatePanelDatetime();
    renderTopbar();
    loadDashboard();
});