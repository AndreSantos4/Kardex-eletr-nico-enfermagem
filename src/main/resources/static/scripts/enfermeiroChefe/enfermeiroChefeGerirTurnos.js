const API_BASE = "";

const TURNO_TIPOS = ["manha", "tarde", "noite"];
const DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const DIA_NOMES = ["Seg", "Ter", "Quarta", "Quinta", "Sex", "Sab", "Dom"];

function updateClock() {
    const el = document.getElementById("current-datetime");
    if (!el) return;
    el.textContent = new Date().toLocaleString("pt-PT", {
        hour: "2-digit", minute: "2-digit",
    });
}

function updateHeaderDatetime() {
    const el = document.getElementById("header-datetime");
    if (!el) return;
    const now = new Date();
    const turno = sessionStorage.getItem("turno") ?? "—";
    el.textContent = now.toLocaleString("pt-PT", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }) + " - Turno " + turno;
}

function renderTopbar() {
    const nome = sessionStorage.getItem("nomeEnfermeiro") ?? "—";
    const turno = sessionStorage.getItem("turno") ?? "—";
    const servico = sessionStorage.getItem("servico") ?? "Serviço";
    document.getElementById("nome-chefe").textContent = nome;
    document.getElementById("turno-chefe").textContent = turno;
    const servicoEl = document.getElementById("servico-nome");
    if (servicoEl) servicoEl.textContent = servico;
}

function getMondayOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDayHeader(date, nomeCurto) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${nomeCurto} ${day}/${month}`;
}

function buildWeekHeaders(monday) {
    DIA_NOMES.forEach((nome, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const th = document.getElementById(`th-${DIAS[i]}`);
        if (th) th.textContent = formatDayHeader(d, nome);
    });
}

function clearAgenda() {
    TURNO_TIPOS.forEach(tipo => {
        DIAS.forEach(dia => {
            const cell = document.getElementById(`${tipo}-${dia}`);
            if (cell) cell.innerHTML = "";
        });
    });
}

function renderAgenda(turnos) {
    clearAgenda();
    if (!turnos || turnos.length === 0) return;

    turnos.forEach(t => {
        const tipo = (t.tipo ?? "").toLowerCase();
        const dia = (t.dia ?? "").toLowerCase();
        const cell = document.getElementById(`${tipo}-${dia}`);
        if (!cell) return;
        const chips = (t.equipa ?? []).map((enf, idx) =>
            `<span class="gt-enf-chip${idx === 0 ? " chefe" : ""}">${enf}</span>`
        ).join("");
        cell.innerHTML = chips;
        if (t.id) {
            cell.style.cursor = "pointer";
            cell.onclick = () => abrirPopUpEditarTurno(t.id);
        }
    });
}

function renderAtribuicao(atribuicoes) {
    const el = document.getElementById("atribuicao-body");
    if (!atribuicoes || atribuicoes.length === 0) {
        el.innerHTML = `<div class="gt-atrib-row"><span style="color:#888;">Sem dados de atribuição.</span></div>`;
        return;
    }
    el.innerHTML = atribuicoes.map(a => `
        <div class="gt-atrib-row">
            <span class="gt-atrib-enf">${a.enfermeiro ?? "—"}</span>
            <span class="gt-atrib-utentes">${(a.utentes ?? []).join(" · ") || "—"}</span>
            <span class="gt-atrib-carga">${a.carga ?? "—"}</span>
        </div>`).join("");
}

function estadoBadge(estado) {
    const map = {
        "Ativo": "estado-ativo",
        "Folga": "estado-folga",
        "Noite": "estado-noite",
    };
    const cls = map[estado] ?? "";
    return `<span class="${cls}">${estado ?? "—"}</span>`;
}

function renderDisponibilidade(equipa) {
    const el = document.getElementById("disponibilidade-body");
    if (!equipa || equipa.length === 0) {
        el.innerHTML = `<div class="gt-dispon-row"><span style="color:#888;">Sem dados de disponibilidade.</span></div>`;
        return;
    }
    el.innerHTML = equipa.map(e => `
        <div class="gt-dispon-row">
            <span class="gt-dispon-enf">${e.nome ?? "—"}</span>
            <span class="gt-dispon-estado">${estadoBadge(e.estado)}</span>
            <span class="gt-dispon-turno">${e.proximoTurno ?? "—"}</span>
        </div>`).join("");
}

async function loadGerirTurnos() {
    const monday = getMondayOfWeek(new Date());
    buildWeekHeaders(monday);

    renderAgenda([]);
    renderAtribuicao([]);
    renderDisponibilidade([]);
}

// ── Popup Editar Turno ──────────────────────────────────────────────────────

const TURNO_HORAS = {
    MANHA:  { inicio: "08:00", fim: "16:00" },
    TARDE:  { inicio: "16:00", fim: "00:00" },
    NOITE:  { inicio: "00:00", fim: "08:00" },
};

async function carregarPopupEditarTurno() {
    try {
        const res = await fetch("../../pages/enfermeiroChefe/popups/enfermeiroChefeEditarTurno.html");
        if (!res.ok) return;
        const html = await res.text();
        document.body.insertAdjacentHTML("beforeend", html);
    } catch (e) {
        console.warn("[popup] Erro ao carregar editar turno:", e);
    }
}

async function abrirPopUpEditarTurno(turnoId) {
    const popup = document.querySelector(".pop-up-editar-turno");
    if (!popup) return;
    popup.style.display = "flex";

    document.getElementById("et-turno-id").value = turnoId;
    document.getElementById("et-errorBox").style.display = "none";

    await carregarEnfermeirosDisponiveisEditar();

    try {
        const token = sessionStorage.getItem("token") ?? localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/turnos/${turnoId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const turno = json.data ?? json;

        const tipoSelect = document.getElementById("et-tipo");
        if (tipoSelect) {
            tipoSelect.value = turno.tipo ?? "MANHA";
            onTipoTurnoEditarChange(tipoSelect.value);
        }

        if (turno.tipo === "PERSONALIZADO") {
            const hi = document.getElementById("et-hora-inicio");
            const hf = document.getElementById("et-hora-fim");
            if (hi) hi.value = turno.horaInicio ?? "";
            if (hf) hf.value = turno.horaFim ?? "";
        }

        const obs = document.getElementById("et-observacoes");
        if (obs) obs.value = turno.observacoes ?? "";

        const enfIds = (turno.enfermeiros ?? []).map(String);
        document.querySelectorAll('#et-enfermeiros-box input[type="checkbox"]').forEach(cb => {
            cb.checked = enfIds.includes(cb.value);
        });
    } catch (err) {
        console.error(err);
    }
}

function fecharPopUpEditarTurno() {
    const popup = document.querySelector(".pop-up-editar-turno");
    if (popup) popup.style.display = "none";
    const form = document.getElementById("form-editar-turno");
    if (form) form.reset();
    onTipoTurnoEditarChange("MANHA");
}

function onTipoTurnoEditarChange(valor) {
    const hi = document.getElementById("et-hora-inicio");
    const hf = document.getElementById("et-hora-fim");
    if (!hi || !hf) return;

    if (valor === "PERSONALIZADO") {
        hi.readOnly = false;
        hf.readOnly = false;
        hi.value = "";
        hf.value = "";
    } else {
        const horas = TURNO_HORAS[valor] ?? { inicio: "", fim: "" };
        hi.readOnly = true;
        hf.readOnly = true;
        hi.value = horas.inicio;
        hf.value = horas.fim;
    }
}

async function carregarEnfermeirosDisponiveisEditar() {
    const box = document.getElementById("et-enfermeiros-box");
    if (!box) return;
    box.innerHTML = '<div class="et-loading">A carregar enfermeiros...</div>';

    try {
        const token = sessionStorage.getItem("token") ?? localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/users?role=ENFERMEIRO`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const enfermeiros = json.data ?? [];

        if (enfermeiros.length === 0) {
            box.innerHTML = '<div class="et-loading">Nenhum enfermeiro disponível.</div>';
            return;
        }

        box.innerHTML = enfermeiros.map(e => `
            <label class="et-enf-item">
                <input type="checkbox" name="enfermeiros" value="${e.id}" />
                <span>${e.nome}</span>
            </label>
        `).join("");
    } catch (err) {
        box.innerHTML = '<div class="et-loading">Erro ao carregar enfermeiros.</div>';
        console.error(err);
    }
}

async function submeterEditarTurno(event) {
    event.preventDefault();
    const turnoId = document.getElementById("et-turno-id").value;
    const tipo = document.getElementById("et-tipo").value;
    const horaInicio = document.getElementById("et-hora-inicio").value;
    const horaFim = document.getElementById("et-hora-fim").value;
    const observacoes = document.getElementById("et-observacoes").value;
    const enfermeiros = [...document.querySelectorAll('#et-enfermeiros-box input[type="checkbox"]:checked')]
        .map(cb => cb.value);

    const token = sessionStorage.getItem("token") ?? localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE}/api/turnos/${turnoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ tipo, horaInicio, horaFim, enfermeiros, observacoes }),
        });

        if (res.ok) {
            fecharPopUpEditarTurno();
            loadGerirTurnos();
        } else {
            document.getElementById("et-errorBox").style.display = "block";
            document.getElementById("et-errorMsg").textContent = "Erro ao editar turno.";
        }
    } catch (err) {
        console.error(err);
    }
}

async function eliminarTurno() {
    const turnoId = document.getElementById("et-turno-id").value;
    if (!confirm("Tem a certeza que pretende eliminar este turno?")) return;

    const token = sessionStorage.getItem("token") ?? localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE}/api/turnos/${turnoId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            fecharPopUpEditarTurno();
            loadGerirTurnos();
        } else {
            document.getElementById("et-errorBox").style.display = "block";
            document.getElementById("et-errorMsg").textContent = "Erro ao eliminar turno.";
        }
    } catch (err) {
        console.error(err);
    }
}

// ── Popup Criar Turno ──────────────────────────────────────────────────────

async function carregarPopupCriarTurno() {
    try {
        const res = await fetch("../../pages/enfermeiroChefe/popups/enfermeiroChefeCriarTurno.html");
        if (!res.ok) return;
        const html = await res.text();
        document.body.insertAdjacentHTML("beforeend", html);

        document.querySelectorAll('[id="btn-criar-turno-header"], [id="btn-criar-turno-agenda"]').forEach(btn => {
            btn.addEventListener("click", abrirPopUpCriarTurno);
        });
    } catch (e) {
        console.warn("[popup] Erro ao carregar criar turno:", e);
    }
}

function abrirPopUpCriarTurno() {
    const popup = document.querySelector(".pop-up-criar-turno");
    if (!popup) return;
    popup.style.display = "flex";
    carregarEnfermeirosDisponiveis();
    const dataInput = document.getElementById("ct-data");
    if (dataInput && !dataInput.value) {
        dataInput.value = new Date().toISOString().split("T")[0];
    }
}

function fecharPopUpCriarTurno() {
    const popup = document.querySelector(".pop-up-criar-turno");
    if (popup) popup.style.display = "none";
    const form = document.getElementById("form-criar-turno");
    if (form) form.reset();
    onTipoTurnoChange("MANHA");
}

function onTipoTurnoChange(valor) {
    const secHorario = document.getElementById("ct-horario-personalizado");
    const horaInicio = document.getElementById("ct-hora-inicio");
    const horaFim = document.getElementById("ct-hora-fim");
    if (!secHorario) return;

    if (valor === "PERSONALIZADO") {
        secHorario.style.display = "block";
        if (horaInicio) horaInicio.required = true;
        if (horaFim) horaFim.required = true;
    } else {
        secHorario.style.display = "none";
        if (horaInicio) horaInicio.required = false;
        if (horaFim) horaFim.required = false;
    }
}

async function carregarEnfermeirosDisponiveis() {
    const box = document.getElementById("ct-enfermeiros-box");
    if (!box) return;
    box.innerHTML = '<div class="ct-loading">A carregar enfermeiros...</div>';

    try {
        const token = sessionStorage.getItem("token") ?? localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/users?role=ENFERMEIRO`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const enfermeiros = json.data ?? [];

        if (enfermeiros.length === 0) {
            box.innerHTML = '<div class="ct-loading">Nenhum enfermeiro disponível.</div>';
            return;
        }

        box.innerHTML = enfermeiros.map(e => `
            <label class="ct-enf-item">
                <input type="checkbox" name="enfermeiros" value="${e.id}" />
                <span>${e.nome}</span>
            </label>
        `).join("");
    } catch (err) {
        box.innerHTML = '<div class="ct-loading">Erro ao carregar enfermeiros.</div>';
        console.error(err);
    }
}

async function submeterCriarTurno(event) {
    event.preventDefault();
    const tipo = document.getElementById("ct-tipo").value;
    const data = document.getElementById("ct-data").value;
    const observacoes = document.getElementById("ct-observacoes").value;
    const enfermeiros = [...document.querySelectorAll('#ct-enfermeiros-box input[type="checkbox"]:checked')]
        .map(cb => cb.value);

    let horaInicio, horaFim;
    if (tipo === "PERSONALIZADO") {
        horaInicio = document.getElementById("ct-hora-inicio").value;
        horaFim = document.getElementById("ct-hora-fim").value;
    }

    const token = sessionStorage.getItem("token") ?? localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE}/api/turnos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ tipo, data, horaInicio, horaFim, enfermeiros, observacoes }),
        });

        if (res.ok) {
            fecharPopUpCriarTurno();
            loadGerirTurnos();
        } else {
            const errorBox = document.getElementById("ct-errorBox");
            if (errorBox) errorBox.style.display = "block";
        }
    } catch (err) {
        console.error(err);
    }
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 60_000);
    updateHeaderDatetime();
    renderTopbar();
    loadGerirTurnos();
    carregarPopupCriarTurno();
    carregarPopupEditarTurno();
});
