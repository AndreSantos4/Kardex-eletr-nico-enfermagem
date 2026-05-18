const API_BASE = "http://localhost:8080/api/";
const tipoMap = {
    SINAL_VITAL: "Sinal Vital",
    MEDICACAO: "Medicação",
    ADMINISTRACAO_ATRASADA: "Administração Atrasada",
    PROCEDIMENTO: "Procedimento",
    OBSERVACAO: "Observação",
    AVALIACAO: "Avaliação",
};

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

function renderStatusBar(utentes, pendencias = []) {

    const counts = {};

    pendencias.forEach(p => {
        const tipo = p.tipo ?? "DESCONHECIDO";

        counts[tipo] = (counts[tipo] || 0) + 1;
    });

    document.getElementById("sinais-vitais-registar").textContent =
        counts["SINAL_VITAL"] || 0;

    document.getElementById("medicacoes-pendentes").textContent =
        counts["MEDICACAO"] || 0;

    document.getElementById("administracao-atrasada").textContent =
        counts["ADMINISTRACAO_ATRASADA"] || 0;

    document.getElementById("pendencias-turno-anterior").textContent =
        pendencias.length;

    console.log("Pendências agrupadas:", counts);
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

        const headers = {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        };

        const utentesRes = await fetch(
            `${API_BASE}patients?f=HOSPITALIZED`,
            { headers }
        );

        if (!utentesRes.ok) {
            throw new Error(`HTTP ${utentesRes.status}`);
        }

        const utentesJson = await utentesRes.json();

        if (!utentesJson.success) {
            throw new Error(utentesJson.message);
        }

        const utentes = utentesJson.data ?? [];

        const internados = utentes.filter(
            u => u.processo !== null
        );

        const turnoRes = await fetch(
            `${API_BASE}workers/me/shift`,
            { headers }
        );

        if (!turnoRes.ok) {
            throw new Error(`HTTP ${turnoRes.status}`);
        }

        const turnoJson = await turnoRes.json();

        if (!turnoJson.success) {
            throw new Error(turnoJson.message);
        }
        console.log(turnoJson);
        const turno = turnoJson.data;

        let pendencias = [];

        if (turno?.id) {

            const pendenciasRes = await fetch(
                `${API_BASE}shifts/${turno.id}/pending`,
                { headers }
            );

            console.log(pendenciasRes);

            if (pendenciasRes.ok) {

                const pendenciasJson = await pendenciasRes.json();
                console.log(pendenciasJson);
                if (pendenciasJson.success) {
                    pendencias = pendenciasJson.data ?? [];
                }
            }
        }

        renderTabelaUtentes(internados);

        renderStatusBar(internados, pendencias);

        renderAlertas(internados);

        renderPendencias(pendencias);

    } catch (err) {

        console.error("[Dashboard] Erro ao carregar dashboard:", err);

        const tbody = document.getElementById("lista-utentes-tbody");

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8"
                        style="text-align:center;padding:20px;color:#b91c1c;">
                        Erro ao carregar dados: ${err.message}
                    </td>
                </tr>
            `;
        }

        const pendenciasBody =
            document.getElementById("pendencias-tbody");

        if (pendenciasBody) {
            pendenciasBody.innerHTML = `
                <tr>
                    <td colspan="4"
                        style="text-align:center;padding:20px;color:#b91c1c;">
                        Erro ao carregar pendências.
                    </td>
                </tr>
            `;
        }
    }
}

function verUtente(utenteId) {
    window.location.href = `enfermeiroKardexUtente?id=${utenteId}`;
}

function renderPendencias(pendencias) {
    const tbody = document.getElementById("pendencias-tbody");
    if (!tbody) return;

    if (!pendencias || pendencias.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;padding:20px;color:#888;">
                    Sem pendências do turno anterior.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pendencias.map(p => {
        const utente = p.utente?.nome ?? "—";
        console.log(p);
        const prioridade = p.tipo;


        return `
            <tr>
                <td>${utente}</td>
                <td>${tipoMap[p.tipo] ?? p.tipo}</td>
                <td>${p.descricao ?? "—"}</td>
                <td>${prioridade}</td>
            </tr>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 60_000);

    renderTopbar();
    loadDashboard();
});