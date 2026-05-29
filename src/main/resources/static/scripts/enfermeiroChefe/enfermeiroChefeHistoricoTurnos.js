const API_BASE = "http://localhost:8080/api";

let todasPassagens = [];

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
    const nomeEl = document.getElementById("nome-chefe");
    const turnoEl = document.getElementById("turno-chefe");
    if (nomeEl) nomeEl.textContent = "—";
    if (turnoEl) turnoEl.textContent = "—";
}

// ─── Carregar histórico ───────────────────────────────────────────────────────

async function carregarHistorico() {
    try {
        const res = await fetch(`${API_BASE}/shifts/history?offset=0&count=10`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        // Ordenar por data/hora de início do turno (mais recente primeiro)
        todasPassagens = (json.data ?? []).slice().sort((a, b) => {
            const tsA = _toTimestamp(a.turno?.inicio);
            const tsB = _toTimestamp(b.turno?.inicio);
            return tsB - tsA;
        });
        aplicarFiltros();
    } catch (err) {
        console.error("[Historico] Erro ao carregar histórico:", err);
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

    const filtrados = todasPassagens.filter((p) => {
        const dataISOTurno = _parseTurnoDataISO(p.turno?.inicio);

        if (dataInicio && dataISOTurno && dataISOTurno < dataInicio) return false;
        if (dataFim && dataISOTurno && dataISOTurno > dataFim) return false;

        if (texto) {
            const nomesUtentes = (p.dadosTurnoUtentes ?? p.dadosTurnoUtente ?? [])
                .map((d) => (d.utente?.nome ?? d.utente?.nomeProprio ?? "").toLowerCase())
                .join(" ");
            const tipoStr = _labelTurno(p.turno?.tipo).toLowerCase();
            const haystack = `${nomesUtentes} ${tipoStr}`;
            if (!haystack.includes(texto)) return false;
        }

        return true;
    });

    _renderTabela(filtrados);
}

// ─── Render tabela ────────────────────────────────────────────────────────────

function _renderTabela(passagens) {
    const tbody = document.getElementById("historico-tbody");
    if (!tbody) return;

    if (!passagens || passagens.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center !p-6 italic !text-primary/60 !font-normal">Sem resultados para os filtros selecionados.</td></tr>`;
        return;
    }

    tbody.innerHTML = passagens.map((p) => {
        const labelTipo = _labelTurno(p.turno?.tipo);
        const data = _formatarDataTurno(p.turno?.inicio);

        // PassagemTurnoDTO.turno é agora TurnoDTO completo → tem .enfermeiros
        const enfermeiros = (p.turno?.enfermeiros ?? [])
            .map((e) => e.dados?.nome ?? e.nome)
            .filter(Boolean);
        const equipa = enfermeiros.length > 0
            ? _escapeHtml(enfermeiros.join(", "))
            : `<span class="text-primary/55 font-medium italic">—</span>`;

        const pendencias = p.dadosTurnoUtentes ?? p.dadosTurnoUtente ?? [];
        const utentesUnicos = new Set(
            pendencias
                .map((d) => d.utente?.id ?? d.utente?.nome ?? d.utente?.nomeProprio)
                .filter((x) => x != null)
        );
        const utenteCell = utentesUnicos.size > 0 ? String(utentesUnicos.size) : "—";

        const naoExecutadas = pendencias.filter((d) => !d.executada).length;
        const pendenciasCell = pendencias.length > 0
            ? `${naoExecutadas} / ${pendencias.length}`
            : `<span class="text-primary/55 font-medium italic">—</span>`;

        const validadorNome = p.validador?.dados?.nome;
        const horaValidacao = _extrairHoraISO(p.dataValidacao);
        let validadoCell;
        if (validadorNome) {
            validadoCell = horaValidacao
                ? `${_escapeHtml(validadorNome)} <span class="text-primary/55 font-mono">· ${horaValidacao}</span>`
                : _escapeHtml(validadorNome);
        } else {
            validadoCell = `<span class="text-primary/55 font-medium italic">Pendente</span>`;
        }

        return `<tr>
            <td>${_escapeHtml(labelTipo)}</td>
            <td>${_escapeHtml(data)}</td>
            <td>${equipa}</td>
            <td>${_escapeHtml(utenteCell)}</td>
            <td>${pendenciasCell}</td>
            <td>${validadoCell}</td>
            <td><button class="bg-transparent border-[1.5px] border-primary text-primary text-[11px] font-bold tracking-[0.04em] px-3.5 py-1 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap" onclick="abrirPopupDetalhePassagem(${p.id})">VER MAIS</button></td>
        </tr>`;
    }).join("");
}

// ─── Popup detalhe ────────────────────────────────────────────────────────────

async function abrirPopupDetalhePassagem(passagemId) {
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
        const passagem = todasPassagens.find((p) => p.id === passagemId);

        const res = await fetch(`${API_BASE}/shifts/changes/${passagemId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        let detalhe = null;
        if (res.ok) {
            const json = await res.json();
            if (json.success) detalhe = json.data;
        }

        _preencherPopupDetalhe(passagem, detalhe);
    } catch (err) {
        console.error("[Historico] Erro ao carregar detalhe da passagem:", err);
        _setPopupDetalhe("popup-detalhe-equipa", "Erro ao carregar dados.");
    }
}

function _preencherPopupDetalhe(passagem, detalhe) {
    // Preferimos os dados detalhados (do endpoint /shifts/changes/{id}); usamos a passagem da
    // listagem como fallback caso o detalhe não venha.
    const turnoData = detalhe?.turno ?? passagem?.turno;

    const tipo = turnoData?.tipo ?? "—";
    const labelTipo = _labelTurno(tipo);
    const dataFormatada = _formatarDataTurno(turnoData?.inicio);
    _setPopupDetalhe("popup-detalhe-titulo", `Passagem de Turno — ${labelTipo} ${dataFormatada}`);

    const horaInicio = _extrairHora(turnoData?.inicio);
    const horaFim = _extrairHora(turnoData?.fim);
    _setPopupDetalhe("popup-detalhe-periodo", `${labelTipo} ${horaInicio}–${horaFim}`);

    // Validador + data/hora de validação
    const validadorNome = detalhe?.validador?.dados?.nome;
    const horaValidacao = _extrairHoraISO(detalhe?.dataValidacao);
    if (validadorNome && horaValidacao) {
        _setPopupDetalhe("popup-detalhe-validado", `Validado — ${validadorNome} · ${horaValidacao}`);
    } else if (validadorNome) {
        _setPopupDetalhe("popup-detalhe-validado", `Validado — ${validadorNome}`);
    } else {
        _setPopupDetalhe("popup-detalhe-validado", "Aguarda validação");
    }

    // Equipa: turno.enfermeiros[].dados.nome
    const enfermeiros = (turnoData?.enfermeiros ?? []).map((e) => e.dados?.nome ?? "—");
    _setPopupDetalhe(
        "popup-detalhe-equipa",
        enfermeiros.length > 0 ? enfermeiros.join(" - ") : "—"
    );

    // Pendências: detalhe.dadosTurnoUtentes (preferido) ou passagem.dadosTurnoUtentes
    const pendencias =
        detalhe?.dadosTurnoUtentes ??
        detalhe?.dadosTurnoUtente ??
        passagem?.dadosTurnoUtentes ??
        passagem?.dadosTurnoUtente ??
        [];

    const pendEl = document.getElementById("popup-detalhe-pendencias");
    if (pendEl) {
        if (pendencias.length === 0) {
            pendEl.innerHTML = `<span style="font-style:italic;">Sem pendências.</span>`;
        } else {
            pendEl.innerHTML = pendencias.map((d) => {
                const nomeUtente = d.utente?.nome ?? d.utente?.nomeProprio ?? "—";
                const descricao = d.descricao ?? "—";
                return `<div class="popup-detalhe-pendencia-item"><strong>Pendência</strong> - ${_escapeHtml(nomeUtente)} - ${_escapeHtml(descricao)}</div>`;
            }).join("");
        }
    }

    // Nota de validação (só mostra se existir)
    const notaEl = document.getElementById("popup-detalhe-nota");
    const notaTextoEl = document.getElementById("popup-detalhe-nota-texto");
    const nota = (detalhe?.notaValidacao ?? "").trim();
    if (notaEl && notaTextoEl && nota) {
        notaTextoEl.textContent = nota;
        notaEl.style.display = "";
    } else if (notaEl) {
        notaEl.style.display = "none";
    }
}

function fecharPopupDetalheTurno() {
    const overlay = document.getElementById("popup-detalhe-turno");
    if (overlay) overlay.style.display = "none";
}

// Mantido para compat. com popups que usem o nome antigo
function abrirPopupDetalheTurno(id) {
    return abrirPopupDetalhePassagem(id);
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
 * Extrai "HH:mm" de uma data ISO ("yyyy-MM-ddTHH:mm:ss") ou retorna "" se inválido.
 * Usado para a dataValidacao do DetailedShiftChangeDTO (LocalDateTime sem @JsonFormat).
 */
function _extrairHoraISO(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

/**
 * Converte "dd/MM/yyyy:HH:mm:ss" para timestamp numérico (para ordenação).
 */
function _toTimestamp(str) {
    if (!str) return 0;
    const partes = str.split(":");
    if (partes.length < 4) return 0;
    const [dia, mes, ano] = partes[0].split("/");
    const hora = partes[1];
    const min = partes[2];
    const seg = partes[3];
    if (!dia || !mes || !ano) return 0;
    return new Date(`${ano}-${mes}-${dia}T${hora}:${min}:${seg}`).getTime();
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
