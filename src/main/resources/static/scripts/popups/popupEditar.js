let utilizadorOriginal = null;

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

function inicializarFormEditar() {
  document.getElementById("edit-data-nascimento").setAttribute("max", dataMax);

  document
    .getElementById("edit-n-identificacao")
    .addEventListener("input", (e) => {
      let value = e.target.value
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 12);
      e.target.value = value;
    });
}

function abrirEditar(id) {
  const u = todosUtilizadores.find((x) => x.id === id);
  if (!u) return;

  const form = popUpEditar.querySelector("form");
  form.querySelector("#edit-name").value = u.nome;
  form.querySelector("#edit-sexo").value = u.sexo;
  form.querySelector("#edit-n-identificacao").value = u.numeroCC;
  form.querySelector("#edit-n-sns").value = u.numeroSNS;
  form.querySelector("#edit-email").value = u.email;
  form.querySelector("#edit-contacto").value = u.contacto;
  form.querySelector("#edit-contacto-emg").value = u.contactoEmergencia;
  form.querySelector("#edit-funcao").value = u.role;

  if (u.dataNascimento) {
    const [d, m, a] = u.dataNascimento.split("/");
    form.querySelector("#edit-data-nascimento").value = `${a}-${m}-${d}`;
  }

  form.dataset.userId = id;

  utilizadorOriginal = {
    numeroMecanografico: u.numeroMecanografico,
    nome: u.nome,
    sexo: u.sexo,
    numeroCC: u.numeroCC,
    numeroSNS: String(u.numeroSNS),
    email: u.email,
    contacto: String(u.contacto),
    contactoEmergencia: String(u.contactoEmergencia),
    role: u.role,
    dataNascimento: u.dataNascimento ?? "",
  };

  popUpContainer.style.display = "flex";
  popUpEditar.style.display = "flex";
  contentContainer.style.opacity = "0.4";
}

async function guardarEdicao() {
  const form = popUpEditar.querySelector("form");
  const id = form.dataset.userId;

  const dataNascimentoRaw = form.querySelector("#edit-data-nascimento").value;
  let dataNascimento = "";
  if (dataNascimentoRaw) {
    const [a, m, d] = dataNascimentoRaw.split("-");
    dataNascimento = `${d}/${m}/${a}`;
  }

  const numeroCC = form
    .querySelector("#edit-n-identificacao")
    .value.replace(/\s/g, "");

  if (!ehCCValido(numeroCC)) {
    alert(
      "CC inválido. Deve conter 9 dígitos, 2 letras e 1 dígito (ex: 123456789AB1).",
    );
    return;
  }

  if (dataNascimento && calcularIdade(dataNascimento) < 18) {
    alert("O utilizador deve ter pelo menos 18 anos.");
    return;
  }

  const atual = {
    nome: form.querySelector("#edit-name").value,
    sexo: form.querySelector("#edit-sexo").value,
    numeroCC,
    numeroSNS: form.querySelector("#edit-n-sns").value,
    email: form.querySelector("#edit-email").value,
    contacto: form.querySelector("#edit-contacto").value,
    contactoEmergencia: form.querySelector("#edit-contacto-emg").value,
    role: form.querySelector("#edit-funcao").value,
    dataNascimento,
  };

  const houveMudancas = Object.keys(atual).some(
    (key) => atual[key] !== utilizadorOriginal[key],
  );

  if (!houveMudancas) {
    alert("Tens de fazer alguma alteração nos dados!");
    return;
  }

  const body = {
    numeroMecanografico: utilizadorOriginal.numeroMecanografico,
    nome: atual.nome,
    sexo: atual.sexo,
    numeroCC: atual.numeroCC,
    numeroSNS: parseInt(atual.numeroSNS),
    email: atual.email,
    contacto: parseInt(atual.contacto),
    contactoEmergencia: parseInt(atual.contactoEmergencia),
    role: atual.role,
    dataNascimento: atual.dataNascimento,
  };

  try {
    const resp = await fetch(`http://localhost:8080/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error("Erro ao guardar utilizador");

    fecharPopUp();
    await carregarUtilizadores();
  } catch (err) {
    console.error(err);
  }
}
