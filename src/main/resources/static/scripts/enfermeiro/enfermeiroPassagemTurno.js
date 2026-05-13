const API_BASE = "http://localhost:8080/api/";

const TURNO_LABELS = {
    MANHA: "Manhã",
    TARDE: "Tarde",
    NOITE: "Noite",
};

const TURNO_HORAS = {
    MANHA: "08:00-16:00",
    TARDE: "14:00-22:00",
    NOITE: "22:00-08:00",
};

const TURNO_PROXIMO = {
    MANHA: "TARDE",
    TARDE: "NOITE",
    NOITE: "MANHA",
};

function getTipoTurno() {
    const turno = sessionStorage.getItem("turno") ?? "";
    if (turno.toLowerCase().includes("manhã") || turno.toLowerCase().includes("manha")) return "MANHA";
    if (turno.toLowerCase().includes("tarde")) return "TARDE";
    if (turno.toLowerCase().includes("noite")) return "NOITE";
    return "TARDE";
}

function renderTopbar() {
    const nomeEnf = sessionStorage.getItem("nomeEnfermeiro") ?? "—";
    const turno = sessionStorage.getItem("turno") ?? "—";
    const servico = sessionStorage.getItem("servico") ?? "Serviço";

    document.getElementById("nome-enf").textContent = nomeEnf;
    document.getElementById("turno").textContent = turno;
    const servicoEl = document.getElementById("servico-nome");
    if (servicoEl) servicoEl.textContent = servico;
}

function renderPageHeader() {
    const tipoAtual = getTipoTurno();
    const tipoProximo = TURNO_PROXIMO[tipoAtual];
    const labelAtual = TURNO_LABELS[tipoAtual] ?? tipoAtual;
    const labelProximo = TURNO_LABELS[tipoProximo] ?? tipoProximo;

    const tituloEl = document.getElementById("turno-titulo");
    if (tituloEl) {
        tituloEl.textContent = `Passagem de Turno - ${labelAtual} → ${labelProximo}`;
    }

    const dataEl = document.getElementById("turno-data");
    if (dataEl) {
        const agora = new Date();
        const dataFormatada = agora.toLocaleDateString("pt-PT", {
            day: "2-digit", month: "2-digit", year: "numeric",
        });
        const horas = TURNO_HORAS[tipoAtual] ?? "—";
        dataEl.textContent = `${dataFormatada} - Turno ${labelAtual} ${horas}`;
    }

    const proximoHeader = document.getElementById("proximo-turno-header");
    if (proximoHeader) {
        const horasProximo = TURNO_HORAS[tipoProximo] ?? "—";
        proximoHeader.textContent = `Turno ${labelProximo} (${horasProximo})`;
    }
}

function svRegistadoHoje(sinaisVitais) {
    if (!sinaisVitais || sinaisVitais.length === 0) return false;
    const hoje = new Date();
    const diaHoje = String(hoje.getDate()).padStart(2, "0");
    const mesHoje = String(hoje.getMonth() + 1).padStart(2, "0");
    const anoHoje = hoje.getFullYear();
    const prefixoHoje = `${diaHoje}/${mesHoje}/${anoHoje}`;
    return sinaisVitais.some(sv => (sv.data ?? "").startsWith(prefixoHoje));
}

function contarMedicacoes(prescricoes) {
    const ativas = (prescricoes ?? []).filter(p => p.estado === "ATIVA");
    let total = 0;
    let naoAdm = 0;
    ativas.forEach(p => {
        const adm = p.administracoes ?? [];
        total++;
        const hoje = new Date().toLocaleDateString("pt-PT", {
            day: "2-digit", month: "2-digit", year: "numeric",
        }).replace(/\//g, "/");
        const admHoje = adm.filter(a => (a.data ?? "").startsWith(hoje.split("/").reverse().join("/")));
        if (admHoje.length === 0) naoAdm++;
    });
    return { total, naoAdm };
}

function renderResumoTurno(utentes) {
    const el = document.getElementById("resumo-turno");
    if (!el) return;

    const totalUtentes = utentes.length;
    let totalMed = 0;
    let totalNaoAdm = 0;
    let svRegistados = 0;
    let totalSOS = 0;

    utentes.forEach(u => {
        const p = u.processo;
        if (!p) return;

        const { total, naoAdm } = contarMedicacoes(p.prescricoes);
        totalMed += total;
        totalNaoAdm += naoAdm;

        if (svRegistadoHoje(p.sinaisVitais)) svRegistados++;

        // TODO: contar administrações SOS quando endpoint disponível
    });

    const admOk = totalMed - totalNaoAdm;

    el.innerHTML = `
        <p>${totalUtentes} utente${totalUtentes !== 1 ? "s" : ""} - Turno</p>
        <p>${admOk} adm. - ${totalNaoAdm} não adm.</p>
        <p>${svRegistados} sinais vitais registados</p>
        <p id="resumo-sos">— incidentes - ${totalSOS} SOS adm.</p>
    `;
}

function renderPendenciasProximoTurno(utentes) {
    const el = document.getElementById("pendencias-proximo-turno");
    if (!el) return;

    const pendencias = [];

    utentes.forEach(u => {
        const p = u.processo;
        if (!p) return;

        const apelido = (u.nome ?? "—").split(" ").pop();

        (p.prescricoes ?? []).filter(pr => pr.estado === "ATIVA").forEach(pr => {
            const adm = pr.administracoes ?? [];
            const hoje = new Date().toLocaleDateString("pt-PT", {
                day: "2-digit", month: "2-digit", year: "numeric",
            }).replace(/\//g, "/");
            const admHoje = adm.filter(a => (a.data ?? "").startsWith(hoje.split("/").reverse().join("/")));
            if (admHoje.length === 0) {
                const nomeMed = pr.medicamento?.nome ?? "Medicamento";
                pendencias.push(`${nomeMed} — ${apelido}`);
            }
        });

        // TODO: pendências de exames e cateteres quando endpoints disponíveis
    });

    if (pendencias.length === 0) {
        el.innerHTML = `<p style="color:#888;">Sem pendências.</p>`;
        return;
    }

    el.innerHTML = pendencias
        .map(txt => `<p>${txt}</p>`)
        .join("");
}

function renderEstadoUtentes(utentes) {
    const tbody = document.getElementById("estado-utentes-tbody");
    if (!tbody) return;

    if (!utentes || utentes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#888;">
            Sem utentes internados de momento.
        </td></tr>`;
        return;
    }

    tbody.innerHTML = utentes.map(u => {
        const p = u.processo;
        const nome = u.nome ?? "—";
        const cama = p?.cama?.id ?? "—";

        const { total, naoAdm } = contarMedicacoes(p?.prescricoes);
        const admOk = total - naoAdm;
        let medTexto;
        if (total === 0) {
            medTexto = "Sem medicação";
        } else if (naoAdm === 0) {
            medTexto = "Nenhum em Falta";
        } else {
            medTexto = `${naoAdm} não adm.`;
        }

        const svFeito = svRegistadoHoje(p?.sinaisVitais);
        const svTexto = svFeito ? "Realizado" : "Não Realizado";
        const svCor = svFeito ? "" : "color:#b91c1c;";

        // TODO: ocorrências e pendências quando endpoint disponível
        const ocorrencias = "—";
        const pendencias = "—";

        return `
        <tr>
            <td>${nome}</td>
            <td>${cama}</td>
            <td>${medTexto}</td>
            <td style="${svCor}">${svTexto}</td>
            <td>${ocorrencias}</td>
            <td>${pendencias}</td>
        </tr>`;
    }).join("");
}

async function loadProximoTurno() {
    const el = document.getElementById("enfermeiros-proximo-turno");
    if (!el) return;

    // TODO: endpoint de turnos para obter enfermeiros do próximo turno
    el.innerHTML = `<p class="summary-empty">— (endpoint pendente)</p>`;
}

async function loadPassagemTurno() {
    try {
        const res = await fetch(`${API_BASE}patients?f=HOSPITALIZED`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json.success) throw new Error(json.message ?? "Erro desconhecido da API");

        const utentes = (json.data ?? []).filter(u => u.processo !== null);

        renderResumoTurno(utentes);
        renderPendenciasProximoTurno(utentes);
        renderEstadoUtentes(utentes);

    } catch (err) {
        console.error("[PassagemTurno] Erro ao carregar utentes:", err);

        const tbody = document.getElementById("estado-utentes-tbody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#b91c1c;">
                Erro ao carregar dados: ${err.message}
            </td></tr>`;
        }

        ["resumo-turno", "pendencias-proximo-turno"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<p style="color:#b91c1c;font-size:12px;">Erro ao carregar.</p>`;
        });
    }
}

async function finalizarPassagem() {
    const observacoes = document.getElementById("observacoes-textarea")?.value?.trim() ?? "";

    const tipoAtual = getTipoTurno();
    const body = {
        turno: tipoAtual,
        observacoes,
        data: new Date().toLocaleDateString("pt-PT", {
            day: "2-digit", month: "2-digit", year: "numeric",
        }),
    };

    try {
        // TODO: endpoint de passagem de turno quando disponível
        // const res = await fetch(`${API_BASE}passagem-turno`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `Bearer ${localStorage.getItem("token")}`,
        //     },
        //     body: JSON.stringify(body),
        // });
        // if (!res.ok) throw new Error(`HTTP ${res.status}`);

        mostrarNotificacao({
            titulo: "Passagem de Turno",
            mensagem: "Passagem de turno finalizada e enviada para validação.",
            tipo: "sucesso",
        });
    } catch (err) {
        console.error("[PassagemTurno] Erro ao finalizar:", err);
        mostrarNotificacao({
            titulo: "Erro",
            mensagem: `Erro ao finalizar passagem de turno: ${err.message}`,
            tipo: "erro",
        });
    }
}

function guardarPendencia() {
    const observacoes = document.getElementById("observacoes-textarea")?.value?.trim() ?? "";

    if (!observacoes) {
        mostrarNotificacao({
            titulo: "Atenção",
            mensagem: "Escreva as observações antes de guardar como pendência.",
            tipo: "aviso",
        });
        return;
    }

    // TODO: endpoint para guardar pendência quando disponível
    mostrarNotificacao({
        titulo: "Pendência",
        mensagem: "Passagem de turno guardada como pendência.",
        tipo: "sucesso",
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderTopbar();
    renderPageHeader();
    loadPassagemTurno();
    loadProximoTurno();

    document.getElementById("btn-finalizar-header")?.addEventListener("click", finalizarPassagem);
    document.getElementById("btn-finalizar")?.addEventListener("click", finalizarPassagem);
    document.getElementById("btn-pendencia")?.addEventListener("click", guardarPendencia);
});
