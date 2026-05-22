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

    const enfermeiros = jsonTurno.data.IdEnfermeiros;

    const atribuicoesMap = new Map();

    for (const enfermeiro of enfermeiros) {
        for (const atribuicao of enfermeiro.atribuicoes ?? []) {
            const chave = `${atribuicao.utente.id}_${atribuicao.turno.id}`;
            if (!atribuicoesMap.has(chave)) {
                atribuicoesMap.set(chave, atribuicao);
            }
        }
    }

    const atribuicoes = Array.from(atribuicoesMap.values());

    var idTurno = jsonTurno.data.id;

    document.getElementById("numUtentes").textContent = atribuicoes.length;

    // UTILIZAR O GetShiftChange TODO para saber isto 
    document.getElementById("numAdminCon").textContent = "TODO";
    document.getElementById("numAdminNCon").textContent = "TODO";
}

async function _renderPendencias() {
    const resTurno = await fetch(`http://localhost:8080/api/shifts/current`);
    if (!resTurno.ok) throw new Error(`HTTP ${resTurno.status}`);
    const jsonTurno = await resTurno.json();
    if (!jsonTurno.success) throw new Error(jsonTurno.message);

    var idTurno = jsonTurno.data.id;

    console.log(idTurno);

    document.getElementById("turno-origem").textContent = "TESTE";
    document.getElementById("turno-destino").textContent = "TESTE";
    document.getElementById("enf-origem").textContent = "TESTE";

    /*const res = await fetch(`http://localhost:8080/api/shifts/${idTurno}/pending`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);*/

    var ul = document.getElementById("pendencias-list");
    if (!ul) return;
    if (!lista || lista.length === 0) {
        ul.innerHTML = "<li><em>Sem pendências.</em></li>";
        return;
    }
    ul.innerHTML = lista.map(function (p) {
        return "<li><strong>" + _escapeHtml(p.titulo || "") + "</strong> — " + _escapeHtml(p.utente || "") + "</li>";
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
