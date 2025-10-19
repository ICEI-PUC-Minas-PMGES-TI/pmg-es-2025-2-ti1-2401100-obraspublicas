// ==============================
// VARIÁVEIS GLOBAIS
// ==============================
const API_URL = "http://localhost:3000/obras";
let obraEditando = null;
const $ = s => document.querySelector(s);

// ==============================
// EVENTOS INICIAIS
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  $("#obraForm").addEventListener("submit", salvarObra);
  $("#limpar").addEventListener("click", limparFormulario);
  carregarObras();
});

// ==============================
// FUNÇÕES DE REQUISIÇÃO
// ==============================
function carregarObras() {
  fetch(API_URL)
    .then(res => res.json())
    .then(obras => {
      console.log("Obras carregadas:", obras);
      renderizarObras(obras);
    })
    .catch(err => console.error("Erro ao carregar obras:", err));
}

function salvarObra(e) {
  e.preventDefault();
  const dados = coletarDados();
  if (!dados.titulo) return alert("Título é obrigatório.");

  const metodo = obraEditando ? "PUT" : "POST";
  const url = obraEditando ? `${API_URL}/${obraEditando}` : API_URL;

  if (!obraEditando && dados.id) delete dados.id;

  fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao salvar obra");
      return res.json();
    })
    .then(() => {
      limparFormulario();
      carregarObras();
    })
    .catch(err => console.error("Erro ao salvar obra:", err));
}

function editarObra(id) {
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(o => {
      $("#titulo").value = o.titulo;
      $("#descricao").value = o.descricao;
      $("#valorContratado").value = o.valorContratado;
      $("#status").value = o.status;
      $("#dataInicio").value = o.dataInicio;
      $("#previsaoTermino").value = o.previsaoTermino;
      $("#orgaoResponsavel").value = o.orgaoResponsavel;
      $("#empresaExecutora").value = o.empresaExecutora;
      $("#logradouro").value = o.endereco?.logradouro || "";
      $("#numero").value = o.endereco?.numero || "";
      $("#bairro").value = o.endereco?.bairro || "";
      $("#cidade").value = o.endereco?.cidade || "";
      $("#estado").value = o.endereco?.estado || "";
      $("#cep").value = o.endereco?.cep || "";
      obraEditando = o.id;
      window.scrollTo({ top: 0, behavior: "smooth" });
    })
    .catch(err => console.error("Erro ao carregar obra para edição:", err));
}

function excluirObra(id) {
  if (!confirm("Deseja excluir esta obra?")) return;
  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(() => carregarObras())
    .catch(err => console.error("Erro ao excluir obra:", err));
}

// ==============================
// FORMULÁRIO E DADOS
// ==============================
function coletarDados() {
  const files = Array.from($("#anexos").files || []);
  const anexos = files.map(f => ({
    tipo: f.type.startsWith("image/") ? "imagem" : "documento",
    nomeArquivo: f.name,
    url: `uploads/${f.name}`
  }));

  return {
    titulo: $("#titulo").value.trim(),
    descricao: $("#descricao").value.trim(),
    valorContratado: parseFloat($("#valorContratado").value) || 0,
    status: $("#status").value,
    dataInicio: $("#dataInicio").value,
    previsaoTermino: $("#previsaoTermino").value,
    orgaoResponsavel: $("#orgaoResponsavel").value.trim(),
    empresaExecutora: $("#empresaExecutora").value.trim(),
    endereco: {
      logradouro: $("#logradouro").value.trim(),
      numero: $("#numero").value.trim(),
      bairro: $("#bairro").value.trim(),
      cidade: $("#cidade").value.trim(),
      estado: $("#estado").value.trim(),
      cep: $("#cep").value.trim()
    },
    anexos
  };
}

function limparFormulario() {
  $("#obraForm").reset();
  obraEditando = null;
}

// ==============================
// RENDERIZAÇÃO DE OBRAS
// ==============================
function renderizarObras(obras) {
  const container = $("#obrasContainer");
  container.innerHTML = obras.length
    ? obras.map(obra => gerarHTMLObra(obra)).join("")
    : `<p class="small muted">Nenhuma obra cadastrada.</p>`;
}

function gerarHTMLObra(obra) {
  const e = obra.endereco || {};
  const anexos = (obra.anexos || [])
    .map(a => `<li><a href="${a.url}" target="_blank">${a.nomeArquivo}</a> <span class="tag">${a.tipo}</span></li>`)
    .join("");

  const formatarData = d => {
    if (!d) return "-";
    const [ano, mes, dia] = d.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return `
    <div class="obra-card">
      <div class="obra-header">
        <h3>${obra.titulo}</h3>
        <span class="status ${obra.status.toLowerCase().replace(/\s/g, "-")}">${obra.status}</span>
      </div>
      <p class="descricao">${obra.descricao || "-"}</p>

      <div class="obra-info">
        <p><strong>Valor Contratado:</strong> ${obra.valorContratado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <p><strong>Período:</strong> ${formatarData(obra.dataInicio)} → ${formatarData(obra.previsaoTermino)}</p>
        <p><strong>Órgão Responsável:</strong> ${obra.orgaoResponsavel || "-"}</p>
        <p><strong>Empresa Executora:</strong> ${obra.empresaExecutora || "-"}</p>
        <p><strong>Endereço:</strong> ${e.logradouro || ""}, ${e.numero || ""}, ${e.bairro || ""}, ${e.cidade || ""} - ${e.estado || ""}, CEP ${e.cep || ""}</p>
      </div>

      ${anexos ? `<div class="obra-anexos"><strong>Anexos:</strong><ul>${anexos}</ul></div>` : ""}

      <div class="obra-actions">
        <button class="btn btn-ghost" onclick="editarObra('${obra.id}')">Editar</button>
        <button class="btn btn-danger" onclick="excluirObra('${obra.id}')">Excluir</button>
      </div>
    </div>
  `;
}