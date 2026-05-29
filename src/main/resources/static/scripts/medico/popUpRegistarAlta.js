function fecharPopUp() {
  document.getElementById("popup-alta").style.display = "none";
}

async function submeterAlta(event) {
  event.preventDefault();
  event.stopPropagation();

  const processoId = document.getElementById("processo").innerHTML.trim();
  const notasAlta = document.getElementById("notas").value;
  const dataHoraInput = document.getElementById("dataHora").value;

  const dt = new Date(dataHoraInput);
  const pad = (n) => String(n).padStart(2, "0");
  const dataFormatada = `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}:${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`;

  try {
    const resp = await fetch(
      `http://localhost:8080/api/processes/${processoId}/discharge`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          notasAlta: notasAlta,
          data: dataFormatada,
        }),
      },
    );

    if (!resp.ok) throw new Error("Erro ao registar alta");

    fecharPopUp();
    sessionStorage.setItem("notificacao_pendente", JSON.stringify({
      titulo: "Alta registada",
      mensagem: "Alta clínica registada com sucesso.",
      tipo: "sucesso"
    }));
    window.location.href = "medicoListaUtentes";
  } catch (_) {
    mostrarNotificacao({ titulo: "Erro", mensagem: "Erro ao registar alta. Tenta novamente.", tipo: "erro" });
  }
}
