/* =============================================================
 *  Admin - Relatórios e Indicadores
 * ============================================================= */

const BASE_URL = "http://localhost:8080/api/stats";

document.addEventListener("DOMContentLoaded", function () {
  _inicializarDatas();
  carregarTodos();
});

/* ---------- Inicialização ---------- */

function _inicializarDatas() {
  var inputInicio = document.getElementById("data-inicio");
  var inputFim = document.getElementById("data-fim");
  if (!inputInicio || !inputFim) return;

  var hoje = new Date();
  var inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  inputInicio.value = _formatarISO(inicio);
  inputFim.value = _formatarISO(hoje);
}

function _formatar(isoDate) {
  if (!isoDate) return "";
  var partes = isoDate.split("-");
  if (partes.length !== 3) return isoDate;
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

/* ---------- Carregamento de dados ---------- */

function carregarTodos() {
  var inicio = document.getElementById("data-inicio")
    ? document.getElementById("data-inicio").value
    : "";
  var fim = document.getElementById("data-fim")
    ? document.getElementById("data-fim").value
    : "";

  var qs = "";
  if (inicio && fim) qs = "?de=" + _formatar(inicio) + "&ate=" + _formatar(fim);

  _carregarKpis(qs);
  _carregarTopMedicamentos(qs);
  _carregarAtividade(qs);
  _carregarCateteres(qs);
}

function _carregarKpis(qs) {
  fetch(BASE_URL + "/reports" + qs)
    .then(function (r) {
      return r.json();
    })
    .then(function (json) {
      if (json && json.success && json.data) {
        _renderKpis(json.data);
      }
    })
    .catch(function (err) {
      console.error("[KPIs]", err);
    });
}

function _carregarTopMedicamentos(qs) {
  fetch(BASE_URL + "/medications/ranking" + qs)
    .then(function (r) {
      return r.json();
    })
    .then(function (json) {
      if (json && json.success) _renderTopMedicamentos(json.data);
    })
    .catch(function (err) {
      console.error("[Top Medicamentos]", err);
    });
}

function _carregarAtividade(qs) {
  fetch(BASE_URL + "/workers/activity" + qs)
    .then(function (r) {
      return r.json();
    })
    .then(function (json) {
      if (json && json.success) _renderAtividade(json.data);
    })
    .catch(function (err) {
      console.error("[Atividade]", err);
    });
}

function _carregarCateteres(qs) {
  fetch(BASE_URL + "/cateters/usage" + qs)
    .then(function (r) {
      return r.json();
    })
    .then(function (json) {
      if (json && json.success) _renderCateteres(json.data);
    })
    .catch(function (err) {
      console.error("[Cateteres]", err);
    });
}

/* ---------- Render ---------- */

function _renderKpis(dados) {
  _setText("kpi-administracoes", dados.administracoes);
  _setText("kpi-nao-administracoes", dados.nNaoAdministracoes);
  _setText("kpi-incidentes", dados.nIncidentesClinicos);
}

function _renderTopMedicamentos(lista) {
  var tbody = document.getElementById("top-medicamentos-tbody");
  if (!tbody) return;
  if (!lista || lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="!text-center !py-6 !text-white/60 !italic">Sem dados disponíveis.</td></tr>';
    return;
  }
  tbody.innerHTML = lista
    .slice(0, 10)
    .map(function (m, i) {
      var qtd =
        m.quantidade_gasta != null
          ? m.quantidade_gasta + " " + _formatarUnidade(m.unidade_medida)
          : "—";
      return (
        "<tr>" +
        "<td>" +
        (i + 1) +
        "</td>" +
        "<td>" +
        (m.nome || "") +
        "</td>" +
        "<td>" +
        qtd +
        "</td>" +
        "<td>" +
        (m.total_administracoes != null
          ? m.total_administracoes + " adm."
          : "—") +
        "</td>" +
        "</tr>"
      );
    })
    .join("");
}

function _renderAtividade(lista) {
  var tbody = document.getElementById("atividade-tbody");
  if (!tbody) return;
  if (!lista || lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="!text-center !py-6 !text-white/60 !italic">Sem dados disponíveis.</td></tr>';
    return;
  }
  tbody.innerHTML = lista
    .map(function (a) {
      return (
        "<tr>" +
        "<td>" +
        (a.nome || "") +
        "</td>" +
        "<td>" +
        (a.administracoes != null ? a.administracoes : "—") +
        "</td>" +
        "<td>" +
        (a.intervencoes != null ? a.intervencoes : "—") +
        "</td>" +
        "<td>" +
        (a.turnos != null ? a.turnos : "—") +
        "</td>" +
        "</tr>"
      );
    })
    .join("");
}

function _renderCateteres(lista) {
  var tbody = document.getElementById("material-tbody");
  if (!tbody) return;
  if (!lista || lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="!text-center !py-6 !text-white/60 !italic">Sem dados disponíveis.</td></tr>';
    return;
  }
  tbody.innerHTML = lista
    .map(function (c) {
      return (
        "<tr>" +
        "<td>" +
        _formatarTipoCateter(c.tipo) +
        "</td>" +
        "<td>" +
        (c.calibre || "—") +
        "</td>" +
        "<td>" +
        (c.quantidade != null ? c.quantidade : "—") +
        "</td>" +
        "</tr>"
      );
    })
    .join("");
}

/* ---------- Utils ---------- */

function _setText(id, valor) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = valor != null && valor !== "" ? String(valor) : "—";
}

function _formatarISO(date) {
  if (!date) return "";
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, "0");
  var d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function _formatarUnidade(u) {
  if (!u) return "";
  var map = {
    MILIGRAMAS: "mg",
    GRAMAS: "g",
    MILILITROS: "ml",
    LITROS: "L",
    MICROGRAMAS: "mcg",
    UNIDADES: "un.",
  };
  return map[u] || u;
}

function _formatarTipoCateter(tipo) {
  if (!tipo) return "—";
  var map = {
    VENOSO_PERIFERICO: "Venoso Periférico",
    VENOSO_CENTRAL: "Venoso Central",
    PICC: "PICC",
    ARTERIAL: "Arterial",
  };
  return map[tipo] || tipo;
}
