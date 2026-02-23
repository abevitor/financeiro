const token = localStorage.getItem("token");

if(!token) window.location.href = "/login";

function authHeaders(extra = {}) {
    return {
        ...extra,
        "Authorization": "Bearer " + token
    };
}

function moneyBR(v) {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function safeText(s) {
  return (s ?? "").toString();
}

function showError(msg) {
  const el = document.getElementById("err");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function clearError() {
  const el = document.getElementById("err");
  el.textContent = "";
  el.classList.add("hidden");
}

function setMsg(msg) {
  document.getElementById("msg").textContent = msg ?? "";
}

let page = 0;
const size = 10;
let usingPeriodo = false;

async function carregarResumo() {
    const res = await fetch("/dashboard", {headers: authHeaders()});
    if(!res.ok) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }

    const data = await res.json();

    document.getElementById("receitas").textContent = moneyBR(data.receitas);
    document.getElementById("despesas").textContent = moneyBR(data.despesas);
    document.getElementById("saldo").textContent = moneyBR(data.saldo);
}

async function carregarTransacoes() {
    clearError();
    setMsg("Carregando...")

    const inciio = document.getElementById("inicio").value;
    const fim = document.getElementById("fim").value;

    let url = `/transactions?page=${page}&size=${size}&sort=data,desc`;
    if(usingPeriodo && inicio && fim) {
        url `/transactions/periodo?inicio=${encodeURIComponent(inicio)}&fim=${encondeURIComponent(fim)}&page=${page}&size=${size}&sort=data,desc`;
    }

    const res = await fetch(url, {headers: authHeaders()});
}