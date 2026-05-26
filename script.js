'use strict';

const WORKER_URL = 'https://nivoda-proxy.avrahamlevene.workers.dev';
const WORKER_TIMEOUT_MS = 25000;

/* ── Placeholder catalogue ──────────────────────────────────── */
const PLACEHOLDER_GEMS = [
  { id:'p1', price:0, _type:'diamond', _placeholder:true, diamond:{ image:null, video:null, certificate:{ lab:'GIA', certNumber:'7418523690', shape:'Round Brilliant', carats:'3.42', clarity:'IF', cut:'Excellent', polish:'Excellent', symmetry:'Excellent', color:'D', f_color:'', floInt:'None', pdfUrl:null } } },
  { id:'p2', price:0, _type:'diamond', _placeholder:true, diamond:{ image:null, video:null, certificate:{ lab:'GIA', certNumber:'2467891234', shape:'Oval', carats:'2.18', clarity:'VVS1', cut:'Excellent', polish:'Excellent', symmetry:'Very Good', color:'E', f_color:'', floInt:'Faint', pdfUrl:null } } },
  { id:'p3', price:0, _type:'diamond', _placeholder:true, diamond:{ image:null, video:null, certificate:{ lab:'IGI', certNumber:'591234567', shape:'Emerald', carats:'4.05', clarity:'VS1', cut:'Excellent', polish:'Excellent', symmetry:'Excellent', color:'F', f_color:'', floInt:'None', pdfUrl:null } } },
  { id:'p4', price:0, _type:'diamond', _placeholder:true, diamond:{ image:null, video:null, certificate:{ lab:'GIA', certNumber:'6301982345', shape:'Cushion', carats:'5.60', clarity:'VS2', cut:'Very Good', polish:'Excellent', symmetry:'Very Good', color:'G', f_color:'', floInt:'None', pdfUrl:null } } },
  { id:'p5', price:0, _type:'diamond', _placeholder:true, diamond:{ image:null, video:null, certificate:{ lab:'GIA', certNumber:'2159834560', shape:'Pear', carats:'1.87', clarity:'VVS2', cut:'Excellent', polish:'Excellent', symmetry:'Excellent', color:'D', f_color:'', floInt:'None', pdfUrl:null } } },
  { id:'p6', price:0, _type:'diamond', _placeholder:true, diamond:{ image:null, video:null, certificate:{ lab:'HRD', certNumber:'230456789', shape:'Princess', carats:'2.30', clarity:'SI1', cut:'Very Good', polish:'Very Good', symmetry:'Very Good', color:'H', f_color:'', floInt:'None', pdfUrl:null } } },
  { id:'p7', price:0, _type:'diamond', _placeholder:true, diamond:{ image:null, video:null, certificate:{ lab:'GIA', certNumber:'7814523610', shape:'Radiant', carats:'7.14', clarity:'VS1', cut:'Excellent', polish:'Excellent', symmetry:'Excellent', color:'Fancy Intense Yellow', f_color:'Fancy Intense Yellow', floInt:'None', pdfUrl:null } } },
  { id:'p8', price:0, _type:'diamond', _placeholder:true, diamond:{ image:null, video:null, certificate:{ lab:'GIA', certNumber:'5291047382', shape:'Marquise', carats:'2.94', clarity:'VVS1', cut:'Excellent', polish:'Excellent', symmetry:'Excellent', color:'E', f_color:'', floInt:'None', pdfUrl:null } } },
  { id:'p9', price:0, _type:'diamond', _placeholder:true, diamond:{ image:null, video:null, certificate:{ lab:'GIA', certNumber:'1023847561', shape:'Heart', carats:'3.10', clarity:'VS2', cut:'Very Good', polish:'Excellent', symmetry:'Very Good', color:'F', f_color:'', floInt:'Faint', pdfUrl:null } } },
];

/* ── Gem colour palettes ────────────────────────────────────── */
const PALETTES = {
  default: { from:'#dbeafe', to:'#93c5fd', accent:'#3b82f6' },
  yellow:  { from:'#fef9c3', to:'#fde047', accent:'#ca8a04' },
  pink:    { from:'#fce7f3', to:'#f9a8d4', accent:'#ec4899' },
  blue:    { from:'#dbeafe', to:'#60a5fa', accent:'#2563eb' },
  green:   { from:'#dcfce7', to:'#86efac', accent:'#16a34a' },
  red:     { from:'#fee2e2', to:'#fca5a5', accent:'#dc2626' },
};

function getPalette(cert) {
  const c = (cert.f_color || cert.color || '').toLowerCase();
  if (c.includes('yellow') || c.includes('orange')) return PALETTES.yellow;
  if (c.includes('pink') || c.includes('rose'))     return PALETTES.pink;
  if (c.includes('blue'))                           return PALETTES.blue;
  if (c.includes('green'))                          return PALETTES.green;
  if (c.includes('red'))                            return PALETTES.red;
  return PALETTES.default;
}

function buildGemVisual(container, cert) {
  const p = getPalette(cert);
  container.innerHTML = `
    <div class="gem-bg" style="background:linear-gradient(135deg,${p.from},${p.to})"></div>
    <div class="gem-shape" style="border-color:${p.accent}40;box-shadow:inset 0 0 30px ${p.accent}20,0 0 20px ${p.accent}10;background:${p.accent}15;"></div>
  `;
}

/* ── State ──────────────────────────────────────────────────── */
let allGems      = [];
let filteredGems = [];
let isListView   = false;
let activeEnquiryStone = null;

/* ── Data helpers ───────────────────────────────────────────── */
function getCert(item)  { return item.diamond?.certificate || {}; }
function getDiam(item)  { return item.diamond || {}; }

function stoneName(item) {
  const c = getCert(item);
  const parts = [c.carats ? c.carats + 'ct' : null, c.color || c.f_color || null, c.shape || null, 'Diamond'].filter(Boolean);
  return parts.join(' ');
}

function formatPrice(price, isPlaceholder) {
  if (isPlaceholder || !price) return 'POA';
  return '$' + Number(price).toLocaleString();
}

/* ── Populate filter dropdowns ──────────────────────────────── */
function populateFilters(gems) {
  const fields = { 'f-shape': 'shape', 'f-lab': 'lab', 'f-color': 'color', 'f-clarity': 'clarity', 'f-cut': 'cut' };
  for (const [id, field] of Object.entries(fields)) {
    const sel = document.getElementById(id);
    const current = sel.value;
    const vals = [...new Set(gems.map(g => {
      const c = getCert(g);
      return field === 'color' ? (c.f_color || c.color || '') : c[field] || '';
    }).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">All</option>' + vals.map(v => `<option value="${v}"${v===current?' selected':''}>${v}</option>`).join('');
  }
}

/* ── Filtering ──────────────────────────────────────────────── */
function getFilters() {
  return {
    shape:    document.getElementById('f-shape').value,
    lab:      document.getElementById('f-lab').value,
    color:    document.getElementById('f-color').value,
    clarity:  document.getElementById('f-clarity').value,
    cut:      document.getElementById('f-cut').value,
    caratMin: parseFloat(document.getElementById('f-carat-min').value) || null,
    caratMax: parseFloat(document.getElementById('f-carat-max').value) || null,
  };
}

function applyFilters() {
  const f = getFilters();
  filteredGems = allGems.filter(g => {
    const c = getCert(g);
    const carat = parseFloat(c.carats) || 0;
    const color = c.f_color || c.color || '';
    if (f.shape   && c.shape   !== f.shape)   return false;
    if (f.lab     && c.lab     !== f.lab)     return false;
    if (f.color   && color     !== f.color)   return false;
    if (f.clarity && c.clarity !== f.clarity) return false;
    if (f.cut     && c.cut     !== f.cut)     return false;
    if (f.caratMin !== null && carat < f.caratMin) return false;
    if (f.caratMax !== null && carat > f.caratMax) return false;
    return true;
  });

  document.getElementById('result-info').textContent =
    filteredGems.length === allGems.length
      ? `${allGems.length} stones`
      : `${filteredGems.length} of ${allGems.length} stones`;

  const empty = document.getElementById('empty-state');
  const grid  = document.getElementById('inventory-grid');
  if (!filteredGems.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    renderGrid();
  }
}

function resetFilters() {
  ['f-shape','f-lab','f-color','f-clarity','f-cut'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-carat-min').value = '';
  document.getElementById('f-carat-max').value = '';
  applyFilters();
}

/* ── Render ─────────────────────────────────────────────────── */
function renderGrid() {
  const grid = document.getElementById('inventory-grid');
  grid.innerHTML = '';
  grid.className = 'inventory-grid' + (isListView ? ' list-view' : '');

  filteredGems.forEach((item, i) => {
    const card = isListView ? buildListCard(item, i) : buildGridCard(item, i);
    grid.appendChild(card);
  });
}

function buildGridCard(item, i) {
  const c    = getCert(item);
  const diam = getDiam(item);
  const name = stoneName(item);
  const card = document.createElement('div');
  card.className = 'stone-card';
  card.style.animationDelay = `${Math.min(i, 12) * 0.04}s`;

  card.innerHTML = `
    <div class="card-media">
      ${diam.image
        ? `<img src="${diam.image}" alt="${name}" loading="lazy" onerror="this.parentElement.querySelector('.card-gem-visual').style.display='flex';this.remove();">`
        : ''}
      <div class="card-gem-visual" id="ggv-${item.id}" style="${diam.image ? 'display:none' : ''}"></div>
      <span class="card-lab-badge">${c.lab || '—'}</span>
      ${diam.video ? `<a href="${diam.video}" target="_blank" rel="noopener" class="card-video-btn" onclick="event.stopPropagation()">▶ 360°</a>` : ''}
    </div>
    <div class="card-body">
      <div class="card-title">${name}</div>
      <div class="card-specs">
        <div class="spec-item"><span class="spec-label">Carat</span><span class="spec-value">${c.carats || '—'}</span></div>
        <div class="spec-item"><span class="spec-label">Colour</span><span class="spec-value">${c.f_color || c.color || '—'}</span></div>
        <div class="spec-item"><span class="spec-label">Clarity</span><span class="spec-value">${c.clarity || '—'}</span></div>
        <div class="spec-item"><span class="spec-label">Cut</span><span class="spec-value">${c.cut || '—'}</span></div>
        <div class="spec-item"><span class="spec-label">Polish</span><span class="spec-value">${c.polish || '—'}</span></div>
        <div class="spec-item"><span class="spec-label">Symmetry</span><span class="spec-value">${c.symmetry || '—'}</span></div>
      </div>
      <div class="card-footer">
        <span class="card-cert-ref">${c.lab || ''}${c.certNumber ? ' · ' + c.certNumber : ''}</span>
        <div class="card-actions">
          ${c.pdfUrl ? `<a href="${c.pdfUrl}" target="_blank" rel="noopener" class="btn-cert" title="View certificate" onclick="event.stopPropagation()">📄</a>` : ''}
          <button class="btn-enquire" data-id="${item.id}">Enquire</button>
        </div>
      </div>
    </div>
  `;

  const gemVis = card.querySelector(`#ggv-${item.id}`);
  if (gemVis) buildGemVisual(gemVis, c);

  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-enquire, .btn-cert, .card-video-btn')) return;
    openDetail(item);
  });
  card.querySelector('.btn-enquire').addEventListener('click', (e) => {
    e.stopPropagation();
    openEnquiry(item);
  });

  return card;
}

function buildListCard(item, i) {
  const c    = getCert(item);
  const diam = getDiam(item);
  const name = stoneName(item);
  const card = document.createElement('div');
  card.className = 'stone-card list-card';
  card.style.animationDelay = `${Math.min(i, 20) * 0.02}s`;

  card.innerHTML = `
    <div class="list-card-inner">
      <div class="list-thumb">
        ${diam.image
          ? `<img src="${diam.image}" alt="${name}" loading="lazy" onerror="this.parentElement.querySelector('.card-gem-visual').style.display='flex';this.remove();">`
          : ''}
        <div class="card-gem-visual" id="lgv-${item.id}" style="${diam.image ? 'display:none' : ''}"></div>
      </div>
      <div class="list-info">
        <div class="list-title">${name}</div>
        <div class="list-specs">
          <span class="list-spec"><strong>Carat</strong> ${c.carats || '—'}</span>
          <span class="list-spec"><strong>Colour</strong> ${c.f_color || c.color || '—'}</span>
          <span class="list-spec"><strong>Clarity</strong> ${c.clarity || '—'}</span>
          <span class="list-spec"><strong>Cut</strong> ${c.cut || '—'}</span>
          <span class="list-spec"><strong>Polish</strong> ${c.polish || '—'}</span>
          <span class="list-spec"><strong>Symmetry</strong> ${c.symmetry || '—'}</span>
          <span class="list-spec"><strong>Fluor</strong> ${c.floInt || '—'}</span>
          ${c.certNumber ? `<span class="list-spec"><strong>Cert#</strong> ${c.certNumber}</span>` : ''}
        </div>
      </div>
      <div class="list-actions">
        <span class="list-lab">${c.lab || '—'}</span>
        <div class="card-actions">
          ${c.pdfUrl ? `<a href="${c.pdfUrl}" target="_blank" rel="noopener" class="btn-cert" title="View certificate" onclick="event.stopPropagation()">📄</a>` : ''}
          <button class="btn-enquire" data-id="${item.id}">Enquire</button>
        </div>
      </div>
    </div>
  `;

  const gemVis = card.querySelector(`#lgv-${item.id}`);
  if (gemVis) buildGemVisual(gemVis, c);

  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-enquire, .btn-cert')) return;
    openDetail(item);
  });
  card.querySelector('.btn-enquire').addEventListener('click', (e) => {
    e.stopPropagation();
    openEnquiry(item);
  });

  return card;
}

/* ── Loading skeletons ──────────────────────────────────────── */
function showSkeletons() {
  const grid = document.getElementById('inventory-grid');
  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-media"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-line--med"></div>
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--med"></div>
      </div>
    </div>
  `).join('');
}

/* ── Detail modal ───────────────────────────────────────────── */
function openDetail(item) {
  const c    = getCert(item);
  const diam = getDiam(item);
  const name = stoneName(item);

  document.getElementById('detail-title').textContent = name;

  const media = document.getElementById('detail-media');
  media.innerHTML = '';
  if (diam.image) {
    media.innerHTML = `<img src="${diam.image}" alt="${name}">`;
  } else {
    const vis = document.createElement('div');
    vis.className = 'card-gem-visual';
    buildGemVisual(vis, c);
    media.appendChild(vis);
  }

  const specs = [
    ['Shape',       c.shape    ],
    ['Carats',      c.carats   ],
    ['Colour',      c.f_color || c.color ],
    ['Clarity',     c.clarity  ],
    ['Cut',         c.cut      ],
    ['Polish',      c.polish   ],
    ['Symmetry',    c.symmetry ],
    ['Fluorescence',c.floInt   ],
    ['Lab',         c.lab      ],
    ['Cert No.',    c.certNumber],
  ];

  document.getElementById('detail-specs').innerHTML = specs.map(([label, val]) => `
    <div class="detail-spec">
      <span class="spec-label">${label}</span>
      <span class="spec-value">${val || '—'}</span>
    </div>
  `).join('');

  document.getElementById('detail-actions').innerHTML = `
    <button class="btn-primary" id="detail-enquire-btn">Enquire About This Stone</button>
    ${c.pdfUrl ? `<a href="${c.pdfUrl}" target="_blank" rel="noopener" class="btn-secondary">📄 View Certificate</a>` : ''}
    ${diam.video ? `<a href="${diam.video}" target="_blank" rel="noopener" class="btn-secondary">▶ 360° Video</a>` : ''}
  `;

  document.getElementById('detail-enquire-btn').addEventListener('click', () => {
    closeDetail();
    openEnquiry(item);
  });

  document.getElementById('detail-modal').classList.add('active');
  document.getElementById('modal-backdrop').classList.add('active');
  document.getElementById('detail-modal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('detail-modal').classList.remove('active');
  document.getElementById('modal-backdrop').classList.remove('active');
  document.getElementById('detail-modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ── Enquiry modal ──────────────────────────────────────────── */
function openEnquiry(item) {
  const c    = getCert(item);
  const name = stoneName(item);
  activeEnquiryStone = item;

  document.getElementById('modal-stone-ref').textContent =
    `${name}${c.certNumber ? '  ·  ' + c.lab + ' ' + c.certNumber : ''}`;

  document.getElementById('enquiry-modal').classList.add('active');
  document.getElementById('modal-backdrop').classList.add('active');
  document.getElementById('enquiry-modal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeEnquiry() {
  document.getElementById('enquiry-modal').classList.remove('active');
  document.getElementById('modal-backdrop').classList.remove('active');
  document.getElementById('enquiry-modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeEnquiryStone = null;
}

/* ── Live banner ────────────────────────────────────────────── */
function showLiveBanner() {
  let b = document.getElementById('live-banner');
  if (!b) {
    b = document.createElement('div');
    b.id = 'live-banner';
    b.innerHTML = '⚠ Showing catalogue preview — live inventory loading shortly';
    document.querySelector('.main').prepend(b);
  }
  b.style.display = 'flex';
}
function hideLiveBanner() {
  const b = document.getElementById('live-banner');
  if (b) b.style.display = 'none';
}

/* ── Fetch from Worker ──────────────────────────────────────── */
async function fetchNivoda(page = 0) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WORKER_TIMEOUT_MS);
  try {
    const res = await fetch(`${WORKER_URL}?page=${page}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Worker ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

/* ── Load inventory ─────────────────────────────────────────── */
async function loadInventory() {
  showSkeletons();
  try {
    const res  = await fetchNivoda(0);
    const live = (res?.data?.as?.diamonds_by_query?.items || []).map(d => ({ ...d, _type: 'diamond' }));
    if (live.length) {
      allGems = live;
      hideLiveBanner();
    } else {
      throw new Error('empty');
    }
  } catch {
    allGems = PLACEHOLDER_GEMS;
    showLiveBanner();
  }

  document.getElementById('inventory-count').textContent = `${allGems.length} stones`;
  populateFilters(allGems);
  applyFilters();
}

/* ── Boot ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadInventory();

  // View toggle
  document.getElementById('view-grid').addEventListener('click', () => {
    isListView = false;
    document.getElementById('view-grid').classList.add('active');
    document.getElementById('view-list').classList.remove('active');
    renderGrid();
  });
  document.getElementById('view-list').addEventListener('click', () => {
    isListView = true;
    document.getElementById('view-list').classList.add('active');
    document.getElementById('view-grid').classList.remove('active');
    renderGrid();
  });

  // Filters
  ['f-shape','f-lab','f-color','f-clarity','f-cut'].forEach(id =>
    document.getElementById(id).addEventListener('change', applyFilters)
  );
  ['f-carat-min','f-carat-max'].forEach(id =>
    document.getElementById(id).addEventListener('input', applyFilters)
  );
  document.getElementById('btn-reset').addEventListener('click', resetFilters);
  document.getElementById('btn-reset-2').addEventListener('click', resetFilters);

  // Modals close
  document.getElementById('modal-backdrop').addEventListener('click', () => {
    closeDetail(); closeEnquiry();
  });
  document.getElementById('modal-close').addEventListener('click', closeEnquiry);
  document.getElementById('detail-close').addEventListener('click', closeDetail);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDetail(); closeEnquiry(); }
  });

  // Enquiry form
  document.getElementById('enquiry-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
    document.getElementById('eq-success').classList.add('visible');
    e.target.reset();
    setTimeout(() => {
      document.getElementById('eq-success').classList.remove('visible');
      closeEnquiry();
    }, 3000);
  });
});
