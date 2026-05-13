const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Estado global
let _processoId = null;
let _nomeUtente = "";
let _nomeEnfermeiro = "";
let _intervencaoSelecionadaId = null;

// ---------- Navegação ----------

function abrirPaginaPlano() {
  window.location.href = `enfermeiroPlanoCuidados?id=${id}`;
}

function irParaKardex() {
  window.location.href = `enfermeiroKardexUtente?id=${id}`;
}

// ---------- Fetchers base ----------

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

// ---------- Enfermeiro ----------

async function carregarEnfermeiro() {
  const res = await fetch(`http://localhost:8080/api/users/me`);
  if (!res.ok) return;
  const { data } = await res.json();
  _nomeEnfermeiro = data.nome ?? "";
  document.getElementById("nome-enf").textContent = _nomeEnfermeiro;
  document.getElementById("turno").textContent = "TODO";
}

// ---------- Render ----------

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

function renderIntervencoes(intervencoes) {
  const tbody = document.getElementById("intervencoes-tbody");

  if (!intervencoes?.length) {
    tbody.innerHTML = '<tr><td colspan="7">Sem intervenções para este turno.</td></tr>';
    return;
  }

  tbody.innerHTML = intervencoes
    .map(
      (i) => `
      <tr>
        <td>${i.intervencao ?? ""}</td>
        <td>${i.frequencia ?? ""}</td>
        <td>${i.horarioPrevisto ?? ""}</td>
        <td>${i.diagnostico ?? ""}</td>
        <td>${i.data ?? ""}</td>
        <td>${i.objetivo ?? ""}</td>
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

// ---------- Popup: Nova Intervenção ----------

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

// ---------- Popup: Registar Intervenção ----------

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

// ---------- Helpers ----------

// Converte "YYYY-MM-DDTHH:mm" → "DD/MM/YYYY:HH:mm:00" (com segundos — para adicionar intervenção)
function formatarDataHoraParaAPIComSegundos(datetimeLocal) {
  if (!datetimeLocal) return "";
  const [datePart, timePart] = datetimeLocal.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}:${timePart}:00`;
}

// Converte "YYYY-MM-DDTHH:mm" → "DD/MM/YYYY:HH:mm" (sem segundos — para registar execução)
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

// ---------- Popups ----------

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

// ---------- Inicialização ----------

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