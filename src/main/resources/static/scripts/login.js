let errorTimer = null;

function showErrorWithCountdown() {
  const msg = document.getElementById("msgError");

  if (errorTimer) clearInterval(errorTimer);

  let remaining = 30; // 30 segundos
  msg.style.display = "block";
  msg.textContent = `Credenciais Incorretas (${remaining}s)`;

  errorTimer = setInterval(() => {
    remaining--;
    msg.textContent = `Credenciais Incorretas (${remaining}s)`;

    if (remaining <= 0) {
      clearInterval(errorTimer);
      errorTimer = null;
      msg.style.display = "none";
    }
  }, 1000);
}

function validateForm(event) {
  event.preventDefault();

  const numeroMecanografico = document.getElementById(
    "numero_mecanografico",
  ).value;
  const password = document.getElementById("password").value;

  if (!numeroMecanografico || !password) {
    alert("Preenche todos os campos!");
    return;
  }

  fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      numeroMecanografico,
      password,
    }),
  })
    .then(async (res) => {
      if (res.status === 200) {
        const data = await res.json();
        //FALCATRUAR O 2FA
        //document.getElementById("login-campo-auth").style.display = "none";
        //document.getElementById("login-campo-m2f").style.display = "block";
        window.location.replace(
          "http://localhost:8080/pages/admin/adminDashboard.html",
        );

        //CONTINUAÇÃO COM O 2FA
      } else {
        showErrorWithCountdown();
      }
    })
    .catch((err) => {
      console.log("Erro na requisição:", err);
    });
}
