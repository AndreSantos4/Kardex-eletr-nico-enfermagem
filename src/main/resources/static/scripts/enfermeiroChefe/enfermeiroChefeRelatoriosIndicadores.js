/* =============================================================
 *  Enf. Chefe - Relatórios e Indicadores
 *  Placeholder: endpoints ainda não existem no backend.
 *  Esta página apenas inicializa os filtros (período/datas) e
 *  prepara as funções para ligação futura à API.
 * ============================================================= */

const PERIODO_LABELS = {
    MARCO_2026: "Março 2026",
    FEVEREIRO_2026: "Fevereiro 2026",
    JANEIRO_2026: "Janeiro 2026",
    ULTIMO_TRIMESTRE: "Último trimestre",
    PERSONALIZADO: "Personalizado",
};

document.addEventListener("DOMContentLoaded", function () {
    _inicializarPeriodoPredefinido();
    atualizarPeriodo();
    _ligarBotaoGerar();
});

/* ---------- Inicialização ---------- */

function _inicializarPeriodoPredefinido() {
    var selectPeriodo = document.getElementById("periodo-relatorio");
    if (!selectPeriodo) return;
    if (!selectPeriodo.value) selectPeriodo.value = "MARCO_2026";
}

function _ligarBotaoGerar() {
    var btn = document.querySelector(".btn-gerar-relatorio");
    if (btn) btn.addEventListener("click", gerarRelatorio);
}

/* ---------- Handlers de filtros ---------- */

function atualizarRelatorio() {
    var tipo = document.getElementById("tipo-relatorio");
    if (!tipo) return;
    console.log("[Relatórios] Tipo selecionado:", tipo.value);
}

function atualizarPeriodo() {
    var selectPeriodo = document.getElementById("periodo-relatorio");
    var inputInicio = document.getElementById("data-inicio");
    var inputFim = document.getElementById("data-fim");
    if (!selectPeriodo || !inputInicio || !inputFim) return;

    var periodo = selectPeriodo.value;
    var intervalo = _calcularIntervalo(periodo);

    if (intervalo) {
        inputInicio.value = _formatarISO(intervalo.inicio);
        inputFim.value = _formatarISO(intervalo.fim);
        inputInicio.disabled = periodo !== "PERSONALIZADO";
        inputFim.disabled = periodo !== "PERSONALIZADO";
    } else {
        inputInicio.disabled = false;
        inputFim.disabled = false;
    }

    _atualizarLabelsPeriodo(periodo);
}

function _calcularIntervalo(periodo) {
    var hoje = new Date();

    switch (periodo) {
        case "MARCO_2026":
            return { inicio: new Date(2026, 2, 1), fim: new Date(2026, 2, 31) };
        case "FEVEREIRO_2026":
            return { inicio: new Date(2026, 1, 1), fim: new Date(2026, 1, 28) };
        case "JANEIRO_2026":
            return { inicio: new Date(2026, 0, 1), fim: new Date(2026, 0, 31) };
        case "ULTIMO_TRIMESTRE": {
            var fim = new Date(hoje);
            var inicio = new Date(hoje);
            inicio.setMonth(inicio.getMonth() - 3);
            return { inicio: inicio, fim: fim };
        }
        case "PERSONALIZADO":
        default:
            return null;
    }
}

function _atualizarLabelsPeriodo(periodo) {
    var label = PERIODO_LABELS[periodo] || "Período personalizado";
    var ids = ["periodo-top-medicamentos", "periodo-atividade", "periodo-material"];
    ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = label;
    });
}

function _formatarISO(date) {
    if (!date) return "";
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
}

/* ---------- Geração de relatório ---------- */

function gerarRelatorio() {
    var tipo = document.getElementById("tipo-relatorio");
    var periodo = document.getElementById("periodo-relatorio");
    var inicio = document.getElementById("data-inicio");
    var fim = document.getElementById("data-fim");

    var payload = {
        tipo: tipo ? tipo.value : null,
        periodo: periodo ? periodo.value : null,
        inicio: inicio ? inicio.value : null,
        fim: fim ? fim.value : null,
    };

    console.log("[Relatórios] Pedido de geração:", payload);

    if (typeof mostrarNotificacao === "function") {
        mostrarNotificacao(
            "Funcionalidade ainda não disponível — endpoint do backend em desenvolvimento.",
            "aviso"
        );
    }

    /*
     * TODO: ligar ao backend quando os endpoints existirem:
     *   GET /api/enfermeiroChefe/relatorios/kpis?inicio=...&fim=...
     *   GET /api/enfermeiroChefe/relatorios/top-medicamentos?...
     *   GET /api/enfermeiroChefe/relatorios/atividade?...
     *   GET /api/enfermeiroChefe/relatorios/estatisticas?...
     *   GET /api/enfermeiroChefe/relatorios/material?...
     */
}

/* ---------- Render helpers (prontos para uso futuro) ---------- */

function _renderKpis(dados) {
    _setText("kpi-administracoes", dados && dados.administracoes);
    _setText("kpi-nao-administracoes", dados && dados.naoAdministracoes);
    _setText("kpi-incidentes", dados && dados.incidentes);
    _setText("kpi-adesao", dados && dados.taxaAdesao != null ? dados.taxaAdesao + "%" : null);
}

function _renderTopMedicamentos(lista) {
    var tbody = document.getElementById("top-medicamentos-tbody");
    if (!tbody) return;
    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="report-empty">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = lista.map(function (m, i) {
        return "<tr>" +
            "<td>" + (i + 1) + "</td>" +
            "<td>" + (m.nome || "") + "</td>" +
            "<td>" + (m.unidades != null ? m.unidades : "") + "</td>" +
            "<td class=\"" + _classeVar(m.variacao) + "\">" + _formatarVar(m.variacao) + "</td>" +
            "</tr>";
    }).join("");
}

function _renderAtividade(lista) {
    var tbody = document.getElementById("atividade-tbody");
    if (!tbody) return;
    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="report-empty">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = lista.map(function (a) {
        return "<tr>" +
            "<td>" + (a.enfermeiro || "") + "</td>" +
            "<td>" + (a.administracoes != null ? a.administracoes : "") + "</td>" +
            "<td>" + (a.intervencoes != null ? a.intervencoes : "") + "</td>" +
            "<td>" + (a.turnos != null ? a.turnos : "") + "</td>" +
            "</tr>";
    }).join("");
}

function _renderEstatisticas(lista) {
    var tbody = document.getElementById("estatisticas-tbody");
    if (!tbody) return;
    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="report-empty">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = lista.map(function (e) {
        return "<tr>" +
            "<td>" + (e.indicador || "") + "</td>" +
            "<td>" + (e.valor != null ? e.valor : "") + "</td>" +
            "<td>" + (e.referencia || "—") + "</td>" +
            "</tr>";
    }).join("");
}

function _renderMaterial(lista) {
    var tbody = document.getElementById("material-tbody");
    if (!tbody) return;
    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="report-empty">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = lista.map(function (mat) {
        return "<tr>" +
            "<td>" + (mat.nome || "") + "</td>" +
            "<td>" + (mat.quantidade != null ? mat.quantidade : "") + "</td>" +
            "<td>" + (mat.custo != null ? "€" + mat.custo : "") + "</td>" +
            "</tr>";
    }).join("");
}

/* ---------- Utils ---------- */

function _setText(id, valor) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = valor != null && valor !== "" ? String(valor) : "—";
}

function _formatarVar(v) {
    if (v == null || isNaN(v)) return "—";
    var sinal = v > 0 ? "+" : "";
    return sinal + v + "%";
}

function _classeVar(v) {
    if (v == null || isNaN(v)) return "var-neutra";
    if (v > 0) return "var-positiva";
    if (v < 0) return "var-negativa";
    return "var-neutra";
}
