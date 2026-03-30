(function () {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("u");
  const token = params.get("t");

  const msgError = document.getElementById("msgError");

  if (!userId || !token) {
    mostrarErro("Link inválido ou expirado. Solicite um novo reset de password.");
    document.getElementById("btn-submit").disabled = true;
  }

  async function submeterNovaPassword(event) {
    event.preventDefault();
    limparErro();

    const newPassword = document.getElementById("nova-password").value;
    const confirmar = document.getElementById("confirmar-password").value;

    if (newPassword !== confirmar) {
      mostrarErro("As passwords não coincidem.");
      return;
    }

    if (newPassword.length < 8) {
      mostrarErro("A password deve ter no mínimo 8 caracteres.");
      return;
    }

    const btn = document.getElementById("btn-submit");
    btn.disabled = true;
    btn.value = "A processar...";

    try {
      const response = await fetch(
        `/api/users/${userId}/change-password?token=${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: newPassword }),
        }
      );

      if (response.ok) {
        document.getElementById("form-nova-password").style.display = "none";
        document.getElementById("sucesso").style.display = "block";
      } else {
        const data = await response.json().catch(() => ({}));
        const mensagem =
          data?.message || "Erro ao alterar a password. O link pode ter expirado.";
        mostrarErro(mensagem);
        btn.disabled = false;
        btn.value = "ALTERAR PASSWORD";
      }
    } catch (_) {
      mostrarErro("Erro de ligação ao servidor. Tente novamente.");
      btn.disabled = false;
      btn.value = "ALTERAR PASSWORD";
    }
  }

  function mostrarErro(msg) {
    msgError.textContent = msg;
  }

  function limparErro() {
    msgError.textContent = "";
  }

  window.submeterNovaPassword = submeterNovaPassword;
})();