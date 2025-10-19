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
  if (obras.length === 0) {
    obrasGrid.innerHTML = '<p>Nenhuma obra encontrada.</p>';
    return;
  }

  obras.forEach(obra => {
    const card = document.createElement('div');
    card.classList.add('card');

    const imgSrc = obra.imagem ? obra.imagem : 'img/Logo2.png';

    if (!debugMode) {
      // --- modo normal ---
      card.innerHTML = `
        <img src="${imgSrc}" alt="${obra.titulo}">
        <h3>${obra.titulo}</h3>
        <button>Ver detalhes</button>
      `;
    } else {
      // --- modo debug legível ---
      card.classList.add('debug-card');
      card.innerHTML = `
        <img src="${imgSrc}" alt="${obra.titulo}" class="debug-img">
        <h3>${obra.titulo}</h3>
        <table class="debug-table">
          <tr><th>Bairro</th><td>${obra.bairro}</td></tr>
          <tr><th>Construtora</th><td>${obra.construtora}</td></tr>
          <tr><th>Status</th><td>${obra.status}</td></tr>
          <tr><th>Valor Total</th><td>${formatCurrency(obra.valorTotal)}</td></tr>
          ${Object.keys(obra).map(key => {
            if (['titulo','bairro','construtora','status','valorTotal','imagem'].includes(key)) return '';
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

  Array.from(items).sort().forEach(item => {
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
    const obraBairro = normalize(obra.bairro);
    const obraConstrutora = normalize(obra.construtora);
    const obraStatus = normalize(obra.status);

    return (
      (nome === '' || obraNome.includes(nome)) &&
      (bairro === '' || obraBairro.includes(bairro)) &&
      (construtora === '' || obraConstrutora.includes(construtora)) &&
      (status === '' || obraStatus.includes(status)) &&
      obra.valorTotal <= custoMax
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
function init() {
  fetch('obras.json')
    .then(res => res.json())
    .then(data => {
      obrasData = data.publicacoesObras;

      allBairros = [...new Set(obrasData.map(o => o.bairro))];
      allConstrutoras = [...new Set(obrasData.map(o => o.construtora))];
      allStatus = [...new Set(obrasData.map(o => o.status))];

      populateSelect('bairro', allBairros);
      populateSelect('construtora', allConstrutoras);
      populateSelect('status', allStatus);

      renderObras(obrasData);
    })
    .catch(err => console.error('Erro ao carregar obras:', err));
}

init();
