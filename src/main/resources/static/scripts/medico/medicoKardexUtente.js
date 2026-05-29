const params = new URLSearchParams(window.location.search);
const id = params.get("id");

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
    const resp = await fetch(`/api/patients/${id}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();

    const dados = json.data.dados;
    const processo = dados.processo;

    // Page header title + subtitle
    document.getElementById("page-title").textContent =
      `Kardex - ${dados.nome}`;
    // Backend devolve "dd/MM/yyyy:HH:mm:ss" — o ano vinha colado à hora (NaN).
    const diasInternado = _calcularDiasInternado(processo.dataEntrada) ?? 0;
    document.getElementById("page-subtitle").textContent =
      `Proc. ${processo.id} · Cama ${processo.cama?.id ?? "—"} · ${processo.diagnosticoPrincipal ?? "—"} · ${diasInternado} dia(s) internado`;

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
      processo.cama == null ? "Sem cama" : processo.cama.id;
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
    const svGrid = document.querySelector(".sinais-vitais");
    const svBar = document.querySelector(".sinais-vitais-bar");

    if (sinaisVitais && sinaisVitais.length > 0) {
      const sv = sinaisVitais[sinaisVitais.length - 1];
      document.getElementById("tensao-art").innerHTML =
        `${sv.tensaoArteriaSistolica}/${sv.tensaoArteriaDistolica}`;
      document.getElementById("freq-card").innerHTML = sv.frequenciaCardiaca;
      document.getElementById("temperatura").innerHTML = sv.temperatura;
      document.getElementById("spo2").innerHTML = sv.spo2;
      document.getElementById("dor").innerHTML = sv.dor;
      document.getElementById("glicemia").innerHTML = sv.glicemia;
    } else {
      if (svGrid) svGrid.style.display = "none";
      const msg = document.createElement("p");
      msg.style.cssText =
        "margin: auto; color: var(--primary); font-size: 13px; text-align: center; padding: 10px;";
      msg.textContent = "Ainda não foram registados sinais vitais.";
      if (svBar) svBar.appendChild(msg);
    }

    // Medicação Ativa — carregada via endpoint de prescrições
    carregarMedicacaoAtiva(processo.id);
    carregarExamesECateteres(processo.id);
    carregarOcorrencias(processo.id);
  } catch (err) {
    console.error("[KardexUtente]", err);
    alert("Erro de ligação ao servidor.");
  }
}

async function carregarMedicacaoAtiva(processId) {
  const medicacaoContainer = document.querySelector(".medicacao");
  try {
    const resp = await fetch(`/api/processes/${processId}/prescriptions`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const prescricoes = (json.data ?? []).filter((p) => p.estado == "ATIVA");

    if (prescricoes.length === 0) {
      medicacaoContainer.innerHTML = `<p style="margin:auto; color:var(--primary); font-size:13px; text-align:center; padding:10px;">Sem medicação ativa registada.</p>`;
      return;
    }

    medicacaoContainer.innerHTML = "";
    prescricoes.forEach((p) => {
      const nomeMed = p.medicamento?.nome ?? "—";
      const dose = p.dose?.dose ?? "—";
      const unidade = formatarUnidade(p.dose?.unidadeMedida ?? p.medicamento?.unidadeMedida);
      const via = formatarVia(p.medicamento?.viaAdministracao);
      const motivo = p.motivo ?? "";
      const badges = [];
      if (p.sos)
        badges.push(
          `<span style="background:#b45309;color:#fff;border-radius:3px;padding:1px 6px;font-size:11px;font-weight:700;margin-left:6px;">SOS</span>`,
        );

      const item = document.createElement("div");
      item.style.cssText =
        "width:100%; border-bottom:1px solid rgba(42,111,151,0.15); padding:6px 0;";
      item.innerHTML = `
        <div class="medicacao-left-cima">
          <p><strong>${nomeMed}</strong></p>
          <p>&nbsp;${dose}&nbsp;${unidade}</p>
          ${badges.join("")}
        </div>
        <div class="medicacao-left-baixo">
          <p>${via}${motivo ? ` — ${motivo}` : ""}</p>
        </div>`;
      medicacaoContainer.appendChild(item);
    });
  } catch (err) {
    console.error("[Medicação Ativa]", err);
    medicacaoContainer.innerHTML = `<p style="margin:auto; color:var(--primary); font-size:13px; text-align:center; padding:10px;">Erro ao carregar medicação.</p>`;
  }
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
  mostrarNotificacao({ titulo: "Não disponível", mensagem: "O plano de cuidados não está disponível para o médico.", tipo: "aviso" });
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
  carregarUtente(id);
}

iniciar();

// ── Exames e Cateteres ───────────────────────────────────────────────────────

async function carregarExamesECateteres(processId) {
  const container = document.querySelector(".exames-cateteres");
  if (!container) return;
  try {
    const [resEx, resCat] = await Promise.allSettled([
      fetch(`/api/processes/${processId}/exams`),
      fetch(`/api/processes/${processId}/cateteres`),
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
      partes.push(`<div class="font-bold text-[12px] uppercase tracking-wider text-primary/70">Exames</div>`);
      partes.push(exames.slice(0, 3).map((e) => {
        const tipo = e.tipo ?? "Exame";
        const data = e.dataPretendida ?? e.data ?? "—";
        const medico = e.medico?.dados?.nome ?? e.medicoSolicitante?.dados?.nome ?? "—";
        return `<div class="leading-tight"><div class="font-semibold">${escapeHtml(tipo)}</div><div class="text-xs text-primary/75">Pedido a ${escapeHtml(data)}${medico !== "—" ? " — " + escapeHtml(medico) : ""}</div></div>`;
      }).join(""));
    }
    if (cateteres.length > 0) {
      partes.push(`<div class="font-bold text-[12px] uppercase tracking-wider text-primary/70 mt-1">Cateteres</div>`);
      partes.push(cateteres.slice(0, 3).map((c) => {
        const tipo = c.tipo ?? "Cateter";
        const local = c.localInsercao ?? c.local ?? "—";
        const calibre = c.calibre ?? "—";
        const dataIns = c.dataInsercao ?? c.data ?? "—";
        return `<div class="leading-tight"><div class="font-semibold">${escapeHtml(tipo)}${local !== "—" ? " — " + escapeHtml(local) : ""}</div><div class="text-xs text-primary/75">Inserido ${escapeHtml(dataIns)} · Calibre ${escapeHtml(calibre)}</div></div>`;
      }).join(""));
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
    const res = await fetch(`/api/processes/${processId}/incidents`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const incidentes = json.data ?? [];

    const hoje = new Date().toISOString().slice(0, 10);
    const ocorrenciasHoje = incidentes.filter((i) => {
      const d = String(i.data ?? "").substring(0, 10);
      // formato backend "dd/MM/yyyy"
      const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(d);
      if (m) return `${m[3]}-${m[2]}-${m[1]}` === hoje;
      return false;
    });

    if (ocorrenciasHoje.length === 0) {
      container.innerHTML = `<p class="m-0 italic text-primary/55">Sem ocorrências registadas hoje.</p>`;
      return;
    }

    container.innerHTML = ocorrenciasHoje.slice(0, 5).map((i) => {
      const hora = String(i.data ?? "").split(":").slice(1, 3).join(":") || "—";
      const enf = i.enfermeiro?.dados?.nome ?? i.funcionario?.dados?.nome ?? "—";
      const tipo = i.tipo ?? "Incidente";
      const desc = i.descricao ?? "—";
      return `<div class="leading-tight"><div><span class="font-semibold">${escapeHtml(hora)}</span> · ${escapeHtml(enf)}</div><div class="text-xs text-primary/75">${escapeHtml(tipo)} — ${escapeHtml(desc)}</div></div>`;
    }).join("");
  } catch (err) {
    console.error("[Ocorrências]", err);
    container.innerHTML = `<p class="m-0 italic text-primary/55">Erro ao carregar ocorrências.</p>`;
  }
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/**
 * Aceita "dd/MM/yyyy:HH:mm:ss" (formato do backend) ou ISO. Devolve nº de dias
 * desde a data de entrada até hoje, ou null se a string não for parseável.
 */
function _calcularDiasInternado(dataEntrada) {
  if (!dataEntrada) return null;
  const m = String(dataEntrada).match(/^(\d{2})\/(\d{2})\/(\d{4})(?::(\d{2}):(\d{2}):(\d{2}))?/);
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
