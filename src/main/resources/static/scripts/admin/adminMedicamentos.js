const OPCOES_ITEMS_POR_PAGINA = [5, 10, 20, 30, 50];
let itemsPorPagina = 10;
let todosMedicamentos = [];
let medicamentosFiltrados = [];
let paginaAtual = 0;

function ordenarPorNome(lista) {
  return [...lista].sort((a, b) =>
    (a.nome ?? "").localeCompare(b.nome ?? "", "pt", { sensitivity: "base" }),
  );
}

let debounceTimer = null;
function onPesquisaInput(valor) {
  clearTimeout(debounceTimer);
  paginaAtual = 0;
  debounceTimer = setTimeout(() => {
    const termo = valor.trim().toLowerCase();
    medicamentosFiltrados = termo
      ? todosMedicamentos.filter((m) =>
          (m.nome ?? "").toLowerCase().includes(termo),
        )
      : [...todosMedicamentos];
    paginaAtual = 0;
    atualizarContador();
    renderizarTabela();
    renderizarPaginacao();
  }, 300);
}

async function carregarMedicamentos() {
  try {
    const resp = await fetch("http://localhost:8080/api/stock/medications", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!resp.ok) throw new Error("Erro ao carregar medicamentos");
    const json = await resp.json();
    todosMedicamentos = ordenarPorNome(json.data ?? []);
    medicamentosFiltrados = [...todosMedicamentos];
    paginaAtual = 0;
    atualizarContador();
    renderizarTabela();
    renderizarPaginacao();
  } catch (err) {
    console.error(err);
  }
}

function formatarDosagens(dosagens) {
  if (!dosagens || dosagens.length === 0) return "—";
  return dosagens
    .map((d) => `${d.dose}${d.unidadeMedida ? " " + d.unidadeMedida : ""}`)
    .join(" / ");
}

function formatarClasse(classe) {
  if (!classe) return "—";
  return String(classe).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderizarTabela() {
  const tbody = document.querySelector(".lista-medicamentos tbody");
  tbody.innerHTML = "";
  const inicio = paginaAtual * itemsPorPagina;
  const pagina = medicamentosFiltrados.slice(inicio, inicio + itemsPorPagina);

  if (pagina.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center">Sem resultados</td></tr>`;
    return;
  }

  pagina.forEach((m) => {
    const estado = m.active ? "Ativo" : "Inativo";
    const altoRisco = m.altoRisco ? "Sim" : "—";
    const acaoBtn = m.active
      ? `<button onclick="desativarMedicamento(${m.id})">Desativar</button>`
      : `<button onclick="ativarMedicamento(${m.id})">Ativar</button>`;

    tbody.innerHTML += `
      <tr>
        <td>${m.nome ?? "—"}</td>
        <td>${m.principioAtivo ?? "—"}</td>
        <td>${m.formaFarmaceutica ?? "—"}</td>
        <td>${m.viaAdministracao ?? "—"}</td>
        <td>${formatarClasse(m.classeFarmacologica)}</td>
        <td>${formatarDosagens(m.dosagens)}</td>
        <td>${altoRisco}</td>
        <td>${estado}</td>
        <td>
          <button onclick="editarMedicamento(${m.id})">Editar</button>
          ${acaoBtn}
        </td>
      </tr>`;
  });
}

function renderizarPaginacao() {
  document.querySelector(".paginacao")?.remove();
  const totalPaginas = Math.max(
    1,
    Math.ceil(medicamentosFiltrados.length / itemsPorPagina),
  );

  const div = document.createElement("div");
  div.className = "paginacao";

  const seletor = document.createElement("div");
  seletor.className = "paginacao-tamanho";
  const label = document.createElement("label");
  label.htmlFor = "items-por-pagina";
  label.textContent = "Medicamentos por página:";
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

  document.querySelector(".lista-medicamentos-table").after(div);
}

function atualizarContador() {
  const el = document.querySelector(".page-header-left p");
  if (el) el.textContent = `${medicamentosFiltrados.length} medicamentos`;
}

async function desativarMedicamento(id) {
  if (!confirm("Desativar este medicamento?")) return;
  try {
    const resp = await fetch(
      `http://localhost:8080/api/stock/medications/${id}/deactivate`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    if (!resp.ok) throw new Error("Erro ao desativar medicamento");
    await carregarMedicamentos();
  } catch (err) {
    console.error(err);
  }
}

async function ativarMedicamento(id) {
  try {
    const resp = await fetch(
      `http://localhost:8080/api/stock/medications/${id}/activate`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    if (!resp.ok) throw new Error("Erro ao ativar medicamento");
    await carregarMedicamentos();
  } catch (err) {
    console.error(err);
  }
}

function editarMedicamento(id) {
  console.log("Editar medicamento:", id);
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarMedicamentos();

  const inputPesquisa = document.querySelector(".search-input-wrap input");
  inputPesquisa?.addEventListener("input", (e) =>
    onPesquisaInput(e.target.value),
  );
});
