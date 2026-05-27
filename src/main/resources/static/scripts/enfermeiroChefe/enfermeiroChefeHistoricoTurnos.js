const API_BASE = "http://localhost:8080/api";

let todosTurnos = [];

document.addEventListener("DOMContentLoaded", async () => {
    await carregarPopups();
    await carregarInfoChefe();
    await carregarHistorico();
    _definirFiltrosDatasDefault();
});

// ─── Popups ───────────────────────────────────────────────────────────────────

async function carregarPopups() {
    const container = document.getElementById("popup-container");
    if (!container) return;

    const popups = [
        "../../pages/enfermeiroChefe/popups/popupDetalhePassagemTurno.html",
    ];

    for (const url of popups) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            const div = document.createElement("div");
            div.innerHTML = html;
            container.appendChild(div);
        } catch (err) {
            console.error("[Historico] Erro ao carregar popup:", url, err);
        }
    }
}

// ─── Info do Chefe ────────────────────────────────────────────────────────────

async function carregarInfoChefe() {
    // TODO: endpoint de perfil do utilizador autenticado (GET /api/workers/me ou similar)
    const nomeEl = document.getElementById("nome-chefe");
    const turnoEl = document.getElementById("turno-chefe");
    if (nomeEl) nomeEl.textContent = "—";
    if (turnoEl) turnoEl.textContent = "—";
}

// ─── Carregar histórico ───────────────────────────────────────────────────────

async function carregarHistorico() {
    try {
        const res = await fetch(`${API_BASE}/shifts`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        todosTurnos = json.data ?? [];
        aplicarFiltros();
    } catch (err) {
        console.error("[Historico] Erro ao carregar turnos:", err);
        const tbody = document.getElementById("historico-tbody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center !p-6 italic !text-primary/60 !font-normal">Erro ao carregar dados.</td></tr>`;
        }
    }
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

function _definirFiltrosDatasDefault() {
    const hoje = new Date();
    const semanaAtras = new Date(hoje);
    semanaAtras.setDate(hoje.getDate() - 7);

    const fmtISO = (d) => d.toISOString().split("T")[0];
    const inputInicio = document.getElementById("filtro-data-inicio");
    const inputFim = document.getElementById("filtro-data-fim");
    if (inputInicio) inputInicio.value = fmtISO(semanaAtras);
    if (inputFim) inputFim.value = fmtISO(hoje);
}

function aplicarFiltros() {
    const texto = (document.getElementById("filtro-texto")?.value ?? "").toLowerCase().trim();
    const dataInicio = document.getElementById("filtro-data-inicio")?.value ?? "";
    const dataFim = document.getElementById("filtro-data-fim")?.value ?? "";

    const filtrados = todosTurnos.filter((t) => {
        const dataISOTurno = _parseTurnoDataISO(t.inicio);

        if (dataInicio && dataISOTurno && dataISOTurno < dataInicio) return false;
        if (dataFim && dataISOTurno && dataISOTurno > dataFim) return false;

        if (texto) {
            const nomesEnf = (t.enfermeiros ?? [])
                .map((e) => (e.dados?.nome ?? "").toLowerCase())
                .join(" ");
            const nomesUtentes = (t.atribuicoes ?? [])
                .map((a) => (a.utente?.nome ?? a.utente?.nomeProprio ?? "").toLowerCase())
                .join(" ");
            const tipoStr = _labelTurno(t.tipo).toLowerCase();
            const haystack = `${nomesEnf} ${nomesUtentes} ${tipoStr}`;
            if (!haystack.includes(texto)) return false;
        }

        return true;
    });

    _renderTabela(filtrados);
}

// ─── Render tabela ────────────────────────────────────────────────────────────

function _renderTabela(turnos) {
    const tbody = document.getElementById("historico-tbody");
    if (!tbody) return;

    if (!turnos || turnos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center !p-6 italic !text-primary/60 !font-normal">Sem resultados para os filtros selecionados.</td></tr>`;
        return;
    }

    tbody.innerHTML = turnos.map((t) => {
        const labelTipo = _labelTurno(t.tipo);
        const data = _formatarDataTurno(t.inicio);

        const nomes = (t.enfermeiros ?? []).map((e) => _abreviarNome(e.dados?.nome ?? ""));
        const equipa = nomes.length > 0 ? nomes.join(" - ") : "—";

        const numUtentes = (t.atribuicoes ?? []).length;
        const utenteCell = numUtentes > 0 ? String(numUtentes) : "—";

        // TODO: expor pendências e validação no TurnoDTO ou num endpoint de listagem de histórico
        const pendenciasCell = `<span class="text-primary/55 font-medium italic">—</span>`;
        const validadoCell = "—";

        return `<tr>
            <td>${_escapeHtml(labelTipo)}</td>
            <td>${_escapeHtml(data)}</td>
            <td>${_escapeHtml(equipa)}</td>
            <td>${_escapeHtml(utenteCell)}</td>
            <td>${pendenciasCell}</td>
            <td>${validadoCell}</td>
            <td><button class="bg-transparent border-[1.5px] border-primary text-primary text-[11px] font-bold tracking-[0.04em] px-3.5 py-1 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap" onclick="abrirPopupDetalheTurno(${t.id})">VER MAIS</button></td>
        </tr>`;
    }).join("");
}

function _abreviarNome(nome) {
    if (!nome) return "—";
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0];
    return `${partes[0][0]}. ${partes[partes.length - 1]}`;
}

// ─── Popup detalhe ────────────────────────────────────────────────────────────

async function abrirPopupDetalheTurno(turnoId) {
    const overlay = document.getElementById("popup-detalhe-turno");
    if (!overlay) return;

    _setPopupDetalhe("popup-detalhe-titulo", "A carregar...");
    _setPopupDetalhe("popup-detalhe-periodo", "");
    _setPopupDetalhe("popup-detalhe-validado", "");
    _setPopupDetalhe("popup-detalhe-equipa", "A carregar...");
    _setPopupDetalhe("popup-detalhe-pendencias", "A carregar...");

    const notaEl = document.getElementById("popup-detalhe-nota");
    if (notaEl) notaEl.style.display = "none";

    overlay.style.display = "flex";

    try {
        const turnoBase = todosTurnos.find((t) => t.id === turnoId);

        const [resMudanca, resPendencias] = await Promise.all([
            fetch(`${API_BASE}/shifts/${turnoId}/change`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }),
            fetch(`${API_BASE}/shifts/${turnoId}/pending`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }),
        ]);

        let mudanca = null;
        if (resMudanca.ok) {
            const jsonMudanca = await resMudanca.json();
            if (jsonMudanca.success) mudanca = jsonMudanca.data;
        }

        let pendencias = [];
        if (resPendencias.ok) {
            const jsonPend = await resPendencias.json();
            if (jsonPend.success) pendencias = jsonPend.data ?? [];
        }

        _preencherPopupDetalhe(turnoBase, mudanca, pendencias);
    } catch (err) {
        console.error("[Historico] Erro ao carregar detalhe do turno:", err);
        _setPopupDetalhe("popup-detalhe-equipa", "Erro ao carregar dados.");
    }
}

function _preencherPopupDetalhe(turno, mudanca, pendencias) {
    const turnoData = mudanca?.turno ?? turno;

    const tipo = turnoData?.tipo ?? turno?.tipo ?? "—";
    const labelTipo = _labelTurno(tipo);
    const dataFormatada = _formatarDataTurno(turnoData?.inicio ?? turno?.inicio);
    _setPopupDetalhe("popup-detalhe-titulo", `Passagem de Turno — ${labelTipo} ${dataFormatada}`);

    const horaInicio = _extrairHora(turnoData?.inicio ?? turno?.inicio);
    const horaFim = _extrairHora(turnoData?.fim ?? turno?.fim);
    _setPopupDetalhe("popup-detalhe-periodo", `${labelTipo} ${horaInicio}–${horaFim}`);

    // TODO: expor dados de validação no PassagemTurnoDTO (quem validou e quando)
    _setPopupDetalhe("popup-detalhe-validado", "Validado — dados não disponíveis");

    const enfermeiros = (turno?.enfermeiros ?? []).map((e) => e.dados?.nome ?? "—");
    _setPopupDetalhe(
        "popup-detalhe-equipa",
        enfermeiros.length > 0 ? enfermeiros.join(" - ") : "—"
    );

    const pendEl = document.getElementById("popup-detalhe-pendencias");
    if (pendEl) {
        if (pendencias.length === 0) {
            pendEl.innerHTML = `<span style="font-style:italic;">Sem pendências.</span>`;
        } else {
            pendEl.innerHTML = pendencias.map((p) => {
                const nomeUtente = p.utente?.nome ?? p.utente?.nomeProprio ?? "—";
                const descricao = p.descricao ?? p.desscricao ?? "—";
                return `<div class="popup-detalhe-pendencia-item"><strong>Pendência</strong> - ${_escapeHtml(nomeUtente)} - ${_escapeHtml(descricao)}</div>`;
            }).join("");
        }
    }

    // TODO: expor observacoesValidacao no PassagemTurnoDTO
    const notaEl = document.getElementById("popup-detalhe-nota");
    if (notaEl) notaEl.style.display = "none";
}

function fecharPopupDetalheTurno() {
    const overlay = document.getElementById("popup-detalhe-turno");
    if (overlay) overlay.style.display = "none";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _setPopupDetalhe(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}

function _labelTurno(tipo) {
    switch ((tipo ?? "").toUpperCase()) {
        case "MANHA": return "Manhã";
        case "TARDE": return "Tarde";
        case "NOITE": return "Noite";
        default: return tipo ?? "—";
    }
}

/**
 * Converte "dd/MM/yyyy:HH:mm:ss" para "dd/MM/yyyy".
 */
function _formatarDataTurno(str) {
    if (!str) return "—";
    return str.substring(0, 10);
}

/**
 * Converte "dd/MM/yyyy:HH:mm:ss" para "HH:mm".
 */
function _extrairHora(str) {
    if (!str) return "—";
    const partes = str.split(":");
    if (partes.length < 3) return "—";
    return `${partes[1]}:${partes[2]}`;
}

/**
 * Converte "dd/MM/yyyy:HH:mm:ss" para "yyyy-MM-dd" (ISO, para comparação com input[type=date]).
 */
function _parseTurnoDataISO(str) {
    if (!str) return null;
    const datePart = str.substring(0, 10);
    const [dia, mes, ano] = datePart.split("/");
    if (!dia || !mes || !ano) return null;
    return `${ano}-${mes}-${dia}`;
}

function _escapeHtml(s) {
    if (s == null) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
