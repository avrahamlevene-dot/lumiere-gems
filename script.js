'use strict';

const WORKER_URL = 'https://nivoda-proxy.avrahamlevene.workers.dev';

/* ── Colour palettes by gem type ───────────────────────────── */
const GEM_PALETTES = {
  diamond:    ['#c8dff0','#e8f4fc','#a0c8e8','#d4eaf8','#88b8d8'],
  ruby:       ['#b01020','#e02840','#901828','#c83040','#781020'],
  emerald:    ['#156030','#28a050','#107028','#20883e','#0a4820'],
  sapphire:   ['#102870','#2040b0','#0c2060','#1838a0','#081848'],
  alexandrite:['#206040','#40a070','#184830','#308060','#104028'],
  tanzanite:  ['#301880','#5030b8','#201060','#4020a8','#180848'],
  emerald_cut:['#156030','#28a050','#107028','#20883e','#0a4820'],
  default:    ['#806040','#c0a060','#604020','#a08050','#402010'],
};

function paletteForGem(item) {
  const cert  = item.diamond?.certificate || item.certificate || {};
  const color = (cert.f_color || cert.color || '').toLowerCase();
  if (color === 'fancy red' || color.includes('red'))    return GEM_PALETTES.ruby;
  if (color.includes('green'))                           return GEM_PALETTES.emerald;
  if (color.includes('blue'))                            return GEM_PALETTES.sapphire;
  if (color.includes('violet') || color.includes('purple')) return GEM_PALETTES.tanzanite;
  if (color.includes('yellow') || color.includes('orange')) return ['#c8a010','#f0d840','#a88008','#d8b820','#806000'];
  if (color.includes('pink'))  return ['#c06080','#e090a8','#a04060','#d07090','#803050'];
  return GEM_PALETTES.diamond;
}

function formatPrice(price) {
  if (!price) return 'POA';
  return '$' + Number(price).toLocaleString();
}

function certLabel(item) {
  return (item.diamond?.certificate?.lab || item.certificate?.lab || 'Certified').toUpperCase();
}

function gemName(item) {
  const cert = item.diamond?.certificate || item.certificate || {};
  const carat = cert.carats || cert.carat || '';
  const shape = cert.shape || '';
  const color = cert.f_color || cert.color || '';
  return `${carat}ct ${color} ${shape} Diamond`.replace(/\s+/g, ' ').trim();
}

/* ── State ──────────────────────────────────────────────────── */
let allGems   = [];
let activeFilter = 'all';
let isLoading = false;

/* ── CSS gem visuals ────────────────────────────────────────── */
function shimmerFacets(grid, colors) {
  setInterval(() => {
    const facets = grid.querySelectorAll('.facet');
    const idx = Math.floor(Math.random() * facets.length);
    facets[idx].style.background = colors[Math.floor(Math.random() * colors.length)];
    facets[idx].style.opacity = 0.1 + Math.random() * 0.7;
  }, 180);
}

function buildFacetGem(container, colors) {
  container.style.background = colors[0];
  const grid = document.createElement('div');
  grid.className = 'facet-grid';
  for (let i = 0; i < 36; i++) {
    const f = document.createElement('div');
    f.className = 'facet';
    f.style.background = colors[Math.floor(Math.random() * colors.length)];
    f.style.opacity = 0.1 + Math.random() * 0.6;
    grid.appendChild(f);
  }
  container.appendChild(grid);
  shimmerFacets(grid, colors);
}

function buildCardGem(container, palette) {
  container.style.background = `linear-gradient(135deg, ${palette.join(',')})`;
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  const grid = document.createElement('div');
  grid.className = 'facet-grid';
  grid.style.opacity = '0.4';
  for (let i = 0; i < 36; i++) {
    const f = document.createElement('div');
    f.className = 'facet';
    f.style.background = palette[Math.floor(Math.random() * palette.length)];
    f.style.opacity = 0.2 + Math.random() * 0.6;
    grid.appendChild(f);
  }
  container.appendChild(grid);
  const shape = document.createElement('div');
  shape.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;';
  const diamond = document.createElement('div');
  diamond.style.cssText = `
    width:60%;padding-top:60%;background:rgba(255,255,255,0.12);
    transform:rotate(45deg);border:1px solid rgba(255,255,255,0.25);
    box-shadow:inset 0 0 40px rgba(255,255,255,0.08),0 0 30px rgba(255,255,255,0.05);
  `;
  shape.appendChild(diamond);
  container.appendChild(shape);
  shimmerFacets(grid, palette);
}

/* ── Fetch from Worker ──────────────────────────────────────── */
async function fetchNivoda(type = 'diamonds', page = 0) {
  const res = await fetch(`${WORKER_URL}?type=${type}&page=${page}`);
  if (!res.ok) throw new Error(`Worker error ${res.status}`);
  return res.json();
}

/* ── Loading state ──────────────────────────────────────────── */
function showLoading() {
  const grid = document.getElementById('gem-grid');
  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--text);">
      <div style="font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);">
        Loading inventory…
      </div>
    </div>`;
}

function showError(msg) {
  const grid = document.getElementById('gem-grid');
  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:4rem 0;">
      <div style="color:var(--text);font-size:0.85rem;">${msg}</div>
    </div>`;
}

/* ── Render grid ────────────────────────────────────────────── */
function renderGems(filter = 'all') {
  activeFilter = filter;
  const grid = document.getElementById('gem-grid');
  grid.innerHTML = '';
  const visible = filter === 'all' ? allGems : allGems.filter(g => g._type === filter);

  if (!visible.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 0;color:var(--text);">No stones found in this category.</div>';
    return;
  }

  visible.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'gem-card';
    card.style.animationDelay = `${i * 0.05}s`;

    const diam     = item.diamond || {};
    const hasMedia = diam.image || diam.video;
    const palette  = paletteForGem(item);
    const price    = formatPrice(item.price);
    const name     = gemName(item);
    const cert     = certLabel(item);
    const carat    = (diam.certificate?.carats || '—') + ' ct';
    const origin   = diam.certificate?.shape || '—';

    card.innerHTML = `
      <div class="gem-card-img">
        ${hasMedia
          ? `<img src="${diam.image || ''}" alt="${name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
             <div class="gem-card-gem" id="card-gem-${item.id}" style="display:none;width:100%;height:100%;"></div>`
          : `<div class="gem-card-gem" id="card-gem-${item.id}" style="width:100%;height:100%;"></div>`
        }
        <span class="gem-card-badge">${cert}</span>
        ${diam.video ? `<a href="${diam.video}" target="_blank" class="gem-video-btn" title="Watch 360° video">▶ 360°</a>` : ''}
      </div>
      <div class="gem-card-body">
        <h3>${name}</h3>
        <div class="gem-card-meta">
          <span>${carat}</span>
          <span>${origin}</span>
        </div>
        <div class="gem-card-footer">
          <span class="gem-price">${price}</span>
          <span class="gem-enquire">View Details →</span>
        </div>
      </div>
    `;
    grid.appendChild(card);

    if (!hasMedia || card.querySelector('img')) {
      const gemEl = document.getElementById(`card-gem-${item.id}`);
      if (gemEl) buildCardGem(gemEl, palette);
    }

    card.addEventListener('click', () => openLightbox(item));
  });
}

/* ── Lightbox ───────────────────────────────────────────────── */
function openLightbox(item) {
  const lb    = document.getElementById('lightbox');
  const bd    = document.getElementById('lightbox-backdrop');
  const gemEl = document.getElementById('lightbox-gem');
  const diam  = item.diamond || {};
  const cert  = diam.certificate || {};
  const name  = gemName(item);

  document.getElementById('lb-tag').textContent =
    (cert.lab || 'Certified').toUpperCase() + ' · Diamond';
  document.getElementById('lb-name').textContent = name;
  document.getElementById('lb-desc').textContent =
    cert.eyeclean ? 'Eye clean stone.' : '';

  const specs = [
    { label: 'Carat',       val: (cert.carats || '—') + ' ct' },
    { label: 'Shape',       val: cert.shape   || '—' },
    { label: 'Colour',      val: cert.f_color || cert.color || '—' },
    { label: 'Clarity',     val: cert.clarity  || '—' },
    { label: 'Cut',         val: cert.cut      || '—' },
    { label: 'Polish',      val: cert.polish   || '—' },
    { label: 'Symmetry',    val: cert.symmetry || '—' },
    { label: 'Fluorescence',val: cert.floInt   || '—' },
    { label: 'Certificate', val: cert.lab && cert.certNumber ? `${cert.lab} ${cert.certNumber}` : cert.lab || '—' },
    { label: 'Price',       val: formatPrice(item.price) },
  ];

  document.getElementById('lb-specs').innerHTML = specs.map(s => `
    <div class="lightbox-spec">
      <span class="spec-label">${s.label}</span>
      <span class="spec-val">${s.val}</span>
    </div>
  `).join('');

  gemEl.innerHTML = '';
  if (diam.image) {
    gemEl.style.background = '#111';
    gemEl.innerHTML = `<img src="${diam.image}" alt="${name}" style="width:100%;height:100%;object-fit:cover;">`;
  } else {
    buildCardGem(gemEl, paletteForGem(item));
  }

  const certLink = document.getElementById('lb-cert-link');
  if (certLink) certLink.style.display = cert.pdfUrl ? 'inline-block' : 'none';

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

/* ── Load all inventory ─────────────────────────────────────── */
async function loadInventory() {
  if (isLoading) return;
  isLoading = true;
  showLoading();

  try {
    const diamondRes = await fetchNivoda('diamonds', 0);

    const diamonds = (diamondRes?.data?.as?.diamonds_by_query?.items || []).map(d => ({ ...d, _type: 'diamond' }));
    allGems = diamonds;

    if (!allGems.length) {
      showError('No inventory available at this time. Please check back soon.');
      return;
    }

    renderGems(activeFilter);
  } catch (err) {
    console.error('Nivoda fetch error:', err);
    showError('Unable to load live inventory. Please try again shortly.');
  } finally {
    isLoading = false;
  }
}

/* ── Category gem visuals ───────────────────────────────────── */
function initCategoryGems() {
  const cats = ['diamond','ruby','emerald','sapphire','alexandrite','tanzanite'];
  cats.forEach((key, i) => {
    const el = document.getElementById(`cat-gem-${i}`);
    if (!el) return;
    const palette = GEM_PALETTES[key];
    el.style.background = `radial-gradient(circle at 40% 35%, ${palette[1]}, ${palette[0]} 60%, ${palette[2]})`;
    buildFacetGem(el, palette);
  });
}

function initAboutGem() {
  const el = document.getElementById('about-facets');
  if (!el) return;
  const palette = GEM_PALETTES.diamond;
  const parent = el.closest('.gem-visual');
  if (parent) parent.style.background = `radial-gradient(circle at 40% 35%, ${palette[1]}, ${palette[0]} 60%, ${palette[2]})`;
  for (let i = 0; i < 36; i++) {
    const f = document.createElement('div');
    f.className = 'facet';
    f.style.background = palette[Math.floor(Math.random() * palette.length)];
    f.style.opacity = 0.1 + Math.random() * 0.6;
    el.appendChild(f);
  }
  shimmerFacets(el, palette);
}

/* ── Sticky header ──────────────────────────────────────────── */
function initHeader() {
  const header = document.getElementById('site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile nav ─────────────────────────────────────────────── */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('mobile-nav');
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ── Filters ────────────────────────────────────────────────── */
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
  initFilters();
  initScrollObserver();
  initContactForm();
  loadInventory();

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-backdrop').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
});
