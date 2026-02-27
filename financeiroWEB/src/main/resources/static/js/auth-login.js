const form = document.getElementById("loginForm");
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

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    showError("Preencha email e senha.");
    return;
  }

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  if (!res.ok) {
    showError("Email ou senha inválidos.");
    return;
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);
  window.location.href = "/app";
});