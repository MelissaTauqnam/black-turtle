/* Atelier n8n + Claude Code : recettes, traducteur, défi, passeport, compteur. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 40) : ms));

  /* ------------------------------------------------------------------ stockage local */
  const KEY = 'atelier-n8n-claude-v1';
  let store = { stamps: [], checks: {}, tasks: null, seen: [], won: [] };
  try { const raw = localStorage.getItem(KEY); if (raw) store = Object.assign(store, JSON.parse(raw)); } catch (e) { /* stockage indisponible */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignoré */ } };

  /* ------------------------------------------------------------------ toast + copie */
  let toastTimer;
  function toast(html) {
    const t = $('toast'); t.innerHTML = html; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3600);
  }
  function legacyCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove(); return ok;
  }
  function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
      }
    } catch (e) { /* on tente la méthode de secours */ }
    return Promise.resolve(legacyCopy(text));
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    copyText(b.dataset.copy).then(ok => {
      const old = b.textContent; b.textContent = ok ? 'Copié' : 'Sélectionnez le texte';
      setTimeout(() => { b.textContent = old; }, 1600);
    });
  });

  /* ------------------------------------------------------------------ passeport */
  const ICONS = {
    clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 7v5l3 2',
    book: 'M4 5h7v14H4zM13 5h7v14h-7z',
    clip: 'M8 3h8v3H8zM6 5H5v16h14V5h-1M9 12h6M9 16h4',
    talk: 'M4 5h16v10H10l-5 4v-4H4z',
    loupe: 'M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13M15.5 15.5L20 20',
    puzzle: 'M4 8h4.5a2 2 0 1 1 3 0H16v4.5a2 2 0 1 1 0 3V20H4z',
    star: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4l-5.5 2.9 1-6.2L3 9.7l6.2-.9z',
    plane: 'M3 11l18-7-7 18-2.5-8z',
    lang: 'M5 20L12 4l7 16M8 14h8'
  };
  const STAMPS = [
    { id: 'curieux', n: 'Curieux', d: 'Calculer son temps perdu', i: 'clock' },
    { id: 'explorateur', n: 'Explorateur', d: 'Ouvrir une fiche recette', i: 'book' },
    { id: 'importateur', n: 'Importateur', d: 'Copier un workflow', i: 'clip' },
    { id: 'traducteur', n: 'Traducteur', d: 'Traduire sa propre phrase', i: 'talk' },
    { id: 'mecano', n: 'Mécano', d: 'Inspecter un bloc du workflow', i: 'loupe' },
    { id: 'assembleur', n: 'Assembleur', d: 'Réussir le défi niveau 1', i: 'puzzle' },
    { id: 'expert', n: 'Expert', d: 'Réussir le défi niveau 3', i: 'star' },
    { id: 'testeur', n: 'Testeur', d: 'Envoyer le formulaire de démo', i: 'plane' },
    { id: 'polyglotte', n: 'Polyglotte', d: 'Lire 5 définitions', i: 'lang' }
  ];
  function renderPassport(fresh) {
    const got = new Set(store.stamps);
    $('stamps').innerHTML = STAMPS.map(s =>
      '<div class="stamp' + (got.has(s.id) ? ' got' : '') + (fresh === s.id ? ' fresh' : '') + '">' +
      '<svg viewBox="0 0 86 86" aria-hidden="true"><circle class="ring" cx="43" cy="43" r="40"/><circle class="core" cx="43" cy="43" r="31"/>' +
      '<g transform="translate(31 31)"><path class="ico" d="' + ICONS[s.i] + '"/></g></svg>' +
      '<b>' + esc(s.n) + '</b><small>' + (got.has(s.id) ? 'Obtenu' : esc(s.d)) + '</small></div>').join('');
    const n = got.size;
    $('passCount').textContent = n + '/' + STAMPS.length;
    $('passLabel').textContent = n + ' / ' + STAMPS.length;
    $('passBar').style.width = (n / STAMPS.length * 100) + '%';
    $('diploma').hidden = n < STAMPS.length;
  }
  function award(id) {
    if (store.stamps.includes(id)) return;
    store.stamps.push(id); save(); renderPassport(id);
    const s = STAMPS.find(x => x.id === id);
    toast('Tampon obtenu : <b>' + esc(s.n) + '</b> (' + store.stamps.length + '/' + STAMPS.length + ')');
  }
  renderPassport();
  document.querySelectorAll('#checklist input').forEach(cb => {
    cb.checked = !!store.checks[cb.id];
    cb.addEventListener('change', () => { store.checks[cb.id] = cb.checked; save(); });
  });

  // tampons liés aux sections pédagogiques existantes
  const flow = $('flow');
  if (flow) flow.addEventListener('click', e => { if (e.target.closest('.node')) award('mecano'); });
  const demo = $('demoForm');
  if (demo) demo.addEventListener('submit', () => {
    const c = $('f-company').value.trim(), m = $('f-email').value;
    if (c && /^\S+@\S+\.\S+$/.test(m)) award('testeur');
  });
  const seen = new Set(store.seen);
  function seeTerm(e) {
    const t = e.target.closest && e.target.closest('.t');
    if (!t || t.dataset.t === 'souligne' || seen.has(t.dataset.t)) return;
    seen.add(t.dataset.t); store.seen = [...seen]; save();
    if (seen.size >= 5) award('polyglotte');
  }
  document.addEventListener('mouseover', seeTerm);
  document.addEventListener('focusin', seeTerm);

  /* ------------------------------------------------------------------ recettes : données */
  let CATALOG = [];
  const RAW = {}, WF = {};
  const GLYPHS = [
    [/webhook$/i, '↯', '#EA4B71'], [/formTrigger$/, '≡', '#EA4B71'], [/scheduleTrigger$/, '◷', '#EA4B71'],
    [/chatTrigger$/, '❝', '#EA4B71'], [/gmailTrigger$/, '@', '#EA4B71'], [/respondToWebhook$/, '↩', '#3CCB8C'],
    [/lmChat/, '✳', '#FF9B3D'], [/memory/i, 'M', '#8B6CFF'], [/outputParser/, '{}', '#8B6CFF'],
    [/chainLlm|agent$|textClassifier/, 'IA', '#8B6CFF'], [/\.if$/, '?', '#3CCB8C'], [/\.switch$/, '⑂', '#3CCB8C'],
    [/\.set$/, '✎', '#B7A4FF'], [/\.code$/, '{}', '#B7A4FF'], [/\.limit$/, '5', '#B7A4FF'], [/rssFeedRead/, 'RSS', '#F5B83D'],
    [/googleSheets/, '▦', '#3CCB8C'], [/\.gmail$/, '@', '#FF9EB5'], [/\.slack$/, '#', '#F5B83D']
  ];
  const glyph = type => (GLYPHS.find(g => g[0].test(type)) || [0, '•', '#A99FBD']).slice(1);
  const isTrigger = t => /Trigger$|webhook$/.test(t) && !/respond/i.test(t);
  const isSub = t => /lmChat|memory|outputParser/.test(t);
  const isWide = t => /chainLlm|agent$|textClassifier/.test(t);
  const STICKY = { 4: ['#1C2A22', '#2E5A3F'], 5: ['#1D2433', '#33446A'], d: ['#2A2418', '#5A4C27'] };

  function nodeGeom(n) {
    const [x, y] = n.position;
    if (isSub(n.type)) return { cx: x + 50, cy: y + 50, r: 40, x: x + 10, y: y + 10, w: 80, h: 80, sub: true };
    const w = isWide(n.type) ? 170 : 100;
    return { x, y, w, h: 100, cx: x + w / 2, cy: y + 50 };
  }

  function renderWorkflowSVG(wf, full) {
    const nodes = wf.nodes.filter(n => n.type !== 'n8n-nodes-base.stickyNote');
    const notes = full ? wf.nodes.filter(n => n.type === 'n8n-nodes-base.stickyNote') : [];
    const G = {}; nodes.forEach(n => { G[n.name] = nodeGeom(n); });
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const grow = (a, b, c, d) => { x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d); };
    nodes.forEach(n => { const g = G[n.name]; grow(g.x - (full ? 40 : 0), g.y, g.x + g.w + (full ? 40 : 0), g.y + g.h + (full ? 50 : 0)); });
    notes.forEach(s => grow(s.position[0], s.position[1], s.position[0] + s.parameters.width, s.position[1] + s.parameters.height));
    const pad = full ? 30 : 24;
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    let out = '<svg viewBox="' + [x0, y0, x1 - x0, y1 - y0].map(Math.round).join(' ') + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Aperçu du workflow ' + esc(wf.name) + '">';
    notes.forEach((s, i) => {
      const c = STICKY[s.parameters.color] || STICKY.d;
      const title = ((s.parameters.content.match(/^#+\s*(.+)$/m) || [])[1] || 'Note').replace(/[*`]/g, '');
      out += '<g class="sticky-r" data-note="' + esc(s.name) + '" tabindex="0" role="button" aria-label="Lire la note : ' + esc(title) + '">' +
        '<rect x="' + s.position[0] + '" y="' + s.position[1] + '" width="' + s.parameters.width + '" height="' + s.parameters.height + '" rx="10" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="1.5"/>' +
        '<text x="' + (s.position[0] + 16) + '" y="' + (s.position[1] + 42) + '" fill="#F1E6C8" font-family="Figtree, system-ui, sans-serif" font-size="28" font-weight="700">' + esc(title.length > 30 ? title.slice(0, 29) + '…' : title) + '</text>' +
        '<text x="' + (s.position[0] + 16) + '" y="' + (s.position[1] + 76) + '" fill="#A99FBD" font-family="Figtree, system-ui, sans-serif" font-size="22">Cliquer pour lire</text></g>';
    });
    Object.entries(wf.connections).forEach(([from, kinds]) => {
      const a = G[from]; if (!a) return;
      Object.entries(kinds).forEach(([kind, outs]) => {
        outs.forEach((targets, k) => (targets || []).forEach(t => {
          const b = G[t.node]; if (!b) return;
          if (kind === 'main') {
            const sy = a.cy + (k - (outs.length - 1) / 2) * (outs.length > 2 ? 18 : 26);
            const sx = a.x + a.w, tx = b.x, ty = b.cy, mx = (sx + tx) / 2;
            out += '<path d="M' + sx + ' ' + sy + ' C' + mx + ' ' + sy + ' ' + mx + ' ' + ty + ' ' + tx + ' ' + ty + '" fill="none" stroke="#5A4E73" stroke-width="3"/>';
          } else {
            out += '<path d="M' + a.cx + ' ' + (a.cy - 40) + ' L' + b.cx + ' ' + (b.y + b.h) + '" fill="none" stroke="#5A4E73" stroke-width="2.5" stroke-dasharray="6 7"/>';
          }
        }));
      });
    });
    nodes.forEach(n => {
      const g = G[n.name], [gl, col] = glyph(n.type);
      if (g.sub) {
        out += '<circle cx="' + g.cx + '" cy="' + g.cy + '" r="40" fill="#231A35" stroke="#4A3E63" stroke-width="2"/>';
      } else if (isTrigger(n.type)) {
        out += '<path d="M' + (g.x + 50) + ' ' + g.y + ' H' + (g.x + g.w - 14) + ' a14 14 0 0 1 14 14 V' + (g.y + g.h - 14) + ' a14 14 0 0 1 -14 14 H' + (g.x + 50) + ' a50 50 0 0 1 0 -100 Z" fill="#231A35" stroke="#EA4B71" stroke-width="2"/>';
      } else {
        out += '<rect x="' + g.x + '" y="' + g.y + '" width="' + g.w + '" height="100" rx="14" fill="#231A35" stroke="#4A3E63" stroke-width="2"/>';
      }
      out += '<text x="' + g.cx + '" y="' + (g.cy + (gl.length > 2 ? 7 : 10)) + '" text-anchor="middle" fill="' + col + '" font-family="JetBrains Mono, monospace" font-weight="600" font-size="' + (gl.length > 2 ? 20 : 30) + '">' + esc(gl) + '</text>';
      if (full) {
        const lbl = n.name.length > 16 ? n.name.slice(0, 15) + '…' : n.name;
        out += '<text x="' + g.cx + '" y="' + (g.y + g.h + 34) + '" text-anchor="middle" fill="#D8D0EA" font-family="Figtree, system-ui, sans-serif" font-size="24" font-weight="600">' + esc(lbl) + '</text>';
      }
    });
    return out + '</svg>';
  }

  /* mini moteur Markdown pour les notes n8n */
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  }
  function md(text) {
    const lines = text.split('\n'); let html = '', list = null;
    const close = () => { if (list) { html += '</' + list + '>'; list = null; } };
    lines.forEach(l => {
      let m;
      if (!l.trim()) { close(); return; }
      if ((m = l.match(/^(#{1,3})\s+(.*)/))) { close(); const h = m[1].length <= 2 ? 'h2' : 'h3'; html += '<' + h + '>' + inline(m[2]) + '</' + h + '>'; return; }
      if ((m = l.match(/^>\s?(.*)/))) { close(); html += '<blockquote>' + inline(m[1]) + '</blockquote>'; return; }
      if ((m = l.match(/^\s*[-•]\s+(.*)/))) { if (list !== 'ul') { close(); html += '<ul>'; list = 'ul'; } html += '<li>' + inline(m[1]) + '</li>'; return; }
      if ((m = l.match(/^\s*\d+\.\s+(.*)/))) { if (list !== 'ol') { close(); html += '<ol>'; list = 'ol'; } html += '<li>' + inline(m[1]) + '</li>'; return; }
      close(); html += '<p>' + inline(l) + '</p>';
    });
    close(); return html;
  }

  const INGREDIENTS = {
    'Google Sheets': 'Connexion avec votre compte Google. Sur n8n en ligne : bouton « Sign in with Google », trois clics. Sur une installation personnelle, il faut d\'abord créer un accès dans Google Cloud (la documentation n8n « Google OAuth » explique tout).',
    'Gmail': 'Même connexion Google que ci-dessus, avec l\'accès Gmail. Une seule connexion peut servir à plusieurs workflows.',
    'Claude (Anthropic)': 'Une clé API à créer sur console.anthropic.com, puis à coller dans n8n (Credential « Anthropic »). L\'usage est facturé à la consommation ; ces recettes envoient de petits textes.',
    'Slack': 'Connexion à votre espace Slack depuis n8n (bouton de connexion ou jeton d\'application). Pensez à inviter l\'application dans le canal choisi.'
  };

  /* ------------------------------------------------------------------ recettes : cartes */
  const dots = n => '<span class="lvl-dots" aria-hidden="true">' + [1, 2, 3].map(i => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join('') + '</span>';
  let filter = 'all';
  function renderCards() {
    const list = CATALOG.filter(r =>
      filter === 'all' || (filter === 'n' + r.niveau) || (filter === 'ui' && r.interface) || (filter === 'free' && !r.comptes.length));
    $('recipes').innerHTML = list.map(r =>
      '<article class="recipe" id="card-' + r.id + '">' +
        '<div class="r-prev">' + (WF[r.id] ? renderWorkflowSVG(WF[r.id], false) : '') + '<span class="r-num">Recette ' + r.id + '</span>' +
          '<div class="r-badges"><span class="badge">Tuto intégré</span>' +
          (r.comptes.length ? '' : '<span class="badge free">Sans compte</span>') +
          (r.interface ? '<span class="badge ui">+ interface</span>' : '') +
          (r.video ? '<span class="badge vid">▶ Vidéo</span>' : '') + '</div></div>' +
        '<div class="r-body"><span class="r-cat">' + esc(r.categorie) + '</span><h3>' + esc(r.titre) + '</h3><p class="acc">' + esc(r.accroche) + '</p>' +
          '<dl class="r-meta"><dt>Préparation</dt><dd>' + esc(r.duree) + '</dd>' +
          '<dt>Difficulté</dt><dd>' + dots(r.niveau) + 'Niveau ' + r.niveau + '</dd>' +
          '<dt>Ingrédients</dt><dd><span class="ingr">' + (r.comptes.length ? r.comptes.map(c => '<span>' + esc(c) + '</span>').join('') : '<span>Aucun compte</span>') + '</span></dd>' +
          '<dt>Gain</dt><dd>' + esc(r.gainTexte) + (r.gainMinParSemaine ? ' (≈ ' + fmtMin(r.gainMinParSemaine) + ' / sem.)' : '') + '</dd></dl>' +
          '<div class="r-actions"><button class="btn btn-primary" type="button" data-open="' + r.id + '">Ouvrir la recette</button>' +
          '<button class="btn btn-ghost" type="button" data-quickcopy="' + r.id + '"' + (RAW[r.id] ? '' : ' disabled') + '>Copier</button></div>' +
        '</div></article>').join('') || '<p class="load-err">Aucune recette pour ce filtre.</p>';
  }
  document.querySelectorAll('#filters button').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.f;
    document.querySelectorAll('#filters button').forEach(x => x.setAttribute('aria-pressed', x === b));
    renderCards();
  }));

  function copyWorkflow(id) {
    const raw = RAW[id]; if (!raw) return;
    copyText(raw).then(ok => {
      if (ok) { award('importateur'); toast('<b>Workflow copié !</b> Dans n8n, ouvrez un workflow vide et faites Ctrl + V.'); }
      else { openRecipe(id); showTab('json'); toast('Copie bloquée par le navigateur : sélectionnez le texte de l\'onglet JSON.'); }
    });
  }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openRecipe(o.dataset.open); return; }
    const q = e.target.closest('[data-quickcopy]'); if (q) copyWorkflow(q.dataset.quickcopy);
  });

  /* ------------------------------------------------------------------ recettes : fiche */
  let current = null, lastFocus = null;
  function showTab(k) {
    document.querySelectorAll('#drTabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === k));
    document.querySelectorAll('.dr-panel').forEach(p => { p.hidden = p.dataset.panel !== k; });
    if (k === 'json') { const ta = $('drJson'); ta.focus(); ta.select(); }
  }
  document.querySelectorAll('#drTabs button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));

  function openRecipe(id) {
    const r = CATALOG.find(x => x.id === id); const wf = WF[id];
    if (!r) return;
    current = r; lastFocus = document.activeElement;
    award('explorateur');
    $('drCat').textContent = 'Recette ' + r.id + ' · ' + r.categorie + ' · ' + r.duree;
    $('drTitle').textContent = r.titre;
    $('drAcc').textContent = r.resultat;
    $('drCanvas').innerHTML = wf ? renderWorkflowSVG(wf, true) + '<span class="hint">Cliquez sur une note pour la lire</span>' : '<p class="load-err">Aperçu indisponible.</p>';
    $('drVid').innerHTML = r.video
      ? '<a class="btn btn-ghost" href="' + esc(r.video) + '" target="_blank" rel="noopener">▶ Regarder le tuto vidéo</a><span>ou suivez le tuto écrit ci-dessous.</span>'
      : '<span class="badge">Tuto vidéo bientôt disponible</span><span>Le tuto écrit complet est déjà dans les notes du workflow, ci-dessous.</span>';
    // tuto : notes dans l'ordre (principale, étapes, bonus)
    const notes = wf ? wf.nodes.filter(n => n.type === 'n8n-nodes-base.stickyNote') : [];
    const order = n => n.name === 'Note tuto' ? 0 : n.name === 'Note bonus' ? 2 : 1;
    notes.sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));
    $('drTuto').innerHTML = notes.map(n => '<div class="notecard c' + (n.parameters.color || 'd') + '" id="note-' + esc(n.name.replace(/\s+/g, '-')) + '">' + md(n.parameters.content) + '</div>').join('') || '<p>Aucune note.</p>';
    $('drIngr').innerHTML = r.comptes.length
      ? r.comptes.map(c => '<div><h3 style="font-size:16px">' + esc(c) + '</h3><p>' + esc(INGREDIENTS[c] || '') + '</p></div>').join('') +
        '<div><h3 style="font-size:16px">Après l\'import : les triangles rouges</h3><p>Un bloc qui affiche un triangle rouge attend simplement sa connexion. Double-cliquez dessus, choisissez « Create new credential » et suivez l\'assistant.</p></div>'
      : '<div><h3 style="font-size:16px">Aucun ingrédient</h3><p>Cette recette fonctionne dès l\'import : aucun compte à connecter. Idéale pour commencer.</p></div>';
    $('drUi').innerHTML = r.prompt
      ? '<p style="color:var(--muted);font-size:15px">Ouvrez <b style="color:var(--text)">Claude Code</b> dans un dossier vide, remplacez l\'adresse en majuscules par l\'URL donnée par n8n, puis envoyez ce prompt :</p><div class="prompt-box">' + esc(r.prompt) + '</div><button class="mini-copy" type="button" data-copy="' + esc(r.prompt) + '">Copier le prompt</button>'
      : '<p style="color:var(--muted);font-size:15px">Pas besoin d\'interface pour cette recette : ' + (r.id === '02' ? 'n8n héberge lui-même le formulaire.' : 'elle tourne en arrière-plan et vous envoie le résultat.') + ' Envie d\'en faire une quand même ? Le <a href="#traducteur" style="color:var(--orange)">traducteur</a> et la partie <a href="#claude-code" style="color:var(--orange)">Claude Code</a> vous montrent comment.</p>';
    $('drJson').value = RAW[id] || '';
    $('drFile').textContent = r.file;
    showTab('tuto');
    $('drBg').hidden = false; $('drawer').hidden = false;
    document.body.style.overflow = 'hidden';
    $('drClose').focus();
    $('drawer').querySelector('.dr-scroll').scrollTop = 0;
  }
  function closeRecipe() {
    $('drBg').hidden = true; $('drawer').hidden = true; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('drClose').addEventListener('click', closeRecipe);
  $('drBg').addEventListener('click', closeRecipe);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('drawer').hidden) closeRecipe(); });
  $('drCopy').addEventListener('click', () => current && copyWorkflow(current.id));
  $('drCanvas').addEventListener('click', e => openNote(e.target.closest('.sticky-r')));
  $('drCanvas').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNote(e.target.closest('.sticky-r')); } });
  function openNote(g) {
    if (!g) return;
    showTab('tuto');
    const el = document.getElementById('note-' + g.dataset.note.replace(/\s+/g, '-'));
    if (el) { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1400); }
  }

  /* chargement */
  fetch('templates/catalogue.json').then(r => r.json()).then(cat => {
    CATALOG = cat;
    renderCards(); renderClock();
    return Promise.all(cat.map(r => fetch('templates/' + r.file).then(x => x.text()).then(t => { RAW[r.id] = t; WF[r.id] = JSON.parse(t); }).catch(() => {})));
  }).then(() => {
    renderCards(); runTrad();
    const h = (location.hash || '').match(/^#recette-(\d\d)$/);
    if (h) { document.getElementById('recettes').scrollIntoView(); openRecipe(h[1]); }
  }).catch(() => {
    $('recipes').innerHTML = '<p class="load-err">Les recettes n\'ont pas pu être chargées. Si vous avez ouvert ce fichier directement depuis votre ordinateur, lancez plutôt un petit serveur local (par exemple <span class="mono">npx serve</span> dans ce dossier).</p>';
  });

  /* ------------------------------------------------------------------ compteur de temps perdu */
  const TASKS = [
    { id: 'mails', l: 'Trier et ranger mes emails', m: 90, r: '06' },
    { id: 'veille', l: 'Faire ma veille, lire les newsletters', m: 120, r: '03' },
    { id: 'form', l: 'Recopier des formulaires dans un tableur', m: 45, r: '02' },
    { id: 'faq', l: 'Répondre aux mêmes questions clients', m: 120, r: '05' },
    { id: 'leads', l: 'Trier les demandes de contact', m: 60, r: '04' },
    { id: 'learn', l: 'Rien de tout ça : je veux comprendre', m: 0, r: '01' }
  ];
  function fmtMin(m) { const h = Math.floor(m / 60), mm = m % 60; return h ? h + ' h' + (mm ? ' ' + String(mm).padStart(2, '0') : '') : mm + ' min'; }
  let sel = new Set(store.tasks || ['mails', 'veille']);
  const t0 = Date.now();
  $('tasks').innerHTML = TASKS.map(t => '<button type="button" data-task="' + t.id + '" aria-pressed="' + sel.has(t.id) + '">' + esc(t.l) + (t.m ? '<span class="m">' + fmtMin(t.m) + '</span>' : '') + '</button>').join('');
  $('tasks').addEventListener('click', e => {
    const b = e.target.closest('[data-task]'); if (!b) return;
    sel.has(b.dataset.task) ? sel.delete(b.dataset.task) : sel.add(b.dataset.task);
    b.setAttribute('aria-pressed', sel.has(b.dataset.task));
    store.tasks = [...sel]; save(); award('curieux'); renderClock();
  });
  function weekly() { return TASKS.filter(t => sel.has(t.id)).reduce((s, t) => s + t.m, 0); }
  function renderClock() {
    const w = weekly();
    $('lostWeek').innerHTML = (w ? fmtMin(w) : '0 h') + ' <small>par semaine</small>';
    const hours = Math.round(w * 47 / 60), days = Math.round(w * 47 / 60 / 7);
    $('lostYear').innerHTML = w
      ? 'Soit environ <b>' + hours + ' heures par an</b>, l\'équivalent de <b>' + days + ' journées de travail</b>.'
      : (sel.has('learn') ? 'Bonne idée : la recette 01 est faite pour ça, sans aucun compte à connecter.' : 'Choisissez au moins une tâche.');
    const recos = [...new Set(TASKS.filter(t => sel.has(t.id)).map(t => t.r))].sort();
    $('recoBtns').innerHTML = recos.map(id => {
      const r = CATALOG.find(x => x.id === id);
      return '<button type="button" data-open="' + id + '">Recette ' + id + (r ? ' · ' + esc(r.titre) : '') + ' →</button>';
    }).join('');
    tick();
  }
  function tick() {
    const w = weekly(), s = (Date.now() - t0) / 1000;
    if (!w) { $('ticker').textContent = ''; return; }
    const lost = s * w / (35 * 60);
    const mins = Math.floor(s / 60), secs = Math.floor(s % 60);
    $('ticker').textContent = 'Depuis votre arrivée (' + (mins ? mins + ' min ' : '') + secs + ' s), ' + lost.toFixed(1).replace('.', ',') + ' s de votre temps de travail sont parties en tâches répétitives.';
  }
  setInterval(tick, 1000);
  renderClock();

  /* ------------------------------------------------------------------ traducteur */
  // mots entiers, y compris avec accents (\b ne gère pas é, à…)
  const W = src => new RegExp('(?<![a-zà-ÿ0-9])(?:' + src + ')(?![a-zà-ÿ0-9])', 'i');
  const T_TRIG = [
    { re: W('(chaque|tous les|toutes les)\\s+(jours?|matins?|soirs?|semaines?|mois|heures?|lundis?|mardis?|mercredis?|jeudis?|vendredis?|samedis?|dimanches?|minutes)|à \\d{1,2} ?h'), g: '◷', n: 'Planification', d: 'Schedule Trigger : démarre à heure fixe' },
    { re: W('formulaires?'), g: '≡', n: 'Formulaire', d: 'Form Trigger : démarre à chaque réponse' },
    { re: W('(je reçois|reçois|arrive|nouvel?|reçu)[^.,;]{0,30}?(e-?mails?|mails?|courriels?)|(e-?mails?|mails?)[^.,;]{0,20}?(arrive|reçu)'), g: '@', n: 'Nouvel email', d: 'Gmail Trigger : surveille la boîte' },
    { re: W('chatbot|chat|assistant|questions? (de|des) (mes )?clients?'), g: '❝', n: 'Chat', d: 'Chat Trigger : démarre à chaque message' },
    { re: W('mon site|ma page|mon interface|mon appli(cation)?|un bouton|webhook'), g: '↯', n: 'Webhook', d: 'démarre quand une interface envoie des données' },
    { re: W('nouvelle ligne'), g: '▦', n: 'Nouvelle ligne', d: 'Google Sheets Trigger' },
    { re: W('(paiement|commande)s?\\s+(reçue?s?|validée?s?|payée?s?)|stripe'), g: '$', n: 'Nouveau paiement', d: 'Stripe Trigger' }
  ];
  const T_ACT = [
    { re: W("résum\\w*|analys\\w*|class\\w*|trie|trier|tri|rédig\\w*|tradui\\w*|l'ia|une ia|intelligence artificielle|note|noter|score|catégoris\\w*"), k: 'ai', g: 'IA', n: 'IA (Claude)', d: 'Basic LLM Chain ou AI Agent' },
    { re: W('si|seulement si|sauf si|urgente?s?|importante?s?'), k: 'logic', g: '?', n: 'Condition', d: 'If : choisit le chemin' },
    { re: W('rss|actualités?|actus|blog|flux'), k: 'action', g: 'RSS', n: 'Lire un flux RSS', d: 'RSS Read' },
    { re: W('google sheets|tableur|feuille de calcul|excel|sheets'), k: 'action', g: '▦', n: 'Google Sheets', d: 'ajoute ou lit des lignes' },
    { re: W('slack'), k: 'action', g: '#', n: 'Slack', d: 'poste un message' },
    { re: W('teams'), k: 'action', g: 'T', n: 'Microsoft Teams', d: 'poste un message' },
    { re: W('(envoie|envoyer|envoi|préviens|prévenir|avertis|écris|transmets)[^.;]{0,30}?(e-?mails?|mails?|courriels?)|par (e-?)?mail'), k: 'action', g: '@', n: 'Envoyer un email', d: 'Gmail ou Send Email' },
    { re: W('google drive|drive|pièces? jointes?'), k: 'action', g: '▲', n: 'Google Drive', d: 'enregistre un fichier' },
    { re: W('notion'), k: 'action', g: 'N', n: 'Notion', d: 'crée une page' },
    { re: W('airtable'), k: 'action', g: 'A', n: 'Airtable', d: 'ajoute un enregistrement' },
    { re: W('agenda|calendrier|rendez-vous|rdv'), k: 'action', g: '▣', n: 'Google Calendar', d: 'crée un événement' },
    { re: W('sms|texto'), k: 'action', g: '✆', n: 'SMS', d: 'Twilio' },
    { re: W('whatsapp'), k: 'action', g: 'W', n: 'WhatsApp', d: 'envoie un message' },
    { re: W('telegram'), k: 'action', g: '➤', n: 'Telegram', d: 'envoie un message' },
    { re: W('discord'), k: 'action', g: 'D', n: 'Discord', d: 'poste un message' },
    { re: W('crm|hubspot|pipedrive|salesforce'), k: 'action', g: 'CRM', n: 'CRM', d: 'crée ou met à jour un contact' },
    { re: W('trello|asana|tâches?'), k: 'action', g: '☑', n: 'Gestion de tâches', d: 'Trello, Asana…' },
    { re: W('pdf'), k: 'action', g: '⎙', n: 'Fichier PDF', d: 'crée ou lit un PDF' },
    { re: W('site web|page web|une url|une api'), k: 'action', g: '↗', n: 'HTTP Request', d: 'appelle une adresse web' },
    { re: W('réponds?|répondre|affiche|confirme'), k: 'action', g: '↩', n: 'Répondre', d: 'Respond to Webhook', needs: ['Webhook', 'Chat', 'Formulaire'] }
  ];
  const RECIPE_KEYS = {
    '01': ['Webhook', 'Répondre'], '02': ['Formulaire', 'Google Sheets', 'Envoyer un email'],
    '03': ['Planification', 'Lire un flux RSS', 'IA (Claude)', 'Envoyer un email'],
    '04': ['Webhook', 'IA (Claude)', 'Condition', 'Slack', 'Google Sheets', 'Répondre'],
    '05': ['Chat', 'IA (Claude)'], '06': ['Nouvel email', 'IA (Claude)']
  };
  const EXAMPLES = [
    'Quand quelqu\'un remplit mon formulaire, ajoute ses infos dans Google Sheets et préviens-moi sur Slack.',
    'Chaque lundi à 9 h, lis les actualités de mon secteur, résume-les avec l\'IA et envoie-moi le résumé par email.',
    'Quand je reçois un email avec une facture, enregistre la pièce jointe dans Google Drive.',
    'Quand mon site envoie une demande, l\'IA lui donne une note, si elle est urgente préviens l\'équipe sur Slack, puis réponds au site.',
    'Un assistant de chat qui répond aux questions de mes clients.'
  ];
  $('tradEx').innerHTML = EXAMPLES.map((x, i) => '<button type="button" data-ex="' + i + '">' + esc(x.length > 58 ? x.slice(0, 56) + '…' : x) + '</button>').join('');
  $('tradEx').addEventListener('click', e => {
    const b = e.target.closest('[data-ex]'); if (!b) return;
    $('tradIn').value = EXAMPLES[+b.dataset.ex]; runTrad(); award('traducteur');
  });
  let tradTimer; const initialTrad = $('tradIn').value;
  $('tradIn').addEventListener('input', () => {
    clearTimeout(tradTimer);
    tradTimer = setTimeout(() => { runTrad(); if ($('tradIn').value.trim().length > 20 && $('tradIn').value !== initialTrad) award('traducteur'); }, 350);
  });
  function runTrad() {
    const text = $('tradIn').value.trim();
    const spans = [];
    let trig = null;
    T_TRIG.forEach(r => { const m = text.match(r.re); if (m && (!trig || m.index < trig.at)) trig = { at: m.index, len: m[0].length, r }; });
    const tnode = trig ? Object.assign({ k: 'trigger' }, trig.r) : { k: 'trigger', g: '▶', n: 'Lancement manuel', d: 'Manual Trigger : aucun « quand ? » repéré' };
    if (trig) spans.push({ s: trig.at, e: trig.at + trig.len, k: 'trigger' });
    const acts = [];
    T_ACT.forEach(r => {
      if (r.needs && !r.needs.includes(tnode.n)) return;
      const m = text.match(r.re); if (!m) return;
      if (trig && m.index >= trig.at && m.index < trig.at + trig.len) return;
      acts.push({ at: m.index, node: r }); spans.push({ s: m.index, e: m.index + m[0].length, k: r.k });
    });
    acts.sort((a, b) => a.at - b.at);
    const chain = [tnode].concat(acts.map(a => a.node));
    if (!acts.length) chain.push({ k: 'action', g: '…', n: 'Votre action', d: 'Essayez « envoyer un email », « Google Sheets », « Slack »…' });
    // phrase surlignée
    spans.sort((a, b) => a.s - b.s);
    let html = '', pos = 0;
    spans.forEach(sp => { if (sp.s < pos) return; html += esc(text.slice(pos, sp.s)) + '<span class="hl k-' + sp.k + '">' + esc(text.slice(sp.s, sp.e)) + '</span>'; pos = sp.e; });
    html += esc(text.slice(pos));
    $('tradPhrase').innerHTML = html || '<span style="color:var(--faint)">Écrivez une phrase à gauche…</span>';
    $('tradFlow').innerHTML = chain.map((n, i) => (i ? '<span class="farrow" aria-hidden="true"></span>' : '') +
      '<div class="fnode k-' + n.k + '" style="animation-delay:' + (i * 0.07) + 's"><span class="g">' + esc(n.g) + '</span><b>' + esc(n.n) + '</b><small>' + esc(n.d) + '</small></div>').join('');
    // recette la plus proche
    const names = chain.map(n => n.n);
    let best = null, bestScore = 0;
    Object.entries(RECIPE_KEYS).forEach(([id, keys]) => {
      const sc = keys.filter(k => names.includes(k)).length / keys.length + keys.filter(k => names.includes(k)).length * 0.1;
      if (sc > bestScore) { bestScore = sc; best = id; }
    });
    const r = CATALOG.find(x => x.id === best);
    $('tradReco').innerHTML = r && bestScore >= 0.4
      ? '<p>Recette la plus proche : <b>' + r.id + ' · ' + esc(r.titre) + '</b></p><button class="btn btn-primary" type="button" data-open="' + r.id + '" style="padding:9px 14px;font-size:14px">Ouvrir la recette</button>'
      : '<p>Aucune recette ne correspond encore exactement. Copiez le prompt ci-dessous dans Claude Code : il construira ce workflow pour vous.</p>';
    $('tradPrompt').textContent = 'Avec le serveur MCP n8n, crée un workflow n8n qui fait ceci : « ' + text + ' »\n\n' +
      'Structure proposée : ' + names.join(' → ') + '.\n\n' +
      'Donne des noms en français à chaque bloc. Ajoute des notes (sticky notes) qui expliquent chaque étape à un débutant et listent les comptes à connecter. Vérifie le workflow avant de me le présenter, et ne l\'active pas.';
  }
  $('tradCopy').addEventListener('click', () => copyText($('tradPrompt').textContent).then(ok => { $('tradCopy').textContent = ok ? 'Copié' : 'Sélectionnez le texte'; setTimeout(() => { $('tradCopy').textContent = 'Copier le prompt'; }, 1600); }));
  runTrad();

  /* ------------------------------------------------------------------ défi */
  const B = {
    form: { g: '≡', n: 'Formulaire', k: 'trigger' }, sheets: { g: '▦', n: 'Google Sheets' }, gmail: { g: '@', n: 'Envoyer un email' },
    schedule: { g: '◷', n: 'Planification', k: 'trigger' }, slack: { g: '#', n: 'Slack' }, rss: { g: 'RSS', n: 'Lire les actualités' },
    ai: { g: 'IA', n: 'IA (Claude)' }, webhook: { g: '↯', n: 'Webhook', k: 'trigger' }, iff: { g: '?', n: 'Condition (If)' },
    respond: { g: '↩', n: 'Répondre au site' }
  };
  const LEVELS = [
    { m: 'Quand quelqu\'un remplit le formulaire de contact, ajouter ses réponses dans Google Sheets, puis m\'envoyer un email.',
      sol: ['form', 'sheets', 'gmail'], pal: ['gmail', 'schedule', 'form', 'slack', 'sheets'], r: '02',
      win: 'Bravo ! Le déclencheur « Formulaire » répond à « quand ? », puis les deux actions s\'enchaînent. C\'est exactement la recette 02.' },
    { m: 'Chaque matin à 8 h, lire les actualités de mon secteur, les faire résumer par l\'IA, puis m\'envoyer le résumé par email.',
      sol: ['schedule', 'rss', 'ai', 'gmail'], pal: ['ai', 'webhook', 'gmail', 'rss', 'iff', 'schedule'], r: '03',
      win: 'Parfait ! Ici personne ne clique : c\'est l\'horloge (Planification) qui démarre tout. Voici la recette 03.' },
    { m: 'Quand mon site envoie une demande, l\'IA lui donne une note. Si la note est bonne, prévenir l\'équipe sur Slack. Puis répondre au site.',
      sol: ['webhook', 'ai', 'iff', 'slack', 'respond'], pal: ['slack', 'form', 'respond', 'ai', 'sheets', 'webhook', 'iff'], r: '04',
      win: 'Impressionnant ! Webhook pour recevoir, IA pour noter, Condition pour aiguiller, et Répondre pour renvoyer le résultat au site. C\'est le cœur de la recette 04.' }
  ];
  let lvl = 0, placed = [];
  function blockHTML(id) { const b = B[id]; return '<span class="g">' + esc(b.g) + '</span><b>' + esc(b.n) + '</b>'; }
  function renderGame(msg) {
    const L = LEVELS[lvl];
    $('mission').innerHTML = '<small>Mission ' + (lvl + 1) + ' / 3</small>' + esc(L.m);
    $('lvlInfo').textContent = L.sol.length + ' blocs à placer';
    $('slots').innerHTML = L.sol.map((_, i) => (i ? '<span class="slot-arrow" aria-hidden="true"></span>' : '') +
      '<button type="button" class="slot' + (placed[i] ? ' filled' : '') + '" data-slot="' + i + '" aria-label="Case ' + (i + 1) + (placed[i] ? ' : ' + B[placed[i]].n + ', cliquer pour retirer' : ' vide') + '">' +
      (placed[i] ? blockHTML(placed[i]) : (i === 0 ? 'Case 1<br>« Quand ? »' : 'Case ' + (i + 1))) + '</button>').join('');
    $('palette').innerHTML = L.pal.map(id => '<button type="button" class="pblock" data-block="' + id + '"' + (placed.includes(id) ? ' disabled' : '') + '>' + blockHTML(id) + '</button>').join('');
    document.querySelectorAll('#lvls button').forEach(b => { b.setAttribute('aria-pressed', +b.dataset.l === lvl); b.classList.toggle('won', store.won.includes(+b.dataset.l)); });
    if (msg) { $('feedback').className = 'feedback ' + msg[0]; $('feedback').innerHTML = msg[1]; }
  }
  $('palette').addEventListener('click', e => {
    const b = e.target.closest('[data-block]'); if (!b || b.disabled) return;
    const L = LEVELS[lvl]; const i = [...Array(L.sol.length).keys()].find(k => !placed[k]);
    if (i === undefined) return;
    placed[i] = b.dataset.block; renderGame(['info', 'Remplissez les cases, puis lancez le workflow pour vérifier.']);
  });
  $('slots').addEventListener('click', e => {
    const s = e.target.closest('[data-slot]'); if (!s) return;
    placed[+s.dataset.slot] = undefined; renderGame();
  });
  $('lvls').addEventListener('click', e => {
    const b = e.target.closest('[data-l]'); if (!b) return;
    lvl = +b.dataset.l; placed = []; renderGame(['info', 'Remplissez les cases, puis lancez le workflow pour vérifier.']);
  });
  $('gameReset').addEventListener('click', () => { placed = []; renderGame(['info', 'Remplissez les cases, puis lancez le workflow pour vérifier.']); });
  let running = false;
  $('gameCheck').addEventListener('click', async () => {
    if (running) return;
    const L = LEVELS[lvl];
    if (placed.filter(Boolean).length < L.sol.length) { renderGame(['bad', 'Il reste des cases vides : le workflow doit contenir ' + L.sol.length + ' blocs.']); return; }
    const slots = [...document.querySelectorAll('#slots .slot')];
    if (!B[placed[0]].k) {
      slots[0].classList.add('bad');
      $('feedback').className = 'feedback bad';
      $('feedback').textContent = 'Un workflow commence toujours par un déclencheur, le bloc qui répond à « quand ? ». « ' + B[placed[0]].n + ' » est une action.';
      return;
    }
    running = true;
    for (let i = 0; i < slots.length; i++) {
      slots[i].classList.add('run'); await sleep(380); slots[i].classList.remove('run');
      if (placed[i] !== L.sol[i]) {
        slots[i].classList.add('bad');
        const trap = !L.sol.includes(placed[i]);
        $('feedback').className = 'feedback bad';
        $('feedback').textContent = trap
          ? 'Le bloc « ' + B[placed[i]].n + ' » n\'apparaît pas dans la mission : c\'était un piège. Relisez la phrase, que faut-il faire à cette étape ?'
          : 'Le workflow s\'arrête à la case ' + (i + 1) + '. Relisez la mission : que se passe-t-il juste après « ' + B[placed[i - 1]].n + ' » ?';
        running = false; return;
      }
      slots[i].classList.add('ok');
    }
    running = false;
    if (!store.won.includes(lvl)) { store.won.push(lvl); save(); }
    if (lvl === 0) award('assembleur');
    if (lvl === 2) award('expert');
    document.querySelectorAll('#lvls button').forEach(b => b.classList.toggle('won', store.won.includes(+b.dataset.l)));
    $('feedback').className = 'feedback ok';
    $('feedback').innerHTML = esc(L.win) + ' <button class="mini-copy" type="button" data-open="' + L.r + '" style="margin-left:6px">Voir la recette ' + L.r + '</button>' +
      (lvl < 2 ? ' <button class="mini-copy" type="button" id="nextLvl">Niveau suivant →</button>' : '');
    const nx = $('nextLvl'); if (nx) nx.addEventListener('click', () => { lvl++; placed = []; renderGame(['info', 'Remplissez les cases, puis lancez le workflow pour vérifier.']); });
  });
  renderGame();
})();
