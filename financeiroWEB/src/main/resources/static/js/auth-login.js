const btn = document.getElementById("btnLogin");
const err = document.getElementById("err");

btn.addEventListener("click", async () => {
    err.classList.add("hidden");

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const res = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({email, senha})
    });

    if(!res.ok){
        err.innerText = "Email ou senha inválidos.";
        err.classList.remove("hidden");
        return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);

    window.location.href = "/app";
});