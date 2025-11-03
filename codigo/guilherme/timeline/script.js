// ========================
// ESTADO
// ========================
let obras = [];
let obraSelecionada = null;
let editIndex = null;
const API_URL = 'http://localhost:3000'; // URL do JSON Server

const $ = (selector) => document.querySelector(selector);

// ========================
// CARREGAR DADOS
// ========================
async function carregarObras() {
  try {
    const response = await fetch(`${API_URL}/obras`);
    obras = await response.json();
    popularSelectObras();
  } catch (error) {
    console.error('Erro ao carregar obras:', error);
    obras = [];
  }
}

function popularSelectObras() {
  const select = $("#selecionarObra");
  if (!select) return;

  select.innerHTML = '<option value="">Selecione uma obra...</option>';
  
  obras.forEach(obra => {
    const option = document.createElement("option");
    option.value = obra.id;
    option.textContent = `${obra.titulo} (${obra.status})`;
    select.appendChild(option);
  });
}

async function selecionarObra(obraId) {
  try {
    const response = await fetch(`${API_URL}/obras/${obraId}`);
    obraSelecionada = await response.json();
    
    if (obraSelecionada) {
      // Atualizar informações da obra
      $("#obraTitulo").textContent = obraSelecionada.titulo;
      
      const obraInfo = $("#obraInfo");
      obraInfo.innerHTML = `
        <div><strong>Descrição:</strong> ${obraSelecionada.descricao}</div>
        <div><strong>Status:</strong> ${obraSelecionada.status}</div>
        <div><strong>Valor:</strong> R$ ${formatarMoeda(obraSelecionada.valorContratado)}</div>
        <div><strong>Data Início:</strong> ${formatarData(obraSelecionada.dataInicio)}</div>
        <div><strong>Previsão Término:</strong> ${formatarData(obraSelecionada.previsaoTermino)}</div>
      `;
      
      renderTimeline();
    }
  } catch (error) {
    console.error('Erro ao carregar obra:', error);
    obraSelecionada = null;
    $("#obraTitulo").textContent = "Progresso da Obra";
    $("#obraInfo").innerHTML = "";
    renderTimeline();
  }
}

// ========================
// FUNÇÕES DE CRUD
// ========================
function renderTimeline() {
  const timelineList = $("#timelineList");
  const emptyState = $("#emptyState");
  if (!timelineList) return;

  timelineList.innerHTML = "";

  if (!obraSelecionada || !obraSelecionada.marcos || obraSelecionada.marcos.length === 0) {
    if (emptyState) {
      emptyState.style.display = "flex";
      emptyState.innerHTML = `
        <div class="empty-icon">🕒</div>
        ${obraSelecionada ? 'Nenhum marco adicionado ainda.' : 'Selecione uma obra para ver os marcos.'}
      `;
    }
    updateProgress();
    return;
  } else {
    if (emptyState) emptyState.style.display = "none";
  }

  // Ordenar marcos por data (mais recente primeiro)
  const marcosOrdenados = [...obraSelecionada.marcos].sort((a, b) => 
    new Date(b.data) - new Date(a.data)
  );

  marcosOrdenados.forEach((m, index) => {
    const originalIndex = obraSelecionada.marcos.indexOf(m);
    const div = document.createElement("div");
    div.className = "marco";
    div.setAttribute("data-porcentagem", m.percentual);
    div.innerHTML = `
      <div class="marco-info">
        <div class="marco-title">${escapeHtml(m.titulo || m.nome)}</div>
        <div class="marco-desc">${escapeHtml(m.descricao)}</div>
        <div class="marco-meta">
          <span>Concluído: ${Number(m.percentual).toFixed(0)}%</span>
          ${m.data ? `<span style="margin-left: 12px;">Data: ${formatarData(m.data)}</span>` : ''}
        </div>
      </div>
      <div class="marco-actions">
        <button class="btn btn-ghost btn-small" onclick="editarMarco(${originalIndex})">Editar</button>
        <button class="btn btn-danger btn-small" onclick="excluirMarco(${originalIndex})">Excluir</button>
      </div>
    `;
    timelineList.appendChild(div);
  });

  updateProgress();
}

async function adicionarMarco() {
  if (!obraSelecionada) {
    alert("Selecione uma obra primeiro.");
    return;
  }

  const tituloEl = $("#marcoTitulo");
  const descricaoEl = $("#marcoDescricao");
  const porcentEl = $("#marcoPorcentagem");
  const dataEl = $("#marcoData");

  const titulo = (tituloEl?.value || "").trim();
  const descricao = (descricaoEl?.value || "").trim();
  const percentual = parseFloat(porcentEl?.value) || 0;
  const data = dataEl?.value || new Date().toISOString().split('T')[0];

  if (!titulo) {
    alert("O título é obrigatório.");
    if (tituloEl) tituloEl.focus();
    return;
  }
  if (percentual < 0 || percentual > 100) {
    alert("Porcentagem deve estar entre 0 e 100.");
    if (porcentEl) porcentEl.focus();
    return;
  }

  try {
    // Inicializar array de marcos se não existir
    if (!obraSelecionada.marcos) {
      obraSelecionada.marcos = [];
    }

    const novoMarco = { 
      titulo, 
      descricao, 
      percentual, 
      data 
    };

    obraSelecionada.marcos.push(novoMarco);

    // Atualizar no JSON Server
    await fetch(`${API_URL}/obras/${obraSelecionada.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obraSelecionada)
    });

    limparFormulario();
    renderTimeline();
  } catch (error) {
    console.error('Erro ao adicionar marco:', error);
    alert('Erro ao adicionar marco.');
  }
}

function limparFormulario() {
  if ($("#marcoTitulo")) $("#marcoTitulo").value = "";
  if ($("#marcoDescricao")) $("#marcoDescricao").value = "";
  if ($("#marcoPorcentagem")) $("#marcoPorcentagem").value = 0;
  if ($("#marcoData")) $("#marcoData").value = new Date().toISOString().split('T')[0];
}

// ========================
// EDIÇÃO
// ========================
function editarMarco(index) {
  if (!obraSelecionada || !obraSelecionada.marcos) return;
  
  editIndex = index;
  const m = obraSelecionada.marcos[index];
  if (!m) return;
  
  if ($("#editTitulo")) $("#editTitulo").value = m.titulo || m.nome || "";
  if ($("#editDescricao")) $("#editDescricao").value = m.descricao || "";
  if ($("#editPorcentagem")) $("#editPorcentagem").value = m.percentual || 0;
  if ($("#editData")) $("#editData").value = m.data || new Date().toISOString().split('T')[0];
  
  const modal = $("#modalEditar");
  if (modal) modal.style.display = "flex";
}

async function salvarEdicao() {
  if (editIndex === null || !obraSelecionada || !obraSelecionada.marcos) return;
  
  const titulo = ($("#editTitulo")?.value || "").trim();
  const descricao = ($("#editDescricao")?.value || "").trim();
  const percentual = parseFloat($("#editPorcentagem")?.value) || 0;
  const data = $("#editData")?.value || new Date().toISOString().split('T')[0];

  if (!titulo) {
    alert("O título é obrigatório.");
    return;
  }
  if (percentual < 0 || percentual > 100) {
    alert("Porcentagem deve estar entre 0 e 100.");
    return;
  }

  try {
    obraSelecionada.marcos[editIndex] = { 
      titulo, 
      descricao, 
      percentual, 
      data 
    };

    // Atualizar no JSON Server
    await fetch(`${API_URL}/obras/${obraSelecionada.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obraSelecionada)
    });

    editIndex = null;
    const modal = $("#modalEditar");
    if (modal) modal.style.display = "none";
    renderTimeline();
  } catch (error) {
    console.error('Erro ao salvar edição:', error);
    alert('Erro ao salvar edição.');
  }
}

function cancelarEdicao() {
  editIndex = null;
  const modal = $("#modalEditar");
  if (modal) modal.style.display = "none";
}

// ========================
// EXCLUSÃO
// ========================
async function excluirMarco(index) {
  if (!confirm("Deseja excluir este marco?")) return;
  
  try {
    obraSelecionada.marcos.splice(index, 1);

    // Atualizar no JSON Server
    await fetch(`${API_URL}/obras/${obraSelecionada.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obraSelecionada)
    });

    renderTimeline();
  } catch (error) {
    console.error('Erro ao excluir marco:', error);
    alert('Erro ao excluir marco.');
  }
}

// ========================
// PROGRESSO (média das porcentagens)
// ========================
function updateProgress() {
  const progressFill = $("#progressFill");
  const progressText = $("#progressText");
  if (!progressFill || !progressText) return;

  if (!obraSelecionada || !obraSelecionada.marcos || obraSelecionada.marcos.length === 0) {
    progressFill.style.width = "0%";
    progressText.textContent = "0%";
    return;
  }

  const soma = obraSelecionada.marcos.reduce((acc, m) => acc + (Number(m.percentual) || 0), 0);
  const media = soma / obraSelecionada.marcos.length;
  const limitada = Math.max(0, Math.min(100, media));
  progressFill.style.width = limitada + "%";
  progressText.textContent = limitada.toFixed(0) + "%";
}

// ========================
// UTILS
// ========================
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatarData(dataString) {
  if (!dataString) return 'Não informada';
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

// ========================
// EVENTOS
// ========================
document.addEventListener("DOMContentLoaded", () => {
  // Selecionar obra
  const selectObra = $("#selecionarObra");
  if (selectObra) {
    selectObra.addEventListener("change", (e) => {
      selecionarObra(e.target.value);
    });
  }

  // botões de adicionar/limpar
  const addBtn = $("#adicionarMarcoBtn");
  if (addBtn) addBtn.addEventListener("click", adicionarMarco);

  const limparBtn = $("#limparFormBtn");
  if (limparBtn) limparBtn.addEventListener("click", limparFormulario);

  // modal editar: salvar/cancelar/fechar
  const salvarBtn = $("#salvarEdicaoBtn");
  if (salvarBtn) salvarBtn.addEventListener("click", salvarEdicao);

  const cancelarBtn = $("#cancelarEdicaoBtn");
  if (cancelarBtn) cancelarBtn.addEventListener("click", cancelarEdicao);

  const modalClose = $("#modalClose");
  if (modalClose) modalClose.addEventListener("click", cancelarEdicao);

  // fechar modal com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = $("#modalEditar");
      if (modal && modal.style.display === "flex") modal.style.display = "none";
      editIndex = null;
    }
  });

  // Carregar obras ao iniciar
  carregarObras();
});