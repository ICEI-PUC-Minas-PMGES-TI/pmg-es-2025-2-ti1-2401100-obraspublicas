const detalhesBtn = document.querySelector('.detalhes');
let detalhesBar = false;

if (detalhesBtn) {
  detalhesBtn.addEventListener('click', () => {
    detalhesBar = !detalhesBar;
    detalhesBtn.classList.toggle('active', detalhesBar);
    console.log("Clique no detalhes!");
  });
}

const detalhesSidebar = document.getElementById('detalhesSidebar');
const detalhesContent = document.getElementById('detalhesContent');
const closeDetalhes = document.getElementById('closeDetalhes');
let currentObraDetalhe = null;

async function showDetalhesSidebar(obraOrId) {
  sidebar.classList.remove('open');
  sidebar.classList.add('closed');

  detalhesSidebar.classList.add('open');
  detalhesContent.innerHTML = '<div class="detalhes-card"><p>Carregando...</p></div>';

  let obraDetalhada = null;
  try {
    const possibleId = typeof obraOrId === 'object' ? obraOrId?.id : obraOrId;
    if (possibleId != null) {
      const apiBase = (typeof API !== 'undefined' ? API : 'http://localhost:3000/obras');
      const res = await fetch(`${apiBase}/${possibleId}`);
      if (res.ok) {
        obraDetalhada = await res.json();
      }
    }
  } catch (e) {
    console.error('Erro ao buscar detalhes da obra:', e);
  }

  // Fallback para o objeto recebido caso fetch falhe ou não exista id
  if (!obraDetalhada && typeof obraOrId === 'object') {
    obraDetalhada = obraOrId;
  }

  const obra = obraDetalhada || {};
  currentObraDetalhe = obra;

  detalhesContent.innerHTML = `
    <h2>${obra.titulo || ''}</h2>

    <div class="tabs">
      <button class="tab active" data-tab="resumo">Resumo</button>
      <button class="tab" data-tab="timeline">Linha do tempo</button>
      <button class="tab" data-tab="publicacoes">Publicações</button>
    </div>

    <div class="tab-content active" id="resumo">
      <div class="detalhes-card">
        <img src="${obra.anexos?.find(a => a.tipo === "imagem")?.url || './img/Logo2.png'}" />
        <p><strong>Bairro:</strong> ${obra.endereco?.bairro || '-'}</p>
        <p><strong>Construtora:</strong> ${obra.empresaExecutora || '-'}</p>
        <p><strong>Status:</strong> ${obra.status || '-'}</p>
        <p><strong>Valor Total:</strong> ${formatCurrency(obra.valorContratado || 0)}</p>
        <p>${obra.descricao || ''}</p>
      </div>
    </div>

    <div class="tab-content" id="timeline">
      <div class="detalhes-card">
        <p><strong>Etapas executadas:</strong></p>
        <ul class="timeline-list">
          ${(obra.etapas || []).map(etapa => `<li>${etapa}</li>`).join('') || "<li>Nenhuma etapa registrada</li>"}
        </ul>
      </div>
    </div>

    <div class="tab-content" id="publicacoes">
      <div class="detalhes-card">
        ${(obra.publicacoes || []).map(pub => `
          <div class="pub-card">
            <img src="${pub.img || './img/placeholder.jpg'}"/>
            <p>${pub.texto || ''}</p>
          </div>
        `).join('') || "<p>Nenhuma publicação registrada</p>"}
      </div>
    </div>
  `;

  setupTabs();
}

async function loadTimelineContent() {
  const container = document.getElementById('timeline');
  if (!container) return;
  container.innerHTML = '<div class="detalhes-card"><p>Carregando timeline...</p></div>';
  try {
    const res = await fetch('../guilherme/timeline/timeline.html');
    if (!res.ok) throw new Error('Falha ao carregar timeline');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Seleciona apenas a área de conteúdo principal da timeline (sem header)
    let piece = doc.querySelector('.timeline-content');
    if (!piece) {
      // fallback: pega container principal
      piece = doc.querySelector('.timeline-container') || doc.body;
    }

    // Ajusta caminhos relativos para assets dentro do bloco
    fixRelativeAssets(piece, '../guilherme/timeline/');

    // Isola em Shadow DOM e injeta CSS localmente
    container.innerHTML = '';
    const host = document.createElement('div');
    host.setAttribute('data-shadow-host', 'timeline');
    container.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    const styleHrefs = collectExternalStyleHrefs(doc, '../guilherme/timeline/');
    await injectStylesIntoShadow(shadow, styleHrefs);
    shadow.appendChild(piece.cloneNode(true));
  } catch (e) {
    container.innerHTML = '<div class="detalhes-card"><p>Não foi possível carregar a timeline.</p></div>';
    console.error(e);
  }
}

async function loadPublicacoesContent() {
  const container = document.getElementById('publicacoes');
  if (!container) return;
  container.innerHTML = '<div class="detalhes-card"><p>Carregando publicações...</p></div>';
  try {
    const res = await fetch('../lucas/sprint02/feed.html');
    if (!res.ok) throw new Error('Falha ao carregar publicações');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Seleciona a seção de publicações (sem cabeçalho e sem outros blocos)
    let piece = doc.querySelector('.feedback-section');
    if (!piece) {
      // fallback: tenta o main content
      piece = doc.querySelector('main.content') || doc.body;
    }

    // Ajusta caminhos relativos para assets dentro do bloco
    fixRelativeAssets(piece, '../lucas/sprint02/');

    // Isola em Shadow DOM e injeta CSS localmente
    container.innerHTML = '';
    const host = document.createElement('div');
    host.setAttribute('data-shadow-host', 'publicacoes');
    container.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    const styleHrefs = collectExternalStyleHrefs(doc, '../lucas/sprint02/');
    await injectStylesIntoShadow(shadow, styleHrefs);
    shadow.appendChild(piece.cloneNode(true));
  } catch (e) {
    container.innerHTML = '<div class="detalhes-card"><p>Não foi possível carregar as publicações.</p></div>';
    console.error(e);
  }
}

function fixRelativeAssets(rootEl, basePath) {
  if (!rootEl) return;
  // Corrige src de img/script e href de link/a que começam sem barra
  rootEl.querySelectorAll('[src]').forEach(el => {
    const src = el.getAttribute('src');
    if (src && !/^https?:\/\//i.test(src) && !src.startsWith('/') && !src.startsWith(basePath)) {
      el.setAttribute('src', basePath + src.replace(/^\.\//, ''));
    }
  });
  rootEl.querySelectorAll('[href]').forEach(el => {
    const href = el.getAttribute('href');
    if (href && !/^https?:\/\//i.test(href) && !href.startsWith('/') && !href.startsWith('#') && !href.startsWith(basePath)) {
      el.setAttribute('href', basePath + href.replace(/^\.\//, ''));
    }
  });
  // Remove quaisquer headers internos trazidos por engano
  rootEl.querySelectorAll('header').forEach(h => h.remove());
}

function collectExternalStyleHrefs(sourceDoc, basePath) {
  if (!sourceDoc) return [];
  const links = Array.from(sourceDoc.querySelectorAll('link[rel="stylesheet"][href]'));
  return links.map(link => {
    let href = link.getAttribute('href');
    if (!href) return null;
    if (!/^https?:\/\//i.test(href) && !href.startsWith('/') && !href.startsWith(basePath)) {
      href = basePath + href.replace(/^\.\//, '');
    }
    return href;
  }).filter(Boolean);
}

async function injectStylesIntoShadow(shadowRoot, hrefs) {
  if (!shadowRoot || !hrefs || !hrefs.length) return;
  for (const href of hrefs) {
    try {
      const res = await fetch(href);
      if (!res.ok) continue;
      const cssText = await res.text();
      const styleEl = document.createElement('style');
      styleEl.textContent = cssText;
      shadowRoot.appendChild(styleEl);
    } catch (e) {
      console.error('Falha ao importar CSS em shadow:', href, e);
    }
  }
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");

      if (tab.dataset.tab === 'timeline') {
        loadTimelineContent();
      } else if (tab.dataset.tab === 'publicacoes') {
        loadPublicacoesContent();
      }
    });
  });
}

if (closeDetalhes) {
  closeDetalhes.addEventListener('click', () => {
    detalhesSidebar.classList.remove('open');
  });
}


