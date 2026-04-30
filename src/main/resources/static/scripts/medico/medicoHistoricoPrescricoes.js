const params = new URLSearchParams(window.location.search);
const patientId = params.get("id");

const OPCOES_ITEMS_POR_PAGINA = [5, 10, 20, 30, 50];

let todasPrescricoes = [];
let prescricoesFiltradas = [];
let paginaAtual = 0;
let itemsPorPagina = 10;

let debounceTimer = null;

function calcularDataFim(dataInicioStr, duracaoDias) {
    if (!dataInicioStr || !duracaoDias) return "—";
    const partes = dataInicioStr.split(/[/:]/);
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);
    const data = new Date(ano, mes, dia);
    data.setDate(data.getDate() + duracaoDias);
    return data.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatarData(dataStr) {
    if (!dataStr) return "—";
    const partes = dataStr.split(/[/:]/);
    if (partes.length < 3) return dataStr;
    return `${partes[0]}/${partes[1]}/${partes[2]}`;
}

function renderizarTabela() {
    const tbody = document.getElementById("historico-tbody");
    tbody.innerHTML = "";

    const inicio = paginaAtual * itemsPorPagina;
    const pagina = prescricoesFiltradas.slice(inicio, inicio + itemsPorPagina);

    if (pagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="td-loading">Sem prescrições encontradas.</td></tr>`;
        return;
    }

    pagina.forEach(p => {
        const ativa = p.ativa ?? true;
        const estadoBadge = ativa
            ? `<span class="badge badge-ativa">Ativa</span>`
            : `<span class="badge badge-inativa">Inativa</span>`;
        const sosBadge = p.sos
            ? `<span class="badge badge-sos">SOS</span>`
            : `<span style="color:rgba(255,255,255,0.4)">—</span>`;
        const via = p.medicamento?.viaAdministracao ?? "—";
        const unidade = p.medicamento?.unidadeMedida ?? "";
        const dataInicio = formatarData(p.inicio);
        const dataFim = calcularDataFim(p.inicio, p.duracaoDias);

        const acaoCell = ativa
            ? `<button class="btn-suspender">Suspender</button>`
            : `<span class="motivo-inativo">${p.motivoSuspensao || "Suspensa"}</span>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${p.medicamento?.nome ?? "—"}</strong></td>
            <td>${p.dose ?? "—"} ${unidade}</td>
            <td>${via}</td>
            <td>${dataInicio}</td>
            <td>${dataFim}</td>
            <td>${p.duracaoDias ?? "—"} dias</td>
            <td>${p.motivo || "—"}</td>
            <td>${sosBadge}</td>
            <td>${estadoBadge}</td>
            <td>${acaoCell}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarPaginacao() {
    document.querySelector(".paginacao")?.remove();
    const totalPaginas = Math.max(
        1,
        Math.ceil(prescricoesFiltradas.length / itemsPorPagina)
    );

    const div = document.createElement("div");
    div.className = "paginacao";

    // Seletor de itens por página
    const seletor = document.createElement("div");
    seletor.className = "paginacao-tamanho";
    const label = document.createElement("label");
    label.htmlFor = "items-por-pagina";
    label.textContent = "Prescrições por página:";
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

    // Botões de página
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

    document.querySelector(".historico-table-wrap").after(div);
}

function aplicarFiltros() {
    const query = document.getElementById("search-input").value.toLowerCase().trim();
    const estado = document.getElementById("filtro-estado").value;

    prescricoesFiltradas = todasPrescricoes.filter(p => {
        const nomeMatch = (p.medicamento?.nome ?? "").toLowerCase().includes(query);
        const estadoMatch =
            estado === "todos" ||
            (estado === "ativa" && p.ativa) ||
            (estado === "inativa" && !p.ativa);
        return nomeMatch && estadoMatch;
    });

    paginaAtual = 0;
    renderizarTabela();
    renderizarPaginacao();
}

async function carregarPaciente() {
    try {
        const resp = await fetch(`/api/patients/${patientId}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const dados = json.data.dados;
        const processo = dados.processo;

        document.getElementById("nome-utente").textContent = dados.nome ?? "—";
        document.getElementById("processo").textContent = processo?.id ?? "—";
        document.getElementById("cama").textContent = processo?.cama?.id ?? "—";
        document.getElementById("diagnostico").textContent = processo?.diagnosticoPrincipal ?? "—";

        if (processo?.dataEntrada) {
            const partes = processo.dataEntrada.split("/");
            const entrada = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
            const dias = Math.floor((Date.now() - entrada.getTime()) / 86400000);
            document.getElementById("dias-internado").textContent = isNaN(dias) ? "—" : dias;
        } else {
            document.getElementById("dias-internado").textContent = "—";
        }

        document.getElementById("btn-kardex").onclick = () => {
            window.location.href = `medicoKardexUtente?id=${patientId}`;
        };
        document.getElementById("btn-prescrever").onclick = () => {
            window.location.href = `medicoPrescreverMedicamento?id=${patientId}`;
        };

        return processo?.id ?? null;
    } catch (err) {
        console.error("[Histórico] Erro ao carregar paciente:", err);
        return null;
    }
}

async function carregarPrescricoes(processId) {
    const tbody = document.getElementById("historico-tbody");
    try {
        const resp = await fetch(`/api/processes/${processId}/prescriptions`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();

        todasPrescricoes = json.data ?? [];
        prescricoesFiltradas = [...todasPrescricoes];

        renderizarTabela();
        renderizarPaginacao();
    } catch (err) {
        console.error("[Histórico] Erro ao carregar prescrições:", err);
        tbody.innerHTML = `<tr><td colspan="10" class="td-loading" style="color:#f05050;">Erro ao carregar prescrições.</td></tr>`;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("nome-medico").textContent =
        sessionStorage.getItem("nomeUtilizador") ?? "—";

    // Renderizar paginação imediatamente para o seletor ficar visível
    renderizarPaginacao();

    if (!patientId) {
        document.getElementById("historico-tbody").innerHTML =
            `<tr><td colspan="10" class="td-loading" style="color:#f05050;">ID de utente em falta no URL.</td></tr>`;
        return;
    }

    const processId = await carregarPaciente();
    if (processId) {
        await carregarPrescricoes(processId);
    } else {
        document.getElementById("historico-tbody").innerHTML =
            `<tr><td colspan="10" class="td-loading" style="color:#f05050;">Não foi possível obter o processo clínico.</td></tr>`;
    }

    document.getElementById("search-input").addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(aplicarFiltros, 300);
    });

    document.getElementById("filtro-estado").addEventListener("change", aplicarFiltros);
});
