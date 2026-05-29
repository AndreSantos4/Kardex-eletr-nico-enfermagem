const API_BASE = "http://localhost:8080/api";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

const TIPO_LABELS = {
  AUTH: "Autenticação",
  PATIENT_ACCEPTANCE: "Utente admitido",
  PATIENT_DISCHARGE: "Utente liberado",
  USER_CREATION: "Criação de utilizador",
  PASSWORD_RESET_REQUEST: "Pedido de alteração de password",
};

const state = {
  currentPage: 1,
  pageSize: 10,
  hasNext: false,
  loading: false,
  prefetchCache: {},
};

function getFilters() {
  const tipo = document.getElementById("filter-tipo")?.value ?? "";
  const data = document.getElementById("filter-data")?.value ?? "";
  const search = document.getElementById("search-input")?.value.trim() ?? "";
  return { tipo, data, search };
}

function cacheKey(page, filters) {
  return `${page}|${filters.tipo}|${filters.data}|${filters.search}`;
}

async function fetchPage(page, filters) {
  const offset = (page - 1) * state.pageSize;
  const params = new URLSearchParams({ offset, count: state.pageSize + 1 });
  if (filters.tipo) params.set("type", filters.tipo);
  if (filters.data) params.set("date", filters.data);
  if (filters.search) params.set("search", filters.search);

  const response = await fetch(`${API_BASE}/records?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);

  const json = await response.json();
  if (!json.success)
    throw new Error(json.message ?? "Erro desconhecido da API");

  const all = json.data ?? [];
  const hasNext = all.length > state.pageSize;
  const records = hasNext ? all.slice(0, state.pageSize) : all;

  return { data: records, hasNext };
}

function prefetchNext(page, filters) {
  const key = cacheKey(page, filters);
  if (state.prefetchCache[key]) return;

  state.prefetchCache[key] = fetchPage(page, filters).catch(() => {
    delete state.prefetchCache[key];
  });
}

function clearPrefetchCache() {
  state.prefetchCache = {};
}

function getBadgeClass(tipo) {
  const map = {
    AUTH: "badge-auth",
    PATIENT_ACCEPTANCE: "badge-acesso",
    PATIENT_DISCHARGE: "badge-discharge",
    USER_CREATION: "badge-user",
    PASSWORD_RESET_REQUEST: "badge-login",
  };
  return map[tipo] ?? "badge-acesso";
}

function formatDate(dataStr) {
  if (!dataStr) return "—";
  const parts = dataStr.split("/");
  if (parts.length < 4) return dataStr;
  const [day, month, year, time] = parts;
  return `${day}/${month}/${year} - ${(time ?? "").substring(0, 5)}`;
}

function renderTable(logs) {
  const tbody = document.getElementById("logs-body");
  if (!tbody) return;

  if (!logs.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted,#888);">Nenhum registo encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = logs
    .map(
      (log) => `
        <tr>
            <td class="row-datetime">${formatDate(log.data)}</td>
            <td class="row-user-name">${log.utilizador?.nome ?? "----"}</td>
            <td class="row-type"><span class="${getBadgeClass(log.tipo)}">${TIPO_LABELS[log.tipo] ?? log.tipo ?? "—"}</span></td>
            <td class="row-desc">${log.mensagem ?? "—"}</td>
            <td class="row-ip">${log.ip ?? "—"}</td>
        </tr>
    `,
    )
    .join("");
}

function renderPagination(current, hasNext) {
  const countEl = document.getElementById("log-count");
  if (countEl) countEl.textContent = `Página ${current}`;

  const container = document.getElementById("pagination");
  if (!container) return;

  const hasPrev = current > 1;

  const pages = [];
  for (let i = Math.max(1, current - 2); i <= current; i++) pages.push(i);
  if (hasNext) pages.push(current + 1);

  container.innerHTML = `
        <button class="page-btn" data-page="${current - 1}" ${!hasPrev ? "disabled" : ""}>&#8249; Anterior</button>
        ${pages
          .map(
            (p) =>
              `<button class="page-btn ${p === current ? "active" : ""}" data-page="${p}">${p}</button>`,
          )
          .join("")}
        <button class="page-btn" data-page="${current + 1}" ${!hasNext ? "disabled" : ""}>Próxima &#8250;</button>
    `;

  container.querySelectorAll(".page-btn:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.page, 10);
      if (page >= 1) {
        state.currentPage = page;
        loadPage();
      }
    });
  });
}

function renderPageSizeSelector() {
  if (document.getElementById("page-size-wrapper")) return;

  const container = document.getElementById("pagination");
  if (!container) return;

  const wrapper = document.createElement("div");
  wrapper.id = "page-size-wrapper";
  wrapper.innerHTML = `
        <label for="page-size-selector">Registos por página:</label>
        <select id="page-size-selector">
            ${PAGE_SIZE_OPTIONS.map(
              (n) =>
                `<option value="${n}" ${n === state.pageSize ? "selected" : ""}>${n}</option>`,
            ).join("")}
        </select>
    `;

  container.parentNode.insertBefore(wrapper, container);

  document
    .getElementById("page-size-selector")
    .addEventListener("change", (e) => {
      state.pageSize = parseInt(e.target.value, 10);
      state.currentPage = 1;
      clearPrefetchCache();
      loadPage();
    });
}

async function loadPage() {
  if (state.loading) return;
  state.loading = true;

  const filters = getFilters();
  const current = state.currentPage;
  const key = cacheKey(current, filters);

  try {
    const result = await (state.prefetchCache[key] ??
      fetchPage(current, filters));
    delete state.prefetchCache[key];

    const { data, hasNext } = result;
    state.hasNext = hasNext;

    renderTable(data);
    renderPagination(current, hasNext);

    if (hasNext) {
      prefetchNext(current + 1, filters);
    }
  } catch (err) {
    console.error("[Logs Auditoria]", err);
    const tbody = document.getElementById("logs-body");
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#c00;">Erro ao carregar registos. Verifica a consola.</td></tr>`;
  } finally {
    state.loading = false;
  }
}

function setupFilterListeners() {
  document.getElementById("filter-tipo")?.addEventListener("change", () => {
    state.currentPage = 1;
    clearPrefetchCache();
    loadPage();
  });

  document.getElementById("filter-data")?.addEventListener("change", () => {
    state.currentPage = 1;
    clearPrefetchCache();
    loadPage();
  });

  let searchTimeout;
  document.getElementById("search-input")?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.currentPage = 1;
      clearPrefetchCache();
      loadPage();
    }, 350);
  });

  // TODO: Implementar filtro de administrador (btn-admin-pill)
  document
    .querySelector(".btn-admin-pill")
    ?.addEventListener("click", () => {});
}

function injectStyles() {
  if (document.getElementById("pagination-styles")) return;

  const style = document.createElement("style");
  style.id = "pagination-styles";
  style.textContent = `
        #page-size-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem 0.25rem;
            font-size: 0.85rem;
            color: var(--text-muted, #666);
        }
        #page-size-wrapper label { font-weight: 500; }
        #page-size-selector {
            padding: 0.25rem 0.6rem;
            border: 1px solid var(--border, #ddd);
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            background: var(--surface, #fff);
            color: var(--text, #333);
        }
        #pagination {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.75rem 1.25rem 1rem;
            flex-wrap: wrap;
        }
        .page-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 2.2rem;
            height: 2.2rem;
            padding: 0 0.6rem;
            border: 1px solid var(--border, #ddd);
            border-radius: 6px;
            background: var(--surface, #fff);
            color: var(--text, #333);
            font-size: 0.85rem;
            cursor: pointer;
            transition: background 0.15s, color 0.15s, border-color 0.15s;
            white-space: nowrap;
        }
        .page-btn:hover:not([disabled]):not(.active) {
            background: var(--primary-light, #e8f0fe);
            border-color: var(--primary, #4a7aff);
            color: var(--primary, #4a7aff);
        }
        .page-btn.active {
            background: var(--primary, #4a7aff);
            border-color: var(--primary, #4a7aff);
            color: #fff;
            font-weight: 600;
            cursor: default;
        }
        .page-btn[disabled] { opacity: 0.4; cursor: not-allowed; }
        .page-ellipsis {
            padding: 0 0.4rem;
            color: var(--text-muted, #999);
            font-size: 0.9rem;
            user-select: none;
        }
    `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", () => {
  injectStyles();
  renderPageSizeSelector();
  setupFilterListeners();
  loadPage();
});
