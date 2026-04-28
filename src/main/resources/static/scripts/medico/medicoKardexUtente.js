const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function carregarUtente(id) {
  try {
    const url = `http://localhost:8080/api/patients/${id}`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!resp.ok) throw new Error("Erro ao carregar utilizadores");
    const json = await resp.json();

    const dados = json.data.dados;

    // ── Dados do utente ──────────────────────────────────────────────────────
    document.getElementById("nome-utente").innerHTML = dados.nome;
    document.getElementById("sexo").innerHTML = dados.sexo;
    document.getElementById("idade").innerHTML = calcularIdade(dados.dataNascimento);

    const dataEntradaExtended = dados.processo.dataEntrada;
    const partes = dataEntradaExtended.split(":");
    const dataEntrada = partes[0];
    const horaEntrada = partes.slice(1).join(":");

    document.getElementById("data").innerHTML = dataEntrada;
    document.getElementById("hora").innerHTML = horaEntrada;
    document.getElementById("medico").innerHTML =
      dados.processo.medicoResponsavel.dados.nome;
    document.getElementById("processo").innerHTML = dados.processo.id;
    document.getElementById("data-nascimento").innerHTML = dados.dataNascimento;
    document.getElementById("cama").innerHTML =
      dados.processo.cama == null ? "Sem cama" : dados.processo.cama.id;

    const [dia, mes, ano] = dataEntrada.split("/");
    const dataObj = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    const dias = Math.floor((hoje - dataObj) / (1000 * 60 * 60 * 24));

    document.getElementById("estado").innerHTML = "Internado";
    document.getElementById("dias-internado").innerHTML = dias;

    // ── Riscos ───────────────────────────────────────────────────────────────
    const riscos = dados.flags;
    const lista = riscos.map((r) => {
      const texto = r.replace("RISCO_", "").toLowerCase();
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    });
    document.querySelector(".riscos").innerHTML = `
      <p style="color: white; font-weight: bolder;">Riscos:&nbsp; ${lista.join(" | ")}</p>
    `;

    // ── Alergias ─────────────────────────────────────────────────────────────
    document.getElementById("alertas").innerHTML = dados.alergias
      .map((a) => `<div class="alerta"><p>${a.nome}</p></div>`)
      .join("");

    // ── Sinais Vitais ─────────────────────────────────────────────────────────
    const sinaisVitais = dados.processo.sinaisVitais;
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

    // ── Medicação Ativa ───────────────────────────────────────────────────────
    // A API devolve "prescricoes" — filtramos apenas as ativas
    const prescricoes = (dados.processo.prescricoes ?? []).filter((p) => p.ativa);
    const medicacaoContainer = document.querySelector(".medicacao");

    if (prescricoes.length > 0) {
      medicacaoContainer.innerHTML = "";

      prescricoes.forEach((p) => {
        const nomeMed = p.medicamento?.nome ?? "—";
        const dose = p.dose?.dose ?? "—";
        const unidade = formatarUnidade(p.dose?.unidadeMedida);
        const via = formatarVia(p.medicamento?.viaAdministracao);
        const freq = p.frequencia?.frequencia ?? "—";
        const periodo = formatarPeriodo(p.frequencia?.periodo);
        const intervalo = p.frequencia?.intervaloMinHoras ?? null;
        const motivo = p.motivo ?? "";
        const altoRisco = p.altoRisco;
        const sos = p.sos;

        const badges = [];
        if (altoRisco) badges.push(
          `<span style="background:#b91c1c;color:#fff;border-radius:3px;padding:1px 6px;font-size:11px;font-weight:700;margin-left:6px;">ALTO RISCO</span>`
        );
        if (sos) badges.push(
          `<span style="background:#b45309;color:#fff;border-radius:3px;padding:1px 6px;font-size:11px;font-weight:700;margin-left:6px;">SOS</span>`
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
            <p>${via}&nbsp;-&nbsp;${freq}x/${periodo}${intervalo ? ` (mín. ${intervalo}h entre tomas)` : ""}</p>
            ${motivo ? `<p style="color:#555;">&nbsp;↳&nbsp;${motivo}</p>` : ""}
          </div>
        `;
        medicacaoContainer.appendChild(item);
      });
    } else {
      medicacaoContainer.innerHTML = `
        <p style="margin:auto; color:var(--primary); font-size:13px; text-align:center; padding:10px;">
          Sem medicação ativa registada.
        </p>`;
    }

  } catch (err) {
    console.error(err);
    mostrarNotificacao({
      titulo: "Erro de ligação",
      mensagem: "Não foi possível carregar os dados do utente.",
      tipo: "erro",
    });
  }
}

// ── Formatar helpers ──────────────────────────────────────────────────────────
function formatarPeriodo(periodo) {
  const map = { DIARIO: "dia", SEMANAL: "semana", MENSAL: "mês", HORA: "hora" };
  return map[periodo] ?? (periodo ?? "").toLowerCase();
}

function formatarUnidade(unidade) {
  const map = { MILIGRAMAS: "mg", MICROGRAMAS: "mcg", GRAMAS: "g", MILILITROS: "mL" };
  return map[unidade] ?? (unidade ?? "");
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
  return map[via] ?? (via ?? "—");
}

// ── Alta ──────────────────────────────────────────────────────────────────────
function daralta() {
  const nomeUtente = document.getElementById("nome-utente").innerHTML;
  const processoId = document.getElementById("processo").innerHTML;

  document.getElementById("popup-nome-utente").innerHTML =
    `${nomeUtente}<br>Nº Processo: ${processoId}`;
  document.getElementById("popup-alta").style.display = "flex";
}

// ── Inicialização ─────────────────────────────────────────────────────────────
async function iniciar() {
  try {
    const resp = await fetch("../../pages/medico/popups/popUpRegistarAlta.html");
    const html = await resp.text();
    document.getElementById("popup-container").innerHTML = html;
    document.getElementById("form-alta").addEventListener("submit", submeterAlta);
  } catch {
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: "Não foi possível carregar o popup de alta.",
      tipo: "erro",
    });
  }

  carregarUtente(id);
}

// ── Utilitários ───────────────────────────────────────────────────────────────
function calcularIdade(dataNascimentoStr) {
  const [dia, mes, ano] = dataNascimentoStr.split("/").map(Number);
  const hoje = new Date();
  const nascimento = new Date(ano, mes - 1, dia);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  if (
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }
  return idade;
}

function prescrever() {
  window.location.replace("/prescreverMedicamento?id=" + id);
}

iniciar();