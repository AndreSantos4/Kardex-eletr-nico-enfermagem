const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function carregarUtente(id) {
  try {
    const url = `http://localhost:8080/api/patients/${id}`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!resp.ok) throw new Error("Erro ao carregar utente");
    const json = await resp.json();

    const dados = json.data.dados;
    const processo = dados.processo;
    const dataEntrada = processo.dataEntrada;

    const [dia, mes, ano] = dataEntrada.split("/");
    const dataObj = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    const dias = Math.floor((hoje - dataObj) / (1000 * 60 * 60 * 24));

    const nomeMediaco = processo.medicoResponsavel.dados.nome;
    const camaId = processo.cama.id;

    document.getElementById("header-title").textContent =
      `Kardex - ${dados.nome}`;
    document.getElementById("header-sub").textContent =
      `Proc. ${processo.id} · Cama ${camaId} · ${processo.diagnosticoPrincipal} · ${dias} dia(s) Internado`;

    document.getElementById("utente-nome").textContent = dados.nome;
    document.getElementById("sexo-idade").textContent =
      `${dados.sexo} · ${dados.dataNascimento}`;
    document.getElementById("admissao").textContent = dataEntrada;
    document.getElementById("medico").textContent = nomeMediaco;
    document.getElementById("proc-nasc").textContent =
      `${processo.id} · Nasc. ${dados.dataNascimento}`;
    document.getElementById("cama").textContent = camaId;
    document.getElementById("estado").textContent = `Internado · Dia ${dias}`;
    document.getElementById("diagnostico").textContent =
      processo.diagnosticoPrincipal;

    const riscos = dados.flags.map((r) => {
      const texto = r.replace("RISCO_", "").toLowerCase();
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    });
    document.getElementById("riscos").textContent =
      `Riscos: ${riscos.join(" | ")}`;

    document.getElementById("alergias-list").innerHTML = dados.alergias
      .map((a) => `<div>${a.nome}</div>`)
      .join("");

    const sinaisVitais = processo.sinaisVitais;
    if (sinaisVitais && sinaisVitais.length > 0) {
      const sv = sinaisVitais[sinaisVitais.length - 1];
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
  } catch (_) {
    alert("Erro de ligação ao servidor.");
  }
}

carregarUtente(id);
