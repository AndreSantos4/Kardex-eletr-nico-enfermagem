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
      if (!u.processo) return false;
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
    const alertas = renderAlertas(u);

    tbody.innerHTML += `
    <tr>
      <td>${u.id}</td>
      <td>${u.nome}</td>
      <td>${cama}</td>
      <td>${u.processo.diagnosticoPrincipal}</td>
      <td>${u.processo.medicoResponsavel.dados.nome}</td>
      <td>${(u.processo.dataEntrada ?? "").split(":")[0]}</td>
      <td>${estado}</td>
      <td>${alertas}</td>
      <td>
        <button class="ver-mais bg-transparent border-[1.5px] border-primary text-primary text-[11px] font-bold tracking-wider px-3 py-1.5 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
            onclick="location.href = '/enfermeiroChefeKardexUtente?id=${u.id}'">
            VER MAIS
        </button>
      </td>
    </tr>`;
  });
}

function renderAlertas(u) {
  const labels = [];
  const flags = u.flags ?? [];
  flags.forEach((f) => {
    const texto = String(f).replace(/^RISCO_/, "").toLowerCase();
    labels.push(texto.charAt(0).toUpperCase() + texto.slice(1));
  });
  const alergias = u.alergias ?? [];
  if (alergias.length > 0) {
    labels.push("Alergias");
  }
  return labels.length === 0
    ? `<span class="text-primary/50 text-xs">—</span>`
    : `<span class="text-alertas text-xs font-semibold">${labels.join(", ")}</span>`;
}

function renderizarPaginacao() {
  document.querySelector(".paginacao")?.remove();
  const totalPaginas = Math.max(
    1,
    Math.ceil(utilizadoresFiltrados.length / itemsPorPagina),
  );

  const div = document.createElement("div");
  div.className = "paginacao flex items-center justify-between gap-3 px-4 py-2.5 border-t border-primary/30 bg-white";

  const seletor = document.createElement("div");
  seletor.className = "paginacao-tamanho flex items-center gap-2 text-primary text-xs font-semibold";
  const label = document.createElement("label");
  label.htmlFor = "items-por-pagina";
  label.textContent = "Utentes por página:";
  const select = document.createElement("select");
  select.id = "items-por-pagina";
  select.className = "bg-white border border-primary rounded text-primary text-xs font-semibold px-2 py-1 cursor-pointer outline-none";
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
  paginas.className = "paginacao-paginas flex items-center gap-1.5";
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
  const el = document.querySelector(".page-header-left p");
  if (el) el.textContent = `${utilizadoresFiltrados.length} utilizadores`;
}

function renderTopbar() {
  const nome = document.getElementById("nome-chefe");
  const turno = document.getElementById("turno-chefe");
  if (nome) nome.textContent = sessionStorage.getItem("nomeEnfermeiro") ?? "—";
  if (turno) turno.textContent = sessionStorage.getItem("turno") ?? "—";
}

function updateClock() {
  const el = document.getElementById("current-datetime");
  if (!el) return;
  el.textContent = new Date().toLocaleString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  renderTopbar();
  updateClock();
  setInterval(updateClock, 60_000);

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
