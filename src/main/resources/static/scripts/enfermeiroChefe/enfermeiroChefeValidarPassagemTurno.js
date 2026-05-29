/* =============================================================
 *  Enf. Chefe - Validar Passagem de Turno
 *  Placeholder: endpoints ainda não existem no backend.
 *  Os dados de exemplo estão definidos no HTML; este script
 *  apenas prepara a lógica de validação e helpers de render.
 * ============================================================= */

document.addEventListener("DOMContentLoaded", function () {
    console.log("[Validar Passagem] Página carregada.");

    /*
     * TODO: ligar ao backend quando os endpoints existirem:
     *   GET  /api/shifts/handover/pending   -> dados do turno a validar
     *   POST /api/shifts/handover/{id}/validate
     *   POST /api/shifts/handover/{id}/return
     */



    //await _renderPendencias();
    _renderSumario();


});

/* ---------- Validação ---------- */

function validarPassagemTurno(event) {
    if (event) event.preventDefault();

    var confirmado = document.getElementById("check-confirmar");
    if (!confirmado || !confirmado.checked) {
        _avisar("Confirme que reviu o relatório antes de validar.");
        return;
    }

    var obs = (document.getElementById("observacoes-validacao") || {}).value || "";

    var payload = {
        observacoes: obs.trim(),
    };
    console.log("[Validar Passagem] Validar e assinar:", payload);

    _avisar("Funcionalidade ainda não disponível — endpoint do backend em desenvolvimento.");

    /*
     * TODO: POST /api/shifts/handover/{id}/validate
     *   Body: { observacoes }
     */
}

function devolverParaCorrecao() {
    var obs = (document.getElementById("observacoes-validacao") || {}).value || "";
    if (!obs.trim()) {
        _avisar("Indique nas observações o motivo da devolução para correção.");
        return;
    }

    var payload = { observacoes: obs.trim() };
    console.log("[Validar Passagem] Devolver para correção:", payload);

    _avisar("Funcionalidade ainda não disponível — endpoint do backend em desenvolvimento.");

    /*
     * TODO: POST /api/shifts/handover/{id}/return
     *   Body: { observacoes }
     */
}

/* ---------- Render helpers (prontos para uso futuro) ---------- */

async function _renderSumario() {
    _renderNotaEnfermeiro(null);
    _renderPendenciasList([]);
    try {
        const resTurno = await fetch(`http://localhost:8080/api/shifts/current`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!resTurno.ok) {
            console.warn("[Validar Passagem] Sem turno atual:", resTurno.status);
            _renderSemTurno();
            return;
        }
        const jsonTurno = await resTurno.json();
        if (!jsonTurno.success) throw new Error(jsonTurno.message);

        const atribuicoes = jsonTurno.data.atribuicoes ?? [];
        const idTurno = jsonTurno.data.id;

        const resMudanca = await fetch(`http://localhost:8080/api/shifts/${idTurno}/change`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!resMudanca.ok) {
            console.warn("[Validar Passagem] Passagem ainda não disponível:", resMudanca.status);
            _renderHeaderApenas(jsonTurno.data);
            return;
        }
        const jsonMudanca = await resMudanca.json();
        if (!jsonMudanca.success) throw new Error(jsonMudanca.message);

        const turnoAtual = jsonMudanca.data.turno;
        const proxTurno  = jsonMudanca.data.proximoTurno;
        const pendsList  = jsonMudanca.data.dadosTurnoUtentes ?? [];

        // Page header
        document.getElementById("turno-origem").textContent = `Turno ${turnoAtual.tipo} (${turnoAtual.inicio.split(":")[0]})`;
        document.getElementById("turno-destino").textContent = proxTurno
            ? `Turno ${proxTurno.tipo} (${proxTurno.inicio.split(":")[0]})`
            : "—";

        const enfermeiros = jsonTurno.data.enfermeiros ?? [];
        const nomesEnf = enfermeiros.map(e => e.dados?.nome).filter(Boolean).join(", ");
        document.getElementById("enf-origem").textContent = nomesEnf || "—";

        // Contagens a partir de PendenciaDTO (utente, tipo, descricao, executada)
        const ehMed = p => p.tipo === "MEDICACAO";
        const totalAdministradas    = pendsList.filter(p => ehMed(p) && p.executada).length;
        const totalNaoAdministradas = pendsList.filter(p => ehMed(p) && !p.executada).length;
        const totalIncidentes       = pendsList.filter(p => p.tipo === "EXAME" || p.tipo === "CATETER").length;
        const totalSOS              = 0; // sem endpoint próprio
        const totalPendencias       = pendsList.filter(p => !p.executada).length;

        // Utentes únicos: combinar atribuições do turno actual + utentes que aparecem nas pendências
        const utentesUnicos = new Set();
        atribuicoes.forEach(a => { if (a.utente?.id != null) utentesUnicos.add(a.utente.id); });
        pendsList.forEach(p => { if (p.utente?.id != null) utentesUnicos.add(p.utente.id); });
        document.getElementById("numUtentes").textContent = utentesUnicos.size;

        document.getElementById("numAdminCon").textContent   = totalAdministradas;
        document.getElementById("numAdminNCon").textContent  = totalNaoAdministradas;
        document.getElementById("numIncidentes").textContent = totalIncidentes;
        document.getElementById("numAdminSOS").textContent   = totalSOS;
        document.getElementById("numPendencias").textContent = totalPendencias;
        document.getElementById("proxTurno").textContent = proxTurno
            ? `${proxTurno.tipo} (${proxTurno.inicio.split(":")[0]})`
            : "—";

        _renderPendenciasList(pendsList.filter(p => !p.executada));

        // Agrupa pendências por utente para a tabela
        const porUtente = new Map();
        for (const p of pendsList) {
            const uid = p.utente?.id;
            if (uid == null) continue;
            if (!porUtente.has(uid)) {
                porUtente.set(uid, { utente: p.utente, medicacao: [], sinaisVitais: [], outras: [] });
            }
            const grupo = porUtente.get(uid);
            if (p.tipo === "MEDICACAO") grupo.medicacao.push(p);
            else if (p.tipo === "SINAL_VITAL") grupo.sinaisVitais.push(p);
            else grupo.outras.push(p);
        }
        _renderEstadoUtentes(Array.from(porUtente.values()));
    } catch (err) {
        console.error("[Validar Passagem] Erro:", err);
    }
}

function _renderHeaderApenas(turno) {
    const txt = turno?.tipo && turno?.inicio
        ? `Turno ${turno.tipo} (${turno.inicio.split(":")[0]})`
        : "—";
    document.getElementById("turno-origem").textContent = txt;
    document.getElementById("turno-destino").textContent = "—";
    const nomes = (turno?.enfermeiros ?? []).map(e => e.dados?.nome).filter(Boolean).join(", ");
    document.getElementById("enf-origem").textContent = nomes || "—";
}

function _renderEstadoUtentes(grupos) {
    const tbody = document.getElementById("estado-utentes-tbody");
    if (!tbody) return;

    if (!grupos || grupos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;font-style:italic;color:#6b7280;padding:16px;">Sem utentes com pendências para este turno.</td></tr>';
        return;
    }

    tbody.innerHTML = grupos.map(g => {
        const nome    = _escapeHtml(g.utente?.nome || "—");
        const medFeitas    = g.medicacao.filter(p => p.executada).length;
        const medPendentes = g.medicacao.filter(p => !p.executada).length;
        const svPendentes  = g.sinaisVitais.filter(p => !p.executada).length;
        const outrasPend   = g.outras.filter(p => !p.executada).length;

        const medicacaoCell = medPendentes > 0
            ? `${medFeitas} con. / <span style="color:#c0392b">${medPendentes} não con.</span>`
            : (medFeitas > 0 ? `<span class="ok">&#10003;</span>` : "—");

        const svCell = svPendentes > 0
            ? `<span style="color:#c0392b">Não medidos</span>`
            : `<span class="ok">&#10003;</span>`;

        const outrasCell = outrasPend > 0
            ? `<span style="color:#c0392b">${outrasPend} pend.</span>`
            : "—";

        return `<tr>
            <td>${nome}</td>
            <td>${medicacaoCell}</td>
            <td>${svCell}</td>
            <td>${outrasCell}</td>
            <td>—</td>
        </tr>`;
    }).join("");
}

function _renderPendenciasList(pendencias) {
    const ul = document.getElementById("pendencias-list");
    if (!ul) return;
    if (!pendencias || pendencias.length === 0) {
        ul.innerHTML = '<li style="font-style:italic;color:#6b7280;list-style:none;">Sem pendências para este turno.</li>';
        return;
    }
    const tipoLabel = {
        MEDICACAO: "Medicação",
        SINAL_VITAL: "Sinal Vital",
        EXAME: "Exame",
        CATETER: "Cateter",
    };
    ul.innerHTML = pendencias.slice(0, 8).map(p => {
        const utente = _escapeHtml(p.utente?.nome || "—");
        const tipo = _escapeHtml(tipoLabel[p.tipo] || p.tipo || "—");
        const desc = _escapeHtml(p.descricao || "");
        return `<li style="list-style:disc;margin-left:18px;"><strong>${tipo}</strong> — ${utente}${desc ? `: ${desc}` : ""}</li>`;
    }).join("");
}

function _renderNotaEnfermeiro(texto) {
    var body = document.getElementById("nota-enfermeiro-body");
    if (!body) return;
    if (texto && String(texto).trim()) {
        body.innerHTML = "<p>" + _escapeHtml(texto) + "</p>";
    } else {
        body.innerHTML = '<p style="font-style:italic;color:#6b7280;">Sem nota deixada pelo enfermeiro.</p>';
    }
}

function _renderSemTurno() {
    document.getElementById("turno-origem").textContent = "—";
    document.getElementById("turno-destino").textContent = "—";
    document.getElementById("enf-origem").textContent = "—";
    ["numUtentes","numAdminCon","numAdminNCon","numIncidentes","numAdminSOS","numPendencias"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "0";
    });
    const prox = document.getElementById("proxTurno");
    if (prox) prox.textContent = "—";

    const tbody = document.getElementById("estado-utentes-tbody");
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;font-style:italic;color:#6b7280;padding:16px;">Não existe nenhum turno ativo para validar.</td></tr>';
    }
    _renderNotaEnfermeiro(null);
    _renderPendenciasList([]);
}

/* ---------- Utils ---------- */

function _avisar(msg) {
    if (typeof mostrarNotificacao === "function") {
        mostrarNotificacao(msg, "aviso");
    } else {
        console.warn("[Validar Passagem]", msg);
    }
}

function _escapeHtml(s) {
    if (s == null) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
