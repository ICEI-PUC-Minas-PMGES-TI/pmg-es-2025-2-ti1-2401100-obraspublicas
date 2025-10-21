const sidebar = document.querySelector('.sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const slider = document.getElementById('custo');
const sliderValue = document.getElementById('custo-value');
const bairroFilter = document.getElementById('bairro');
const construtoraFilter = document.getElementById('construtora');
const statusFilter = document.getElementById('status');
const nomeFilter = document.getElementById('nome');
const clearFiltersBtn = document.getElementById('clearFilters');
const obrasGrid = document.getElementById('obrasGrid');
const debugBtn = document.querySelector('.debug');
const API = "http://localhost:3000/obras";
const userDropdownToggle = document.getElementById('userDropdownToggle');
const userDropdown = document.getElementById('userDropdown');
const toggleFontBtn = document.getElementById('toggleFont');

let obrasData = [];
let allBairros = [];
let allConstrutoras = [];
let allStatus = [];
let debugMode = false;

const formatCurrency = (value) => 'R$ ' + Number(value).toLocaleString('pt-BR');

function normalize(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

// === TOGGLE SIDEBAR ===
toggleSidebarBtn.addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('closed');
  }
});

// === SLIDER ===
slider.value = slider.max;
sliderValue.textContent = formatCurrency(slider.value);

slider.addEventListener('input', () => {
  sliderValue.textContent = formatCurrency(slider.value);
  filterObras();
});

// === RENDERIZAÇÃO DE OBRAS ===
function renderObras(obras) {
  obrasGrid.innerHTML = '';
  if (!obras.length) {
    obrasGrid.innerHTML = '<p>Nenhuma obra encontrada.</p>';
    return;
  }

  obras.forEach(obra => {
    const card = document.createElement('div');
    card.classList.add('card');

    const imgSrc = Array.isArray(obra.anexos)
      ? (obra.anexos.find(a => a.tipo === "imagem")?.url || './img/Logo2.png')
      : './img/Logo2.png';

    if (!debugMode) {
      card.innerHTML = `
        <img src="${imgSrc}" alt="obra" onerror="this.onerror=null; this.src='./img/Logo2.png'">
        <h3>${obra.titulo}</h3>
        <button>Ver detalhes</button>
      `;
    } else {
      card.classList.add('debug-card');
      card.innerHTML = `
        <h3>${obra.titulo}</h3>
        <table class="debug-table">
          <tr><th>Bairro</th><td>${obra.endereco?.bairro || ''}</td></tr>
          <tr><th>Construtora</th><td>${obra.empresaExecutora || ''}</td></tr>
          <tr><th>Status</th><td>${obra.status || ''}</td></tr>
          <tr><th>Valor Total</th><td>${formatCurrency(obra.valorContratado || 0)}</td></tr>
          ${Object.keys(obra).map(key => {
            if (['titulo','empresaExecutora','status','valorContratado','anexos','endereco'].includes(key)) return '';
            return `<tr><th>${key}</th><td>${obra[key]}</td></tr>`;
          }).join('')}
        </table>
      `;
    }

    obrasGrid.appendChild(card);
  });
}

// === POPULAR SELECTS ===
function populateSelect(selectId, items) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';

  const todasOption = document.createElement('option');
  todasOption.value = 'Todas';
  todasOption.textContent = 'Todas';
  select.appendChild(todasOption);

  Array.from(new Set(items.filter(Boolean))).sort().forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

// === FILTRAR OBRAS ===
function filterObras() {
  const nomeRaw = nomeFilter.value;
  const bairroRaw = bairroFilter.value;
  const construtoraRaw = construtoraFilter.value;
  const statusRaw = statusFilter.value;
  const custoMax = parseInt(slider.value);

  const nome = nomeRaw ? normalize(nomeRaw) : '';
  const bairro = (bairroRaw && bairroRaw.toLowerCase() !== 'todas') ? normalize(bairroRaw) : '';
  const construtora = (construtoraRaw && construtoraRaw.toLowerCase() !== 'todas') ? normalize(construtoraRaw) : '';
  const status = (statusRaw && statusRaw.toLowerCase() !== 'todas') ? normalize(statusRaw) : '';

  const filtered = obrasData.filter(obra => {
    const obraNome = normalize(obra.titulo);
    const obraBairro = normalize(obra.endereco?.bairro);
    const obraConstrutora = normalize(obra.empresaExecutora);
    const obraStatus = normalize(obra.status);
    const obraValor = obra.valorContratado ?? 0;

    return (
      (nome === '' || obraNome.includes(nome)) &&
      (bairro === '' || obraBairro.includes(bairro)) &&
      (construtora === '' || obraConstrutora.includes(construtora)) &&
      (status === '' || obraStatus.includes(status)) &&
      obraValor <= custoMax
    );
  });

  renderObras(filtered);
}

// === EVENTOS INPUTS ===
nomeFilter.addEventListener('input', filterObras);
[bairroFilter, construtoraFilter, statusFilter].forEach(select => {
  select.addEventListener('change', filterObras);
});

// === LIMPAR FILTROS ===
clearFiltersBtn.addEventListener('click', () => {
  nomeFilter.value = '';
  bairroFilter.value = 'Todas';
  construtoraFilter.value = 'Todas';
  statusFilter.value = 'Todas';
  slider.value = slider.max;
  sliderValue.textContent = formatCurrency(slider.value);

  renderObras(obrasData);
});

// === BOTÃO DEBUG ===
if (debugBtn) {
  debugBtn.addEventListener('click', () => {
    debugMode = !debugMode;
    debugBtn.classList.toggle('active', debugMode);
    debugBtn.textContent = debugMode ? 'Sair do Debug' : 'Modo Debug';
    renderObras(obrasData);
  });
}

// === INIT ===
async function init() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Erro na API');
    const data = await res.json();

    console.log('Resposta da API:', data);

    // Garantir que obrasData seja array
    obrasData = Array.isArray(data) ? data : [];

    // Popular filtros
    allBairros = obrasData.map(o => o.endereco?.bairro || '');
    allConstrutoras = obrasData.map(o => o.empresaExecutora || '');
    allStatus = obrasData.map(o => o.status || '');

    populateSelect('bairro', allBairros);
    populateSelect('construtora', allConstrutoras);
    populateSelect('status', allStatus);

    renderObras(obrasData);
  } catch (err) {
    console.error('Erro ao carregar obras:', err);
  }
}

init();

// === ACESSIBILIDADE: AUMENTAR FONTE ===
userDropdownToggle.addEventListener('click', (e) => {
  e.stopPropagation(); // evita fechar ao clicar dentro
  userDropdown.style.display = userDropdown.style.display === 'flex' ? 'none' : 'flex';
});

// Fechar dropdown ao clicar fora
document.addEventListener('click', () => {
  userDropdown.style.display = 'none';
});

// Acessibilidade: aumentar/reduzir fonte
if (localStorage.getItem('fontLarge') === 'true') {
  document.body.classList.add('font-large');
}

toggleFontBtn.addEventListener('click', () => {
  const isLarge = document.body.classList.toggle('font-large');
  localStorage.setItem('fontLarge', isLarge);
});
