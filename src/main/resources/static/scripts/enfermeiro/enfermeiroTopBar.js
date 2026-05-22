/* =============================================================
 *  Top bar partilhada do enfermeiro
 *  Preenche o nome do enfermeiro (#nome-enf / #nome-enfermeiro)
 *  e o turno atual (#turno) usando:
 *      GET /api/users/me
 *      GET /api/shifts/me
 * ============================================================= */

(function () {
    const API_BASE = "http://localhost:8080";

    const NOMES_TIPO_TURNO = {
        MANHA: "Manhã",
        TARDE: "Tarde",
        NOITE: "Noite",
        CUSTOM: "Personalizado",
    };

    document.addEventListener("DOMContentLoaded", function () {
        carregarTopBarEnfermeiro();
    });

    async function carregarTopBarEnfermeiro() {
        await Promise.all([
            carregarNomeEnfermeiro(),
            carregarTurnoAtual(),
        ]);
    }

    async function carregarNomeEnfermeiro() {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${API_BASE}/api/users/me`, { headers });
            if (!res.ok) return;
            const json = await res.json();
            const nome = json?.data?.nome;
            if (!nome) return;
            preencherSe("nome-enf", nome);
            preencherSe("nome-enfermeiro", nome);
        } catch (err) {
            console.warn("[topbar] Não foi possível obter o utilizador:", err);
        }
    }

    async function carregarTurnoAtual() {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${API_BASE}/api/shifts/me`, { headers });
            if (!res.ok) {
                esconderBlocoTurno();
                return;
            }
            const json = await res.json();
            const turno = json?.data;
            if (!turno) {
                esconderBlocoTurno();
                return;
            }

            const label = formatarTurno(turno);
            if (!label) {
                esconderBlocoTurno();
                return;
            }
            preencherSe("turno", label);
        } catch (err) {
            console.warn("[topbar] Não foi possível obter o turno:", err);
            esconderBlocoTurno();
        }
    }

    function esconderBlocoTurno() {
        const wrapper = document.getElementById("turno-wrapper");
        if (wrapper) wrapper.style.display = "none";
    }

    function formatarTurno(turno) {
        const tipoLabel = NOMES_TIPO_TURNO[turno.tipo] ?? turno.tipo ?? "";
        const horas = formatarIntervaloHoras(turno.inicio, turno.fim);
        return horas ? `${tipoLabel} ${horas}` : tipoLabel;
    }

    function formatarIntervaloHoras(inicioRaw, fimRaw) {
        const horaInicio = extrairHora(inicioRaw);
        const horaFim = extrairHora(fimRaw);
        if (horaInicio == null || horaFim == null) return "";
        return `${horaInicio}h-${horaFim}h`;
    }

    /**
     * Aceita formato do backend "dd/MM/yyyy:HH:mm:ss" ou ISO "yyyy-MM-ddTHH:mm:ss".
     */
    function extrairHora(raw) {
        if (!raw) return null;
        // formato backend: dd/MM/yyyy:HH:mm:ss
        const matchBackend = /^(\d{2})\/(\d{2})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})$/.exec(raw);
        if (matchBackend) return parseInt(matchBackend[4], 10);

        // ISO ou outro formato parseável
        const d = new Date(raw);
        if (!isNaN(d.getTime())) return d.getHours();

        return null;
    }

    function preencherSe(id, valor) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = valor;
    }
})();
