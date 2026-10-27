(() => {
  const D = window.DATA; if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const img = (src, alt = '', lazy = true, w, h) => { const i = new Image(); if (lazy) i.loading = 'lazy'; i.decoding = 'async'; i.alt = alt; if (w && h) { i.width = w; i.height = h; } i.src = /^media\/(ava|ban|proj|menus)\//.test(src) ? src + '?wm=1' : src; i.draggable = false; return i; };
  // работы не сохраняются правым кликом и не перетаскиваются
  document.addEventListener('contextmenu', e => { if (e.target.closest('img, .wk, .bn, .ava, .ban, .tk, .hw-it, .mi, .lb-stage')) e.preventDefault(); });
  document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
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
  const toggleTheme = () => setTheme(curTheme() === 'dark' ? 'light' : 'dark');
  $('#themeBtn').addEventListener('click', toggleTheme);
  $('#menuTheme').addEventListener('click', toggleTheme);

  /* ---------- мобильное меню ---------- */
  const top = $('.top'), burger = $('#burger');
  const setMenu = on => {
    top.classList.toggle('open', on); document.body.classList.toggle('locked', on); $('main').inert = on;
    burger.setAttribute('aria-expanded', String(on)); burger.setAttribute('aria-label', on ? 'Закрыть меню' : 'Открыть меню');
  };
  burger.addEventListener('click', () => setMenu(!top.classList.contains('open')));
  top.addEventListener('click', e => { if (e.target.closest('a[href^="#"]') && top.classList.contains('open')) setMenu(false); });
  addEventListener('resize', () => { if (innerWidth >= 1024 && top.classList.contains('open')) setMenu(false); });

  const LABEL = { cases: 'кейсы', montage: 'монтаж', avatars: 'аватарки и баннеры', turnkey: 'под ключ', concepts: 'концепты', sites: 'сайты', apps: 'mini app', bots: 'боты' };
  const COUNT = { cases: $$('#cases .case-card').length, avatars: D.ava.length + D.ban.length, turnkey: D.proj.length, concepts: D.cases.length, sites: D.cases.filter(c => c.long).length, apps: D.apps.length, bots: D.bots.length };
  const ORDER = {
    design: ['avatars', 'turnkey', 'cases', 'concepts', 'sites', 'apps', 'bots'],
    dev: ['sites', 'apps', 'bots', 'cases', 'concepts', 'turnkey', 'avatars'],
    montage: ['montage', 'avatars', 'turnkey', 'cases', 'concepts', 'sites', 'apps', 'bots'],
  };
  ORDER.all = ORDER.design;
  function applyTopic(topic) {
    const order = ORDER[topic] || ORDER.all, box = $('#sections');
    $('#montage').hidden = topic !== 'montage';
    order.forEach(k => box.append($(`#${k}`)));
    const links = [...order, 'learn'].map(k => [k, k === 'learn' ? 'обучение' : LABEL[k]]);
    $('#nav').innerHTML = links.filter(([k]) => k !== 'montage').slice(0, 7).map(([k, t]) => `<a href="#${k}">${t}</a>`).join('');
    $('#jump').innerHTML = links.map(([k, t]) => `<a href="#${k}">${t}</a>`).join('');
    $('#menuNav').innerHTML = [...links, ['contact', 'заявка']].map(([k, t], i) => `<a href="#${k}" style="--i:${i}"><small>${String(i + 1).padStart(2, '0')}</small>${t}${COUNT[k] ? `<em>${COUNT[k]}</em>` : ''}</a>`).join('');
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
    { const b = wide[(i * 3) % wide.length]; mix.push({ src: b.src, ar: ratio(b), cls: '', tag: 'баннер', to: 'avatars' }); }
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

  /* ---------- аватарки и баннеры вперемешку: колонки летят вверх и вниз ---------- */
  const WORKS = (() => {
    const av = D.ava.map(src => ({ src, w: 1, h: 1, kind: 'ava' })), bn = D.ban.map(b => ({ src: b.src, w: b.w, h: b.h, kind: 'ban' }));
    // равномерно перемешиваем: каждая работа встаёт на свою долю длины списка
    return [...av.map((x, i) => [(i + .5) / av.length, x]), ...bn.map((x, i) => [(i + .25) / bn.length, x])].sort((p, q) => p[0] - q[0]).map(p => p[1]);
  })();
  const KIND = { ava: 'Аватарка', ban: 'Баннер' };
  $('#avaCount').textContent = WORKS.length;
  const wall = $('#avaWall');
  // колонка около 170 px: на широком экране колонок больше, а не сами работы крупнее
  const colsFor = () => Math.max(3, Math.min(14, Math.round(wall.clientWidth / 175)));
  const allSrc = WORKS.map(x => x.src);
  const dims = x => x.kind === 'ban' ? [x.w, x.h] : [480, 480];
  let wallCols = 0;
  function buildWall() {
    const n = colsFor(); if (n === wallCols) return; wallCols = n; wall.innerHTML = ''; wall.style.setProperty('--cols', n);
    // раскладываем в самую короткую колонку, чтобы колонки были примерно одной высоты
    const cols = Array.from({ length: n }, () => ({ h: 0, items: [] }));
    WORKS.forEach(x => { const c = cols.reduce((m, c) => c.h < m.h ? c : m); c.items.push(x); c.h += x.h / x.w + .08; });
    cols.forEach((c, ci) => {
      const colEl = el('div', 'ava-col' + (ci % 2 ? ' rev' : ''));
      [...c.items, ...c.items].forEach((x, k) => {
        const d = el('div', `wk shine k-${x.kind}`); d.style.aspectRatio = `${x.w}/${x.h}`;
        d.append(img(x.src, k < c.items.length ? KIND[x.kind] : '', true, ...dims(x)));
        if (k >= c.items.length) d.setAttribute('aria-hidden', 'true');
        d.dataset.cursor = 'смотреть'; d.addEventListener('click', () => openLightbox(allSrc, WORKS.indexOf(x), 'Аватарки и баннеры'));
        colEl.append(d);
      });
      wall.append(colEl);
    });
    // скорость одинаковая для всех колонок, сколько бы в них ни было работ
    $$('.ava-col', wall).forEach(c => c.style.setProperty('--d', `${Math.max(30, c.offsetHeight / 2 / (n === 3 ? 26 : 34)).toFixed(1)}s`));
  }
  buildWall(); addEventListener('resize', buildWall);

  // «показать все работы»: сетка с фильтром
  const ag = $('#avaGrid');
  function fillGrid(kind) {
    const list = WORKS.filter(x => kind === 'all' || x.kind === kind), srcs = list.map(x => x.src);
    const title = kind === 'ava' ? 'Аватарки' : kind === 'ban' ? 'Баннеры' : 'Аватарки и баннеры';
    ag.innerHTML = '';
    list.forEach((x, i) => {
      const d = el('div', `bn shine k-${x.kind}`); d.style.setProperty('--i', i);
      d.append(img(x.src, KIND[x.kind], true, ...dims(x)));
      pressable(d, () => openLightbox(srcs, i, title), `Открыть: ${KIND[x.kind].toLowerCase()}`); ag.append(d);
    });
  }
  const chips = $('#wkFilter');
  chips.innerHTML = [['all', 'Все', WORKS.length], ['ava', 'Аватарки', D.ava.length], ['ban', 'Баннеры', D.ban.length]].map(([k, t, c]) => `<button data-k="${k}" aria-pressed="${k === 'all'}">${t}<small>${c}</small></button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', chips).forEach(x => x.setAttribute('aria-pressed', String(x === b))); fillGrid(b.dataset.k); });
  fillGrid('all');

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
  const navIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) $$('#nav a, #menuNav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
  $$('#sections > section, #reviews, #learn, #contact').forEach(s => navIO.observe(s));

  /* ---------- оверлеи ---------- */
  let lastFocus = null;
  const lock = on => { document.body.classList.toggle('locked', on); $('main').inert = on; $('.top').inert = on; };
  const swipe = (node, fn) => { let sx = null; node.addEventListener('pointerdown', e => sx = e.clientX); node.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) fn(dx < 0 ? 1 : -1); }); };

  const lb = $('#lightbox'); let lbList = [], lbI = 0, lbT = '';
  // работа вписывается в окно целиком и при необходимости увеличивается, чтобы её не приходилось приближать
  const lbFit = im => { if (!im.naturalWidth) return; const k = Math.min(Math.min(1200, innerWidth * .92) / im.naturalWidth, innerHeight * .78 / im.naturalHeight); im.style.width = Math.round(im.naturalWidth * k) + 'px'; };
  addEventListener('resize', () => { const im = $('#lbStage img'); if (im && !lb.hidden) lbFit(im); });
  const lbShow = () => { const s = $('#lbStage'); s.innerHTML = ''; const im = img(lbList[lbI], `${lbT}, ${lbI + 1} из ${lbList.length}`, false); im.complete ? lbFit(im) : im.addEventListener('load', () => lbFit(im)); s.append(im); $('#lbCap').textContent = `${lbT}, ${lbI + 1} из ${lbList.length}`; $('#lbPrev').hidden = $('#lbNext').hidden = lbList.length < 2; };
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
  const revAdd = [];
  const rcard = (r, clone) => { const d = el('article', 'rcard'); d.innerHTML = `<span class="q">“</span><p>${r.text.replace(/</g, '&lt;')}</p><div class="meta"><span>${r.date.split('-').reverse().join('.')}</span><a href="https://t.me/reviewselement/${r.id}" target="_blank" rel="noopener"${clone ? ' tabindex="-1"' : ''}>в Telegram</a></div>`; if (clone) d.setAttribute('aria-hidden', 'true'); return d; };
  [[$('#revRow1'), R.filter((_, i) => i % 2 === 0)], [$('#revRow2'), R.filter((_, i) => i % 2 === 1)]].forEach(([row, list]) => { if (!row) return; list.forEach(r => row.append(rcard(r))); list.forEach(r => row.append(rcard(r, true))); revAdd.push(() => list.forEach(r => row.append(rcard(r, true)))); });

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

  /* ---------- бегущие ленты: едут сами, пальцем листаются, мышкой тянутся ---------- */
  const runners = [];
  function runner(box, speed, addCopy) {
    const track = box.firstElementChild, dir = track.classList.contains('rev') ? -1 : 1, n0 = track.children.length / 2;
    let period = 0, pos = 0, hover = false, hold = false, resumeAt = 0, seen = false;
    // петля бесшовна, только если за одним периодом остаётся хотя бы экран: на широких мониторах достраиваем копии
    const measure = () => {
      const k = track.children; if (n0 < 1) return; period = k[n0].offsetLeft - k[0].offsetLeft;
      for (let g = 0; g < 8 && period && track.scrollWidth - box.clientWidth < period + 24; g++) addCopy();
    };
    const wrap = () => { if (period) { if (pos >= period) pos -= period; else if (pos < 0) pos += period; } box.scrollLeft = pos; };
    measure(); new ResizeObserver(measure).observe(track);
    pos = period / 2; wrap();
    const pause = ms => { resumeAt = performance.now() + ms; };
    // любая прокрутка не от нас (палец, тачпад, колесо) ставит ленту на паузу
    box.addEventListener('scroll', () => { if (Math.abs(box.scrollLeft - pos) > 2) { pos = box.scrollLeft; pause(1600); } }, { passive: true });
    box.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    box.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
    box.addEventListener('touchstart', () => { hold = true; }, { passive: true });
    const release = () => { hold = false; pause(1600); };
    box.addEventListener('touchend', release, { passive: true });
    box.addEventListener('touchcancel', release, { passive: true });
    box.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) hold = true; });
    box.addEventListener('focusout', release);
    let x0 = null, p0 = 0, moved = false, swallow = false;
    box.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button) return; x0 = e.clientX; p0 = pos; moved = false; e.preventDefault(); });
    const endDrag = () => { if (x0 == null) return; x0 = null; box.classList.remove('drag'); if (moved) { swallow = true; setTimeout(() => swallow = false, 0); pause(1200); } };
    addEventListener('pointermove', e => {
      if (x0 == null) return; if (!(e.buttons & 1)) return endDrag(); const d = e.clientX - x0;
      if (!moved && Math.abs(d) > 5) { moved = true; box.classList.add('drag'); }
      if (moved) { pos = p0 - d; wrap(); }
    });
    addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag); addEventListener('blur', endDrag);
    box.addEventListener('click', e => { if (swallow) { e.stopPropagation(); e.preventDefault(); } }, true);
    new IntersectionObserver(([en]) => { seen = en.isIntersecting; }).observe(box);
    runners.push(dt => { if (!seen || hover || hold || x0 != null || performance.now() < resumeAt) return; pos += dir * speed * dt; wrap(); });
  }
  runner($('#shelf').parentElement, fine ? 38 : 30, () => D.apps.forEach(a => shelf.append(appCard(a, true))));
  runner($('#revRow1').parentElement, fine ? 40 : 30, revAdd[0]);
  runner($('#revRow2').parentElement, fine ? 40 : 30, revAdd[1]);
  if (!reduce) { let lt = 0; const loop = t => { const dt = lt ? Math.min((t - lt) / 1000, .05) : 0; lt = t; if (!document.hidden) runners.forEach(f => f(dt)); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

  /* ---------- карусели на телефоне: счётчик и полоска прогресса ---------- */
  $$('.rail').filter(r => !r.closest('.case-card')).forEach(r => {
    const meta = el('div', 'rail-meta', '<span class="n"></span><i class="bar"><b></b></i>'); r.after(meta);
    const upd = () => {
      const kids = [...r.children].filter(k => k.offsetParent !== null); if (kids.length < 2) return;
      const max = r.scrollWidth - r.clientWidth, step = kids[1].offsetLeft - kids[0].offsetLeft || 1;
      const i = r.scrollLeft >= max - 4 ? kids.length : Math.min(kids.length, Math.round(r.scrollLeft / step) + 1);
      $('.n', meta).textContent = `${i} / ${kids.length}`;
      meta.style.setProperty('--w', Math.max(10, r.clientWidth / r.scrollWidth * 100) + '%');
      meta.style.setProperty('--p', max > 0 ? Math.min(1, r.scrollLeft / max) : 0);
    };
    r.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });

  /* ---------- бегущая строка под первым экраном ---------- */
  const MARK = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor"><rect x="14" y="20" width="72" height="13" rx="6.5"/><rect x="14" y="43.5" width="72" height="13" rx="6.5"/><rect x="14" y="67" width="72" height="13" rx="6.5"/></g></svg>';
  $$('.tape-run').forEach(t => { const g = t.dataset.tape.split('|').map(w => `<span>${w}<i></i></span>`).join(''); t.innerHTML = g.repeat(4); });

  addEventListener('keydown', e => {
    if (e.key === 'Escape' && top.classList.contains('open')) { setMenu(false); burger.focus(); return; }
    if (!lb.hidden) { if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') lbStep(1); if (e.key === 'ArrowLeft') lbStep(-1); }
    else if (!vw.hidden) { if (e.key === 'Escape') closeV(); if (e.key === 'ArrowRight') vStep(1); if (e.key === 'ArrowLeft') vStep(-1); }
    else if (!cv.hidden && e.key === 'Escape') closeCase();
  });
})();
