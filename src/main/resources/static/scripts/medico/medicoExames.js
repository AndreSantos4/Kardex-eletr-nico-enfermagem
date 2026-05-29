async function carregarPopup(caminho) {
  const res = await fetch(caminho);
  const html = await res.text();
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div);
}

const params = new URLSearchParams(window.location.search);
const pacienteId = params.get("id");
let processoId = null;
let exameIdAtual = null;

const tipoLabels = {
  HEMOGRAMA_COMPLETO: "Hemograma Completo",
  PAINEL_METABOLICO: "Painel metabólico",
  FUNCAO_HEPATICA: "Função hepática",
  FUNCAO_TIROIDE: "Função tiroide",
  NIVEIS_VITAMINAS: "Níveis de vitaminas",
};

const urgenciaLabels = {
  BAIXA: "Baixa",
  MODERADA: "Moderada",
  NORMAL: "Normal",
  ALTA: "Alta",
};

const estadoLabels = {
  PEDIDO_PENDENTE: "Pedido Pendente",
  AGENDADO: "Agendado",
  AGUARDANDO_RESULTADO: "Aguarda resultado",
  CONCLUIDO: "Concluído",
};

function _escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function _formatarData(raw) {
  if (!raw) return "—";
  const m = String(raw).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}`;
  const d = new Date(raw);
  if (isNaN(d)) return String(raw);
  return d.toLocaleDateString("pt-PT");
}

function _formatarDataHora(raw) {
  if (!raw) return "—";
  const m = String(raw).match(/^(\d{2})\/(\d{2})\/(\d{4})(?::(\d{2}):(\d{2}))?/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}${m[4] ? ` ${m[4]}:${m[5]}` : ""}`;
  const d = new Date(raw);
  if (isNaN(d)) return String(raw);
  return d.toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function irParaKardex() {
  if (pacienteId) window.location.href = `medicoKardexUtente?id=${pacienteId}`;
}

async function init() {
  try {
    await carregarPopup(
      "../../pages/medico/popups/popupPrescreverExameComplementar.html",
    );
    await carregarPopup(
      "../../pages/medico/popups/popupEditarExameComplementar.html",
    );
    const popupPrescrever = document.getElementById("popup-prescrever-exame");
    if (popupPrescrever) popupPrescrever.style.display = "none";
    const popupEditar = document.getElementById("popup-editar-exame");
    if (popupEditar) popupEditar.style.display = "none";
  } catch (err) {
    console.warn("[Exames] Erro a carregar popups:", err);
  }

  try {
    const meRes = await fetch("http://localhost:8080/api/users/me");
    if (meRes.ok) {
      const meJson = await meRes.json();
      const nomeEl = document.getElementById("nome-medico");
      if (nomeEl && meJson?.data?.nome) nomeEl.textContent = meJson.data.nome;
    }
  } catch (err) {
    console.warn("[Exames] Erro a carregar médico:", err);
  }

  if (!pacienteId) {
    _mostrarErroUtente("ID de utente em falta no URL.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/patients/${pacienteId}`);
    if (!res.ok) {
      _mostrarErroUtente(`Não foi possível carregar o utente (HTTP ${res.status}).`);
      return;
    }
    const json = await res.json();
    const dados = json?.data?.dados;
    const processo = dados?.processo;
    if (!dados || !processo) {
      _mostrarErroUtente("Utente sem processo ativo.");
      return;
    }

    processoId = processo.id;

    document.getElementById("nome-utente").textContent = dados.nome ?? "—";
    document.getElementById("processo").textContent = processo.id ?? "—";
    document.getElementById("cama").textContent = processo.cama?.id ?? processo.cama ?? "Não atribuído";
    document.getElementById("diagnostico").textContent = processo.diagnosticoPrincipal ?? "—";

    const dias = _calcularDiasInternado(processo.dataEntrada);
    document.getElementById("dias-internado").textContent = dias != null ? String(dias) : "—";

    await carregarExames();
  } catch (err) {
    console.error("[Exames] Erro a inicializar:", err);
    _mostrarErroUtente("Erro ao carregar os dados do utente.");
  }
}

function _calcularDiasInternado(dataEntrada) {
  if (!dataEntrada) return null;
  const m = String(dataEntrada).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const d = new Date(`${m[3]}-${m[2]}-${m[1]}`);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

function _mostrarErroUtente(msg) {
  const exames = document.getElementById("exames-list");
  if (exames) exames.innerHTML = `<p class="text-secondary text-[13px] italic text-center py-6">${msg}</p>`;
  const resultados = document.getElementById("resultados-list");
  if (resultados) resultados.innerHTML = `<p class="text-secondary text-[13px] italic text-center py-6">${msg}</p>`;
}

async function carregarExames() {
  const res = await fetch(
    `http://localhost:8080/api/processes/${processoId}/exams`,
  );
  const json = await res.json();
  const exames = json.data ?? [];

  _renderExamesList(exames);
  _renderResultadosList(exames);
}

function _renderExamesList(exames) {
  const list = document.getElementById("exames-list");
  if (!list) return;

  const countEl = document.getElementById("exames-count");
  if (countEl) countEl.textContent = exames && exames.length > 0 ? String(exames.length) : "";

  if (!exames || exames.length === 0) {
    list.innerHTML = '<p class="m-0 italic text-primary/55 text-[13px] text-center py-6">Sem exames prescritos.</p>';
    return;
  }

  list.innerHTML = exames.map((exame) => {
    const tipo = tipoLabels[exame.tipo] ?? exame.tipo ?? "—";
    const urgenciaKey = String(exame.urgencia ?? "").toUpperCase();
    const urgencia = urgenciaLabels[exame.urgencia] ?? exame.urgencia ?? "—";
    const medico = exame.medico?.dados?.nome ?? exame.medico?.nome ?? "";
    const dataPedido = _formatarData(exame.dataPedido);
    const dataPretendida = _formatarData(exame.dataPretendida);
    const estado = estadoLabels[exame.estado] ?? exame.estado ?? "—";
    const indicacao = (exame.indicacaoClinica ?? "").replace(/'/g, "\\'");

    return `
      <div class="exame-row">
        <div class="exame-cell">
          <span class="exame-cell-valor">${_escapeHtml(tipo)}</span>
          ${medico ? `<span class="exame-cell-sub">${_escapeHtml(medico)}</span>` : ""}
        </div>
        <div class="exame-cell">
          <span class="urg-badge urg-${urgenciaKey}">${_escapeHtml(urgencia)}</span>
        </div>
        <div class="exame-cell">
          <span class="exame-cell-valor">${_escapeHtml(dataPedido)}</span>
        </div>
        <div class="exame-cell">
          <span class="exame-cell-valor">${_escapeHtml(dataPretendida)}</span>
        </div>
        <div class="exame-cell">
          <span class="estado-badge">${_escapeHtml(estado)}</span>
        </div>
        <div class="exame-actions">
          <button class="btn-exame" onclick="abrirPopupEditar(${exame.id}, '${exame.urgencia}', '${exame.dataPretendida ?? ""}', '${indicacao}')">EDITAR</button>
          <button class="btn-exame btn-eliminar" onclick="eliminarExame(${exame.id})">ELIMINAR</button>
        </div>
      </div>`;
  }).join("");
}

function _renderResultadosList(exames) {
  const list = document.getElementById("resultados-list");
  if (!list) return;

  const comResultado = (exames ?? []).filter(e => e.resultado != null);

  const countEl = document.getElementById("resultados-count");
  if (countEl) countEl.textContent = comResultado.length > 0 ? String(comResultado.length) : "";

  if (comResultado.length === 0) {
    list.innerHTML = '<p class="m-0 italic text-primary/55 text-[13px] text-center py-6">Sem resultados disponíveis.</p>';
    return;
  }

  list.innerHTML = comResultado.map((exame) => {
    const tipo = tipoLabels[exame.tipo] ?? exame.tipo ?? "—";
    const r = exame.resultado;
    const data = _formatarData(r.data ?? exame.dataPedido);
    const corpo = r.resultado ?? "";
    const atencao = !!r.atencao;
    const atencaoDesc = r.atencaoDescricao ?? "";
    const flagTexto = atencao ? "Atenção" : "Normal";
    const flagClass = atencao ? "flag-atencao" : "flag-ok";

    return `
      <div class="resultado-card">
        <div class="resultado-head">
          <div class="resultado-titulo">${_escapeHtml(tipo)}${data && data !== "—" ? ` — ${data}` : ""}</div>
          <span class="resultado-flag ${flagClass}">${flagTexto}</span>
        </div>
        ${corpo ? `<div class="resultado-corpo">${_escapeHtml(corpo)}</div>` : ""}
        ${atencao && atencaoDesc ? `<div class="resultado-meta">⚠ ${_escapeHtml(atencaoDesc)}</div>` : ""}
      </div>`;
  }).join("");
}

function abrirPopup() {
  document.getElementById("popup-prescrever-exame").style.display = "flex";
  document.getElementById("popup-tipo-exame").value = "HEMOGRAMA_COMPLETO";
  document.getElementById("popup-urgencia").value = "NORMAL";
  document.getElementById("popup-data-pretendida").value = "";
  document.getElementById("popup-indicacao").value = "";
  document.getElementById("popup-observacoes").value = "";
}

function fecharPopup() {
  document.getElementById("popup-prescrever-exame").style.display = "none";
}

async function submeterExame() {
  const tipo = document.getElementById("popup-tipo-exame").value;
  const urgencia = document.getElementById("popup-urgencia").value;
  const dataRaw = document.getElementById("popup-data-pretendida").value;
  const indicacao = document.getElementById("popup-indicacao").value.trim();
  const observacoes = document.getElementById("popup-observacoes").value.trim();

  if (!tipo || !urgencia || !dataRaw || !indicacao) {
    mostrarNotificacao({
      titulo: "Campos obrigatórios",
      mensagem: "Preencha todos os campos obrigatórios.",
      tipo: "erro",
    });
    return;
  }

  const [ano, mes, dia] = dataRaw.split("-");
  const dataPretendida = `${dia}/${mes}/${ano}`;

  const body = { tipo, urgencia, dataPretendida, indicacao };
  if (observacoes) body.observacoes = observacoes;

  const res = await fetch(
    `http://localhost:8080/api/processes/${processoId}/exams`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (res.ok) {
    fecharPopup();
    mostrarNotificacao({
      titulo: "Exame prescrito",
      mensagem: "O exame foi prescrito com sucesso.",
      tipo: "sucesso",
    });
    await carregarExames();
  } else {
    mostrarNotificacao({
      titulo: "Erro ao prescrever",
      mensagem: "Não foi possível prescrever o exame.",
      tipo: "erro",
    });
  }
}

function abrirPopupEditar(id, urgencia, dataPretendida, indicacao) {
  exameIdAtual = id;
  document.getElementById("edit-urgencia").value = urgencia;
  document.getElementById("edit-indicacao").value = indicacao;

  if (dataPretendida) {
    const partes = dataPretendida.split("/");
    document.getElementById("edit-data-pretendida").value =
      `${partes[2]}-${partes[1]}-${partes[0]}`;
  } else {
    document.getElementById("edit-data-pretendida").value = "";
  }

  document.getElementById("popup-editar-exame").style.display = "flex";
}

function fecharPopupEditar() {
  document.getElementById("popup-editar-exame").style.display = "none";
  exameIdAtual = null;
}

async function submeterEdicao() {
  const urgencia = document.getElementById("edit-urgencia").value;
  const dataRaw = document.getElementById("edit-data-pretendida").value;
  const indicacao = document.getElementById("edit-indicacao").value.trim();

  if (!urgencia || !dataRaw || !indicacao) {
    mostrarNotificacao({
      titulo: "Campos obrigatórios",
      mensagem: "Preencha todos os campos obrigatórios.",
      tipo: "erro",
    });
    return;
  }

  const [ano, mes, dia] = dataRaw.split("-");
  const dataPretendida = `${dia}/${mes}/${ano}`;

  const res = await fetch(
    `http://localhost:8080/api/processes/exams/${exameIdAtual}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urgencia, dataPretendida, indicacao }),
    },
  );

  if (res.ok) {
    fecharPopupEditar();
    mostrarNotificacao({
      titulo: "Exame atualizado",
      mensagem: "O exame foi atualizado com sucesso.",
      tipo: "sucesso",
    });
    await carregarExames();
  } else {
    mostrarNotificacao({
      titulo: "Erro ao atualizar",
      mensagem: "Não foi possível atualizar o exame.",
      tipo: "erro",
    });
  }
}

async function eliminarExame(id) {
  if (!confirm("Tem a certeza que pretende eliminar este exame?")) return;

  const res = await fetch(`http://localhost:8080/api/processes/exams/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    mostrarNotificacao({
      titulo: "Exame eliminado",
      mensagem: "O exame foi eliminado com sucesso.",
      tipo: "sucesso",
    });
    await carregarExames();
  } else {
    mostrarNotificacao({
      titulo: "Erro ao eliminar",
      mensagem: "Não foi possível eliminar o exame.",
      tipo: "erro",
    });
  }
}

init();
