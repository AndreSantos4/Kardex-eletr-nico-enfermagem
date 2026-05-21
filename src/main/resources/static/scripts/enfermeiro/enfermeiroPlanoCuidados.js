const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let _processoId = null;
let _nomeUtente = "";
let _nomeEnfermeiro = "";
let _intervencaoSelecionadaId = null;

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

function labelOuOriginal(mapa, valor) {
  return mapa[valor] ?? valor;
}

function abrirPaginaPlano() {
  window.location.href = `enfermeiroPlanoCuidados?id=${id}`;
}

function irParaKardex() {
  window.location.href = `enfermeiroKardexUtente?id=${id}`;
}

async function fetchUtente() {
  const res = await fetch(`http://localhost:8080/api/patients/${id}`);
  if (!res.ok) throw new Error(`Erro ao carregar utente (${res.status})`);
  const json = await res.json();
  return json.data.dados;
}

async function fetchPlano(processoId) {
  const res = await fetch(`http://localhost:8080/api/processes/${processoId}/plan`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Erro ao carregar plano (${res.status})`);
  const json = await res.json();
  return json.data ?? null;
}

async function carregarEnfermeiro() {
  const res = await fetch(`http://localhost:8080/api/users/me`);
  if (!res.ok) return;
  const { data } = await res.json();
  _nomeEnfermeiro = data.nome ?? "";
  document.getElementById("nome-enf").textContent = _nomeEnfermeiro;
  document.getElementById("turno").textContent = "TODO";
}

function mostrarSemPlano(nomeUtente, processoId) {
  document.getElementById("header-nome-utente").textContent = `Plano de Cuidados — ${nomeUtente}`;
  document.getElementById("header-proc-turno").textContent = `Proc. ${processoId} - Turno TODO`;
  document.getElementById("estado-plano-texto").textContent = "Não existe nenhum plano de cuidados para este utente.";
  document.getElementById("diagnosticos-body").innerHTML = "<p>Sem diagnósticos registados.</p>";
  document.getElementById("objetivos-body").innerHTML = "<p>Sem objetivos definidos.</p>";
  document.getElementById("intervencoes-tbody").innerHTML =
    '<tr><td colspan="7">Sem intervenções para este turno.</td></tr>';
}

function renderPlanoCuidados(utente, plano) {
  document.getElementById("header-nome-utente").textContent = `Plano de Cuidados — ${utente.nome ?? ""}`;
  document.getElementById("header-proc-turno").textContent = `Proc. ${utente.processo.id ?? ""} - Turno TODO`;

  const estadoTexto =
    `Versão ${plano.versao} — Criado em ${plano.dataCriacao} por ${plano.autor?.dados?.nome ?? "desconhecido"} — ` +
    (plano.ativo ? "Válido" : "Inválido");
  document.getElementById("estado-plano-texto").textContent = estadoTexto;
}

function renderDiagnosticos(diagnosticos) {
  const container = document.getElementById("diagnosticos-body");

  if (!diagnosticos?.length) {
    container.innerHTML = "<p>Sem diagnósticos registados.</p>";
    return;
  }

  container.innerHTML = diagnosticos
    .map(
      (d) => `
      <div class="diagnostico-item">
        <h4>${d.diagnostico ?? ""}</h4>
        <p>Prioridade: <strong>${d.prioridade ?? ""}</strong> — Ativo desde ${d.dataCriacao ?? ""}</p>
      </div>
    `
    )
    .join("");
}

function renderObjetivos(objetivos) {
  const container = document.getElementById("objetivos-body");

  if (!objetivos?.length) {
    container.innerHTML = "<p>Sem objetivos definidos.</p>";
    return;
  }

  container.innerHTML = objetivos
    .map((o) => `<h4>${o.descricao ?? ""}</h4>`)
    .join("<br>");
}

function formatarDataExecucaoParaDisplay(dataISO) {
  if (!dataISO) return "";
  const d = new Date(dataISO);
  if (isNaN(d)) return dataISO;
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  const horas = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${horas}:${mins}`;
}

function renderIntervencoes(intervencoes) {
  const tbody = document.getElementById("intervencoes-tbody");

  if (!intervencoes?.length) {
    tbody.innerHTML = '<tr><td colspan="6">Sem intervenções para este turno.</td></tr>';
    return;
  }

  tbody.innerHTML = intervencoes
    .map(
      (i) => `
      <tr>
        <td>${labelOuOriginal(LABELS_INTERVENCAO, i.intervencao)}</td>
        <td>${labelOuOriginal(LABELS_FREQUENCIA, i.frequencia)}</td>
        <td>${i.horarioPrevisto ?? ""}</td>
        <td>${i.funcionarioExecutou?.dados?.nome ?? ""}</td>
        <td>${i.dataExecucao ? formatarDataExecucaoParaDisplay(i.dataExecucao) : ""}</td>
        <td>
          ${i.dataExecucao === null
          ? `<button class="btn-registar-estilo" onclick="abrirPopupRegistarIntervencao(${i.id})">REGISTAR</button>`
          : `<span class="intervencao-executada">✓ Registado</span>`
        }
        </td>
      </tr>
    `
    )
    .join("");
}

function abrirNovaIntervencao() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  document.getElementById("data-hora-intervencao").value = agora.toISOString().slice(0, 16);

  document.getElementById("popup-adicionar-intervencao").style.display = "flex";
}

function fecharPopupAdicionarIntervencao() {
  document.getElementById("popup-adicionar-intervencao").style.display = "none";
  document.getElementById("form-adicionar-intervencao").reset();
}

async function submeterAdicionarIntervencao(event) {
  event.preventDefault();

  const diagnostico = document.getElementById("diagnostico-intervencao").value;
  const intervencao = document.getElementById("tipo-intervencao").value;
  const frequencia = document.getElementById("frequencia-intervencao").value;
  const horarioPrevisto = document.getElementById("horario-intervencao").value;
  const prioridade = document.getElementById("prioridade-intervencao").value;
  const dataHoraRaw = document.getElementById("data-hora-intervencao").value;
  const objetivo = document.getElementById("objetivo-intervencao").value;

  if (!intervencao) {
    mostrarNotificacao({ titulo: "Campo obrigatório", mensagem: "Por favor seleciona uma intervenção.", tipo: "aviso" });
    return;
  }

  const data = formatarDataHoraParaAPIComSegundos(dataHoraRaw);

  const body = { diagnostico, intervencao, frequencia, prioridade, horarioPrevisto, data, objetivo };

  try {
    const res = await fetch(
      `http://localhost:8080/api/processes/${_processoId}/plan/interventions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("[adicionar intervenção] resposta do servidor:", errorBody);
      throw new Error(`Erro ao adicionar intervenção (${res.status})`);
    }

    fecharPopupAdicionarIntervencao();
    mostrarNotificacao({ titulo: "Intervenção adicionada", mensagem: "A intervenção foi adicionada ao plano de cuidados.", tipo: "sucesso" });
    await recarregarIntervencoes();
  } catch (err) {
    console.error(err);
    mostrarNotificacao({ titulo: "Erro", mensagem: "Não foi possível adicionar a intervenção. Tenta novamente.", tipo: "erro" });
  }
}

function abrirPopupRegistarIntervencao(intervencaoId) {
  _intervencaoSelecionadaId = intervencaoId;

  document.getElementById("reg-intervencao-enfermeiro").textContent = _nomeEnfermeiro || "—";
  document.getElementById("reg-intervencao-paciente").textContent = _nomeUtente || "—";
  document.getElementById("reg-intervencao-titulo").textContent = `Intervenção #${intervencaoId}`;

  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  document.getElementById("reg-intervencao-data-hora").value = agora.toISOString().slice(0, 16);

  document.getElementById("popup-registar-intervencao").style.display = "flex";
}

function fecharPopupRegistarIntervencao() {
  document.getElementById("popup-registar-intervencao").style.display = "none";
  document.getElementById("form-registar-intervencao").reset();
  _intervencaoSelecionadaId = null;
}

async function submeterRegistarIntervencao(event) {
  event.preventDefault();

  const dataHoraRaw = document.getElementById("reg-intervencao-data-hora").value;
  const observacoes = document.getElementById("reg-intervencao-observacoes").value;

  if (!observacoes.trim()) {
    mostrarNotificacao({ titulo: "Campo obrigatório", mensagem: "Por favor preenche as observações.", tipo: "aviso" });
    return;
  }

  const data = formatarDataHoraParaAPI(dataHoraRaw);

  try {
    const res = await fetch(
      `http://localhost:8080/api/processes/interventions/${_intervencaoSelecionadaId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, observacoes }),
      }
    );

    if (!res.ok) throw new Error(`Erro ao registar intervenção (${res.status})`);

    fecharPopupRegistarIntervencao();
    mostrarNotificacao({ titulo: "Intervenção registada", mensagem: "A execução da intervenção foi registada com sucesso.", tipo: "sucesso" });
    await recarregarIntervencoes();
  } catch (err) {
    console.error(err);
    mostrarNotificacao({ titulo: "Erro", mensagem: "Não foi possível registar a intervenção. Tenta novamente.", tipo: "erro" });
  }
}

function formatarDataHoraParaAPIComSegundos(datetimeLocal) {
  if (!datetimeLocal) return "";
  const [datePart, timePart] = datetimeLocal.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}:${timePart}:00`;
}

function formatarDataHoraParaAPI(datetimeLocal) {
  if (!datetimeLocal) return "";
  const [datePart, timePart] = datetimeLocal.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}:${timePart}`;
}

async function recarregarIntervencoes() {
  try {
    const plano = await fetchPlano(_processoId);
    if (plano) renderIntervencoes(plano.intervencoes);
  } catch (err) {
    console.error("Erro ao recarregar intervenções:", err);
  }
}

async function carregarPopups() {
  const popups = [
    "../../pages/enfermeiro/popups/popupAdicionarIntervencaoPlano.html",
    "../../pages/enfermeiro/popups/popupRegistarIntervencao.html",
  ];

  const container = document.getElementById("popup-container");

  await Promise.all(
    popups.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Erro ao carregar popup: ${url}`);
        return;
      }
      const html = await res.text();
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      container.appendChild(wrapper);
    })
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!id) {
    console.error("ID do utente não encontrado no URL.");
    return;
  }

  try {
    await carregarPopups();

    const [utente] = await Promise.all([fetchUtente(), carregarEnfermeiro()]);

    _processoId = utente.processo?.id;
    _nomeUtente = utente.nome ?? "";

    const plano = await fetchPlano(_processoId);

    if (!plano) {
      mostrarSemPlano(_nomeUtente, _processoId ?? "");
      return;
    }

    renderPlanoCuidados(utente, plano);
    renderDiagnosticos(plano.diagnosticos);
    renderObjetivos(plano.objetivos);
    renderIntervencoes(plano.intervencoes);

  } catch (err) {
    console.error("Erro ao inicializar página:", err);
  }
});