const API_BASE = "http://localhost:8080/api";

let turnosSemana = [];
let enfermeirosDisponiveis = [];
let turnoAtual = null;
let atribuicoesAtuais = [];
let ultimosUtentesHospitalizados = [];
let atribuicoesIniciais = [];
let turnoSelecionadoParaAtribuicao = null;

document.addEventListener("DOMContentLoaded", async () => {
    iniciarRelogio();
    await carregarInfoChefe();
    await carregarPopups();
    renderizarCabecalhoSemana();
    await carregarEnfermeiros();
    await carregarSemana();
    await renderizarResumoAtribuicoes();
    await carregarDisponibilidadeEquipa();

    document.getElementById("btn-criar-turno-header")
        ?.addEventListener("click", abrirPopUpCriarTurno);
    document.getElementById("btn-criar-turno-agenda")
        ?.addEventListener("click", abrirPopUpCriarTurno);
});

// ─── Relógio ────────────────────────────────────────────────────────────────

function iniciarRelogio() {
    function atualizar() {
        const agora = new Date();
        const fmt = agora.toLocaleString("pt-PT", {
            weekday: "long", year: "numeric", month: "long",
            day: "numeric", hour: "2-digit", minute: "2-digit"
        });
        const el = document.getElementById("current-datetime");
        if (el) el.textContent = " | " + fmt;

        const hdr = document.getElementById("header-datetime");
        if (hdr) hdr.textContent = fmt.charAt(0).toUpperCase() + fmt.slice(1);
    }
    atualizar();
    setInterval(atualizar, 60_000);
}

// ─── Datas / Horas ──────────────────────────────────────────────────────────

/**
 * Converte a string "dd/MM/yyyy:HH:mm:ss" (formato da API) num objeto Date.
 * Aceita também strings sem segundos ("dd/MM/yyyy:HH:mm").
 */
function parseTurnoDate(str) {
    if (!str) return null;
    // Formato esperado: "dd/MM/yyyy:HH:mm:ss" ou "dd/MM/yyyy:HH:mm"
    const [datePart, ...timeParts] = str.split(":");
    const [dia, mes, ano] = datePart.split("/").map(Number);
    const hora = Number(timeParts[0] ?? 0);
    const minuto = Number(timeParts[1] ?? 0);
    const segundo = Number(timeParts[2] ?? 0);
    return new Date(ano, mes - 1, dia, hora, minuto, segundo);
}

function turnoEstaAtivo(turno) {
    const agora = new Date();
    const inicio = parseTurnoDate(`${turno.data}:${turno.inicio}`);
    const fim = parseTurnoDate(`${turno.data}:${turno.fim}`);
    if (!inicio || !fim) return false;

    // Turno que atravessa a meia-noite (ex: noite 00:00-08:00)
    const fimAjustado = fim <= inicio ? new Date(fim.getTime() + 86_400_000) : fim;
    return agora >= inicio && agora <= fimAjustado;
}

function obterTurnoAtual() {
    return turnosSemana.find(t => turnoEstaAtivo(t)) ?? null;
}

// ─── Info do Chefe ───────────────────────────────────────────────────────────

async function carregarInfoChefe() {
    // TODO: endpoint de perfil do utilizador autenticado
    const nomeEl = document.getElementById("nome-chefe");
    const turnoEl = document.getElementById("turno-chefe");
    const servicoEl = document.getElementById("servico-nome");
    if (nomeEl) nomeEl.textContent = "TODO";
    if (turnoEl) turnoEl.textContent = "TODO";
    if (servicoEl) servicoEl.textContent = "TODO";
}

// ─── Calendário Semanal ─────────────────────────────────────────────────────

const DIAS_SEMANA = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const LABELS_DIA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function getMondayOfCurrentWeek() {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const diffParaSeg = diaSemana === 0 ? -6 : 1 - diaSemana;
    const seg = new Date(hoje);
    seg.setDate(hoje.getDate() + diffParaSeg);
    seg.setHours(0, 0, 0, 0);
    return seg;
}

function renderizarCabecalhoSemana() {
    const seg = getMondayOfCurrentWeek();
    DIAS_SEMANA.forEach((dia, i) => {
        const d = new Date(seg);
        d.setDate(seg.getDate() + i);
        const th = document.getElementById(`th-${dia}`);
        if (th) {
            th.textContent = `${LABELS_DIA[i]} ${d.getDate()}/${d.getMonth() + 1}`;
            th.dataset.data = formatarDataAPI(d);
        }
    });
}

function formatarDataAPI(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

/**
 * Extrai "dd/MM/yyyy" de uma string "dd/MM/yyyy:HH:mm:ss".
 */
function extrairDataDeTurno(dataHoraStr) {
    if (!dataHoraStr) return null;
    return dataHoraStr.substring(0, 10);
}

/**
 * Extrai "HH:mm" de uma string "dd/MM/yyyy:HH:mm:ss".
 * O formato usa ":" como separador geral, portanto os índices são:
 *   [0] = "dd/MM/yyyy"  [1] = "HH"  [2] = "mm"  [3] = "ss"
 */
function extrairHoraDeTurno(dataHoraStr) {
    if (!dataHoraStr) return "";
    const partes = dataHoraStr.split(":");
    // partes[1] = HH, partes[2] = mm
    if (partes.length < 3) return "";
    return `${partes[1]}:${partes[2]}`;
}

function inferirTipoPorHoras(inicio, fim) {
    if (inicio === "08:00" && fim === "16:00") return "MANHA";
    if (inicio === "16:00" && fim === "00:00") return "TARDE";
    return "NOITE";
}

function resolverNomeEnfermeiro(enf) {
    if (enf.dados?.nome) return enf.dados.nome;
    if (enf.nome) return enf.nome;
    const encontrado = enfermeirosDisponiveis.find(e => e.id === enf.id);
    return encontrado?.nome ?? `Enf. ${enf.id}`;
}

function normalizarTurno(turnoApi) {
    const data = extrairDataDeTurno(turnoApi.inicio);
    const inicio = extrairHoraDeTurno(turnoApi.inicio);
    const fim = extrairHoraDeTurno(turnoApi.fim);

    const tipo = !turnoApi.tipo
        ? inferirTipoPorHoras(inicio, fim)
        : turnoApi.tipo;

    const rawEnfermeiros = turnoApi.IdEnfermeiros ?? turnoApi.enfermeiros ?? [];
    const enfermeiros = rawEnfermeiros.map(e => ({
        id: e.id ?? e,
        nome: resolverNomeEnfermeiro(typeof e === "object" ? e : { id: e })
    }));

    return {
        id: turnoApi.id,
        tipo,
        data,
        inicio,
        fim,
        enfermeiros,
        observacoes: turnoApi.observacoes ?? ""
    };
}

// ─── Agenda ─────────────────────────────────────────────────────────────────

async function carregarSemana() {
    const agendaBody = document.getElementById("agenda-body");
    if (!agendaBody) return;

    const seg = getMondayOfCurrentWeek();
    const dom = new Date(seg);
    dom.setDate(seg.getDate() + 6);
    dom.setHours(23, 59, 59, 999);

    try {
        const res = await fetch(`${API_BASE}/shifts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Erro ao carregar turnos");

        turnosSemana = (json.data || [])
            .map(normalizarTurno)
            .filter(t => {
                if (!t.data) return false;
                const [d, m, y] = t.data.split("/").map(Number);
                const dataTurno = new Date(y, m - 1, d);
                return dataTurno >= seg && dataTurno <= dom;
            });
    } catch (e) {
        console.warn("Não foi possível carregar turnos:", e.message);
        turnosSemana = [];
    }

    const TIPOS_INFO = {
        manha: { nome: "Manhã", horario: "8h00 – 16h00" },
        tarde: { nome: "Tarde", horario: "16h00 – 00h" },
        noite: { nome: "Noite", horario: "00h – 8h00" },
        custom: { nome: "Personalizado", horario: "" }
    };

    const tiposPresentes = [...new Set(
        turnosSemana.map(t => mapTipoParaLinha(t.tipo)).filter(Boolean)
    )];

    if (!tiposPresentes.length) {
        agendaBody.innerHTML = '<tr><td colspan="8" class="gt-empty-agenda">Não existem turnos agendados para esta semana.</td></tr>';
        return;
    }

    agendaBody.innerHTML = tiposPresentes.map(tipoKey => {
        const info = TIPOS_INFO[tipoKey] ?? { nome: "Personalizado", horario: "" };
        return `
            <tr>
                <td class="gt-turno-cell">
                    <span class="gt-turno-name">${info.nome}</span>
                    <span class="gt-turno-horario">${info.horario}</span>
                </td>
                ${DIAS_SEMANA.map(dia => `<td id="${tipoKey}-${dia}" class="gt-day-cell"></td>`).join("")}
            </tr>
        `;
    }).join("");

    turnosSemana.forEach(renderizarTurnoNaAgenda);
}

function renderizarTurnoNaAgenda(turno) {
    const tipoKey = mapTipoParaLinha(turno.tipo);
    const diaKey = mapDataParaDia(turno.data);
    if (!tipoKey || !diaKey) return;

    const cel = document.getElementById(`${tipoKey}-${diaKey}`);
    if (!cel) return;

    const enfermeiros = turno.enfermeiros ?? [];
    const nomesHtml = enfermeiros.length
        ? enfermeiros.map(e => `<span class="gt-chip-enf-nome">${e.nome}</span>`).join("")
        : `<span class="gt-chip-enf-nome gt-chip-sem-enf">Sem enfermeiros</span>`;

    const chip = document.createElement("div");
    chip.className = "gt-turno-chip";
    chip.dataset.turnoId = turno.id;
    chip.innerHTML = `
        <div class="gt-chip-top">
            <span class="gt-chip-hora">${turno.inicio || ""}–${turno.fim || ""}</span>
            <span class="gt-chip-count">${enfermeiros.length} enf.</span>
        </div>
        <div class="gt-chip-nomes">${nomesHtml}</div>
    `;
    chip.addEventListener("click", () => abrirPopUpEditarTurno(turno.id));
    cel.appendChild(chip);
}

function mapTipoParaLinha(tipo) {
    switch (tipo) {
        case "MANHA": return "manha";
        case "TARDE": return "tarde";
        case "NOITE": return "noite";
        case "CUSTOM": return "custom";
        default: return null;
    }
}

function mapDataParaDia(dataStr) {
    if (!dataStr) return null;
    const [d, m, y] = dataStr.split("/").map(Number);
    const date = new Date(y, m - 1, d);
    const seg = getMondayOfCurrentWeek();
    const diff = Math.round((date - seg) / 86_400_000);
    if (diff < 0 || diff > 6) return null;
    return DIAS_SEMANA[diff];
}

// ─── Atribuições ─────────────────────────────────────────────────────────────

/**
 * Carrega enfermeiros e respetivas atribuições a partir de:
 *   GET /api/workers?r=ENFERMEIRO
 *
 * @param {number|null} idTurno  Se fornecido, filtra apenas atribuições desse turno.
 */
async function carregarAtribuicoesDeEnfermeiros(idTurno = null) {
    try {
        const res = await fetch(`${API_BASE}/workers?r=ENFERMEIRO`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Erro ao carregar atribuições");

        // Atualiza a lista global de enfermeiros disponíveis
        enfermeirosDisponiveis = (json.data ?? []).map(e => ({
            id: e.id ?? e.dados?.id,
            nome: e.dados?.nome ?? e.nome ?? `Enfermeiro ${e.id ?? e.dados?.id}`
        })).filter(e => e.id != null);

        const atribuicoes = (json.data ?? []).flatMap(worker => {
            const enfermeiroId = worker.id ?? worker.dados?.id;
            if (enfermeiroId == null) return [];

            return (worker.atribuicoes ?? []).map(item => ({
                idTurno: item.turno?.id ?? null,
                idUtente: item.utente?.id,
                idEnfermeiro: enfermeiroId,
                utenteNome: item.utente?.nome ?? "Utente",
                turno: item.turno ?? null
            }));
        }).filter(a => a.idUtente != null);

        return idTurno != null
            ? atribuicoes.filter(a => a.idTurno === idTurno)
            : atribuicoes;

    } catch (e) {
        console.warn("Não foi possível carregar atribuições:", e.message);
        return [];
    }
}

async function carregarDisponibilidadeEquipa() {
    const body = document.getElementById("disponibilidade-body");
    if (!body) return;
    // TODO: implementar endpoint /nurses/availability
    body.innerHTML = '<div class="gt-dispon-row"><span style="padding:12px;color:#888;">Sem dados de disponibilidade.</span></div>';
}

function renderizarDisponibilidade(enfermeiros) {
    const body = document.getElementById("disponibilidade-body");
    if (!body) return;
    if (!enfermeiros.length) {
        body.innerHTML = '<div class="gt-dispon-row"><span style="padding:12px;color:#888;">Sem dados de disponibilidade.</span></div>';
        return;
    }
    body.innerHTML = enfermeiros.map(enf => `
        <div class="gt-dispon-row">
            <span>${enf.nome || "—"}</span>
            <span class="gt-estado gt-estado--${(enf.estado || "").toLowerCase()}">${enf.estado || "—"}</span>
            <span>${enf.proximoTurno || "—"}</span>
        </div>
    `).join("");
}

// ─── Resumo de Atribuições (painel inferior) ─────────────────────────────────

async function renderizarResumoAtribuicoes() {
    const body = document.getElementById("atribuicao-body");
    if (!body) return;

    try {
        const res = await fetch(`${API_BASE}/workers?r=ENFERMEIRO`, {
            headers: { "Accept": "application/json" }
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.success) {
            mostrarNotificacao({
                titulo: "Erro ao carregar",
                mensagem: json.message || "Não foi possível aceder às atribuições!",
                tipo: "erro"
            });
            return;
        }

        const enfermeiros = json.data ?? [];

        if (!enfermeiros.length) {
            body.innerHTML = `<div class="gt-atrib-row"><span style="padding:12px;color:#888;">Sem atribuições no turno atual.</span></div>`;
            return;
        }

        const turnoAtivo = obterTurnoAtual();

        if (!turnoAtivo) {
            body.innerHTML = `<div class="gt-atrib-row"><span style="padding:12px;color:#888;">Não existe turno ativo neste momento.</span></div>`;
            return;
        }

        const grupos = enfermeiros.map(enf => {
            const atribTurno = (enf.atribuicoes ?? []).filter(a => a.turno?.id === turnoAtivo.id);
            return {
                nome: enf.dados?.nome ?? "—",
                utentes: atribTurno.map(a => a.utente?.nome ?? "—"),
                carga: atribTurno.length
            };
        }).filter(g => g.carga > 0);

        if (!grupos.length) {
            body.innerHTML = `<div class="gt-atrib-row"><span style="padding:12px;color:#888;">Sem atribuições no turno atual.</span></div>`;
            return;
        }

        body.innerHTML = grupos.map(g => `
            <div class="gt-atrib-row">
                <span>${g.nome}</span>
                <span>${g.utentes.join(", ")}</span>
                <span>${g.carga}</span>
            </div>
        `).join("");

    } catch (err) {
        console.error(err);
        mostrarNotificacao({ titulo: "Erro", mensagem: "Erro inesperado ao carregar atribuições.", tipo: "erro" });
    }
}

// ─── Utentes Hospitalizados ───────────────────────────────────────────────────

async function buscarUtentesHospitalizados() {
    try {
        const res = await fetch(`${API_BASE}/patients?f=HOSPITALIZED`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Erro ao carregar utentes.");

        return (json.data ?? []).map(p => ({
            id: p.id,
            nome: p.nome ?? "—",
            cama: p.processo?.cama?.id ?? "—",
            diagnostico: p.processo?.diagnosticoPrincipal ?? "—"
        }));
    } catch (e) {
        console.warn("Não foi possível carregar utentes hospitalizados:", e.message);
        return [];
    }
}

// ─── Popup: Atribuição de Utentes ────────────────────────────────────────────

function renderizarTabelaAtribuicao(pacientes, selecionados = {}) {
    const body = document.getElementById("atribuicoes-tbody");
    if (!body) return;

    if (!pacientes.length) {
        body.innerHTML = '<tr><td colspan="4" class="atribuicao-empty">Não há utentes hospitalizados para atribuir.</td></tr>';
        return;
    }

    body.innerHTML = pacientes.map(p => {
        const selectedValue = selecionados[p.id] ?? "";
        return `
            <tr data-utente-id="${p.id}">
                <td>${p.nome}</td>
                <td>${p.cama}</td>
                <td>${p.diagnostico}</td>
                <td>
                    <select class="atribuir-enfermeiro-select" name="atribuicao-enfermeiro">
                        <option value="">-- Selecionar --</option>
                        ${enfermeirosDisponiveis.map(enf => `
                            <option value="${enf.id}" ${String(enf.id) === String(selectedValue) ? "selected" : ""}>
                                ${enf.nome}
                            </option>
                        `).join("")}
                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

function getAtribuicoesSeleccionadas() {
    return Array.from(document.querySelectorAll("#atribuicoes-tbody tr[data-utente-id]"))
        .map(row => {
            const utenteId = Number(row.dataset.utenteId);
            const enfermeiroId = Number(row.querySelector("select[name='atribuicao-enfermeiro']")?.value || 0);
            if (!utenteId || !enfermeiroId) return null;
            return { idUtente: utenteId, idEnfermeiro: enfermeiroId };
        })
        .filter(Boolean);
}

async function abrirPopUpAtribuicaoUtentes(turno) {
    const popup = document.getElementById("popup-atribuicao-utentes");
    if (!popup) return;

    turnoAtual = turno;

    document.getElementById("atribuicao-turno-info").textContent =
        `${turnoAtual.tipo} - ${turnoAtual.data} ${turnoAtual.inicio}–${turnoAtual.fim}`;

    const body = document.getElementById("atribuicoes-tbody");
    if (body) body.innerHTML = '<tr><td colspan="4" class="atribuicao-empty">A carregar utentes e enfermeiros...</td></tr>';

    await carregarEnfermeiros();
    ultimosUtentesHospitalizados = await buscarUtentesHospitalizados();
    atribuicoesIniciais = atribuicoesAtuais.map(a => ({ ...a }));

    const atribuicoesMap = {};
    atribuicoesAtuais.forEach(a => { atribuicoesMap[a.idUtente] = a.idEnfermeiro; });

    renderizarTabelaAtribuicao(ultimosUtentesHospitalizados, atribuicoesMap);
    popup.style.display = "flex";
}

function fecharPopupAtribuicaoUtentes() {
    const popup = document.getElementById("popup-atribuicao-utentes");
    if (popup) popup.style.display = "none";
}

async function submeterAtribuicaoUtentes(event) {
    event.preventDefault();

    if (!turnoAtual) {
        mostrarNotificacao({ titulo: "Erro", mensagem: "Não é possível enviar atribuições sem um turno atual.", tipo: "erro" });
        return;
    }

    const todasAtribuicoes = getAtribuicoesSeleccionadas();
    const novasAtribuicoes = todasAtribuicoes.filter(nova =>
        !atribuicoesIniciais.some(e => e.idUtente === nova.idUtente && e.idEnfermeiro === nova.idEnfermeiro)
    );

    if (!novasAtribuicoes.length) {
        mostrarNotificacao({ titulo: "Sem alterações", mensagem: "Não há novas atribuições para guardar.", tipo: "aviso" });
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/shifts/${turnoAtual.id}/assignments`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ atribuicoes: novasAtribuicoes })
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.success) {
            mostrarNotificacao({ titulo: "Erro ao salvar", mensagem: json.message || "Não foi possível guardar as atribuições.", tipo: "erro" });
            return;
        }

        // Funde novas atribuições com as existentes
        const atribuicoesFinais = [...atribuicoesIniciais];
        novasAtribuicoes.forEach(nova => {
            const idx = atribuicoesFinais.findIndex(a => a.idUtente === nova.idUtente);
            if (idx !== -1) atribuicoesFinais[idx] = nova;
            else atribuicoesFinais.push(nova);
        });

        atribuicoesAtuais = atribuicoesFinais;
        atribuicoesIniciais = [];

        await renderizarResumoAtribuicoes();
        fecharPopupAtribuicaoUtentes();
        mostrarNotificacao({
            titulo: "Atribuições guardadas",
            mensagem: `${novasAtribuicoes.length} nova(s) atribuição(ões) guardada(s) com sucesso.`,
            tipo: "sucesso"
        });
    } catch (e) {
        console.error(e);
        mostrarNotificacao({ titulo: "Erro", mensagem: "Não foi possível contactar o servidor.", tipo: "erro" });
    }
}

// ─── Enfermeiros ─────────────────────────────────────────────────────────────

/**
 * Carrega (ou reutiliza cache) da lista de enfermeiros disponíveis.
 * Fonte: GET /api/workers?r=ENFERMEIRO
 */
async function carregarEnfermeiros() {
    if (enfermeirosDisponiveis.length) return enfermeirosDisponiveis;

    try {
        const res = await fetch(`${API_BASE}/workers?r=ENFERMEIRO`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Erro ao carregar enfermeiros");

        enfermeirosDisponiveis = (json.data ?? []).map(e => ({
            id: e.id ?? e.dados?.id,
            nome: e.dados?.nome ?? e.nome ?? `Enfermeiro ${e.id ?? e.dados?.id ?? "desconhecido"}`
        })).filter(e => e.id != null);
    } catch (e) {
        console.warn("Não foi possível carregar enfermeiros:", e.message);
        enfermeirosDisponiveis = [];
    }
    return enfermeirosDisponiveis;
}

function renderizarCheckboxesEnfermeiros(containerId, selecionados = []) {
    const box = document.getElementById(containerId);
    if (!box) return;

    if (!enfermeirosDisponiveis.length) {
        box.innerHTML = '<div style="padding:8px;color:#888;">Sem enfermeiros disponíveis.</div>';
        return;
    }

    box.innerHTML = [...enfermeirosDisponiveis]
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" }))
        .map(enf => `
            <label class="ct-enf-item">
                <input type="checkbox" name="enfermeiros" value="${enf.id}"
                    ${selecionados.includes(enf.id) ? "checked" : ""} />
                ${enf.nome}
            </label>
        `).join("");
}

function getEnfermeirosSeleccionados(containerId) {
    const box = document.getElementById(containerId);
    if (!box) return [];
    return Array.from(box.querySelectorAll("input[name='enfermeiros']:checked"))
        .map(cb => Number(cb.value));
}

// ─── Popup: Criar Turno ───────────────────────────────────────────────────────

async function abrirPopUpCriarTurno() {
    const popup = document.querySelector(".pop-up-criar-turno");
    if (!popup) return;

    document.getElementById("form-criar-turno").reset();
    document.getElementById("ct-data").value = new Date().toISOString().split("T")[0];
    esconderErroCriar();

    await carregarEnfermeiros();
    renderizarCheckboxesEnfermeiros("ct-enfermeiros-box");
    popup.style.display = "flex";
}

function fecharPopUpCriarTurno() {
    const popup = document.querySelector(".pop-up-criar-turno");
    if (popup) popup.style.display = "none";
}

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

async function submeterCriarTurno(event) {
    event.preventDefault();
    esconderErroCriar();

    const tipo = document.getElementById("ct-tipo").value;
    const dataRaw = document.getElementById("ct-data").value;

    let horaInicio, horaFim;
    if (tipo === "PERSONALIZADO") {
        horaInicio = document.getElementById("ct-hora-inicio").value;
        horaFim = document.getElementById("ct-hora-fim").value;
        if (!horaInicio || !horaFim) {
            mostrarErroCriar("Preencha a hora de início e fim para turno personalizado.");
            return;
        }
    } else {
        ({ inicio: horaInicio, fim: horaFim } = horasPorTipo(tipo));
    }

    const body = {
        tipo: tipo === "PERSONALIZADO" ? "CUSTOM" : tipo,
        inicio: horaInicio,
        fim: horaFim,
        data: formatarData(dataRaw),
        IdEnfermeiros: getEnfermeirosSeleccionados("ct-enfermeiros-box"),
        observacoes: document.getElementById("ct-observacoes").value
    };

    try {
        const res = await fetch(`${API_BASE}/shifts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.success) {
            mostrarErroCriar(json.message || "Erro ao criar turno.");
            return;
        }

        fecharPopUpCriarTurno();
        mostrarNotificacao({ titulo: "Turno criado", mensagem: "O turno foi criado com sucesso.", tipo: "sucesso" });
        renderizarCabecalhoSemana();
        await carregarSemana();
    } catch {
        mostrarErroCriar("Não foi possível contactar o servidor.");
    }
}

function mostrarErroCriar(msg) {
    const box = document.getElementById("ct-errorBox");
    const p = document.getElementById("ct-errorMsg");
    if (box) box.style.display = "block";
    if (p) p.textContent = msg;
}
function esconderErroCriar() {
    const box = document.getElementById("ct-errorBox");
    if (box) box.style.display = "none";
}

// ─── Popup: Editar Turno ──────────────────────────────────────────────────────

async function abrirPopUpEditarTurno(idTurno) {
    const popup = document.querySelector(".pop-up-editar-turno");
    if (!popup) return;

    esconderErroEditar();
    document.getElementById("et-turno-id").value = idTurno;

    let turno = turnosSemana.find(t => t.id === idTurno);

    if (!turno) {
        try {
            const res = await fetch(`${API_BASE}/shifts/${idTurno}`);
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) turno = normalizarTurno(json.data);
            }
        } catch { /* silencioso */ }
    }

    turnoSelecionadoParaAtribuicao = turno;

    const btnAtribuir = document.getElementById("btn-atribuir-utentes-turno");
    if (btnAtribuir) {
        btnAtribuir.onclick = async () => {
            fecharPopUpEditarTurno();
            await abrirPopUpAtribuicaoUtentes(turno);
        };
    }

    if (turno) {
        const tipoValor = turno.tipo === "CUSTOM" ? "PERSONALIZADO" : (turno.tipo || "MANHA");
        document.getElementById("et-tipo").value = tipoValor;
        onTipoTurnoEditarChange(tipoValor);
        document.getElementById("et-hora-inicio").value = turno.inicio || "";
        document.getElementById("et-hora-fim").value = turno.fim || "";
        document.getElementById("et-observacoes").value = turno.observacoes || "";
    }

    await carregarEnfermeiros();
    renderizarCheckboxesEnfermeiros("et-enfermeiros-box", (turno?.enfermeiros ?? []).map(e => e.id ?? e));
    popup.style.display = "flex";
}

function fecharPopUpEditarTurno() {
    const popup = document.querySelector(".pop-up-editar-turno");
    if (popup) popup.style.display = "none";
}

function onTipoTurnoEditarChange(valor) {
    const inicio = document.getElementById("et-hora-inicio");
    const fim = document.getElementById("et-hora-fim");
    if (valor === "PERSONALIZADO") {
        inicio.removeAttribute("readonly");
        fim.removeAttribute("readonly");
    } else {
        inicio.setAttribute("readonly", true);
        fim.setAttribute("readonly", true);
        const horas = horasPorTipo(valor);
        inicio.value = horas.inicio;
        fim.value = horas.fim;
    }
}

async function submeterEditarTurno(event) {
    event.preventDefault();
    esconderErroEditar();

    const idTurno = document.getElementById("et-turno-id").value;
    const tipo = document.getElementById("et-tipo").value;
    const horaInicio = document.getElementById("et-hora-inicio").value;
    const horaFim = document.getElementById("et-hora-fim").value;
    const observacoes = document.getElementById("et-observacoes").value;

    const turno = turnosSemana.find(t => t.id == idTurno);
    const dataFormatada = turno?.data ?? formatarDataAPI(new Date());

    const body = {
        tipo: tipo === "PERSONALIZADO" ? "CUSTOM" : tipo,
        inicio: horaInicio,
        fim: horaFim,
        data: dataFormatada,
        IdEnfermeiros: getEnfermeirosSeleccionados("et-enfermeiros-box"),
        observacoes
    };

    try {
        const res = await fetch(`${API_BASE}/shifts/${idTurno}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.success) {
            mostrarErroEditar(json.message || "Erro ao editar turno.");
            return;
        }

        fecharPopUpEditarTurno();
        mostrarNotificacao({ titulo: "Turno editado", mensagem: "As alterações foram guardadas.", tipo: "sucesso" });
        await carregarSemana();
    } catch {
        mostrarErroEditar("Não foi possível contactar o servidor.");
    }
}

// ─── Eliminar Turno ───────────────────────────────────────────────────────────

async function eliminarTurno() {
    const idTurno = Number(document.getElementById("et-turno-id").value);
    if (!idTurno) return;

    const turno = turnosSemana.find(t => t.id === idTurno);
    if (turno) {
        if ((turno.enfermeiros ?? []).length > 0) {
            mostrarErroEditar("Não é possível eliminar um turno com enfermeiros alocados. Remove-os antes de tentar eliminar.");
            return;
        }

        const agora = new Date();
        const [d, m, y] = turno.data.split("/").map(Number);
        const [fimHora, fimMin] = turno.fim.split(":").map(Number);
        const [iniHora, iniMin] = turno.inicio.split(":").map(Number);
        const inicio = new Date(y, m - 1, d, iniHora, iniMin, 0);
        const fim = new Date(y, m - 1, d, fimHora, fimMin, 0);

        // Turno que atravessa a meia-noite
        if (fim <= inicio) fim.setDate(fim.getDate() + 1);

        if (fim < agora) {
            mostrarErroEditar("Não é possível eliminar um turno que já passou.");
            return;
        }
    }

    if (!confirm("Tem a certeza que pretende eliminar este turno?")) return;

    try {
        const res = await fetch(`${API_BASE}/shifts/${idTurno}`, { method: "DELETE" });
        const text = await res.text();

        let json = { success: true };
        if (text) {
            try { json = JSON.parse(text); } catch { json = { success: true, message: text }; }
        }

        if (!res.ok || !json.success) {
            mostrarErroEditar(json.message || "Erro ao eliminar turno.");
            return;
        }

        fecharPopUpEditarTurno();
        mostrarNotificacao({ titulo: "Turno eliminado", mensagem: "O turno foi eliminado com sucesso.", tipo: "sucesso" });
        await carregarSemana();
    } catch (e) {
        console.error(e);
        mostrarErroEditar("Não foi possível contactar o servidor.");
    }
}

function mostrarErroEditar(msg) {
    const box = document.getElementById("et-errorBox");
    const p = document.getElementById("et-errorMsg");
    if (box) box.style.display = "block";
    if (p) p.textContent = msg;
}
function esconderErroEditar() {
    const box = document.getElementById("et-errorBox");
    if (box) box.style.display = "none";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function horasPorTipo(tipo) {
    switch (tipo) {
        case "MANHA": return { inicio: "08:00", fim: "16:00" };
        case "TARDE": return { inicio: "16:00", fim: "00:00" };
        case "NOITE": return { inicio: "00:00", fim: "08:00" };
        default: return { inicio: "", fim: "" };
    }
}

// ─── Carregamento de Popups ───────────────────────────────────────────────────

async function carregarPopups() {
    const container = document.getElementById("popup-container");
    if (!container) return;

    const popups = [
        "../../pages/enfermeiroChefe/popups/enfermeiroChefeEditarTurno.html",
        "../../pages/enfermeiroChefe/popups/enfermeiroChefeCriarTurno.html",
        "../../pages/enfermeiroChefe/popups/popupAtribuicaoUtentes.html",
    ];

    for (const url of popups) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            const div = document.createElement("div");
            div.innerHTML = html;
            container.appendChild(div);
        } catch (e) {
            console.error(`[popups] Não foi possível carregar ${url}:`, e.message);
        }
    }
}