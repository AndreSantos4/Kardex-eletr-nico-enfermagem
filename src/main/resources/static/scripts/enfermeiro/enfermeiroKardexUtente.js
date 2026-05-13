const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const TOLERANCIA_ATRASO_MIN = 30;

let processoId = null;
let utenteData = null;
let processoData = null;
let medicoData = null;
let caseData = null;
let _popupAltoRisco = false;
let prescricaoSelecionadaId = null;
let _medicamentosContencao = [];

function abreviarNome(nomeCompleto) {
  const partes = nomeCompleto.trim().split(/\s+/);
  return partes.length <= 1
    ? nomeCompleto
    : `${partes[0]} ${partes[partes.length - 1]}`;
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

function formatarDataHora(raw) {
  const [dataParte, horaParte] = raw.split("T");
  const [ano, mes, dia] = dataParte.split("-");
  return `${dia}/${mes}/${ano}:${horaParte}`;
}

function formatarDataHora2(raw) {
  const [dataParte, horaParte] = raw.split("T");
  const [ano, mes, dia] = dataParte.split("-");
  return `${dia}/${mes}/${ano}:${horaParte}`;
}

function formatarDataHoraExibir(raw) {
  if (!raw) return "—";
  const partes = raw.split(":");
  return `${partes[0]} ${partes[1]}:${partes[2]}`;
}

function agora() {
  const agora = new Date();
  return new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
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

function calcularAtrasoMinutos(horariosPrevistos) {
  if (!horariosPrevistos?.length) return 0;
  const now = new Date();
  const agoraMin = now.getHours() * 60 + now.getMinutes();

  return horariosPrevistos.reduce((maiorAtraso, h) => {
    const [hh, mm] = h.split(":").map(Number);
    const prevMin = hh * 60 + mm;
    const diff = prevMin <= agoraMin ? agoraMin - prevMin : 0;
    return Math.max(maiorAtraso, diff);
  }, 0);
}

function abrirPaginaPlano() {
  window.location.href = `enfermeiroPlanoCuidados?id=${id}`;
}

function irParaHistoricoPrescricoes() {
  window.location.href = `enfermeiroHistoricoPrescricoes?id=${id}`;
}

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

function abrirPopUp(seletorPopup) {
  document.querySelector(seletorPopup).style.display = "flex";
}

function fecharPopUp(seletorPopup) {
  const popup = document.querySelector(seletorPopup);
  popup.style.display = "none";
  popup.querySelector("form")?.reset();
}

function criarSearchableSelect(selectId, items, placeholder = "Pesquisar...") {
  const select = document.getElementById(selectId);
  if (
    !select ||
    select.parentElement.classList.contains("searchable-select-wrapper")
  )
    return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("searchable-select-wrapper");
  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(select);
  select.style.display = "none";

  const input = document.createElement("input");
  input.type = "text";
  input.classList.add("searchable-select-input");
  input.placeholder = placeholder;
  input.autocomplete = "off";

  const dropdown = document.createElement("ul");
  dropdown.classList.add("searchable-select-dropdown");
  dropdown.style.display = "none";

  wrapper.appendChild(input);
  wrapper.appendChild(dropdown);

  function popularItens(lista) {
    select.innerHTML = "";
    dropdown.innerHTML = "";

    lista.forEach(({ value, label }) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      select.appendChild(opt);

      const li = document.createElement("li");
      li.textContent = label;
      li.dataset.value = value;
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        select.value = value;
        input.value = label;
        dropdown.style.display = "none";
      });
      dropdown.appendChild(li);
    });
  }

  popularItens(items);

  input.addEventListener("input", () => {
    const termo = input.value.toLowerCase();
    let algumVisivel = false;
    dropdown.querySelectorAll("li").forEach((li) => {
      const visivel = li.textContent.toLowerCase().includes(termo);
      li.style.display = visivel ? "" : "none";
      if (visivel) algumVisivel = true;
    });
    dropdown.style.display = algumVisivel ? "block" : "none";
  });

  input.addEventListener("focus", () => {
    input.value = "";
    const lis = dropdown.querySelectorAll("li");
    lis.forEach((li) => (li.style.display = ""));
    dropdown.style.display = lis.length ? "block" : "none";
  });

  input.addEventListener("blur", () => {
    setTimeout(() => (dropdown.style.display = "none"), 150);
  });

  wrapper._popularItens = popularItens;
}

function definirValorSearchableSelect(selectId, value, label) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.value = value;
  const wrapper = select.parentElement;
  if (wrapper?.classList.contains("searchable-select-wrapper")) {
    const input = wrapper.querySelector(".searchable-select-input");
    if (input) input.value = label ?? "";
  }
}

async function carregarMedicosNoSelect(selectId) {
  try {
    const res = await fetch("http://localhost:8080/api/workers/medics", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    if (!data.success) {
      console.error("Erro ao carregar médicos:", data.message);
      return;
    }

    const items = data.data.map((m) => ({
      value: m.id,
      label: abreviarNome(m.dados.nome),
    }));
    document.getElementById(selectId)?.parentElement?._popularItens?.(items);
  } catch (err) {
    console.error("Erro de ligação ao carregar médicos:", err);
  }
}

async function carregarCamasNoSelect(selectId) {
  try {
    const res = await fetch(
      "http://localhost:8080/api/processes/beds?o=false",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    const data = await res.json();
    if (!data.success) {
      console.error("Erro ao carregar camas:", data.message);
      return;
    }

    const items = data.data.map((c) => ({
      value: c.id,
      label: `Cama ${c.id}`,
    }));
    document.getElementById(selectId)?.parentElement?._popularItens?.(items);
  } catch (err) {
    console.error("Erro de ligação ao carregar camas:", err);
  }
}

async function carregarCamasEdicao() {
  try {
    const [resLivres, resOcupadas] = await Promise.all([
      fetch("http://localhost:8080/api/processes/beds?o=false", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
      fetch("http://localhost:8080/api/processes/beds?o=true", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    ]);

    const [dataLivres, dataOcupadas] = await Promise.all([
      resLivres.json(),
      resOcupadas.json(),
    ]);
    const livres = dataLivres.success ? dataLivres.data : [];
    const ocupadas = dataOcupadas.success ? dataOcupadas.data : [];

    const camaActualId = caseData.cama !== "—" ? String(caseData.cama) : null;
    const camaActual = camaActualId
      ? ocupadas.find((c) => String(c.id) === camaActualId)
      : null;

    const todas = [...livres];
    if (camaActual && !todas.find((c) => String(c.id) === camaActualId))
      todas.push(camaActual);
    todas.sort((a, b) => a.id - b.id);

    const items = todas.map((c) => ({ value: c.id, label: `Cama ${c.id}` }));
    document.getElementById("edit-cama")?.parentElement?._popularItens?.(items);
  } catch (err) {
    console.error("Erro ao carregar camas para edição:", err);
    if (caseData.cama !== "—") {
      document
        .getElementById("edit-cama")
        ?.parentElement?._popularItens?.([
          { value: caseData.cama, label: `Cama ${caseData.cama}` },
        ]);
    }
  }
}

async function carregarUtente(id) {
  try {
    const resp = await fetch(`http://localhost:8080/api/patients/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);

    const json = await resp.json();
    const dados = json?.data?.dados;
    if (!dados)
      throw new Error("Estrutura da resposta inesperada: dados ausentes");

    const processo = dados.processo;
    if (!processo)
      throw new Error("Estrutura da resposta inesperada: processo ausente");

    processoId = processo.id;

    utenteData = {
      nome: dados.nome,
      sexo: dados.sexo,
      dataNascimento: dados.dataNascimento,
      alergias: dados.alergias ?? [],
      flags: dados.flags ?? [],
      numeroCC: dados.numeroCC,
      numeroSNS: dados.numeroSNS,
      contacto: dados.contacto,
      contactoEmergencia: dados.contactoEmergencia,
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

    caseData = { cama: processo.cama?.id ?? "—" };

    const [dia, mes, ano] = processo.dataEntrada.split("/");
    const dias = Math.floor(
      (new Date() - new Date(ano, mes - 1, dia)) / 86400000,
    );

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
    document.getElementById("riscos").textContent =
      `Riscos: ${riscos.join(" | ")}`;

    document.getElementById("alergias-list").innerHTML = utenteData.alergias
      .map((a) => `<div>${typeof a === "string" ? a : a.nome}</div>`)
      .join("");

    const svs = processoData.sinaisVitais;
    if (svs?.length > 0) atualizarSinaisVitaisUI(svs[svs.length - 1]);

    await renderizarMedicacaoAtivaComContencoes(processoData.prescricoes);
    await Promise.all([carregarOcorrencias(), carregarExamesECateteres()]);
  } catch (err) {
    console.error("Erro em carregarUtente:", err);
    alert(`Erro de ligação ao servidor.\n\nDetalhe: ${err.message}`);
  }
}

async function abrirPopUpEditarFichaUtente() {
  await carregarPopUp(
    "../../pages/enfermeiro/popups/popupEditarFichaUtente.html",
  );

  document.getElementById("edit-name").value = utenteData.nome ?? "";
  document.getElementById("edit-sexo").value = utenteData.sexo ?? "";
  document.getElementById("edit-n-identificacao").value =
    utenteData.numeroCC ?? "";
  document.getElementById("edit-n-sns").value = utenteData.numeroSNS ?? "";
  document.getElementById("edit-contacto").value = utenteData.contacto ?? "";
  document.getElementById("edit-contacto-emg").value =
    utenteData.contactoEmergencia ?? "";

  if (utenteData.dataNascimento) {
    const [dia, mes, ano] = utenteData.dataNascimento.split("/");
    document.getElementById("edit-data-nascimento").value =
      `${ano}-${mes}-${dia}`;
  }

  criarSearchableSelect("edit-medico-responsavel", [], "Pesquisar médico...");
  criarSearchableSelect("edit-cama", [], "Pesquisar cama...");

  await carregarMedicosNoSelect("edit-medico-responsavel");
  definirValorSearchableSelect(
    "edit-medico-responsavel",
    String(medicoData.id ?? ""),
    abreviarNome(medicoData.nome ?? ""),
  );

  await carregarCamasEdicao();
  definirValorSearchableSelect(
    "edit-cama",
    caseData.cama !== "—" ? String(caseData.cama) : "",
    caseData.cama !== "—" ? `Cama ${caseData.cama}` : "Sem cama",
  );

  document.querySelectorAll("input[name='edit-flags']").forEach((cb) => {
    cb.checked = utenteData.flags?.includes(cb.value) ?? false;
  });

  const alergiaBox = document.getElementById("edit-alergias-box");
  alergiaBox.innerHTML = "";
  const alergias =
    utenteData.alergias?.length > 0 ? utenteData.alergias : [{ nome: "" }];
  alergias.forEach((a) =>
    adicionarLinhaAlergiaEditar(
      alergiaBox,
      typeof a === "string" ? a : (a.nome ?? ""),
    ),
  );

  document.getElementById("edit-btn-adicionar-alergia").onclick = () => {
    const box = document.getElementById("edit-alergias-box");
    if (!box) return;
    const inputs = box.querySelectorAll('.alergia-item input[type="text"]');
    const ultimo = inputs[inputs.length - 1];
    if (ultimo && !ultimo.value.trim()) {
      ultimo.focus();
      ultimo.style.borderColor = "rgb(220, 49, 26)";
      ultimo.placeholder = "Preenche este campo primeiro";
      setTimeout(() => {
        ultimo.style.borderColor = "";
        ultimo.placeholder = "Alergia";
      }, 2000);
      return;
    }
    adicionarLinhaAlergiaEditar(box, "");
  };

  abrirPopUp(".pop-up-editar-utente");
}

function adicionarLinhaAlergiaEditar(container, valor = "") {
  const item = document.createElement("div");
  item.className = "alergia-item";
  item.innerHTML = `
    <input type="text" placeholder="Alergia" />
    <button type="button" class="btn-remover-alergia">−</button>
  `;
  item.querySelector("input").value = valor;
  item.querySelector(".btn-remover-alergia").addEventListener("click", () => {
    const linhas = container.querySelectorAll(".alergia-item");
    if (linhas.length > 1) item.remove();
    else item.querySelector("input").value = "";
  });
  container.appendChild(item);
  container.scrollTop = container.scrollHeight;
}

async function editarUtente(event) {
  event.preventDefault();

  const dataRaw = document.getElementById("edit-data-nascimento").value;
  const [ano, mes, dia] = dataRaw.split("-");

  const alergias = Array.from(
    document
      .getElementById("edit-alergias-box")
      .querySelectorAll('input[type="text"]'),
  )
    .map((i) => i.value.trim())
    .filter(Boolean)
    .map((nome) => ({ nome }));

  const flagsRisco = Array.from(
    document.querySelectorAll("input[name='edit-flags']"),
  )
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  const camaValor = document.getElementById("edit-cama").value;

  const body = {
    nome: document.getElementById("edit-name").value.trim(),
    dataNascimento: `${dia}/${mes}/${ano}`,
    sexo: document.getElementById("edit-sexo").value,
    numeroCC: document.getElementById("edit-n-identificacao").value.trim(),
    numeroSNS: parseInt(document.getElementById("edit-n-sns").value),
    contacto: parseInt(document.getElementById("edit-contacto").value),
    contactoEmergencia: parseInt(
      document.getElementById("edit-contacto-emg").value,
    ),
    medicoId: parseInt(
      document.getElementById("edit-medico-responsavel").value,
    ),
    camaId: camaValor && camaValor !== "—" ? camaValor : null,
    alergias,
    flagsRisco,
  };

  try {
    const resp = await fetch(`http://localhost:8080/api/patients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok)
      throw new Error((await resp.text()) || "Erro ao editar utente");
    fecharPopUp(".pop-up-editar-utente");
    carregarUtente(id);
  } catch (err) {
    alert(`Erro: ${err.message}`);
  }
}

async function abrirPopUpSinaisVitais() {
  await carregarPopUp(
    "../../pages/enfermeiro/popups/popupRegistarSinaisVitais.html",
  );
  document.getElementById("data-hora").value = agora();
  abrirPopUp(".pop-up-sinaisVitais");
}

async function registarSinaisVitais(event) {
  event.preventDefault();

  if (!processoId) {
    alert("Processo não identificado. Tente recarregar a página.");
    return;
  }

  const body = {
    tensaoArteriaSistolica: parseInt(
      document.getElementById("pa-sistolica").value,
    ),
    tensaoArteriaDistolica: parseInt(
      document.getElementById("pa-diastolica").value,
    ),
    frequenciaCardiaca: parseInt(
      document.getElementById("freq-cardiaca").value,
    ),
    temperatura: parseInt(document.getElementById("temperatura").value),
    spo2: parseInt(document.getElementById("spo2").value),
    dor: parseInt(document.getElementById("dor").value),
    glicemia: parseInt(document.getElementById("glicemia").value),
    observacoes: document.getElementById("observacoes").value || null,
    data: formatarDataHora(document.getElementById("data-hora").value),
  };

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processoId}/vitals`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!resp.ok)
      throw new Error((await resp.text()) || "Erro ao registar sinais vitais");
    atualizarSinaisVitaisUI(body);
    fecharPopUp(".pop-up-sinaisVitais");
  } catch (err) {
    alert(`Erro: ${err.message}`);
  }
}

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

async function renderizarMedicacaoAtivaComContencoes(prescricoes) {
  const body = document.getElementById("medicacao-body");
  body.innerHTML = "";

  const ativas = (prescricoes ?? []).filter((p) => p.estado === "ATIVA");

  let contencoes = [];
  try {
    const res = await fetch(
      `http://localhost:8080/api/processes/${processoId}/containments`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
    );
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
    const nomeMed = p.medicamento?.nome ?? "Medicamento não especificado";
    const doseVal = p.dose
      ? `${p.dose.dose} ${formatarUnidade(p.dose.unidadeMedida)}`
      : "—";
    const via = p.medicamento?.viaAdministracao ?? "—";
    const freq = p.frequencia
      ? `${p.frequencia.frequencia}x/${p.frequencia.periodo.toLowerCase()}`
      : "—";
    const fim = p.fim ?? "—";
    const altoRisco = (p.medicamento?.altoRisco ?? false) || (p.altoRisco ?? false);
    const horariosPrevistos = p.horariosPrevistos ?? [];

    const badgeAltoRisco = altoRisco
      ? `<span style="display:inline-block;margin-left:6px;background:rgb(220,49,26);color:#fff;font-size:10px;font-weight:700;letter-spacing:.5px;padding:1px 5px;border-radius:3px;vertical-align:middle;">ALTO RISCO</span>`
      : "";

    const row = document.createElement("div");
    row.className = "med-row";
    row.style.cssText =
      "display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:1px solid var(--border);font-size:13px;gap:8px;";
    row.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:600;color:var(--surface)">${nomeMed}${badgeAltoRisco}</div>
        <div style="color:var(--surface);margin-top:2px">${doseVal} · ${freq} · Via: ${via}</div>
        <div style="color:var(--surface);font-size:11px">Até ${fim}</div>
      </div>
      <button class="btn-administrar"
        onclick="abrirPopUpAdministrarMedicacao(${p.id},'${nomeMed}','${doseVal}','${via}',${altoRisco},${JSON.stringify(horariosPrevistos)})">
        ADMINISTRAR
      </button>
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
    row.className = "med-row";
    row.style.cssText =
      "display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:1px solid var(--border);font-size:13px;gap:8px;";
    row.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:600;color:var(--surface)">
          ${nomeMed}
          <span style="display:inline-block;margin-left:6px;background:rgb(120,40,160);color:#fff;font-size:10px;font-weight:700;letter-spacing:.5px;padding:1px 5px;border-radius:3px;vertical-align:middle;">CONTENÇÃO</span>
        </div>
        <div style="color:var(--surface);margin-top:2px">${doseVal} · Via: ${via} · Duração: ${c.duracao ?? "—"}</div>
        <div style="color:var(--surface);font-size:11px">${c.justificao ?? c.justificacao ?? "—"}${hora ? ` · Às ${hora}` : ""}</div>
      </div>
    `;
    body.appendChild(row);
  });
}

async function abrirPopUpAdministrarMedicacao(
  prescricaoId,
  nomeMed,
  dose,
  via,
  altoRisco = false,
  horariosPrevistos = [],
) {
  prescricaoSelecionadaId = prescricaoId ?? null;
  _popupAltoRisco = altoRisco;

  await carregarPopUp(
    "../../pages/enfermeiro/popups/popupAdministrarMedicacao.html",
  );

  document.getElementById("nome-utenet").textContent = utenteData?.nome ?? "—";
  document.getElementById("medicamento").textContent = nomeMed ?? "—";
  document.getElementById("dose").textContent = dose ?? "—";
  document.getElementById("via").textContent = via ?? "—";

  const now = new Date();
  document.getElementById("hora-de-toma").textContent = now.toLocaleTimeString(
    "pt-PT",
    { hour: "2-digit", minute: "2-digit" },
  );
  document.getElementById("data-hora").value = agora();
  document.getElementById("observacoes").value = "";

  const cbRecusa = document.getElementById("recusa-medicacao");
  if (cbRecusa) cbRecusa.checked = false;

  const warningBox = document.getElementById("warning-box");
  const atrasoMin = calcularAtrasoMinutos(horariosPrevistos);
  if (atrasoMin > 0) {
    const dentroLimite = atrasoMin <= TOLERANCIA_ATRASO_MIN;
    document.getElementById("warning-text").innerHTML = dentroLimite
      ? `Atraso de ${atrasoMin} min. Tolerância: ${TOLERANCIA_ATRASO_MIN} min. Dentro do limite aceitável.`
      : `Atraso de ${atrasoMin} min. Tolerância: ${TOLERANCIA_ATRASO_MIN} min. Fora do limite aceitável — documente o motivo nas observações.`;
    warningBox.style.display = "flex";
  } else {
    warningBox.style.display = "none";
  }

  const secaoAltoRisco = document.getElementById("alto-risco-verificacao");
  const cbConfirmar = document.getElementById("confirmar-alto-risco");
  if (secaoAltoRisco)
    secaoAltoRisco.style.display = altoRisco ? "block" : "none";
  if (cbConfirmar) cbConfirmar.checked = false;

  atualizarBotaoRegistar();
  abrirPopUp(".pop-up-administrar-medicacao");
}

async function registarMedicacao() {
  if (!prescricaoSelecionadaId) {
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: "Prescrição não identificada.",
      tipo: "erro",
    });
    return;
  }

  const dataHoraRaw = document.getElementById("data-hora").value;
  if (!dataHoraRaw) {
    mostrarNotificacao({
      titulo: "Formulário incompleto",
      mensagem: "Data e hora não especificados.",
      tipo: "aviso",
    });
    return;
  }

  const observacoes = document.getElementById("observacoes").value.trim();
  const recusa = document.getElementById("recusa-medicacao")?.checked ?? false;

  const body = {
    foi_administrado: !recusa,
    observacoes:
      observacoes ||
      (recusa
        ? "Recusa/impossibilidade de administração"
        : "Administrado sem intercorrências"),
    data: formatarDataHora(dataHoraRaw),
  };

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/prescriptions/${prescricaoSelecionadaId}/administrations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!resp.ok)
      throw new Error((await resp.text()) || "Erro ao registar administração");
    fecharPopUp(".pop-up-administrar-medicacao");
    mostrarNotificacao({
      titulo: "Administração",
      mensagem: recusa
        ? "Recusa registada com sucesso."
        : "Medicação administrada com sucesso.",
      tipo: "sucesso",
    });
  } catch (err) {
    let mensagem = err.message;
    try {
      mensagem = JSON.parse(err.message).error ?? mensagem;
    } catch (_) { }
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: mensagem || "Erro ao registar administração.",
      tipo: "erro",
    });
  }
}

function atualizarBotaoRegistar() {
  const btn = document.getElementById("btn-registar");
  if (!btn) return;

  const confirmado =
    document.getElementById("confirmar-alto-risco")?.checked ?? false;
  const recusa = document.getElementById("recusa-medicacao")?.checked ?? false;
  const desativado = _popupAltoRisco && !confirmado && !recusa;

  btn.disabled = desativado;
  btn.style.opacity = desativado ? "0.45" : "1";
  btn.style.cursor = desativado ? "not-allowed" : "pointer";
}

function adicionarLinhaDiagnostico(
  container,
  diagnostico = "",
  prioridade = "MEDIA",
) {
  const item = document.createElement("div");
  item.className = "alergia-item";
  item.innerHTML = `
    <input type="text" placeholder="Risco de queda r/c instabilidade da marcha" />
    <select>
      <option value="ALTA">Alta</option>
      <option value="MEDIA">Média</option>
      <option value="BAIXA">Baixa</option>
    </select>
    <button type="button" class="btn-remover-alergia">−</button>
  `;
  item.querySelector("input").value = diagnostico;
  item.querySelector("select").value = prioridade;
  item.querySelector(".btn-remover-alergia").addEventListener("click", () => {
    const linhas = container.querySelectorAll(".alergia-item");
    if (linhas.length > 1) item.remove();
    else {
      item.querySelector("input").value = "";
      item.querySelector("select").value = "MEDIA";
    }
  });
  container.appendChild(item);
  container.scrollTop = container.scrollHeight;
}

async function abrirPopUpCriarPlano() {
  await carregarPopUp(
    "../../pages/enfermeiro/popups/popupCriarPlanoCuidados.html",
  );

  const box = document.getElementById("diagnosticos-box");
  box.innerHTML = "";
  adicionarLinhaDiagnostico(box);

  document.getElementById("btn-adicionar-diagnostico").onclick = () => {
    const linhas = box.querySelectorAll(".alergia-item");
    const ultimo = linhas[linhas.length - 1];
    if (ultimo && !ultimo.querySelector("input").value.trim()) {
      const input = ultimo.querySelector("input");
      input.focus();
      input.style.borderColor = "rgb(220, 49, 26)";
      input.placeholder = "Preenche este campo primeiro";
      setTimeout(() => {
        input.style.borderColor = "";
        input.placeholder = "Risco de queda r/c instabilidade da marcha";
      }, 2000);
      return;
    }
    adicionarLinhaDiagnostico(box);
  };

  abrirPopUp(".pop-up-criar-plano-cuidados");
}

async function criarPlanoCuidados(event) {
  event.preventDefault();

  if (!processoId) {
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: "Processo não identificado. Tente recarregar a página.",
      tipo: "erro",
    });
    return;
  }

  const diagnosticos = Array.from(
    document
      .getElementById("diagnosticos-box")
      .querySelectorAll(".alergia-item"),
  )
    .map((item) => ({
      diagnostico: item.querySelector("input").value.trim(),
      prioridade: item.querySelector("select").value,
    }))
    .filter((d) => d.diagnostico);

  if (diagnosticos.length === 0) {
    mostrarNotificacao({
      titulo: "Formulário incompleto",
      mensagem: "Adiciona pelo menos um diagnóstico de enfermagem.",
      tipo: "aviso",
    });
    return;
  }

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processoId}/plan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ diagnosticos }),
      },
    );

    if (!resp.ok)
      throw new Error((await resp.text()) || "Erro ao criar plano de cuidados");
    fecharPopUp(".pop-up-criar-plano-cuidados");
    mostrarNotificacao({
      titulo: "Plano criado",
      mensagem: "Plano de cuidados criado com sucesso.",
      tipo: "sucesso",
    });
  } catch (err) {
    let mensagem = err.message;
    try {
      mensagem = JSON.parse(err.message).error ?? mensagem;
    } catch (_) { }
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: mensagem || "Erro ao criar plano de cuidados.",
      tipo: "erro",
    });
  }
}

async function abrirPopUpContencaoQuimica() {
  await carregarPopUp(
    "../../pages/enfermeiro/popups/popupRegistarContencaoQuimica.html",
  );
  document.getElementById("data-hora-contencao").value = agora();
  await carregarMedicamentosContencao();
  abrirPopUp(".popup-contencao-overlay");
}

async function carregarMedicamentosContencao() {
  const selectMed = document.getElementById("medicamento-contencao");
  const selectDose = document.getElementById("dosagem-contencao");

  selectMed.innerHTML = '<option value="" disabled selected>A carregar...</option>';
  selectDose.innerHTML = '<option value="" disabled selected>Selecione o medicamento</option>';

  try {
    const res = await fetch("http://localhost:8080/api/stock/medications", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message ?? "Erro ao carregar medicamentos");

    _medicamentosContencao = data.data ?? [];

    selectMed.innerHTML = '<option value="" disabled selected>Selecione o medicamento</option>';
    _medicamentosContencao.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.nome;
      selectMed.appendChild(opt);
    });
  } catch (err) {
    selectMed.innerHTML = '<option value="" disabled selected>Erro ao carregar</option>';
    console.error("Erro ao carregar medicamentos:", err);
  }
}

function atualizarDosagemContencao() {
  const selectMed = document.getElementById("medicamento-contencao");
  const selectDose = document.getElementById("dosagem-contencao");
  const selectVia = document.getElementById("via-contencao");

  const idSelecionado = parseInt(selectMed.value);
  const med = _medicamentosContencao.find((m) => m.id === idSelecionado);

  if (selectVia && med?.viaAdministracao) {
    const optionExiste = Array.from(selectVia.options).some(
      (o) => o.value === med.viaAdministracao,
    );
    if (optionExiste) selectVia.value = med.viaAdministracao;
  }

  selectDose.innerHTML = '<option value="" disabled selected>Selecione a dosagem</option>';
  if (med?.dosagens?.length) {
    med.dosagens.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = `${d.dose % 1 === 0 ? d.dose : d.dose.toFixed(3).replace(/\.?0+$/, "")} ${formatarUnidade(d.unidadeMedida)}`;
      selectDose.appendChild(opt);
    });
  }
}

function fecharPopupRegistarContencao() {
  const popup = document.querySelector(".popup-contencao-overlay");
  popup.style.display = "none";
  popup.querySelector("form")?.reset();
}

async function submeterRegistarContencao(event) {
  event.preventDefault();

  const idMedicamento = document.getElementById("medicamento-contencao").value;
  const idDose = document.getElementById("dosagem-contencao").value;
  const duracao = document.getElementById("duracao-contencao").value.trim();
  const dataHoraRaw = document.getElementById("data-hora-contencao").value;
  const justificacao = document.getElementById("justificacao-contencao").value.trim();

  if (!idMedicamento || !idDose || !duracao || !dataHoraRaw || !justificacao) {
    mostrarNotificacao({
      titulo: "Formulário incompleto",
      mensagem: "Preenche todos os campos obrigatórios.",
      tipo: "aviso",
    });
    return;
  }

  const body = {
    idMedicamento: parseInt(idMedicamento),
    idDose: parseInt(idDose),
    duracao,
    data: formatarDataHora(dataHoraRaw),
    justificacao,
  };

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processoId}/containments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!resp.ok)
      throw new Error((await resp.text()) || "Erro ao registar contenção química");

    fecharPopupRegistarContencao();
    mostrarNotificacao({
      titulo: "Contenção registada",
      mensagem: "Contenção química registada com sucesso.",
      tipo: "sucesso",
    });
    await renderizarMedicacaoAtivaComContencoes(processoData.prescricoes);
  } catch (err) {
    let mensagem = err.message;
    try { mensagem = JSON.parse(err.message).error ?? mensagem; } catch (_) { }
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: mensagem || "Erro ao registar contenção química.",
      tipo: "erro",
    });
  }
}

async function abrirPopUpRegistarIncidente() {
  await carregarPopUp(
    "../../pages/enfermeiro/popups/popupRegistarIncidenteClinico.html",
  );
  document.getElementById("data-hora-incidente").value = agora();
  abrirPopUp(".popup-incidente-overlay");
}

function fecharPopupRegistarIncidente() {
  const popup = document.querySelector(".popup-incidente-overlay");
  popup.style.display = "none";
  popup.querySelector("form")?.reset();
}

async function submeterRegistarIncidente(event) {
  event.preventDefault();

  const tipo = document.getElementById("tipo-incidente").value;
  const dataHoraRaw = document.getElementById("data-hora-incidente").value;
  const gravidade = document.getElementById("gravidade-incidente").value;
  const descricao = document.getElementById("descricao-incidente").value.trim();

  if (!tipo || !dataHoraRaw || !gravidade || !descricao) {
    mostrarNotificacao({
      titulo: "Formulário incompleto",
      mensagem: "Preenche todos os campos obrigatórios.",
      tipo: "aviso",
    });
    return;
  }

  const body = {
    tipo,
    gravidade,
    descricao,
    data: formatarDataHora2(dataHoraRaw),
  };

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processoId}/incidents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!resp.ok)
      throw new Error((await resp.text()) || "Erro ao registar incidente");

    console.log(resp);

    fecharPopupRegistarIncidente();
    mostrarNotificacao({
      titulo: "Incidente registado",
      mensagem: "Incidente clínico registado com sucesso.",
      tipo: "sucesso",
    });
    await carregarOcorrencias();
  } catch (err) {
    let mensagem = err.message;
    try {
      mensagem = JSON.parse(err.message).error ?? mensagem;
    } catch (_) { }
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: mensagem || "Erro ao registar incidente.",
      tipo: "erro",
    });
  }
}

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
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processoId}/incidents`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const json = await resp.json();
    const ocorrencias = json.data ?? [];

    if (ocorrencias.length === 0) {
      body.innerHTML =
        "<p style='color:var(--surface);font-size:13px'>Sem ocorrências registadas hoje.</p>";
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

async function abrirPopUpRegistarCateter() {
  await carregarPopUp(
    "../../pages/enfermeiro/popups/popupRegistarCateter.html",
  );
  document.getElementById("data-hora-cateter").value = agora();
  abrirPopUp(".popup-cateter-overlay");
}

function fecharPopupRegistarCateter() {
  const popup = document.querySelector(".popup-cateter-overlay");
  popup.style.display = "none";
  popup.querySelector("form")?.reset();
}

async function submeterRegistarCateter(event) {
  event.preventDefault();

  const tipo = document.getElementById("tipo-cateter").value;
  const calibre = document.getElementById("calibre-cateter").value;
  const localInsercao = document.getElementById("local-insercao").value.trim();
  const dataHoraRaw = document.getElementById("data-hora-cateter").value;
  const dataPrevRaw = document.getElementById("data-prev-substituicao").value;
  const observacoes = document
    .getElementById("observacoes-cateter")
    .value.trim();

  if (!tipo || !calibre || !localInsercao || !dataHoraRaw || !dataPrevRaw) {
    mostrarNotificacao({
      titulo: "Formulário incompleto",
      mensagem: "Preenche todos os campos obrigatórios.",
      tipo: "aviso",
    });
    return;
  }

  const body = {
    tipo,
    calibre,
    dataInsercao: formatarDataHora(dataHoraRaw),
    dataSubstituicao: formatarDataHora(dataPrevRaw),
    localInsercao,
    observacoes: observacoes || null,
  };

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processoId}/cateteres`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!resp.ok)
      throw new Error((await resp.text()) || "Erro ao registar cateter");
    fecharPopupRegistarCateter();
    mostrarNotificacao({
      titulo: "Cateter registado",
      mensagem: "Cateter registado com sucesso.",
      tipo: "sucesso",
    });
    await carregarExamesECateteres();
  } catch (err) {
    let mensagem = err.message;
    try {
      mensagem = JSON.parse(err.message).error ?? mensagem;
    } catch (_) { }
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: mensagem || "Erro ao registar cateter.",
      tipo: "erro",
    });
  }
}

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
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processoId}/cateteres`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const json = await resp.json();
    const cateteres = json.data ?? [];

    if (cateteres.length === 0) {
      body.innerHTML =
        "<p style='color:var(--surface);font-size:13px'>Sem cateteres ativos.</p>";
    } else {
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
    }
  } catch (err) {
    body.innerHTML =
      "<p style='color:var(--surface);font-size:13px'>Erro ao carregar cateteres.</p>";
    console.error("Erro em carregarExamesECateteres:", err);
  }

  await carregarExames();
}

async function carregarExames() {
  // TODO: endpoint em desenvolvimento — implementação comentada intencionalmente
}

let _enfermeiroAtualId = null;

async function obterEnfermeiroAtualId() {
  try {
    const resp = await fetch("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const json = await resp.json();
    return String(json.data.id ?? "");  // ← forçar string
  } catch (err) {
    console.error("Erro ao obter enfermeiro atual:", err);
    return null;
  }
}

async function carregarPlanoDeHoje() {
  const body = document.getElementById("plano-cuidados-body");
  body.innerHTML = "";

  const frequenciaLabel = {
    CONTINUA: "Contínua", DIARIA: "Diária", BD: "2x/dia",
    TID: "3x/dia", QID: "4x/dia", SOS: "SOS", SEMANAL: "Semanal",
  };

  const prioridadeConfig = {
    CRITICA: { cor: "#c62828", texto: "CRÍTICA" },
    ALTA: { cor: "rgb(220,49,26)", texto: "ALTA" },
    MEDIA: { cor: "#e65100", texto: "MÉDIA" },
    BAIXA: { cor: "#2e7d32", texto: "BAIXA" },
  };

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processoId}/plan`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (!resp.ok) {
      body.innerHTML = "<p style='color:var(--surface);font-size:13px'>Sem plano de cuidados ativo.</p>";
      return;
    }

    const json = await resp.json();
    const intervencoes = json.data?.intervencoes ?? [];

    if (intervencoes.length === 0) {
      body.innerHTML = "<p style='color:var(--surface);font-size:13px'>Sem intervenções para hoje.</p>";
      return;
    }

    const enfermeiroAtualId = await obterEnfermeiroAtualId();

    intervencoes.forEach((inv) => {
      const feita = inv.funcionarioExecutou != null;
      console.log(String(inv.funcionarioExecutou?.dados?.id ?? ""));
      const realizadaPorId = String(inv.funcionarioExecutou?.dados?.id ?? inv.funcionarioExecutou?.id ?? "");

      console.log("Enfermeiro atual:", enfermeiroAtualId);
      console.log("Executou:", inv.funcionarioExecutou);
      console.log("realizadaPorId:", realizadaPorId);

      const podeDesmarcar = feita && String(realizadaPorId) === String(enfermeiroAtualId);
      const checkboxBloqueada = !feita || (feita && !podeDesmarcar);

      const prio = prioridadeConfig[inv.prioridade] ?? { cor: "#666", texto: inv.prioridade ?? "—" };
      const freq = frequenciaLabel[inv.frequencia] ?? inv.frequencia ?? "—";

      const row = document.createElement("div");
      row.dataset.invId = inv.id;
      row.style.cssText = [
        "display:flex",
        "align-items:flex-start",
        "justify-content:space-between",
        "gap:12px",
        "padding:8px 10px",
        "border-bottom:1px solid var(--border)",
        "font-size:13px",
      ].join(";");

      const checkboxId = `inv-check-${inv.id}`;
      const textoRiscado = feita ? "text-decoration:line-through;opacity:0.55;" : "";
      const tituloCb = apenasLeitura(feita, podeDesmarcar)
        ? "Registado por outro enfermeiro"
        : feita
          ? "Clica para desmarcar"
          : "Marcar como realizado deve ser feito no plano de cuidados";

      row.innerHTML = `
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;color:var(--surface);${textoRiscado}">
            ${inv.intervencao ?? "—"}
            <span style="display:inline-block;margin-left:6px;background:${prio.cor};color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px;vertical-align:middle;">${prio.texto}</span>
          </div>
          <div style="color:var(--surface);margin-top:3px;font-size:12px;">
            ${freq}${inv.horarioPrevisto ? ` · ${inv.horarioPrevisto}` : ""}${inv.objetivo ? ` · Obj: ${inv.objetivo}` : ""}
          </div>
        </div>
        <input
          type="checkbox"
          id="${checkboxId}"
          style="margin-top:3px;width:16px;height:16px;flex-shrink:0;accent-color:#1565c0;cursor:${checkboxBloqueada ? "not-allowed" : "pointer"};"
          ${feita ? "checked" : ""}
          title="${tituloCb}"
        />
      `;

      const cb = row.querySelector(`#${checkboxId}`);

      if (checkboxBloqueada) {
        cb.addEventListener("change", (e) => {
          e.preventDefault();
          cb.checked = feita;
        });
        cb.addEventListener("click", (e) => {
          e.preventDefault();
        });
      } else {
        cb.addEventListener("change", (e) => {
          if (!e.target.checked) {
            desmarcarIntervencao(inv.id, row, cb);
          } else {
            cb.checked = true;
          }
        });
      }

      console.log("feita:", feita, "podeDesmarcar:", podeDesmarcar, "bloqueada:", checkboxBloqueada);
      console.log("tipos:", typeof enfermeiroAtualId, typeof realizadaPorId, enfermeiroAtualId === realizadaPorId);

      body.appendChild(row);
    });
  } catch (err) {
    body.innerHTML = "<p style='color:var(--surface);font-size:13px'>Erro ao carregar plano de cuidados.</p>";
    console.error("Erro em carregarPlanoDeHoje:", err);
  }
}

function apenasLeitura(feita, podeDesmarcar) {
  return feita && !podeDesmarcar;
}

async function desmarcarIntervencao(intervencaoId, rowEl, cbEl) {
  cbEl.disabled = true;
  cbEl.style.opacity = "0.5";

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/interventions/${intervencaoId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!resp.ok) throw new Error((await resp.text()) || "Erro ao desmarcar intervenção");

    mostrarNotificacao({
      titulo: "Intervenção desmarcada",
      mensagem: "Intervenção marcada como não realizada.",
      tipo: "sucesso",
    });

    await carregarPlanoDeHoje();
  } catch (err) {
    let mensagem = err.message;
    try { mensagem = JSON.parse(err.message).error ?? mensagem; } catch (_) { }
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: mensagem || "Erro ao desmarcar intervenção.",
      tipo: "erro",
    });
    cbEl.checked = true;
    cbEl.disabled = false;
    cbEl.style.opacity = "1";
  }
}

carregarUtente(id).then(() => carregarPlanoDeHoje());