const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let processoId = null;
let utenteData = null;
let processoData = null;
let medicoData = null;
let caseData = null;

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
  if (select.parentElement.classList.contains("searchable-select-wrapper")) return;

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
    if (!data.success) { console.error("Erro ao carregar médicos:", data.message); return; }

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
    const res = await fetch("http://localhost:8080/api/processes/beds?o=false", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    if (!data.success) { console.error("Erro ao carregar camas:", data.message); return; }

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
  await carregarPopUp("../../pages/enfermeiro/popups/popupEditarFichaUtente.html");

  document.getElementById("edit-name").value = utenteData.nome ?? "";
  document.getElementById("edit-sexo").value = utenteData.sexo ?? "";
  document.getElementById("edit-n-identificacao").value = utenteData.numeroCC ?? "";
  document.getElementById("edit-n-sns").value = utenteData.numeroSNS ?? "";
  document.getElementById("edit-contacto").value = utenteData.contacto ?? "";
  document.getElementById("edit-contacto-emg").value = utenteData.contactoEmergencia ?? "";

  if (utenteData.dataNascimento) {
    const [dia, mes, ano] = utenteData.dataNascimento.split("/");
    document.getElementById("edit-data-nascimento").value = `${ano}-${mes}-${dia}`;
  }

  criarSearchableSelect("edit-medico-responsavel", [], "Pesquisar médico...");
  criarSearchableSelect("edit-cama", [], "Pesquisar cama...");

  await carregarMedicosNoSelect("edit-medico-responsavel");
  definirValorSearchableSelect(
    "edit-medico-responsavel",
    String(medicoData.id ?? ""),
    abreviarNome(medicoData.nome ?? "")
  );

  await carregarCamasEdicao();
  definirValorSearchableSelect(
    "edit-cama",
    caseData.cama !== "—" ? String(caseData.cama) : "",
    caseData.cama !== "—" ? `Cama ${caseData.cama}` : "Sem cama"
  );

  document.querySelectorAll("input[name='edit-flags']").forEach((cb) => {
    cb.checked = utenteData.flags?.includes(cb.value) ?? false;
  });

  const alergiaBox = document.getElementById("edit-alergias-box");
  alergiaBox.innerHTML = "";

  const alergias = utenteData.alergias?.length > 0 ? utenteData.alergias : [{ nome: "" }];
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
    const camaActual = camaActualId ? ocupadas.find((c) => String(c.id) === camaActualId) : null;
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
        wrapper._popularItens([{ value: caseData.cama, label: `Cama ${caseData.cama}` }]);
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
    document.getElementById("edit-alergias-box").querySelectorAll('input[type="text"]')
  ).map((i) => i.value.trim())
    .filter(Boolean)
    .map((nome) => ({ nome }));

  const todasFlags = Array.from(document.querySelectorAll("input[name='edit-flags']"));
  const flagsRisco = todasFlags.filter((cb) => cb.checked).map((cb) => cb.value);

  const camaValor = document.getElementById("edit-cama").value;
  const camaId = camaValor && camaValor !== "—"
    ? camaValor
    : null;

  console.log(camaId);

  const body = {
    nome: document.getElementById("edit-name").value.trim(),
    dataNascimento,
    sexo: document.getElementById("edit-sexo").value,
    numeroCC: document.getElementById("edit-n-identificacao").value.trim(),
    numeroSNS: parseInt(document.getElementById("edit-n-sns").value),
    contacto: parseInt(document.getElementById("edit-contacto").value),
    contactoEmergencia: parseInt(document.getElementById("edit-contacto-emg").value),
    medicoId: parseInt(document.getElementById("edit-medico-responsavel").value),
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

    if (!resp.ok) throw new Error((await resp.text()) || "Erro ao editar utente");

    fecharPopUp(".pop-up-editar-utente");
    carregarUtente(id);
  } catch (err) {
    alert(`Erro: ${err.message}`);
  }
}

async function abrirPopUpSinaisVitais() {
  await carregarPopUp("../../pages/enfermeiro/popups/popupRegistarSinaisVitais.html");
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
    tensaoArteriaSistolica: parseInt(document.getElementById("pa-sistolica").value),
    tensaoArteriaDistolica: parseInt(document.getElementById("pa-diastolica").value),
    frequenciaCardiaca: parseInt(document.getElementById("freq-cardiaca").value),
    temperatura: parseInt(document.getElementById("temperatura").value),
    spo2: parseInt(document.getElementById("spo2").value),
    dor: parseInt(document.getElementById("dor").value),
    glicemia: parseInt(document.getElementById("glicemia").value),
    observacoes: document.getElementById("observacoes").value || null,
    data: dataFormatada,
  };

  try {
    const resp = await fetch(`http://localhost:8080/api/processes/${processoId}/vitals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error(await resp.text() || "Erro ao registar sinais vitais");

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

    if (!dados) throw new Error("Estrutura da resposta inesperada: dados ausentes");

    const processo = dados.processo;
    if (!processo) throw new Error("Estrutura da resposta inesperada: processo ausente");

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
    };

    medicoData = {
      id: processo.medicoResponsavel?.id ?? null,
      nome: processo.medicoResponsavel?.dados?.nome ?? "Sem médico",
    };

    caseData = {
      cama: processo.cama?.id ?? "—",
    };

    const [dia, mes, ano] = processo.dataEntrada.split("/");
    const dias = Math.floor((new Date() - new Date(ano, mes - 1, dia)) / 86400000);

    document.getElementById("header-title").textContent = `Kardex - ${utenteData.nome}`;
    document.getElementById("header-sub").textContent =
      `Proc. ${processoData.id} · Cama ${caseData.cama} · ${processoData.diagnosticoPrincipal} · ${dias} dia(s) Internado`;
    document.getElementById("utente-nome").textContent = utenteData.nome;
    document.getElementById("sexo-idade").textContent = `${utenteData.sexo} · ${utenteData.dataNascimento}`;
    document.getElementById("admissao").textContent = processoData.dataEntrada;
    document.getElementById("medico").textContent = medicoData.nome;
    document.getElementById("proc-nasc").textContent = `${processoData.id} · Nasc. ${utenteData.dataNascimento}`;
    document.getElementById("cama").textContent = caseData.cama;
    document.getElementById("estado").textContent = `Internado · Dia ${dias}`;
    document.getElementById("diagnostico").textContent = processoData.diagnosticoPrincipal;

    const riscos = utenteData.flags.map((r) => {
      const t = r.replace("RISCO_", "").toLowerCase();
      return t.charAt(0).toUpperCase() + t.slice(1);
    });
    document.getElementById("riscos").textContent = `Riscos: ${riscos.join(" | ")}`;

    document.getElementById("alergias-list").innerHTML = utenteData.alergias
      .map((a) => `<div>${typeof a === "string" ? a : a.nome}</div>`)
      .join("");

    const svs = processoData.sinaisVitais;
    if (svs?.length > 0) atualizarSinaisVitaisUI(svs[svs.length - 1]);

  } catch (err) {
    console.error("Erro em carregarUtente:", err);
    alert(`Erro de ligação ao servidor.\n\nDetalhe: ${err.message}`);
  }
}

carregarUtente(id);