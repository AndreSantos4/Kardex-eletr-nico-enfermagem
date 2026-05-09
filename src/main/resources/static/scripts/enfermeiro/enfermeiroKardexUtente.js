const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function abrirPaginaPlano() {
  window.location.href = `enfermeiroPlanoCuidados?id=${id}`;
}

let processoId = null;
let utenteData = null;
let processoData = null;
let medicoData = null;
let caseData = null;
const TOLERANCIA_ATRASO_MIN = 30;
let _popupAltoRisco = false;

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
  if (!select) return;
  if (select.parentElement.classList.contains("searchable-select-wrapper"))
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
    const lis = dropdown.querySelectorAll("li");
    let algumVisivel = false;
    lis.forEach((li) => {
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

function abreviarNome(nomeCompleto) {
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length <= 1) return nomeCompleto;
  return `${partes[0]} ${partes[partes.length - 1]}`;
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

    const wrapper = document.getElementById(selectId)?.parentElement;
    if (wrapper?._popularItens) wrapper._popularItens(items);
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

    const wrapper = document.getElementById(selectId)?.parentElement;
    if (wrapper?._popularItens) wrapper._popularItens(items);
  } catch (err) {
    console.error("Erro de ligação ao carregar camas:", err);
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
  alergias.forEach((a) => {
    const valor = typeof a === "string" ? a : (a.nome ?? "");
    adicionarLinhaAlergiaEditar(alergiaBox, valor);
  });

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

    const dataLivres = await resLivres.json();
    const dataOcupadas = await resOcupadas.json();

    const livres = dataLivres.success ? dataLivres.data : [];
    const ocupadas = dataOcupadas.success ? dataOcupadas.data : [];

    const camaActualId = caseData.cama !== "—" ? String(caseData.cama) : null;
    const camaActual = camaActualId
      ? ocupadas.find((c) => String(c.id) === camaActualId)
      : null;
    const todas = [...livres];
    if (camaActual && !todas.find((c) => String(c.id) === camaActualId)) {
      todas.push(camaActual);
    }

    todas.sort((a, b) => a.id - b.id);

    const items = todas.map((c) => ({ value: c.id, label: `Cama ${c.id}` }));

    const wrapper = document.getElementById("edit-cama")?.parentElement;
    if (wrapper?._popularItens) wrapper._popularItens(items);
  } catch (err) {
    console.error("Erro ao carregar camas para edição:", err);
    if (caseData.cama !== "—") {
      const wrapper = document.getElementById("edit-cama")?.parentElement;
      if (wrapper?._popularItens) {
        wrapper._popularItens([
          { value: caseData.cama, label: `Cama ${caseData.cama}` },
        ]);
      }
    }
  }
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
    if (linhas.length > 1) {
      item.remove();
    } else {
      item.querySelector("input").value = "";
    }
  });
  container.appendChild(item);
  container.scrollTop = container.scrollHeight;
}

async function editarUtente(event) {
  event.preventDefault();

  const dataRaw = document.getElementById("edit-data-nascimento").value;
  const [ano, mes, dia] = dataRaw.split("-");
  const dataNascimento = `${dia}/${mes}/${ano}`;

  const alergias = Array.from(
    document
      .getElementById("edit-alergias-box")
      .querySelectorAll('input[type="text"]'),
  )
    .map((i) => i.value.trim())
    .filter(Boolean)
    .map((nome) => ({ nome }));

  const todasFlags = Array.from(
    document.querySelectorAll("input[name='edit-flags']"),
  );
  const flagsRisco = todasFlags
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  const camaValor = document.getElementById("edit-cama").value;
  const camaId = camaValor && camaValor !== "—" ? camaValor : null;

  const body = {
    nome: document.getElementById("edit-name").value.trim(),
    dataNascimento,
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
    camaId,
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
  const agora = new Date();
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById("data-hora").value = local;
  abrirPopUp(".pop-up-sinaisVitais");
}

async function registarSinaisVitais(event) {
  event.preventDefault();

  if (!processoId) {
    alert("Processo não identificado. Tente recarregar a página.");
    return;
  }

  const dataHoraRaw = document.getElementById("data-hora").value;
  const [dataParte, horaParte] = dataHoraRaw.split("T");
  const [ano, mes, dia] = dataParte.split("-");
  const dataFormatada = `${dia}/${mes}/${ano}:${horaParte}:00`;

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
    data: dataFormatada,
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

async function carregarUtente(id) {
  try {
    const resp = await fetch(`http://localhost:8080/api/patients/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!resp.ok) {
      const erroTexto = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${erroTexto}`);
    }

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

    caseData = {
      cama: processo.cama?.id ?? "—",
    };

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

    renderizarMedicacaoAtiva(processoData.prescricoes);
  } catch (err) {
    console.error("Erro em carregarUtente:", err);
    alert(`Erro de ligação ao servidor.\n\nDetalhe: ${err.message}`);
  }
}

function irParaHistoricoPrescricoes() {
  window.location.href = `enfermeiroHistoricoPrescricoes?id=${id}`;
}

carregarUtente(id);
let prescricaoSelecionadaId = null;

function renderizarMedicacaoAtiva(prescricoes) {
  const body = document.getElementById("medicacao-body");
  body.innerHTML = "";

  const ativas = prescricoes.filter((p) => p.estado == "ATIVA");

  if (ativas.length === 0) {
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

    const altoRisco =
      (p.medicamento?.altoRisco ?? false) || (p.altoRisco ?? false);
    const horariosPrevistos = p.horariosPrevistos ?? [];

    const row = document.createElement("div");
    row.className = "med-row";
    row.style.cssText = `
      display:flex; justify-content:space-between; align-items:center;
      padding: 8px 10px; border-bottom: 1px solid var(--border);
      font-size: 13px; gap: 8px;
    `;

    const badgeAltoRisco = altoRisco
      ? `<span style="
          display:inline-block; margin-left:6px;
          background:rgb(220,49,26); color:#fff;
          font-size:10px; font-weight:700; letter-spacing:.5px;
          padding:1px 5px; border-radius:3px; vertical-align:middle;
        ">ALTO RISCO</span>`
      : "";

    row.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:600;color:var(--surface)">
          ${nomeMed}${badgeAltoRisco}
        </div>
        <div style="color:var(--surface);margin-top:2px">${doseVal} · ${freq} · Via: ${via}</div>
        <div style="color:var(--surface);font-size:11px">Até ${fim}</div>
      </div>
      <button class="btn-administrar"
        onclick="abrirPopUpAdministrarMedicacao(
          ${p.id},
          '${nomeMed}',
          '${doseVal}',
          '${via}',
          ${altoRisco},
          ${JSON.stringify(horariosPrevistos)}
        )">
        ADMINISTRAR
      </button>
    `;
    body.appendChild(row);
  });
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

  const agora = new Date();
  document.getElementById("hora-de-toma").textContent =
    agora.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById("data-hora").value = local;
  document.getElementById("observacoes").value = "";

  const cbRecusa = document.getElementById("recusa-medicacao");
  if (cbRecusa) cbRecusa.checked = false;

  const warningBox = document.getElementById("warning-box");
  const warningText = document.getElementById("warning-text");
  const avisos = [];

  const atrasoMin = calcularAtrasoMinutos(horariosPrevistos);
  if (atrasoMin > 0) {
    const tolerancia = TOLERANCIA_ATRASO_MIN;
    if (atrasoMin > tolerancia) {
      avisos.push(
        `Atraso de ${atrasoMin} min. Tolerância: ${tolerancia} min. Fora do limite aceitável — documente o motivo nas observações.`,
      );
    } else {
      avisos.push(
        `Atraso de ${atrasoMin} min. Tolerância: ${tolerancia} min. Dentro do limite aceitável.`,
      );
    }
  }

  if (avisos.length > 0) {
    warningText.innerHTML = avisos.join("<br>");
    warningBox.style.display = "flex";
  } else {
    warningBox.style.display = "none";
  }

  const secaoAltoRisco = document.getElementById("alto-risco-verificacao");
  const cbConfirmar = document.getElementById("confirmar-alto-risco");
  if (secaoAltoRisco) {
    secaoAltoRisco.style.display = altoRisco ? "block" : "none";
  }
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

  const [dataParte, horaParte] = dataHoraRaw.split("T");
  const [ano, mes, dia] = dataParte.split("-");
  const dataFormatada = `${dia}/${mes}/${ano}:${horaParte}:00`;

  const body = {
    foi_administrado: !recusa,
    observacoes:
      observacoes ||
      (recusa
        ? "Recusa/impossibilidade de administração"
        : "Administrado sem intercorrências"),
    data: dataFormatada,
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
    const errorData = JSON.parse(err.message);
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: errorData.error || "Erro ao registar administração.",
      tipo: "erro",
    });
  }
}

function calcularAtrasoMinutos(horariosPrevistos) {
  if (!horariosPrevistos?.length) return 0;
  const agora = new Date();
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();

  let maiorAtraso = 0;
  for (const h of horariosPrevistos) {
    const [hh, mm] = h.split(":").map(Number);
    const prevMin = hh * 60 + mm;

    if (prevMin <= agoraMin) {
      const diff = agoraMin - prevMin;
      if (diff > maiorAtraso) maiorAtraso = diff;
    }
  }
  return maiorAtraso;
}

function atualizarBotaoRegistar() {
  const btn = document.getElementById("btn-registar");
  if (!btn) return;

  if (_popupAltoRisco) {
    const confirmado =
      document.getElementById("confirmar-alto-risco")?.checked ?? false;
    const recusa =
      document.getElementById("recusa-medicacao")?.checked ?? false;
    btn.disabled = !confirmado && !recusa;
    btn.style.opacity = !confirmado && !recusa ? "0.45" : "1";
    btn.style.cursor = !confirmado && !recusa ? "not-allowed" : "pointer";
  } else {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
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
    if (linhas.length > 1) {
      item.remove();
    } else {
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
      const parsed = JSON.parse(err.message);
      mensagem = parsed.error || mensagem;
    } catch (_) {}
    console.log(mensagem);
    mostrarNotificacao({
      titulo: "Erro",
      mensagem: mensagem || "Erro ao criar plano de cuidados.",
      tipo: "erro",
    });
  }
}

carregarUtente(id);
