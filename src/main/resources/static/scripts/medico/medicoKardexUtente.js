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
    const [dE, mE, aE] = processo.dataEntrada.split("/").map(Number);
    const diasInternado = Math.floor(
      (Date.now() - new Date(aE, mE - 1, dE).getTime()) / 86400000,
    );
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
      svGrid.style.display = "none";
      const msg = document.createElement("p");
      msg.style.cssText =
        "margin: auto; color: var(--primary); font-size: 13px; text-align: center; padding: 10px;";
      msg.textContent = "Ainda não foram registados sinais vitais.";
      svBar.appendChild(msg);
    }

    // Medicação Ativa — carregada via endpoint de prescrições
    carregarMedicacaoAtiva(processo.id);
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
      const dose = p.dose ?? "—";
      const unidade = formatarUnidade(p.medicamento?.unidadeMedida);
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
  alert("Funcionalidade em desenvolvimento.");
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
