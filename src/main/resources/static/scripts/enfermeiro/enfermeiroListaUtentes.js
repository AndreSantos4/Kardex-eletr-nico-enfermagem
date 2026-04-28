const OPCOES_ITEMS_POR_PAGINA = [5, 10, 20, 30, 50];
let itemsPorPagina = 10;
let todosUtilizadores = [];
let utilizadoresFiltrados = [];
let paginaAtual = 0;

let debounceTimer = null;
function onPesquisaInput(valor) {
  clearTimeout(debounceTimer);
  paginaAtual = 0;
  debounceTimer = setTimeout(() => {
    carregarUtilizadores(valor.trim());
  }, 350);
}

function onFiltroEstado(valor) {
  const estadoSelecionado = valor;
  if (estadoSelecionado === "todos") {
    utilizadoresFiltrados = [...todosUtilizadores];
  } else {
    utilizadoresFiltrados = todosUtilizadores.filter((u) => {
      if (!u.processo) return false; // ← guard added
      const estaDeAlta = u.processo.alta;
      if (estadoSelecionado === "alta") return estaDeAlta;
      if (estadoSelecionado === "internado") return !estaDeAlta;
      return true;
    });
  }
  paginaAtual = 0;
  atualizarContador();
  renderizarTabela();
  renderizarPaginacao();
}

async function carregarUtilizadores(filtro = "") {
  try {
    const url = filtro
      ? `http://localhost:8080/api/patients?s=${encodeURIComponent(filtro)}`
      : "http://localhost:8080/api/patients";
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!resp.ok) throw new Error("Erro ao carregar utilizadores");
    const json = await resp.json();
    todosUtilizadores = json.data;

    const estadoAtual = document.getElementById("estados")?.value ?? "todos";
    onFiltroEstado(estadoAtual);
  } catch (err) {
    console.error(err);
  }
}

function renderizarTabela() {
  const tbody = document.querySelector(".lista-utentes tbody");
  tbody.innerHTML = "";
  const inicio = paginaAtual * itemsPorPagina;
  const pagina = utilizadoresFiltrados.slice(inicio, inicio + itemsPorPagina);

  if (pagina.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center">Sem resultados</td></tr>`;
    return;
  }

  pagina.forEach((u) => {
    if (!u.processo) return;

    const estado = u.processo.alta ? "Alta" : "Internado";
    const cama = u.processo.cama?.id ?? "Nenhuma";

    tbody.innerHTML += `
    <tr>
      <td>${u.id}</td>
      <td>${u.nome}</td>
      <td>${cama}</td>
      <td>${u.processo.diagnosticoPrincipal}</td>
      <td>${u.processo.medicoResponsavel.dados.nome}</td>
      <td>${u.processo.dataEntrada}</td>
      <td>${estado}</td>
      <td>${u.processo.temAlergias}</td>
      <td>
        <button class="ver-mais"
            onclick="location.href = '/enfermeiroKardexUtente?id=${u.id}'">
            VER MAIS
        </button>
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
  label.textContent = "Utentes por página:";
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

  document.querySelector(".lista-utentes-table").after(div);
}

function atualizarContador() {
  document.querySelector(".page-header-left p").textContent =
    `${utilizadoresFiltrados.length} utilizadores`;
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarUtilizadores();

  const inputPesquisa = document.querySelector(".search-input-wrap input");
  inputPesquisa?.addEventListener("input", (e) =>
    onPesquisaInput(e.target.value),
  );

  const selectEstado = document.getElementById("estados");
  selectEstado?.addEventListener("change", (e) =>
    onFiltroEstado(e.target.value),
  );
});
