const API_BASE = "http://localhost:8080/api/stock/medications";

var _todosMedicamentos      = [];
var _medicamentosFiltrados  = [];
var _termoPesquisa          = "";
var _paginaAtual            = 0;
var _itemsPorPagina         = 10;
var _debounceTimer          = null;

var OPCOES_ITEMS_POR_PAGINA = [5, 10, 20, 30, 50];
var STOCK_CRITICO_MINIMO    = 50;

document.addEventListener("DOMContentLoaded", function() {
    _atualizarRelogio();
    setInterval(_atualizarRelogio, 1000);

    _carregarPopups().then(function() {
        _ligarForms();
        _ligarPesquisa();
        carregarMedicamentos();
    });
});

function _atualizarRelogio() {
    var el = document.getElementById("current-datetime");
    if (!el) return;
    var agora = new Date();
    el.textContent = agora.toLocaleString("pt-PT", {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
}

async function _carregarPopups() {
    var popups = [
        "../../pages/admin/popups/popupAdicionarMedicamento.html",
        "../../pages/admin/popups/popupDesativarMedicamento.html",
        "../../pages/admin/popups/popupEditarMedicamento.html",
    ];

    for (var i = 0; i < popups.length; i++) {
        var url = popups[i];
        try {
            var res = await fetch(url);
            if (!res.ok) { console.warn("[popups] Nao foi possivel carregar: " + url); continue; }
            var html = await res.text();
            var div  = document.createElement("div");
            div.innerHTML = html;
            div.querySelectorAll(
                ".pop-up-adicionar-medicamento, .pop-up-desativar-medicamento, .pop-up-editar-medicamento"
            ).forEach(function(p) { p.style.display = "none"; });
            document.body.appendChild(div);
        } catch (e) {
            console.warn("[popups] Erro ao carregar " + url + ":", e);
        }
    }
}

function _ligarForms() {
    var formAdicionar = document.querySelector(".pop-up-adicionar-medicamento form");
    if (formAdicionar) {
        formAdicionar.removeAttribute("onsubmit");
        formAdicionar.addEventListener("submit", adicionarMedicamento);
    } else {
        console.warn("[forms] form de adicionar nao encontrado.");
    }

    var formEditar = document.querySelector(".pop-up-editar-medicamento form");
    if (formEditar) {
        formEditar.removeAttribute("onsubmit");
        formEditar.addEventListener("submit", guardarEdicaoMedicamento);
    } else {
        console.warn("[forms] form de editar nao encontrado.");
    }

    var formDesativar = document.querySelector("#form-desativar-medicamento");
    if (formDesativar) {
        formDesativar.removeAttribute("onsubmit");
        formDesativar.addEventListener("submit", desativarMedicamento);
    } else {
        console.warn("[forms] form de desativar nao encontrado.");
    }
}

document.addEventListener("click", function(e) {
    [".pop-up-adicionar-medicamento", ".pop-up-desativar-medicamento", ".pop-up-editar-medicamento"].forEach(function(sel) {
        var popup = document.querySelector(sel);
        if (popup && e.target === popup) fecharPopUp(sel);
    });
});

function abrirpopup() {
    var popup = document.querySelector(".pop-up-adicionar-medicamento");
    if (!popup) { console.error("Popup adicionar nao encontrado no DOM."); return; }
    var form = popup.querySelector("form");
    if (form) form.reset();
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function abrirPopupDesativar(id) {
    var med = null;
    for (var i = 0; i < _todosMedicamentos.length; i++) {
        if (_todosMedicamentos[i].id === id) { med = _todosMedicamentos[i]; break; }
    }
    if (!med) return;

    var popup = document.querySelector(".pop-up-desativar-medicamento");
    if (!popup) { console.error("Popup desativar nao encontrado no DOM."); return; }

    var spanNome = popup.querySelector("#desativar-med-nome");
    if (spanNome) spanNome.textContent =
        med.nome + " — " + _traduzirClasse(med.classeFarmacologica) + " — " + _formatarDosagens(med.dosagens);

    var inputMotivo = popup.querySelector("#desativar-med-motivo");
    if (inputMotivo) inputMotivo.value = "";

    var form = popup.querySelector("#form-desativar-medicamento");
    if (form) form.setAttribute("data-medicamento-id", id);

    var spanUtentes = popup.querySelector("#desativar-med-num-utentes");
    if (spanUtentes) spanUtentes.textContent = "— UTENTES";
    var pMedicos = popup.querySelector("#desativar-med-medicos");
    if (pMedicos) pMedicos.textContent = "Informacao de prescricoes nao disponivel.";

    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function fecharPopUp(seletor) {
    var popup = document.querySelector(seletor);
    if (popup) {
        popup.style.display = "none";
        document.body.style.overflow = "";
    }
}

async function carregarMedicamentos() {
    try {
        var res  = await fetch(API_BASE, {
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        var json = await res.json();

        if (!res.ok || !json.success) throw new Error(json.message || "Erro ao obter medicamentos.");

        _todosMedicamentos     = _ordenarPorNome(json.data || []);
        _medicamentosFiltrados = _todosMedicamentos.slice();
        _paginaAtual           = 0;

        _renderizarStockCritico(_todosMedicamentos);
        _atualizarContador();
        _renderizarTabela();
        _renderizarPaginacao();

    } catch (err) {
        console.error(err);
        mostrarNotificacao({
            titulo:   "Erro ao carregar",
            mensagem: err.message || "Nao foi possivel contactar o servidor.",
            tipo:     "erro",
        });
    }
}

function _ordenarPorNome(lista) {
    return lista.slice().sort(function(a, b) {
        return (a.nome || "").localeCompare(b.nome || "", "pt", { sensitivity: "base" });
    });
}

function _parsearData(strData) {
    if (!strData) return null;
    var partes = strData.split("/");
    return new Date(partes[2] + "-" + partes[1] + "-" + partes[0]);
}

function _calcularQuantidadeValida(lotes) {
    if (!lotes || !lotes.length) return 0;
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var total = 0;
    for (var i = 0; i < lotes.length; i++) {
        var validade = _parsearData(lotes[i].validade);
        if (!validade || validade >= hoje) {
            total += lotes[i].quantidade || 0;
        }
    }
    return total;
}

function _renderizarStockCritico(medicamentos) {
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    var criticos = [];
    for (var i = 0; i < medicamentos.length; i++) {
        if (_calcularQuantidadeValida(medicamentos[i].lotes) <= STOCK_CRITICO_MINIMO) {
            criticos.push(medicamentos[i]);
        }
    }

    var secao = document.getElementById("secao-stock-critico-admin");
    if (!secao) {
        secao = document.createElement("div");
        secao.id        = "secao-stock-critico-admin";
        secao.className = "page-header";
        var barra = document.querySelector(".lista-medicamentos-bar");
        if (barra) barra.parentNode.insertBefore(secao, barra);
    }

    if (!criticos.length) {
        secao.style.display = "none";
        return;
    }

    secao.style.display = "";

    var itensHtml = "";
    for (var j = 0; j < criticos.length; j++) {
        var med = criticos[j];
        var qtd = _calcularQuantidadeValida(med.lotes);
        var lotes = med.lotes || [];
        var temExpirados = false;
        for (var k = 0; k < lotes.length; k++) {
            var v = _parsearData(lotes[k].validade);
            if (v && v < hoje) { temExpirados = true; break; }
        }
        var aviso = temExpirados
            ? '<span class="aviso-lotes-expirados"> lotes expirados excluidos</span>'
            : "";
        itensHtml += '<div class="stock-critico-item"><strong>' + _esc(med.nome) + '</strong> — ' + qtd + ' unidades validas em stock' + aviso + '</div>';
    }

    secao.innerHTML =
        '<div class="page-header-left">' +
            '<h4>Stock Critico — Pedido a farmacia necessario</h4>' +
            '<div id="lista-stock-critico-admin">' + itensHtml + '</div>' +
        '</div>';
}

function _renderizarTabela() {
    var tbody = document.querySelector(".lista-medicamentos tbody");
    if (!tbody) return;

    var inicio = _paginaAtual * _itemsPorPagina;
    var pagina = _medicamentosFiltrados.slice(inicio, inicio + _itemsPorPagina);

    if (pagina.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;">Nenhum medicamento encontrado.</td></tr>';
        return;
    }

    var html = "";
    for (var i = 0; i < pagina.length; i++) {
        html += _criarLinhaTabela(pagina[i]);
    }
    tbody.innerHTML = html;
}

function _criarLinhaTabela(m) {
    var dosagens  = _formatarDosagens(m.dosagens);
    var forma     = _traduzirForma(m.formaFarmaceutica);
    var via       = _traduzirVia(m.viaAdministracao);
    var classe    = _traduzirClasse(m.classeFarmacologica);
    var altoRisco = m.altoRisco ? "Sim" : "—";
    var estado    = m.active ? "Ativo" : "Inativo";
    var estadoCls = m.active ? "estado-ativo" : "estado-inativo";

    var btnToggle = m.active
        ? '<button class="btn-desativar" onclick="abrirPopupDesativar(' + m.id + ')">Desativar</button>'
        : '<button class="btn-ativar" onclick="ativarMedicamento(' + m.id + ')">Ativar</button>';

    return '<tr data-id="' + m.id + '">' +
        '<td>' + _esc(m.nome) + '</td>' +
        '<td>' + _esc(m.principioAtivo) + '</td>' +
        '<td>' + forma + '</td>' +
        '<td>' + via + '</td>' +
        '<td>' + classe + '</td>' +
        '<td>' + dosagens + '</td>' +
        '<td>' + altoRisco + '</td>' +
        '<td><span class="badge ' + estadoCls + '">' + estado + '</span></td>' +
        '<td><button onclick="editarMedicamento(' + m.id + ')">Editar</button> ' + btnToggle + '</td>' +
        '</tr>';
}

function _renderizarPaginacao() {
    var velha = document.querySelector(".paginacao");
    if (velha) velha.parentNode.removeChild(velha);

    var totalPaginas = Math.max(1, Math.ceil(_medicamentosFiltrados.length / _itemsPorPagina));
    var div = document.createElement("div");
    div.className = "paginacao flex items-center justify-between gap-3 px-4 py-2.5 border-t border-primary/30 bg-white";

    var seletor = document.createElement("div");
    seletor.className = "paginacao-tamanho flex items-center gap-2 text-primary text-xs font-semibold";
    var label  = document.createElement("label");
    label.htmlFor     = "items-por-pagina";
    label.textContent = "Medicamentos por pagina:";
    var select = document.createElement("select");
    select.id = "items-por-pagina";
    select.className = "bg-white border border-primary rounded text-primary text-xs font-semibold px-2 py-1 cursor-pointer outline-none";
    for (var i = 0; i < OPCOES_ITEMS_POR_PAGINA.length; i++) {
        var n = OPCOES_ITEMS_POR_PAGINA[i];
        var opt = document.createElement("option");
        opt.value       = String(n);
        opt.textContent = String(n);
        if (n === _itemsPorPagina) opt.selected = true;
        select.appendChild(opt);
    }
    select.addEventListener("change", function(e) {
        _itemsPorPagina = parseInt(e.target.value, 10);
        _paginaAtual    = 0;
        _renderizarTabela();
        _renderizarPaginacao();
    });
    seletor.appendChild(label);
    seletor.appendChild(select);
    div.appendChild(seletor);

    var paginas = document.createElement("div");
    paginas.className = "paginacao-paginas flex items-center gap-1.5";
    for (var j = 0; j < totalPaginas; j++) {
        (function(idx) {
            var btn = document.createElement("button");
            btn.textContent = idx + 1;
            btn.className   = "btn-pagina" + (idx === _paginaAtual ? " ativo" : "");
            btn.onclick     = function() { _paginaAtual = idx; _renderizarTabela(); _renderizarPaginacao(); };
            paginas.appendChild(btn);
        })(j);
    }
    div.appendChild(paginas);

    var tabela = document.querySelector(".lista-medicamentos-table");
    if (tabela && tabela.parentNode) {
        tabela.parentNode.insertBefore(div, tabela.nextSibling);
    }
}

function _atualizarContador() {
    var el = document.querySelector(".page-header-left p");
    if (el) el.textContent = _medicamentosFiltrados.length + " medicamentos";
}

function _ligarPesquisa() {
    var input = document.querySelector(".search-input-wrap input");
    if (!input) return;
    input.addEventListener("input", function(e) { _onPesquisaInput(e.target.value); });
}

function _onPesquisaInput(valor) {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(function() {
        _termoPesquisa = valor.trim().toLowerCase();
        if (_termoPesquisa) {
            _medicamentosFiltrados = [];
            for (var i = 0; i < _todosMedicamentos.length; i++) {
                var m = _todosMedicamentos[i];
                if ((m.nome || "").toLowerCase().indexOf(_termoPesquisa) !== -1 ||
                    (m.principioAtivo || "").toLowerCase().indexOf(_termoPesquisa) !== -1) {
                    _medicamentosFiltrados.push(m);
                }
            }
        } else {
            _medicamentosFiltrados = _todosMedicamentos.slice();
        }
        _paginaAtual = 0;
        _atualizarContador();
        _renderizarTabela();
        _renderizarPaginacao();
    }, 300);
}

async function adicionarMedicamento(event) {
    event.preventDefault();
    var form  = event.target;
    var dados = _extrairDadosFormulario(form);
    if (!dados) return;

    var btnSubmit = form.querySelector('[type="submit"]');
    _setBtnLoading(btnSubmit, true, "A adicionar...");

    try {
        var res = await fetch(API_BASE, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(dados),
        });

        if (!res.ok) {
            var json = await res.json().catch(function() { return {}; });
            throw new Error(json.message || "Erro " + res.status + " ao adicionar medicamento.");
        }

        mostrarNotificacao({
            titulo:   "Medicamento adicionado",
            mensagem: dados.nome + " foi adicionado ao sistema.",
            tipo:     "sucesso",
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

async function desativarMedicamento(event) {
    event.preventDefault();
    var form = event.target;
    var id   = parseInt(form.getAttribute("data-medicamento-id"), 10);
    if (!id) {
        mostrarNotificacao({ titulo: "Erro", mensagem: "ID do medicamento nao encontrado.", tipo: "erro" });
        return;
    }

    var btnSubmit = form.querySelector('[type="submit"]');
    _setBtnLoading(btnSubmit, true, "A desativar...");

    try {
        var res = await fetch(API_BASE + "/" + id + "/deactivate", {
            method:  "PATCH",
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });

        if (!res.ok) {
            var json = await res.json().catch(function() { return {}; });
            throw new Error(json.message || "Erro " + res.status + " ao desativar medicamento.");
        }

        var med = null;
        for (var i = 0; i < _todosMedicamentos.length; i++) {
            if (_todosMedicamentos[i].id === id) { med = _todosMedicamentos[i]; break; }
        }

        mostrarNotificacao({
            titulo:   "Medicamento desativado",
            mensagem: (med ? med.nome : "Medicamento") + " foi desativado. Prescricoes ativas sinalizadas.",
            tipo:     "aviso",
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

async function ativarMedicamento(id) {
    var med = null;
    for (var i = 0; i < _todosMedicamentos.length; i++) {
        if (_todosMedicamentos[i].id === id) { med = _todosMedicamentos[i]; break; }
    }
    if (!med) return;

    try {
        var res = await fetch(API_BASE + "/" + id + "/activate", {
            method:  "PATCH",
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });

        if (!res.ok) {
            var json = await res.json().catch(function() { return {}; });
            throw new Error(json.message || "Erro " + res.status + " ao ativar medicamento.");
        }

        mostrarNotificacao({
            titulo:   "Medicamento ativado",
            mensagem: med.nome + " esta novamente disponivel para prescricao.",
            tipo:     "sucesso",
        });

        await carregarMedicamentos();

    } catch (err) {
        console.error(err);
        mostrarNotificacao({ titulo: "Erro ao ativar", mensagem: err.message, tipo: "erro" });
    }
}

function editarMedicamento(id) {
    var med = null;
    for (var i = 0; i < _todosMedicamentos.length; i++) {
        if (_todosMedicamentos[i].id === id) { med = _todosMedicamentos[i]; break; }
    }
    if (!med) return;

    var popup = document.querySelector(".pop-up-editar-medicamento");
    if (!popup) { console.error("Popup editar nao encontrado no DOM."); return; }

    var form = popup.querySelector("#form-editar-medicamento");
    if (form) form.setAttribute("data-medicamento-id", id);

    var dosagensTexto = (med.dosagens || []).map(function(d) {
        return d.dose + _abreviarUnidade(d.unidadeMedida);
    }).join(", ");

    var doseMaxTexto = "";
    if (med.dosagemMaxDiaria) {
        doseMaxTexto = med.dosagemMaxDiaria.dose + _abreviarUnidade(med.dosagemMaxDiaria.unidadeMedida) + "/dia";
    }

    var set = function(sel, val) { var el = popup.querySelector(sel); if (el) el.value = val || ""; };
    set("[name='nome']", med.nome);
    set("[name='principio-ativo']", med.principioAtivo);
    set("[name='classe-farmacologica']", med.classeFarmacologica);
    set("[name='via']", med.viaAdministracao);
    set("[name='forma']", med.formaFarmaceutica);
    set("[name='dosagens']", dosagensTexto);
    set("[name='dose-maxima']", doseMaxTexto);
    var altoRiscoEl = popup.querySelector("[name='alto-risco']");
    if (altoRiscoEl) altoRiscoEl.checked = !!med.altoRisco;

    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
}

async function guardarEdicaoMedicamento(event) {
    event.preventDefault();
    var form = event.target;
    var id   = parseInt(form.getAttribute("data-medicamento-id"), 10);
    if (!id) {
        mostrarNotificacao({ titulo: "Erro", mensagem: "ID do medicamento nao encontrado.", tipo: "erro" });
        return;
    }

    var dados = _extrairDadosFormulario(form);
    if (!dados) return;

    var btnSubmit = form.querySelector('[type="submit"]');
    _setBtnLoading(btnSubmit, true, "A guardar...");

    try {
        var res = await fetch(API_BASE + "/" + id, {
            method:  "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization:  "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify(dados),
        });

        if (!res.ok) {
            var json = await res.json().catch(function() { return {}; });
            throw new Error(json.message || "Erro " + res.status + " ao editar medicamento.");
        }

        mostrarNotificacao({ titulo: "Medicamento editado", mensagem: dados.nome + " foi atualizado.", tipo: "sucesso" });
        fecharPopUp(".pop-up-editar-medicamento");
        await carregarMedicamentos();

    } catch (err) {
        console.error(err);
        mostrarNotificacao({ titulo: "Erro ao editar", mensagem: err.message, tipo: "erro" });
    } finally {
        _setBtnLoading(btnSubmit, false, "Guardar");
    }
}

function _extrairDadosFormulario(form) {
    var nomeEl       = form.querySelector("[name='nome']");
    var principioEl  = form.querySelector("[name='principio-ativo']");
    var classeEl     = form.querySelector("[name='classe-farmacologica']");
    var viaEl        = form.querySelector("[name='via']");
    var formaEl      = form.querySelector("[name='forma']");
    var dosagemEl    = form.querySelector("[name='dosagens']");
    var doseMaxEl    = form.querySelector("[name='dose-maxima']");
    var altoRiscoEl  = form.querySelector("[name='alto-risco']");

    var nome       = nomeEl      ? nomeEl.value.trim()      : "";
    var principio  = principioEl ? principioEl.value.trim() : "";
    var classe     = classeEl    ? classeEl.value           : "";
    var via        = viaEl       ? viaEl.value              : "";
    var forma      = formaEl     ? formaEl.value            : "";
    var dosagemStr = dosagemEl   ? dosagemEl.value.trim()   : "";
    var doseMaxStr = doseMaxEl   ? doseMaxEl.value.trim()   : "";
    var altoRisco  = altoRiscoEl ? altoRiscoEl.checked      : false;

    if (!nome || !principio || !classe || !via || !forma || !dosagemStr || !doseMaxStr) {
        mostrarNotificacao({ titulo: "Campos em falta", mensagem: "Preenche todos os campos obrigatorios.", tipo: "aviso" });
        return null;
    }

    var dosagens = _parsearDosagens(dosagemStr);
    if (dosagens.length === 0) {
        mostrarNotificacao({ titulo: "Dosagens invalidas", mensagem: "Formato esperado: 200mg, 400mg", tipo: "aviso" });
        return null;
    }

    var doseMax = _parsearDose(doseMaxStr);
    if (!doseMax) {
        mostrarNotificacao({ titulo: "Dose maxima invalida", mensagem: "Formato esperado: 3000mg/dia", tipo: "aviso" });
        return null;
    }

    return {
        nome: nome,
        principioAtivo: principio,
        formaFarmaceutica: forma,
        classeFarmacologica: classe,
        dosagens: dosagens,
        dosagemMaxDiaria: doseMax,
        unidadeMedida: doseMax.unidadeMedida,
        viaAdministracao: via,
        altoRisco: altoRisco,
    };
}

function _parsearDosagens(str) {
    var partes = str.split(/[,\/;]+/);
    var resultado = [];
    for (var i = 0; i < partes.length; i++) {
        var d = _parsearDose(partes[i].trim());
        if (d) resultado.push(d);
    }
    return resultado;
}

function _parsearDose(str) {
    var limpo = str.replace(/\/dia/i, "").trim();
    var match = limpo.match(/^(\d+(?:[.,]\d+)?)\s*(mg|mcg|g|ml|ui|miligramas|microgramas|gramas|mililitros)?$/i);
    if (!match) return null;
    var dose = parseFloat(match[1].replace(",", "."));
    var uRaw = (match[2] || "mg").toLowerCase();
    return { dose: dose, unidadeMedida: _mapearUnidade(uRaw) };
}

function _mapearUnidade(u) {
    var mapa = {
        mg: "MILIGRAMAS",    miligramas:  "MILIGRAMAS",
        mcg: "MICROGRAMAS",  microgramas: "MICROGRAMAS",
        g: "GRAMAS",         gramas:      "GRAMAS",
        ml: "MILILITROS",    mililitros:  "MILILITROS",
        ui: "UNIDADES_INTERNACIONAIS",
    };
    return mapa[u] || "MILIGRAMAS";
}

function _formatarDosagens(dosagens) {
    if (!dosagens || dosagens.length === 0) return "—";
    var resultado = [];
    for (var i = 0; i < dosagens.length; i++) {
        resultado.push(parseFloat(dosagens[i].dose) + _abreviarUnidade(dosagens[i].unidadeMedida));
    }
    return resultado.join(" / ");
}

function _abreviarUnidade(u) {
    var mapa = { MILIGRAMAS: "mg", MICROGRAMAS: "mcg", GRAMAS: "g",
                 MILILITROS: "ml", UNIDADES_INTERNACIONAIS: "UI" };
    return mapa[u] || u;
}

function _traduzirForma(f) {
    var mapa = { SOLIDA: "Comp.", SEMI_SOLIDA: "Semi-sol.", LIQUIDA: "Liq.", GASOSA: "Gas." };
    return mapa[f] || f || "—";
}

function _traduzirVia(v) {
    var mapa = {
        ORAL: "Oral", NASAL: "Nasal", OCULAR: "Ocular", AURICULAR: "Auricular",
        RETAL: "Retal", SUBLINGUAL: "Sublingual", CUTANEA: "Cutanea",
        SUBCUTANEA: "Subcut.", INTRAVENOSA: "IV", INTRAMUSCULAR: "IM", INTRADERMICA: "ID",
    };
    return mapa[v] || v || "—";
}

function _traduzirClasse(c) {
    var mapa = {
        ANTIBIOTICO: "Antibiotico", SISTEMA_NERVOSO_CENTRAL: "SNC",
        APARELHO_CARDIOVASCULAR: "Cardiovascular", SISTEMA_RESPIRATORIO: "Respiratorio",
        SISTEMA_ENDOCRINO: "Endocrino", ANALGESICO: "Analgesico",
    };
    return mapa[c] || c || "—";
}

function _setBtnLoading(btn, loading, texto) {
    if (!btn) return;
    btn.disabled    = loading;
    btn.value       = texto;
    btn.textContent = texto;
}

function _esc(str) {
    return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}