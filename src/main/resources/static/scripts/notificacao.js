/**
 * NOTIFICAÇÕES TOAST — utilitário global
 *
 * INCLUIR NAS PÁGINAS (antes do </body>):
 *   <div id="notificacoes-container"></div>
 *   <script src="/scripts/notificacao.js"></script>
 *
 * API:
 *   mostrarNotificacao({ titulo, mensagem, tipo, duracao })
 *
 *   @param {string} titulo    — título em destaque (ex: "Operação concluída")
 *   @param {string} mensagem  — detalhe da notificação
 *   @param {string} tipo      — "sucesso" | "erro" | "aviso" | "info"  (padrão: "info")
 *   @param {number} duracao   — ms até fechar automaticamente; 0 = manual  (padrão: 5000)
 */

(function injetarEstilosNotificacao() {
  if (document.getElementById("notificacao-styles")) return;
  const style = document.createElement("style");
  style.id = "notificacao-styles";
  style.textContent = `
#notificacoes-container { position: fixed; top: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
.notificacao { position: relative; display: flex; align-items: flex-start; gap: 14px; background: #ffffff; color: #111111; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px 18px; min-width: 320px; max-width: 420px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); pointer-events: all; animation: notificacao-entrar 0.3s ease forwards; }
.notificacao.sair { animation: notificacao-sair 0.3s ease forwards; }
.notificacao-icone { flex-shrink: 0; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.notificacao-icone svg { width: 18px; height: 18px; }
.notificacao[data-tipo="sucesso"] .notificacao-icone { background: #e6f4ea; }
.notificacao[data-tipo="sucesso"] .notificacao-icone svg { color: #2e7d32; }
.notificacao[data-tipo="erro"] .notificacao-icone { background: #fdecea; }
.notificacao[data-tipo="erro"] .notificacao-icone svg { color: #c62828; }
.notificacao[data-tipo="aviso"] .notificacao-icone { background: #fff8e1; }
.notificacao[data-tipo="aviso"] .notificacao-icone svg { color: #f57f17; }
.notificacao[data-tipo="info"] .notificacao-icone { background: #e3f2fd; }
.notificacao[data-tipo="info"] .notificacao-icone svg { color: #1565c0; }
.notificacao::before { content: ""; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px; border-radius: 0 2px 2px 0; background: transparent; }
.notificacao[data-tipo="sucesso"]::before { background: #2e7d32; }
.notificacao[data-tipo="erro"]::before { background: #c62828; }
.notificacao[data-tipo="aviso"]::before { background: #f57f17; }
.notificacao[data-tipo="info"]::before { background: #1565c0; }
.notificacao-texto { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.notificacao-titulo { font-family: "Inter", "IBM Plex Sans", sans-serif; font-size: 14px; font-weight: 600; color: #111111; line-height: 1.3; }
.notificacao-mensagem { font-family: "Inter", "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 400; color: #444444; line-height: 1.4; }
.notificacao-fechar { flex-shrink: 0; background: none; border: none; cursor: pointer; padding: 2px; color: #888888; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: color 0.15s, background 0.15s; align-self: flex-start; }
.notificacao-fechar:hover { color: #111111; background: #f0f0f0; }
.notificacao-fechar svg { width: 14px; height: 14px; }
@keyframes notificacao-entrar { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes notificacao-sair { from { opacity: 1; transform: translateX(0); max-height: 120px; margin-bottom: 0; } to { opacity: 0; transform: translateX(40px); max-height: 0; margin-bottom: -12px; padding-top: 0; padding-bottom: 0; } }
`;
  (document.head || document.documentElement).appendChild(style);
})();

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
