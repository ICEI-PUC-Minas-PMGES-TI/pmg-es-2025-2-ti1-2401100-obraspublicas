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
const mapsBox = document.querySelector('.maps-box');
const mapContainer = document.getElementById('map');

let obrasData = [];
let allBairros = [];
let allConstrutoras = [];
let allStatus = [];
let debugMode = false;
let mapInstance = null;
let markersLayer = null;

const formatCurrency = (value) => 'R$ ' + Number(value).toLocaleString('pt-BR');
const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() : '';

// === TOGGLE SIDEBAR ===
toggleSidebarBtn.addEventListener('click', () => {
  if (window.innerWidth <= 768) sidebar.classList.toggle('open');
  else sidebar.classList.toggle('closed');
});

// === SLIDER ===
slider.value = slider.max;
sliderValue.textContent = formatCurrency(slider.value);
slider.addEventListener('input', () => {
  sliderValue.textContent = formatCurrency(slider.value);
  filterObras();
});

// === POPULAR SELECTS ===
function populateSelect(selectId, items) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="Todas">Todas</option>';
  Array.from(new Set(items.filter(Boolean))).sort().forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

// === FILTRAR OBRAS ===
function filterObras() {
  const nome = normalize(nomeFilter.value);
  const bairro = normalize(bairroFilter.value !== 'Todas' ? bairroFilter.value : '');
  const construtora = normalize(construtoraFilter.value !== 'Todas' ? construtoraFilter.value : '');
  const status = normalize(statusFilter.value !== 'Todas' ? statusFilter.value : '');
  const custoMax = parseInt(slider.value);

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

  updateView(filtered);
}

// === ATUALIZA GRID OU MAPA ===
function updateView(obras) {
  const isMapVisible = mapContainer.style.display === 'block';
  if (isMapVisible) renderMap(obras);
  else renderGrid(obras);
}

// === GRID ===
function renderGrid(obras) {
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
        </table>
      `;
    }

    obrasGrid.appendChild(card);
  });
}

// === MAPA ===
function renderMap(obras) {
  if (!mapInstance) {
    mapInstance = L.map('map').setView([-19.9245, -43.935], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);
    markersLayer = L.layerGroup().addTo(mapInstance);
  }

  markersLayer.clearLayers();

  obras.forEach(obra => {
    const lat = parseFloat(obra.latitude || obra.endereco?.lat);
    const lng = parseFloat(obra.longitude || obra.endereco?.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
      const marker = L.marker([lat, lng]).addTo(markersLayer);
      marker.bindPopup(`
        <b>${obra.titulo}</b><br>
        ${obra.endereco?.bairro || ''}, ${obra.endereco?.cidade || ''}<br>
        <small>${obra.status}</small>
      `);
    }
  });

  if (markersLayer.getLayers().length > 0) {
    mapInstance.fitBounds(markersLayer.getBounds());
  }
}

// === LIMPAR FILTROS ===
clearFiltersBtn.addEventListener('click', () => {
  nomeFilter.value = '';
  bairroFilter.value = 'Todas';
  construtoraFilter.value = 'Todas';
  statusFilter.value = 'Todas';
  slider.value = slider.max;
  sliderValue.textContent = formatCurrency(slider.value);
  updateView(obrasData);
});

// === EVENTOS ===
nomeFilter.addEventListener('input', filterObras);
[bairroFilter, construtoraFilter, statusFilter].forEach(select => select.addEventListener('change', filterObras));

if (debugBtn) {
  debugBtn.addEventListener('click', () => {
    debugMode = !debugMode;
    debugBtn.classList.toggle('active', debugMode);
    debugBtn.textContent = debugMode ? 'Sair do Debug' : 'Modo Debug';
    updateView(obrasData);
  });
}

// === INIT ===
async function init() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Erro na API');
    const data = await res.json();

    obrasData = Array.isArray(data) ? data : [];
    allBairros = obrasData.map(o => o.endereco?.bairro || '');
    allConstrutoras = obrasData.map(o => o.empresaExecutora || '');
    allStatus = obrasData.map(o => o.status || '');

    populateSelect('bairro', allBairros);
    populateSelect('construtora', allConstrutoras);
    populateSelect('status', allStatus);

    updateView(obrasData);
  } catch (err) {
    console.error('Erro ao carregar obras:', err);
  }
}

init();

// === ACESSIBILIDADE ===
userDropdownToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  userDropdown.style.display = userDropdown.style.display === 'flex' ? 'none' : 'flex';
});

document.addEventListener('click', () => userDropdown.style.display = 'none');

if (localStorage.getItem('fontLarge') === 'true') document.body.classList.add('font-large');
toggleFontBtn.addEventListener('click', () => {
  const isLarge = document.body.classList.toggle('font-large');
  localStorage.setItem('fontLarge', isLarge);
});

// === TROCAR ENTRE GRID E MAPA ===
mapsBox.addEventListener('click', () => {
  const isMapVisible = mapContainer.style.display === 'block';
  mapContainer.style.display = isMapVisible ? 'none' : 'block';
  obrasGrid.style.display = isMapVisible ? 'grid' : 'none';

  updateView(obrasData);

  if (!isMapVisible && mapInstance) {
    setTimeout(() => mapInstance.invalidateSize(), 200);
  }
});



