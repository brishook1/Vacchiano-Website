// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Mark active nav link
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.site-nav a').forEach(a => {
  const href = a.getAttribute('href').split('/').pop();
  if (href === currentPath) a.classList.add('active');
});

// Lightbox
const overlay = document.getElementById('lightbox');
if (overlay) {
  const img = overlay.querySelector('.lightbox-img');
  const caption = overlay.querySelector('.lightbox-caption');
  const closeBtn = overlay.querySelector('.lightbox-close');
  const prevBtn = overlay.querySelector('.lightbox-prev');
  const nextBtn = overlay.querySelector('.lightbox-next');
  const items = Array.from(document.querySelectorAll('.photo-item'));
  let current = 0;
  let triggerEl = null;

  function openLightbox(index, trigger) {
    current = index;
    triggerEl = trigger || null;
    const item = items[index];
    img.src = item.dataset.full || item.querySelector('img').src;
    img.alt = item.dataset.caption || '';
    caption.textContent = item.dataset.caption || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Move focus to close button so keyboard users are inside the dialog
    closeBtn.focus();
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
    // Return focus to the photo that opened the lightbox
    if (triggerEl) triggerEl.focus();
  }

  function showNext() { openLightbox((current + 1) % items.length); }
  function showPrev() { openLightbox((current - 1 + items.length) % items.length); }

  items.forEach((item, i) => {
    // Mouse click
    item.addEventListener('click', () => openLightbox(i, item));
    // Keyboard: Enter or Space activates the photo
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i, item);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

// ---- Refinements: drop cap, sticky shadow, scroll reveal, count-up stats ----
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Drop cap on the first prose block of the page
  const firstProse = document.querySelector('.page-content .prose');
  if (firstProse) firstProse.classList.add('lead');

  // Sticky header/nav shadow once scrolled
  const setScrolled = () => document.body.classList.toggle('is-scrolled', window.scrollY > 10);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  if (prefersReduced || !('IntersectionObserver' in window)) return;

  // Scroll reveal — top-level content blocks fade up as they enter view
  const revealTargets = document.querySelectorAll('.page-content > .container > *:not(.gold-rule):not(.student-list)');
  const revealIO = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      el.classList.add('reveal-in');       // already in view: show, don't animate
    } else {
      el.classList.add('reveal');
      revealIO.observe(el);
    }
  });

  // Count-up stat numbers
  const animateCount = (el) => {
    const raw = el.dataset.countRaw;
    const match = raw.match(/[\d,]+/);
    if (!match) { el.textContent = raw; return; }
    const target = parseInt(match[0].replace(/,/g, ''), 10);
    const prefix = raw.slice(0, match.index);
    const suffix = raw.slice(match.index + match[0].length);
    const isYear = target > 1800 && suffix === '';
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = prefix + (isYear ? String(val) : val.toLocaleString('en-US')) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    };
    requestAnimationFrame(step);
  };
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums.length) {
    const statIO = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    statNums.forEach(el => {
      el.dataset.countRaw = el.textContent.trim();
      el.textContent = el.textContent.replace(/[\d,]+/, '0');
      statIO.observe(el);
    });
  }
})();

// ---- Lineage constellation ----
(function () {
  const root = document.getElementById('constellation');
  if (!root) return;
  const svg = root.querySelector('.constellation-svg');
  const SVGNS = 'http://www.w3.org/2000/svg';
  const W = 1000, H = 860, cx = 500, cy = 380;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TEACHERS = [
    { name: 'Max Schlossberg', role: 'New York Philharmonic \u00b7 the Russian school' },
    { name: 'Georges Mager', role: 'Boston Symphony \u00b7 Principal' },
    { name: 'Gustav Heim', role: 'Philadelphia Orchestra \u00b7 Boston Symphony \u00b7 Detroit Symphony \u00b7 Cleveland Orchestra \u00b7 New York Philharmonic' },
    { name: 'Louis Kloepfel', role: 'Boston Symphony' },
    { name: 'Frank Knapp', role: "Vacchiano\u2019s first teacher, Maine" },
    { name: 'Walter M. Smith', role: 'Cornet virtuoso \u00b7 pedagogue' }
  ];

  const STUDENTS = [
    { name: 'Wynton Marsalis', role: 'Jazz at Lincoln Center \u00b7 9-time Grammy winner', star: true },
    { name: 'Philip Smith', role: 'New York Philharmonic \u00b7 Principal, 1988\u20132014', star: true },
    { name: 'Gerard Schwarz', role: 'New York Philharmonic, co-principal \u00b7 Seattle Symphony, conductor', star: true },
    { name: 'Mel Broiles', role: 'Metropolitan Opera Orchestra \u00b7 Principal', star: true },
    { name: 'Miles Davis', role: 'Studied at Juilliard \u00b7 jazz legend', star: true },
    { name: 'Joseph Alessi, Sr.', role: 'Teacher \u00b7 father of the NY Phil principal trombone' },
    { name: 'Ronald Romm', role: 'Founding member, Canadian Brass' },
    { name: 'Armando Ghitalla', role: 'Boston Symphony \u00b7 Principal', students: ['Peter Chapman', 'Bill Chase', 'Phil Clark', 'Vincent DiMartino', 'William Lucas', 'John MacMurray', 'Raymond Mase', 'Michael Mergen', 'Timothy Morrison', 'Richard Raffio', 'Roger Sherman', 'Rolf Smedvig', 'Robert Sullivan'] },
    { name: 'Charles Schlueter', role: 'Boston Symphony \u00b7 Principal', students: ['Andrew Balio', 'Darren Barrett', 'David Chapman', 'Russ DeVuyst', 'Rene Hernandez', 'Richard Kelley', 'Benny Nguyen', 'Thomas Rolfs', 'Nailson Simoes', 'Christopher Still', 'Jeff Work'] },
    { name: 'Thomas Stevens', role: 'Los Angeles Philharmonic \u00b7 Principal', students: ['John Aley', 'Charles Butler', 'Edmund Cord', 'Glenn Fischthal', 'H\u00e5kan Hardenberger', 'Charles Lirette', 'Anthony Plog', 'Markus Stockhausen', 'Robert Walp'] },
    { name: 'Stephen Burns', role: 'Soloist \u00b7 Fulcrum Point New Music', students: ['Todd Craven', 'Jon Nelson', 'Mark Niehaus', 'Michael Tiscione', 'Stacey Simpson'] },
    { name: 'Mario Guarneri', role: 'Los Angeles Philharmonic', students: ['Ralph Alessi', 'Ken Larson', 'Jay Lichtmann', 'Roy Poper'] },
    { name: 'Bruce Revesz', role: 'Pedagogue', students: ['Donald Batchelder', 'Tom Booth', 'Jim Byrnes', 'Randy Reinhart', 'Richard Storey', 'Gordon Stump', 'Kenneth Watters'] }
  ];

  const polar = (deg, r) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const el = (name, attrs) => {
    const n = document.createElementNS(SVGNS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  const gField = svg.querySelector('.c-field');
  const gEdges = svg.querySelector('.c-edges');
  const gNodes = svg.querySelector('.c-nodes');
  const gSubEdges = svg.querySelector('.c-subedges');
  const gSubNodes = svg.querySelector('.c-subnodes');

  // Background starfield
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 70; i++) {
    const x = rnd() * W, y = rnd() * H;
    const dToCore = Math.hypot(x - cx, y - cy);
    if (dToCore < 60) continue;
    const r = 0.5 + rnd() * 1.3;
    const s = el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(2) });
    s.setAttribute('opacity', (0.12 + rnd() * 0.25).toFixed(2));
    if (rnd() > 0.5 && !prefersReduced) {
      s.setAttribute('class', 'c-twinkle');
      s.style.animationDelay = (rnd() * 4).toFixed(2) + 's';
    }
    gField.appendChild(s);
  }

  // Positions
  const teacherSpread = 132, teacherR = 252;
  TEACHERS.forEach((t, i) => {
    const a = TEACHERS.length === 1 ? 0 : (-teacherSpread / 2) + (teacherSpread * i / (TEACHERS.length - 1));
    Object.assign(t, polar(a, teacherR), { kind: 'teacher', idx: 'T' + i });
  });
  const stuStart = 98, stuEnd = 264;
  STUDENTS.forEach((s, i) => {
    const a = stuStart + (stuEnd - stuStart) * i / (STUDENTS.length - 1);
    const r = (i % 2 === 0) ? 210 : 345;
    Object.assign(s, polar(a, r), { kind: 'student', idx: 'S' + i, angle: a });
  });

  // Edges
  [...TEACHERS, ...STUDENTS].forEach(p => {
    const line = el('line', { x1: cx, y1: cy, x2: p.x.toFixed(1), y2: p.y.toFixed(1), id: 'edge-' + p.idx });
    if (p.kind === 'teacher') line.setAttribute('class', 'teacher-edge');
    gEdges.appendChild(line);
  });

  // Core node (Vacchiano)
  const core = el('g', { class: 'cnode cnode-core' });
  core.appendChild(el('circle', { class: 'core-twinkle', cx, cy, r: 46, fill: 'url(#coreGlow)' }));
  core.appendChild(el('circle', { cx, cy, r: 6, fill: '#fbe6b4' }));
  const coreLabel = el('text', { class: 'clabel', x: cx, y: cy - 22, 'text-anchor': 'middle' });
  coreLabel.textContent = 'William Vacchiano';
  core.appendChild(coreLabel);
  const coreRole = el('text', { class: 'role', x: cx, y: cy + 30, 'text-anchor': 'middle' });
  coreRole.textContent = 'New York Philharmonic \u00b7 Principal, 1942\u201373';
  core.appendChild(coreRole);
  gNodes.appendChild(core);

  // Build a person node
  function makeNode(p) {
    const g = el('g', { class: 'cnode is-' + (p.kind === 'teacher' ? 'teacher' : (p.star ? 'star' : 'student')), tabindex: '0', role: 'button' });
    g.setAttribute('aria-label', p.name + (p.role ? ', ' + p.role : ''));
    g.appendChild(el('circle', { class: 'glow', cx: p.x, cy: p.y, r: 16, fill: 'url(#starGlow)' }));
    g.appendChild(el('circle', { class: 'hit', cx: p.x, cy: p.y, r: 20, fill: 'transparent' }));
    if (p.students) g.appendChild(el('circle', { class: 'ring', cx: p.x, cy: p.y, r: 9 }));
    g.appendChild(el('circle', { class: 'dot', cx: p.x, cy: p.y, r: p.star ? 4.5 : 3.5 }));

    const dx = p.x - cx, dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len, ny = dy / len;
    const lx = p.x + nx * 16;
    const ly = p.y + ny * 16 + (ny >= 0 ? 13 : -3);
    const anchor = nx > 0.2 ? 'start' : (nx < -0.2 ? 'end' : 'middle');
    const label = el('text', { class: 'clabel', x: lx.toFixed(1), y: ly.toFixed(1), 'text-anchor': anchor });
    label.textContent = p.name;
    g.appendChild(label);

    const activate = () => selectNode(p, g);
    g.addEventListener('click', activate);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    g.addEventListener('mouseenter', () => litEdge(p.idx, true));
    g.addEventListener('mouseleave', () => litEdge(p.idx, false));
    g.addEventListener('focus', () => litEdge(p.idx, true));
    g.addEventListener('blur', () => litEdge(p.idx, false));
    p._g = g;
    return g;
  }
  [...TEACHERS, ...STUDENTS].forEach(p => gNodes.appendChild(makeNode(p)));

  function litEdge(idx, on) {
    const e = document.getElementById('edge-' + idx);
    if (e) e.classList.toggle('lit', on);
    svg.classList.toggle('has-active', on || !!selected);
    if (selected && !on) {
      const se = document.getElementById('edge-' + selected.idx);
      if (se) se.classList.add('lit');
    }
  }

  // Detail panel
  const dDefault = root.querySelector('.cd-default');
  const dSel = root.querySelector('.cd-selected');
  const dRel = root.querySelector('.cd-rel');
  const dName = root.querySelector('.cd-sel-name');
  const dRole = root.querySelector('.cd-sel-role');
  const dStudents = root.querySelector('.cd-students');
  const dStudentsLabel = root.querySelector('.cd-students-label');
  const dChips = root.querySelector('.cd-chips');
  let selected = null;

  function clearSub() {
    gSubEdges.innerHTML = '';
    gSubNodes.innerHTML = '';
    svg.classList.remove('sub-open');
  }

  function buildSub(p) {
    clearSub();
    if (!p.students || !p.students.length) return;
    const n = p.students.length;
    const dx = p.x - cx, dy = p.y - cy, len = Math.hypot(dx, dy) || 1;
    const ox = dx / len, oy = dy / len;       // outward radial unit
    const tx = -oy, ty = ox;                   // tangent unit
    const bulge = 44;
    const spread = Math.min(n * 15, 140);
    const pad = 18;
    p.students.forEach((name, i) => {
      const t = n === 1 ? 0 : (i / (n - 1) - 0.5);
      let sx = p.x + ox * bulge + tx * t * spread;
      let sy = p.y + oy * bulge + ty * t * spread;
      sx = Math.max(pad, Math.min(W - pad, sx));
      sy = Math.max(pad, Math.min(H - 26, sy));
      gSubEdges.appendChild(el('line', { x1: p.x.toFixed(1), y1: p.y.toFixed(1), x2: sx.toFixed(1), y2: sy.toFixed(1) }));
      const g = el('g', { class: 'cnode' });
      const title = el('title', {});
      title.textContent = name;
      g.appendChild(title);
      g.appendChild(el('circle', { class: 'dot', cx: sx.toFixed(1), cy: sy.toFixed(1), r: 3 }));
      gSubNodes.appendChild(g);
    });
    requestAnimationFrame(() => svg.classList.add('sub-open'));
  }

  function selectNode(p, g) {
    if (selected === p) { deselect(); return; }
    selected = p;
    gNodes.querySelectorAll('.cnode').forEach(n => n.classList.remove('selected'));
    g.classList.add('selected');
    svg.classList.add('has-active');
    gEdges.querySelectorAll('line').forEach(l => l.classList.remove('lit'));
    const e = document.getElementById('edge-' + p.idx);
    if (e) e.classList.add('lit');

    dDefault.hidden = true;
    dSel.hidden = false;
    dRel.textContent = p.kind === 'teacher' ? 'Vacchiano\u2019s teacher' : 'Vacchiano\u2019s student';
    dName.textContent = p.name;
    dRole.textContent = p.role || '';
    if (p.students && p.students.length) {
      dStudents.hidden = false;
      dStudentsLabel.textContent = p.name.split(' ')[0] + '\u2019s students';
      dChips.innerHTML = '';
      p.students.forEach(s => { const li = document.createElement('li'); li.textContent = s; dChips.appendChild(li); });
      buildSub(p);
    } else {
      dStudents.hidden = true;
      clearSub();
    }
  }

  function deselect() {
    selected = null;
    gNodes.querySelectorAll('.cnode').forEach(n => n.classList.remove('selected'));
    gEdges.querySelectorAll('line').forEach(l => l.classList.remove('lit'));
    svg.classList.remove('has-active');
    dSel.hidden = true;
    dDefault.hidden = false;
    clearSub();
  }

  core.style.cursor = 'pointer';
  core.addEventListener('click', deselect);
  svg.addEventListener('click', e => { if (e.target === svg) deselect(); });
})();

// ---- Cinematic hero: listen control ----
(function () {
  const btn = document.getElementById('heroListen');
  if (!btn) return;
  const sub = document.getElementById('hlSub');
  const bar = btn.querySelector('.hl-bar');
  const src = btn.dataset.audio;
  const fallback = btn.dataset.fallback;
  const STORE = 'vac-hero-audio-time';
  let audio = null;
  let unavailable = false;
  let lastSave = 0;

  function setSub(t) { if (sub) sub.textContent = t; }

  function goFallback() {
    unavailable = true;
    btn.classList.remove('is-playing');
    setSub('Recording coming soon \u2014 hear him in the interviews \u2192');
    if (fallback) window.location.href = fallback;
  }

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = 'metadata';
    audio.src = src;
    const saved = parseFloat(localStorage.getItem(STORE) || '0');
    if (saved > 0) audio.addEventListener('loadedmetadata', () => {
      if (saved < audio.duration - 1) audio.currentTime = saved;
    }, { once: true });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
      const now = Date.now();
      if (now - lastSave > 1000) { localStorage.setItem(STORE, String(audio.currentTime)); lastSave = now; }
    });
    audio.addEventListener('ended', () => {
      btn.classList.remove('is-playing');
      bar.style.width = '0%';
      localStorage.removeItem(STORE);
    });
    audio.addEventListener('error', goFallback);
    return audio;
  }

  btn.addEventListener('click', () => {
    if (unavailable) { if (fallback) window.location.href = fallback; return; }
    const a = ensureAudio();
    if (a.paused) {
      const p = a.play();
      if (p && p.catch) p.then(() => {
        btn.classList.add('is-playing');
        setSub('Now playing \u2014 New York Philharmonic');
      }).catch(goFallback);
    } else {
      a.pause();
      btn.classList.remove('is-playing');
      setSub('Paused \u2014 tap to resume');
    }
  });
})();
