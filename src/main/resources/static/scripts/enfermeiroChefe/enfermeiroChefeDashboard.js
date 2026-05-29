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
        el.innerHTML = `<p class="empty-state">Sem turnos para hoje.</p>`;
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
        el.innerHTML = `<p class="empty-state">Sem passagens pendentes.</p>`;
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
        el.innerHTML = `<p class="empty-state">Sem stock crítico.</p>`;
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
        el.innerHTML = `<p class="empty-state">Sem atividades recentes.</p>`;
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

const STOCK_CRITICO_MINIMO = 50;
const TIPOS_TURNO_LABEL = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite", CUSTOM: "Personalizado" };

function _authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function _parseDataApi(str) {
    if (!str) return null;
    const m = String(str).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[:T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (!m) return null;
    return new Date(
        parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10),
        parseInt(m[4] ?? "0", 10), parseInt(m[5] ?? "0", 10), parseInt(m[6] ?? "0", 10)
    );
}

function _formatarHora(str) {
    if (!str) return "—";
    const m = String(str).match(/[:T](\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : "—";
}

function _hojeDDMMYYYY() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

async function fetchTurnosHoje() {
    try {
        const res = await fetch(`/api/shifts`, { headers: _authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const hojeStr = _hojeDDMMYYYY();
        const agora = new Date();

        const turnos = (json.data ?? [])
            .filter(t => (t.inicio ?? "").substring(0, 10) === hojeStr)
            .map(t => {
                const inicio = _formatarHora(t.inicio);
                const fim = _formatarHora(t.fim);
                const equipa = (t.enfermeiros ?? []).map(e => e.dados?.nome ?? "—");
                const inicioDate = _parseDataApi(t.inicio);
                const fimDate = _parseDataApi(t.fim);
                let estado = "Agendado";
                if (inicioDate && fimDate) {
                    const fimAjustado = fimDate <= inicioDate ? new Date(fimDate.getTime() + 86_400_000) : fimDate;
                    if (agora >= inicioDate && agora <= fimAjustado) estado = "Em curso";
                    else if (agora > fimAjustado) estado = "Validado";
                }
                return {
                    nome: TIPOS_TURNO_LABEL[t.tipo] ?? t.tipo ?? "—",
                    horario: `${inicio}–${fim}`,
                    equipa,
                    estado,
                };
            })
            .sort((a, b) => a.horario.localeCompare(b.horario));

        renderTurnosHoje(turnos);
    } catch (err) {
        console.error("[ChefeDashboard] turnos hoje:", err);
        renderTurnosHoje([]);
    }
}

async function fetchPassagensValidacao() {
    try {
        const res = await fetch(`/api/shifts/history?offset=0&count=20`, { headers: _authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const pendentes = (json.data ?? []).filter(p => p.validador == null);
        const passagens = pendentes.map(p => {
            const tipo = TIPOS_TURNO_LABEL[p.turno?.tipo] ?? p.turno?.tipo ?? "Turno";
            const data = (p.turno?.inicio ?? "").substring(0, 10);
            const inicio = _formatarHora(p.turno?.inicio);
            const fim = _formatarHora(p.turno?.fim);
            const naoExecutadas = (p.dadosTurnoUtentes ?? p.dadosTurnoUtente ?? [])
                .filter(d => !d.executada).length;
            return {
                descricao: `Turno ${tipo} ${data}`,
                detalhe: `${inicio}–${fim}${naoExecutadas > 0 ? ` · ${naoExecutadas} pendência${naoExecutadas !== 1 ? "s" : ""}` : ""}`,
            };
        });

        renderPassagensValidacao(passagens);
    } catch (err) {
        console.error("[ChefeDashboard] passagens validação:", err);
        renderPassagensValidacao([]);
    }
}

function _calcularQuantidadeValida(lotes) {
    if (!lotes || !lotes.length) return 0;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return lotes.reduce((acc, lote) => {
        const validade = _parseDataApi(lote.validade);
        if (!validade || validade >= hoje) return acc + (lote.quantidade || 0);
        return acc;
    }, 0);
}

async function fetchStockCritico() {
    try {
        const res = await fetch(`/api/stock/medications`, { headers: _authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const items = (json.data ?? [])
            .map(m => {
                const stock = _calcularQuantidadeValida(m.lotes);
                let estado = "Ok";
                if (stock <= STOCK_CRITICO_MINIMO * 0.4) estado = "Crítico";
                else if (stock <= STOCK_CRITICO_MINIMO) estado = "Baixo";
                return { nome: m.nome, stock, minimo: STOCK_CRITICO_MINIMO, estado };
            })
            .filter(i => i.estado !== "Ok")
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 10);

        renderStockCritico(items);
    } catch (err) {
        console.error("[ChefeDashboard] stock crítico:", err);
        renderStockCritico([]);
    }
}

async function fetchUltimasAtividades() {
    try {
        const res = await fetch(`/api/records?offset=0&count=10`, { headers: _authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const atividades = (json.data ?? []).map(r => {
            const hora = _formatarHora((r.data ?? "").replace(/\//g, ":").replace(/^(\d{2}):(\d{2}):(\d{4})/, "$1/$2/$3"));
            const nomeUtilizador = r.utilizador?.nome ?? "Sistema";
            return {
                hora: hora !== "—" ? hora : (r.data ?? "").substring(11, 16),
                descricao: `${nomeUtilizador} — ${r.mensagem ?? "—"}`,
            };
        });

        renderUltimasAtividades(atividades);
    } catch (err) {
        console.error("[ChefeDashboard] últimas atividades:", err);
        renderUltimasAtividades([]);
    }
}

async function loadDashboard() {
    try {
        await fetchCounts();
    } catch (err) {
        console.error("[ChefeDashboard] counts:", err);
        ["stat-utentes-internados", "stat-enfermeiros-servico", "stat-admissoes-hoje", "stat-altas-hoje"]
            .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = "Err"; });
    }

    await Promise.all([
        fetchTurnosHoje(),
        fetchPassagensValidacao(),
        fetchStockCritico(),
        fetchUltimasAtividades(),
    ]);
}

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 60_000);
    updatePanelDatetime();
    renderTopbar();
    loadDashboard();
});