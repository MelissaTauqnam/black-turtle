'use strict';
/* ============================================================
   Thai Clips — learn Thai phrases through the scene + the sound
   No backend: everything is stored in localStorage.
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------------- state ---------------- */
const KEY = 'thai-clips-v1';
const DAILY_GOAL = 20;
const MAX_BOX = 5;
const INTERVALS = [0, 5 * 60e3, 864e5, 3 * 864e5, 7 * 864e5, 21 * 864e5]; // per box
const EMOJIS = ['🍜','🚕','☕','😂','🙏','🏖️','🛵','🍹','🎉','😋','🤔','❤️','🏠','💸','🕒','🌧️','🐘','🥭','🛍️','👋'];

const defaults = { videos: {}, deck: [], xp: 0, streak: 0, lastDay: '', today: { day: '', n: 0, goalHit: false }, mute: false, blind: false, hideTh: false, phon: true, cur: null };
let S = defaults;
try { S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const dayStr = (d = new Date()) => d.toISOString().slice(0, 10);

/* ---------------- audio fx ---------------- */
let actx;
function tone(freq, t0, dur, type = 'triangle', vol = .18) {
  if (S.mute) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, actx.currentTime + t0);
    g.gain.linearRampToValueAtTime(vol, actx.currentTime + t0 + .02);
    g.gain.exponentialRampToValueAtTime(.001, actx.currentTime + t0 + dur);
    o.connect(g).connect(actx.destination);
    o.start(actx.currentTime + t0); o.stop(actx.currentTime + t0 + dur + .05);
  } catch {}
}
const sfx = {
  ok: combo => { const b = 523 * Math.pow(1.06, Math.min(combo, 8)); tone(b, 0, .12); tone(b * 1.5, .08, .2); },
  bad: () => { tone(180, 0, .25, 'sawtooth', .12); tone(140, .1, .3, 'sawtooth', .1); },
  level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .1, .25)),
  tick: () => tone(880, 0, .06, 'sine', .1),
};

/* ---------------- visual fx ---------------- */
function burst(x, y, n = 18, set = ['✨', '⭐', '💜', '🔥', '🎉']) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'fx'; el.textContent = set[rnd(set.length)];
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.appendChild(el);
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 140;
    el.animate([
      { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * d - 10}px,${Math.sin(a) * d - 60}px) scale(1.2) rotate(${rnd(360)}deg)`, opacity: 0 }
    ], { duration: 700 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.4,1)' }).onfinish = () => el.remove();
  }
}
const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800);
}
const bump = el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };

/* ---------------- gamification ---------------- */
const levelOf = xp => Math.floor(Math.sqrt(xp / 60)) + 1;
const levelStart = l => 60 * (l - 1) * (l - 1);

function touchDay() {
  const today = dayStr();
  if (S.today.day !== today) S.today = { day: today, n: 0, goalHit: false };
  if (S.lastDay !== today) {
    const y = dayStr(new Date(Date.now() - 864e5));
    S.streak = S.lastDay === y ? S.streak + 1 : 1;
    S.lastDay = today;
  }
}
function addXP(n) {
  const before = levelOf(S.xp);
  S.xp += n;
  const after = levelOf(S.xp);
  if (after > before) {
    sfx.level(); toast(`⭐ Niveau ${after} !`);
    burst(innerWidth / 2, innerHeight / 3, 40);
  }
}
function renderStats() {
  const l = levelOf(S.xp), a = levelStart(l), b = levelStart(l + 1);
  $('#stLevel').textContent = l;
  $('#stXpFill').style.width = Math.round((S.xp - a) / (b - a) * 100) + '%';
  $('#stStreak').textContent = S.streak;
  const n = S.today.day === dayStr() ? S.today.n : 0;
  $('#stDaily').textContent = `${Math.min(n, DAILY_GOAL)}/${DAILY_GOAL}`;
  $('#deckCount').textContent = S.deck.length;
  $('#dueCount').textContent = dueCards().length;
  $('#muteBtn').textContent = S.mute ? '🔇' : '🔊';
}

/* ---------------- YouTube ---------------- */
function ytId(url) {
  url = url.trim();
  if (/^[\w-]{11}$/.test(url)) return url;
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/|v\/)([\w-]{11})/);
  return m ? m[1] : null;
}
let player = null, curVid = null, clip = null, clipTimer = null, apiP = null;
function loadAPI() {
  if (apiP) return apiP;
  apiP = new Promise(res => {
    if (window.YT && YT.Player) return res();
    window.onYouTubeIframeAPIReady = res;
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => toast('Could not load YouTube (network?)');
    document.head.appendChild(s);
  });
  return apiP;
}
function showServeHelp() {
  const ph = $('#placeholder'); ph.classList.remove('hidden');
  ph.innerHTML = '<div style="padding:20px;max-width:440px"><div class="big">🔌</div><p><b>YouTube error 153</b> — YouTube refuses to play videos in a page opened by double-click (file://).</p><p>Serve the folder locally, then open <code>http://localhost:8000/thai-clips.html</code>:</p><p><code>python3 -m http.server 8000</code></p></div>';
}
function createPlayer(vid, start, autoplay) {
  return new Promise(res => {
    $('#placeholder').classList.add('hidden');
    curVid = vid;
    player = new YT.Player('yt', {
      videoId: vid,
      playerVars: { origin: location.protocol.startsWith('http') ? location.origin : undefined, playsinline: 1, rel: 0, start: Math.floor(start), autoplay: autoplay ? 1 : 0, cc_load_policy: 0, iv_load_policy: 3 },
      events: {
        onReady: () => { player.setPlaybackRate(+$('#rateSel').value); res(); },
        onStateChange: e => { if (e.data === 1 && clip) clip.armed = true; },
        onError: e => {
          if (e.data === 153 || location.protocol === 'file:') showServeHelp();
          else toast(e.data === 101 || e.data === 150 ? 'The owner of this video blocks embedding' : "This video can't be played here (invalid URL?)");
        },
      },
    });
  });
}
async function openVideo(vid) {
  await loadAPI();
  stopClip();
  if (!player) await createPlayer(vid, 0, false);
  else if (curVid !== vid) { curVid = vid; player.cueVideoById(vid); }
  $('#placeholder').classList.add('hidden');
}
async function playClip(vid, s, e, { loop = false, onEnd = null } = {}) {
  await loadAPI();
  stopClip();
  clip = { s, e, loop, onEnd, armed: false };
  if (!player) await createPlayer(vid, s, true);
  else if (curVid !== vid) { curVid = vid; player.loadVideoById({ videoId: vid, startSeconds: s }); }
  else { player.seekTo(s, true); player.playVideo(); }
  player.setPlaybackRate(+$('#rateSel').value);
  clipTimer = setInterval(tickClip, 80);
}
function tickClip() {
  if (!clip || !player || !player.getCurrentTime) return;
  const t = player.getCurrentTime();
  if (clip.armed && (t < clip.s - 1.5 || t > clip.e + 2)) return stopClip(); // user seeked elsewhere
  if (t >= clip.e - .05 && (clip.armed || t > clip.s + .5)) {
    if (clip.loop) { player.seekTo(clip.s, true); return; }
    const cb = clip.onEnd; player.pauseVideo(); stopClip(); cb && cb();
  }
}
function stopClip() { clearInterval(clipTimer); clipTimer = null; clip = null; }
const curTime = () => (player && player.getCurrentTime ? player.getCurrentTime() : 0);

/* ---------------- transcript parsing ---------------- */
const toSec = str => { const p = str.replace(',', '.').split(':').map(Number); return p.reduce((a, v) => a * 60 + v, 0); };
function parseTranscript(raw) {
  raw = raw.replace(/\r/g, '').replace(/^﻿/, '').trim();
  let out = [];
  if (raw.includes('-->')) {                       // SRT / VTT
    for (const blk of raw.split(/\n\s*\n/)) {
      const ls = blk.split('\n').map(s => s.trim()).filter(Boolean);
      const i = ls.findIndex(l => l.includes('-->'));
      if (i < 0) continue;
      const m = ls[i].match(/([\d:.,]+)\s*-->\s*([\d:.,]+)/);
      if (!m) continue;
      const t = ls.slice(i + 1).join(' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (t) out.push({ s: toSec(m[1]), e: toSec(m[2]), t });
    }
  } else {                                         // pasted YouTube transcript
    let cur = null;
    for (const l of raw.split('\n').map(s => s.trim())) {
      const m = l.match(/^((?:\d{1,2}:)?\d{1,2}:\d{2})(?:\s+(.*))?$/);
      if (m) { if (cur && cur.t) out.push(cur); cur = { s: toSec(m[1]), e: null, t: (m[2] || '').trim() }; }
      else if (cur && l) cur.t += (cur.t ? ' ' : '') + l;
    }
    if (cur && cur.t) out.push(cur);
  }
  out = out.filter((x, i) => !(i && x.t === out[i - 1].t));   // duplicates from auto-captions
  out.forEach((x, i) => {
    const nx = out[i + 1];
    if (x.e == null || x.e <= x.s) x.e = nx ? Math.min(nx.s, x.s + 10) : x.s + 5;
    if (nx && x.e > nx.s && nx.s > x.s) x.e = nx.s;             // pas de chevauchement
    x.e = Math.max(x.e, x.s + 1);
  });
  return out;
}
const fmt = s => { s = Math.floor(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/* ---------------- thai segmentation ---------------- */
const seg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter('th', { granularity: 'word' }) : null;
function words(text) {
  text = text.trim();
  if (seg) {
    const w = [...seg.segment(text)].filter(x => x.isWordLike !== false && x.segment.trim()).map(x => x.segment);
    if (w.length) return w;
  }
  const sp = text.split(/\s+/).filter(Boolean);
  if (sp.length > 1) return sp;
  return text.match(/.{1,3}/gu) || [text];
}

/* ---------------- deck / SRS ---------------- */
const phOf = (t, c) => (c && c.ph) || Phon.convert(t);
const cardId = (vid, s) => `${vid}@${Math.round(s * 10)}`;
const inDeck = (vid, s) => S.deck.some(c => c.id === cardId(vid, s));
const dueCards = () => S.deck.filter(c => c.due <= Date.now());
function addCard(vid, s, e, t) {
  if (inDeck(vid, s)) return false;
  S.deck.push({ id: cardId(vid, s), vid, s, e, t, box: 0, due: 0, note: '', emoji: EMOJIS[rnd(EMOJIS.length)], ok: 0, ko: 0 });
  save(); return true;
}
function gradeCard(c, ok) {
  if (ok) { c.box = Math.min(MAX_BOX, c.box + 1); c.ok++; c.due = Date.now() + INTERVALS[c.box]; }
  else { c.box = Math.max(0, c.box - 2); c.ko++; c.due = 0; }
  save();
}

function applyPhon() { document.body.classList.toggle('no-ph', !S.phon); $('#phonBtn').classList.toggle('on', S.phon); }
$('#phonBtn').onclick = () => { S.phon = !S.phon; save(); applyPhon(); };

/* ============================================================
   WATCH tab
   ============================================================ */
const cur = () => S.videos[S.cur];

async function loadUrl(raw) {
  const id = ytId(raw);
  if (!id) return toast('YouTube URL not recognised 🤔');
  if (!S.videos[id]) S.videos[id] = { id, title: 'Video ' + id, lines: [] };
  S.cur = id; save();
  renderWatch(); switchTab('watch');
  await openVideo(id);
  fetch('https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id))
    .then(r => r.json()).then(j => { if (j.title) { S.videos[id].title = j.title; save(); renderWatch(); } }).catch(() => {});
}

function renderWatch() {
  const v = cur();
  $('#vtitle').textContent = v ? v.title : '';
  $('#blindBtn').classList.toggle('on', S.blind);
  $('#mask').classList.toggle('hidden', !S.blind);
  $('#hideTh').checked = S.hideTh;
  applyPhon();
  $('#lines').classList.toggle('hide-th', S.hideTh);
  const has = v && v.lines.length;
  $('#importBox').classList.toggle('hidden', !!has || !v);
  $('#watchTools').classList.toggle('hidden', !has);
  const box = $('#lines');
  if (!v) { box.innerHTML = '<div class="empty">Load a video to see its transcript here.</div>'; return; }
  box.innerHTML = v.lines.map((l, i) => `
    <div class="line" data-i="${i}">
      <span class="tm">${fmt(l.s)}</span>
      <span class="tx"><span class="th">${esc(l.t)}</span><span class="ph">${esc(Phon.convert(l.t))}</span></span>
      <span class="acts">
        <button class="ib" data-a="play" title="Listen">▶</button>
        <button class="ib" data-a="loop" title="Loop">🔁</button>
        <button class="ib ${inDeck(v.id, l.s) ? 'on' : ''}" data-a="star" title="Keep this phrase">⭐</button>
      </span>
    </div>`).join('');
  renderStats();
}

$('#lines').addEventListener('click', e => {
  const row = e.target.closest('.line'); if (!row) return;
  const v = cur(), l = v.lines[+row.dataset.i];
  const a = e.target.closest('button')?.dataset.a;
  if (S.hideTh) row.classList.add('rev');
  if (a === 'star') {
    const btn = e.target.closest('button');
    if (inDeck(v.id, l.s)) { S.deck = S.deck.filter(c => c.id !== cardId(v.id, l.s)); btn.classList.remove('on'); }
    else { addCard(v.id, l.s, l.e, l.t); btn.classList.add('on'); const [x, y] = centerOf(btn); burst(x, y, 8, ['⭐', '✨']); sfx.tick(); }
    save(); renderStats(); return;
  }
  playClip(v.id, l.s, l.e, { loop: a === 'loop' });
  $$('.line.looping').forEach(x => x.classList.remove('looping'));
});

$('#hideTh').onchange = e => { S.hideTh = e.target.checked; save(); $('#lines').classList.toggle('hide-th', S.hideTh); };
$('#starAll').onclick = () => {
  const v = cur(); let n = 0;
  v.lines.forEach(l => { if (addCard(v.id, l.s, l.e, l.t)) n++; });
  toast(`⭐ ${n} phrases added`); renderWatch();
};
$('#trReplace').onclick = () => { $('#importBox').classList.remove('hidden'); $('#importBox').scrollIntoView({ behavior: 'smooth' }); };
$('#trLoad').onclick = () => {
  const v = cur(); if (!v) return toast("Load a video first");
  const lines = parseTranscript($('#trText').value);
  if (!lines.length) return toast('No lines detected — check the format');
  v.lines = lines; save(); $('#trText').value = '';
  toast(`✅ ${lines.length} lines imported`); renderWatch();
};
$('#trFile').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader(); r.onload = () => { $('#trText').value = r.result; $('#trLoad').click(); }; r.readAsText(f);
};
$('#trSample').onclick = () => {
  $('#trText').value = `0:03\nสวัสดีครับ วันนี้อากาศดีมาก\n0:06\nไปกินข้าวกันไหม\n0:09\nอร่อยมากเลย ขอบคุณนะครับ\n0:13\nเท่าไหร่ครับ\n0:16\nแพงไปหน่อย ลดได้ไหม`;
};

/* manual capture */
$('#captureBtn').onclick = () => {
  const v = cur(); if (!v || !player) return toast("Load a video first");
  const t = curTime();
  let line = v.lines.find(l => t >= l.s && t < l.e) || v.lines.filter(l => l.s <= t).pop();
  if (line) { addCard(v.id, line.s, line.e, line.t); toast('⚡ Phrase captured!'); }
  else {
    const txt = prompt('Phrase you heard (in Thai):'); if (!txt) return;
    const s = Math.max(0, t - 3);
    addCard(v.id, s, t + 2, txt.trim()); toast('⚡ Phrase captured!');
  }
  const [x, y] = centerOf($('#captureBtn')); burst(x, y, 14); sfx.ok(2); renderWatch();
};

/* highlight the active line */
setInterval(() => {
  if (!$('#tab-watch').classList.contains('active') || !player || !cur() || !player.getCurrentTime) return;
  const t = curTime(), v = cur();
  const i = v.lines.findIndex(l => t >= l.s && t < l.e);
  const rows = $$('.line');
  rows.forEach((r, k) => r.classList.toggle('active', k === i));
  if (i >= 0 && player.getPlayerState && player.getPlayerState() === 1) {
    const r = rows[i]; if (r && !r.dataset.seen) { $$('.line[data-seen]').forEach(x => delete x.dataset.seen); r.dataset.seen = 1; r.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }
}, 250);

/* player controls */
$('#blindBtn').onclick = () => { S.blind = !S.blind; save(); renderWatch(); };
$('#rateSel').onchange = e => { if (player && player.setPlaybackRate) player.setPlaybackRate(+e.target.value); };

/* ============================================================
   DECK tab
   ============================================================ */
function renderDeck() {
  const box = $('#deckList');
  if (!S.deck.length) { box.innerHTML = '<div class="empty">No phrases yet.<br>Click ⭐ in the transcript or ⚡ Capture while watching.</div>'; return; }
  const groups = {};
  S.deck.forEach(c => (groups[c.vid] = groups[c.vid] || []).push(c));
  box.innerHTML = Object.entries(groups).map(([vid, cards]) => `
    <div class="vgroup"><h4>${esc(S.videos[vid]?.title || vid)}</h4>
    ${cards.sort((a, b) => a.s - b.s).map(c => `
      <div class="dcard" data-id="${esc(c.id)}">
        <button class="emo" title="Your visual anchor (click to change)">${c.emoji}</button>
        <div class="mid">
          <div class="th">${esc(c.t)}</div>
          <input class="phin" placeholder="${esc(Phon.convert(c.t))}" value="${esc(c.ph || '')}" title="Phonetics (auto — edit it if it's wrong)">
          <input class="note" placeholder="My own hint (mental image, situation…)" value="${esc(c.note)}">
          <div class="boxes">${[1, 2, 3, 4, 5].map(i => `<i class="${c.box >= i ? 'f' : ''}"></i>`).join('')}</div>
        </div>
        <button class="ib" data-a="play" title="Listen">▶</button>
        <button class="ib" data-a="del" title="Delete">🗑</button>
      </div>`).join('')}
    </div>`).join('');
}
$('#deckList').addEventListener('click', e => {
  const row = e.target.closest('.dcard'); if (!row) return;
  const c = S.deck.find(x => x.id === row.dataset.id);
  if (e.target.closest('.emo')) {
    const i = EMOJIS.indexOf(c.emoji); c.emoji = EMOJIS[(i + 1) % EMOJIS.length]; save();
    e.target.closest('.emo').textContent = c.emoji; sfx.tick();
  }
  const a = e.target.closest('button')?.dataset.a;
  if (a === 'play') playClip(c.vid, c.s, c.e);
  if (a === 'del') { S.deck = S.deck.filter(x => x !== c); save(); renderDeck(); renderStats(); }
});
$('#deckList').addEventListener('input', e => {
  const cl = e.target.classList;
  if (!cl.contains('note') && !cl.contains('phin')) return;
  const c = S.deck.find(x => x.id === e.target.closest('.dcard').dataset.id);
  if (cl.contains('note')) c.note = e.target.value; else c.ph = e.target.value.trim();
  save();
});

/* ============================================================
   PLAY tab (jeux)
   ============================================================ */
let Q = null;
let nextTimer = null;

function renderPlayHome() {
  const due = dueCards().length, tot = S.deck.length;
  $('#playTitle').textContent = tot ? (due ? `${due} phrase${due > 1 ? 's' : ''} to review` : 'All caught up 🎉') : 'Add some phrases first';
  $('#playSub').textContent = tot ? (due ? 'Sessions of up to 10 phrases — go for the combo!' : 'You can still practise in free mode.') : 'Go to “Watch” and star your favourite phrases.';
  $('#startBtn').disabled = !tot;
  $('#startBtn').textContent = due || !tot ? 'Let\'s go!' : 'Free mode';
  $('#playHome').classList.remove('hidden'); $('#quiz').classList.add('hidden');
}

$('#startBtn').onclick = () => {
  let pool = dueCards().sort((a, b) => a.box - b.box || a.due - b.due);
  if (!pool.length) pool = shuffle(S.deck);
  Q = { queue: pool.slice(0, 10), i: 0, total: Math.min(10, pool.length), good: 0, combo: 0, best: 0, xp: 0, retried: new Set(), done: 0, lvl0: levelOf(S.xp) };
  touchDay();
  $('#playHome').classList.add('hidden'); $('#quiz').classList.remove('hidden');
  nextQ();
};

function distractorTexts(card, n) {
  const all = new Set(S.deck.map(c => c.t));
  Object.values(S.videos).forEach(v => v.lines.forEach(l => all.add(l.t)));
  all.delete(card.t);
  const len = card.t.length;
  const sorted = shuffle([...all]).sort((a, b) => Math.abs(a.length - len) - Math.abs(b.length - len)).slice(0, n + 4);
  return shuffle(sorted).slice(0, n);
}
function distractorWords(card, ws, n) {
  const own = new Set(ws), all = new Set();
  [...S.deck.map(c => c.t), ...Object.values(S.videos).flatMap(v => v.lines.map(l => l.t))].forEach(t => words(t).forEach(w => { if (!own.has(w) && w.length >= 2) all.add(w); }));
  return shuffle([...all]).slice(0, n);
}

function pickMode(c, ws) {
  let m = c.box <= 1 ? 'listen' : c.box <= 3 ? 'cloze' : 'build';
  if (Math.random() < .25) m = ['listen', 'cloze', 'build'][rnd(3)];
  if (m === 'listen' && distractorTexts(c, 3).length < 3) m = 'build';
  if (m === 'cloze' && (ws.length < 2 || distractorWords(c, ws, 3).length < 3)) m = 'build';
  if (m === 'build' && ws.length < 2) m = 'listen';
  if (m === 'listen' && distractorTexts(c, 3).length < 3) m = 'cloze';
  return m;
}

function head() {
  return `<div class="qhead">
    <div class="qbar"><i style="width:${Q.done / Q.total * 100}%"></i></div>
    <div class="combo" id="combo">${Q.combo > 1 ? '🔥 ×' + Q.combo : ''}</div>
  </div>`;
}
const replayBtns = c => `<div class="replay">
  <button class="btn ghost" id="rp">🔊 Replay</button>
  <button class="btn ghost" id="rps">🐢 Slow</button>
</div>`;
function bindReplay(c) {
  const go = rate => { if (player && player.setPlaybackRate) player.setPlaybackRate(rate); playClip(c.vid, c.s, c.e); if (player && player.setPlaybackRate) setTimeout(() => player.setPlaybackRate(rate), 300); };
  $('#rp').onclick = () => go(+$('#rateSel').value);
  $('#rps').onclick = () => go(.6);
}

function nextQ() {
  clearTimeout(nextTimer);
  if (Q.i >= Q.queue.length) return endSession();
  const c = Q.queue[Q.i], ws = words(c.t);
  c._ws = ws;
  const mode = pickMode(c, ws);
  const box = $('#quiz');
  if (mode === 'listen') {
    const opts = shuffle([c.t, ...distractorTexts(c, 3)]);
    box.innerHTML = head() + `<div class="qcard"><div class="qtype">🎧 Scene</div>
      <div class="qprompt">Watch, listen… which phrase do you hear?</div>
      ${replayBtns(c)}
      <div class="choices">${opts.map(o => `<button class="choice" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <div id="fb"></div></div>`;
    $$('.choice').forEach(b => b.onclick = () => {
      const ok = b.dataset.v === c.t;
      $$('.choice').forEach(x => { x.disabled = true; if (x.dataset.v === c.t) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      answer(c, ok, b);
    });
  } else if (mode === 'cloze') {
    const k = shuffle(ws.map((w, i) => i).filter(i => ws[i].length >= 2))[0] ?? 0;
    const target = ws[k];
    const opts = shuffle([target, ...distractorWords(c, ws, 3)]);
    box.innerHTML = head() + `<div class="qcard"><div class="qtype">🧩 Missing word</div>
      <div class="qprompt">Listen and complete the phrase</div>
      ${replayBtns(c)}
      <div class="cloze">${ws.map((w, i) => i === k ? '<span class="blank" id="blank">&nbsp;?&nbsp;</span>' : `<span>${esc(w)}</span>`).join('')}</div>
      <div class="wchoices">${opts.map(o => `<button class="chip" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <div id="fb"></div></div>`;
    $$('.chip').forEach(b => b.onclick = () => {
      const ok = b.dataset.v === target;
      $$('.chip').forEach(x => { x.disabled = true; if (x.dataset.v === target) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      const bl = $('#blank'); bl.textContent = target; bl.classList.add(ok ? 'right' : 'wrong');
      answer(c, ok, b);
    });
  } else {
    const bank = shuffle(ws.map((w, i) => ({ w, i })));
    box.innerHTML = head() + `<div class="qcard"><div class="qtype">🏗️ Rebuild</div>
      <div class="qprompt">Listen and put the words back in order</div>
      ${replayBtns(c)}
      <div class="slots" id="slots"></div>
      <div class="wchoices" id="bank">${bank.map(b => `<button class="chip" data-i="${b.i}">${esc(b.w)}</button>`).join('')}</div>
      <div id="fb"></div></div>`;
    const placed = [];
    const check = () => {
      if (placed.length < ws.length) return;
      const ok = placed.map(i => ws[i]).join('') === ws.join('');
      $$('.chip').forEach(x => x.disabled = true);
      $('#slots').classList.add(ok ? 'right' : 'wrong');
      answer(c, ok, $('#slots'));
    };
    box.onclick = e => {
      const ch = e.target.closest('.chip'); if (!ch || ch.disabled || !ch.dataset.i) return;
      const i = +ch.dataset.i;
      if (ch.parentElement.id === 'bank') { $('#slots').appendChild(ch); placed.push(i); sfx.tick(); check(); }
      else if (ch.parentElement.id === 'slots') { $('#bank').appendChild(ch); placed.splice(placed.indexOf(i), 1); }
    };
  }
  bindReplay(c);
  if (mode !== 'build') box.onclick = null;
  playClip(c.vid, c.s, c.e);
}

function answer(c, ok, anchorEl) {
  Q.done++;
  const first = !Q.retried.has(c.id);
  touchDay();
  const [x, y] = centerOf(anchorEl);
  let gain = 0;
  if (ok) {
    Q.combo++; Q.best = Math.max(Q.best, Q.combo);
    gain = 10 + Math.min(Q.combo, 6) * 3;
    Q.xp += gain; Q.good += first ? 1 : 0;
    addXP(gain); sfx.ok(Q.combo);
    burst(x, y, 10 + Math.min(Q.combo, 8) * 3);
    if (first) gradeCard(c, true);
    if (Q.combo >= 3 && Q.combo % 3 === 0) toast(`🔥 Combo ×${Q.combo} !`);
  } else {
    Q.combo = 0; sfx.bad();
    gradeCard(c, false);
    if (first) { Q.retried.add(c.id); Q.queue.push(c); Q.total++; }
  }
  S.today.n++;
  if (S.today.n >= DAILY_GOAL && !S.today.goalHit) { S.today.goalHit = true; toast('🎯 Daily goal reached!'); burst(innerWidth / 2, innerHeight / 2, 50); addXP(50); }
  save(); renderStats(); bump($('#stDaily'));
  const cm = $('#combo'); if (cm) { cm.textContent = Q.combo > 1 ? '🔥 ×' + Q.combo : ''; bump(cm); }
  $('.qbar i').style.width = Math.min(100, Q.done / Q.total * 100) + '%';

  // feedback : reveal the Thai + personal hint, and replay the scene (sound + picture)
  $('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'ko'}">
    <div class="verdict">${ok ? '✅ Nice! +' + gain + ' XP' : '❌ No worries, we will see it again'}</div>
    <div class="th">${esc(c.t)}</div>
    <div class="ph">${esc(phOf(c.t, c))}</div>
    <div class="anchor">${c.emoji} ${esc(c.note || 'Anchor: remember the scene you just saw')}</div>
    <button class="btn primary" id="nx">Suivant →</button></div>`;
  Q.i++;
  $('#nx').onclick = () => { clearTimeout(nextTimer); nextQ(); };
  $('#nx').focus();
  playClip(c.vid, c.s, c.e);
  if (ok) nextTimer = setTimeout(nextQ, Math.min(c.e - c.s, 6) * 1000 + 1200);
}

function endSession() {
  stopClip(); if (player && player.pauseVideo) player.pauseVideo();
  const acc = Q.good / Math.max(1, Q.queue.length - Q.retried.size);
  const stars = acc >= .9 ? 3 : acc >= .6 ? 2 : 1;
  sfx.level(); burst(innerWidth / 2, innerHeight / 2.5, 60);
  $('#quiz').innerHTML = `<div class="qcard summary">
    <div class="stars">${[1, 2, 3].map(i => `<span style="animation-delay:${i * .18}s">${i <= stars ? '⭐' : '☆'}</span>`).join('')}</div>
    <h3>Session complete!</h3>
    <div class="grid">
      <div><b>+${Q.xp}</b>XP</div><div><b>×${Q.best}</b>Best combo</div><div><b>🔥${S.streak}</b>Day streak</div>
    </div>
    <div class="row" style="justify-content:center">
      <button class="btn primary" id="again">Another session</button>
      <button class="btn ghost" id="toWatch">Back to the video</button>
    </div></div>`;
  $('#again').onclick = () => { renderPlayHome(); $('#startBtn').click(); };
  $('#toWatch').onclick = () => switchTab('watch');
  renderStats();
}

/* ============================================================
   navigation + init
   ============================================================ */
function switchTab(t) {
  $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  $$('.tabpane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + t));
  if (t === 'deck') renderDeck();
  if (t === 'play' && (!Q || $('#quiz').classList.contains('hidden'))) renderPlayHome();
  renderStats();
}
$$('.tab').forEach(b => b.onclick = () => switchTab(b.dataset.tab));
$('#muteBtn').onclick = () => { S.mute = !S.mute; save(); renderStats(); };
$('#urlForm').onsubmit = e => { e.preventDefault(); loadUrl($('#urlInput').value); };
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && $('#nx') && document.activeElement === document.body) $('#nx').click();
});

(function init() {
  touchDay(); save();
  renderStats(); renderWatch();
  if (S.cur && S.videos[S.cur]) openVideo(S.cur);
})();
