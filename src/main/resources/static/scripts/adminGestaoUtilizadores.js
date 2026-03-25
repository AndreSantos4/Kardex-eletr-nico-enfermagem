const popUpContainer = document.querySelector(".pop-up-container");
let popUpCriar;
let popUpEditar;
let popUpDesativar;
const contentContainer = document.querySelector(".content-container");
const hoje = new Date();
const ano = hoje.getFullYear() - 18;
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");
const dataMax = `${ano}-${mes}-${dia}`;

const ITEMS_POR_PAGINA = 10;
let todosUtilizadores = [];
let utilizadoresFiltrados = [];
let paginaAtual = 0;

let utilizadorOriginal = null;

async function carregarUtilizadores(filtro = "") {
  try {
    const url = filtro
      ? `http://localhost:8080/api/users?f=${encodeURIComponent(filtro)}`
      : "http://localhost:8080/api/users";

    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!resp.ok) throw new Error("Erro ao carregar utilizadores");

    const json = await resp.json();
    todosUtilizadores = json.data;
    utilizadoresFiltrados = todosUtilizadores;
    paginaAtual = 0;

    atualizarContador();
    renderizarTabela();
    renderizarPaginacao();
  } catch (err) {
    console.error(err);
  }
}

async function carregarPopups() {
  const container = document.getElementById("popUpContainer");
  const popups = ["popupCriar", "popupEditar", "popupDesativar"];

  await Promise.all(
    popups.map(async (nome) => {
      const resp = await fetch(`popups/${nome}.html`);
      const html = await resp.text();
      container.insertAdjacentHTML("beforeend", html);
    }),
  );

  popUpCriar = document.querySelector(".pop-up-criar");
  popUpEditar = document.querySelector(".pop-up-editar");
  popUpDesativar = document.querySelector(".pop-up-desativar");

  inicializarFormCriar();
}

function inicializarFormCriar() {
  document.getElementById("data-nascimento").setAttribute("max", dataMax);

  document.getElementById("n-identificacao").addEventListener("input", (e) => {
    let value = e.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 12);
    let formatted = "";
    if (value.length > 0) formatted += value.substring(0, 8);
    if (value.length > 8) formatted += " " + value.substring(8, 9);
    if (value.length > 9) formatted += " " + value.substring(9, 11);
    if (value.length > 11) formatted += value.substring(11, 12);
    e.target.value = formatted;
  });
}

function renderizarTabela() {
  const tbody = document.querySelector(".users-table tbody");
  tbody.innerHTML = "";

  const inicio = paginaAtual * ITEMS_POR_PAGINA;
  const pagina = utilizadoresFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

  if (pagina.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Sem resultados</td></tr>`;
    return;
  }

  pagina.forEach((u) => {
    const estadoBadge = u.ativo
      ? `<span class="badge-ativo">Ativo</span>`
      : `<span class="badge-inativo">Inativo</span>`;

    const roleLabel = formatarRole(u.role);

    const btnEstado = u.ativo
      ? `<button class="btn-table btn-desativar" onclick="abrirDesativar(${u.id}, '${u.nome}', '${roleLabel}', '${u.numeroMecanografico}')">DESATIVAR</button>`
      : `<button class="btn-table btn-ativar" onclick="ativarUtilizador(${u.id})">ATIVAR</button>`;

    tbody.innerHTML += `
      <tr>
        <td>${u.numeroMecanografico}</td>
        <td>${u.nome}</td>
        <td>${roleLabel}</td>
        <td>${u.email}</td>
        <td>—</td>
        <td>${estadoBadge}</td>
        <td class="actions">
          <button class="btn-table" onclick="abrirEditar(${u.id})">EDITAR</button>
          <button class="btn-table" onclick="irParaPerfil(${u.id})">PERFIL</button>
          <button class="btn-table" onclick="abrirPassword(${u.id})">PASSWORD</button>
          ${btnEstado}
        </td>
      </tr>`;
  });
}

function renderizarPaginacao() {
  document.querySelector(".paginacao")?.remove();

  const totalPaginas = Math.ceil(
    utilizadoresFiltrados.length / ITEMS_POR_PAGINA,
  );
  if (totalPaginas <= 1) return;

  const div = document.createElement("div");
  div.className = "paginacao";

  for (let i = 0; i < totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.className = `btn-pagina${i === paginaAtual ? " ativo" : ""}`;
    btn.onclick = () => {
      paginaAtual = i;
      renderizarTabela();
      renderizarPaginacao();
    };
    div.appendChild(btn);
  }

  document.querySelector(".table-panel").after(div);
}

function atualizarContador() {
  document.querySelector(".page-header-left p").textContent =
    `${utilizadoresFiltrados.length} utilizadores`;
}

let debounceTimer;
document
  .querySelector(".search-input-wrap input")
  .addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const termo = e.target.value.toLowerCase();
      utilizadoresFiltrados = todosUtilizadores.filter(
        (u) =>
          u.nome.toLowerCase().includes(termo) ||
          String(u.numeroMecanografico).includes(termo),
      );
      paginaAtual = 0;
      atualizarContador();
      renderizarTabela();
      renderizarPaginacao();
    }, 300);
  });

function formatarRole(role) {
  const map = {
    ADMIN: "Administrador",
    MEDICO: "Médico",
    ENFERMEIRO_CHEFE: "Enf. Chefe",
    ENFERMEIRO: "Enfermeiro",
  };
  return map[role] ?? role;
}

function getToken() {
  return localStorage.getItem("token") ?? "";
}

function irParaPerfil(id) {
  window.location.href = `perfilColaborador.html?id=${id}`;
}

let errorTimer = null;

function showErrorWithCountdown() {
  const msg = document.getElementById("errorBox");
  if (errorTimer) clearInterval(errorTimer);

  let remaining = 30;
  msg.style.display = "block";
  msg.textContent = `Dados já se encontram no sistema! (${remaining}s)`;

  errorTimer = setInterval(() => {
    remaining--;
    msg.textContent = `Dados já se encontram no sistema! (${remaining}s)`;
    if (remaining <= 0) {
      clearInterval(errorTimer);
      errorTimer = null;
      msg.style.display = "none";
    }
  }, 1000);
}

function abrirCriar() {
  popUpContainer.style.display = "flex";
  popUpCriar.style.display = "flex";
  contentContainer.style.opacity = "0.4";
}

function abrirEditar(id) {
  const u = todosUtilizadores.find((x) => x.id === id);
  if (!u) return;

  const form = popUpEditar.querySelector("form");
  form.querySelector("#edit-name").value = u.nome;
  form.querySelector("#edit-sexo").value = u.sexo;
  form.querySelector("#edit-n-identificacao").value = u.numeroCC;
  form.querySelector("#edit-n-sns").value = u.numeroSNS;
  form.querySelector("#edit-email").value = u.email;
  form.querySelector("#edit-contacto").value = u.contacto;
  form.querySelector("#edit-contacto-emg").value = u.contactoEmergencia;
  form.querySelector("#edit-funcao").value = u.role;

  if (u.dataNascimento) {
    const [d, m, a] = u.dataNascimento.split("/");
    form.querySelector("#edit-data-nascimento").value = `${a}-${m}-${d}`;
  }

  form.dataset.userId = id;

  // Guardar snapshot para comparação posterior
  utilizadorOriginal = {
    nome: u.nome,
    sexo: u.sexo,
    numeroCC: u.numeroCC,
    numeroSNS: String(u.numeroSNS),
    email: u.email,
    contacto: String(u.contacto),
    contactoEmergencia: String(u.contactoEmergencia),
    role: u.role,
    dataNascimento: u.dataNascimento ?? "",
  };

  popUpContainer.style.display = "flex";
  popUpEditar.style.display = "flex";
  contentContainer.style.opacity = "0.4";
}

function abrirDesativar(id, nome, role, nMec) {
  popUpDesativar.querySelector("#desativar-info").textContent =
    `Utilizador - ${nome} (${role}) - Nº ${nMec}`;
  popUpDesativar.dataset.userId = id;

  popUpContainer.style.display = "flex";
  popUpDesativar.style.display = "flex";
  contentContainer.style.opacity = "0.4";
}

async function ativarUtilizador(id) {
  try {
    const resp = await fetch(`http://localhost:8080/api/users/${id}/ativar`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!resp.ok) throw new Error("Erro ao ativar utilizador");

    await carregarUtilizadores();
  } catch (err) {
    console.error(err);
  }
}

async function confirmarDesativar() {
  const id = popUpDesativar.dataset.userId;
  const reason = document.getElementById("motivo").value.trim();

  if (!reason) {
    alert("O motivo é obrigatório.");
    return;
  }

  try {
    const resp = await fetch(
      `http://localhost:8080/api/users/${id}/deactivate`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
        }),
      },
    );

    if (!resp.ok) throw new Error("Erro ao desativar utilizador");
    fecharPopUp();
    await carregarUtilizadores();
  } catch (err) {
    console.error(err);
  }

  // usa o id e motivo aqui
  console.log(id, motivo);
}

function fecharPopUp() {
  popUpContainer.style.display = "none";
  popUpCriar.style.display = "none";
  popUpEditar.style.display = "none";
  popUpDesativar.style.display = "none";
  contentContainer.style.opacity = "1";
}

function createUser(event) {
  event.preventDefault();

  const nome = document.getElementById("name").value;
  const dataNascimentoDesformatada =
    document.getElementById("data-nascimento").value;
  const [anoD, mesD, diaD] = dataNascimentoDesformatada.split("-");
  const dataNascimento = `${diaD}/${mesD}/${anoD}`;
  const sexo = document.getElementById("sexo").value;
  const numeroCC = document
    .getElementById("n-identificacao")
    .value.replace(/\s/g, "");
  const numeroSNS = parseInt(document.getElementById("n-sns").value);
  const email = document.getElementById("email").value;
  const contacto = parseInt(document.getElementById("contacto").value);
  const contactoEmergencia = parseInt(
    document.getElementById("contacto-emg").value,
  );
  const role = document.getElementById("funcao").value;
  const numeroMecanografico = parseInt(
    document.getElementById("n-mecanografico").value,
  );

  fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      numeroMecanografico,
      numeroCC,
      numeroSNS,
      role,
      nome,
      sexo,
      email,
      contacto,
      contactoEmergencia,
      dataNascimento,
    }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (data.success) {
        fecharPopUp();
        document.querySelector(".pop-up-criar form").reset();
        await carregarUtilizadores();
      } else if (res.status === 409) {
        showErrorWithCountdown();
      }
    })
    .catch((err) => console.error("Erro de ligação:", err));
}

async function guardarEdicao() {
  const form = popUpEditar.querySelector("form");
  const id = form.dataset.userId;

  const dataNascimentoRaw = form.querySelector("#edit-data-nascimento").value;
  let dataNascimento = "";
  if (dataNascimentoRaw) {
    const [a, m, d] = dataNascimentoRaw.split("-");
    dataNascimento = `${d}/${m}/${a}`;
  }

  const atual = {
    nome: form.querySelector("#edit-name").value,
    sexo: form.querySelector("#edit-sexo").value,
    numeroCC: form
      .querySelector("#edit-n-identificacao")
      .value.replace(/\s/g, ""),
    numeroSNS: form.querySelector("#edit-n-sns").value,
    email: form.querySelector("#edit-email").value,
    contacto: form.querySelector("#edit-contacto").value,
    contactoEmergencia: form.querySelector("#edit-contacto-emg").value,
    role: form.querySelector("#edit-funcao").value,
    dataNascimento,
  };

  // Comparar campo a campo com o snapshot original
  const houveMudancas = Object.keys(atual).some(
    (key) => atual[key] !== utilizadorOriginal[key],
  );

  if (!houveMudancas) {
    fecharPopUp();
    return;
  }

  const body = {
    nome: form.querySelector("#edit-name").value,
    sexo: form.querySelector("#edit-sexo").value,
    numeroCC: form
      .querySelector("#edit-n-identificacao")
      .value.replace(/\s/g, ""),
    numeroSNS: parseInt(atual.numeroSNS),
    email: form.querySelector("#edit-email").value,
    contacto: parseInt(atual.contacto),
    contactoEmergencia: parseInt(atual.contactoEmergencia),
    role: form.querySelector("#edit-funcao").value,
    dataNascimento,
  };

  try {
    const resp = await fetch(`http://localhost:8080/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error("Erro ao guardar utilizador");

    fecharPopUp();
    await carregarUtilizadores();
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarPopups();
  await carregarUtilizadores();
});
