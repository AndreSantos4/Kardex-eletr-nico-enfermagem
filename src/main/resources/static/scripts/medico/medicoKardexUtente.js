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
    const dataEntrada = dados.processo.dataEntrada;

    document.getElementById("nome-utente").innerHTML = dados.nome;
    document.getElementById("sexo").innerHTML = dados.sexo;
    document.getElementById("idade").innerHTML =
      "fuck"; /*sem idade no crlho do endpoint*/
    document.getElementById("data").innerHTML = dados.processo.dataEntrada;
    document.getElementById("hora").innerHTML =
      "fuck"; /*sem hora no crlho do endpoint*/
    document.getElementById("medico").innerHTML =
      dados.processo.medicoResponsavel.dados.nome;

    document.getElementById("processo").innerHTML = dados.processo.id;
    document.getElementById("data-nascimento").innerHTML = dados.dataNascimento;
    document.getElementById("cama").innerHTML = dados.processo.cama.id;

    const [dia, mes, ano] = dataEntrada.split("/");
    const data = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    const diff = hoje - data;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    document.getElementById("estado").innerHTML = "Internado";
    document.getElementById("dias-internado").innerHTML = dias;

    const riscos = dados.flags;
    const container = document.querySelector(".riscos");
    const lista = riscos.map((r) => {
      let texto = r.replace("RISCO_", "").toLowerCase();
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    });
    container.innerHTML = `
        <p style="color: white; font-weight: bolder;">
            Riscos:&nbsp; ${lista.join(" | ")}
        </p>
    `;

    const alertasContainer = document.getElementById("alertas");
    alertasContainer.innerHTML = dados.alergias
      .map(
        (a) => `
        <div class="alerta">
            <p id="nome-medicamento">${a.nome}</p>
        </div>
    `,
      )
      .join("");

    const sinaisVitais = dados.processo.sinaisVitais;
    if (sinaisVitais && sinaisVitais.length > 0) {
      const sv = sinaisVitais[sinaisVitais.length - 1];
      document.getElementById("tensao-art").innerHTML =
        `${sv.tensaoArteriaSistolica}/${sv.tensaoArteriaDistolica}`;
      document.getElementById("freq-card").innerHTML = sv.frequenciaCardiaca;
      document.getElementById("temperatura").innerHTML = sv.temperatura;
      document.getElementById("spo2").innerHTML = sv.spo2;
      document.getElementById("dor").innerHTML = sv.dor;
      document.getElementById("glicemia").innerHTML = sv.glicemia;
    }
  } catch (_) {
    alert("Erro de ligação ao servidor.");
  }
}

carregarUtente(id);
