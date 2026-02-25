const token = localStorage.getItem("token");
if (!token) window.location.href = "/login";

function authHeaders(extra = {}) {
  return { ...extra, "Authorization": "Bearer " + token };
}

function moneyBR(v) {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove("hidden");
}

function clearError(id) {
  const el = document.getElementById(id);
  el.textContent = "";
  el.classList.add("hidden");
}

function setMsg(msg) {
  document.getElementById("msg").textContent = msg ?? "";
}

// ====== state ======
let page = 0;
const size = 10;
let usingPeriodo = false;

let allCategories = []; // CategoryResponse[]
const categoriesMap = new Map(); // id -> "nome (tipo)"

// Edição
let editTxId = null;

// ====== categorias ======
function renderCategorySelectByTipo(tipo) {
  const select = document.getElementById("categoria");
  select.innerHTML = `<option value="">Selecione uma categoria</option>`;

  const filtered = allCategories.filter(c => c.tipo === tipo);
  for (const c of filtered) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nome;
    select.appendChild(opt);
  }
}

function renderEditCategorySelectByTipo(tipo, selectedId) {
  const select = document.getElementById("editCategoria");
  select.innerHTML = `<option value="">Selecione uma categoria</option>`;

  const filtered = allCategories.filter(c => c.tipo === tipo);
  for (const c of filtered) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nome;
    if (String(c.id) === String(selectedId)) opt.selected = true;
    select.appendChild(opt);
  }
}

async function carregarCategorias() {
  const res = await fetch("/categories", { headers: authHeaders() });
  if (!res.ok) {
    allCategories = [];
    categoriesMap.clear();
    return;
  }

  allCategories = await res.json();
  categoriesMap.clear();
  for (const c of allCategories) {
    categoriesMap.set(c.id, `${c.nome} (${c.tipo})`);
  }

  // Inicializa select de categoria de acordo com o tipo atual do form
  renderCategorySelectByTipo(document.getElementById("tipo").value);
}

// ====== resumo ======
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

// ====== transações ======
async function carregarTransacoes() {
  clearError("err");
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
    showError("err", "Não foi possível carregar transações.");
    return;
  }

  const data = await res.json();
  renderTabela(data);
  renderPagination(data);
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
    return;
  }

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
      <td class="py-3 text-right flex justify-end gap-2">
        <button data-tx='${JSON.stringify(t).replaceAll("'", "&apos;")}'
                class="btnEdit rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 px-3 py-1 text-indigo-200">
          Editar
        </button>
        <button data-id="${t.id}"
                class="btnDel rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 px-3 py-1 text-rose-200">
          Excluir
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  document.querySelectorAll(".btnDel").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Deseja excluir esta transação?")) return;
      await deletarTransacao(id);
    });
  });

  document.querySelectorAll(".btnEdit").forEach(btn => {
    btn.addEventListener("click", () => {
      const raw = btn.getAttribute("data-tx");
      const tx = JSON.parse(raw);
      abrirModalEdicao(tx);
    });
  });
}

function renderPagination(pageData) {
  const totalPages = Number(pageData.totalPages ?? 0);
  const number = Number(pageData.number ?? 0);

  document.getElementById("pageInfo").textContent =
    totalPages === 0 ? "Página 0 de 0" : `Página ${number + 1} de ${totalPages}`;

  document.getElementById("prevBtn").disabled = number <= 0;
  document.getElementById("nextBtn").disabled = totalPages === 0 || number >= totalPages - 1;

  // Botões numéricos (janela de 5 páginas)
  const pageBtns = document.getElementById("pageBtns");
  pageBtns.innerHTML = "";

  if (totalPages <= 1) return;

  const start = Math.max(0, number - 2);
  const end = Math.min(totalPages - 1, number + 2);

  for (let p = start; p <= end; p++) {
    const b = document.createElement("button");
    b.textContent = String(p + 1);
    b.className =
      "rounded-lg px-3 py-2 text-sm border transition " +
      (p === number
        ? "bg-indigo-500/30 border-indigo-400 text-indigo-100"
        : "bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-200");
    b.addEventListener("click", () => {
      page = p;
      carregarTransacoes();
    });
    pageBtns.appendChild(b);
  }
}

async function criarTransacao() {
  clearError("err");
  setMsg("");

  const descricao = document.getElementById("descricao").value.trim();
  const valorStr = document.getElementById("valor").value.trim().replace(",", ".");
  const data = document.getElementById("data").value;
  const tipo = document.getElementById("tipo").value;
  const categoryId = document.getElementById("categoria").value;

  if (!descricao) return showError("err", "Informe a descrição.");
  if (!valorStr || isNaN(Number(valorStr))) return showError("err", "Informe um valor válido (ex: 19.90).");
  if (!data) return showError("err", "Informe a data.");
  if (!categoryId) return showError("err", "Selecione uma categoria.");

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
    showError("err", "Não foi possível criar a transação. Verifique os dados.");
    return;
  }

  // limpar
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("data").value = "";
  document.getElementById("tipo").value = "RECEITA";
  renderCategorySelectByTipo("RECEITA");

  setMsg("");
  await carregarResumo();
  page = 0;
  await carregarTransacoes();
}

async function deletarTransacao(id) {
  clearError("err");
  setMsg("Excluindo...");

  const res = await fetch(`/transactions/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  if (!res.ok) {
    setMsg("");
    showError("err", "Não foi possível excluir a transação.");
    return;
  }

  setMsg("");
  await carregarResumo();
  await carregarTransacoes();
}

// ====== modal categoria ======
function openCatModal() {
  clearError("catErr");
  document.getElementById("catNome").value = "";
  document.getElementById("catTipo").value = "RECEITA";
  document.getElementById("catModal").classList.remove("hidden");
}

function closeCatModal() {
  document.getElementById("catModal").classList.add("hidden");
}

async function criarCategoria() {
  clearError("catErr");

  const nome = document.getElementById("catNome").value.trim();
  const tipo = document.getElementById("catTipo").value;

  if (!nome) return showError("catErr", "Informe o nome da categoria.");

  const res = await fetch("/categories", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ nome, tipo })
  });

  if (!res.ok) {
    showError("catErr", "Erro ao criar categoria.");
    return;
  }

  closeCatModal();
  await carregarCategorias();

  // deixa o select do form alinhado com o tipo atual
  renderCategorySelectByTipo(document.getElementById("tipo").value);
}

// ====== modal editar ======
function openEditModal() {
  clearError("editErr");
  document.getElementById("editModal").classList.remove("hidden");
}

function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
  editTxId = null;
}

function abrirModalEdicao(tx) {
  editTxId = tx.id;

  document.getElementById("editDescricao").value = tx.descricao ?? "";
  document.getElementById("editValor").value = String(tx.valor ?? "").replace(",", ".");
  document.getElementById("editData").value = tx.data ?? "";
  document.getElementById("editTipo").value = tx.tipo ?? "RECEITA";

  renderEditCategorySelectByTipo(document.getElementById("editTipo").value, tx.categoryId);

  openEditModal();
}

async function salvarEdicao() {
  clearError("editErr");

  if (!editTxId) return showError("editErr", "Transação inválida.");

  const descricao = document.getElementById("editDescricao").value.trim();
  const valorStr = document.getElementById("editValor").value.trim().replace(",", ".");
  const data = document.getElementById("editData").value;
  const tipo = document.getElementById("editTipo").value;
  const categoryId = document.getElementById("editCategoria").value;

  if (!descricao) return showError("editErr", "Informe a descrição.");
  if (!valorStr || isNaN(Number(valorStr))) return showError("editErr", "Informe um valor válido.");
  if (!data) return showError("editErr", "Informe a data.");
  if (!categoryId) return showError("editErr", "Selecione uma categoria.");

  const payload = {
    descricao,
    valor: Number(valorStr),
    data,
    tipo,
    categoryId: Number(categoryId)
  };

  const res = await fetch(`/transactions/${editTxId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    showError("editErr", "Erro ao salvar alterações.");
    return;
  }

  closeEditModal();
  await carregarResumo();
  await carregarTransacoes();
}

// ====== eventos ======
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});

document.getElementById("txForm").addEventListener("submit", (e) => {
  e.preventDefault();
  criarTransacao();
});

document.getElementById("tipo").addEventListener("change", () => {
  renderCategorySelectByTipo(document.getElementById("tipo").value);
});

// filtro
document.getElementById("btnFiltrar").addEventListener("click", () => {
  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;
  if (!inicio || !fim) return showError("err", "Para filtrar, preencha início e fim.");

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

// paginação
document.getElementById("prevBtn").addEventListener("click", () => {
  if (page > 0) {
    page--;
    carregarTransacoes();
  }
});

document.getElementById("nextBtn").addEventListener("click", async () => {
  page++;
  carregarTransacoes();
});

// modal categoria
document.getElementById("btnNewCategory").addEventListener("click", openCatModal);
document.getElementById("catClose").addEventListener("click", closeCatModal);
document.getElementById("catSave").addEventListener("click", criarCategoria);

// modal editar
document.getElementById("editClose").addEventListener("click", closeEditModal);
document.getElementById("editSave").addEventListener("click", salvarEdicao);

document.getElementById("editTipo").addEventListener("change", () => {
  renderEditCategorySelectByTipo(document.getElementById("editTipo").value, null);
});

// ====== boot ======
(async function init() {
  await carregarCategorias();
  await carregarResumo();
  await carregarTransacoes();
})();