async function logout() {
    try {
        const response = await fetch(
            `http://localhost:8080/api/auth/logout`,
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (response.ok) {
            window.location.replace("http://localhost:8080/pages/login/login.html");
        } else {
            console.error("Erro ao fechar sessão!")
        }
    } catch (_) {
        console.error("Erro no servidor!")
    }
}