const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function abrirPaginaPlano() {
  window.location.href = `enfermeiroPlanoCuidados?id=${id}`;
}

async function carregarEnfermeiro() {
  const res = await fetch(`http://localhost:8080/api/users/me`);
  const data = await res.json();

  document.getElementById("nome-enf").textContent = data.data.nome ?? "";
  document.getElementById("turno").textContent = "TODO";
}

async function carregarPlanoCuidados() {
  const resUtente = await fetch(`http://localhost:8080/api/patients/${id}`);
  const dataUtente = await resUtente.json();

  const resPlano = await fetch(
    `http://localhost:8080/api/processes/${dataUtente.data.dados.processo.id}/plan`,
  );
  const dataPlano = await resPlano.json();

  document.getElementById("header-nome-utente").textContent =
    `Plano de Cuidados — ${dataUtente.data.dados.nome ?? ""}`;

  document.getElementById("header-proc-turno").textContent =
    `Proc. ${dataUtente.data.dados.processo.id ?? ""} - Turno TODO`;

  document.getElementById("estado-plano-texto").textContent =
    `Versão ${dataPlano.data.versao ?? ""} - Criado ${dataPlano.data.dataCriacao ?? ""} por ${dataPlano.data.autor.dados.nome ?? ""} - ` +
    `${(dataPlano.data.ativo ? "Válido" : "Inválido") ?? ""}`;
}

async function carregarDiagnosticos() {
  const resUtente = await fetch(`http://localhost:8080/api/patients/${id}`);
  const dataUtente = await resUtente.json();

  const resPlano = await fetch(
    `http://localhost:8080/api/processes/${dataUtente.data.dados.processo.id}/plan`,
  );
  const lista = await resPlano.json();

  const container = document.getElementById("diagnosticos-body");

  if (!lista.data.diagnosticos || lista.data.diagnosticos.length === 0) {
    container.innerHTML = "<p>Sem diagnósticos registados.</p>";
    return;
  }

  container.innerHTML = lista.data.diagnosticos
    .map(
      (d) => `
    <h4>${d.diagnostico ?? ""}</h4>
    <p>Prioridade: ${d.prioridade ?? ""} - Ativo desde ${d.dataCriacao ?? ""}</p>
    <br>
  `,
    )
    .join("");
}

async function carregarObjetivos() {
  // TODO: ajusta o endpoint
  /*const res = await fetch(``);
  const lista = await res.json();

  const container = document.getElementById("objetivos-body");

  if (!lista || lista.length === 0) {
    container.innerHTML = "<p>Sem objetivos definidos.</p>";
    return;
  }*/
  // TODO: ajusta os campos conforme o body da resposta
  /*container.innerHTML = lista
    .map(
      (o) => `
    <h4>${o.descricao ?? ""}</h4>
    <br>
  `,
    )
    .join("");*/
}

async function carregarIntervencoes() {
  // TODO: ajusta o endpoint
  /*const res = await fetch(``);
  const lista = await res.json();

  const tbody = document.getElementById("intervencoes-tbody");

  if (!lista || lista.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6">Sem intervenções para este turno.</td></tr>';
    return;
  }*/
  // TODO: ajusta os campos conforme o body da resposta
  /*tbody.innerHTML = lista
    .map(
      (i) => `
    <tr>
      <td>${i.descricao ?? ""}</td>
      <td>${i.frequencia ?? ""}</td>
      <td>${i.horario ?? ""}</td>
      <td>${i.executadaPor ?? ""}</td>
      <td>${i.horaRegisto ?? ""}</td>
      <td>
        ${
          i.podeRegistar
            ? `<button onclick="registarIntervencao('${i.id}')">Registar</button>`
            : ""
        }
      </td>
    </tr>
  `,
    )
    .join("");*/
}

function irParaKardex() {
  window.location.href = `enfermeiroKardexUtente?id=${id}`;
}

function abrirNovaIntervencao() {
  // TODO: abre popup/modal ou navega para página de nova intervenção
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!id) {
    console.error("id do utente não encontrado no URL.");
    return;
  }

  await Promise.all([
    carregarEnfermeiro(),
    carregarPlanoCuidados(),
    carregarDiagnosticos(),
    carregarObjetivos(),
    carregarIntervencoes(),
  ]);
});
