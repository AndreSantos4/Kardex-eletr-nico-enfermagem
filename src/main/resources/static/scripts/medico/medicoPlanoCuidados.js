var _utenteId = null;
var _processoId = null;

const LABELS_INTERVENCAO = {
  VIGILANCIA_CONTINUA: "Vigilância Contínua",
  ADMINISTRACAO_MEDICACAO: "Administração de Medicação",
  AVALIACAO_SINAIS_VITAIS: "Avaliação de Sinais Vitais",
  CUIDADOS_HIGIENE: "Cuidados de Higiene",
  OUTRO: "Outro",
};

const LABELS_FREQUENCIA = {
  CONTINUA: "Contínua",
  UMA_VEZ: "Uma vez",
  DUAS_VEZES: "Duas vezes",
  TRES_VEZES: "Três vezes",
  SOS: "SOS",
};

document.addEventListener("DOMContentLoaded", async function () {
  _utenteId = _obterIdUtente();

  if (_utenteId == null) {
    _avisar({
      titulo: "Erro",
      mensagem: "ID de utente em falta no URL.",
      tipo: "erro",
    });
    return;
  }

  await Promise.all([_carregarMedico(), _carregarUtente()]);
  if (_processoId != null) {
    await _carregarPlano();
  }
});

async function _carregarMedico() {
  try {
    var res = await fetch("http://localhost:8080/api/users/me");
    if (!res.ok) return;
    var json = await res.json();
    if (!json.success || !json.data) return;
    _setText("nome-medico", json.data.nome);
  } catch (err) {
    console.error("[Plano de Cuidados] Erro ao carregar médico:", err);
  }
}

async function _carregarUtente() {
  try {
    var res = await fetch("http://localhost:8080/api/patients/" + _utenteId);
    if (!res.ok) {
      _avisar({
        titulo: "Erro",
        mensagem: "Erro ao carregar dados do utente.",
        tipo: "erro",
      });
      return;
    }
    var json = await res.json();
    if (!json.success || !json.data) {
      _avisar({
        titulo: "Erro",
        mensagem: "Dados do utente não disponíveis.",
        tipo: "erro",
      });
      return;
    }
    var dados = json.data.dados;
    _processoId = dados.processo ? dados.processo.id : null;
    _renderUtente(dados);
  } catch (err) {
    console.error("[Plano de Cuidados] Erro ao carregar utente:", err);
    _avisar({
      titulo: "Erro de ligação",
      mensagem: "Não foi possível comunicar com o servidor.",
      tipo: "erro",
    });
  }
}

async function _carregarPlano() {
  try {
    var res = await fetch(
      "http://localhost:8080/api/processes/" + _processoId + "/plan",
    );
    if (res.status === 404) {
      _mostrarSemPlano();
      return;
    }
    if (!res.ok) {
      _avisar({
        titulo: "Erro",
        mensagem: "Erro ao carregar plano de cuidados.",
        tipo: "erro",
      });
      return;
    }
    var json = await res.json();
    if (!json.success) {
      _avisar({
        titulo: "Erro",
        mensagem: json.message || "Erro ao obter plano.",
        tipo: "erro",
      });
      return;
    }
    var plano = json.data;
    if (!plano) {
      _mostrarSemPlano();
      return;
    }
    _renderEstadoPlano(plano);
    _renderDiagnosticos(plano.diagnosticos);
    _renderObjetivos(plano.objetivos);
    _renderIntervencoes(plano.intervencoes);
  } catch (err) {
    console.error("[Plano de Cuidados] Erro ao carregar plano:", err);
    _avisar({
      titulo: "Erro de ligação",
      mensagem: "Não foi possível comunicar com o servidor.",
      tipo: "erro",
    });
  }
}

function _renderUtente(dados) {
  if (!dados) return;
  var processo = dados.processo || {};
  _setText("utente-nome", dados.nome);
  _setText("utente-processo", processo.id);
  _setText("utente-cama", processo.cama);
  _setText("utente-diagnostico", processo.diagnosticoPrincipal);
  var dias = _calcularDiasInternado(processo.dataEntrada);
  _setText("utente-dias", dias != null ? String(dias) : "—");
}

function _renderEstadoPlano(plano) {
  var nome = plano.autor && plano.autor.dados ? plano.autor.dados.nome : "desconhecido";
  var estadoTexto =
    "Versão " + plano.versao +
    " — Criado em " + (plano.dataCriacao || "—") +
    " por " + nome +
    " — " + (plano.ativo ? "Válido" : "Inválido");
  _setText("estado-plano-texto", estadoTexto);
}

function _renderDiagnosticos(diagnosticos) {
  var container = document.getElementById("diagnosticos-body");
  if (!container) return;
  if (!diagnosticos || diagnosticos.length === 0) {
    container.innerHTML = '<p class="italic text-primary/60">Sem diagnósticos registados.</p>';
    return;
  }
  container.innerHTML = diagnosticos
    .map(function (d) {
      return (
        '<div class="diagnostico-item">' +
        '<h4>' + _escapeHtml(d.diagnostico || "") + '</h4>' +
        '<p>Prioridade: <strong>' + _escapeHtml(d.prioridade || "") + '</strong>' +
        (d.dataCriacao ? ' — Ativo desde ' + _escapeHtml(d.dataCriacao) : '') +
        '</p>' +
        '</div>'
      );
    })
    .join("");
}

function _renderObjetivos(objetivos) {
  var container = document.getElementById("objetivos-body");
  if (!container) return;
  if (!objetivos || objetivos.length === 0) {
    container.innerHTML = '<p class="italic text-primary/60">Sem objetivos definidos.</p>';
    return;
  }
  container.innerHTML = objetivos
    .map(function (o) {
      return '<h4>' + _escapeHtml(o.descricao || "") + '</h4>';
    })
    .join("<br>");
}

function _renderIntervencoes(intervencoes) {
  var tbody = document.getElementById("intervencoes-tbody");
  if (!tbody) return;
  if (!intervencoes || intervencoes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="italic text-primary/60">Sem intervenções para este turno.</td></tr>';
    return;
  }
  tbody.innerHTML = intervencoes
    .map(function (i) {
      var executou = i.funcionarioExecutou && i.funcionarioExecutou.dados
        ? i.funcionarioExecutou.dados.nome
        : "—";
      var horaRegisto = i.dataExecucao ? _formatarDataExecucao(i.dataExecucao) : "—";
      var estado = i.dataExecucao
        ? '<span class="intervencao-executada">✓ Registado</span>'
        : '<span class="intervencao-pendente">Pendente</span>';
      return (
        '<tr>' +
        '<td>' + _escapeHtml(_labelOuOriginal(LABELS_INTERVENCAO, i.intervencao)) + '</td>' +
        '<td>' + _escapeHtml(_labelOuOriginal(LABELS_FREQUENCIA, i.frequencia)) + '</td>' +
        '<td>' + _escapeHtml(i.horarioPrevisto || "—") + '</td>' +
        '<td>' + _escapeHtml(executou) + '</td>' +
        '<td>' + _escapeHtml(horaRegisto) + '</td>' +
        '<td>' + estado + '</td>' +
        '</tr>'
      );
    })
    .join("");
}

function _mostrarSemPlano() {
  _setText("estado-plano-texto", "Não existe nenhum plano de cuidados para este utente.");
  document.getElementById("diagnosticos-body").innerHTML =
    '<p class="italic text-primary/60">Sem diagnósticos registados.</p>';
  document.getElementById("objetivos-body").innerHTML =
    '<p class="italic text-primary/60">Sem objetivos definidos.</p>';
  document.getElementById("intervencoes-tbody").innerHTML =
    '<tr><td colspan="6" class="italic text-primary/60">Sem intervenções para este turno.</td></tr>';
}

function irParaKardex() {
  if (_utenteId == null) return;
  window.location.href = "medicoKardexUtente?id=" + _utenteId;
}

function irParaPrescrever(event) {
  if (event) event.preventDefault();
  if (_utenteId == null) {
    _avisar({
      titulo: "Erro",
      mensagem: "Selecione um utente antes de prescrever.",
      tipo: "erro",
    });
    return;
  }
  window.location.href = "medicoPrescreverMedicamento?id=" + _utenteId;
}

function _labelOuOriginal(mapa, valor) {
  if (valor == null) return "—";
  return mapa[valor] != null ? mapa[valor] : valor;
}

function _parseDateBackend(str) {
  if (!str) return null;
  var m = String(str).match(/^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2})/);
  if (!m) return null;
  return new Date(
    parseInt(m[3], 10),
    parseInt(m[2], 10) - 1,
    parseInt(m[1], 10),
    parseInt(m[4], 10),
    parseInt(m[5], 10),
  );
}

function _formatarDataExecucao(raw) {
  if (!raw) return "—";
  var m = String(raw).match(/^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2})/);
  if (m) return m[1] + "/" + m[2] + "/" + m[3] + " " + m[4] + ":" + m[5];
  var d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  var dia = String(d.getDate()).padStart(2, "0");
  var mes = String(d.getMonth() + 1).padStart(2, "0");
  var ano = d.getFullYear();
  var hh = String(d.getHours()).padStart(2, "0");
  var mm = String(d.getMinutes()).padStart(2, "0");
  return dia + "/" + mes + "/" + ano + " " + hh + ":" + mm;
}

function _calcularDiasInternado(dataEntrada) {
  var d = _parseDateBackend(dataEntrada);
  if (!d) return null;
  var diff = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

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

function _avisar(opts) {
  if (typeof mostrarNotificacao === "function") {
    mostrarNotificacao(opts);
  } else {
    console.warn("[Plano de Cuidados]", opts.titulo, opts.mensagem);
  }
}
