/* =============================================================
 *  Médico - Notas Clínicas (Notas de Evolução)
 *  Placeholder: endpoints ainda não existem no backend.
 *  Esta página apenas prepara a UI e helpers de render.
 * ============================================================= */

var _utenteId = null;

document.addEventListener("DOMContentLoaded", function () {
    _utenteId = _obterIdUtente();
    console.log("[Notas Clínicas] Utente ID:", _utenteId);
    _carregarPopups();

    /*
     * TODO: ligar ao backend quando os endpoints existirem:
     *   GET /api/processes/{id}/clinical-notes
     *   GET /api/patients/{id}
     */
});

async function _carregarPopups() {
    var popups = [
        "../../pages/medico/popups/popupNovaNotaEvolucao.html",
    ];

    for (var i = 0; i < popups.length; i++) {
        var url = popups[i];
        try {
            var res = await fetch(url);
            if (!res.ok) {
                console.warn("[Notas Clínicas] Não foi possível carregar o popup:", url);
                continue;
            }
            var html = await res.text();
            var div = document.createElement("div");
            div.innerHTML = html;
            var container = document.getElementById("popup-container") || document.body;
            while (div.firstChild) {
                container.appendChild(div.firstChild);
            }
        } catch (err) {
            console.error("[Notas Clínicas] Erro a carregar popup:", url, err);
        }
    }
}

/* ---------- Navegação ---------- */

function irParaKardex() {
    if (_utenteId == null) {
        _avisar("ID de utente em falta.");
        return;
    }
    window.location.href = "medicoKardexUtente?id=" + _utenteId;
}

function irParaPrescrever(event) {
    if (event) event.preventDefault();
    if (_utenteId == null) {
        _avisar("Selecione um utente antes de prescrever.");
        return;
    }
    window.location.href = "medicoPrescreverMedicamento?id=" + _utenteId;
}

function abrirNovaNota() {
    var popup = document.getElementById("popup-nova-nota");
    if (!popup) {
        _avisar("Não foi possível abrir o popup de nova nota.");
        return;
    }
    var inputDataHora = document.getElementById("data-hora-nota");
    if (inputDataHora && !inputDataHora.value) {
        inputDataHora.value = _agoraISOLocal();
    }
    var textareaJust = document.getElementById("justificacao-clinica");
    if (textareaJust) textareaJust.value = "";
    popup.style.display = "flex";
}

function fecharPopupNovaNota() {
    var popup = document.getElementById("popup-nova-nota");
    if (popup) popup.style.display = "none";
}

function submeterNovaNota(event) {
    if (event) event.preventDefault();
    var justificacao = (document.getElementById("justificacao-clinica") || {}).value;
    var dataHora = (document.getElementById("data-hora-nota") || {}).value;
    var tipoNota = (document.getElementById("tipo-nota") || {}).value;

    if (!justificacao || justificacao.trim() === "") {
        _avisar("Indique a justificação clínica antes de publicar.");
        return;
    }
    if (!dataHora) {
        _avisar("Indique a data/hora da nota.");
        return;
    }

    var payload = {
        utenteId: _utenteId,
        justificacao: justificacao.trim(),
        dataHora: dataHora,
        tipo: tipoNota,
    };
    console.log("[Notas Clínicas] Publicar nota:", payload);

    _avisar("Funcionalidade ainda não disponível — endpoint do backend em desenvolvimento.");
    fecharPopupNovaNota();

    /*
     * TODO: ligar ao backend quando os endpoints existirem:
     *   POST /api/processes/{utenteId}/clinical-notes
     *   Body: { justificacao, dataHora, tipo }
     */
}

function _agoraISOLocal() {
    var d = new Date();
    var off = d.getTimezoneOffset();
    var local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
}

function abrirHistInternamentos() {
    console.log("[Notas Clínicas] Abrir histórico de internamentos.");
    _avisar("Funcionalidade ainda não disponível — endpoint em desenvolvimento.");
}

function fecharNotasClinicas() {
    if (_utenteId != null) {
        window.location.href = "medicoKardexUtente?id=" + _utenteId;
    } else {
        window.location.href = "medicoListaUtentes";
    }
}

/* ---------- Render helpers (prontos para uso futuro) ---------- */

function _renderUtente(dados) {
    if (!dados) return;
    _setText("utente-nome", dados.nome);
    _setText("header-utente-nome", dados.nome);
    _setText("utente-processo", dados.processo);
    _setText("utente-cama", dados.cama);
    _setText("utente-diagnostico", dados.diagnostico);
    _setText("utente-dias", dados.diasInternado);
}

function _renderNotas(lista) {
    var container = document.getElementById("notas-lista");
    if (!container) return;

    if (!lista || lista.length === 0) {
        container.innerHTML = '<div class="nota-empty">Sem notas de evolução registadas.</div>';
        return;
    }

    container.innerHTML = lista.map(function (n) {
        return '<div class="nota-item">' +
            '<div class="nota-header">' +
            (n.medico || "—") +
            ' <span class="nota-meta">- ' + (n.data || "—") + ' - ' + (n.hora || "—") + '</span>' +
            '</div>' +
            '<div class="nota-texto">' + _escapeHtml(n.texto || "") + '</div>' +
            '</div>';
    }).join("");
}

/* ---------- Utils ---------- */

function _obterIdUtente() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (id == null || id === "") return null;
    var n = parseInt(id, 10);
    return isNaN(n) ? null : n;
}

function _setText(id, valor) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = valor != null && valor !== "" ? String(valor) : "—";
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

function _avisar(msg) {
    if (typeof mostrarNotificacao === "function") {
        mostrarNotificacao(msg, "aviso");
    } else {
        console.warn("[Notas Clínicas]", msg);
    }
}
