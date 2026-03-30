const params = new URLSearchParams(window.location.search);
const userId = params.get("id");
let popUpEditar;

const ITEMS_POR_PAGINA = 8;
let todosOsTurnos = [];
let paginaAtual = 0;

(async () => {
  const container = document.getElementById("popUpContainer");
  const resp = await fetch(`popups/popupEditar.html`);
  const html = await resp.text();
  container.insertAdjacentHTML("beforeend", html);

  popUpEditar = document.querySelector(".pop-up-editar");
  inicializarFormEditar();
})();

async function carregarPerfil() {
  let workerid = 0;
  if (!userId) {
    console.error("userId está null — verifica se ?id=XX está na URL");
    return;
  }

  try {
    const [respUser, respUserWorker] = await Promise.all([
      fetch(`http://localhost:8080/api/users/${userId}`, {
        credentials: "include",
      }),
      fetch(`http://localhost:8080/api/workers/users/${userId}/worker`, {
        credentials: "include",
      }),
    ]);

    if (respUserWorker.ok) {
      const respUserWorkerSum = (await respUserWorker.json()).data;
      workerid = respUserWorkerSum.id;
      if (workerid <= 0) {
        console.log("ERRO AO OBTER WORKER ID");
        return;
      }
    }

    const [respSummary, respShifts] = await Promise.all([
      fetch(`http://localhost:8080/api/workers/${workerid}/summary`, {
        credentials: "include",
      }),
      fetch(`http://localhost:8080/api/workers/${workerid}/shifts/summary`, {
        credentials: "include",
      }),
    ]);

    if (!respUser.ok) {
      console.error("Erro ao carregar utilizador:", respUser.status);
      return;
    }

    const user = (await respUser.json()).data;
    const summary = respSummary.ok ? (await respSummary.json()).data : null;
    const shifts = respShifts.ok ? (await respShifts.json()).data : [];

    document.querySelector(".profile-name").textContent = user.nome ?? "-";
    document.querySelector(".profile-role").textContent = user.role ?? "-";
    document.querySelector(".profile-status").textContent = user.ativo
      ? "Ativo"
      : "Inativo";

    document.getElementById("val-nome").textContent = user.nome ?? "-";
    document.getElementById("val-email").textContent = user.email ?? "-";
    document.getElementById("val-admissao").textContent =
      user.dataCriacao ?? "-";
    document.getElementById("val-mecanografico").textContent =
      user.numeroMecanografico ?? "-";
    document.getElementById("val-role").textContent = user.role ?? "-";
    document.getElementById("val-contacto").textContent = user.contacto ?? "-";
    document.getElementById("val-contactoeme").textContent =
      user.contactoEmergencia ?? "-";
    document.getElementById("val-cc").textContent = user.numeroCC ?? "-";

    document.getElementById("val-ultimo-acesso").textContent =
      summary?.lastAccess ?? "-";
    document.getElementById("val-turnos-mes").textContent =
      summary?.shiftsThisMonth ?? 0;
    document.getElementById("val-adm-mes").textContent =
      summary?.administrationsThisMonth ?? 0;
    document.getElementById("val-incidentes").textContent =
      summary?.incidentsThisMonth ?? 0;

    todosOsTurnos = shifts;
    paginaAtual = 0;
    renderizarTurnos();
    renderizarPaginacaoTurnos();
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}

function renderizarTurnos() {
  const table = document.querySelector(".shifts-table");

  table
    .querySelectorAll(".shifts-row:not(.shifts-header)")
    .forEach((r) => r.remove());

  const inicio = paginaAtual * ITEMS_POR_PAGINA;
  const pagina = todosOsTurnos.slice(inicio, inicio + ITEMS_POR_PAGINA);

  if (!pagina || pagina.length === 0) {
    const row = document.createElement("div");
    row.className = "shifts-row";
    row.innerHTML = `<span style="grid-column: 1/-1; color: var(--text-muted, #ffffff);">Sem turnos recentes.</span>`;
    table.appendChild(row);
    return;
  }

  pagina.forEach((s) => {
    const row = document.createElement("div");
    row.className = "shifts-row";
    row.innerHTML = `
      <span>${s.data ?? "-"}</span>
      <span>${s.nome ?? "-"}</span>
      <span>${s.nAdministracoes ?? 0}</span>
      <span>${s.nIncidentes ?? 0}</span>
    `;
    table.appendChild(row);
  });
}

function renderizarPaginacaoTurnos() {
  document.querySelector(".shifts-paginacao")?.remove();

  const totalPaginas = Math.ceil(todosOsTurnos.length / ITEMS_POR_PAGINA);
  if (totalPaginas <= 1) return;

  const div = document.createElement("div");
  div.className = "shifts-paginacao paginacao";

  for (let i = 0; i < totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.className = `btn-pagina${i === paginaAtual ? " ativo" : ""}`;
    btn.onclick = () => {
      paginaAtual = i;
      renderizarTurnos();
      renderizarPaginacaoTurnos();
    };
    div.appendChild(btn);
  }

  document.querySelector(".shifts-card").appendChild(div);
}

const popUpContainer = document.getElementById("popUpContainer");
const contentContainer = document.querySelector(".content");

function fecharPopUp() {
  popUpContainer.style.display = "none";
  popUpEditar.style.display = "none";
  contentContainer.style.opacity = "1";
}

function getToken() {
  return localStorage.getItem("token") ?? "";
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarPerfil();

  document.getElementById("btn-editar").addEventListener("click", () => {
    abrirEditar(userId);
  });
});
