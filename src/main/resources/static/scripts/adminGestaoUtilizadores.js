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

const OPCOES_ITEMS_POR_PAGINA = [5, 10, 20, 30, 50];
let itemsPorPagina = 10;
let todosUtilizadores = [];
let utilizadoresFiltrados = [];
let paginaAtual = 0;

function ordenarPorMecanografico(lista) {
  return [...lista].sort(
    (a, b) => Number(a.numeroMecanografico) - Number(b.numeroMecanografico),
  );
}

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
    todosUtilizadores = ordenarPorMecanografico(json.data ?? []);
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

  const inicio = paginaAtual * itemsPorPagina;
  const pagina = utilizadoresFiltrados.slice(inicio, inicio + itemsPorPagina);

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
          <button class="btn-table" onclick="resetPassword(${u.id})">PASSWORD</button>
          ${btnEstado}
        </td>
      </tr>`;
  });
}

function renderizarPaginacao() {
  document.querySelector(".paginacao")?.remove();

  const totalPaginas = Math.max(
    1,
    Math.ceil(utilizadoresFiltrados.length / itemsPorPagina),
  );

  const div = document.createElement("div");
  div.className = "paginacao";

  const seletor = document.createElement("div");
  seletor.className = "paginacao-tamanho";
  const label = document.createElement("label");
  label.htmlFor = "items-por-pagina";
  label.textContent = "Utilizadores por página:";
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

async function resetPassword(id) {
  try {
    const respUser = await fetch(`http://localhost:8080/api/users/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!respUser.ok) throw new Error("Erro ao obter utilizador");

    const json = await respUser.json();
    const email = json.data.email;
    const numeroMecanografico = json.data.numeroMecanografico;

    if (!confirm(`Enviar email de reset de password para ${email}, numero mecanográfico ${numeroMecanografico}?`)) return;

    const response = await fetch("http://localhost:8080/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numeroMecanografico }),
    });

    if (response.ok) {
      alert(`Email de reset enviado para ${email}.`);
    } else {
      const data = await response.json().catch(() => ({}));
      alert(data?.message || "Erro ao enviar email de reset.");
    }
  } catch (_) {
    alert("Erro de ligação ao servidor.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarPopups();
  await carregarUtilizadores();
});
