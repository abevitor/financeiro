

const token = localStorage.getItem("token");
if (!token) window.location.href = "/login";

function authHeaders(extra = {}) {
  return { ...extra, Authorization: "Bearer " + token };
}

function moneyBR(v) {
  const n = Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return console.warn(`[WARN] showError: #${id} não existe`);
  el.textContent = msg;
  el.classList.remove("hidden");
}

function clearError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
}

function setMsg(msg) {
  const el = document.getElementById("msg");
  if (!el) return;
  el.textContent = msg ?? "";
}

function on(id, event, handler) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[WARN] Elemento #${id} não encontrado (listener ${event} não registrado)`);
    return;
  }
  el.addEventListener(event, handler);
}

// ====== state ======
let page = 0;
const size = 10;
let usingPeriodo = false;

let allCategories = [];
const categoriesMap = new Map();
let editTxId = null;

// ====== charts state ======
let chartLinha = null;
let chartCategoria = null;

// intervalo padrão do gráfico
const DIAS_PADRAO = 30;

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function subDays(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ====== tabs tipo ======
function setTipo(tipo) {
  const hiddenTipo = document.getElementById("tipo");
  if (hiddenTipo) hiddenTipo.value = tipo;

  const tabR = document.getElementById("tabReceita");
  const tabD = document.getElementById("tabDespesa");

  const activeCls = ["bg-indigo-500/30", "border-indigo-400", "text-indigo-100"];

  if (tabR && tabD) {
    if (tipo === "RECEITA") {
      tabR.classList.add(...activeCls);
      tabD.classList.remove(...activeCls);
    } else {
      tabD.classList.add(...activeCls);
      tabR.classList.remove(...activeCls);
    }
  }

  renderCategorySelectByTipo(tipo);
}

// ====== categorias ======
function renderCategorySelectByTipo(tipo) {
  const select = document.getElementById("categoria");
  if (!select) return;

  select.innerHTML = `<option value="">Selecione uma categoria</option>`;
  const filtered = allCategories.filter((c) => c.tipo === tipo);

  for (const c of filtered) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nome;
    select.appendChild(opt);
  }
}

function renderEditCategorySelectByTipo(tipo, selectedId) {
  const select = document.getElementById("editCategoria");
  if (!select) return;

  select.innerHTML = `<option value="">Selecione uma categoria</option>`;
  const filtered = allCategories.filter((c) => c.tipo === tipo);

  for (const c of filtered) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nome;
    if (selectedId != null && String(c.id) === String(selectedId)) opt.selected = true;
    select.appendChild(opt);
  }
}

async function carregarCategorias() {
  const res = await fetch("/categories", { headers: authHeaders() });
  if (!res.ok) {
    allCategories = [];
    categoriesMap.clear();
    console.warn("[WARN] Não foi possível carregar /categories");
    return;
  }

  allCategories = await res.json();
  categoriesMap.clear();
  for (const c of allCategories) categoriesMap.set(c.id, `${c.nome} (${c.tipo})`);

  const tipoAtual = document.getElementById("tipo")?.value ?? "RECEITA";
  renderCategorySelectByTipo(tipoAtual);
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

  const inicio = document.getElementById("inicio")?.value ?? "";
  const fim = document.getElementById("fim")?.value ?? "";

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
  if (!tbody) return;

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
    const safeTx = encodeURIComponent(JSON.stringify(t));

    const tr = document.createElement("tr");
    tr.className = "border-b border-slate-900";
    tr.innerHTML = `
      <td class="py-3 pr-2 text-slate-300">${t.data ?? ""}</td>
      <td class="py-3 pr-2">${t.descricao ?? ""}</td>
      <td class="py-3 pr-2 font-semibold ${tipoColor}">${t.tipo ?? ""}</td>
      <td class="py-3 pr-2 text-slate-200">${catLabel}</td>
      <td class="py-3 pr-2 text-right">${moneyBR(t.valor)}</td>
      <td class="py-3 text-right flex justify-end gap-2">
        <button data-tx="${safeTx}" type="button"
          class="btnEdit rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 px-3 py-1 text-indigo-200">
          Editar
        </button>
        <button data-id="${t.id}" type="button"
          class="btnDel rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 px-3 py-1 text-rose-200">
          Excluir
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  document.querySelectorAll(".btnDel").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
      if (!confirm("Deseja excluir esta transação?")) return;
      await deletarTransacao(id);
    });
  });

  document.querySelectorAll(".btnEdit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const raw = btn.getAttribute("data-tx");
      if (!raw) return;
      const tx = JSON.parse(decodeURIComponent(raw));
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

  const pageBtns = document.getElementById("pageBtns");
  pageBtns.innerHTML = "";
  if (totalPages <= 1) return;

  const start = Math.max(0, number - 2);
  const end = Math.min(totalPages - 1, number + 2);

  for (let p = start; p <= end; p++) {
    const b = document.createElement("button");
    b.type = "button";
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

  const descricao = document.getElementById("descricao")?.value?.trim() ?? "";
  const valorStr = (document.getElementById("valor")?.value ?? "").trim().replace(",", ".");
  const data = document.getElementById("data")?.value ?? "";
  const tipo = document.getElementById("tipo")?.value ?? "RECEITA";
  const categoryId = document.getElementById("categoria")?.value ?? "";

  if (!descricao) return showError("err", "Informe a descrição.");
  if (!valorStr || isNaN(Number(valorStr))) return showError("err", "Informe um valor válido (ex: 19.90).");
  if (!data) return showError("err", "Informe a data.");
  if (!categoryId) return showError("err", "Selecione uma categoria.");

  const payload = {
    descricao,
    valor: Number(valorStr),
    data,
    tipo,
    categoryId: Number(categoryId),
  };

  setMsg("Salvando...");

  const res = await fetch("/transactions", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
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

  setMsg("");
  await carregarResumo();
  page = 0;
  await carregarTransacoes();
  await carregarGraficos();
}

async function deletarTransacao(id) {
  clearError("err");
  setMsg("Excluindo...");

  const res = await fetch(`/transactions/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    setMsg("");
    showError("err", "Não foi possível excluir a transação.");
    return;
  }

  setMsg("");
  await carregarResumo();
  await carregarTransacoes();
  await carregarGraficos();
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

  const nome = document.getElementById("catNome")?.value?.trim() ?? "";
  const tipo = document.getElementById("catTipo")?.value ?? "RECEITA";

  if (!nome) return showError("catErr", "Informe o nome da categoria.");

  const res = await fetch("/categories", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ nome, tipo }),
  });

  if (!res.ok) {
    showError("catErr", "Erro ao criar categoria.");
    return;
  }

  closeCatModal();
  await carregarCategorias();

  const tipoAtual = document.getElementById("tipo")?.value ?? "RECEITA";
  renderCategorySelectByTipo(tipoAtual);

  await carregarGraficos();
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

  const descricao = document.getElementById("editDescricao")?.value?.trim() ?? "";
  const valorStr = (document.getElementById("editValor")?.value ?? "").trim().replace(",", ".");
  const data = document.getElementById("editData")?.value ?? "";
  const tipo = document.getElementById("editTipo")?.value ?? "RECEITA";
  const categoryId = document.getElementById("editCategoria")?.value ?? "";

  if (!descricao) return showError("editErr", "Informe a descrição.");
  if (!valorStr || isNaN(Number(valorStr))) return showError("editErr", "Informe um valor válido.");
  if (!data) return showError("editErr", "Informe a data.");
  if (!categoryId) return showError("editErr", "Selecione uma categoria.");

  const payload = {
    descricao,
    valor: Number(valorStr),
    data,
    tipo,
    categoryId: Number(categoryId),
  };

  const res = await fetch(`/transactions/${editTxId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    showError("editErr", "Erro ao salvar alterações.");
    return;
  }

  closeEditModal();
  await carregarResumo();
  await carregarTransacoes();
  await carregarGraficos();
}

// ====== gráficos ======
async function fetchAllTransactionsForPeriod(inicio, fim) {
  const url = `/transactions/periodo?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}&page=0&size=500&sort=data,asc`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return data.content ?? [];
}

function groupByDate(transactions) {
  const map = new Map();

  for (const t of transactions) {
    const day = t.data;
    if (!day) continue;

    if (!map.has(day)) map.set(day, { receitas: 0, despesas: 0 });

    const item = map.get(day);
    const valor = Number(t.valor ?? 0);

    if (t.tipo === "RECEITA") item.receitas += valor;
    else item.despesas += valor;
  }

  const dates = Array.from(map.keys()).sort();
  const receitas = [];
  const despesas = [];
  const saldo = [];

  let acum = 0;
  for (const d of dates) {
    const it = map.get(d);
    receitas.push(it.receitas);
    despesas.push(it.despesas);
    acum += (it.receitas - it.despesas);
    saldo.push(acum);
  }

  return { dates, receitas, despesas, saldo };
}

function groupByCategory(transactions) {
  const map = new Map(); // categoryId -> total abs

  for (const t of transactions) {
    const id = t.categoryId ?? 0;
    const valor = Math.abs(Number(t.valor ?? 0));
    map.set(id, (map.get(id) ?? 0) + valor);
  }

  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

  const labels = [];
  const values = [];
  let outros = 0;

  entries.forEach(([id, total], idx) => {
    if (idx < 8) {
      labels.push(categoriesMap.get(id) ?? `Categoria #${id}`);
      values.push(total);
    } else {
      outros += total;
    }
  });

  if (outros > 0) {
    labels.push("Outros");
    values.push(outros);
  }

  return { labels, values };
}

async function carregarGraficos() {
  if (typeof Chart === "undefined") {
    console.error("❌ Chart.js não está carregado.");
    return;
  }

  const canvasLinha = document.getElementById("chartLinha");
  const canvasCat = document.getElementById("chartCategoria");
  if (!canvasLinha || !canvasCat) {
    console.error("❌ Canvas não encontrado (#chartLinha / #chartCategoria).");
    return;
  }

  let inicio = document.getElementById("inicio")?.value ?? "";
  let fim = document.getElementById("fim")?.value ?? "";

  // 1) Se estiver usando filtro, usa filtro
  if (usingPeriodo && inicio && fim) {
    const tx = await fetchAllTransactionsForPeriod(inicio, fim);
    renderCharts(tx);
    return;
  }

  // 2) Tenta últimos 30 dias a partir de HOJE
  let fimAuto = toISODate(new Date());
  let inicioAuto = toISODate(subDays(DIAS_PADRAO));
  let tx = await fetchAllTransactionsForPeriod(inicioAuto, fimAuto);

  // 3) Se vier vazio, pega a "última transação" e monta um range baseado nela
  if (!tx.length) {
    const res = await fetch(`/transactions?page=0&size=1&sort=data,desc`, { headers: authHeaders() });
    if (res.ok) {
      const pageData = await res.json();
      const last = (pageData.content ?? [])[0];
      if (last?.data) {
        const lastDate = new Date(last.data + "T00:00:00");
        fimAuto = toISODate(lastDate);
        const start = new Date(lastDate);
        start.setDate(start.getDate() - DIAS_PADRAO);
        inicioAuto = toISODate(start);

        tx = await fetchAllTransactionsForPeriod(inicioAuto, fimAuto);
      }
    }
  }

  renderCharts(tx);
}

function renderCharts(transactions) {
  const { dates, receitas, despesas, saldo } = groupByDate(transactions);
  const { labels, values } = groupByCategory(transactions);

  // se não tiver nada, ainda assim desenha gráfico "vazio" com 1 ponto
  const finalDates = dates.length ? dates : ["—"];
  const finalReceitas = receitas.length ? receitas : [0];
  const finalDespesas = despesas.length ? despesas : [0];
  const finalSaldo = saldo.length ? saldo : [0];

  // ===== Linha =====
  const ctxLinha = document.getElementById("chartLinha").getContext("2d");
  if (chartLinha) chartLinha.destroy();

  chartLinha = new Chart(ctxLinha, {
    type: "line",
    data: {
      labels: finalDates,
      datasets: [
        { label: "Receitas", data: finalReceitas, tension: 0.3 },
        { label: "Despesas", data: finalDespesas, tension: 0.3 },
        { label: "Saldo (acumulado)", data: finalSaldo, tension: 0.3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#cbd5e1" } } },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.12)" } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.12)" } },
      },
    },
  });

  // ===== Doughnut =====
  const ctxCat = document.getElementById("chartCategoria").getContext("2d");
  if (chartCategoria) chartCategoria.destroy();

  const finalLabels = labels.length ? labels : ["—"];
  const finalValues = values.length ? values : [0];

  chartCategoria = new Chart(ctxCat, {
    type: "doughnut",
    data: {
      labels: finalLabels,
      datasets: [{ label: "Total", data: finalValues }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#cbd5e1" } } },
    },
  });
}

// ====== binds ======
on("logoutBtn", "click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});

on("txForm", "submit", (e) => {
  e.preventDefault();
  criarTransacao();
});

on("btnFiltrar", "click", () => {
  const inicio = document.getElementById("inicio")?.value ?? "";
  const fim = document.getElementById("fim")?.value ?? "";
  if (!inicio || !fim) return showError("err", "Para filtrar, preencha início e fim.");

  usingPeriodo = true;
  page = 0;
  carregarTransacoes();
  carregarGraficos();
});

on("btnLimpar", "click", () => {
  document.getElementById("inicio").value = "";
  document.getElementById("fim").value = "";
  usingPeriodo = false;
  page = 0;
  carregarTransacoes();
  carregarGraficos();
});

on("prevBtn", "click", () => {
  if (page > 0) {
    page--;
    carregarTransacoes();
  }
});

on("nextBtn", "click", () => {
  page++;
  carregarTransacoes();
});

on("btnNewCategory", "click", openCatModal);
on("catClose", "click", closeCatModal);
on("catSave", "click", criarCategoria);

on("editClose", "click", closeEditModal);
on("editSave", "click", salvarEdicao);

on("editTipo", "change", () => {
  renderEditCategorySelectByTipo(document.getElementById("editTipo")?.value ?? "RECEITA", null);
});

on("tabReceita", "click", () => setTipo("RECEITA"));
on("tabDespesa", "click", () => setTipo("DESPESA"));

// ====== boot ======
(async function init() {
  console.log("✅ init rodando");
  setTipo("RECEITA");
  await carregarCategorias();
  await carregarResumo();
  await carregarTransacoes();
  await carregarGraficos();
})();