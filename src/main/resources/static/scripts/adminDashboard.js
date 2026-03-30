function renderDatetime() {
    const now = new Date();
    const date = now.toLocaleDateString("pt-PT");
    const time = now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    document.getElementById("current-datetime").textContent = `${date} · ${time}`;
}

function pad(n) {
    return String(n).padStart(2, "0");
}

async function loadCounts() {
    const response = await fetch(`http://localhost:8080/api/stats/counts`);
    const json = await response.json();
    const data = json.data;

    document.getElementById("stat-utilizadores").textContent = pad(data.activeUsers);
    document.getElementById("stat-sessoes").textContent = pad(data.openSessions);
    document.getElementById("stat-utentes").textContent = pad(data.hospitalizedPatients);
    document.getElementById("stat-medicamentos").textContent = pad(data.medicationsCatalog);
}

renderDatetime();
loadCounts();