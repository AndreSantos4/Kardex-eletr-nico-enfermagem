/* =============================================================
 *  Enf. Chefe - Validar Passagem de Turno
 *  Placeholder: endpoints ainda não existem no backend.
 *  Os dados de exemplo estão definidos no HTML; este script
 *  apenas prepara a lógica de validação e helpers de render.
 * ============================================================= */

document.addEventListener("DOMContentLoaded", function () {
    console.log("[Validar Passagem] Página carregada.");

    /*
     * TODO: ligar ao backend quando os endpoints existirem:
     *   GET  /api/shifts/handover/pending   -> dados do turno a validar
     *   POST /api/shifts/handover/{id}/validate
     *   POST /api/shifts/handover/{id}/return
     */



    //await _renderPendencias();
    _renderSumario();


});

/* ---------- Validação ---------- */

function validarPassagemTurno(event) {
    if (event) event.preventDefault();

    var confirmado = document.getElementById("check-confirmar");
    if (!confirmado || !confirmado.checked) {
        _avisar("Confirme que reviu o relatório antes de validar.");
        return;
    }

    var obs = (document.getElementById("observacoes-validacao") || {}).value || "";

    var payload = {
        observacoes: obs.trim(),
    };
    console.log("[Validar Passagem] Validar e assinar:", payload);

    _avisar("Funcionalidade ainda não disponível — endpoint do backend em desenvolvimento.");

    /*
     * TODO: POST /api/shifts/handover/{id}/validate
     *   Body: { observacoes }
     */
}

function devolverParaCorrecao() {
    var obs = (document.getElementById("observacoes-validacao") || {}).value || "";
    if (!obs.trim()) {
        _avisar("Indique nas observações o motivo da devolução para correção.");
        return;
    }

    var payload = { observacoes: obs.trim() };
    console.log("[Validar Passagem] Devolver para correção:", payload);

    _avisar("Funcionalidade ainda não disponível — endpoint do backend em desenvolvimento.");

    /*
     * TODO: POST /api/shifts/handover/{id}/return
     *   Body: { observacoes }
     */
}

/* ---------- Render helpers (prontos para uso futuro) ---------- */

async function _renderSumario() {
    const resTurno = await fetch(`http://localhost:8080/api/shifts/current`);
    if (!resTurno.ok) throw new Error(`HTTP ${resTurno.status}`);
    const jsonTurno = await resTurno.json();
    if (!jsonTurno.success) throw new Error(jsonTurno.message);

    const atribuicoes = jsonTurno.data.atribuicoes ?? [];
    const idTurno = jsonTurno.data.id;

    document.getElementById("numUtentes").textContent = atribuicoes.length;

    const resMudanca = await fetch(`http://localhost:8080/api/shifts/${idTurno}/change`);
    if (!resMudanca.ok) throw new Error(`HTTP ${resMudanca.status}`);
    const jsonMudanca = await resMudanca.json();
    if (!jsonMudanca.success) throw new Error(jsonMudanca.message);

    const turnoAtual  = jsonMudanca.data.turno;
    const proxTurno   = jsonMudanca.data.proximoTurno;
    const dadosUtentes = jsonMudanca.data.dadosTurnoUtentes;

    // Page header
    document.getElementById("turno-origem").textContent = `Turno ${turnoAtual.tipo} (${turnoAtual.inicio.split(":")[0]})`;
    document.getElementById("turno-destino").textContent = proxTurno
        ? `Turno ${proxTurno.tipo} (${proxTurno.inicio.split(":")[0]})`
        : "—";

    // Enfermeiros do turno atual
    const enfermeiros = jsonTurno.data.enfermeiros ?? [];
    const nomesEnf = enfermeiros.map(e => e.dados.nome).join(", ");
    document.getElementById("enf-origem").textContent = nomesEnf || "—";

    // Contagens
    let totalAdministradas = 0;
    let totalNaoAdministradas = 0;
    let totalIncidentes = 0;
    let totalSOS = 0;

    for (const d of dadosUtentes) {
        totalAdministradas    += d.administracoes.administradas.length;
        totalNaoAdministradas += d.administracoes.naoAdministradas.length;
        totalIncidentes       += d.incidentes.length;
        totalSOS              += d.administracoes.sos.length;
    }

    document.getElementById("numAdminCon").textContent   = totalAdministradas;
    document.getElementById("numAdminNCon").textContent  = totalNaoAdministradas;
    document.getElementById("numIncidentes").textContent = totalIncidentes;
    document.getElementById("numAdminSOS").textContent   = totalSOS;

    // Pendências = utentes sem sinais medidos + administrações não confirmadas
    const pendencias = dadosUtentes.filter(d =>
        !d.sinaisMedidos || d.administracoes.naoAdministradas.length > 0
    );
    document.getElementById("numPendencias").textContent = pendencias.length;
    document.getElementById("proxTurno").textContent = proxTurno
        ? `${proxTurno.tipo} (${proxTurno.inicio.split(":")[0]})`
        : "—";

    // Tabela de utentes
    _renderEstadoUtentes(dadosUtentes);
}

function _renderEstadoUtentes(dadosUtentes) {
    const thead = document.querySelector(".estado-utentes-table thead");
    const tbody = document.getElementById("estado-utentes-tbody");

    thead.innerHTML = `
        <tr>
            <th>Utente</th>
            <th>Medicação</th>
            <th>Sinais Vitais</th>
            <th>Incidentes</th>
            <th>SOS</th>
        </tr>`;

    if (!dadosUtentes || dadosUtentes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;font-style:italic;">Sem utentes.</td></tr>';
        return;
    }

    tbody.innerHTML = dadosUtentes.map(d => {
        const nome   = _escapeHtml(d.utente.nome);
        const adm    = d.administracoes.administradas.length;
        const nAdm   = d.administracoes.naoAdministradas.length;
        const sos    = d.administracoes.sos.length;
        const inc    = d.incidentes.length;
        const sv     = d.sinaisMedidos;

        const medicacaoCell = nAdm > 0
            ? `${adm} con. / <span style="color:var(--danger, #c0392b)">${nAdm} não con.</span>`
            : `<span class="ok">&#10003;</span>`;

        const svCell = sv
            ? `<span class="ok">&#10003;</span>`
            : `<span style="color:var(--danger, #c0392b)">Não medidos</span>`;

        const incCell = inc > 0
            ? `<span style="color:var(--danger, #c0392b)">${inc} incidente${inc > 1 ? "s" : ""}</span>`
            : "—";

        const sosCell = sos > 0 ? `${sos} SOS` : "—";

        return `<tr>
            <td>${nome}</td>
            <td>${medicacaoCell}</td>
            <td>${svCell}</td>
            <td>${incCell}</td>
            <td>${sosCell}</td>
        </tr>`;
    }).join("");
}

function _renderNotaEnfermeiro(texto) {
    var body = document.getElementById("nota-enfermeiro-body");
    if (!body) return;
    body.innerHTML = "<p>" + _escapeHtml(texto || "") + "</p>";
}

function _renderEstadoUtentes(lista) {
    var tbody = document.getElementById("estado-utentes-tbody");
    if (!tbody) return;
    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;font-style:italic;">Sem utentes.</td></tr>';
        return;
    }
    tbody.innerHTML = lista.map(function (u) {
        return "<tr>" +
            "<td>" + _escapeHtml(u.utente || "") + "</td>" +
            "<td>" + _renderEstadoCell(u.medicacao) + "</td>" +
            "<td>" + _renderEstadoCell(u.sinaisVitais) + "</td>" +
            "<td>" + _escapeHtml(u.ocorrencias || "--------") + "</td>" +
            "<td>" + _escapeHtml(u.pendencias || "--------") + "</td>" +
            "</tr>";
    }).join("");
}

function _renderEstadoCell(v) {
    if (v === true || v === "OK" || v === "ok") return '<span class="ok">&#10003;</span>';
    return _escapeHtml(v == null ? "--------" : String(v));
}

/* ---------- Utils ---------- */

function _avisar(msg) {
    if (typeof mostrarNotificacao === "function") {
        mostrarNotificacao(msg, "aviso");
    } else {
        console.warn("[Validar Passagem]", msg);
    }
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
