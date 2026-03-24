const popUpContainer = document.querySelector(".pop-up-container");
const popUpCriar = document.querySelector(".pop-up-criar");
const popUpEditar = document.querySelector(".pop-up-editar");
const popUpDesativar = document.querySelector(".pop-up-desativar");
const contentContainer = document.querySelector(".content-container");
const hoje = new Date();
const ano = hoje.getFullYear() - 18;
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");
const dataMax = `${ano}-${mes}-${dia}`;

// Mínimo ter 18 anos
document.getElementById("data-nascimento").setAttribute("max", dataMax);

const input = document.getElementById("n-identificacao");

let errorTimer = null;

function showErrorWithCountdown() {
  const msg = document.getElementById("errorBox");

  if (errorTimer) clearInterval(errorTimer);

  let remaining = 30; // 30 segundos
  msg.style.display = "block";
  msg.textContent = `Dados já se encontram no sistema! (${remaining}s)`;

  errorTimer = setInterval(() => {
    remaining--;
    msg.textContent = `Dados já se encontram no sistema! (${remaining}s)`;

    if (remaining <= 0) {
      clearInterval(errorTimer);
      errorTimer = null;
      msg.style.display = "none";
    }
  }, 1000);
}

// FORMATAR E VALIDAR SE O CC ESTÁ CORRETO
input.addEventListener("input", (e) => {
  let value = e.target.value;

  // remover tudo que não seja letra ou número
  value = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // limitar ao tamanho máximo (12 chars reais)
  value = value.slice(0, 12);

  // aplicar formatação: 12345678 1 AB2
  let formatted = "";

  if (value.length > 0) {
    formatted += value.substring(0, 8);
  }
  if (value.length > 8) {
    formatted += " " + value.substring(8, 9);
  }
  if (value.length > 9) {
    formatted += " " + value.substring(9, 11);
  }
  if (value.length > 11) {
    formatted += value.substring(11, 12);
  }

  e.target.value = formatted;
});

function abrirCriar() {
  popUpContainer.style.display = "flex";
  popUpCriar.style.display = "flex";
  contentContainer.style.opacity = "0.4";
}

function abrirEditar() {
  popUpContainer.style.display = "flex";
  popUpEditar.style.display = "flex";
  contentContainer.style.opacity = "0.4";
}

function abrirDesativar() {
  popUpContainer.style.display = "flex";
  popUpDesativar.style.display = "flex";
  contentContainer.style.opacity = "0.4";
}

function fecharPopUp() {
  popUpContainer.style.display = "none";
  popUpCriar.style.display = "none";
  popUpEditar.style.display = "none";
  popUpDesativar.style.display = "none";
  contentContainer.style.opacity = "1";
}

function createUser(event) {
  event.preventDefault();

  const nome = document.getElementById("name").value;
  const dataNascimentoDesformatada =
    document.getElementById("data-nascimento").value;
  const [ano, mes, dia] = dataNascimentoDesformatada.split("-");
  const dataNascimento = `${dia}/${mes}/${ano}`;
  const sexo = document.getElementById("sexo").value;
  const numeroCC = document
    .getElementById("n-identificacao")
    .value.replace(/\s/g, "");
  const numeroSNS = parseInt(document.getElementById("n-sns").value);
  const email = document.getElementById("email").value;
  const contacto = parseInt(document.getElementById("contacto").value);
  const contactoEmergencia = parseInt(
    document.getElementById("contacto-emg").value,
  );
  const role = document.getElementById("funcao").value;
  const numeroMecanografico = parseInt(
    document.getElementById("n-mecanografico").value,
  );

  fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      numeroMecanografico,
      numeroCC,
      numeroSNS,
      role,
      nome,
      sexo,
      email,
      contacto,
      contactoEmergencia,
      dataNascimento,
    }),
  })
    .then(async (res) => {
      const data = await res.json();

      if (data.success) {
        fecharPopUp();
        document.querySelector(".pop-up-criar form").reset();
      } else {
        if (res.status === 409) {
          showErrorWithCountdown();
          console.error(data.error);
        }
      }
    })
    .catch((err) => {
      console.error("Erro de ligação:", err);
    });
}
