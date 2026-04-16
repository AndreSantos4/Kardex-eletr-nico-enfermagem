const API_BASE = "http://localhost:8080/api/";

function updateClock() {
    const el = document.getElementById("current-datetime");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleString("pt-PT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const FLAG_LABELS = {
    RISCO_FUGA: "Risco Fuga",
    RISCO_AGRESSIVIDADE: "Risco Agressividade",
    RISCO_QUEDA: "Risco Queda",
    RISCO_AUTOMUTILACAO: "Risco Automutilação",
};

function renderFlags(flags) {
    if (!flags || flags.length === 0) return "—";
    return flags
        .map(f => `<span class="flag-badge">${FLAG_LABELS[f] ?? f}</span>`)
        .join("");
}

function lastSVHour(sinaisVitais) {
    if (!sinaisVitais || sinaisVitais.length === 0) return "—";

    const last = sinaisVitais[sinaisVitais.length - 1];
    const raw = last.data ?? "";
    const timePart = raw.split(":").slice(1, 3).join(":");
    return timePart || "—";
}

function renderTabelaUtentes(utentes) {
    const tbody = document.getElementById("lista-utentes-tbody");
    if (!tbody) return;

    if (!utentes || utentes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:#888;">
            Sem utentes internados de momento.
        </td></tr>`;
        document.getElementById("utentes-atribuidos").textContent = "0";
        return;
    }

    document.getElementById("utentes-atribuidos").textContent = utentes.length;

    tbody.innerHTML = utentes.map(u => {
        const p = u.processo;
        const numeroProcesso = p?.id ?? "—";
        const nome = u.nome ?? "—";
        const cama = p?.cama?.id ?? "—";
        const diagnostico = p?.diagnosticoPrincipal ?? "—";
        const svHora = lastSVHour(p?.sinaisVitais);

        const proxMedicacao = "—"; // TODO: endpoint de medicações

        const flagsHtml = renderFlags(u.flags);
        const temAlergias = u.alergias && u.alergias.length > 0;
        const alertasExtra = temAlergias
            ? `<span class="flag-badge">Alergias</span>`
            : "";
        const alertasHtml = (flagsHtml === "—" && !temAlergias) ? "—" : flagsHtml + alertasExtra;

        return `
        <tr>
            <td>${numeroProcesso}</td>
            <td>${nome}</td>
            <td>${cama}</td>
            <td>${diagnostico}</td>
            <td>${proxMedicacao}</td>
            <td>${svHora}</td>
            <td>${alertasHtml}</td>
            <td><button class="ver-mais" onclick="verUtente(${u.id})">VER MAIS</button></td>
        </tr>`;
    }).join("");
}

function renderAlertas(utentes) {
    const container = document.getElementById("alertas-container");
    if (!container) return;

    const alertas = [];

    utentes.forEach(u => {
        (u.flags ?? []).forEach(flag => {
            alertas.push({
                texto: `${FLAG_LABELS[flag] ?? flag} — ${u.nome} (Cama: ${u.processo?.cama?.id ?? "—"})`,
            });
        });

        if (u.alergias && u.alergias.length > 0) {
            const nomes = u.alergias.map(a => a.nome).join(", ");
            alertas.push({
                texto: `Alergias conhecidas: ${nomes} — ${u.nome} (Cama: ${u.processo?.cama?.id ?? "—"})`,
            });
        }

        // TODO: alertas de medicação atrasada (endpoint pendente)
    });

    if (alertas.length === 0) {
        container.innerHTML = `<p class="alertas-empty">Sem alertas ativos.</p>`;
        return;
    }

    container.innerHTML = alertas
        .map(a => `<div class="alerta-item">⚠ ${a.texto}</div>`)
        .join("");
}

function renderStatusBar(utentes) {
    document.getElementById("sinais-vitais-registar").textContent = "—"; // TODO
    document.getElementById("medicacoes-pendentes").textContent = "—"; // TODO
    document.getElementById("administracao-atrasada").textContent = "—"; // TODO
    document.getElementById("pendencias-turno-anterior").textContent = "—"; // TODO
}

function renderTopbar() {
    const nomeEnf = sessionStorage.getItem("nomeEnfermeiro") ?? "—";
    const turno = sessionStorage.getItem("turno") ?? "—";

    document.getElementById("nome-enf").textContent = nomeEnf;
    document.getElementById("turno").textContent = turno;
    document.getElementById("label-turno").textContent = turno !== "—" ? `(${turno})` : "(—)";
}

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}patients?f=HOSPITALIZED`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (!json.success) {
            throw new Error(json.message ?? "Erro desconhecido da API");
        }

        const utentes = json.data ?? [];

        const internados = utentes.filter(u => u.processo !== null);

        renderTabelaUtentes(internados);
        renderStatusBar(internados);
        renderAlertas(internados);

    } catch (err) {
        console.error("[Dashboard] Erro ao carregar utentes:", err);

        const tbody = document.getElementById("lista-utentes-tbody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:#b91c1c;">
                Erro ao carregar dados: ${err.message}
            </td></tr>`;
        }

        const alertasContainer = document.getElementById("alertas-container");
        if (alertasContainer) {
            alertasContainer.innerHTML = `<p class="alertas-empty" style="color:#b91c1c;">Erro ao carregar alertas.</p>`;
        }
    }
}

function verUtente(utenteId) {
    window.location.href = `enfermeiroKardexUtente?id=${utenteId}`;
}

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 60_000);

    renderTopbar();
    loadDashboard();
});