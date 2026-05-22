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

function _renderSumario(dados) {
    var body = document.getElementById("sumario-body");
    if (!body || !dados) return;
    body.innerHTML = (dados.linhas || [])
        .map(function (l) { return "<p>" + _escapeHtml(l) + "</p>"; })
        .join("");
}

function _renderPendencias(lista) {
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
