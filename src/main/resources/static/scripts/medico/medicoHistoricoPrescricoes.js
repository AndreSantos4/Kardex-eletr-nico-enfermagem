const params = new URLSearchParams(window.location.search);
const patientId = params.get("id");

const OPCOES_ITEMS_POR_PAGINA = [5, 10, 20, 30, 50];

let todasPrescricoes = [];
let prescricoesFiltradas = [];
let paginaAtual = 0;
let itemsPorPagina = 10;
let processId = null;

let debounceTimer = null;

// ─── POPUP SUSPENDER ────────────────────────────────────────────────────────

let prescricaoSelecionadaParaSuspender = null;

function injetarPopupSuspender() {
  const container = document.getElementById("popup-container");
  if (!container) return;

  container.innerHTML = `
    <div class="popup-overlay" id="popup-suspender" style="display: none;">
      <div class="popup-box-suspender">
        <div class="popup-header-suspender">
          <span>Suspender Prescrição</span>
          <button class="popup-close-suspender" onclick="fecharPopupSuspender()">&#10005;</button>
        </div>
        <div class="popup-content-suspender">
          <div class="popup-prescricao-card" id="popup-prescricao-card">
            <div class="prescricao-nome">
              <span class="prescricao-medicamento">—</span>
            </div>
            <div class="prescricao-detalhe">—</div>
          </div>
          <form id="form-suspender" onsubmit="submeterSuspensao(event)">
            <div class="popup-row-2cols">
              <div class="popup-field-suspender">
                <label class="popup-label">TIPO DE SUSPENSÃO *</label>
                <select id="tipo-suspensao" class="popup-select" onchange="toggleDataRetoma(this.value)">
                  <option value="TEMPORARIA">Temporária (definir data retoma)</option>
                  <option value="DEFINITIVA">Definitiva</option>
                </select>
              </div>
              <div class="popup-field-suspender" id="campo-data-retoma">
                <label class="popup-label">DATA RETOMA (SE TEMPORÁRIA) *</label>
                <input type="date" id="data-retoma" class="popup-input" />
              </div>
            </div>
            <div class="popup-field-suspender">
              <label class="popup-label">MOTIVO CLÍNICO *</label>
              <select id="motivo-clinico" class="popup-select">
                <option value="RECUSA_SISTEMATICA_UTENTE">Recusa sistemática do utente</option>
                <option value="REACAO_ADVERSO">Reação adversa</option>
                <option value="INTERACAO_MEDICAMENTO">Interação medicamentosa</option>
                <option value="FALTA_EFICACIA">Falta de eficácia</option>
                <option value="REMISSAO_CLINICA">Remissão clínica</option>
                <option value="SUBSTITUICAO">Substituição</option>
                <option value="ERRO">Erro</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div class="popup-field-suspender">
              <label class="popup-label">OBSERVAÇÕES *</label>
              <textarea id="observacoes-suspensao" class="popup-textarea" placeholder="Justificação clínica detalhada..." rows="4"></textarea>
            </div>
            <div class="popup-info-note">
              <div class="info-icon">i</div>
              <span>Suspensão registada como imutável. Enfermeiro notificado. Stock reservado libertado.</span>
            </div>
            <div class="popup-actions-suspender">
              <button type="button" class="btn-cancelar-suspender" onclick="fecharPopupSuspender()">CANCELAR</button>
              <button type="submit" class="btn-confirmar-suspender">Suspender prescrição</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function abrirPopupSuspender(prescricao) {
  prescricaoSelecionadaParaSuspender = prescricao;

  const doseValor = obterValorDose(prescricao.dose);
  const unidade = obterUnidadeMedida(prescricao.dose, prescricao.medicamento);
  const via = prescricao.medicamento?.viaAdministracao ?? "—";
  const freq = prescricao.frequencia
    ? `${prescricao.frequencia.frequencia}x/${prescricao.frequencia.periodo?.toLowerCase() ?? ""}`
    : "—";
  const medico = prescricao.medico ? `Dr(a). ${prescricao.medico.nome}` : null;

  const partes = [via, freq, medico].filter(Boolean).join(" - ");

  document.getElementById("popup-prescricao-card").innerHTML = `
    <div class="prescricao-nome">
      <span class="prescricao-medicamento">${prescricao.medicamento?.nome ?? "—"} ${doseValor}${unidade}</span>
      ${partes ? ` - ${partes}` : ""}
    </div>
    <div class="prescricao-detalhe">Prescrita ${formatarData(prescricao.inicio)} · ${prescricao.motivo ?? "—"}</div>
  `;

  // Reset form
  document.getElementById("tipo-suspensao").value = "TEMPORARIA";
  document.getElementById("data-retoma").value = "";
  document.getElementById("motivo-clinico").value = "RECUSA_SISTEMATICA_UTENTE";
  document.getElementById("observacoes-suspensao").value = "";
  document.getElementById("campo-data-retoma").style.display = "";

  document.getElementById("popup-suspender").style.display = "flex";
}

function fecharPopupSuspender() {
  document.getElementById("popup-suspender").style.display = "none";
  prescricaoSelecionadaParaSuspender = null;
}

function toggleDataRetoma(valor) {
  const campo = document.getElementById("campo-data-retoma");
  campo.style.display = valor === "DEFINITIVA" ? "none" : "";
}

async function submeterSuspensao(event) {
  event.preventDefault();

  if (!prescricaoSelecionadaParaSuspender) return;

  const tipo = document.getElementById("tipo-suspensao").value;
  const definitiva = tipo === "DEFINITIVA";
  const dataRetoma = document.getElementById("data-retoma").value;

  if (!definitiva && !dataRetoma) {
    mostrarNotificacao({ titulo: "Campo obrigatório", mensagem: "Por favor, indique a data de retoma.", tipo: "aviso" });
    return;
  }

  // Converter data de yyyy-mm-dd para dd/mm/yyyy
  let dataRetornoFormatada = null;
  if (!definitiva && dataRetoma) {
    const [ano, mes, dia] = dataRetoma.split("-");
    dataRetornoFormatada = `${dia}/${mes}/${ano}`;
  }

  const motivo = document.getElementById("motivo-clinico").value;
  const observacoes = document.getElementById("observacoes-suspensao").value.trim();

  const body = {
    definitiva,
    dataRetorno: dataRetornoFormatada,
    motivo,
    observacoes,
  };

  const btnConfirmar = document.querySelector(".btn-confirmar-suspender");
  if (btnConfirmar) btnConfirmar.disabled = true;

  try {
    const resp = await fetch(
      `/api/processes/prescriptions/${prescricaoSelecionadaParaSuspender.id}/suspend`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    fecharPopupSuspender();
    mostrarNotificacao({ titulo: "Prescrição suspensa", mensagem: "A prescrição foi suspensa com sucesso.", tipo: "sucesso" });
    await recarregarPrescricoes();
  } catch (err) {
    console.error("[Suspender] Erro:", err);
    mostrarNotificacao({ titulo: "Erro ao suspender", mensagem: "Não foi possível suspender a prescrição. Tente novamente.", tipo: "erro" });
  } finally {
    if (btnConfirmar) btnConfirmar.disabled = false;
  }
}

async function suspenderPrescricao(prescricaoId) {
  const prescricao = todasPrescricoes.find((p) => p.id == prescricaoId);
  if (!prescricao) return;
  abrirPopupSuspender(prescricao);
}

// ─── UTILITÁRIOS ────────────────────────────────────────────────────────────

const UNIDADES_MAP = {
  MILIGRAMAS: "mg",
  GRAMAS: "g",
  MICROGRAMAS: "mcg",
  MILILITROS: "mL",
  LITROS: "L",
  UNIDADES: "U",
  COMPRIMIDOS: "comp.",
  AMPOLAS: "amp.",
  GOTAS: "gt.",
};

function formatarUnidade(u) {
  if (!u) return "";
  return UNIDADES_MAP[u.toUpperCase()] ?? u;
}

function calcularDuracao(inicioStr, fimStr) {
  if (!inicioStr || !fimStr) return null;
  const inicio = parseDateStr(inicioStr);
  const fim = parseDateStr(fimStr);
  if (!inicio || !fim) return null;
  const dias = Math.round((fim.getTime() - inicio.getTime()) / 86400000);
  return dias >= 0 ? dias : null;
}

function parseDateStr(str) {
  if (!str) return null;

  const matchPt = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (matchPt) {
    return new Date(
      parseInt(matchPt[3], 10),
      parseInt(matchPt[2], 10) - 1,
      parseInt(matchPt[1], 10),
    );
  }

  const matchIso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchIso) {
    return new Date(
      parseInt(matchIso[1], 10),
      parseInt(matchIso[2], 10) - 1,
      parseInt(matchIso[3], 10),
    );
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatarData(str) {
  const data = parseDateStr(str);
  if (!data) return "—";
  const dd = String(data.getDate()).padStart(2, "0");
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  const yyyy = data.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function obterValorDose(dose) {
  if (dose == null) return "—";

  if (typeof dose === "number" || typeof dose === "string") {
    return dose;
  }

  if (typeof dose === "object") {
    if (dose.dose != null && typeof dose.dose !== "object") return dose.dose;
    if (dose.quantidade != null) return dose.quantidade;
    if (dose.valor != null) return dose.valor;
    if (dose.dose != null && typeof dose.dose === "object") {
      return dose.dose.valor ?? dose.dose.quantidade ?? "—";
    }
  }

  return "—";
}

function obterUnidadeMedida(dose, medicamento) {
  const unidadeDose = dose?.unidadeMedida;
  const unidadeMedicamento = medicamento?.unidadeMedida;

  const extrairNome = (val) => {
    if (!val) return null;
    if (typeof val === "string") return val;
    if (typeof val === "object") return val.nome ?? val.unidade ?? null;
    return null;
  };

  return (
    formatarUnidade(extrairNome(unidadeDose)) ||
    formatarUnidade(extrairNome(unidadeMedicamento)) ||
    ""
  );
}

// ─── RENDERIZAÇÃO ────────────────────────────────────────────────────────────

function renderizarTabela() {
  const tbody = document.getElementById("historico-tbody");
  tbody.innerHTML = "";

  const inicio = paginaAtual * itemsPorPagina;
  const pagina = prescricoesFiltradas.slice(inicio, inicio + itemsPorPagina);

  if (pagina.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="td-loading">Sem prescrições encontradas.</td></tr>`;
    return;
  }

  pagina.forEach((p) => {
    const ativa = p.estado === "ATIVA";
    const estadoBadge = ativa
      ? `<span class="badge badge-ativa">Ativa</span>`
      : p.estado === "SUSPENSA" || p.estado === "SUSPENSA_TEMPORARIA" || p.estado === "SUSPENSA_DEFINITIVA"
        ? `<span class="badge badge-inativa">Suspensa</span>`
        : `<span class="badge badge-inativa">Terminada</span>`;

    const sosBadge = p.sos
      ? `<span class="badge badge-sos">SOS</span>`
      : `<span style="color:rgba(255,255,255,0.4)">—</span>`;

    const via = p.medicamento?.viaAdministracao ?? "—";
    const dataInicio = formatarData(p.inicio);
    const dataFim = formatarData(p.fim);

    const doseValor = obterValorDose(p.dose);
    const unidade = obterUnidadeMedida(p.dose, p.medicamento);

    const duracaoDias = calcularDuracao(p.inicio, p.fim);

    let acaoCell = '<span class="motivo-inativo">—</span>';
    if (ativa) {
      acaoCell = `<button class="btn-suspender" data-id="${p.id}">Suspender</button>`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.medicamento?.nome ?? "—"}</strong></td>
      <td>${doseValor} ${unidade}</td>
      <td>${via}</td>
      <td>${dataInicio}</td>
      <td>${dataFim}</td>
      <td>${duracaoDias !== null ? duracaoDias + " dias" : "—"}</td>
      <td>${p.motivo || "—"}</td>
      <td>${sosBadge}</td>
      <td>${estadoBadge}</td>
      <td>${acaoCell}</td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".btn-suspender").forEach((btn) => {
    btn.addEventListener("click", () => suspenderPrescricao(btn.dataset.id));
  });
}

function renderizarPaginacao() {
  document.querySelector(".paginacao")?.remove();
  const totalPaginas = Math.max(
    1,
    Math.ceil(prescricoesFiltradas.length / itemsPorPagina),
  );

  const div = document.createElement("div");
  div.className = "paginacao";

  const seletor = document.createElement("div");
  seletor.className = "paginacao-tamanho";
  const label = document.createElement("label");
  label.htmlFor = "items-por-pagina";
  label.textContent = "Prescrições por página:";
  const select = document.createElement("select");
  select.id = "items-por-pagina";
  OPCOES_ITEMS_POR_PAGINA.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = String(n);
    opt.textContent = String(n);
    if (n === itemsPorPagina) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener("change", (e) => {
    itemsPorPagina = parseInt(e.target.value, 10);
    paginaAtual = 0;
    renderizarTabela();
    renderizarPaginacao();
  });
  seletor.appendChild(label);
  seletor.appendChild(select);
  div.appendChild(seletor);

  const paginas = document.createElement("div");
  paginas.className = "paginacao-paginas";
  for (let i = 0; i < totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.className = `btn-pagina${i === paginaAtual ? " ativo" : ""}`;
    btn.onclick = () => {
      paginaAtual = i;
      renderizarTabela();
      renderizarPaginacao();
    };
    paginas.appendChild(btn);
  }
  div.appendChild(paginas);

  document.querySelector(".historico-table-wrap").after(div);
}

function aplicarFiltros() {
  const query = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();

  prescricoesFiltradas = todasPrescricoes.filter((p) => {
    const nomeMatch = (p.medicamento?.nome ?? "").toLowerCase().includes(query);
    return nomeMatch;
  });

  paginaAtual = 0;
  renderizarTabela();
  renderizarPaginacao();
}

async function recarregarPrescricoes() {
  if (!processId) return;
  const estado = document.getElementById("filtro-estado").value;
  await carregarPrescricoes(processId, estado === "todos" ? null : estado);
}

// ─── DADOS ───────────────────────────────────────────────────────────────────

async function carregarPaciente() {
  try {
    const resp = await fetch(`/api/patients/${patientId}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const dados = json.data.dados;
    const processo = dados.processo;

    document.getElementById("nome-utente").textContent = dados.nome ?? "—";
    document.getElementById("processo").textContent = processo?.id ?? "—";
    document.getElementById("cama").textContent = processo?.cama?.id ?? "—";
    document.getElementById("diagnostico").textContent =
      processo?.diagnosticoPrincipal ?? "—";

    if (processo?.dataEntrada) {
      const entrada = parseDateStr(processo.dataEntrada);
      if (entrada && !isNaN(entrada.getTime())) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dias = Math.floor(
          (hoje.getTime() - entrada.getTime()) / 86400000,
        );
        document.getElementById("dias-internado").textContent =
          dias >= 0 ? dias : 0;
      } else {
        document.getElementById("dias-internado").textContent = "—";
      }
    } else {
      document.getElementById("dias-internado").textContent = "—";
    }

    const btnKardex = document.getElementById("btn-kardex");
    if (btnKardex) {
      btnKardex.onclick = () => {
        window.location.href = `medicoKardexUtente?id=${patientId}`;
      };
    }

    const btnPrescrever = document.getElementById("btn-prescrever");
    if (btnPrescrever) {
      btnPrescrever.onclick = () => {
        window.location.href = `medicoPrescreverMedicamento?id=${patientId}`;
      };
    }

    return processo?.id ?? null;
  } catch (err) {
    console.error("[Histórico] Erro ao carregar paciente:", err);
    return null;
  }
}

async function carregarPrescricoes(procId, estadoFiltro = null) {
  const tbody = document.getElementById("historico-tbody");
  tbody.innerHTML = `<tr><td colspan="10" class="td-loading">A carregar prescrições...</td></tr>`;
  try {
    let url = `/api/processes/${procId}/prescriptions`;
    if (estadoFiltro) url += `?s=${estadoFiltro}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();

    todasPrescricoes = json.data ?? [];
    prescricoesFiltradas = [...todasPrescricoes];

    const query = document
      .getElementById("search-input")
      ?.value?.toLowerCase()
      .trim();
    if (query) {
      prescricoesFiltradas = prescricoesFiltradas.filter((p) =>
        (p.medicamento?.nome ?? "").toLowerCase().includes(query),
      );
    }

    paginaAtual = 0;
    renderizarTabela();
    renderizarPaginacao();
  } catch (err) {
    console.error("[Histórico] Erro ao carregar prescrições:", err);
    tbody.innerHTML = `<tr><td colspan="10" class="td-loading" style="color:#f05050;">Erro ao carregar prescrições.</td></tr>`;
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("nome-medico").textContent =
    sessionStorage.getItem("nomeUtilizador") ?? "—";

  const turnoEl = document.getElementById("turno");
  if (turnoEl) {
    turnoEl.textContent = sessionStorage.getItem("turno") ?? "—";
  }

  // Injetar popup no container
  injetarPopupSuspender();

  if (!patientId) {
    document.getElementById("historico-tbody").innerHTML =
      `<tr><td colspan="10" class="td-loading" style="color:#f05050;">ID de utente em falta no URL.</td></tr>`;
    return;
  }

  processId = await carregarPaciente();

  if (processId) {
    await carregarPrescricoes(processId);
  } else {
    document.getElementById("historico-tbody").innerHTML =
      `<tr><td colspan="10" class="td-loading" style="color:#f05050;">Não foi possível obter o processo clínico.</td></tr>`;
    return;
  }

  document.getElementById("search-input").addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(aplicarFiltros, 300);
  });

  document
    .getElementById("filtro-estado")
    .addEventListener("change", recarregarPrescricoes);
});
