const btn = document.getElementById("btnRegister");
const err = document.getElementById("err");

btn.addEventListener("click", async () => {
  err.classList.add("hidden");

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha })
  });

  if (!res.ok) {
    err.innerText = "Erro ao criar conta.";
    err.classList.remove("hidden");
    return;
  }

  window.location.href = "/login";
});