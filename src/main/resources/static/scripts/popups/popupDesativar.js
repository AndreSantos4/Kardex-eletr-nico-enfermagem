function abrirDesativar(id, nome, role, nMec) {
  popUpDesativar.querySelector("#desativar-info").textContent =
    `Utilizador - ${nome} (${role}) - Nº ${nMec}`;
  popUpDesativar.dataset.userId = id;

  popUpContainer.style.display = "flex";
  popUpDesativar.style.display = "flex";
  contentContainer.style.opacity = "0.4";
}

async function confirmarDesativar() {
  const id = popUpDesativar.dataset.userId;
  const reason = document.getElementById("motivo").value.trim();

  if (!reason) {
    alert("O motivo é obrigatório.");
    return;
  }

  try {
    const resp = await fetch(
      `http://localhost:8080/api/users/${id}/deactivate`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      },
    );

    if (!resp.ok) throw new Error("Erro ao desativar utilizador");

    fecharPopUp();
    await carregarUtilizadores();
  } catch (err) {
    console.error(err);
  }
}
 