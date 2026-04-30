/**
 * NOTIFICAÇÕES TOAST — utilitário global
 *
 * INCLUIR NAS PÁGINAS (antes do </body>):
 *   <div id="notificacoes-container"></div>
 *   <link rel="stylesheet" href="/styles/popups/notificacao.css" />
 *   <script src="/scripts/notificacao.js"></script>
 *
 * API:
 *   mostrarNotificacao({ titulo, mensagem, tipo, duracao })
 *
 *   @param {string} titulo    — título em destaque (ex: "Operação concluída")
 *   @param {string} mensagem  — detalhe da notificação
 *   @param {string} tipo      — "sucesso" | "erro" | "aviso" | "info"  (padrão: "info")
 *   @param {number} duracao   — ms até fechar automaticamente; 0 = manual  (padrão: 5000)
 *
 * EXEMPLOS PARA ESTE PROJETO:
 *
 *   // Utilizador criado com sucesso
 *   mostrarNotificacao({ titulo: "Utilizador criado", mensagem: "O colaborador foi adicionado ao sistema.", tipo: "sucesso" });
 *
 *   // Erro ao guardar
 *   mostrarNotificacao({ titulo: "Erro ao guardar", mensagem: "Não foi possível contactar o servidor.", tipo: "erro" });
 *
 *   // Prescrição médica guardada
 *   mostrarNotificacao({ titulo: "Prescrição guardada", mensagem: "O medicamento foi prescrito com sucesso.", tipo: "sucesso" });
 *
 *   // Sessão expirada
 *   mostrarNotificacao({ titulo: "Sessão expirada", mensagem: "Por favor, faça login novamente.", tipo: "aviso" });
 *
 *   // Sinais vitais registados
 *   mostrarNotificacao({ titulo: "Sinais vitais registados", mensagem: "Os dados foram guardados no kardex.", tipo: "sucesso" });
 *
 *   // Alta registada
 *   mostrarNotificacao({ titulo: "Alta registada", mensagem: "O utente foi dado como tendo alta.", tipo: "info" });
 *
 *   // Dados duplicados
 *   mostrarNotificacao({ titulo: "Dados duplicados", mensagem: "Este registo já existe no sistema.", tipo: "aviso" });
 *
 *   // Sem fechar automático (duracao: 0)
 *   mostrarNotificacao({ titulo: "A processar", mensagem: "Aguarde enquanto o relatório é gerado.", tipo: "info", duracao: 0 });
 */

const _icones = {
  sucesso: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,

  erro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,

  aviso: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`,

  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/>
  </svg>`,
};

function mostrarNotificacao({ titulo, mensagem, tipo = "info", duracao = 5000 } = {}) {
  const container = document.getElementById("notificacoes-container");
  if (!container) {
    console.warn("[notificacao.js] Elemento #notificacoes-container não encontrado na página.");
    return;
  }

  const tiposValidos = ["sucesso", "erro", "aviso", "info"];
  if (!tiposValidos.includes(tipo)) tipo = "info";

  const card = document.createElement("div");
  card.className = "notificacao";
  card.setAttribute("data-tipo", tipo);
  card.setAttribute("role", "alert");
  card.setAttribute("aria-live", "polite");

  card.innerHTML = `
    <div class="notificacao-icone">${_icones[tipo]}</div>
    <div class="notificacao-texto">
      <span class="notificacao-titulo">${_escaparHTML(titulo)}</span>
      <span class="notificacao-mensagem">${_escaparHTML(mensagem)}</span>
    </div>
    <button class="notificacao-fechar" aria-label="Fechar notificação">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  container.appendChild(card);

  card.querySelector(".notificacao-fechar").addEventListener("click", () => _fecharNotificacao(card));

  if (duracao > 0) {
    setTimeout(() => _fecharNotificacao(card), duracao);
  }
}

function _fecharNotificacao(card) {
  if (card.classList.contains("sair")) return;
  card.classList.add("sair");
  card.addEventListener("animationend", () => card.remove(), { once: true });
}

function _escaparHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
