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
  inicializarFormEditar();
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

async function ativarUtilizador(id) {
  try {
    const resp = await fetch(`http://localhost:8080/api/users/${id}/activate`, {
      method: "PATCH",
    });

    if (!resp.ok) throw new Error("Erro ao ativar utilizador");

    await carregarUtilizadores();
  } catch (err) {
    console.error(err);
  }
}

function fecharPopUp() {
  popUpContainer.style.display = "none";
  popUpCriar.style.display = "none";
  popUpEditar.style.display = "none";
  popUpDesativar.style.display = "none";
  contentContainer.style.opacity = "1";
}

/*let debounceTimer;
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
  });*/

document.addEventListener("DOMContentLoaded", async () => {
  await carregarPopups();
  await carregarUtilizadores();
});
