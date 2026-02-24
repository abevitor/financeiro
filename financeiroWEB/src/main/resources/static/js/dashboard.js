const token = localStorage.getItem("token");
if (!token) window.location.href = "/login";

function authHeaders(extra = {}) {
  return { ...extra, "Authorization": "Bearer " + token };
}

function moneyBR(v) {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

// ========= State =========
let page = 0;
const size = 10;
let usingPeriodo = false;

// cache de categorias: { id -> "Nome (TIPO)" }
const categoriesMap = new Map();

async function carregarCategorias() {
  const select = document.getElementById("categoria");
  select.innerHTML = `<option value="">Carregando...</option>`;

  const res = await fetch("/categories", { headers: authHeaders() });
  if (!res.ok) {
    select.innerHTML = `<option value="">(Erro ao carregar)</option>`;
    return;
  }

  const list = await res.json(); // List<CategoryResponse>
  categoriesMap.clear();

  // monta select
  select.innerHTML = `<option value="">Selecione uma categoria</option>`;
  for (const c of list) {
    // ajuste conforme seu CategoryResponse (ex: c.nome, c.tipo, c.id)
    const label = `${c.nome} (${c.tipo})`;
    categoriesMap.set(c.id, label);

    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = label;
    select.appendChild(opt);
  }
}

async function carregarResumo() {
  const res = await fetch("/dashboard", { headers: authHeaders() });
  if (!res.ok) {
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
  setMsg("Carregando...");

  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;

  let url = `/transactions?page=${page}&size=${size}&sort=data,desc`;
  if (usingPeriodo && inicio && fim) {
    url = `/transactions/periodo?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}&page=${page}&size=${size}&sort=data,desc`;
  }

  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    setMsg("");
    showError("Não foi possível carregar transações.");
    return;
  }

  const data = await res.json();
  renderTabela(data);
  setMsg("");
}

function renderTabela(pageData) {
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  const content = pageData.content ?? [];
  if (content.length === 0) {
    tbody.innerHTML = `
      <tr class="border-b border-slate-900">
        <td class="py-3 text-slate-400" colspan="6">Nenhuma transação encontrada.</td>
      </tr>
    `;
  } else {
    for (const t of content) {
      const tipoColor = t.tipo === "RECEITA" ? "text-emerald-300" : "text-rose-300";
      const catLabel = categoriesMap.get(t.categoryId) ?? `#${t.categoryId}`;

      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-900";
      tr.innerHTML = `
        <td class="py-3 pr-2 text-slate-300">${t.data ?? ""}</td>
        <td class="py-3 pr-2">${t.descricao ?? ""}</td>
        <td class="py-3 pr-2 font-semibold ${tipoColor}">${t.tipo ?? ""}</td>
        <td class="py-3 pr-2 text-slate-200">${catLabel}</td>
        <td class="py-3 pr-2 text-right">${moneyBR(t.valor)}</td>
        <td class="py-3 text-right">
          <button data-id="${t.id}"
                  class="btnDel rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 px-3 py-1 text-rose-200">
            Excluir
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  const totalPages = Number(pageData.totalPages ?? 0);
  const number = Number(pageData.number ?? 0);
  document.getElementById("pageInfo").textContent =
    totalPages === 0 ? "Página 0 de 0" : `Página ${number + 1} de ${totalPages}`;

  document.getElementById("prevBtn").disabled = number <= 0;
  document.getElementById("nextBtn").disabled = totalPages === 0 || number >= totalPages - 1;

  document.querySelectorAll(".btnDel").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Deseja excluir esta transação?")) return;
      await deletarTransacao(id);
    });
  });
}

async function criarTransacao() {
  clearError();
  setMsg("");

  const descricao = document.getElementById("descricao").value.trim();
  const valorStr = document.getElementById("valor").value.trim().replace(",", ".");
  const data = document.getElementById("data").value;
  const tipo = document.getElementById("tipo").value;
  const categoryId = document.getElementById("categoria").value;

  if (!descricao) return showError("Informe a descrição.");
  if (!valorStr || isNaN(Number(valorStr))) return showError("Informe um valor válido (ex: 19.90).");
  if (!data) return showError("Informe a data.");
  if (!categoryId) return showError("Selecione uma categoria.");

 
  const payload = {
    descricao,
    valor: Number(valorStr),
    data,
    tipo,
    categoryId: Number(categoryId)
  };

  setMsg("Salvando...");

  const res = await fetch("/transactions", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    setMsg("");
    showError("Não foi possível criar a transação. Verifique os dados.");
    return;
  }

  // limpar
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("data").value = "";
  document.getElementById("tipo").value = "RECEITA";
  document.getElementById("categoria").value = "";

  setMsg("");
  await carregarResumo();
  page = 0;
  await carregarTransacoes();
}

async function deletarTransacao(id) {
  clearError();
  setMsg("Excluindo...");

  const res = await fetch(`/transactions/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  if (!res.ok) {
    setMsg("");
    showError("Não foi possível excluir a transação.");
    return;
  }

  setMsg("");
  await carregarResumo();
  await carregarTransacoes();
}

// ========= Eventos =========
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});

document.getElementById("txForm").addEventListener("submit", (e) => {
  e.preventDefault();
  criarTransacao();
});

document.getElementById("btnFiltrar").addEventListener("click", () => {
  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;
  if (!inicio || !fim) return showError("Para filtrar, preencha início e fim.");

  usingPeriodo = true;
  page = 0;
  carregarTransacoes();
});

document.getElementById("btnLimpar").addEventListener("click", () => {
  document.getElementById("inicio").value = "";
  document.getElementById("fim").value = "";
  usingPeriodo = false;
  page = 0;
  carregarTransacoes();
});

document.getElementById("prevBtn").addEventListener("click", () => {
  if (page > 0) {
    page--;
    carregarTransacoes();
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  page++;
  carregarTransacoes();
});

// ========= Boot =========
(async function init() {
  await carregarCategorias();
  await carregarResumo();
  await carregarTransacoes();
})();