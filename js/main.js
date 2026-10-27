(() => {
  const D = window.DATA; if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const img = (src, alt = '', lazy = true, w, h) => { const i = new Image(); if (lazy) i.loading = 'lazy'; i.decoding = 'async'; i.alt = alt; if (w && h) { i.width = w; i.height = h; } i.src = src; return i; };
  const pressable = (node, fn, label, cursor = 'смотреть') => {
    node.tabIndex = 0; node.setAttribute('role', 'button'); if (label) node.setAttribute('aria-label', label); node.dataset.cursor = cursor;
    node.addEventListener('click', fn);
    node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  };
  const appBy = slug => D.apps.find(a => a.slug === slug);
  const ratio = m => m.w / m.h;

  /* ---------- тема и порядок разделов ---------- */
  const setTheme = t => { root.dataset.theme = t; store.set('el-theme', t); };
  const curTheme = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  $('#themeBtn').addEventListener('click', () => setTheme(curTheme() === 'dark' ? 'light' : 'dark'));

  const LABEL = { cases: 'кейсы', montage: 'монтаж', avatars: 'аватарки', banners: 'баннеры', turnkey: 'под ключ', concepts: 'концепты', sites: 'сайты', apps: 'mini app', bots: 'боты' };
  const ORDER = {
    design: ['avatars', 'banners', 'turnkey', 'cases', 'concepts', 'sites', 'apps', 'bots'],
    dev: ['sites', 'apps', 'bots', 'cases', 'concepts', 'turnkey', 'avatars', 'banners'],
    montage: ['montage', 'avatars', 'banners', 'turnkey', 'cases', 'concepts', 'sites', 'apps', 'bots'],
  };
  ORDER.all = ORDER.design;
  function applyTopic(topic) {
    const order = ORDER[topic] || ORDER.all, box = $('#sections');
    $('#montage').hidden = topic !== 'montage';
    order.forEach(k => box.append($(`#${k}`)));
    const links = [...order, 'learn'].map(k => [k, k === 'learn' ? 'обучение' : LABEL[k]]);
    $('#nav').innerHTML = links.filter(([k]) => k !== 'montage').slice(0, 7).map(([k, t]) => `<a href="#${k}">${t}</a>`).join('');
    $('#jump').innerHTML = links.map(([k, t]) => `<a href="#${k}">${t}</a>`).join('');
  }
  applyTopic(store.get('el-topic') || 'all');

  const intro = $('#intro');
  if (!store.get('el-topic')) {
    const pick = { theme: curTheme(), topic: 'all' };
    const mark = (box, v) => $$('button', box).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    mark($('#optTheme'), pick.theme);
    $('#optTheme').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; pick.theme = b.dataset.v; setTheme(pick.theme); mark($('#optTheme'), pick.theme); });
    $('#optTopic').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; pick.topic = b.dataset.v; mark($('#optTopic'), pick.topic); });
    $('#introGo').addEventListener('click', () => {
      setTheme(pick.theme); store.set('el-topic', pick.topic); applyTopic(pick.topic);
      intro.hidden = true; document.body.classList.remove('locked');
      if (pick.topic !== 'all') setTimeout(() => $(`#${(ORDER[pick.topic])[0]}`).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 60);
    });
    intro.hidden = false; document.body.classList.add('locked'); $('#introGo').focus();
  }

  /* ---------- первый экран: колонки разных работ летят вверх и вниз ---------- */
  const hw = $('#heroWall');
  const goTo = id => { const s = $('#' + id); if (!s) return; s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); const h = $('.h2', s); if (h) { h.classList.remove('flash'); void h.offsetWidth; h.classList.add('flash'); } };
  const wide = D.ban.filter(b => ratio(b) > 1.3);
  const mix = [];
  for (let i = 0; i < 12; i++) {
    mix.push({ src: D.ava[(i * 4) % D.ava.length], ar: 1, cls: 'av', tag: 'аватарка', to: 'avatars' });
    { const b = wide[(i * 3) % wide.length]; mix.push({ src: b.src, ar: ratio(b), cls: '', tag: 'баннер', to: 'banners' }); }
    if (i % 2 === 0) mix.push({ src: D.apps[(i / 2) % D.apps.length].screens[0], ar: 390 / 844, cls: 'ph', tag: 'mini app', to: 'apps' });
    if (i % 3 === 0) mix.push({ src: D.cases[(i / 3) % D.cases.length].cover, ar: 1.6, cls: '', tag: 'концепт', to: 'concepts' });
    if (i % 3 === 1) { const p = D.proj[i % D.proj.length]; const m = p.imgs.find(x => ratio(x) > 1.3) || p.imgs[0]; mix.push({ src: m.src, ar: ratio(m), cls: '', tag: 'под ключ', to: 'turnkey' }); }
  }
  [0, 1, 2].forEach(c => {
    const colEl = el('div', 'hw-col' + (c === 1 ? ' rev' : '')); colEl.style.setProperty('--d', `${70 + c * 12}s`);
    const items = mix.filter((_, i) => i % 3 === c);
    [...items, ...items].forEach((it, k) => {
      const d = el('div', `hw-it shine ${it.cls}`); d.style.aspectRatio = it.ar; d.append(img(it.src, k < items.length ? it.tag : '', false), el('span', 'hw-tag', `${it.tag} →`));
      if (k >= items.length) d.setAttribute('aria-hidden', 'true');
      d.addEventListener('click', () => goTo(it.to)); colEl.append(d);
    });
    hw.append(colEl);
  });

  /* ---------- аватарки: колонки летят вверх и вниз ---------- */
  $('#avaCount').textContent = D.ava.length;
  const wall = $('#avaWall');
  const colsFor = () => matchMedia('(max-width:760px)').matches ? 4 : matchMedia('(max-width:1100px)').matches ? 7 : 10;
  let wallCols = 0;
  function buildWall() {
    const n = colsFor(); if (n === wallCols) return; wallCols = n; wall.innerHTML = '';
    for (let c = 0; c < n; c++) {
      const colEl = el('div', 'ava-col' + (c % 2 ? ' rev' : '')); colEl.style.setProperty('--d', `${44 + (c % 3) * 9}s`);
      const items = D.ava.filter((_, i) => i % n === c);
      [...items, ...items].forEach((s, k) => {
        const a = el('div', 'ava shine'); a.append(img(s, k < items.length ? 'Аватарка' : ''));
        if (k >= items.length) a.setAttribute('aria-hidden', 'true');
        a.dataset.cursor = 'смотреть'; a.addEventListener('click', () => openLightbox(D.ava, D.ava.indexOf(s), 'Аватарки'));
        colEl.append(a);
      });
      wall.append(colEl);
    }
  }
  buildWall(); addEventListener('resize', buildWall);
  const ag = $('#avaGrid');
  D.ava.forEach((s, i) => { const a = el('div', 'ava shine'); a.style.setProperty('--i', i); a.append(img(s, 'Аватарка')); pressable(a, () => openLightbox(D.ava, i, 'Аватарки'), 'Открыть аватарку'); ag.append(a); });

  /* ---------- баннеры ---------- */
  const banSrc = D.ban.map(b => b.src);
  $('#banCount').textContent = D.ban.length;
  const row = $('#banRow');
  [...D.ban, ...D.ban].forEach((b, k) => {
    const d = el('div', 'ban shine'); d.append(img(b.src, k < D.ban.length ? 'Баннер' : '', true, b.w, b.h));
    if (k >= D.ban.length) d.setAttribute('aria-hidden', 'true');
    d.dataset.cursor = 'смотреть'; d.addEventListener('click', () => openLightbox(banSrc, k % D.ban.length, 'Баннеры')); row.append(d);
  });
  const ba = $('#banAll');
  D.ban.forEach((b, i) => { const d = el('div', 'bn shine'); d.style.setProperty('--i', i); d.append(img(b.src, 'Баннер', true, b.w, b.h)); pressable(d, () => openLightbox(banSrc, i, 'Баннеры'), 'Открыть баннер'); ba.append(d); });

  // раскрыть / свернуть: кнопка сверху у раскрытого блока и снизу под ним
  $$('[data-open]').forEach(btn => btn.addEventListener('click', () => {
    const box = $('#' + btn.dataset.open);
    box.hidden = !box.hidden; btn.closest('.more').hidden = !box.hidden;
  }));
  $$('[data-close]').forEach(btn => btn.addEventListener('click', () => {
    const box = $('#' + btn.dataset.close); box.hidden = true;
    const opener = $(`[data-open="${box.id}"]`); opener.closest('.more').hidden = false;
    box.closest('section').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));
  $$('[data-toggle]').forEach(btn => {
    const box = $('#' + btn.dataset.toggle); box.classList.add('clip'); const label = btn.textContent;
    btn.addEventListener('click', () => {
      const open = box.classList.toggle('clip') === false;
      btn.textContent = open ? 'Свернуть' : label;
      if (open) [...box.children].forEach((n, i) => { if (i >= (box.id === 'tkGrid' ? 6 : 5)) { n.classList.remove('late'); void n.offsetWidth; n.classList.add('late'); n.style.animationDelay = `${(i % 6) * 50}ms`; } });
      else box.closest('section').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- оформление под ключ: работы в родном формате, веер раздвигается ---------- */
  const tk = $('#tkGrid');
  D.proj.forEach(p => {
    const wide = p.imgs.filter(m => ratio(m) > 1.25), sq = p.imgs.filter(m => ratio(m) <= 1.25);
    const pick = (wide.length >= 2 ? wide : [...wide, ...sq]).slice(0, 3).reverse();
    const card = el('article', 'tk rv'), fan = el('div', 'tk-fan');
    pick.forEach(m => { const f = el('div', 'f ' + (ratio(m) > 1.25 ? 'w' : 's')); f.append(img(m.src, '', true, m.w, m.h)); fan.append(f); });
    fan.append(el('span', 'tk-badge', `${p.imgs.length} макетов`));
    card.append(fan, el('h3', 'h3', p.title), el('p', '', p.desc));
    pressable(card, () => openSet(p), `${p.title}, ${p.imgs.length} макетов`, 'открыть набор'); tk.append(card);
  });

  /* ---------- концепты ---------- */
  const cs = $('#csGrid');
  D.cases.forEach(c => {
    const card = el('article', 'cs rv'), pic = el('div', 'cs-img shine'); pic.append(img(c.cover, c.title));
    card.append(pic, el('h3', 'h3', c.title), el('p', '', c.type));
    pressable(card, () => openCase(c), `Открыть кейс ${c.title}`, 'открыть'); cs.append(card);
  });

  /* ---------- сайты ---------- */
  const st = $('#stGrid');
  D.cases.filter(c => c.long).forEach(c => {
    const card = el('article', 'st'), fr = el('div', 'st-frame grow'), im = img(c.long, c.title);
    fr.append(im);
    const fit = () => fr.style.setProperty('--to', -(im.offsetHeight - fr.clientHeight) + 'px');
    im.complete ? fit() : im.addEventListener('load', fit); addEventListener('resize', fit);
    card.append(fr, el('div', 'st-cap', `<div><h3 class="h3">${c.title}</h3><p>${c.type}</p></div><span>открыть сайт →</span>`));
    pressable(card, () => openCase(c), `Открыть сайт ${c.title}`, 'открыть'); st.append(card);
  });

  /* ---------- полка телефонов ---------- */
  const shelf = $('#shelf');
  const appCard = (a, clone) => {
    const card = el('button', 'app'), ph = el('div', 'phone'), sc = el('div', 'screen');
    sc.append(img(a.screens[0], clone ? '' : a.title)); ph.append(sc, el('span', 'hint', 'листать экраны'));
    card.append(ph, el('h3', 'h3', a.title), el('p', '', a.type));
    if (clone) { card.setAttribute('aria-hidden', 'true'); card.tabIndex = -1; } else card.setAttribute('aria-label', `${a.title}: открыть экраны`);
    card.addEventListener('click', () => openViewer(a)); return card;
  };
  D.apps.forEach(a => shelf.append(appCard(a)));
  D.apps.forEach(a => shelf.append(appCard(a, true)));

  /* ---------- боты ---------- */
  const bl = $('#botList'), cyclers = [];
  D.bots.forEach(b => {
    const a = appBy(b.app) || { title: b.title, screens: b.screens || [] };
    const title = b.title || a.title;
    const card = el('article', 'bot rv'), txt = el('div', 'bot-text');
    txt.innerHTML = `<p class="label">${b.type}</p><h3 class="h2">${title}</h3><p>${b.desc}</p><div class="tags">${b.tags.map(t => `<span>${t}</span>`).join('')}</div>`;
    if (b.menus && b.menus.length) {
      const mw = el('div', 'menus'), list = b.menus.map(m => m.src);
      b.menus.slice(0, 4).forEach((m, i) => { const t = el('div', 'mi shine'); t.append(img(m.src, '')); pressable(t, () => openLightbox(list, i, `${title}, меню бота`), 'Открыть меню бота'); mw.append(t); });
      if (b.menus.length > 4) { const more = el('button', 'mi mi-more', `ещё ${b.menus.length - 4}`); more.addEventListener('click', () => openLightbox(list, 4, `${title}, меню бота`)); mw.append(more); }
      txt.append(mw);
    }
    const stage = el('div', 'bot-stage' + (b.desk ? '' : ' solo'));
    if (b.desk) { const dk = el('div', 'bot-desk shine'); dk.append(img(b.desk, `${title}, версия для компьютера`)); pressable(dk, () => openLightbox([b.desk], 0, title), `${title}, открыть скриншот`); stage.append(dk); }
    const mkPhone = (i, cycle) => {
      const ph = el('button', 'phone'), sc = el('div', 'screen');
      const list = cycle ? a.screens : [a.screens[i]];
      const shots = list.map((s, k) => { const im = img(s, `${title}, экран ${i + k + 1}`); im.style.cssText = 'position:absolute;inset:0 0 auto;transition:opacity .5s'; im.style.opacity = k ? 0 : 1; sc.append(im); return im; });
      ph.append(sc, el('span', 'hint', 'листать экраны')); ph.setAttribute('aria-label', `${title}: открыть экраны`); ph.dataset.cursor = 'листать';
      ph.addEventListener('click', () => openViewer({ title, screens: a.screens }, i));
      stage.append(ph); return { ph, shots };
    };
    let first = null;
    if (b.desk) first = mkPhone(0, true); else a.screens.slice(0, 3).forEach((_, i) => mkPhone(i, false));
    card.append(txt, stage); bl.append(card);
    if (first && first.shots.length > 1) cyclers.push({ node: first.ph, shots: first.shots, i: 0, on: false });
  });
  if (!reduce) {
    const io = new IntersectionObserver(es => es.forEach(en => { const c = cyclers.find(x => x.node === en.target); if (c) c.on = en.isIntersecting; }));
    cyclers.forEach(c => io.observe(c.node));
    setInterval(() => cyclers.forEach(c => { if (!c.on || document.hidden) return; c.shots[c.i].style.opacity = 0; c.i = (c.i + 1) % c.shots.length; c.shots[c.i].style.opacity = 1; }), 2800);
  }

  /* ---------- появление и активный пункт меню ---------- */
  const rio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv,.grow').forEach(n => rio.observe(n));
  const navIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) $$('#nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
  $$('#sections > section, #learn').forEach(s => navIO.observe(s));

  /* ---------- оверлеи ---------- */
  let lastFocus = null;
  const lock = on => { document.body.classList.toggle('locked', on); $('main').inert = on; $('.top').inert = on; };
  const swipe = (node, fn) => { let sx = null; node.addEventListener('pointerdown', e => sx = e.clientX); node.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) fn(dx < 0 ? 1 : -1); }); };

  const lb = $('#lightbox'); let lbList = [], lbI = 0, lbT = '';
  const lbShow = () => { const s = $('#lbStage'); s.innerHTML = ''; s.append(img(lbList[lbI], `${lbT}, ${lbI + 1} из ${lbList.length}`, false)); $('#lbCap').textContent = `${lbT}, ${lbI + 1} из ${lbList.length}`; $('#lbPrev').hidden = $('#lbNext').hidden = lbList.length < 2; };
  const lbStep = d => { lbI = (lbI + d + lbList.length) % lbList.length; lbShow(); };
  function openLightbox(list, i, t) { lastFocus = document.activeElement; lbList = list; lbI = Math.max(0, i); lbT = t; lb.hidden = false; lock(true); lbShow(); $('#lbNext').focus(); }
  const closeLb = () => { lb.hidden = true; lock(false); lastFocus?.focus(); };
  $('#lbClose').onclick = closeLb; $('#lbPrev').onclick = () => lbStep(-1); $('#lbNext').onclick = () => lbStep(1);
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('ov-in') || e.target.id === 'lbStage') closeLb(); }); swipe($('#lbStage'), lbStep);

  const vw = $('#viewer'); let vApp = null, vI = 0;
  const vShow = () => { const s = $('#vScreen'); s.innerHTML = ''; s.scrollTop = 0; s.append(img(vApp.screens[vI], `${vApp.title}, экран ${vI + 1}`, false)); $('#vDots').innerHTML = vApp.screens.map((_, k) => `<i class="${k === vI ? 'on' : ''}"></i>`).join(''); $('#vCap').textContent = `${vApp.title}, ${vI + 1} из ${vApp.screens.length}`; $('#vPrev').hidden = $('#vNext').hidden = vApp.screens.length < 2; };
  const vStep = d => { vI = (vI + d + vApp.screens.length) % vApp.screens.length; vShow(); };
  function openViewer(a, start = 0) { lastFocus = document.activeElement; vApp = a; vI = start; vw.hidden = false; lock(true); vShow(); $('#vNext').focus(); }
  const closeV = () => { vw.hidden = true; lock(false); lastFocus?.focus(); };
  $('#vClose').onclick = closeV; $('#vPrev').onclick = () => vStep(-1); $('#vNext').onclick = () => vStep(1);
  vw.addEventListener('click', e => { if (e.target === vw || e.target.classList.contains('ov-in')) closeV(); }); swipe($('#vScreen'), vStep);

  const cv = $('#caseView'), cb = $('#caseBody');
  function openCase(c) {
    lastFocus = document.activeElement; $('#caseTitle').textContent = c.title; $('#caseType').textContent = c.type; cb.innerHTML = '';
    if (c.board) cb.append(img(c.board, `${c.title}, презентация`));
    if (c.long && c.mlong) { const s = el('div', 'case-split'); s.append(img(c.long, `${c.title}, компьютер`), img(c.mlong, `${c.title}, телефон`)); cb.append(s); }
    else if (c.long) cb.append(img(c.long, c.title));
    if (c.extra) cb.append(img(c.extra, c.title));
    if (c.screens && !c.board) { const g = el('div', 'case-phones'); c.screens.forEach((s, k) => g.append(img(s, `${c.title}, экран ${k + 1}`))); cb.append(g); }
    cv.hidden = false; $('.case-win').scrollTop = 0; lock(true); $('#caseClose').focus();
  }
  function openSet(p) {
    lastFocus = document.activeElement; $('#caseTitle').textContent = p.title; $('#caseType').textContent = `${p.imgs.length} макетов`; cb.innerHTML = '';
    const g = el('div', 'set-grid'), list = p.imgs.map(m => m.src);
    p.imgs.forEach((m, i) => { const d = el('div', 'bn shine'); d.style.setProperty('--i', i); d.append(img(m.src, `${p.title}, макет ${i + 1}`, true, m.w, m.h)); pressable(d, () => openLightbox(list, i, p.title), 'Открыть крупно'); g.append(d); });
    cb.append(el('p', 'muted', p.desc), g);
    cv.hidden = false; $('.case-win').scrollTop = 0; lock(true); $('#caseClose').focus();
  }
  const closeCase = () => { cv.hidden = true; lock(false); lastFocus?.focus(); };
  $('#caseClose').onclick = closeCase;
  cv.addEventListener('click', e => { if (e.target === cv) closeCase(); });

  $$('[data-case]').forEach(n => { const c = D.cases.find(x => x.slug === n.dataset.case); if (c) pressable(n, () => openCase(c), `Открыть ${c.title}`); });
  const cmp = $('#cmp'); if (cmp) $('.cmp-range', cmp).addEventListener('input', e => cmp.style.setProperty('--p', e.target.value + '%'));

  // отзывы: две ленты навстречу друг другу
  const R = D.reviews || [];
  const rcard = (r, clone) => { const d = el('article', 'rcard'); d.innerHTML = `<span class="q">“</span><p>${r.text.replace(/</g, '&lt;')}</p><div class="meta"><span>${r.date.split('-').reverse().join('.')}</span><a href="https://t.me/reviewselement/${r.id}" target="_blank" rel="noopener"${clone ? ' tabindex="-1"' : ''}>в Telegram</a></div>`; if (clone) d.setAttribute('aria-hidden', 'true'); return d; };
  [[$('#revRow1'), R.filter((_, i) => i % 2 === 0)], [$('#revRow2'), R.filter((_, i) => i % 2 === 1)]].forEach(([row, list]) => { if (!row) return; list.forEach(r => row.append(rcard(r))); list.forEach(r => row.append(rcard(r, true))); });

  // еле заметные частицы на фоне
  const dust = $('#dust');
  if (dust && !reduce) {
    const ctx = dust.getContext('2d'); let w, h, ps = [], last = 0;
    const size = () => { const dpr = Math.min(devicePixelRatio, 2); w = innerWidth; h = innerHeight; dust.width = w * dpr; dust.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const N = innerWidth < 760 ? 26 : 48;
    for (let i = 0; i < N; i++) ps.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + .4, vx: (Math.random() - .5) * .12, vy: -(Math.random() * .18 + .04), a: Math.random() * .25 + .08, t: Math.random() * 6 });
    const tick = now => {
      requestAnimationFrame(tick);
      if (document.hidden || now - last < 33) return; last = now;
      const col = getComputedStyle(root).getPropertyValue('--ink').trim() || '#000';
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = col;
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.t += .02; if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; } if (p.x < -4) p.x = w + 4; if (p.x > w + 4) p.x = -4; ctx.globalAlpha = p.a * (.6 + .4 * Math.sin(p.t)); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); });
      ctx.globalAlpha = 1;
    };
    requestAnimationFrame(tick);
  }

  addEventListener('keydown', e => {
    if (!lb.hidden) { if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') lbStep(1); if (e.key === 'ArrowLeft') lbStep(-1); }
    else if (!vw.hidden) { if (e.key === 'Escape') closeV(); if (e.key === 'ArrowRight') vStep(1); if (e.key === 'ArrowLeft') vStep(-1); }
    else if (!cv.hidden && e.key === 'Escape') closeCase();
  });
})();
