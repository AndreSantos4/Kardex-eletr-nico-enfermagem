const contentContainer = document.querySelector(".content-container");
const popUpContainer = document.querySelector(".pop-up-container");
let popUpCriarUtentes;
const hoje = new Date().toISOString().split("T")[0];

async function abrirpopup() {
  const container = document.getElementById("popUpContainer");

  if (document.querySelector(".pop-up-criar-utente")) {
    abrirCriarUtente();
    return;
  }

  const resp = await fetch(`pages/enfermeiro/popups/popupCriarUtente.html`);
  const html = await resp.text();
  container.insertAdjacentHTML("beforeend", html);

  popUpCriarUtentes = document.querySelector(".pop-up-criar-utente");

  inicializarFormCriarUtente();

  criarSearchableSelect("medico-responsavel", [], "Pesquisar médico...");
  criarSearchableSelect("cama", [], "Pesquisar cama...");

  await carregarMedicos();
  await carregarCamas();

  abrirCriarUtente();
}

function abrirCriarUtente() {
  popUpContainer.style.display = "flex";
  contentContainer.style.opacity = "0.4";
  document.getElementById("data-nascimento").setAttribute("max", hoje);
}

function fecharPopUp() {
  popUpContainer.style.display = "none";
  contentContainer.style.opacity = "1";
}

function abreviarNome(nomeCompleto) {
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length <= 1) return nomeCompleto;
  return `${partes[0]} ${partes[partes.length - 1]}`;
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

async function carregarMedicos() {
  try {
    const res = await fetch("http://localhost:8080/api/workers/medics", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
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

    const wrapper =
      document.getElementById("medico-responsavel")?.parentElement;
    if (wrapper?._popularItens) {
      wrapper._popularItens(items);
    }
  } catch (err) {
    console.error("Erro de ligação ao carregar médicos:", err);
  }
}

async function carregarCamas() {
  try {
    const res = await fetch(
      "http://localhost:8080/api/processes/beds?o=false",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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

    const select = document.getElementById("cama");
    const wrapper = select?.parentElement;

    if (wrapper?._popularItens) {
      wrapper._popularItens(items);
    }
  } catch (err) {
    console.error("Erro de ligação ao carregar camas:", err);
  }
}

function criarUtente(dados) {
  const flagMap = {
    fuga: "RISCO_FUGA",
    automotilacao: "RISCO_AUTOMOTILACAO",
    queda: "RISCO_QUEDA",
    agressividade: "RISCO_AGRESSIVIDADE",
  };

  const [ano, mes, dia] = dados.dataNascimento.split("-");
  const dataNascimentoFormatada = `${dia}/${mes}/${ano}`;

  const body = {
    nome: dados.nome,
    dataNascimento: dataNascimentoFormatada,
    sexo: dados.sexo,
    camaId: dados.cama,
    numeroCC: dados.nIdentificacao,
    numeroSNS: Number(dados.nSns),
    diagnosticoPrincipal: dados.diagnosticoPrincipal,
    contacto: Number(dados.contacto),
    contactoEmergencia: Number(dados.contactoEmergencia),
    medicoId: Number(dados.medicoId),
    motivoInternamento: dados.motivoInternamento,
    flagsRisco: dados.flags.map((f) => flagMap[f] || f),
    alergias: dados.alergias.map((nome) => ({ nome })),
  };

  fetch("http://localhost:8080/api/patients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(body),
  })
    .then(async (res) => {
      const data = await res.json();
      if (data.success) {
        fecharPopUp();
        document.querySelector(".pop-up-criar-utente form").reset();
        document
          .querySelectorAll(".searchable-select-input")
          .forEach((el) => (el.value = ""));
      } else if (res.status === 409) {
        console.error("Erro");
      }
    })
    .catch((err) => console.error("Erro de ligação:", err));
}

function inicializarFormCriarUtente() {
  document
    .querySelector(".btn-adicionar-alergia")
    .addEventListener("click", function () {
      const alergiasBox = document.querySelector(".alergias-box");
      const inputs = alergiasBox.querySelectorAll(
        '.alergia-item input[type="text"]',
      );
      const ultimoInput = inputs[inputs.length - 1];

      if (!ultimoInput.value.trim()) {
        ultimoInput.focus();
        ultimoInput.style.borderColor = "rgb(220, 49, 26)";
        ultimoInput.placeholder = "Preenche este campo primeiro";
        setTimeout(() => {
          ultimoInput.style.borderColor = "";
          ultimoInput.placeholder = "Alergia";
        }, 2000);
        return;
      }

      const novoItem = document.createElement("div");
      novoItem.classList.add("alergia-item");
      novoItem.innerHTML = `
        <input type="text" placeholder="Alergia" />
        <button type="button" class="btn-remover-alergia">−</button>
      `;
      alergiasBox.appendChild(novoItem);
      novoItem.querySelector("input").focus();
      alergiasBox.scrollTop = alergiasBox.scrollHeight;
    });

  document
    .querySelector(".alergias-box")
    .addEventListener("click", function (e) {
      if (e.target.classList.contains("btn-remover-alergia")) {
        const todosItens = this.querySelectorAll(".alergia-item");
        if (todosItens.length > 1) {
          e.target.closest(".alergia-item").remove();
        } else {
          const input = e.target.previousElementSibling;
          input.value = "";
          input.focus();
        }
      }
    });

  document
    .querySelector(".pop-up form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const dadosUtente = {
        nome: document.getElementById("name").value.trim(),
        dataNascimento: document.getElementById("data-nascimento").value,
        sexo: document.getElementById("sexo").value,
        cama: document.getElementById("cama").value,
        nIdentificacao: document.getElementById("n-identificacao").value.trim(),
        nSns: document.getElementById("n-sns").value.trim(),
        medicoId: document.getElementById("medico-responsavel").value,
        diagnosticoPrincipal: document
          .getElementById("diagnostico-principal")
          .value.trim(),
        contacto: document.getElementById("contacto").value.trim(),
        contactoEmergencia: document
          .getElementById("contacto-emg")
          .value.trim(),
        alergias: Array.from(
          document.querySelectorAll('.alergia-item input[type="text"]'),
        )
          .map((input) => input.value.trim())
          .filter((val) => val !== ""),
        flags: Array.from(
          document.querySelectorAll('input[name="flags"]:checked'),
        ).map((cb) => cb.value),
        motivoInternamento: document
          .querySelector('textarea[name="motivo-internamento"]')
          .value.trim(),
      };

      criarUtente(dadosUtente);
    });
}
