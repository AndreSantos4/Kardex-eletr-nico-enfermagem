const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let _processoId = null;

const LABELS_INTERVENCAO = {
  VIGILANCIA_CONTINUA: "Vigilância Contínua",
  VIGILANCIA_1_1: "Vigilância 1:1",
  ADMINISTRACAO_MEDICACAO: "Administração de Medicação",
  AVALIACAO_SINAIS_VITAIS: "Avaliação de Sinais Vitais",
  CUIDADOS_HIGIENE: "Cuidados de Higiene",
  CONTENCAO_VERBAL: "Contenção verbal",
  APOIO_EMOCIONAL: "Apoio emocional",
  RELACAO_TERAPEUTICA: "Estabelecer relação terapêutica",
  ATIVIDADES_ESTRUTURADAS: "Promover atividades estruturadas",
  EDUCAR_MEDICACAO: "Educar sobre medicação",
  MONITORIZAR_VITAIS: "Monitorizar sinais vitais",
  AVALIAR_HUMOR_RISCO: "Avaliar humor / risco",
  MONITORIZAR_ALIMENTACAO: "Monitorizar ingestão alimentar",
  HIGIENE_SONO: "Promover higiene do sono",
  OUTRO: "Outro",
};

const LABELS_FREQUENCIA = {
  CONTINUA: "Contínua", CONTINUO: "Contínua", DIARIA: "Diária",
  BD: "2x/dia", TID: "3x/dia", QID: "4x/dia", SOS: "SOS", SEMANAL: "Semanal",
  UMA_VEZ: "Uma vez", DUAS_VEZES: "Duas vezes", TRES_VEZES: "Três vezes",
  DIA_1: "1x/dia", DIA_2: "2x/dia", DIA_3: "3x/dia", DIA_4: "4x/dia", DIA_5: "5x/dia", DIA_6: "6x/dia",
  H_2: "De 2 em 2 horas", H_4: "De 4 em 4 horas",
};

function labelOuOriginal(mapa, valor) {
  return mapa[valor] ?? valor;
}

function irParaKardex() {
  window.location.href = `enfermeiroChefeKardexUtente?id=${id}`;
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

async function carregarChefe() {
  const res = await fetch(`http://localhost:8080/api/users/me`);
  if (!res.ok) return;
  const { data } = await res.json();
  const el = document.getElementById("nome-chefe");
  if (el) el.textContent = data?.nome ?? "—";
}

function mostrarSemPlano(nomeUtente, processoId) {
  document.getElementById("header-nome-utente").textContent = `Plano de Cuidados — ${nomeUtente}`;
  document.getElementById("header-proc-turno").textContent = `Proc. ${processoId}`;
  document.getElementById("estado-plano-texto").textContent = "Não existe nenhum plano de cuidados para este utente.";
  document.getElementById("diagnosticos-body").innerHTML = "<p>Sem diagnósticos registados.</p>";
  document.getElementById("objetivos-body").innerHTML = "<p>Sem objetivos definidos.</p>";
  document.getElementById("intervencoes-tbody").innerHTML =
    '<tr><td colspan="6" class="italic text-primary/60">Sem intervenções para este turno.</td></tr>';
}

function renderPlanoCuidados(utente, plano) {
  document.getElementById("header-nome-utente").textContent = `Plano de Cuidados — ${utente.nome ?? ""}`;
  document.getElementById("header-proc-turno").textContent = `Proc. ${utente.processo?.id ?? ""}`;

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
    .map((d) => `
      <div class="diagnostico-item">
        <h4>${d.diagnostico ?? ""}</h4>
        <p>Prioridade: <strong>${d.prioridade ?? ""}</strong> — Ativo desde ${d.dataCriacao ?? ""}</p>
      </div>`)
    .join("");
}

function renderObjetivos(objetivos) {
  const container = document.getElementById("objetivos-body");
  if (!objetivos?.length) {
    container.innerHTML = "<p>Sem objetivos definidos.</p>";
    return;
  }
  container.innerHTML = objetivos.map((o) => `<h4>${o.descricao ?? ""}</h4>`).join("<br>");
}

function formatarDataExecucaoParaDisplay(dataISO) {
  if (!dataISO) return "";
  const m = String(dataISO).match(/^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2})/);
  if (m) return `${m[1]}/${m[2]}/${m[3]} ${m[4]}:${m[5]}`;
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
    tbody.innerHTML = '<tr><td colspan="6" class="italic text-primary/60">Sem intervenções para este turno.</td></tr>';
    return;
  }
  tbody.innerHTML = intervencoes
    .map((i) => {
      const feita = i.dataExecucao != null;
      const estado = feita
        ? `<span class="intervencao-executada">✓ Registado</span>`
        : `<span class="intervencao-pendente">Pendente</span>`;
      return `
      <tr>
        <td>${labelOuOriginal(LABELS_INTERVENCAO, i.intervencao)}</td>
        <td>${labelOuOriginal(LABELS_FREQUENCIA, i.frequencia)}</td>
        <td>${i.horarioPrevisto ?? ""}</td>
        <td>${i.funcionarioExecutou?.dados?.nome ?? ""}</td>
        <td>${i.dataExecucao ? formatarDataExecucaoParaDisplay(i.dataExecucao) : ""}</td>
        <td>${estado}</td>
      </tr>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!id) {
    console.error("ID do utente não encontrado no URL.");
    return;
  }

  try {
    const [utente] = await Promise.all([fetchUtente(), carregarChefe()]);
    _processoId = utente.processo?.id;
    const plano = await fetchPlano(_processoId);

    if (!plano) {
      mostrarSemPlano(utente.nome ?? "", _processoId ?? "");
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
