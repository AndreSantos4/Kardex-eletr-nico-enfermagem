const API_BASE = "http://localhost:8080/api";
const utenteId = new URLSearchParams(window.location.search).get("id");
let processoId = null;

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

        preencherHeader(utente, proc);
        preencherAlergias(utente?.alergias ?? []);
        preencherUtenteInfo(utente, proc);

        if (!processoId) {
            document.getElementById("prescricoes-body").innerHTML =
                `<p class="text-bg-dark text-[13px] p-3 italic">Utente sem processo activo.</p>`;
            return;
        }

        await renderPrescricoes();
        renderHistorico(proc?.prescricoes ?? []);
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

        body.innerHTML = prescricoes.map(p => {
            const nome = p.medicamento?.nome ?? "Medicamento";
            const dose = p.dose ? `${p.dose.dose}${p.dose.unidadeMedida ? " " + p.dose.unidadeMedida : ""}` : "—";
            const via = p.medicamento?.viaAdministracao ?? "—";
            const freq = formatFrequencia(p.frequencia);
            const medico = p.medico?.dados?.nome ?? p.medico?.nome ?? "—";
            const sos = p.sos === true;
            const horariosPrev = p.horariosPrevistos ?? [];
            const altoRisco = (p.altoRisco === true) || (p.medicamento?.altoRisco === true);

            const badgeSOS = sos ? `<span class="ml-2 inline-block bg-[#c0392b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">SOS</span>` : "";
            const badgeRisco = altoRisco ? `<span class="ml-2 inline-block bg-alertas text-white text-[10px] font-bold px-1.5 py-0.5 rounded">ALTO RISCO</span>` : "";

            return `
            <div class="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#e5edf3] last:border-0">
                <div class="flex-1 min-w-0">
                    <div class="text-bg-dark font-bold text-[13.5px]">${esc(nome)} ${esc(dose)}${badgeSOS}${badgeRisco}</div>
                    <div class="text-muted text-[12px] mt-0.5">Via ${esc(via)} · ${esc(freq)}${medico !== "—" ? " · " + esc(medico) : ""}</div>
                </div>
                <button class="bg-primary text-white border-2 border-primary text-[12px] font-bold tracking-wide px-3 py-1.5 cursor-pointer rounded-md hover:bg-white hover:text-primary transition-colors whitespace-nowrap"
                    onclick='abrirAdministrar(${p.id}, ${JSON.stringify(nome)}, ${JSON.stringify(dose)}, ${JSON.stringify(via)}, ${altoRisco}, ${JSON.stringify(horariosPrev)})'>
                    ADMINISTRAR
                </button>
            </div>`;
        }).join("");
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
        tbody.innerHTML = `<tr><td colspan="6" class="!text-center !p-4 italic text-muted">Sem administrações registadas hoje.</td></tr>`;
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

// Abrir o popup já existente (usa a função partilhada se ela existir).
function abrirAdministrar(prescricaoId, nomeMed, dose, via, altoRisco, horariosPrev) {
    if (typeof abrirPopUpAdministrarMedicacao === "function") {
        abrirPopUpAdministrarMedicacao(prescricaoId, nomeMed, dose, via, altoRisco, horariosPrev);
        return;
    }
    // Fallback simples — apenas mostrar o overlay com a info
    const overlay = document.querySelector(".pop-up-administrar-medicacao");
    if (!overlay) {
        notificar("Erro", "Popup de administração não disponível.", "erro");
        return;
    }
    overlay.style.display = "flex";
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
