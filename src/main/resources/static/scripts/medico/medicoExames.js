async function carregarPopup(caminho) {
  const res = await fetch(caminho);
  const html = await res.text();
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div);
}

const params = new URLSearchParams(window.location.search);
const pacienteId = params.get("id");
let processoId = null;
let exameIdAtual = null;

const tipoLabels = {
  HEMOGRAMA_COMPLETO: "Hemograma Completo",
  PAINEL_METABOLICO: "Painel metabólico",
  FUNCAO_HEPATICA: "Função hepática",
  FUNCAO_TIROIDE: "Função tiroide",
  NIVEIS_VITAMINAS: "Níveis de vitaminas",
};

const urgenciaLabels = {
  BAIXA: "Baixa",
  MODERADA: "Moderada",
  NORMAL: "Normal",
  ALTA: "Alta",
};

const estadoLabels = {
  PEDIDO_PENDENTE: "Pedido Pendente",
  AGENDADO: "Agendado",
  AGUARDANDO_RESULTADO: "Aguardando Resultado",
  CONCLUIDO: "Concluído",
};

async function init() {
  await carregarPopup(
    "../../pages/medico/popups/popupPrescreverExameComplementar.html",
  );
  await carregarPopup(
    "../../pages/medico/popups/popupEditarExameComplementar.html",
  );
  document.getElementById("popup-prescrever-exame").style.display = "none";
  document.getElementById("popup-editar-exame").style.display = "none";
  const res = await fetch(`http://localhost:8080/api/patients/${pacienteId}`);
  const json = await res.json();
  const dados = json.data.dados;
  const processo = dados.processo;

  processoId = processo.id;

  document.getElementById("nome-utente").textContent = dados.nome;
  document.getElementById("processo").textContent = processo.id;
  document.getElementById("cama").textContent = processo.cama ?? "—";
  document.getElementById("diagnostico").textContent =
    processo.diagnosticoPrincipal;

  const partes = processo.dataEntrada.split(":")[0].split("/");
  const dataEntrada = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
  const dias = Math.floor((new Date() - dataEntrada) / (1000 * 60 * 60 * 24));
  document.getElementById("dias-internado").textContent = dias;

  const meRes = await fetch("http://localhost:8080/api/users/me");
  const meJson = await meRes.json();
  document.getElementById("nome-medico").textContent = meJson.data.nome;

  await carregarExames();
}

async function carregarExames() {
  const res = await fetch(
    `http://localhost:8080/api/processes/${processoId}/exams`,
  );
  const json = await res.json();
  const exames = json.data;
  const tbody = document.getElementById("exames-tbody");
  tbody.innerHTML = "";

  if (!exames || exames.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align:center;color:#888;padding:24px;">Sem exames prescritos.</td></tr>';
    return;
  }

  exames.forEach((exame) => {
    const tr = document.createElement("tr");
    const dataPedido = exame.dataPedido
      ? new Date(exame.dataPedido).toLocaleDateString("pt-PT")
      : "—";
    const dataPretendida = exame.dataPretendida ?? "—";
    tr.innerHTML = `
			<td>${tipoLabels[exame.tipo] ?? exame.tipo}</td>
			<td>${urgenciaLabels[exame.urgencia] ?? exame.urgencia}</td>
			<td>${dataPedido}</td>
			<td>${dataPretendida}</td>
			<td>${exame.indicacaoClinica ?? "—"}</td>
			<td>${exame.observacoesLaboratorio ?? "—"}</td>
			<td>${estadoLabels[exame.estado] ?? exame.estado}</td>
			<td>
				<button onclick="abrirPopupEditar(${exame.id}, '${exame.urgencia}', '${exame.dataPretendida ?? ""}', '${(exame.indicacaoClinica ?? "").replace(/'/g, "\\'")}')">Editar</button>
				<button onclick="eliminarExame(${exame.id})">Eliminar</button>
			</td>
		`;
    tbody.appendChild(tr);
  });
}

function abrirPopup() {
  document.getElementById("popup-prescrever-exame").style.display = "flex";
  document.getElementById("popup-tipo-exame").value = "HEMOGRAMA_COMPLETO";
  document.getElementById("popup-urgencia").value = "NORMAL";
  document.getElementById("popup-data-pretendida").value = "";
  document.getElementById("popup-indicacao").value = "";
  document.getElementById("popup-observacoes").value = "";
}

function fecharPopup() {
  document.getElementById("popup-prescrever-exame").style.display = "none";
}

async function submeterExame() {
  const tipo = document.getElementById("popup-tipo-exame").value;
  const urgencia = document.getElementById("popup-urgencia").value;
  const dataRaw = document.getElementById("popup-data-pretendida").value;
  const indicacao = document.getElementById("popup-indicacao").value.trim();
  const observacoes = document.getElementById("popup-observacoes").value.trim();

  if (!tipo || !urgencia || !dataRaw || !indicacao) {
    mostrarNotificacao({
      titulo: "Campos obrigatórios",
      mensagem: "Preencha todos os campos obrigatórios.",
      tipo: "erro",
    });
    return;
  }

  const [ano, mes, dia] = dataRaw.split("-");
  const dataPretendida = `${dia}/${mes}/${ano}`;

  const body = { tipo, urgencia, dataPretendida, indicacao };
  if (observacoes) body.observacoes = observacoes;

  const res = await fetch(
    `http://localhost:8080/api/processes/${processoId}/exams`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (res.ok) {
    fecharPopup();
    mostrarNotificacao({
      titulo: "Exame prescrito",
      mensagem: "O exame foi prescrito com sucesso.",
      tipo: "sucesso",
    });
    await carregarExames();
  } else {
    mostrarNotificacao({
      titulo: "Erro ao prescrever",
      mensagem: "Não foi possível prescrever o exame.",
      tipo: "erro",
    });
  }
}

function abrirPopupEditar(id, urgencia, dataPretendida, indicacao) {
  exameIdAtual = id;
  document.getElementById("edit-urgencia").value = urgencia;
  document.getElementById("edit-indicacao").value = indicacao;

  if (dataPretendida) {
    const partes = dataPretendida.split("/");
    document.getElementById("edit-data-pretendida").value =
      `${partes[2]}-${partes[1]}-${partes[0]}`;
  } else {
    document.getElementById("edit-data-pretendida").value = "";
  }

  document.getElementById("popup-editar-exame").style.display = "flex";
}

function fecharPopupEditar() {
  document.getElementById("popup-editar-exame").style.display = "none";
  exameIdAtual = null;
}

async function submeterEdicao() {
  const urgencia = document.getElementById("edit-urgencia").value;
  const dataRaw = document.getElementById("edit-data-pretendida").value;
  const indicacao = document.getElementById("edit-indicacao").value.trim();

  if (!urgencia || !dataRaw || !indicacao) {
    mostrarNotificacao({
      titulo: "Campos obrigatórios",
      mensagem: "Preencha todos os campos obrigatórios.",
      tipo: "erro",
    });
    return;
  }

  const [ano, mes, dia] = dataRaw.split("-");
  const dataPretendida = `${dia}/${mes}/${ano}`;

  const res = await fetch(
    `http://localhost:8080/api/processes/exams/${exameIdAtual}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urgencia, dataPretendida, indicacao }),
    },
  );

  if (res.ok) {
    fecharPopupEditar();
    mostrarNotificacao({
      titulo: "Exame atualizado",
      mensagem: "O exame foi atualizado com sucesso.",
      tipo: "sucesso",
    });
    await carregarExames();
  } else {
    mostrarNotificacao({
      titulo: "Erro ao atualizar",
      mensagem: "Não foi possível atualizar o exame.",
      tipo: "erro",
    });
  }
}

async function eliminarExame(id) {
  if (!confirm("Tem a certeza que pretende eliminar este exame?")) return;

  const res = await fetch(`http://localhost:8080/api/processes/exams/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    mostrarNotificacao({
      titulo: "Exame eliminado",
      mensagem: "O exame foi eliminado com sucesso.",
      tipo: "sucesso",
    });
    await carregarExames();
  } else {
    mostrarNotificacao({
      titulo: "Erro ao eliminar",
      mensagem: "Não foi possível eliminar o exame.",
      tipo: "erro",
    });
  }
}

init();
