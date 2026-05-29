const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let processoId = null;

function _authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

// ── Utilitários ───────────────────────────────────────────────────────────────

function calcularIdade(dataNascimentoStr) {
  if (!dataNascimentoStr) return "—";
  const [dia, mes, ano] = dataNascimentoStr.split("/").map(Number);
  const nasc = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (
    hoje.getMonth() < nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())
  )
    idade--;
  return idade;
}

function formatarPeriodo(periodo) {
  const map = { DIARIO: "dia", SEMANAL: "semana", MENSAL: "mês", HORA: "hora" };
  return map[periodo] ?? (periodo ?? "").toLowerCase();
}

function formatarUnidade(unidade) {
  const map = {
    MILIGRAMAS: "mg",
    MICROGRAMAS: "mcg",
    GRAMAS: "g",
    MILILITROS: "mL",
  };
  return map[unidade] ?? unidade ?? "";
}

function formatarVia(via) {
  const map = {
    ORAL: "Oral",
    INTRAVENOSA: "IV",
    INTRAMUSCULAR: "IM",
    SUBCUTANEA: "SC",
    TOPICA: "Tópica",
    INALATORIA: "Inalatória",
  };
  return map[via] ?? via ?? "—";
}

// ── Carregar utente ───────────────────────────────────────────────────────────

async function carregarUtente(id) {
  try {
    const resp = await fetch(`http://localhost:8080/api/patients/${id}`, {
      headers: _authHeaders(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();

    const dados = json.data.dados;
    const processo = dados.processo;
    processoId = processo.id;
    const prescricoes = processo.prescricoes ?? [];

    // Page header title + subtitle
    document.getElementById("page-title").textContent =
      `Kardex - ${dados.nome}`;
    // Backend devolve "dd/MM/yyyy:HH:mm:ss" — o ano vinha colado à hora (NaN).
    const diasInternado = _calcularDiasInternado(processo.dataEntrada) ?? 0;
    document.getElementById("page-subtitle").textContent =
      `Proc. ${processo.id} · Cama ${processo.cama?.id ?? "Não atribuído"} · ${processo.diagnosticoPrincipal ?? "—"} · ${diasInternado} dia(s) internado`;

    // Info bar
    document.getElementById("nome-utente").innerHTML = dados.nome;
    document.getElementById("sexo").innerHTML = dados.sexo;
    document.getElementById("idade").innerHTML = calcularIdade(
      dados.dataNascimento,
    );
    document.getElementById("data").innerHTML = processo.dataEntrada;
    document.getElementById("hora").innerHTML = "—";
    document.getElementById("medico").innerHTML =
      processo.medicoResponsavel?.dados?.nome ?? "—";
    document.getElementById("processo").innerHTML = processo.id;
    document.getElementById("data-nascimento").innerHTML = dados.dataNascimento;
    document.getElementById("cama").innerHTML =
      processo.cama == null ? "Não atribuído" : processo.cama.id;
    document.getElementById("estado").innerHTML = "Internado";
    document.getElementById("dias-internado").innerHTML = diasInternado;

    // Riscos
    const lista = (dados.flags ?? []).map((r) => {
      const texto = r.replace("RISCO_", "").toLowerCase();
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    });
    document.querySelector(".riscos").innerHTML =
      lista.length > 0
        ? `<p style="color: white; font-weight: bolder;">Riscos:&nbsp; ${lista.join(" | ")}</p>`
        : `<p style="color: white; font-weight: bolder;">Riscos:&nbsp; Nenhum</p>`;

    // Alergias
    document.getElementById("alertas").innerHTML =
      (dados.alergias ?? [])
        .map((a) => `<div class="alerta"><p>${a.nome}</p></div>`)
        .join("") ||
      "<p style='padding:5px;color:#888;'>Sem alergias registadas.</p>";

    // Sinais Vitais
    const sinaisVitais = processo.sinaisVitais;
    if (sinaisVitais && sinaisVitais.length > 0) {
      atualizarSinaisVitaisUI(sinaisVitais[sinaisVitais.length - 1]);
    } else {
      atualizarSinaisVitaisUI(null);
    }

    // Medicação Ativa — carregada via endpoint de prescrições
    await carregarMedicacaoAtiva(prescricoes);
    carregarExamesECateteres(processo.id);
    carregarOcorrencias(processo.id);
    carregarPlanoDeHoje(processo.id);
  } catch (err) {
    console.error("[KardexUtente]", err);
    alert("Erro de ligação ao servidor.");
  }
}

async function carregarMedicacaoAtiva(prescricoes) {
  const medicacaoContainer = document.querySelector(".medicacao");
  const ativas = prescricoes.filter((p) => p.estado === "ATIVA");

  let contencoes = [];
  try {
    const res = await fetch(
      `http://localhost:8080/api/processes/${processoId}/containments`,
      { headers: _authHeaders() },
    );
    const json = await res.json();
    contencoes = json.success ? (json.data ?? []) : [];
  } catch (err) {
    console.error("[Contenções]", err);
  }

  if (ativas.length === 0 && contencoes.length === 0) {
    medicacaoContainer.innerHTML = `<p class="m-0 italic text-primary/55">Sem medicação ativa registada.</p>`;
    return;
  }

  const htmlAtivas = ativas
    .map((p) => {
      const nomeMed = p.medicamento?.nome ?? "—";
      const doseObj = p.dose;
      const doseValor =
        doseObj && typeof doseObj === "object"
          ? `${doseObj.dose ?? ""} ${formatarUnidade(doseObj.unidadeMedida)}`.trim()
          : (doseObj ?? "—");
      const via = formatarVia(p.medicamento?.viaAdministracao);
      const motivo = p.motivo ?? "";
      const sosBadge = p.sos
        ? `<span class="inline-block bg-[#b45309] text-white rounded-sm px-1.5 py-px text-[10px] font-bold ml-1.5 align-middle">SOS</span>`
        : "";
      return `
      <div class="med-item">
        <div class="med-nome">${escapeHtml(nomeMed)} ${sosBadge}</div>
        <div class="med-info">${escapeHtml(doseValor)} · ${escapeHtml(via)}${motivo ? ` — ${escapeHtml(motivo)}` : ""}</div>
      </div>`;
    })
    .join("");

  const htmlContencoes = contencoes
    .map((c) => {
      const nomeMed = c.medicamento?.nome ?? "Contenção Química";
      const via = formatarVia(c.medicamento?.viaAdministracao ?? c.via);
      const dose = c.dose;
      const doseNum = parseFloat(dose?.dose ?? 0);
      const doseVal = dose
        ? `${doseNum % 1 === 0 ? doseNum : doseNum.toFixed(3).replace(/\.?0+$/, "")} ${formatarUnidade(dose.unidadeMedida)}`
        : "—";
      const hora = (c.data ?? "").split(":").slice(1, 3).join(":");
      return `
      <div class="med-item">
        <div class="med-nome">
          ${escapeHtml(nomeMed)}
          <span class="inline-block ml-1.5 rounded-sm px-1.5 py-px text-[10px] font-bold align-middle" style="background:rgb(120,40,160);color:#fff">CONTENÇÃO</span>
        </div>
        <div class="med-info">${escapeHtml(doseVal)} · ${escapeHtml(via)} · Duração: ${escapeHtml(c.duracao ?? "—")}${hora ? ` · Às ${hora}` : ""}</div>
      </div>`;
    })
    .join("");

  medicacaoContainer.innerHTML = htmlAtivas + htmlContencoes;
}

// ── Alta ──────────────────────────────────────────────────────────────────────

function daralta() {
  const nomeUtente = document.getElementById("nome-utente").innerHTML;
  const processoId = document.getElementById("processo").innerHTML;
  document.getElementById("popup-nome-utente").innerHTML =
    `${nomeUtente}<br>Nº Processo: ${processoId}`;
  document.getElementById("popup-alta").style.display = "flex";
}

// ── Navegação ─────────────────────────────────────────────────────────────────

function mostrarNotas() {
  window.location.href = `medicoNotasClinicas?id=${id}`;
}

function mostrarPlano() {
  window.location.href = `medicoPlanoCuidados?id=${id}`;
}

function mostrarLista() {
  window.location.href = "medicoListaUtentes";
}

function prescrever() {
  window.location.href = `medicoPrescreverMedicamento?id=${id}`;
}

function toggleHistoricoMenu(event) {
  event.stopPropagation();
  document.getElementById("historico-menu").classList.toggle("open");
}

function irParaHistoricoClinico() {
  alert("Funcionalidade em desenvolvimento.");
  document.getElementById("historico-menu").classList.remove("open");
}

function irParaHistoricoIntervencoes() {
  alert("Funcionalidade em desenvolvimento.");
  document.getElementById("historico-menu").classList.remove("open");
}

function irParaHistoricoPrescricoes() {
  window.location.href = `medicoHistoricoPrescricoes?id=${id}`;
}

document.addEventListener("click", () => {
  document.getElementById("historico-menu")?.classList.remove("open");
});

const TIPO_LABEL_REGISTO = {
  EXAME: "Exame",
  MEDICACAO: "Medicação",
  SINAL_VITAL: "Sinais Vitais",
  INCIDENTE: "Incidente",
  CATETER: "Cateter",
  NOTA: "Nota",
  CONTENCAO: "Contenção",
  PRESCRICAO: "Prescrição",
  ALTA: "Alta",
  INTERNAMENTO: "Internamento",
  PLANO_CUIDADOS: "Plano de Cuidados",
  INTERVENCAO: "Intervenção",
};

function _formatarTimestamp(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function carregarRegistosClinicosTabela() {
  const tbody = document.getElementById("registos-tbody");
  if (!tbody || !processoId) return;

  tbody.innerHTML = `<tr><td colspan="3" class="px-3 py-2 italic text-primary/55">A carregar…</td></tr>`;

  try {
    const res = await fetch(
      `http://localhost:8080/api/records/clinic/${processoId}`,
      {
        headers: _authHeaders(),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const registos = json.data ?? [];

    if (registos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="px-3 py-2 italic text-primary/55">Sem registos clínicos.</td></tr>`;
      return;
    }

    const ordenados = registos
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    tbody.innerHTML = ordenados
      .slice(0, 10)
      .map((r) => {
        const tipo = TIPO_LABEL_REGISTO[r.tipo] ?? r.tipo ?? "—";
        const valor = r.detalhes ?? "—";
        const hora = _formatarTimestamp(r.timestamp);
        return `<tr>
        <td class="px-3 py-1.5">${escapeHtml(tipo)}</td>
        <td class="px-3 py-1.5">${escapeHtml(valor)}</td>
        <td class="px-3 py-1.5">${escapeHtml(hora)}</td>
      </tr>`;
      })
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" class="px-3 py-2 italic text-primary/55">Erro ao carregar registos.</td></tr>`;
    console.error("Erro em carregarRegistosClinicosTabela:", err);
  }
}

// ── Inicialização ─────────────────────────────────────────────────────────────

async function iniciar() {
  try {
    const resp = await fetch(
      "../../pages/medico/popups/popUpRegistarAlta.html",
    );
    const html = await resp.text();
    document.getElementById("popup-container").innerHTML = html;
    document
      .getElementById("form-alta")
      .addEventListener("submit", submeterAlta);
  } catch (err) {
    console.error("[Popup Alta]", err);
  }
  await carregarUtente(id);
  carregarRegistosClinicosTabela();
}

iniciar();

// ── Exames e Cateteres ───────────────────────────────────────────────────────

async function carregarExamesECateteres(processId) {
  const container = document.querySelector(".exames-cateteres");
  if (!container) return;
  try {
    const [resEx, resCat] = await Promise.allSettled([
      fetch(`http://localhost:8080/api/processes/${processId}/exams`, {
        headers: _authHeaders(),
      }),
      fetch(`http://localhost:8080/api/processes/${processId}/cateteres`, {
        headers: _authHeaders(),
      }),
    ]);

    let exames = [];
    let cateteres = [];

    if (resEx.status === "fulfilled" && resEx.value.ok) {
      const json = await resEx.value.json();
      exames = json.data ?? [];
    }
    if (resCat.status === "fulfilled" && resCat.value.ok) {
      const json = await resCat.value.json();
      cateteres = json.data ?? [];
    }

    const partes = [];
    if (exames.length > 0) {
      partes.push(`<div class="ec-section-title">Exames</div>`);
      partes.push(
        exames
          .slice(0, 3)
          .map((e) => {
            const tipo = e.tipo ?? "Exame";
            const data = e.dataPretendida ?? e.data;
            const medico =
              e.medico?.dados?.nome ?? e.medicoSolicitante?.dados?.nome;
            const linhas = [];
            if (data) linhas.push(`Pedido a ${escapeHtml(data)}`);
            if (medico) linhas.push(escapeHtml(medico));
            const sub = linhas.join(" — ");
            return `<div class="ec-item"><div class="ec-nome">${escapeHtml(tipo)}</div>${sub ? `<div class="ec-info">${sub}</div>` : ""}</div>`;
          })
          .join(""),
      );
    }
    if (cateteres.length > 0) {
      partes.push(`<div class="ec-section-title mt-2">Cateteres</div>`);
      partes.push(
        cateteres
          .slice(0, 3)
          .map((c) => {
            const tipo = c.tipo ?? "Cateter";
            const local = c.localInsercao ?? c.local;
            const calibre = c.calibre;
            const dataIns = c.dataInsercao ?? c.data;
            const linhas = [];
            if (dataIns) linhas.push(`Inserido ${escapeHtml(dataIns)}`);
            if (calibre) linhas.push(`Calibre ${escapeHtml(calibre)}`);
            const sub = linhas.join(" · ");
            return `<div class="ec-item"><div class="ec-nome">${escapeHtml(tipo)}${local ? " — " + escapeHtml(local) : ""}</div>${sub ? `<div class="ec-info">${sub}</div>` : ""}</div>`;
          })
          .join(""),
      );
    }

    if (partes.length === 0) {
      container.innerHTML = `<p class="m-0 italic text-primary/55">Sem exames ou cateteres registados.</p>`;
      return;
    }
    container.innerHTML = partes.join("");
  } catch (err) {
    console.error("[Exames/Cateteres]", err);
    container.innerHTML = `<p class="m-0 italic text-primary/55">Erro ao carregar.</p>`;
  }
}

// ── Ocorrências de Hoje ──────────────────────────────────────────────────────

async function carregarOcorrencias(processId) {
  const container = document.querySelector(".ocorrencias");
  if (!container) return;
  try {
    const res = await fetch(
      `http://localhost:8080/api/processes/${processId}/incidents`,
      { headers: _authHeaders() },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const incidentes = json.data ?? [];

    if (incidentes.length === 0) {
      container.innerHTML = `<p class="m-0 italic text-primary/55">Sem ocorrências registadas.</p>`;
      return;
    }

    container.innerHTML = incidentes
      .slice(0, 5)
      .map((i) => {
        const hora =
          String(i.data ?? "")
            .split(":")
            .slice(1, 3)
            .join(":") || "—";
        const enf =
          i.enfermeiro?.dados?.nome ?? i.funcionario?.dados?.nome ?? "—";
        const tipo = i.tipo ?? "Incidente";
        const desc = i.descricao ?? "—";
        return `<div class="oc-item">
        <div class="oc-head">${escapeHtml(hora)} · ${escapeHtml(enf)}</div>
        <div class="oc-info">${escapeHtml(tipo)} — ${escapeHtml(desc)}</div>
      </div>`;
      })
      .join("");
  } catch (err) {
    console.error("[Ocorrências]", err);
    container.innerHTML = `<p class="m-0 italic text-primary/55">Erro ao carregar ocorrências.</p>`;
  }
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Sinais Vitais ────────────────────────────────────────────────────────────

function atualizarSinaisVitaisUI(sv) {
  const tensao = document.getElementById("sv-tensao");
  const freq = document.getElementById("sv-freq-card");
  const temp = document.getElementById("sv-temperatura");
  const spo2 = document.getElementById("sv-spo2");
  const dor = document.getElementById("sv-dor");
  const gli = document.getElementById("sv-glicemia");

  if (!sv) {
    [tensao, freq, temp, spo2, dor, gli].forEach((el) => {
      if (el) el.innerHTML = "—";
    });
    return;
  }
  if (tensao)
    tensao.innerHTML = `${sv.tensaoArteriaSistolica}/${sv.tensaoArteriaDistolica}<br><small style="font-size:11px">mmHg</small>`;
  if (freq)
    freq.innerHTML = `${sv.frequenciaCardiaca}<br><small style="font-size:11px">bpm</small>`;
  if (temp)
    temp.innerHTML = `${sv.temperatura}<br><small style="font-size:11px">°C</small>`;
  if (spo2)
    spo2.innerHTML = `${sv.spo2}<br><small style="font-size:11px">%</small>`;
  if (dor) dor.textContent = sv.dor;
  if (gli)
    gli.innerHTML = `${sv.glicemia}<br><small style="font-size:11px">mg/dL</small>`;
}

// ── Plano de Cuidados Hoje ───────────────────────────────────────────────────

async function carregarPlanoDeHoje(processId) {
  const body = document.getElementById("plano-cuidados-body");
  if (!body) return;

  const frequenciaLabel = {
    CONTINUA: "Contínua",
    CONTINUO: "Contínua",
    DIARIA: "Diária",
    BD: "2x/dia",
    TID: "3x/dia",
    QID: "4x/dia",
    SOS: "SOS",
    SEMANAL: "Semanal",
    UMA_VEZ: "Uma vez",
    DUAS_VEZES: "Duas vezes",
    TRES_VEZES: "Três vezes",
    DIA_1: "1x/dia",
    DIA_2: "2x/dia",
    DIA_3: "3x/dia",
    DIA_4: "4x/dia",
    DIA_5: "5x/dia",
    DIA_6: "6x/dia",
    H_2: "De 2 em 2 horas",
    H_4: "De 4 em 4 horas",
    "1_DIA": "1x/dia",
    "2_DIA": "2x/dia",
    "3_DIA": "3x/dia",
    "4_DIA": "4x/dia",
    "6_DIA": "6x/dia",
    "2H": "De 2 em 2 horas",
    "4H": "De 4 em 4 horas",
  };
  const intervencaoLabel = {
    VIGILANCIA_CONTINUA: "Vigilância contínua",
    VIGILANCIA_1_1: "Vigilância 1:1",
    ADMINISTRACAO_MEDICACAO: "Administração de Medicação",
    AVALIACAO_SINAIS_VITAIS: "Avaliação de Sinais Vitais",
    CUIDADOS_HIGIENE: "Cuidados de Higiene",
    CONTENCAO_VERBAL: "Contenção verbal",
    APOIO_EMOCIONAL: "Apoio emocional",
    RELACAO_TERAPEUTICA: "Estabelecer relação terapêutica",
    ATIVIDADES_ESTRUTURADAS: "Promover atividades estruturadas",
    EDUCAR_MEDICACAO: "Educar sobre medicação",
    MONITORIZAR_VITAIS: "Monitorizar sinais vitais",
    AVALIAR_HUMOR_RISCO: "Avaliar humor / risco",
    MONITORIZAR_ALIMENTACAO: "Monitorizar ingestão alimentar",
    HIGIENE_SONO: "Promover higiene do sono",
    OUTRO: "Outro",
  };
  const prioridadeConfig = {
    CRITICA: { cor: "#c62828", texto: "Crítica" },
    ALTA: { cor: "rgb(220,49,26)", texto: "Alta" },
    MEDIA: { cor: "#e65100", texto: "Média" },
    BAIXA: { cor: "#2e7d32", texto: "Baixa" },
  };
  const humanize = (s) => {
    if (!s) return "—";
    const lower = String(s).toLowerCase().replace(/_/g, " ");
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processId}/plan`,
      { headers: _authHeaders() },
    );
    if (!resp.ok) {
      body.innerHTML = `<p class="m-0 italic text-primary/55 text-[13px]">Sem plano de cuidados ativo.</p>`;
      return;
    }
    const json = await resp.json();
    const intervencoes = json.data?.intervencoes ?? [];
    if (intervencoes.length === 0) {
      body.innerHTML = `<p class="m-0 italic text-primary/55 text-[13px]">Sem intervenções para hoje.</p>`;
      return;
    }

    body.innerHTML = intervencoes
      .map((inv) => {
        const feita = inv.funcionarioExecutou != null;
        const prio = prioridadeConfig[inv.prioridade] ?? {
          cor: "#666",
          texto: inv.prioridade ?? "—",
        };
        const freq = frequenciaLabel[inv.frequencia] ?? inv.frequencia ?? "—";
        const nome =
          intervencaoLabel[inv.intervencao] ?? humanize(inv.intervencao);
        const textoRiscado = feita ? "line-through opacity-55" : "";
        return `
        <div class="flex items-start justify-between gap-3 px-2.5 py-2 border-b border-primary/15 last:border-0 text-[13px]">
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-primary ${textoRiscado}">
              ${escapeHtml(nome)}
              <span class="inline-block ml-1.5 text-white text-[10px] font-bold px-1.5 py-px rounded-sm align-middle" style="background:${prio.cor}">${escapeHtml(prio.texto)}</span>
            </div>
            <div class="text-primary/70 text-[12px] mt-0.5">
              ${escapeHtml(freq)}${inv.horarioPrevisto ? ` · ${escapeHtml(inv.horarioPrevisto)}` : ""}${inv.objetivo ? ` · Obj: ${escapeHtml(inv.objetivo)}` : ""}
            </div>
          </div>
          <input type="checkbox" disabled ${feita ? "checked" : ""} title="Apenas leitura" class="mt-1 w-4 h-4 shrink-0 cursor-not-allowed accent-primary" />
        </div>`;
      })
      .join("");
  } catch (err) {
    console.error("[Plano de Cuidados]", err);
    body.innerHTML = `<p class="m-0 italic text-primary/55 text-[13px]">Erro ao carregar plano de cuidados.</p>`;
  }
}

/**
 * Aceita "dd/MM/yyyy:HH:mm:ss" (formato do backend) ou ISO. Devolve nº de dias
 * desde a data de entrada até hoje, ou null se a string não for parseável.
 */
function _calcularDiasInternado(dataEntrada) {
  if (!dataEntrada) return null;
  const m = String(dataEntrada).match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?::(\d{2}):(\d{2}):(\d{2}))?/,
  );
  let d;
  if (m) {
    d = new Date(
      parseInt(m[3], 10),
      parseInt(m[2], 10) - 1,
      parseInt(m[1], 10),
      parseInt(m[4] ?? "0", 10),
      parseInt(m[5] ?? "0", 10),
    );
  } else {
    d = new Date(dataEntrada);
  }
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}
