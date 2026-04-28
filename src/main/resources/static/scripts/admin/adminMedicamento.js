const API_BASE = "http://localhost:8080/api/stock/medications";

let _todosMedicamentos = [];
let _termoPesquisa = "";

/* ═══════════════════════════════════════════════════════════
   INICIALIZAÇÃO
═══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    _atualizarRelogio();
    setInterval(_atualizarRelogio, 1000);
    _carregarPopups().then(() => {
        _ligarForms();
        _ligarPesquisa();
        carregarMedicamentos();
    });
});

/* ═══════════════════════════════════════════════════════════
   CARREGAR POPUPS DINAMICAMENTE
═══════════════════════════════════════════════════════════ */
async function _carregarPopups() {
    const popups = [
        "../../pages/admin/popups/popupAdicionarMedicamento.html",
        "../../pages/admin/popups/popupEditarMedicamento.html",
        "../../pages/admin/popups/popupDesativarMedicamento.html",
    ];

    for (const url of popups) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`[popups] Não foi possível carregar: ${url}`);
                continue;
            }
            const html = await res.text();
            const div = document.createElement("div");
            div.innerHTML = html;
            // Garantir que todos os popups começam escondidos
            div.querySelectorAll(
                ".pop-up-adicionar-medicamento, .pop-up-editar-medicamento, .pop-up-desativar-medicamento"
            ).forEach(p => (p.style.display = "none"));
            document.body.appendChild(div);
        } catch (e) {
            console.warn(`[popups] Erro ao carregar ${url}:`, e);
        }
    }
}

/* ═══════════════════════════════════════════════════════════
   LIGAR FORMS — chamado após os popups estarem no DOM
═══════════════════════════════════════════════════════════ */
function _ligarForms() {
    const formAdicionar = document.querySelector(".pop-up-adicionar-medicamento form");
    if (formAdicionar) {
        formAdicionar.removeAttribute("onsubmit");
        formAdicionar.addEventListener("submit", adicionarMedicamento);
    } else {
        console.warn("[forms] form de adicionar não encontrado.");
    }

    const formEditar = document.querySelector(".pop-up-editar-medicamento form");
    if (formEditar) {
        formEditar.removeAttribute("onsubmit");
        formEditar.addEventListener("submit", editarMedicamento);
    } else {
        console.warn("[forms] form de editar não encontrado.");
    }

    const formDesativar = document.querySelector("#form-desativar-medicamento");
    if (formDesativar) {
        formDesativar.removeAttribute("onsubmit");
        formDesativar.addEventListener("submit", desativarMedicamento);
    } else {
        console.warn("[forms] form de desativar não encontrado.");
    }
}

/* ═══════════════════════════════════════════════════════════
   RELÓGIO
═══════════════════════════════════════════════════════════ */
function _atualizarRelogio() {
    const el = document.getElementById("current-datetime");
    if (!el) return;
    const agora = new Date();
    el.textContent = agora.toLocaleString("pt-PT", {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
}

/* ═══════════════════════════════════════════════════════════
   PESQUISA
═══════════════════════════════════════════════════════════ */
function _ligarPesquisa() {
    const input = document.querySelector(".search-input-wrap input");
    if (!input) return;
    input.addEventListener("input", (e) => {
        _termoPesquisa = e.target.value.trim().toLowerCase();
        _renderizarTabela();
    });
}

/* ═══════════════════════════════════════════════════════════
   CARREGAR MEDICAMENTOS  (GET)
═══════════════════════════════════════════════════════════ */
async function carregarMedicamentos() {
    try {
        const res = await fetch(API_BASE);
        const json = await res.json();

        if (!res.ok || !json.success) {
            throw new Error(json.message || "Erro ao obter medicamentos.");
        }

        _todosMedicamentos = json.data || [];
        _renderizarTabela();

    } catch (err) {
        console.error(err);
        mostrarNotificacao({
            titulo: "Erro ao carregar",
            mensagem: err.message || "Não foi possível contactar o servidor.",
            tipo: "erro",
        });
    }
}

/* ═══════════════════════════════════════════════════════════
   RENDERIZAR TABELA
═══════════════════════════════════════════════════════════ */
function _renderizarTabela() {
    const tbody = document.querySelector(".lista-medicamentos tbody");
    if (!tbody) return;

    const lista = _termoPesquisa
        ? _todosMedicamentos.filter(m =>
            m.nome.toLowerCase().includes(_termoPesquisa) ||
            m.principioAtivo.toLowerCase().includes(_termoPesquisa)
        )
        : _todosMedicamentos;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-secondary,#888);">Nenhum medicamento encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(m => _criarLinhaTabela(m)).join("");
}

function _criarLinhaTabela(m) {
    const dosagens = _formatarDosagens(m.dosagens);
    const forma = _traduzirForma(m.formaFarmaceutica);
    const via = _traduzirVia(m.viaAdministracao);
    const classe = _traduzirClasse(m.classeFarmacologica);
    const altoRisco = m.altoRisco ? "Sim" : "---";
    const estado = m.active ? "Ativo" : "Inativo";
    const estadoCls = m.active ? "estado-ativo" : "estado-inativo";

    const btnToggle = m.active
        ? `<button class="btn-desativar" onclick="abrirPopupDesativar(${m.id})">Desativar</button>`
        : `<button class="btn-ativar"    onclick="ativarMedicamento(${m.id})">Ativar</button>`;

    return `
    <tr data-id="${m.id}">
      <td>${_esc(m.nome)}</td>
      <td>${_esc(m.principioAtivo)}</td>
      <td>${forma}</td>
      <td>${via}</td>
      <td>${classe}</td>
      <td>${dosagens}</td>
      <td>${altoRisco}</td>
      <td><span class="badge ${estadoCls}">${estado}</span></td>
      <td>
        <button class="btn-editar" onclick="abrirPopupEditar(${m.id})">Editar</button>
        ${btnToggle}
      </td>
    </tr>`;
}

/* ═══════════════════════════════════════════════════════════
   POPUP — ABRIR / FECHAR
═══════════════════════════════════════════════════════════ */

// Chamado pelo botão "Adicionar" no HTML da página
function abrirpopup() {
    const popup = document.querySelector(".pop-up-adicionar-medicamento");
    if (!popup) { console.error("Popup adicionar não encontrado no DOM."); return; }
    const form = popup.querySelector("form");
    if (form) form.reset();
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function abrirPopupEditar(id) {
    const med = _todosMedicamentos.find(m => m.id === id);
    if (!med) return;

    const popup = document.querySelector(".pop-up-editar-medicamento");
    if (!popup) { console.error("Popup editar não encontrado no DOM."); return; }

    popup.querySelector("#edit-med-nome").value = med.nome;
    popup.querySelector("#edit-med-principio").value = med.principioAtivo;
    popup.querySelector("#edit-med-dosagens").value = _formatarDosagens(med.dosagens);
    popup.querySelector("#edit-med-dose-max").value = med.dosagemMaxDiaria
        ? `${_formatarNumero(med.dosagemMaxDiaria.dose)}${_abreviarUnidade(med.dosagemMaxDiaria.unidadeMedida)}`
        : "";
    popup.querySelector("#edit-med-alto-risco").checked = med.altoRisco;

    _selecionarOption(popup.querySelector("#edit-med-classe"), med.classeFarmacologica);
    _selecionarOption(popup.querySelector("#edit-med-via"), med.viaAdministracao);
    _selecionarOption(popup.querySelector("#edit-med-forma"), med.formaFarmaceutica);

    const form = popup.querySelector("form");
    if (form) form.setAttribute("data-medicamento-id", id);

    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function abrirPopupDesativar(id) {
    const med = _todosMedicamentos.find(m => m.id === id);
    if (!med) return;

    const popup = document.querySelector(".pop-up-desativar-medicamento");
    if (!popup) { console.error("Popup desativar não encontrado no DOM."); return; }

    const spanNome = popup.querySelector("#desativar-med-nome");
    if (spanNome) spanNome.textContent = `${med.nome} — ${_traduzirClasse(med.classeFarmacologica)} — ${_formatarDosagens(med.dosagens)}`;

    const inputMotivo = popup.querySelector("#desativar-med-motivo");
    if (inputMotivo) inputMotivo.value = "";

    const form = popup.querySelector("#form-desativar-medicamento");
    if (form) form.setAttribute("data-medicamento-id", id);

    const spanUtentes = popup.querySelector("#desativar-med-num-utentes");
    if (spanUtentes) spanUtentes.textContent = "— UTENTES";
    const pMedicos = popup.querySelector("#desativar-med-medicos");
    if (pMedicos) pMedicos.textContent = "Informação de prescrições não disponível.";

    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function fecharPopUp(seletor) {
    const popup = document.querySelector(seletor);
    if (popup) {
        popup.style.display = "none";
        document.body.style.overflow = "";
    }
}

// Fechar ao clicar no overlay
document.addEventListener("click", (e) => {
    [
        ".pop-up-adicionar-medicamento",
        ".pop-up-editar-medicamento",
        ".pop-up-desativar-medicamento",
    ].forEach(sel => {
        const popup = document.querySelector(sel);
        if (popup && e.target === popup) fecharPopUp(sel);
    });
});

/* ═══════════════════════════════════════════════════════════
   ADICIONAR  (POST)
═══════════════════════════════════════════════════════════ */
async function adicionarMedicamento(event) {
    event.preventDefault();
    const form = event.target;
    const dados = _extrairDadosFormulario(form);
    if (!dados) return;

    const btnSubmit = form.querySelector('[type="submit"]');
    _setBtnLoading(btnSubmit, true, "A adicionar…");

    try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        // Alguns backends devolvem 201 sem body ou sem campo success
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.message || `Erro ${res.status} ao adicionar medicamento.`);
        }

        mostrarNotificacao({
            titulo: "Medicamento adicionado",
            mensagem: `${dados.nome} foi adicionado ao sistema.`,
            tipo: "sucesso",
        });

        fecharPopUp(".pop-up-adicionar-medicamento");
        await carregarMedicamentos();

    } catch (err) {
        console.error(err);
        mostrarNotificacao({ titulo: "Erro ao adicionar", mensagem: err.message, tipo: "erro" });
    } finally {
        _setBtnLoading(btnSubmit, false, "Adicionar");
    }
}

/* ═══════════════════════════════════════════════════════════
   EDITAR  (PUT)
═══════════════════════════════════════════════════════════ */
async function editarMedicamento(event) {
    event.preventDefault();
    const form = event.target;
    const id = parseInt(form.getAttribute("data-medicamento-id"), 10);
    if (!id) {
        mostrarNotificacao({ titulo: "Erro", mensagem: "ID do medicamento não encontrado.", tipo: "erro" });
        return;
    }

    const dados = _extrairDadosFormulario(form);
    if (!dados) return;

    const btnSubmit = form.querySelector('[type="submit"]');
    _setBtnLoading(btnSubmit, true, "A guardar…");

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.message || `Erro ${res.status} ao editar medicamento.`);
        }

        mostrarNotificacao({
            titulo: "Medicamento editado",
            mensagem: `${dados.nome} foi atualizado com sucesso.`,
            tipo: "sucesso",
        });

        fecharPopUp(".pop-up-editar-medicamento");
        await carregarMedicamentos();

    } catch (err) {
        console.error(err);
        mostrarNotificacao({ titulo: "Erro ao editar", mensagem: err.message, tipo: "erro" });
    } finally {
        _setBtnLoading(btnSubmit, false, "Editar");
    }
}

/* ═══════════════════════════════════════════════════════════
   DESATIVAR  (PATCH /deactivate)
═══════════════════════════════════════════════════════════ */
async function desativarMedicamento(event) {
    event.preventDefault();
    const form = event.target;
    const id = parseInt(form.getAttribute("data-medicamento-id"), 10);
    if (!id) {
        mostrarNotificacao({ titulo: "Erro", mensagem: "ID do medicamento não encontrado.", tipo: "erro" });
        return;
    }

    const btnSubmit = form.querySelector('[type="submit"]');
    _setBtnLoading(btnSubmit, true, "A desativar…");

    try {
        const res = await fetch(`${API_BASE}/${id}/deactivate`, { method: "PATCH" });

        // Verificar apenas res.ok — o backend pode não devolver json.success no PATCH
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.message || `Erro ${res.status} ao desativar medicamento.`);
        }

        const med = _todosMedicamentos.find(m => m.id === id);
        mostrarNotificacao({
            titulo: "Medicamento desativado",
            mensagem: `${med?.nome ?? "Medicamento"} foi desativado. Prescrições ativas sinalizadas.`,
            tipo: "aviso",
        });

        fecharPopUp(".pop-up-desativar-medicamento");
        await carregarMedicamentos();

    } catch (err) {
        console.error(err);
        mostrarNotificacao({ titulo: "Erro ao desativar", mensagem: err.message, tipo: "erro" });
    } finally {
        _setBtnLoading(btnSubmit, false, "Desativar");
    }
}

/* ═══════════════════════════════════════════════════════════
   ATIVAR  (PATCH /activate)
═══════════════════════════════════════════════════════════ */
async function ativarMedicamento(id) {
    const med = _todosMedicamentos.find(m => m.id === id);
    if (!med) return;

    if (!confirm(`Ativar o medicamento "${med.nome}"?`)) return;

    try {
        const res = await fetch(`${API_BASE}/${id}/activate`, { method: "PATCH" });

        // Verificar apenas res.ok — o backend pode não devolver json.success no PATCH
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.message || `Erro ${res.status} ao ativar medicamento.`);
        }

        mostrarNotificacao({
            titulo: "Medicamento ativado",
            mensagem: `${med.nome} está novamente disponível para prescrição.`,
            tipo: "sucesso",
        });

        await carregarMedicamentos();

    } catch (err) {
        console.error(err);
        mostrarNotificacao({ titulo: "Erro ao ativar", mensagem: err.message, tipo: "erro" });
    }
}

/* ═══════════════════════════════════════════════════════════
   UTILITÁRIOS — FORMULÁRIO
═══════════════════════════════════════════════════════════ */
function _extrairDadosFormulario(form) {
    const nome = form.querySelector("[name='nome']")?.value.trim();
    const principio = form.querySelector("[name='principio-ativo']")?.value.trim();
    const classe = form.querySelector("[name='classe-farmacologica']")?.value;
    const via = form.querySelector("[name='via']")?.value;
    const forma = form.querySelector("[name='forma']")?.value;
    const dosagemStr = form.querySelector("[name='dosagens']")?.value.trim();
    const doseMaxStr = form.querySelector("[name='dose-maxima']")?.value.trim();
    const altoRisco = form.querySelector("[name='alto-risco']")?.checked ?? false;

    if (!nome || !principio || !classe || !via || !forma || !dosagemStr || !doseMaxStr) {
        mostrarNotificacao({ titulo: "Campos em falta", mensagem: "Preenche todos os campos obrigatórios.", tipo: "aviso" });
        return null;
    }

    const dosagens = _parsearDosagens(dosagemStr);
    if (dosagens.length === 0) {
        mostrarNotificacao({ titulo: "Dosagens inválidas", mensagem: "Formato esperado: 200mg, 400mg", tipo: "aviso" });
        return null;
    }

    const doseMax = _parsearDose(doseMaxStr);
    if (!doseMax) {
        mostrarNotificacao({ titulo: "Dose máxima inválida", mensagem: "Formato esperado: 3000mg/dia", tipo: "aviso" });
        return null;
    }

    return {
        nome,
        principioAtivo: principio,
        formaFarmaceutica: forma,
        classeFarmacologica: classe,
        dosagens,
        dosagemMaxDiaria: doseMax,
        quantidade: 0,
        unidadeMedida: "MILIGRAMAS",
        viaAdministracao: via,
        altoRisco,
    };
}

function _parsearDosagens(str) {
    return str.split(/[,\/;]+/).map(s => _parsearDose(s.trim())).filter(Boolean);
}

function _parsearDose(str) {
    const match = str.replace(/\/dia/i, "").trim()
        .match(/^(\d+(?:[.,]\d+)?)\s*(mg|mcg|g|ml|ui|miligramas|microgramas|gramas|mililitros)?$/i);
    if (!match) return null;
    const dose = parseFloat(match[1].replace(",", "."));
    const uRaw = (match[2] || "mg").toLowerCase();
    return { dose, unidadeMedida: _mapearUnidade(uRaw) };
}

function _mapearUnidade(u) {
    const mapa = {
        mg: "MILIGRAMAS", miligramas: "MILIGRAMAS",
        mcg: "MICROGRAMAS", microgramas: "MICROGRAMAS",
        g: "GRAMAS", gramas: "GRAMAS",
        ml: "MILILITROS", mililitros: "MILILITROS",
        ui: "UNIDADES_INTERNACIONAIS",
    };
    return mapa[u] || "MILIGRAMAS";
}

/* ═══════════════════════════════════════════════════════════
   UTILITÁRIOS — DISPLAY
═══════════════════════════════════════════════════════════ */
function _formatarDosagens(dosagens) {
    if (!dosagens || dosagens.length === 0) return "—";
    return dosagens.map(d => `${_formatarNumero(d.dose)}${_abreviarUnidade(d.unidadeMedida)}`).join(" / ");
}

function _formatarNumero(n) {
    return parseFloat(n).toString();
}

function _abreviarUnidade(u) {
    const mapa = { MILIGRAMAS: "mg", MICROGRAMAS: "mcg", GRAMAS: "g", MILILITROS: "ml", UNIDADES_INTERNACIONAIS: "UI" };
    return mapa[u] || u;
}

function _traduzirForma(f) {
    const mapa = { SOLIDA: "Comp.", SEMI_SOLIDA: "Semi-sól.", LIQUIDA: "Líq.", GASOSA: "Gas." };
    return mapa[f] || f;
}

function _traduzirVia(v) {
    const mapa = {
        ORAL: "Oral", NASAL: "Nasal", OCULAR: "Ocular", AURICULAR: "Auricular",
        RETAL: "Retal", SUBLINGUAL: "Sublingual", CUTANEA: "Cutânea",
        SUBCUTANEA: "Subcut.", INTRAVENOSA: "IV", INTRAMUSCULAR: "IM", INTRADERMICA: "ID",
    };
    return mapa[v] || v;
}

function _traduzirClasse(c) {
    const mapa = {
        ANTIBIOTICO: "Antibiótico", SISTEMA_NERVOSO_CENTRAL: "SNC",
        APARELHO_CARDIOVASCULAR: "Cardiovascular", SISTEMA_RESPIRATORIO: "Respiratório",
        SISTEMA_ENDOCRINO: "Endócrino", ANALGESICO: "Analgésico",
    };
    return mapa[c] || c;
}

function _selecionarOption(select, valor) {
    if (!select) return;
    for (const opt of select.options) {
        if (opt.value === valor) { opt.selected = true; return; }
    }
}

function _setBtnLoading(btn, loading, texto) {
    if (!btn) return;
    btn.disabled = loading;
    btn.value = texto;
    btn.textContent = texto;
}

function _esc(str) {
    return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}