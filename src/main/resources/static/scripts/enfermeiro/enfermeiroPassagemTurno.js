const API_BASE = "http://localhost:8080/api/";

const TURNO_LABELS = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
  CUSTOM: "Personalizado",
};

function labelTurno(turno) {
  if (!turno) return "—";
  if (turno.tipo === "CUSTOM") {
    return `${parseHora(turno.inicio)}–${parseHora(turno.fim)}`;
  }
  return TURNO_LABELS[turno.tipo] ?? turno.tipo ?? "—";
}

function parseHora(dataStr) {
  if (!dataStr) return "—";
  const parts = dataStr.split(":");
  if (parts.length >= 3) return `${parts[1]}:${parts[2]}`;
  return "—";
}

function parseData(dataStr) {
  if (!dataStr) return "—";
  return dataStr.split(":")[0];
}

function turnoParaDate(dataStr) {
  if (!dataStr) return null;
  const [datePart, hh, mm, ss] = dataStr.split(":");
  if (!datePart || hh === undefined) return null;
  const [dd, mo, yyyy] = datePart.split("/");
  return new Date(`${yyyy}-${mo}-${dd}T${hh}:${mm}:${ss}`);
}

function determinarProximoTurno(turnos, turnoAtual) {
  if (!turnoAtual) return null;
  const fimAtual = turnoParaDate(turnoAtual.fim);
  if (!fimAtual) return null;

  return (
    turnos
      .filter((t) => {
        if (t.id === turnoAtual.id) return false;
        const inicio = turnoParaDate(t.inicio);
        return inicio && inicio >= fimAtual;
      })
      .sort((a, b) => turnoParaDate(a.inicio) - turnoParaDate(b.inicio))[0] ??
    null
  );
}

function svRegistadoHoje(sinaisVitais) {
  if (!sinaisVitais || sinaisVitais.length === 0) return false;
  const hoje = new Date();
  const prefixo = `${String(hoje.getDate()).padStart(2, "0")}/${String(
    hoje.getMonth() + 1
  ).padStart(2, "0")}/${hoje.getFullYear()}`;
  return sinaisVitais.some((sv) => (sv.data ?? "").startsWith(prefixo));
}

// Sinais vitais considerados medidos se existirem (conforme indicado)
function svMedido(sinaisVitais) {
  return sinaisVitais && sinaisVitais.length > 0;
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

function renderPageHeader(turnoObj, proximoTurnoObj) {
  const labelAtual = turnoObj ? labelTurno(turnoObj) : null;
  const labelProximo = proximoTurnoObj ? labelTurno(proximoTurnoObj) : null;

  const tituloEl = document.getElementById("turno-titulo");
  if (tituloEl) {
    if (labelAtual && labelProximo) {
      tituloEl.textContent = `Passagem de Turno — ${labelAtual} → ${labelProximo}`;
    } else if (labelAtual) {
      tituloEl.textContent = `Passagem de Turno — ${labelAtual}`;
    } else {
      tituloEl.textContent = `Passagem de Turno`;
    }
  }

  const dataEl = document.getElementById("turno-data");
  if (dataEl && turnoObj) {
    const dataInicio = parseData(turnoObj.inicio);
    const horaInicio = parseHora(turnoObj.inicio);
    const horaFim = parseHora(turnoObj.fim);
    dataEl.textContent = `${dataInicio} — Turno ${labelAtual} ${horaInicio}–${horaFim}`;
  } else if (dataEl) {
    dataEl.textContent = "";
  }

  const proximoHeader = document.getElementById("proximo-turno-header");
  if (proximoHeader) {
    proximoHeader.textContent = proximoTurnoObj
      ? `Próximo Turno — ${labelTurno(proximoTurnoObj)}`
      : "Próximo Turno";
  }
}

function renderProximoTurno(proximoTurnoObj) {
  const el = document.getElementById("enfermeiros-proximo-turno");
  if (!el) return;

  if (!proximoTurnoObj) {
    el.innerHTML = `<p class="summary-empty">Sem informação do próximo turno.</p>`;
    return;
  }

  const horaInicio = parseHora(proximoTurnoObj.inicio);
  const horaFim = parseHora(proximoTurnoObj.fim);
  const dataInicio = parseData(proximoTurnoObj.inicio);

  let html = `<p>${dataInicio} · ${horaInicio}–${horaFim}</p>`;

  if (proximoTurnoObj.observacoes) {
    html += `<p style="font-style:italic;color:#555;">"${proximoTurnoObj.observacoes}"</p>`;
  }

  const enfermeiros = proximoTurnoObj.IdEnfermeiros ?? [];
  if (enfermeiros.length === 0) {
    html += `<p style="color:#888;margin-top:6px;">Sem enfermeiros atribuídos.</p>`;
  } else {
    html += `<div style="margin-top:6px;">`;
    enfermeiros.forEach((enf) => {
      const nome = enf.dados?.nome ?? "—";
      html += `<p style="margin:2px 0;">${nome}</p>`;
    });
    html += `</div>`;
  }

  el.innerHTML = html;
}

/**
 * Resumo do turno usando os dados reais por utente:
 * - sinaisVitais do kardex (medidos se existirem)
 * - incidentes e contenções já carregados
 */
function renderResumoTurno(utentes) {
  const el = document.getElementById("resumo-turno");
  if (!el) return;

  let svMedidos = 0;
  let totalIncidentes = 0;
  let totalContencoes = 0;

  utentes.forEach((u) => {
    const p = u.processo;
    if (svMedido(p?.sinaisVitais)) svMedidos++;
    totalIncidentes += (u._incidentes ?? []).length;
    totalContencoes += (u._contencoes ?? []).length;
  });

  el.innerHTML = `
    <p>${utentes.length} utente${utentes.length !== 1 ? "s" : ""} — Turno</p>
    <p>${svMedidos} sinais vitais registados</p>
    <p>${totalContencoes} contenção${totalContencoes !== 1 ? "ões" : ""} administrada${totalContencoes !== 1 ? "s" : ""}</p>
    <p>${totalIncidentes} incidente${totalIncidentes !== 1 ? "s" : ""}</p>
  `;
}

function renderPendenciasProximoTurno(utentes) {
  const el = document.getElementById("pendencias-proximo-turno");
  if (!el) return;

  const pendencias = [];

  utentes.forEach((u) => {
    const p = u.processo;
    const apelido = (u.nome ?? "—").split(" ").pop();

    // Sinais vitais não registados
    if (!svMedido(p?.sinaisVitais)) {
      pendencias.push(`Sinais vitais — ${apelido}`);
    }

    // Incidentes não resolvidos
    (u._incidentes ?? [])
      .filter((i) => i.estado !== "RESOLVIDO")
      .forEach((inc) => {
        const tipo = inc.tipo ?? "Incidente";
        const grav = inc.gravidade ? ` (${inc.gravidade})` : "";
        pendencias.push(`${tipo}${grav} — ${apelido}`);
      });
  });

  if (pendencias.length === 0) {
    el.innerHTML = `<p style="color:#888;">Sem pendências para o próximo turno.</p>`;
    return;
  }
  el.innerHTML = pendencias.map((txt) => `<p>${txt}</p>`).join("");
}

function renderFlag(flag) {
  const map = {
    RISCO_QUEDA: { label: "Queda", color: "#f59e0b" },
    RISCO_FUGA: { label: "Fuga", color: "#3b82f6" },
    RISCO_AGRESSIVIDADE: { label: "Agressividade", color: "#ef4444" },
    RISCO_AUTOMUTILACAO: { label: "Automutilação", color: "#8b5cf6" },
  };
  const info = map[flag] ?? { label: flag, color: "#6b7280" };
  return `<span style="background:${info.color}22;color:${info.color};border:1px solid ${info.color}66;
        border-radius:4px;padding:1px 6px;font-size:11px;white-space:nowrap;margin-right:3px;">${info.label}</span>`;
}

function renderEstadoUtentes(utentes) {
  const tbody = document.getElementById("estado-utentes-tbody");
  if (!tbody) return;

  if (!utentes || utentes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#888;">
            Sem utentes atribuídos neste turno.</td></tr>`;
    return;
  }

  tbody.innerHTML = utentes
    .map((u) => {
      const p = u.processo;
      const nome = u.nome ?? "—";
      const cama = p?.cama?.id ?? "—";

      const flags = (u.flags ?? []).map(renderFlag).join("");

      // Sinais vitais: medidos se existirem
      const svFeito = svMedido(p?.sinaisVitais);
      const svTexto = svFeito
        ? `<span style="color:#16a34a;">Realizado</span>`
        : `<span style="color:#b91c1c;">Não Realizado</span>`;

      // Contenções (administrações)
      const contencoes = u._contencoes ?? [];
      let contTexto;
      if (contencoes.length === 0) {
        contTexto = `<span style="color:#888;">—</span>`;
      } else {
        contTexto = `<span style="color:#2563eb;">${contencoes.length} adm.</span>`;
      }

      // Incidentes
      const incidentes = u._incidentes ?? [];
      let incTexto;
      if (incidentes.length === 0) {
        incTexto = `<span style="color:#888;">—</span>`;
      } else {
        const temCritico = incidentes.some((i) => i.gravidade === "CRITICA");
        const cor = temCritico ? "#ef4444" : "#f59e0b";
        incTexto = `<span style="color:${cor};">${incidentes.length} inc.</span>`;
      }

      // Pendências
      const pendLista = [];
      if (!svFeito) pendLista.push("SV");
      const incPorResolver = incidentes.filter((i) => i.estado !== "RESOLVIDO");
      if (incPorResolver.length > 0) pendLista.push(`${incPorResolver.length} inc.`);

      const pendTexto =
        pendLista.length === 0
          ? `<span style="color:#888;">—</span>`
          : `<span style="color:#b91c1c;">${pendLista.join(", ")}</span>`;

      return `
        <tr>
            <td>${nome}${flags ? `<br><small>${flags}</small>` : ""}</td>
            <td>${cama}</td>
            <td>${contTexto}</td>
            <td>${svTexto}</td>
            <td>${incTexto}</td>
            <td>${pendTexto}</td>
        </tr>`;
    })
    .join("");
}

function mostrarSemTurno() {
  const mainContent = document.querySelector("main") || document.querySelector(".main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      gap: 16px;
      color: #6b7280;
      text-align: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:56px;height:56px;fill:#d1d5db;">
        <path d="M470.6 118.6c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S352 19.1 352 32l0 32-160 0C86 64 0 150 0 256 0 273.7 14.3 288 32 288s32-14.3 32-32c0-70.7 57.3-128 128-128l160 0 0 32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64zM41.4 393.4c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9S160 492.9 160 480l0-32 160 0c106 0 192-86 192-192 0-17.7-14.3-32-32-32s-32 14.3-32 32c0 70.7-57.3 128-128 128l-160 0 0-32c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64z"/>
      </svg>
      <h2 style="font-size:1.25rem;font-weight:600;color:#374151;margin:0;">Sem turno ativo</h2>
      <p style="margin:0;font-size:0.95rem;">Não está atualmente associado a nenhum turno.<br>Contacte o enfermeiro chefe para ser atribuído a um turno.</p>
      <a href="enfermeiroDashboard" style="
        margin-top:8px;
        padding:10px 24px;
        background:#6b7280;
        color:#fff;
        border-radius:6px;
        text-decoration:none;
        font-size:0.9rem;
        font-weight:500;
      ">Voltar ao Dashboard</a>
    </div>
  `;
}

function obterAtribuicoesEnfermeiroLogado(turnoAtual) {
  const idLogado = Number(sessionStorage.getItem("enfermeiroId"));
  const enfermeiros = turnoAtual.IdEnfermeiros ?? [];

  let enf = null;

  if (idLogado) {
    enf = enfermeiros.find(
      (e) => Number(e.dados?.id) === idLogado || Number(e.id) === idLogado
    );
  }

  if (!enf && enfermeiros.length === 1) {
    enf = enfermeiros[0];
  }

  return enf?.atribuicoes ?? [];
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

async function loadPassagemTurno() {
  try {
    // 1. Turno atual do enfermeiro.
    //    O backend devolve 400 quando o enfermeiro não está em turno activo —
    //    tratamos esse caso como "sem turno" em vez de erro crítico.
    let jsonMyShift = null;
    try {
      jsonMyShift = await fetchJson(`${API_BASE}workers/me/shift`);
    } catch (errShift) {
      console.warn("[Passagem Turno] Sem turno activo:", errShift);
      mostrarSemTurno();
      return;
    }

    if (!jsonMyShift?.success || !jsonMyShift.data) {
      mostrarSemTurno();
      return;
    }

    const turnoAtual = jsonMyShift.data;

    // 2. Utentes atribuídos ao enfermeiro logado
    const atribuicoes = obterAtribuicoesEnfermeiroLogado(turnoAtual);
    const idsUtentes = atribuicoes
      .map((a) => a.utente?.id)
      .filter((id) => id != null);

    // 3. Todos os turnos (para calcular próximo turno) + dados de cada utente em paralelo
    const [jsonShifts, ...resPatients] = await Promise.all([
      fetchJson(`${API_BASE}shifts`),
      ...idsUtentes.map((id) => fetchJson(`${API_BASE}patients/${id}`)),
    ]);

    if (!jsonShifts.success)
      throw new Error(jsonShifts.message ?? "Erro ao carregar turnos");

    // Resolver utentes do kardex
    const utentes = [];
    for (let i = 0; i < resPatients.length; i++) {
      const json = resPatients[i];
      if (json.success && json.data?.dados) {
        utentes.push(json.data.dados);
      } else {
        console.warn(`Utente id=${idsUtentes[i]}: resposta sem dados`);
      }
    }

    // 4. Para cada utente, buscar incidentes e contenções em paralelo
    //    usando o id do processo (processo.id)
    await Promise.all(
      utentes.map(async (u) => {
        const processoId = u.processo?.id;
        if (!processoId) {
          u._incidentes = [];
          u._contencoes = [];
          return;
        }

        const [jsonInc, jsonCont] = await Promise.allSettled([
          fetchJson(`${API_BASE}processes/${processoId}/incidents`),
          fetchJson(`${API_BASE}processes/${processoId}/containments`),
        ]);

        u._incidentes =
          jsonInc.status === "fulfilled" && jsonInc.value.success
            ? (jsonInc.value.data ?? [])
            : [];

        u._contencoes =
          jsonCont.status === "fulfilled" && jsonCont.value.success
            ? (jsonCont.value.data ?? [])
            : [];
      })
    );

    const todosTurnos = jsonShifts.data ?? [];
    const proximoTurno = determinarProximoTurno(todosTurnos, turnoAtual);

    // 5. Renderizar tudo
    renderPageHeader(turnoAtual, proximoTurno);
    renderProximoTurno(proximoTurno);
    renderResumoTurno(utentes);
    renderPendenciasProximoTurno(utentes);
    renderEstadoUtentes(utentes);
  } catch (err) {
    console.error("Erro crítico:", err);
    const tbody = document.getElementById("estado-utentes-tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#b91c1c;">
                Erro ao carregar dados: ${err.message}</td></tr>`;
    }
    ["resumo-turno", "pendencias-proximo-turno", "enfermeiros-proximo-turno"].forEach((id) => {
      const el = document.getElementById(id);
      if (el)
        el.innerHTML = `<p style="color:#b91c1c;font-size:12px;">Erro ao carregar.</p>`;
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderTopbar();
  loadPassagemTurno();
});