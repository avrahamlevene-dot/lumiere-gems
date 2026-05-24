'use strict';

/* ── Gem data ──────────────────────────────────────────────── */
const GEMS = [
  {
    id: 1,
    name: 'Eternal Ice Diamond',
    type: 'diamond',
    carat: '3.42 ct',
    origin: 'Botswana',
    cut: 'Round Brilliant',
    clarity: 'IF',
    color: '#d0eaf8',
    colorName: 'D (Colourless)',
    cert: 'GIA',
    price: 'POA',
    badge: 'GIA Certified',
    desc: 'An exceptional D/IF round brilliant exhibiting perfect symmetry and extraordinary optical performance. One of only twelve stones of this calibre sourced this year.',
    gradient: ['#c8dff0','#e8f4fc','#a0c8e8','#d4eaf8','#88b8d8','#bcd6ec'],
  },
  {
    id: 2,
    name: 'Burmese Pigeon-Blood Ruby',
    type: 'ruby',
    carat: '2.18 ct',
    origin: 'Mogok, Myanmar',
    cut: 'Cushion',
    clarity: 'Eye-clean',
    color: '#c0182a',
    colorName: 'Pigeon Blood Red',
    cert: 'Gübelin',
    price: 'POA',
    badge: 'Gübelin Certified',
    desc: 'A classic Mogok ruby with the coveted pigeon-blood designation from Gübelin. Vivid saturation with strong fluorescence under UV light — a benchmark stone.',
    gradient: ['#b01020','#e02840','#901828','#c83040','#781020','#d84058'],
  },
  {
    id: 3,
    name: 'Colombian Muzo Emerald',
    type: 'emerald',
    carat: '4.05 ct',
    origin: 'Muzo, Colombia',
    cut: 'Emerald Cut',
    clarity: 'Minor inclusions',
    color: '#1a7a3a',
    colorName: 'Vivid Green',
    cert: 'AGL',
    price: 'POA',
    badge: 'AGL Certified',
    desc: 'Sourced directly from the legendary Muzo mine, this stone exhibits the characteristic bluish-green hue and strong fluorescence associated with the finest Colombian material.',
    gradient: ['#156030','#28a050','#107028','#20883e','#0a4820','#30b858'],
  },
  {
    id: 4,
    name: 'Kashmir Blue Sapphire',
    type: 'sapphire',
    carat: '5.60 ct',
    origin: 'Kashmir, India',
    cut: 'Oval',
    clarity: 'Eye-clean',
    color: '#1a3898',
    colorName: 'Royal Blue',
    cert: 'Gübelin',
    price: 'POA',
    badge: 'Kashmir Origin',
    desc: 'An extraordinary Kashmir sapphire with the velvety, sleepy quality unique to this origin. Gübelin confirms "Kashmir, no indications of heating" — among the most coveted sapphires in existence.',
    gradient: ['#102870','#2040b0','#0c2060','#1838a0','#081848','#2850c8'],
  },
  {
    id: 5,
    name: 'Russian Alexandrite',
    type: 'other',
    carat: '1.87 ct',
    origin: 'Ural Mountains, Russia',
    cut: 'Oval',
    clarity: 'Eye-clean',
    color: '#2a6040',
    colorName: 'Green / Raspberry',
    cert: 'GIA',
    price: 'POA',
    badge: 'Colour-Change',
    desc: 'A rare Ural alexandrite demonstrating a full green-to-raspberry colour change. GIA identifies the origin as Russian — an increasingly scarce combination that commands collector premiums.',
    gradient: ['#206040','#40a070','#184830','#30806050','#104028','#50b880'],
  },
  {
    id: 6,
    name: 'Tanzanite AAA',
    type: 'other',
    carat: '6.30 ct',
    origin: 'Merelani, Tanzania',
    cut: 'Cushion',
    clarity: 'Loupe-clean',
    color: '#4428a0',
    colorName: 'Vivid Violet-Blue',
    cert: 'GIA',
    price: 'POA',
    badge: 'AAA Grade',
    desc: 'A deeply saturated tanzanite with exceptional violet-blue hue and strong trichroism. At over 6 carats in the finest colour grade, specimens like this are becoming extremely rare.',
    gradient: ['#301880','#5030b8','#201060','#4020a8','#180848','#6040d0'],
  },
  {
    id: 7,
    name: 'Fancy Yellow Diamond',
    type: 'diamond',
    carat: '7.14 ct',
    origin: 'South Africa',
    cut: 'Radiant',
    clarity: 'VS1',
    color: '#e8c830',
    colorName: 'Fancy Intense Yellow',
    cert: 'GIA',
    price: 'POA',
    badge: 'Fancy Colour',
    desc: 'A dazzling radiant-cut fancy intense yellow diamond. The warm, electric saturation is achieved without irradiation — confirmed natural colour by GIA.',
    gradient: ['#c8a010','#f0d840','#a88008','#d8b820','#806000','#e8c830'],
  },
  {
    id: 8,
    name: 'Padparadscha Sapphire',
    type: 'sapphire',
    carat: '2.94 ct',
    origin: 'Sri Lanka',
    cut: 'Oval',
    clarity: 'Eye-clean',
    color: '#e07840',
    colorName: 'Salmon-Pink',
    cert: 'Gübelin',
    price: 'POA',
    badge: 'Padparadscha',
    desc: 'A true padparadscha — the delicate blend of pink and orange that is one of the most contested and prized colour descriptions in gemology. Gübelin confirms the colour call on this exceptional Sri Lankan stone.',
    gradient: ['#c06030','#e89060','#a05020','#d07840','#803818','#f0a878'],
  },
  {
    id: 9,
    name: 'Mozambique Ruby Pair',
    type: 'ruby',
    carat: '1.08 + 1.12 ct',
    origin: 'Montepuez, Mozambique',
    cut: 'Oval (matched pair)',
    clarity: 'Eye-clean',
    color: '#c82030',
    colorName: 'Vivid Red',
    cert: 'AGL',
    price: 'POA',
    badge: 'Matched Pair',
    desc: 'A superbly matched Mozambique ruby pair — identical in colour, tone, and saturation. Ideal for earrings, this calibrated pair represents the pinnacle of Montepuez production.',
    gradient: ['#a81828','#d83040','#881018','#b82838','#680810','#e84858'],
  },
];

/* ── Colour map for CSS gem visuals ────────────────────────── */
const GEM_PALETTES = {
  diamond:    ['#c8dff0','#e8f4fc','#a0c8e8','#d4eaf8','#88b8d8'],
  ruby:       ['#b01020','#e02840','#901828','#c83040','#781020'],
  emerald:    ['#156030','#28a050','#107028','#20883e','#0a4820'],
  sapphire:   ['#102870','#2040b0','#0c2060','#1838a0','#081848'],
  alexandrite:['#206040','#40a070','#184830','#30806050','#104028'],
  tanzanite:  ['#301880','#5030b8','#201060','#4020a8','#180848'],
};

/* ── Build CSS facet gem ────────────────────────────────────── */
function buildFacetGem(container, colors, size = 80) {
  container.style.background = colors[0];
  const grid = container.querySelector('.facet-grid') || document.createElement('div');
  grid.className = 'facet-grid';
  grid.innerHTML = '';
  const count = 36;
  for (let i = 0; i < count; i++) {
    const f = document.createElement('div');
    f.className = 'facet';
    const opacity = 0.1 + Math.random() * 0.6;
    const c = colors[Math.floor(Math.random() * colors.length)];
    f.style.background = c;
    f.style.opacity = opacity;
    grid.appendChild(f);
  }
  if (!container.querySelector('.facet-grid')) container.appendChild(grid);
  shimmerFacets(grid, colors);
}

function shimmerFacets(grid, colors) {
  setInterval(() => {
    const facets = grid.querySelectorAll('.facet');
    const idx = Math.floor(Math.random() * facets.length);
    const c = colors[Math.floor(Math.random() * colors.length)];
    facets[idx].style.background = c;
    facets[idx].style.opacity = 0.1 + Math.random() * 0.7;
  }, 180);
}

/* ── Build a full-size gem visual for cards/lightbox ────────── */
function buildCardGem(container, gem) {
  container.style.background = `linear-gradient(135deg, ${gem.gradient.join(',')})`;
  container.style.position = 'relative';
  container.style.overflow = 'hidden';

  const grid = document.createElement('div');
  grid.className = 'facet-grid';
  grid.style.opacity = '0.4';
  for (let i = 0; i < 36; i++) {
    const f = document.createElement('div');
    f.className = 'facet';
    const c = gem.gradient[Math.floor(Math.random() * gem.gradient.length)];
    f.style.background = c;
    f.style.opacity = 0.2 + Math.random() * 0.6;
    grid.appendChild(f);
  }
  container.appendChild(grid);

  // centre gem shape
  const shape = document.createElement('div');
  shape.style.cssText = `
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  `;
  const diamond = document.createElement('div');
  diamond.style.cssText = `
    width:60%; padding-top:60%; background:rgba(255,255,255,0.12);
    transform:rotate(45deg); border:1px solid rgba(255,255,255,0.25);
    box-shadow: inset 0 0 40px rgba(255,255,255,0.08), 0 0 30px rgba(255,255,255,0.05);
  `;
  shape.appendChild(diamond);
  container.appendChild(shape);

  shimmerFacets(grid, gem.gradient);
}

/* ── Render gem grid ────────────────────────────────────────── */
function renderGems(filter = 'all') {
  const grid = document.getElementById('gem-grid');
  grid.innerHTML = '';
  const visible = filter === 'all' ? GEMS : GEMS.filter(g => g.type === filter);

  visible.forEach((gem, i) => {
    const card = document.createElement('div');
    card.className = 'gem-card';
    card.style.animationDelay = `${i * 0.07}s`;
    card.dataset.id = gem.id;

    card.innerHTML = `
      <div class="gem-card-img">
        <div class="gem-card-gem" id="card-gem-${gem.id}"></div>
        <span class="gem-card-badge">${gem.badge}</span>
      </div>
      <div class="gem-card-body">
        <h3>${gem.name}</h3>
        <div class="gem-card-meta">
          <span>${gem.carat}</span>
          <span>${gem.origin}</span>
        </div>
        <div class="gem-card-footer">
          <span class="gem-price">${gem.price}</span>
          <span class="gem-enquire">View Details →</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
    buildCardGem(document.getElementById(`card-gem-${gem.id}`), gem);
    card.addEventListener('click', () => openLightbox(gem));
  });
}

/* ── Lightbox ───────────────────────────────────────────────── */
function openLightbox(gem) {
  const lb     = document.getElementById('lightbox');
  const bd     = document.getElementById('lightbox-backdrop');
  const gemEl  = document.getElementById('lightbox-gem');

  document.getElementById('lb-tag').textContent = gem.cert + ' Certified · ' + gem.type.charAt(0).toUpperCase() + gem.type.slice(1);
  document.getElementById('lb-name').textContent = gem.name;
  document.getElementById('lb-desc').textContent = gem.desc;

  const specs = [
    { label: 'Carat', val: gem.carat },
    { label: 'Origin', val: gem.origin },
    { label: 'Cut', val: gem.cut },
    { label: 'Clarity', val: gem.clarity },
    { label: 'Colour', val: gem.colorName },
    { label: 'Certificate', val: gem.cert },
  ];
  document.getElementById('lb-specs').innerHTML = specs.map(s => `
    <div class="lightbox-spec">
      <span class="spec-label">${s.label}</span>
      <span class="spec-val">${s.val}</span>
    </div>
  `).join('');

  gemEl.innerHTML = '';
  gemEl.style.height = '100%';
  buildCardGem(gemEl, gem);

  lb.classList.add('active');
  bd.classList.add('active');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.getElementById('lightbox-backdrop').classList.remove('active');
  document.getElementById('lightbox').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ── Category gem visuals ───────────────────────────────────── */
function initCategoryGems() {
  const cats = ['diamond','ruby','emerald','sapphire','alexandrite','tanzanite'];
  cats.forEach((key, i) => {
    const el = document.getElementById(`cat-gem-${i}`);
    if (!el) return;
    const palette = GEM_PALETTES[key] || GEM_PALETTES.diamond;
    el.style.background = `radial-gradient(circle at 40% 35%, ${palette[1]}, ${palette[0]} 60%, ${palette[2]})`;
    buildFacetGem(el, palette);
  });
}

/* ── About gem visual ───────────────────────────────────────── */
function initAboutGem() {
  const el = document.getElementById('about-facets');
  if (!el) return;
  const palette = GEM_PALETTES.diamond;
  const parent  = el.closest('.gem-visual');
  if (parent) parent.style.background = `radial-gradient(circle at 40% 35%, ${palette[1]}, ${palette[0]} 60%, ${palette[2]})`;
  shimmerFacets(el, palette);
  for (let i = 0; i < 36; i++) {
    const f = document.createElement('div');
    f.className = 'facet';
    f.style.background = palette[Math.floor(Math.random() * palette.length)];
    f.style.opacity = 0.1 + Math.random() * 0.6;
    el.appendChild(f);
  }
}

/* ── Sticky header ──────────────────────────────────────────── */
function initHeader() {
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile nav ─────────────────────────────────────────────── */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('mobile-nav');
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ── Filter buttons ─────────────────────────────────────────── */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGems(btn.dataset.filter);
    });
  });
}

/* ── Contact form ───────────────────────────────────────────── */
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    success.classList.add('visible');
    form.reset();
    setTimeout(() => success.classList.remove('visible'), 6000);
  });
}

/* ── Scroll animations ──────────────────────────────────────── */
function initScrollObserver() {
  if (!('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.process-step, .category-card, .about-stats > div');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(t => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(24px)';
    t.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    obs.observe(t);
  });
}

/* ── Boot ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initAboutGem();
  initCategoryGems();
  renderGems();
  initFilters();
  initScrollObserver();
  initContactForm();

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-backdrop').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
});
