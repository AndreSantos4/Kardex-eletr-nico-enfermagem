const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let processoId = null;

async function carregarPopUp(caminho) {
  const container = document.getElementById("popup-container");

  // Evita carregar o mesmo popup duas vezes
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
    if (!resp.ok) throw new Error();
    const json = await resp.json();

    const dados = json.data.dados;
    const processo = dados.processo;
    processoId = processo.id;

    const [dia, mes, ano] = processo.dataEntrada.split("/");
    const dias = Math.floor((new Date() - new Date(ano, mes - 1, dia)) / 86400000);

    document.getElementById("header-title").textContent = `Kardex - ${dados.nome}`;
    document.getElementById("header-sub").textContent =
      `Proc. ${processo.id} · Cama ${processo.cama.id} · ${processo.diagnosticoPrincipal} · ${dias} dia(s) Internado`;
    document.getElementById("utente-nome").textContent = dados.nome;
    document.getElementById("sexo-idade").textContent = `${dados.sexo} · ${dados.dataNascimento}`;
    document.getElementById("admissao").textContent = processo.dataEntrada;
    document.getElementById("medico").textContent = processo.medicoResponsavel.dados.nome;
    document.getElementById("proc-nasc").textContent = `${processo.id} · Nasc. ${dados.dataNascimento}`;
    document.getElementById("cama").textContent = processo.cama.id;
    document.getElementById("estado").textContent = `Internado · Dia ${dias}`;
    document.getElementById("diagnostico").textContent = processo.diagnosticoPrincipal;

    const riscos = dados.flags.map((r) => {
      const t = r.replace("RISCO_", "").toLowerCase();
      return t.charAt(0).toUpperCase() + t.slice(1);
    });
    document.getElementById("riscos").textContent = `Riscos: ${riscos.join(" | ")}`;
    document.getElementById("alergias-list").innerHTML = dados.alergias
      .map((a) => `<div>${a.nome}</div>`)
      .join("");

    const svs = processo.sinaisVitais;
    if (svs?.length > 0) atualizarSinaisVitaisUI(svs[svs.length - 1]);
  } catch {
    alert("Erro de ligação ao servidor.");
  }
}

carregarUtente(id);
