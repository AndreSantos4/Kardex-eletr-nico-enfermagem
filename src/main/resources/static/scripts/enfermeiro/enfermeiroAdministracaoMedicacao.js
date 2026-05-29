const API_BASE = "http://localhost:8080/api";
const utenteId = new URLSearchParams(window.location.search).get("id");
let processoId = null;
let nomeUtente = "";
let _prescricoesCache = [];

document.addEventListener("DOMContentLoaded", async () => {
    if (!utenteId) {
        notificar("Utente em falta", "ID do utente não fornecido na URL.", "erro");
        return;
    }
    await carregarPopups();
    await carregarUtente();
});

// ─── Popups ───────────────────────────────────────────────────────────────────

async function carregarPopups() {
    const container = document.getElementById("popup-container");
    if (!container) return;
    const popups = [
        "../../pages/enfermeiro/popups/popupAdministrarMedicacao.html",
        "../../pages/enfermeiro/popups/popuRegistarAdminstracaoSOS.html",
        "../../pages/enfermeiro/popups/popupRegistarContencaoQuimica.html",
    ];
    for (const url of popups) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const html = await res.text();
            const div = document.createElement("div");
            div.innerHTML = html;
            container.appendChild(div);
        } catch (err) {
            console.warn("[Admin] Erro ao carregar popup:", url, err);
        }
    }
}

// ─── Dados do utente ──────────────────────────────────────────────────────────

async function carregarUtente() {
    try {
        const res = await fetch(`${API_BASE}/patients/${utenteId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const utente = json.data?.dados ?? json.data;
        const proc = utente?.processo;
        processoId = proc?.id;
        nomeUtente = utente?.nome ?? "";

        preencherHeader(utente, proc);
        preencherAlergias(utente?.alergias ?? []);
        preencherUtenteInfo(utente, proc);

        if (!processoId) {
            document.getElementById("prescricoes-body").innerHTML =
                `<p class="text-bg-dark text-[13px] p-3 italic">Utente sem processo activo.</p>`;
            return;
        }

        await renderPrescricoes();
        // O histórico é renderizado dentro de renderPrescricoes() com os dados atualizados
        // que já incluem as administracoes (PrescricaoDTO.administracoes).
    } catch (err) {
        console.error("[Admin] Erro ao carregar utente:", err);
        notificar("Erro", "Não foi possível carregar os dados do utente.", "erro");
    }
}

function preencherHeader(utente, proc) {
    const nome = utente?.nome ?? "—";
    const procId = proc?.id ?? "—";
    const cama = proc?.cama?.id ?? proc?.cama ?? "—";
    document.getElementById("header-utente-info").textContent =
        `${nome} · Proc. ${procId} · Cama ${cama}`;
}

function preencherAlergias(alergias) {
    const box = document.getElementById("alergias-box");
    const list = document.getElementById("alergias-list");
    if (!alergias || alergias.length === 0) {
        box.style.display = "none";
        return;
    }
    box.style.display = "";
    list.innerHTML = alergias.map(a => {
        const nome = typeof a === "string" ? a : (a.nome ?? "—");
        const reaccao = typeof a === "object" ? (a.reaccao ?? a.descricao ?? "") : "";
        return `<div><strong class="text-alertas">${esc(nome)}</strong>${reaccao ? " — " + esc(reaccao) : ""}</div>`;
    }).join("");
}

function preencherUtenteInfo(utente, proc) {
    const nome = utente?.nome ?? "—";
    const cama = proc?.cama?.id ?? proc?.cama ?? "—";
    const diag = proc?.diagnosticoPrincipal ?? "—";
    const alergiasResumo = (utente?.alergias ?? [])
        .map(a => typeof a === "string" ? a : a.nome)
        .filter(Boolean)
        .join(", ") || "—";

    document.getElementById("utente-info-body").innerHTML = `
        <p class="m-0"><strong>Nome:</strong> ${esc(nome)}</p>
        <p class="m-0"><strong>Cama:</strong> ${esc(String(cama))}</p>
        <p class="m-0"><strong>Diagnóstico:</strong> ${esc(diag)}</p>
        <p class="m-0"><strong>Alergias:</strong> ${esc(alergiasResumo)}</p>
    `;
}

// ─── Prescrições ativas ───────────────────────────────────────────────────────

async function renderPrescricoes() {
    const body = document.getElementById("prescricoes-body");
    try {
        const res = await fetch(`${API_BASE}/processes/${processoId}/prescriptions?s=ATIVA`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const prescricoes = json.data ?? [];
        if (prescricoes.length === 0) {
            body.innerHTML = `<p class="text-bg-dark text-[13px] p-3 italic">Sem prescrições ativas.</p>`;
            return;
        }

        // Guarda em memória para o histórico
        _prescricoesCache = prescricoes;

        body.innerHTML = prescricoes.map(p => {
            const nome = p.medicamento?.nome ?? "Medicamento";
            const dose = p.dose ? `${p.dose.dose}${p.dose.unidadeMedida ? " " + p.dose.unidadeMedida : ""}` : "—";
            const via = p.medicamento?.viaAdministracao ?? "—";
            const freq = formatFrequencia(p.frequencia);
            const medico = p.medico?.dados?.nome ?? p.medico?.nome ?? "—";
            const sos = p.sos === true;
            const horariosPrev = p.horariosPrevistos ?? [];
            const altoRisco = (p.altoRisco === true) || (p.medicamento?.altoRisco === true);

            const limite = _verificarLimitesAdministracao(p);
            const podeAdministrar = limite.permitido;
            const motivoBloqueio = limite.motivo;

            const badgeSOS = sos ? `<span class="ml-2 inline-block bg-[#c0392b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">SOS</span>` : "";
            const badgeRisco = altoRisco ? `<span class="ml-2 inline-block bg-alertas text-white text-[10px] font-bold px-1.5 py-0.5 rounded">ALTO RISCO</span>` : "";
            const linhaLimite = motivoBloqueio
                ? `<div class="text-alertas text-[11.5px] font-semibold mt-0.5">${esc(motivoBloqueio)}</div>`
                : "";

            const btnClass = podeAdministrar
                ? "bg-primary text-white border-2 border-primary cursor-pointer hover:bg-white hover:text-primary"
                : "bg-bg-dark/30 text-white/70 border-2 border-bg-dark/30 cursor-not-allowed";
            const btnAttrs = podeAdministrar
                ? `onclick='abrirAdministrar(${p.id}, ${JSON.stringify(nome)}, ${JSON.stringify(dose)}, ${JSON.stringify(via)}, ${altoRisco}, ${JSON.stringify(horariosPrev)})'`
                : `disabled title=${JSON.stringify(motivoBloqueio || "")}`;

            return `
            <div class="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#e5edf3] last:border-0">
                <div class="flex-1 min-w-0">
                    <div class="text-bg-dark font-bold text-[13.5px]">${esc(nome)} ${esc(dose)}${badgeSOS}${badgeRisco}</div>
                    <div class="text-bg-dark/65 text-[12px] mt-0.5">Via ${esc(via)} · ${esc(freq)}${medico !== "—" ? " · " + esc(medico) : ""}</div>
                    ${linhaLimite}
                </div>
                <button class="${btnClass} text-[12px] font-bold tracking-wide px-3 py-1.5 rounded-md transition-colors whitespace-nowrap" ${btnAttrs}>
                    ADMINISTRAR
                </button>
            </div>`;
        }).join("");

        // Renderiza histórico com os dados que acabámos de receber
        renderHistorico(prescricoes);
    } catch (err) {
        console.error("[Admin] Erro ao carregar prescrições:", err);
        body.innerHTML = `<p class="text-alertas text-[13px] p-3">Erro ao carregar prescrições.</p>`;
    }
}

// ─── Histórico (best-effort com o que vier no patient) ────────────────────────

function renderHistorico(prescricoes) {
    const tbody = document.getElementById("historico-tbody");
    if (!tbody) return;

    // O endpoint /patients/{id} pode trazer prescricoes com administrações.
    // Filtramos administrações cujo dia seja hoje.
    const hoje = new Date();
    const hojeStr = hoje.toISOString().slice(0, 10); // yyyy-MM-dd

    const linhas = [];
    (prescricoes ?? []).forEach(p => {
        const nomeMed = p.medicamento?.nome ?? "—";
        const via = p.medicamento?.viaAdministracao ?? "—";
        (p.administracoes ?? []).forEach(a => {
            const dataReal = parseBackendDate(a.data ?? a.data_administrado);
            if (!dataReal) return;
            const isoData = dataReal.toISOString().slice(0, 10);
            if (isoData !== hojeStr) return;
            const enfNome = a.funcionario?.dados?.nome ?? a.funcionario?.nome ?? "—";
            const estado = a.administrado === false ? "Não administrada"
                : (p.sos ? "SOS" : "Administrada");
            const hReal = `${String(dataReal.getHours()).padStart(2,"0")}:${String(dataReal.getMinutes()).padStart(2,"0")}`;
            linhas.push(`<tr>
                <td>—</td>
                <td>${hReal}</td>
                <td>${esc(nomeMed)}</td>
                <td>${esc(via)}</td>
                <td>${esc(enfNome)}</td>
                <td>${esc(estado)}</td>
            </tr>`);
        });
    });

    if (linhas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="!text-center !p-4 italic text-bg-dark/65">Sem administrações registadas hoje.</td></tr>`;
        return;
    }
    tbody.innerHTML = linhas.join("");
}

// ─── Acções ───────────────────────────────────────────────────────────────────

function irParaKardex() {
    window.location.href = `enfermeiroKardexUtente?id=${utenteId}`;
}
function irParaPlano() {
    window.location.href = `enfermeiroPlanoCuidados?id=${utenteId}`;
}

let prescricaoSelecionadaId = null;
let _popupAltoRisco = false;

function abrirAdministrar(prescricaoId, nomeMed, dose, via, altoRisco, horariosPrev) {
    const overlay = document.querySelector(".pop-up-administrar-medicacao");
    if (!overlay) {
        notificar("Erro", "Popup de administração não disponível.", "erro");
        return;
    }

    prescricaoSelecionadaId = prescricaoId ?? null;
    _popupAltoRisco = !!altoRisco;

    // Preencher os 5 certos
    const setText = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor != null && valor !== "" ? String(valor) : "—";
    };
    setText("nome-utenet", _primeiroNome(nomeUtente));
    setText("medicamento", nomeMed);
    setText("dose", dose);
    setText("via", via);

    const now = new Date();
    setText("hora-de-toma", now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }));

    const dataHora = document.getElementById("data-hora");
    if (dataHora) dataHora.value = _agoraISOLocal();
    const obs = document.getElementById("observacoes");
    if (obs) obs.value = "";

    const cbRecusa = document.getElementById("recusa-medicacao");
    if (cbRecusa) cbRecusa.checked = false;

    // Atraso (se houver horários previstos)
    const warningBox = document.getElementById("warning-box");
    const warningText = document.getElementById("warning-text");
    const atrasoMin = _calcularAtrasoMinutos(horariosPrev ?? []);
    if (warningBox && warningText) {
        if (atrasoMin > 0) {
            warningText.textContent = `Atraso de ${atrasoMin} min relativamente ao horário previsto.`;
            warningBox.style.display = "flex";
        } else {
            warningBox.style.display = "none";
        }
    }

    // Bloco de Alto Risco
    const secaoAltoRisco = document.getElementById("alto-risco-verificacao");
    const cbConfirmar = document.getElementById("confirmar-alto-risco");
    if (secaoAltoRisco) secaoAltoRisco.style.display = altoRisco ? "" : "none";
    if (cbConfirmar) cbConfirmar.checked = false;

    if (typeof atualizarBotaoRegistar === "function") atualizarBotaoRegistar();

    overlay.style.display = "flex";
}

function _primeiroNome(nomeCompleto) {
    if (!nomeCompleto) return "";
    return String(nomeCompleto).trim().split(/\s+/)[0];
}

function _agoraISOLocal() {
    const d = new Date();
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
}

function _calcularAtrasoMinutos(horariosPrevistos) {
    if (!horariosPrevistos?.length) return 0;
    const now = new Date();
    const agoraMin = now.getHours() * 60 + now.getMinutes();
    return horariosPrevistos.reduce((max, h) => {
        const [hh, mm] = String(h).split(":").map(Number);
        if (Number.isNaN(hh)) return max;
        const prevMin = hh * 60 + (mm || 0);
        const diff = prevMin <= agoraMin ? agoraMin - prevMin : 0;
        return Math.max(max, diff);
    }, 0);
}

function atualizarBotaoRegistar() {
    const btn = document.getElementById("btn-registar");
    if (!btn) return;
    if (_popupAltoRisco) {
        const cb = document.getElementById("confirmar-alto-risco");
        btn.disabled = !cb?.checked;
        btn.style.opacity = btn.disabled ? "0.55" : "";
        btn.style.cursor = btn.disabled ? "not-allowed" : "pointer";
    } else {
        btn.disabled = false;
        btn.style.opacity = "";
        btn.style.cursor = "pointer";
    }
}

function fecharPopUp(seletorPopup) {
    const popup = document.querySelector(seletorPopup);
    if (popup) popup.style.display = "none";
}

function _formatarDataHoraBackend(datetimeLocal) {
    if (!datetimeLocal) return "";
    const [datePart, timePart] = String(datetimeLocal).split("T");
    if (!datePart || !timePart) return "";
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}:${timePart}:00`;
}

async function registarMedicacao() {
    if (!prescricaoSelecionadaId) {
        _notificarErro("Erro", "Prescrição não identificada.");
        return;
    }

    const dataHoraRaw = document.getElementById("data-hora")?.value;
    if (!dataHoraRaw) {
        _notificarAviso("Formulário incompleto", "Data e hora não especificados.");
        return;
    }

    const observacoes = document.getElementById("observacoes")?.value.trim() ?? "";
    const recusa = document.getElementById("recusa-medicacao")?.checked ?? false;

    const body = {
        foi_administrado: !recusa,
        observacoes: observacoes
            || (recusa ? "Recusa/impossibilidade de administração" : "Administrado sem intercorrências"),
        data: _formatarDataHoraBackend(dataHoraRaw),
    };

    try {
        const resp = await fetch(
            `${API_BASE}/processes/prescriptions/${prescricaoSelecionadaId}/administrations`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(body),
            },
        );

        if (!resp.ok) throw new Error((await resp.text()) || "Erro ao registar administração");

        const json = await resp.json().catch(() => ({}));

        // Quando a soma das doses nas últimas 24h excede a dose máxima diária,
        // o backend devolve um MaxDoseAlertDTO em vez de gravar a administração.
        if (json.success && json.data && json.data.maxDose != null && json.data.dose != null) {
            const med = json.data.medicamento?.nome ?? "medicação";
            const unidade = json.data.medicamento?.unidadeMedida ?? "";
            _notificarAviso(
                "Administração bloqueada — dose máxima",
                `${med}: a soma de doses nas últimas 24h excede o máximo diário (${json.data.maxDose} ${unidade}). Requer validação clínica.`,
            );
            return;
        }

        fecharPopUp(".pop-up-administrar-medicacao");
        _notificarSucesso(
            "Administração",
            recusa ? "Recusa registada com sucesso." : "Medicação administrada com sucesso.",
        );

        // Recarregar dados para atualizar histórico e prescrições
        await carregarUtente();
    } catch (err) {
        let mensagem = err.message;
        try { mensagem = JSON.parse(err.message).error ?? mensagem; } catch (_) {}
        _notificarErro("Erro", mensagem || "Erro ao registar administração.");
    }
}

function _notificarSucesso(titulo, mensagem) {
    if (typeof mostrarNotificacao === "function") mostrarNotificacao({ titulo, mensagem, tipo: "sucesso" });
    else notificar(titulo, mensagem, "sucesso");
}
function _notificarErro(titulo, mensagem) {
    if (typeof mostrarNotificacao === "function") mostrarNotificacao({ titulo, mensagem, tipo: "erro" });
    else notificar(titulo, mensagem, "erro");
}
function _notificarAviso(titulo, mensagem) {
    if (typeof mostrarNotificacao === "function") mostrarNotificacao({ titulo, mensagem, tipo: "aviso" });
    else notificar(titulo, mensagem, "aviso");
}

function abrirPopUpAdministrarSOS() {
    const el = document.querySelector(".popup-sos-overlay");
    if (el) el.style.display = "flex";
}

function abrirPopUpContencaoQuimica() {
    const el = document.querySelector(".popup-contencao-overlay");
    if (el) el.style.display = "flex";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verifica se ainda é permitido administrar esta prescrição agora.
 * Devolve { permitido: bool, motivo: string }.
 * Regras:
 *   - intervaloMinHoras: a última administração tem de estar >= N horas no passado
 *   - DIARIO/frequencia X: máximo X administrações por dia
 */
function _verificarLimitesAdministracao(p) {
    const administracoes = (p.administracoes ?? []).filter(a => a.administrado !== false);
    if (administracoes.length === 0) return { permitido: true, motivo: "" };

    const ordenadas = administracoes
        .map(a => ({ ...a, _data: parseBackendDate(a.data) }))
        .filter(a => a._data)
        .sort((a, b) => b._data - a._data);

    if (ordenadas.length === 0) return { permitido: true, motivo: "" };

    const ultima = ordenadas[0];
    const agora = new Date();

    // 1) Intervalo mínimo entre administrações
    const intervaloMin = p.frequencia?.intervaloMinHoras ?? 0;
    if (intervaloMin > 0) {
        const proximaPermitida = new Date(ultima._data.getTime() + intervaloMin * 3_600_000);
        if (agora < proximaPermitida) {
            const minutosFalta = Math.ceil((proximaPermitida - agora) / 60000);
            const horas = Math.floor(minutosFalta / 60);
            const mins = minutosFalta % 60;
            const tempo = horas > 0 ? `${horas}h${mins > 0 ? ` ${mins}min` : ""}` : `${mins}min`;
            return {
                permitido: false,
                motivo: `Próxima administração permitida em ${tempo} (intervalo mín. ${intervaloMin}h)`,
            };
        }
    }

    // 2) Frequência diária: contar administrações de hoje
    const periodo = String(p.frequencia?.periodo ?? "").toUpperCase();
    const maxPorPeriodo = p.frequencia?.frequencia ?? 0;
    if ((periodo === "DIARIO" || periodo === "DIARIA") && maxPorPeriodo > 0) {
        const hojeAno = agora.getFullYear();
        const hojeMes = agora.getMonth();
        const hojeDia = agora.getDate();
        const hoje = ordenadas.filter(a =>
            a._data.getFullYear() === hojeAno &&
            a._data.getMonth() === hojeMes &&
            a._data.getDate() === hojeDia
        );
        if (hoje.length >= maxPorPeriodo) {
            return {
                permitido: false,
                motivo: `Limite diário atingido (${hoje.length}/${maxPorPeriodo} hoje)`,
            };
        }
    }

    return { permitido: true, motivo: "" };
}

function formatFrequencia(f) {
    if (!f) return "—";
    const periodo = (f.periodo ?? "").toUpperCase();
    if (periodo === "CONTINUO" || periodo === "CONTINUA") return "Contínua";
    if (periodo === "SOS") return "SOS";
    if (periodo === "DIARIO" || periodo === "DIARIA") return `${f.frequencia ?? 1}x/dia`;
    if (periodo === "SEMANAL") return `${f.frequencia ?? 1}x/semana`;
    if (f.intervaloMinHoras) return `De ${f.intervaloMinHoras} em ${f.intervaloMinHoras} horas`;
    return `${f.frequencia ?? "?"}/${periodo.toLowerCase() || "?"}`;
}

/**
 * Aceita "dd/MM/yyyy:HH:mm:ss" ou ISO "yyyy-MM-ddTHH:mm:ss".
 */
function parseBackendDate(raw) {
    if (!raw) return null;
    const m = /^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})$/.exec(raw);
    if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}`);
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
}

function esc(s) {
    if (s == null) return "";
    return String(s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function notificar(titulo, mensagem, tipo = "info") {
    if (typeof mostrarNotificacao === "function") {
        mostrarNotificacao({ titulo, mensagem, tipo });
    } else {
        console.log(`[${tipo}] ${titulo}: ${mensagem}`);
    }
}
