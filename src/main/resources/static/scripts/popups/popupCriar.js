function ehCCValido(cc) {
  return /^\d{9}[A-Z]{2}\d$/.test(cc);
}

function calcularIdade(dataNascimento) {
  const [dia, mes, ano] = dataNascimento.split("/").map(Number);
  const nasc = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mesDiff = hoje.getMonth() - nasc.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return idade;
}

function inicializarFormCriar() {
  document.getElementById("data-nascimento").setAttribute("max", dataMax);

  document.getElementById("n-identificacao").addEventListener("input", (e) => {
    let value = e.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 12);
    e.target.value = value;
  });
}

let errorTimer = null;

function showErrorWithCountdown() {
  const msg = document.getElementById("errorBox");
  if (errorTimer) clearInterval(errorTimer);

  let remaining = 30;
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

function abrirCriar() {
  popUpContainer.style.display = "flex";
  popUpCriar.style.display = "flex";
  contentContainer.style.opacity = "0.4";
}

function createUser(event) {
  event.preventDefault();

  const nome = document.getElementById("name").value;
  const dataNascimentoObj = document.getElementById("data-nascimento").value;
  if (!dataNascimentoObj) {
    alert("Preencha a data de nascimento.");
    return;
  }

  const [anoD, mesD, diaD] = dataNascimentoObj.split("-");
  const dataNascimento = `${diaD}/${mesD}/${anoD}`;
  if (calcularIdade(dataNascimento) < 18) {
    alert("O utilizador deve ter pelo menos 18 anos.");
    return;
  }

  const sexo = document.getElementById("sexo").value;
  const numeroCC = document
    .getElementById("n-identificacao")
    .value.replace(/\s/g, "");

  if (!ehCCValido(numeroCC)) {
    alert(
      "CC inválido. Deve conter 9 dígitos, 2 letras e 1 dígito (ex: 123456789AB1).",
    );
    return;
  }

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
    headers: { "Content-Type": "application/json" },
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
        await carregarUtilizadores();
      } else if (res.status === 409) {
        showErrorWithCountdown();
      }
    })
    .catch((err) => console.error("Erro de ligação:", err));
}
