/* =============================================================
 *  Top bar partilhada para Admin / Enfermeiro / Enfermeiro Chefe / Médico
 *
 *  Endpoints:
 *      GET /api/users/me   -> UtilizadorDTO { nome, role, sexo, ... }
 *      GET /api/shifts/me  -> TurnoDTO      { tipo, inicio, fim, ... }
 *
 *  Preenche, conforme exista na página:
 *      #nome-enf | #nome-enfermeiro          (apenas o nome — prefix "Enf." já no HTML)
 *      #nome-chefe                            (preenche com "Enf. Chefe <nome>")
 *      #nome-medico                           (preenche com "Dr./Dra. <nome>")
 *      #nome-admin                            (preenche com nome do admin se existir)
 *      #turno | #turno-chefe                  (label do turno, ex. "Tarde 14h-22h")
 *      #turno-wrapper                         (esconde quando não há turno activo)
 * ============================================================= */

(function () {
    const API_BASE = "http://localhost:8080";

    const NOMES_TIPO_TURNO = {
        MANHA: "Manhã",
        TARDE: "Tarde",
        NOITE: "Noite",
        CUSTOM: "Personalizado",
    };

    document.addEventListener("DOMContentLoaded", carregarTopBar);

    async function carregarTopBar() {
        const user = await _fetchData("/api/users/me");
        if (!user) return;
        preencherNomePorRole(user);

        // Turno só faz sentido para enfermeiros — admin/médico/chefe não têm turno na topbar
        const role = (user?.role ?? "").toUpperCase();
        if (role === "ENFERMEIRO") {
            carregarTurnoAtual();
        }
    }

    function preencherNomePorRole(user) {
        const nome = user?.nome ?? "";
        if (!nome) return;
        const role = (user?.role ?? "").toUpperCase();
        const sexo = (user?.sexo ?? "").toUpperCase();

        // Enfermeiro / Enf. Chefe / Médico / Admin têm IDs diferentes em cada HTML.
        // Preenchemos os que existirem.
        switch (role) {
            case "ENFERMEIRO":
                _setText("nome-enf", nome);
                _setText("nome-enfermeiro", nome);
                break;
            case "ENFERMEIRO_CHEFE":
                _setText("nome-chefe", `Enf. Chefe ${nome}`);
                // fallback caso o page model use o id do enfermeiro
                _setText("nome-enf", nome);
                _setText("nome-enfermeiro", nome);
                break;
            case "MEDICO": {
                const prefix = sexo === "FEMININO" ? "Dra." : "Dr.";
                _setText("nome-medico", `${prefix} ${nome}`);
                break;
            }
            case "ADMIN":
                _setText("nome-admin", nome);
                break;
            default:
                // sem role conhecido — preenche o que existir
                _setText("nome-enf", nome);
                _setText("nome-enfermeiro", nome);
                _setText("nome-chefe", nome);
                _setText("nome-medico", nome);
                _setText("nome-admin", nome);
        }
    }

    async function carregarTurnoAtual() {
        // /api/workers/me/shift devolve o turno em que o enfermeiro está NESTE momento.
        // (/api/shifts/me devolve o turno global activo do sistema, mesmo que o enfermeiro
        // não pertença a ele — não usar.)
        // Em caso de não estar em turno, o backend devolve 400 → _fetchData devolve null.
        const turno = await _fetchData("/api/workers/me/shift");
        if (!turno) {
            esconderBlocoTurno();
            return;
        }
        const label = formatarTurno(turno);
        if (!label) {
            esconderBlocoTurno();
            return;
        }
        _setText("turno", label);
        _setText("turno-chefe", label);
    }

    function esconderBlocoTurno() {
        const wrapper = document.getElementById("turno-wrapper");
        if (wrapper) wrapper.style.display = "none";
        _setText("turno", "—");
        _setText("turno-chefe", "—");
    }

    function formatarTurno(turno) {
        const tipoLabel = NOMES_TIPO_TURNO[turno.tipo] ?? turno.tipo ?? "";
        const horas = formatarIntervaloHoras(turno.inicio, turno.fim);
        return horas ? `${tipoLabel} ${horas}` : tipoLabel;
    }

    function formatarIntervaloHoras(inicioRaw, fimRaw) {
        const hi = extrairHora(inicioRaw);
        const hf = extrairHora(fimRaw);
        if (hi == null || hf == null) return "";
        return `${hi}h-${hf}h`;
    }

    /**
     * Aceita formato do backend "dd/MM/yyyy:HH:mm:ss" ou ISO "yyyy-MM-ddTHH:mm:ss".
     */
    function extrairHora(raw) {
        if (!raw) return null;
        const matchBackend = /^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})$/.exec(raw);
        if (matchBackend) return parseInt(matchBackend[4], 10);
        const d = new Date(raw);
        if (!isNaN(d.getTime())) return d.getHours();
        return null;
    }

    async function _fetchData(path) {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${API_BASE}${path}`, { headers, credentials: "include" });
            if (!res.ok) return null;
            const json = await res.json();
            if (json && json.success === false) return null;
            return json?.data ?? null;
        } catch (err) {
            console.warn("[topbar] fetch falhou:", path, err);
            return null;
        }
    }

    function _setText(id, valor) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = valor;
    }
})();
