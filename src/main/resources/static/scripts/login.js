let errorTimer = null;
let numeroMecanografico = 0;

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

  numeroMecanografico = document.getElementById("numero_mecanografico").value;

  const password = document.getElementById("password").value;

  if (!numeroMecanografico || !password || numeroMecanografico == 0) {
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
        document.getElementById("login-campo-auth").style.display = "none";
        document.getElementById("login-campo-m2f").style.display = "block";
      } else {
        showErrorWithCountdown();
      }
    })
    .catch((err) => {
      console.log("Erro na requisição:", err);
    });
}

function validateM2F(event) {
  event.preventDefault();

  const codigo = document.getElementById("code-authn").value;

  if (!codigo || !numeroMecanografico || numeroMecanografico == 0) {
    alert("Preenche todos os campos!");
    return;
  }

  console.log(numeroMecanografico);
  console.log(codigo);

  fetch("http://localhost:8080/api/auth/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      numeroMecanografico,
      codigo,
    }),
  })
    .then(async (res) => {
      if (res.status === 200) {
        document.getElementById("login-campo-auth").style.display = "block";
        document.getElementById("login-campo-m2f").style.display = "none";
        fetch("http://localhost:8080/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(async (res) => {
            if (res.status === 200) {
              const data = await res.json();

              console.log(data.data.role);

              switch (data.data.role) {
                case "ADMIN":
                  window.location.replace(
                    "http://localhost:8080/pages/admin/adminDashboard.html",
                  );
                  break;
                case "MEDICO":
                  window.location.replace(
                    "http://localhost:8080/pages/medico/medicoDashboard.html",
                  );
                  break;
                case "ENFERMEIRO":
                  window.location.replace(
                    "http://localhost:8080/pages/medico/medicoDashboard.html",
                  );
                  break;
                case "ENFERMEIRO_CHEFE":
                  window.location.replace(
                    "http://localhost:8080/pages/medico/medicoDashboard.html",
                  );
                  break;
                default:
                  console.log("Erro, cargo não existe!");
                  break;
              }
            }
          })
          .catch((err) => {
            console.log("Erro na requisição:", err);
          });
      }
    })
    .catch((err) => {
      console.log("Erro na requisição:", err);
    });
}
