let _medicamentosCache = [];

const STOCK_CRITICO_MINIMO = 50;

function parsearData(strData) {
    if (!strData) return null;
    const [d, m, a] = strData.split("/");
    return new Date(`${a}-${m}-${d}`);
}

function calcularQuantidadeValida(lotes = []) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return lotes
        .filter(lote => {
            const validade = parsearData(lote.validade);
            return !validade || validade >= hoje;
        })
        .reduce((acc, lote) => acc + (lote.quantidade ?? 0), 0);
}

function calcularQuantidadeTotal(lotes = []) {
    return calcularQuantidadeValida(lotes);
}

function obterValidadeMaisProxima(lotes = []) {
    if (!lotes.length) return "—";

    const comValidade = lotes
        .map(l => l.validade)
        .filter(Boolean)
        .map(v => {
            const [d, m, a] = v.split("/");
            return { original: v, date: new Date(`${a}-${m}-${d}`) };
        })
        .sort((a, b) => a.date - b.date);

    return comValidade.length ? comValidade[0].original : "—";
}

function obterEstadoStock(quantidade) {
    if (quantidade <= 0) return { label: "Esgotado", classe: "esgotado" };
    if (quantidade <= STOCK_CRITICO_MINIMO) return { label: "Crítico", classe: "critico" };
    if (quantidade <= STOCK_CRITICO_MINIMO * 1.5) return { label: "Baixo", classe: "baixo" };
    return { label: "Normal", classe: "normal" };
}

function preencherHeaderDataHora() {
    const el = document.getElementById("header-data-hora");
    if (!el) return;

    const agora = new Date();
    const data = agora.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
    const hora = agora.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

    // TODO: substituir "Turno TODO" pelo turno real quando disponível
    el.textContent = `${data} - ${hora} - Turno TODO`;
}

async function carregarMedicamentos() {
    try {
        const resposta = await fetch("http://localhost:8080/api/stock/medications");
        const json = await resposta.json();

        if (!json.success || !Array.isArray(json.data)) {
            throw new Error("Resposta inválida da API");
        }

        _medicamentosCache = json.data;
        renderizarTabelaInventario(_medicamentosCache);
        renderizarStockCritico(_medicamentosCache);
        atualizarFiltros(_medicamentosCache);
    } catch (erro) {
        mostrarNotificacao({ titulo: "Erro", mensagem: "Não foi possível carregar o inventário.", tipo: "erro" });
    }
}


function atualizarFiltros(medicamentos) {
    const select = document.getElementById("filtro");
    if (!select) return;

    select.innerHTML = '<option value="todos">Todos</option>';

    const classes = [...new Set(medicamentos.map(m => m.classeFarmacologica).filter(Boolean))];
    classes.sort().forEach(classe => {
        const opt = document.createElement("option");
        opt.value = classe;
        opt.textContent = formatarEnum(classe);
        select.appendChild(opt);
    });
}

function formatarEnum(valor) {
    if (!valor) return "—";
    return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase().replace(/_/g, " ");
}

function renderizarTabelaInventario(medicamentos) {
    const tbody = document.querySelector("table.inventario tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!medicamentos.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Sem medicamentos registados</td></tr>`;
        return;
    }

    medicamentos.forEach(med => {
        console.log(med);
        const quantidade = calcularQuantidadeTotal(med.lotes);
        const validade = obterValidadeMaisProxima(med.lotes);

        const estado = obterEstadoStock(quantidade);
        const disponivel = med.active ? "Sim" : "Não";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${med.nome}</td>
            <td>${quantidade}</td>
            <td>${disponivel}</td>
            <td>${STOCK_CRITICO_MINIMO}</td>
            <td><span class="estado-badge estado-${estado.classe}">${estado.label}</span></td>
            <td>${validade}</td>
            <td><button onclick="abrirPopupRepor(${med.id})">Repor</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarStockCritico(medicamentos) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const criticos = medicamentos.filter(med => {
        const qtdValida = calcularQuantidadeValida(med.lotes);
        return qtdValida <= STOCK_CRITICO_MINIMO;
    });

    const secao = document.getElementById("secao-stock-critico");
    const lista = document.getElementById("lista-stock-critico");
    if (!secao || !lista) return;

    if (!criticos.length) {
        secao.style.display = "none";
        return;
    }

    secao.style.display = "";

    lista.innerHTML = criticos.map(med => {
        const qtdValida = calcularQuantidadeValida(med.lotes);
        const temLotesExpirados = med.lotes.some(lote => {
            const v = parsearData(lote.validade);
            return v && v < hoje;
        });

        const avisoExpiracao = temLotesExpirados
            ? `<span class="aviso-lotes-expirados"> ⚠️ lotes expirados excluídos</span>`
            : "";

        return `
            <div class="stock-critico-item">
                <strong>${med.nome}</strong>
                — ${qtdValida} unidades válidas em stock
                ${avisoExpiracao}
            </div>`;
    }).join("");
}

async function carregarPopupRegistarStock() {
    const container = document.getElementById("popup-container");
    const resposta = await fetch("../../pages/enfermeiroChefe/popups/popupRegistarEntradaStock.html");
    const html = await resposta.text();
    container.innerHTML = html;
    preencherSelectMedicamentos();
}

function preencherSelectMedicamentos() {
    const select = document.getElementById("medicamento-stock");
    if (!select) return;

    select.innerHTML = "";

    if (!_medicamentosCache.length) {
        select.innerHTML = '<option value="" disabled selected>Sem medicamentos disponíveis</option>';
        return;
    }

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = "Selecione um medicamento…";
    select.appendChild(placeholder);

    _medicamentosCache.forEach(med => {
        const option = document.createElement("option");
        option.value = med.id;
        const dosagens = (med.dosagens ?? [])
            .map(d => `${d.dose} ${formatarEnum(d.unidadeMedida)}`)
            .join(", ");
        option.textContent = dosagens ? `${med.nome} (${dosagens})` : med.nome;
        select.appendChild(option);
    });
}

function abrirPopupRegistarStock() {
    const popup = document.getElementById("popup-registar-stock");
    if (!popup) return;

    document.getElementById("quantidade-stock").value = "";

    const select = document.getElementById("medicamento-stock");
    if (select) select.value = "";

    popup.style.display = "flex";
}

function abrirPopupRepor(idMedicamento) {
    const popup = document.getElementById("popup-registar-stock");
    if (!popup) return;

    document.getElementById("quantidade-stock").value = "";

    const select = document.getElementById("medicamento-stock");
    if (select) select.value = idMedicamento;

    popup.style.display = "flex";
}

function fecharPopupRegistarStock() {
    const popup = document.getElementById("popup-registar-stock");
    if (popup) popup.style.display = "none";
}

async function submeterRegistarStock(event) {
    event.preventDefault();

    const select = document.getElementById("medicamento-stock");
    const idMedicamento = parseInt(select?.value);
    const quantidade = parseInt(document.getElementById("quantidade-stock").value);

    if (!idMedicamento || isNaN(idMedicamento)) {
        mostrarNotificacao({ titulo: "Campo obrigatório", mensagem: "Selecione um medicamento.", tipo: "aviso" });
        return;
    }

    if (!quantidade || quantidade < 1) {
        mostrarNotificacao({ titulo: "Campo obrigatório", mensagem: "Insira uma quantidade válida.", tipo: "aviso" });
        return;
    }

    try {
        const resposta = await fetch(`http://localhost:8080/api/stock/medications/${idMedicamento}/batches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idMedicamento, quantidade })
        });

        const json = await resposta.json();

        if (!resposta.ok || !json.success) {
            throw new Error(json.message || "Erro ao registar entrada");
        }

        mostrarNotificacao({ titulo: "Entrada registada", mensagem: "O stock foi atualizado com sucesso.", tipo: "sucesso" });
        fecharPopupRegistarStock();
        await carregarMedicamentos();
    } catch (erro) {
        mostrarNotificacao({ titulo: "Erro ao registar", mensagem: erro.message || "Não foi possível contactar o servidor.", tipo: "erro" });
    }
}

function aplicarFiltro() {
    const valor = document.getElementById("filtro")?.value ?? "todos";
    const filtrados = valor === "todos"
        ? _medicamentosCache
        : _medicamentosCache.filter(m => m.classeFarmacologica === valor);

    renderizarTabelaInventario(filtrados);
}

document.addEventListener("DOMContentLoaded", async () => {
    preencherHeaderDataHora();
    await carregarMedicamentos();
    await carregarPopupRegistarStock();

    document.getElementById("btn-entrada").addEventListener("click", abrirPopupRegistarStock);
    document.getElementById("filtro").addEventListener("change", aplicarFiltro);
});