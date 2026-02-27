const form = document.getElementById("registerForm");
const err = document.getElementById("err");

function showError(msg) {
  err.textContent = msg;
  err.classList.remove("hidden");
}
function clearError() {
  err.textContent = "";
  err.classList.add("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!nome || !email || !senha) {
    showError("Preencha todos os campos.");
    return;
  }

  const res = await fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha })
  });

  if (!res.ok) {
    showError("Erro ao criar conta (email pode já existir).");
    return;
  }

  window.location.href = "/login";
});