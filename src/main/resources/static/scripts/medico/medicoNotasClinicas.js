var _utenteId = null;
var _processoId = null;

document.addEventListener("DOMContentLoaded", function () {
  _utenteId = _obterIdUtente();

  if (_utenteId == null) {
    _avisar({
      titulo: "Erro",
      mensagem: "ID de utente em falta no URL.",
      tipo: "erro",
    });
    return;
  }

  _carregarPopups().then(function () {
    _inicializar();
  });
});

async function _inicializar() {
  await Promise.all([_carregarMedico(), _carregarUtente()]);
  if (_processoId != null) {
    await _carregarNotas();
  }
}

async function _carregarMedico() {
  try {
    var res = await fetch("http://localhost:8080/api/users/me");
    if (!res.ok) return;
    var json = await res.json();
    if (!json.success || !json.data) return;
    _setText("nome-medico", json.data.nome);
  } catch (err) {
    console.error("[Notas Clínicas] Erro ao carregar médico:", err);
  }
}

async function _carregarPopups() {
  var popups = ["../../pages/medico/popups/popupNovaNotaEvolucao.html"];

  for (var i = 0; i < popups.length; i++) {
    var url = popups[i];
    try {
      var res = await fetch(url);
      if (!res.ok) {
        console.warn(
          "[Notas Clínicas] Não foi possível carregar o popup:",
          url,
        );
        continue;
      }
      var html = await res.text();
      var div = document.createElement("div");
      div.innerHTML = html;
      var container =
        document.getElementById("popup-container") || document.body;
      while (div.firstChild) {
        container.appendChild(div.firstChild);
      }
    } catch (err) {
      console.error("[Notas Clínicas] Erro a carregar popup:", url, err);
    }
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
    console.error("[Notas Clínicas] Erro ao carregar utente:", err);
    _avisar({
      titulo: "Erro de ligação",
      mensagem: "Não foi possível comunicar com o servidor.",
      tipo: "erro",
    });
  }
}

async function _carregarNotas() {
  try {
    var res = await fetch(
      "http://localhost:8080/api/processes/" + _processoId + "/notes",
    );
    if (!res.ok) {
      _avisar({
        titulo: "Erro",
        mensagem: "Erro ao carregar notas de evolução.",
        tipo: "erro",
      });
      return;
    }
    var json = await res.json();
    if (!json.success) {
      _avisar({
        titulo: "Erro",
        mensagem: json.message || "Erro ao obter notas.",
        tipo: "erro",
      });
      return;
    }
    _renderNotas(json.data || []);
  } catch (err) {
    console.error("[Notas Clínicas] Erro ao carregar notas:", err);
    _avisar({
      titulo: "Erro de ligação",
      mensagem: "Não foi possível comunicar com o servidor.",
      tipo: "erro",
    });
  }
}

function abrirNovaNota() {
  var popup = document.getElementById("popup-nova-nota");
  if (!popup) {
    _avisar({
      titulo: "Erro",
      mensagem: "Não foi possível abrir o popup de nova nota.",
      tipo: "erro",
    });
    return;
  }
  var inputDataHora = document.getElementById("data-hora-nota");
  if (inputDataHora) {
    inputDataHora.value = _agoraFormatoBackend();
  }
  var textareaJust = document.getElementById("justificacao-clinica");
  if (textareaJust) textareaJust.value = "";
  popup.style.display = "flex";
}

function fecharPopupNovaNota() {
  var popup = document.getElementById("popup-nova-nota");
  if (popup) popup.style.display = "none";
}

async function submeterNovaNota(event) {
  if (event) event.preventDefault();

  if (_processoId == null) {
    _avisar({
      titulo: "Erro",
      mensagem: "Processo do utente não encontrado.",
      tipo: "erro",
    });
    return;
  }

  var justificacao = (document.getElementById("justificacao-clinica") || {})
    .value;
  var dataHora = (document.getElementById("data-hora-nota") || {}).value;
  var tipoNota = (document.getElementById("tipo-nota") || {}).value;

  if (!justificacao || justificacao.trim() === "") {
    _avisar({
      titulo: "Campo obrigatório",
      mensagem: "Indique a justificação clínica antes de publicar.",
      tipo: "aviso",
    });
    return;
  }
  if (!dataHora) {
    _avisar({
      titulo: "Campo obrigatório",
      mensagem: "Indique a data/hora da nota.",
      tipo: "aviso",
    });
    return;
  }

  var payload = {
    tipo: tipoNota || "S",
    justificacaoClinica: justificacao.trim(),
    data: _converterDataParaBackend(dataHora),
  };

  try {
    var res = await fetch(
      "http://localhost:8080/api/processes/" + _processoId + "/notes",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    var json = await res.json();

    if (!res.ok || !json.success) {
      _avisar({
        titulo: "Erro ao guardar",
        mensagem: json.message || "Erro ao guardar a nota.",
        tipo: "erro",
      });
      return;
    }

    fecharPopupNovaNota();
    _avisar({
      titulo: "Nota guardada",
      mensagem: "A nota de evolução foi registada com sucesso.",
      tipo: "sucesso",
    });
    await _carregarNotas();
  } catch (err) {
    console.error("[Notas Clínicas] Erro ao submeter nota:", err);
    _avisar({
      titulo: "Erro de ligação",
      mensagem: "Não foi possível comunicar com o servidor.",
      tipo: "erro",
    });
  }
}

function irParaKardex() {
  if (_utenteId == null) {
    _avisar({
      titulo: "Erro",
      mensagem: "ID de utente em falta.",
      tipo: "erro",
    });
    return;
  }
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

function abrirHistInternamentos() {
  if (_utenteId == null) {
    _avisar({
      titulo: "Erro",
      mensagem: "ID de utente em falta.",
      tipo: "erro",
    });
    return;
  }
  // TODO: implementar página/popup de histórico de internamentos anteriores
  //   GET /api/patients/{utenteId}/processes  (ou endpoint equivalente)
  _avisar({
    titulo: "Não disponível",
    mensagem:
      "Funcionalidade ainda não disponível — endpoint em desenvolvimento.",
    tipo: "aviso",
  });
}

function fecharNotasClinicas() {
  if (_utenteId != null) {
    window.location.href = "medicoKardexUtente?id=" + _utenteId;
  } else {
    window.location.href = "medicoListaUtentes";
  }
}

function _renderUtente(dados) {
  if (!dados) return;

  var processo = dados.processo || {};

  _setText("utente-nome", dados.nome);
  _setText("header-utente-nome", dados.nome);
  _setText("utente-processo", processo.id);
  _setText("utente-cama", processo.cama);
  _setText("utente-diagnostico", processo.diagnosticoPrincipal);

  var dias = _calcularDiasInternado(processo.dataEntrada);
  _setText("utente-dias", dias != null ? String(dias) : "—");
}

function _renderNotas(lista) {
  var container = document.getElementById("notas-lista");
  if (!container) return;

  if (!lista || lista.length === 0) {
    container.innerHTML =
      '<div class="nota-empty">Sem notas de evolução registadas.</div>';
    return;
  }

  var ordenadas = lista.slice().sort(function (a, b) {
    return _parseDateBackend(b.data) - _parseDateBackend(a.data);
  });

  container.innerHTML = ordenadas
    .map(function (n) {
      var nomeMedico = n.medico && n.medico.dados ? n.medico.dados.nome : "—";
      var dataHora = _formatarDataHora(n.data);
      return (
        '<div class="nota-item">' +
        '<div class="nota-header">' +
        _escapeHtml(nomeMedico) +
        ' <span class="nota-meta">- ' +
        _escapeHtml(dataHora) +
        "</span>" +
        "</div>" +
        '<div class="nota-texto">' +
        _escapeHtml(n.justificacaoClinica || "") +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

function _parseDateBackend(str) {
  if (!str) return null;
  var m = str.match(/^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2})/);
  if (!m) return null;
  return new Date(
    parseInt(m[3], 10),
    parseInt(m[2], 10) - 1,
    parseInt(m[1], 10),
    parseInt(m[4], 10),
    parseInt(m[5], 10),
  );
}

function _formatarDataHora(str) {
  if (!str) return "—";
  var m = str.match(/^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2})/);
  if (!m) return str;
  return m[1] + "/" + m[2] + "/" + m[3] + " - " + m[4] + ":" + m[5];
}

function _converterDataParaBackend(iso) {
  if (!iso) return "";
  var m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return iso;
  return m[3] + "/" + m[2] + "/" + m[1] + ":" + m[4] + ":" + m[5];
}

function _agoraFormatoBackend() {
  var d = new Date();
  var off = d.getTimezoneOffset();
  var loc = new Date(d.getTime() - off * 60000);
  return loc.toISOString().slice(0, 16);
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

function _avisar({ titulo, mensagem, tipo = "aviso" } = {}) {
  if (typeof mostrarNotificacao === "function") {
    mostrarNotificacao({ titulo, mensagem, tipo });
  } else {
    console.warn("[Notas Clínicas]", titulo, mensagem);
  }
}
