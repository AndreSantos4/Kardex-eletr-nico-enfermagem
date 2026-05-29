/* =============================================================
 *  Kardex do Utente - Enfermeiro Chefe (read-only)
 *
 *  Reaproveita a estrutura visual do enfermeiroKardexUtente.html mas só
 *  inclui o que o chefe precisa: visualizar dados (sinais vitais,
 *  prescrições, exames/cateteres, ocorrências, plano), histórico de
 *  internamentos, notas clínicas, editar ficha. Sem registar/administrar.
 * ============================================================= */

const API = "http://localhost:8080/api";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let processoId = null;
let utenteData = null;
let processoData = null;
let medicoData = null;
let caseData = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function formatarUnidade(u) {
  if (!u) return "";
  const map = {
    MILIGRAMAS: "mg",
    GRAMAS: "g",
    MICROGRAMAS: "mcg",
    MILILITROS: "ml",
    UNIDADES: "U",
    COMPRIMIDOS: "cp",
  };
  return map[u] ?? u.toLowerCase();
}

function formatarDataHoraExibir(raw) {
  if (!raw) return "—";
  const partes = raw.split(":");
  return `${partes[0]} ${partes[1]}:${partes[2]}`;
}

function calcularDiasAtivo(dataInsercao) {
  if (!dataInsercao) return 0;
  try {
    const [diaMes] = dataInsercao.split(":");
    const [dia, mes, ano] = diaMes.split("/");
    return Math.floor((new Date() - new Date(ano, mes - 1, dia)) / 86400000);
  } catch (_) {
    return 0;
  }
}

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

// ─── Navegação ───────────────────────────────────────────────────────────────

function abrirPaginaPlano() {
  window.location.href = `enfermeiroChefePlanoCuidados?id=${id}`;
}

function irParaHistoricoPrescricoes() {
  window.location.href = `enfermeiroChefeHistoricoPrescricoes?id=${id}`;
}

// ─── Popups (lazy-load) ──────────────────────────────────────────────────────

async function carregarPopUp(caminho) {
  const container = document.getElementById("popup-container");
  if (container.querySelector(`[data-popup="${caminho}"]`)) return;
  const resp = await fetch(caminho);
  const html = await resp.text();
  const wrapper = document.createElement("div");
  wrapper.dataset.popup = caminho;
  wrapper.innerHTML = html;
  container.appendChild(wrapper);
}

function abrirPopUp(seletor) {
  const el = document.querySelector(seletor);
  if (el) el.style.display = "flex";
}

function fecharPopUp(seletor) {
  const el = document.querySelector(seletor);
  if (el) el.style.display = "none";
}

// ─── Carregamento do utente ──────────────────────────────────────────────────

async function carregarUtente(id) {
  try {
    const resp = await fetch(`${API}/patients/${id}`, {
      headers: _authHeaders(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const dados = json?.data?.dados;
    if (!dados) throw new Error("Estrutura inesperada: dados ausentes");
    const processo = dados.processo;
    if (!processo) throw new Error("Estrutura inesperada: processo ausente");

    processoId = processo.id;
    utenteData = {
      nome: dados.nome,
      sexo: dados.sexo,
      dataNascimento: dados.dataNascimento,
      alergias: dados.alergias ?? [],
      flags: dados.flags ?? [],
    };
    processoData = {
      id: processo.id,
      dataEntrada: processo.dataEntrada,
      diagnosticoPrincipal: processo.diagnosticoPrincipal,
      sinaisVitais: processo.sinaisVitais ?? [],
      prescricoes: processo.prescricoes ?? [],
    };
    medicoData = {
      id: processo.medicoResponsavel?.id ?? null,
      nome: processo.medicoResponsavel?.dados?.nome ?? "Sem médico",
    };
    caseData = { cama: processo.cama?.id ?? "Não atribuído" };

    const dias = _calcularDiasInternado(processo.dataEntrada) ?? 0;

    document.getElementById("header-title").textContent =
      `Kardex - ${utenteData.nome}`;
    document.getElementById("header-sub").textContent =
      `Proc. ${processoData.id} · Cama ${caseData.cama} · ${processoData.diagnosticoPrincipal} · ${dias} dia(s) Internado`;
    document.getElementById("utente-nome").textContent = utenteData.nome;
    document.getElementById("sexo-idade").textContent =
      `${utenteData.sexo} · ${utenteData.dataNascimento}`;
    document.getElementById("admissao").textContent = processoData.dataEntrada;
    document.getElementById("medico").textContent = medicoData.nome;
    document.getElementById("proc-nasc").textContent =
      `${processoData.id} · Nasc. ${utenteData.dataNascimento}`;
    document.getElementById("cama").textContent = caseData.cama;
    document.getElementById("estado").textContent = `Internado · Dia ${dias}`;
    document.getElementById("diagnostico").textContent =
      processoData.diagnosticoPrincipal;

    const riscos = utenteData.flags.map((r) => {
      const t = r.replace("RISCO_", "").toLowerCase();
      return t.charAt(0).toUpperCase() + t.slice(1);
    });
    document.getElementById("riscos").textContent = riscos.length
      ? `Riscos: ${riscos.join(" | ")}`
      : "";

    document.getElementById("alergias-list").innerHTML = utenteData.alergias
      .map((a) => `<div>${typeof a === "string" ? a : a.nome}</div>`)
      .join("");

    const svs = processoData.sinaisVitais;
    if (svs?.length > 0) atualizarSinaisVitaisUI(svs[svs.length - 1]);

    await renderizarMedicacaoAtiva(processoData.prescricoes);
    await Promise.all([
      carregarOcorrencias(),
      carregarExamesECateteres(),
      carregarPlanoDeHoje(),
    ]);
  } catch (err) {
    console.error("Erro em carregarUtente:", err);
  }
}

// ─── Sinais Vitais ───────────────────────────────────────────────────────────

function atualizarSinaisVitaisUI(sv) {
  document.getElementById("sv-tensao").innerHTML =
    `${sv.tensaoArteriaSistolica}/${sv.tensaoArteriaDistolica}<br><small style="font-size:11px">mmHg</small>`;
  document.getElementById("sv-freq-card").innerHTML =
    `${sv.frequenciaCardiaca}<br><small style="font-size:11px">bpm</small>`;
  document.getElementById("sv-temperatura").innerHTML =
    `${sv.temperatura}<br><small style="font-size:11px">°C</small>`;
  document.getElementById("sv-spo2").innerHTML =
    `${sv.spo2}<br><small style="font-size:11px">%</small>`;
  document.getElementById("sv-dor").textContent = sv.dor;
  document.getElementById("sv-glicemia").innerHTML =
    `${sv.glicemia}<br><small style="font-size:11px">mg/dL</small>`;
}

// ─── Medicação Ativa (read-only, sem botão "ADMINISTRAR") ────────────────────

async function renderizarMedicacaoAtiva(prescricoes) {
  const body = document.getElementById("medicacao-body");
  body.innerHTML = "";

  const ativas = (prescricoes ?? []).filter((p) => p.estado === "ATIVA");

  let contencoes = [];
  try {
    const res = await fetch(`${API}/processes/${processoId}/containments`, {
      headers: _authHeaders(),
    });
    const json = await res.json();
    contencoes = json.success ? (json.data ?? []) : [];
  } catch (err) {
    console.error("Erro ao carregar contenções:", err);
  }

  if (ativas.length === 0 && contencoes.length === 0) {
    body.innerHTML =
      "<p style='color:var(--surface);font-size:13px'>Sem medicação ativa.</p>";
    return;
  }

  ativas.forEach((p) => {
    const nomeMed = p.medicamento?.nome ?? "Medicamento";
    const doseVal = p.dose
      ? `${p.dose.dose} ${formatarUnidade(p.dose.unidadeMedida)}`
      : "—";
    const via = p.medicamento?.viaAdministracao ?? "—";
    const freq = p.frequencia
      ? `${p.frequencia.frequencia}x/${p.frequencia.periodo.toLowerCase()}`
      : "—";
    const fim = p.fim ?? "—";
    const altoRisco =
      (p.medicamento?.altoRisco ?? false) || (p.altoRisco ?? false);
    const badgeAltoRisco = altoRisco
      ? `<span style="display:inline-block;margin-left:6px;background:rgb(220,49,26);color:#fff;font-size:10px;font-weight:700;letter-spacing:.5px;padding:1px 5px;border-radius:3px;vertical-align:middle;">ALTO RISCO</span>`
      : "";

    const row = document.createElement("div");
    row.style.cssText =
      "padding:8px 10px;border-bottom:1px solid var(--border);font-size:13px;";
    row.innerHTML = `
            <div style="font-weight:600;color:var(--surface)">${nomeMed}${badgeAltoRisco}</div>
            <div style="color:var(--surface);margin-top:2px">${doseVal} · ${freq} · Via: ${via}</div>
            <div style="color:var(--surface);font-size:11px">Até ${fim}</div>
        `;
    body.appendChild(row);
  });

  contencoes.forEach((c) => {
    const nomeMed = c.medicamento?.nome ?? "Contenção Química";
    const via = c.medicamento?.viaAdministracao ?? "—";
    const dose = c.dose;
    const doseNum = parseFloat(dose?.dose ?? 0);
    const doseVal = dose
      ? `${doseNum % 1 === 0 ? doseNum : doseNum.toFixed(3).replace(/\.?0+$/, "")} ${formatarUnidade(dose.unidadeMedida)}`
      : "—";
    const hora = (c.data ?? "").split(":").slice(1, 3).join(":");

    const row = document.createElement("div");
    row.style.cssText =
      "padding:8px 10px;border-bottom:1px solid var(--border);font-size:13px;";
    row.innerHTML = `
            <div style="font-weight:600;color:var(--surface)">
                ${nomeMed}
                <span style="display:inline-block;margin-left:6px;background:rgb(120,40,160);color:#fff;font-size:10px;font-weight:700;letter-spacing:.5px;padding:1px 5px;border-radius:3px;vertical-align:middle;">CONTENÇÃO</span>
            </div>
            <div style="color:var(--surface);margin-top:2px">${doseVal} · Via: ${via} · Duração: ${c.duracao ?? "—"}</div>
            <div style="color:var(--surface);font-size:11px">${c.justificao ?? c.justificacao ?? "—"}${hora ? ` · Às ${hora}` : ""}</div>
        `;
    body.appendChild(row);
  });
}

// ─── Ocorrências (read-only, sem botão "REGISTAR") ───────────────────────────

async function carregarOcorrencias() {
  const body = document.getElementById("ocorrencias-body");
  body.innerHTML = "";

  const gravidadeLabel = {
    LIGEIRA: { texto: "Ligeira", cor: "#2e7d32" },
    MODERADA: { texto: "Moderada", cor: "#e65100" },
    GRAVE: { texto: "Grave", cor: "#c62828" },
    CRITICA: { texto: "Crítica", cor: "#6a1a1a" },
  };
  const tipoLabel = {
    QUEDA: "Queda",
    ERRO_MEDICACAO: "Erro de medicação",
    REACAO_ADVERSA: "Reação adversa",
    INFECAO: "Infeção nosocomial",
    LESAO_PRESSAO: "Lesão por pressão",
    EXTRAVASAMENTO: "Extravasamento",
    AGITACAO: "Agitação psicomotora",
    OUTRO: "Outro",
  };

  try {
    const resp = await fetch(`${API}/processes/${processoId}/incidents`, {
      headers: _authHeaders(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const ocorrencias = json.data ?? [];

    if (ocorrencias.length === 0) {
      body.innerHTML =
        "<p style='color:var(--surface);font-size:13px'>Sem ocorrências registadas.</p>";
      return;
    }

    ocorrencias.forEach((o) => {
      const gravidade = gravidadeLabel[o.gravidade] ?? {
        texto: o.gravidade,
        cor: "var(--surface)",
      };
      const tipo = tipoLabel[o.tipo] ?? o.tipo;
      const hora = (o.data ?? "").split(":").slice(1, 3).join(":");
      const row = document.createElement("div");
      row.style.cssText =
        "padding:8px 10px;border-bottom:1px solid var(--border);font-size:13px;";
      row.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <span style="font-weight:600;color:var(--surface)">${tipo}</span>
                    <span style="font-size:11px;font-weight:700;padding:2px 7px;border-radius:3px;background:${gravidade.cor};color:#fff;">${gravidade.texto.toUpperCase()}</span>
                </div>
                <div style="color:var(--surface);margin-top:3px;font-size:12px">${o.descricao ?? "—"}</div>
                <div style="color:var(--surface);font-size:11px;margin-top:2px">${hora ? `Às ${hora}` : ""}</div>
            `;
      body.appendChild(row);
    });
  } catch (err) {
    body.innerHTML =
      "<p style='color:var(--surface);font-size:13px'>Erro ao carregar ocorrências.</p>";
    console.error("Erro em carregarOcorrencias:", err);
  }
}

// ─── Exames e Cateteres ──────────────────────────────────────────────────────

async function carregarExamesECateteres() {
  const body = document.getElementById("exames-body");
  body.innerHTML = "";

  const tipoLabel = {
    VENOSO_PERIFERICO: "Cateter venenoso periférico",
    VENOSO_CENTRAL: "Cateter venenoso central",
    PICC: "PICC",
    PORT_A_CATH: "Port a cath",
    HEMODIALISE: "Cateter hemodiálise",
    DUPLO_J: "Cateter duplo J",
    URINARIO: "Cateter urinário",
    NASAL: "Cateter nasal",
  };

  try {
    const resp = await fetch(`${API}/processes/${processoId}/cateteres`, {
      headers: _authHeaders(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const cateteres = json.data ?? [];

    if (cateteres.length === 0) {
      body.innerHTML =
        "<p style='color:var(--surface);font-size:13px'>Sem cateteres ativos.</p>";
      return;
    }
    cateteres.forEach((c) => {
      const tipo = tipoLabel[c.tipo] ?? c.tipo;
      const diasAtivo = calcularDiasAtivo(c.dataInsercao);
      const alertaSubst = diasAtivo >= 3;
      const row = document.createElement("div");
      row.style.cssText =
        "padding:8px 10px;border-bottom:1px solid var(--border);font-size:13px;";
      row.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <span style="font-weight:600;color:var(--surface)">${tipo} · ${c.calibre ?? "—"}</span>
                    ${alertaSubst ? `<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgb(220,49,26);color:#fff;">SUBSTITUIÇÃO</span>` : ""}
                </div>
                <div style="color:var(--surface);margin-top:2px">${c.localInsercao ?? "—"}</div>
                <div style="color:var(--surface);font-size:11px;margin-top:2px">
                    Inserido: ${formatarDataHoraExibir(c.dataInsercao)} · Prev. substituição: ${formatarDataHoraExibir(c.dataSubstituicao)}
                </div>
                ${c.observacoes ? `<div style="color:var(--surface);font-size:11px;margin-top:2px">${c.observacoes}</div>` : ""}
            `;
      body.appendChild(row);
    });
  } catch (err) {
    body.innerHTML =
      "<p style='color:var(--surface);font-size:13px'>Erro ao carregar cateteres.</p>";
    console.error("Erro em carregarExamesECateteres:", err);
  }
}

// ─── Plano de Cuidados (read-only, checkboxes desativadas) ───────────────────

async function carregarPlanoDeHoje() {
  const body = document.getElementById("plano-cuidados-body");
  body.innerHTML = "";

  const frequenciaLabel = {
    CONTINUA: "Contínua",
    CONTINUO: "Contínua",
    DIARIA: "Diária",
    BD: "2x/dia",
    TID: "3x/dia",
    QID: "4x/dia",
    SOS: "SOS",
    SEMANAL: "Semanal",
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
    const resp = await fetch(`${API}/processes/${processoId}/plan`, {
      headers: _authHeaders(),
    });
    if (!resp.ok) {
      body.innerHTML =
        "<p style='color:var(--surface);font-size:13px'>Sem plano de cuidados ativo.</p>";
      return;
    }
    const json = await resp.json();
    const intervencoes = json.data?.intervencoes ?? [];
    if (intervencoes.length === 0) {
      body.innerHTML =
        "<p style='color:var(--surface);font-size:13px'>Sem intervenções para hoje.</p>";
      return;
    }

    intervencoes.forEach((inv) => {
      const feita = inv.funcionarioExecutou != null;
      const prio = prioridadeConfig[inv.prioridade] ?? {
        cor: "#666",
        texto: inv.prioridade ?? "—",
      };
      const freq = frequenciaLabel[inv.frequencia] ?? inv.frequencia ?? "—";
      const nome =
        intervencaoLabel[inv.intervencao] ?? humanize(inv.intervencao);
      const textoRiscado = feita
        ? "text-decoration:line-through;opacity:0.55;"
        : "";

      const row = document.createElement("div");
      row.style.cssText =
        "display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:8px 10px;border-bottom:1px solid var(--border);font-size:13px;";
      row.innerHTML = `
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;color:var(--surface);${textoRiscado}">
                        ${nome}
                        <span style="display:inline-block;margin-left:6px;background:${prio.cor};color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px;vertical-align:middle;">${prio.texto}</span>
                    </div>
                    <div style="color:var(--surface);margin-top:3px;font-size:12px;">
                        ${freq}${inv.horarioPrevisto ? ` · ${inv.horarioPrevisto}` : ""}${inv.objetivo ? ` · Obj: ${inv.objetivo}` : ""}
                    </div>
                </div>
                <input type="checkbox" disabled style="margin-top:3px;width:16px;height:16px;flex-shrink:0;accent-color:#1565c0;cursor:not-allowed;" ${feita ? "checked" : ""} title="Apenas leitura" />
            `;
      body.appendChild(row);
    });
  } catch (err) {
    body.innerHTML =
      "<p style='color:var(--surface);font-size:13px'>Erro ao carregar plano de cuidados.</p>";
    console.error("Erro em carregarPlanoDeHoje:", err);
  }
}

// ─── Popup: Notas Clínicas (read-only) ───────────────────────────────────────

async function abrirPopUpNotasClinicas() {
  await carregarPopUp("../../pages/enfermeiro/popups/popupNotasClinicas.html");

  const popupUtente = document.getElementById("popup-notas-utente");
  if (popupUtente) popupUtente.textContent = utenteData?.nome || "—";
  const container = document.getElementById("popup-notas-lista");
  if (container)
    container.innerHTML =
      '<div class="popup-nota-empty">A carregar notas…</div>';
  abrirPopUp(".popup-notas-overlay");

  try {
    const res = await fetch(`${API}/processes/${processoId}/notes`, {
      headers: _authHeaders(),
    });
    if (!res.ok) {
      renderizarNotasClinicas([]);
      return;
    }
    const json = await res.json();
    renderizarNotasClinicas(json.success ? (json.data ?? []) : []);
  } catch (err) {
    console.error("[Notas] Erro:", err);
    renderizarNotasClinicas([]);
  }
}

function fecharPopupNotasClinicas() {
  fecharPopUp(".popup-notas-overlay");
}

function renderizarNotasClinicas(lista) {
  const container = document.getElementById("popup-notas-lista");
  if (!container) return;
  if (!lista || lista.length === 0) {
    container.innerHTML =
      '<div class="popup-nota-empty">Sem notas de evolução registadas.</div>';
    return;
  }
  const _parse = (s) => {
    const m = String(s ?? "").match(
      /^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2})/,
    );
    return m ? new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]).getTime() : 0;
  };
  const _fmt = (s) => {
    const m = String(s ?? "").match(
      /^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2})/,
    );
    return m ? `${m[1]}/${m[2]}/${m[3]} - ${m[4]}:${m[5]}` : (s ?? "—");
  };
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const ordenadas = lista
    .slice()
    .sort((a, b) => _parse(b.data) - _parse(a.data));
  container.innerHTML = ordenadas
    .map((n) => {
      const nomeMedico = n.medico?.dados?.nome ?? "—";
      return `<div class="popup-nota-item">
            <div class="popup-nota-header">${esc(nomeMedico)} <span class="popup-nota-meta">- ${esc(_fmt(n.data))}</span></div>
            <div class="popup-nota-texto">${esc(n.justificacaoClinica ?? "")}</div>
        </div>`;
    })
    .join("");
}

// ─── Popup: Histórico de Internamentos ───────────────────────────────────────

async function abrirPopupHistInternamentos() {
  if (!id) return;
  await carregarPopUp(
    "../../pages/enfermeiro/popups/popupHistoricoInternamentos.html",
  );
  const overlay = document.querySelector(".popup-hist-internamentos-overlay");
  if (!overlay) return;

  const tituloEl = document.getElementById("popup-hist-utente");
  if (tituloEl) tituloEl.textContent = utenteData?.nome || "—";
  _renderHistInternamentos(null);
  overlay.style.display = "flex";

  try {
    const res = await fetch(`${API}/patients/${id}/history`, {
      headers: _authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    _renderHistInternamentos(json.success ? (json.data ?? []) : []);
  } catch (err) {
    console.error("[Hist. Internamentos] Erro:", err);
    _renderHistInternamentos([]);
  }
}

function fecharPopupHistInternamentos() {
  fecharPopUp(".popup-hist-internamentos-overlay");
}

function _renderHistInternamentos(lista) {
  const container = document.getElementById("popup-hist-lista");
  if (!container) return;
  if (lista === null) {
    container.innerHTML =
      '<div class="text-center py-7 px-4 text-white/70 italic">A carregar internamentos…</div>';
    return;
  }
  if (!lista.length) {
    container.innerHTML =
      '<div class="text-center py-7 px-4 text-white/70 italic">Sem internamentos registados.</div>';
    return;
  }
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const ordenados = lista.slice().sort((a, b) => {
    const ativoA = !a.dataAlta && !a.alta;
    const ativoB = !b.dataAlta && !b.alta;
    if (ativoA && !ativoB) return -1;
    if (ativoB && !ativoA) return 1;
    const da = _calcularDiasInternado(a.dataEntrada);
    const db = _calcularDiasInternado(b.dataEntrada);
    return (da ?? 0) - (db ?? 0);
  });

  container.innerHTML = ordenados
    .map((i) => {
      const ativo = !i.dataAlta && i.alta !== true;
      const estado = ativo ? "Ativo" : "Alta";
      const corEstado = ativo ? "text-green-300" : "text-white/65";
      const entrada = (i.dataEntrada ?? "").substring(0, 10) || "—";
      const saida = i.dataAlta ? i.dataAlta.substring(0, 10) : null;
      const dias = _calcularDiasInternado(i.dataEntrada);
      const periodo = ativo
        ? `${entrada} → presente`
        : `${entrada} → ${saida ?? "—"}${dias != null ? ` (${dias} dias)` : ""}`;
      const motivo = i.motivoInternamento ?? i.diagnosticoPrincipal ?? "—";
      const medico = i.medicoResponsavel?.dados?.nome ?? "—";
      const titulo = ativo
        ? `Internamento atual - ${i.id ?? "—"}`
        : `Internamento anterior · ${i.id ?? "—"}`;
      return `<div class="bg-white rounded-full px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
            <div class="min-w-0 flex-1">
                <div class="text-bg-dark text-[13.5px] font-bold leading-tight truncate">${esc(titulo)}</div>
                <div class="text-bg-dark/75 text-[12px] mt-0.5 truncate">${esc(periodo)} · Motivo: ${esc(motivo)}${medico !== "—" ? " · " + esc(medico) : ""}</div>
            </div>
            <span class="${corEstado} text-[13px] font-bold whitespace-nowrap">${estado}</span>
        </div>`;
    })
    .join("");
}

// ─── Popup: Editar Ficha Utente ──────────────────────────────────────────────

async function abrirPopUpEditarFichaUtente() {
  await carregarPopUp(
    "../../pages/enfermeiro/popups/popupEditarFichaUtente.html",
  );
  if (!utenteData) return;
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };
  set("edit-name", utenteData.nome);
  set("edit-data-nascimento", _toISO(utenteData.dataNascimento));
  set("edit-sexo", utenteData.sexo);
  set("edit-n-identificacao", utenteData.numeroCC);
  set("edit-n-sns", utenteData.numeroSNS);
  set("edit-contacto", utenteData.contacto);
  set("edit-contacto-emg", utenteData.contactoEmergencia);
  abrirPopUp(".pop-up-editar-utente");
}

function _toISO(ddmmaaaa) {
  if (!ddmmaaaa) return "";
  const [d, m, a] = ddmmaaaa.split("/");
  return d && m && a ? `${a}-${m}-${d}` : "";
}

// ─── Últimos Registos Clínicos ────────────────────────────────────────────────

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
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="3" style="padding:8px;color:var(--surface);font-size:13px;font-style:italic">A carregar…</td></tr>`;

  try {
    const res = await fetch(`${API}/records/clinic/${processoId}`, {
      headers: _authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const registos = json.data ?? [];

    if (registos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="padding:8px;color:var(--surface);font-size:13px;font-style:italic">Sem registos clínicos.</td></tr>`;
      return;
    }

    const ordenados = registos
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    tbody.innerHTML = ordenados
      .slice(0, 10)
      .map((r) => {
        const tipo = TIPO_LABEL_REGISTO[r.tipo] ?? r.tipo ?? "—";
        const valor = r.detalhes ?? "—";
        const hora = _formatarTimestamp(r.timestamp);
        return `<tr>
        <td>${esc(tipo)}</td>
        <td>${esc(valor)}</td>
        <td>${esc(hora)}</td>
      </tr>`;
      })
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" style="padding:8px;color:var(--surface);font-size:13px;font-style:italic">Erro ao carregar registos.</td></tr>`;
    console.error("Erro em carregarRegistosClinicosTabela:", err);
  }
}

// ─── Arranque ────────────────────────────────────────────────────────────────

if (id) {
  carregarUtente(id).then(() => carregarRegistosClinicosTabela());
} else {
  console.warn("[Kardex Chefe] ID em falta na URL");
}
