const API_BASE = "http://localhost:8080/api/";

const TURNO_LABELS = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
  CUSTOM: "Personalizado",
};

let _turnoAtualId = null;
let _proximoTurnoId = null;

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

function determinarTurnos(turnos) {
  const agora = new Date();

  const atual =
    turnos.find((t) => {
      const inicio = turnoParaDate(t.inicio);
      const fim = turnoParaDate(t.fim);
      if (!inicio || !fim) return false;
      return agora >= inicio && agora < fim;
    }) ?? null;

  if (!atual) return { turnoAtual: null, proximoTurno: null };

  const fimAtual = turnoParaDate(atual.fim);

  const proximo =
    turnos
      .filter((t) => {
        const inicio = turnoParaDate(t.inicio);
        return inicio && inicio >= fimAtual;
      })
      .sort((a, b) => turnoParaDate(a.inicio) - turnoParaDate(b.inicio))[0] ??
    null;

  return { turnoAtual: atual, proximoTurno: proximo };
}

function svRegistadoHoje(sinaisVitais) {
  if (!sinaisVitais || sinaisVitais.length === 0) return false;
  const hoje = new Date();
  const prefixo = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
  return sinaisVitais.some((sv) => (sv.data ?? "").startsWith(prefixo));
}

function contarMedicacoes(prescricoes) {
  const ativas = (prescricoes ?? []).filter((p) => p.estado === "ATIVA");
  let total = 0;
  let naoAdm = 0;
  ativas.forEach((p) => {
    total++;
    const adm = p.administracoes ?? [];
    const hoje = new Date().toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const temHoje = adm.some((a) => {
      const d = a.data ?? "";
      return (
        d.startsWith(hoje) || d.startsWith(hoje.split("/").reverse().join("-"))
      );
    });
    if (!temHoje) naoAdm++;
  });
  return { total, naoAdm };
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
  const labelAtual = labelTurno(turnoObj);
  const labelProximo = labelTurno(proximoTurnoObj);

  const tituloEl = document.getElementById("turno-titulo");
  if (tituloEl)
    tituloEl.textContent = `Passagem de Turno — ${labelAtual} → ${labelProximo}`;

  const dataEl = document.getElementById("turno-data");
  if (dataEl && turnoObj) {
    const dataInicio = parseData(turnoObj.inicio);
    const horaInicio = parseHora(turnoObj.inicio);
    const horaFim = parseHora(turnoObj.fim);
    dataEl.textContent = `${dataInicio} — Turno ${labelAtual} ${horaInicio}–${horaFim}`;
  }

  const proximoHeader = document.getElementById("proximo-turno-header");
  if (proximoHeader) {
    proximoHeader.textContent = proximoTurnoObj
      ? labelTurno(proximoTurnoObj)
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

function renderResumoTurno(utentes, turnoObj, dadosTurno) {
  const el = document.getElementById("resumo-turno");
  if (!el) return;

  let totalMed = 0,
    totalNaoAdm = 0,
    svRegistados = 0;
  utentes.forEach((u) => {
    const p = u.processo;
    if (!p) return;
    const { total, naoAdm } = contarMedicacoes(p.prescricoes);
    totalMed += total;
    totalNaoAdm += naoAdm;
    if (svRegistadoHoje(p.sinaisVitais)) svRegistados++;
  });

  let totalSOS = 0,
    totalIncidentes = 0;
  dadosTurno.forEach((d) => {
    totalSOS += (d.administracoes?.sos ?? []).length;
    totalIncidentes += (d.incidentes ?? []).length;
  });

  const obsText = turnoObj?.observacoes
    ? `<p style="font-style:italic;color:#555;">"${turnoObj.observacoes}"</p>`
    : "";

  el.innerHTML = `
        ${obsText}
        <p>${utentes.length} utente${utentes.length !== 1 ? "s" : ""} — Turno</p>
        <p>${totalMed - totalNaoAdm} adm. · ${totalNaoAdm} não adm.</p>
        <p>${svRegistados} sinais vitais registados</p>
        <p>${totalIncidentes} incidente${totalIncidentes !== 1 ? "s" : ""} · ${totalSOS} SOS adm.</p>
    `;
}

function renderPendenciasProximoTurno(utentes, dadosTurno) {
  const el = document.getElementById("pendencias-proximo-turno");
  if (!el) return;

  const turnoMap = new Map();
  dadosTurno.forEach((d) => {
    if (d.utente?.id != null) turnoMap.set(Number(d.utente.id), d);
  });

  const pendencias = [];

  utentes.forEach((u) => {
    const p = u.processo;
    const apelido = (u.nome ?? "—").split(" ").pop();
    const uId = Number(u.id);
    const dt = turnoMap.get(uId);

    if (p) {
      (p.prescricoes ?? [])
        .filter((pr) => pr.estado === "ATIVA")
        .forEach((pr) => {
          const adm = pr.administracoes ?? [];
          const hoje = new Date().toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const temHoje = adm.some((a) => {
            const d = a.data ?? "";
            return (
              d.startsWith(hoje) ||
              d.startsWith(hoje.split("/").reverse().join("-"))
            );
          });
          if (!temHoje) {
            const nomeMed = pr.medicamento?.nome ?? "Medicamento";
            pendencias.push(`${nomeMed} — ${apelido}`);
          }
        });
    }

    const svFeito = dt
      ? dt.sinaisMedidos === true
      : svRegistadoHoje(p?.sinaisVitais);
    if (!svFeito) {
      pendencias.push(`Sinais vitais — ${apelido}`);
    }

    if (dt) {
      (dt.incidentes ?? [])
        .filter((i) => i.estado !== "RESOLVIDO")
        .forEach((inc) => {
          pendencias.push(`${inc.tipo ?? "Incidente"} — ${apelido}`);
        });
    }
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

function renderEstadoUtentes(utentes, dadosTurno) {
  const tbody = document.getElementById("estado-utentes-tbody");
  if (!tbody) return;

  if (!utentes || utentes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#888;">
            Sem utentes internados de momento.</td></tr>`;
    return;
  }

  const turnoMap = new Map();
  dadosTurno.forEach((d) => {
    if (d.utente?.id != null) turnoMap.set(Number(d.utente.id), d);
  });

  tbody.innerHTML = utentes
    .map((u) => {
      const p = u.processo;
      const nome = u.nome ?? "—";
      const cama = p?.cama?.id ?? "—";
      const uId = Number(u.id);
      const dt = turnoMap.get(uId);

      const flags = (dt?.utente?.flags ?? []).map(renderFlag).join("");

      const { total, naoAdm } = contarMedicacoes(p?.prescricoes);
      let medTexto;
      if (total === 0) {
        medTexto = `<span style="color:#888;">Sem medicação</span>`;
      } else if (naoAdm === 0) {
        medTexto = `<span style="color:#16a34a;">Nenhum em falta</span>`;
      } else {
        medTexto = `<span style="color:#b91c1c;">${naoAdm} não adm.</span>`;
      }

      const svFeito = dt
        ? dt.sinaisMedidos === true
        : svRegistadoHoje(p?.sinaisVitais);
      const svTexto = svFeito
        ? `<span style="color:#16a34a;">Realizado</span>`
        : `<span style="color:#b91c1c;">Não Realizado</span>`;

      const incidentes = dt?.incidentes ?? [];
      const nSOS = (dt?.administracoes?.sos ?? []).length;
      let ocorrTexto = `<span style="color:#888;">—</span>`;
      if (incidentes.length > 0 || nSOS > 0) {
        const partes = [];
        if (incidentes.length > 0) partes.push(`${incidentes.length} inc.`);
        if (nSOS > 0) partes.push(`${nSOS} SOS`);
        ocorrTexto = `<span style="color:#f59e0b;">${partes.join(" · ")}</span>`;
      }

      const pendLista = [];
      if (naoAdm > 0) pendLista.push(`${naoAdm} med.`);
      if (!svFeito) pendLista.push("SV");
      const pendTexto =
        pendLista.length === 0
          ? `<span style="color:#888;">—</span>`
          : `<span style="color:#b91c1c;">${pendLista.join(", ")}</span>`;

      return `
        <tr>
            <td>${nome}${flags ? `<br><small>${flags}</small>` : ""}</td>
            <td>${cama}</td>
            <td>${medTexto}</td>
            <td>${svTexto}</td>
            <td>${ocorrTexto}</td>
            <td>${pendTexto}</td>
        </tr>`;
    })
    .join("");
}

async function loadPassagemTurno() {
  try {
    const [resPatients, resShifts] = await Promise.all([
      fetch(`${API_BASE}patients?f=HOSPITALIZED`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
      fetch(`${API_BASE}shifts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    ]);

    if (!resPatients.ok)
      throw new Error(`Patients: HTTP ${resPatients.status}`);
    if (!resShifts.ok) throw new Error(`Shifts: HTTP ${resShifts.status}`);

    const jsonPatients = await resPatients.json();
    const jsonShifts = await resShifts.json();

    if (!jsonPatients.success)
      throw new Error(jsonPatients.message ?? "Erro ao carregar utentes");
    if (!jsonShifts.success)
      throw new Error(jsonShifts.message ?? "Erro ao carregar turnos");

    const utentes = (jsonPatients.data ?? []).filter(
      (u) => u.processo !== null,
    );
    const turnos = jsonShifts.data ?? [];

    const { turnoAtual, proximoTurno } = determinarTurnos(turnos);

    _turnoAtualId = turnoAtual?.id ?? null;
    _proximoTurnoId = proximoTurno?.id ?? null;

    let dadosTurno = [];
    if (_turnoAtualId) {
      try {
        const resChange = await fetch(
          `${API_BASE}shifts/${_turnoAtualId}/change`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (resChange.ok) {
          const jsonChange = await resChange.json();
          if (jsonChange.success)
            dadosTurno = jsonChange.data?.dadosTurnoUtentes ?? [];
        }
      } catch (changeErr) {
        console.warn("Dados de turno indisponíveis:", changeErr.message);
      }
    }

    renderPageHeader(turnoAtual, proximoTurno);
    renderProximoTurno(proximoTurno);
    renderResumoTurno(utentes, turnoAtual, dadosTurno);
    renderPendenciasProximoTurno(utentes, dadosTurno);
    renderEstadoUtentes(utentes, dadosTurno);
  } catch (err) {
    console.error("Erro crítico:", err);
    const tbody = document.getElementById("estado-utentes-tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#b91c1c;">
                Erro ao carregar dados: ${err.message}</td></tr>`;
    }
    [
      "resumo-turno",
      "pendencias-proximo-turno",
      "enfermeiros-proximo-turno",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el)
        el.innerHTML = `<p style="color:#b91c1c;font-size:12px;">Erro ao carregar.</p>`;
    });
  }
}

async function finalizarPassagem() {
  const observacoes =
    document.getElementById("observacoes-textarea")?.value?.trim() ?? "";

  if (!_turnoAtualId) {
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: "Turno atual não identificado. Recarregue a página.",
      tipo: "erro",
    });
    return;
  }
  if (!_proximoTurnoId) {
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: "Próximo turno não identificado. Recarregue a página.",
      tipo: "erro",
    });
    return;
  }

  try {
    const res = await fetch(`${API_BASE}shifts/${_turnoAtualId}/change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        idTrno: Number(_turnoAtualId),
        idProximoTurno: Number(_proximoTurnoId),
        observacoes,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? `HTTP ${res.status}`);
    }

    mostrarNotificacao({
      titulo: "Passagem de Turno",
      mensagem: "Passagem de turno efetuada com sucesso.",
      tipo: "sucesso",
    });

    ["btn-finalizar-header", "btn-finalizar"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Finalizado";
      }
    });
  } catch (err) {
    console.error("Erro ao finalizar:", err);
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: `Erro ao finalizar: ${err.message}`,
      tipo: "erro",
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderTopbar();
  renderPageHeader(null, null);
  loadPassagemTurno();

  document
    .getElementById("btn-finalizar-header")
    ?.addEventListener("click", finalizarPassagem);
  document
    .getElementById("btn-finalizar")
    ?.addEventListener("click", finalizarPassagem);
});
