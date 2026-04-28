const params = new URLSearchParams(window.location.search);
const id = params.get('id');
let medicamentosCache = [];
let processId = null;

function diasDesde(dataStr) {
    const [data] = dataStr.split(":");
    const [dia, mes, ano] = data.split("/");
    const dataInput = new Date(ano, mes - 1, dia);
    const diffMs = new Date() - dataInput;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function irParaKardex() {
    window.location.href = "medicoKardexUtente?id=" + id;
}

function irParaHistorico() {
    window.location.href = "medicoListaUtentes";
}

async function carregarMedicamentos() {
    try {
        const token = localStorage.getItem("token");
        const resp = await fetch("http://localhost:8080/api/stock/medications", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const json = await resp.json();
        medicamentosCache = (json.data || []).filter(m => m.active);

        const selectMedicamento = document.getElementById("medicamento");
        selectMedicamento.innerHTML = '<option value="">Selecionar...</option>';

        medicamentosCache.forEach(med => {
            const option = document.createElement("option");
            option.value = med.id;
            option.textContent = med.nome;
            selectMedicamento.appendChild(option);
        });

    } catch (error) {
        mostrarNotificacao({
            titulo: "Erro",
            mensagem: "Erro ao carregar medicamentos: " + error.message,
            tipo: "erro"
        });
    }
}

function atualizarDosesEVia() {
    const selectMedicamento = document.getElementById("medicamento");
    const selectDose = document.getElementById("dose");
    const selectVia = document.getElementById("via");

    selectDose.innerHTML = '<option value="">Selecionar...</option>';
    selectVia.innerHTML = '<option value="">Selecionar...</option>';

    if (!selectMedicamento.value) {
        selectDose.disabled = true;
        selectVia.disabled = true;
        document.getElementById("verificacao-body").innerHTML = "Selecione um medicamento para verificação automática.";
        return;
    }

    selectDose.disabled = false;
    selectVia.disabled = false;

    const medicamento = medicamentosCache.find(m => m.id == selectMedicamento.value);
    if (!medicamento) return;

    medicamento.dosagens.forEach(dosagem => {
        const option = document.createElement("option");
        option.value = dosagem.id;
        option.textContent = `${dosagem.dose} ${dosagem.unidadeMedida}`;
        selectDose.appendChild(option);
    });

    const viaOption = document.createElement("option");
    viaOption.value = medicamento.viaAdministracao;
    viaOption.textContent = medicamento.viaAdministracao;
    viaOption.selected = true;
    selectVia.appendChild(viaOption);

    atualizarVerificacao(medicamento);
}

function atualizarVerificacao(medicamento) {
    const verificacaoBody = document.getElementById("verificacao-body");
    const alergiasContainer = document.getElementById("alergias");
    const alergiasText = alergiasContainer.innerText || "";
    let html = "";

    if (alergiasText.includes(medicamento.nome)) {
        html += `<div class="warn-alergia">⚠️ ALERTA: O paciente é alérgico a ${medicamento.nome}</div>`;
    } else {
        html += `<div class="ok-alergia">✓ Sem alergias incompatíveis registadas</div>`;
    }

    if (medicamento.altoRisco) {
        html += `<div class="warn-dose">⚠️ ALERTA: Este medicamento é considerado de alto risco</div>`;
    }

    if (medicamento.dosagemMaxDiaria) {
        html += `<div class="warn-dose">Dose máxima diária: ${medicamento.dosagemMaxDiaria.dose} ${medicamento.dosagemMaxDiaria.unidadeMedida}</div>`;
    }

    verificacaoBody.innerHTML = html;
}

async function carregarDados(id) {
    try {
        if (!id) return;

        const token = localStorage.getItem("token");
        const resp = await fetch(`http://localhost:8080/api/patients/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const json = await resp.json();
        const dados = json.data.dados;
        processId = dados.processo.id;

        document.getElementById("nome-utente").innerHTML = dados.nome;
        document.getElementById("processo").innerHTML = dados.processo.id;
        document.getElementById("cama").innerHTML = dados.processo.cama ? dados.processo.cama.id : "Sem cama";
        document.getElementById("diagnostico").innerHTML = dados.processo.diagnosticoPrincipal;
        document.getElementById("dias-internado").innerHTML = diasDesde(dados.processo.dataEntrada);

        const alergiasContainer = document.getElementById("alergias");
        if (!dados.alergias || dados.alergias.length === 0) {
            alergiasContainer.innerHTML = "<p>Sem alergias registadas</p>";
        } else {
            alergiasContainer.innerHTML = dados.alergias
                .map(a => `<div class="alerta">${a.nome}</div>`)
                .join("");
        }

        carregarPrescricoes(dados);

    } catch (error) {
        mostrarNotificacao({
            titulo: "Erro",
            mensagem: "Erro ao carregar dados do paciente: " + error.message,
            tipo: "erro"
        });
    }
}

function carregarPrescricoes(dados) {
    const medicacaoAtivaContainer = document.getElementById("medicacao-ativa");

    try {
        const prescricoes = dados.processo.prescricoes;

        if (!prescricoes || prescricoes.length === 0) {
            medicacaoAtivaContainer.innerHTML = "<p>Sem prescrições ativas</p>";
            return;
        }

        // Usar loose equality para compatibilidade com possíveis variações de tipo
        const prescricoesAtivas = prescricoes.filter(p => p.ativa == true || p.ativa === true || p["ativa"] === true);

        if (prescricoesAtivas.length === 0) {
            medicacaoAtivaContainer.innerHTML = "<p>Sem prescrições ativas</p>";
            return;
        }

        medicacaoAtivaContainer.innerHTML = prescricoesAtivas
            .map(p => `
                <div class="med-badge">
                    <div class="med-badge-nome">${p.medicamento.nome}</div>
                    <div class="med-badge-info">${p.dose.dose} ${p.dose.unidadeMedida}</div>
                </div>
            `)
            .join("");

    } catch (error) {
        medicacaoAtivaContainer.innerHTML = "<p>Erro ao carregar prescrições</p>";
    }
}

function configurarDatas() {
    const hoje = new Date().toISOString().split("T")[0];
    const dataInicio = document.getElementById("data-inicio");
    const dataFim = document.getElementById("data-fim");

    dataInicio.min = hoje;

    dataInicio.addEventListener("change", () => {
        if (dataInicio.value) {
            const inicio = new Date(dataInicio.value);
            inicio.setDate(inicio.getDate() + 1);
            dataFim.min = inicio.toISOString().split("T")[0];

            if (dataFim.value) {
                const diffDias = (new Date(dataFim.value) - new Date(dataInicio.value)) / (1000 * 60 * 60 * 24);
                if (diffDias < 1) dataFim.value = "";
            }
        }
    });
}

function formataData(data) {
    if (!data) return "";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function mapearFrequencia(frequenciaStr) {
    const mapeamento = {
        "1x/dia": { frequencia: 1, periodo: "DIARIO", intervaloMinHoras: 24 },
        "2x/dia (8h-20h)": { frequencia: 2, periodo: "DIARIO", intervaloMinHoras: 12 },
        "3x/dia (8h-14h-20h)": { frequencia: 3, periodo: "DIARIO", intervaloMinHoras: 8 },
        "4x/dia": { frequencia: 4, periodo: "DIARIO", intervaloMinHoras: 6 },
        "6/6h": { frequencia: 4, periodo: "DIARIO", intervaloMinHoras: 6 },
        "8/8h": { frequencia: 3, periodo: "DIARIO", intervaloMinHoras: 8 },
        "12/12h": { frequencia: 2, periodo: "DIARIO", intervaloMinHoras: 12 },
        "SOS": { frequencia: 1, periodo: "SOS", intervaloMinHoras: 0 }
    };
    return mapeamento[frequenciaStr] || null;
}

function validarFormulario() {
    const campos = {
        medicamento: document.getElementById("medicamento").value,
        dose: document.getElementById("dose").value,
        via: document.getElementById("via").value,
        frequencia: document.getElementById("frequencia").value,
        dataInicio: document.getElementById("data-inicio").value,
        dataFim: document.getElementById("data-fim").value,
        intervaloToma: document.getElementById("intervalo-toma").value.trim(),
        indicacaoClin: document.getElementById("indicacao-clinica").value.trim()
    };

    for (const valor of Object.values(campos)) {
        if (!valor) {
            mostrarNotificacao({
                titulo: "Validação",
                mensagem: "Todos os campos obrigatórios devem ser preenchidos",
                tipo: "aviso"
            });
            return false;
        }
    }

    if (!validarDatas()) return false;

    return campos;
}

function validarDatas() {
    const dataInicio = document.getElementById("data-inicio").value;
    const dataFim = document.getElementById("data-fim").value;

    if (!dataInicio || !dataFim) return false;

    const diffDias = (new Date(dataFim) - new Date(dataInicio)) / (1000 * 60 * 60 * 24);

    if (diffDias < 1) {
        mostrarNotificacao({
            titulo: "Erro",
            mensagem: "A data de fim deve ser pelo menos 1 dia após a data de início.",
            tipo: "erro"
        });
        return false;
    }

    return true;
}

async function enviarPrescricao() {
    const dados = validarFormulario();
    if (!dados) return;

    try {
        const frequencia = mapearFrequencia(dados.frequencia);
        if (!frequencia) {
            mostrarNotificacao({ titulo: "Erro", mensagem: "Frequência inválida", tipo: "erro" });
            return;
        }

        const body = {
            idMedicamento: parseInt(dados.medicamento),
            sos: document.getElementById("sos").checked,
            motivo: dados.indicacaoClin,
            dataInicio: formataData(dados.dataInicio),
            dataFim: formataData(dados.dataFim),
            idDose: parseInt(dados.dose),
            altoRisco: document.getElementById("alto-risco").checked,
            frequencia
        };

        const resp = await fetch(`http://localhost:8080/api/processes/${processId}/prescriptions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) throw new Error("Erro ao enviar prescrição");

        mostrarNotificacao({
            titulo: "Sucesso",
            mensagem: "Prescrição confirmada com sucesso!",
            tipo: "sucesso"
        });

        setTimeout(() => {
            ["medicamento", "dose", "via", "frequencia", "data-inicio", "data-fim", "intervalo-toma", "indicacao-clinica"]
                .forEach(id => { document.getElementById(id).value = ""; });
            document.getElementById("sos").checked = false;
            document.getElementById("alto-risco").checked = false;
            carregarDados(id);
        }, 2000);

    } catch (error) {
        mostrarNotificacao({
            titulo: "Erro",
            mensagem: "Erro ao enviar prescrição: " + error.message,
            tipo: "erro"
        });
    }
}

function inicializar() {
    const medicamento = document.getElementById("medicamento");
    const dataInicio = document.getElementById("data-inicio");
    const btnConfirmar = document.querySelector(".btn-confirmar");

    if (!medicamento || !dataInicio || !btnConfirmar) {
        setTimeout(inicializar, 500);
        return;
    }

    btnConfirmar.addEventListener("click", enviarPrescricao);
    medicamento.addEventListener("change", atualizarDosesEVia);

    configurarDatas();
    carregarMedicamentos();
    carregarDados(id);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}