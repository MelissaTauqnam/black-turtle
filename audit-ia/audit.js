/* Audit IA sur mesure : questionnaire, calculs, rapport et prise de rendez-vous. */
(function () {
  'use strict';

  /* =====================================================================
     RÉGLAGES (à ajuster) : tarifs indicatifs et lien de rendez-vous
     ===================================================================== */
  const CALENDLY = 'https://calendly.com/melissa-tauqnam/audit-ia-sur-mesure';
  // Mise en place (une fois) et coût de fonctionnement mensuel par workflow, selon la complexité.
  const PRICING = {
    1: { setup: 900, run: 15, label: 'Simple', delay: '~ 1 semaine' },
    2: { setup: 1900, run: 35, label: 'Intermédiaire', delay: '2 à 3 semaines' },
    3: { setup: 3800, run: 70, label: 'Avancé', delay: '4 à 6 semaines' }
  };
  const START_MONTH = { 1: 1, 2: 2, 3: 4 };   // mois de mise en service selon la complexité
  const WEEKS = 45;                          // semaines travaillées par an
  const FTE_HOURS = 1607;                    // durée légale annuelle d'un temps plein (France)
  const PRUDENT = 0.7;                       // réduction du taux d'automatisation en hypothèse prudente

  /* ===================================================================== */
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  const eur = v => nf.format(Math.round(v)) + ' €';
  const keur = v => Math.abs(v) >= 10000 ? (Math.round(v / 100) / 10).toLocaleString('fr-FR') + ' k€' : eur(v);
  const hrs = m => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h ? h + ' h' + (r ? ' ' + String(r).padStart(2, '0') : '') : r + ' min'; };

  /* ---------------------------------------------------------------- données */
  const TAILLES = ['1 à 5', '6 à 20', '21 à 50', '51 à 200', 'Plus de 200'];
  const TOOLS = [
    { g: 'Messagerie et bureautique', items: [['google', 'Google Workspace (Gmail, Drive)'], ['ms', 'Microsoft 365 (Outlook, Teams)']] },
    { g: 'Tableurs', items: [['gsheets', 'Google Sheets'], ['excel', 'Excel']] },
    { g: 'CRM / suivi client', items: [['hubspot', 'HubSpot'], ['salesforce', 'Salesforce'], ['pipedrive', 'Pipedrive'], ['autrecrm', 'Autre CRM'], ['nocrm', 'Pas de CRM']] },
    { g: 'Communication interne', items: [['slack', 'Slack'], ['teams', 'Teams'], ['whatsapp', 'WhatsApp']] },
    { g: 'Facturation / comptabilité', items: [['pennylane', 'Pennylane'], ['sellsy', 'Sellsy'], ['quickbooks', 'QuickBooks'], ['autrefact', 'Autre outil']] },
    { g: 'Autres', items: [['notion', 'Notion'], ['shop', 'Shopify / WooCommerce'], ['site', 'Site web avec formulaire'], ['erp', 'ERP / logiciel métier'], ['autre', 'Autre']] }
  ];
  const TOOL_NAMES = Object.fromEntries(TOOLS.flatMap(g => g.items));
  const DEPTS = ['Commercial', 'Administratif et finance', 'Service client', 'Marketing', 'RH et opérations'];
  // k : T déclencheur, I intelligence artificielle, A action, H validation humaine
  const TASKS = [
    { id: 'leads', d: 0, l: 'Qualifier et répartir les demandes entrantes', ex: 'Lire chaque demande, juger si elle est sérieuse, la transmettre au bon commercial.', m: 180, a: .70, cx: 2,
      s: [['T', '{site} ou {mail}'], ['I', 'L\'IA qualifie et note'], ['A', '{crm} : fiche créée'], ['A', '{chat} : alerte au commercial']] },
    { id: 'crm', d: 0, l: 'Mettre à jour le CRM après chaque échange', ex: 'Recopier coordonnées, comptes-rendus d\'appel et prochaines actions.', m: 150, a: .75, cx: 1,
      s: [['T', 'Email ou rendez-vous ({mail})'], ['I', 'L\'IA extrait les infos clés'], ['A', '{crm} mis à jour']] },
    { id: 'devis', d: 0, l: 'Préparer devis et propositions commerciales', ex: 'Repartir d\'un ancien devis, adapter les lignes, mettre en forme, envoyer.', m: 240, a: .50, cx: 2,
      s: [['T', 'Demande de devis'], ['I', 'L\'IA prépare le brouillon'], ['A', 'Devis PDF généré'], ['H', 'Vous validez'], ['A', 'Envoi par {mail}']] },
    { id: 'relpro', d: 0, l: 'Relancer les prospects sans réponse', ex: 'Retrouver qui relancer, écrire un message personnalisé, noter la relance.', m: 120, a: .80, cx: 1,
      s: [['T', 'Chaque matin'], ['A', '{crm} : sans réponse depuis 7 jours'], ['I', 'L\'IA personnalise la relance'], ['A', 'Envoi par {mail}']] },
    { id: 'factf', d: 1, l: 'Saisir et classer les factures fournisseurs', ex: 'Télécharger les PDF reçus par email, saisir montants et dates, les ranger.', m: 180, a: .80, cx: 2,
      s: [['T', 'Facture reçue dans {mail}'], ['I', 'L\'IA lit le PDF'], ['A', '{compta} : saisie'], ['A', '{docs} : classement']] },
    { id: 'impayes', d: 1, l: 'Relancer les factures impayées', ex: 'Vérifier les échéances, envoyer des relances de plus en plus fermes.', m: 120, a: .85, cx: 1,
      s: [['T', 'Chaque lundi'], ['A', '{compta} : factures échues'], ['A', 'Relance graduée par {mail}'], ['A', '{chat} : alerte à J+30']] },
    { id: 'report', d: 1, l: 'Compiler reportings et tableaux de bord', ex: 'Exporter les chiffres de plusieurs outils, les assembler, les commenter.', m: 180, a: .75, cx: 2,
      s: [['T', 'Chaque lundi à 8 h'], ['A', 'Chiffres {crm}, {compta}, {tab}'], ['I', 'L\'IA rédige le commentaire'], ['A', 'Rapport envoyé par {mail}']] },
    { id: 'ressaisie', d: 1, l: 'Ressaisir des données d\'un outil à l\'autre', ex: 'Copier-coller commandes, contacts ou lignes entre deux logiciels.', m: 240, a: .85, cx: 1,
      s: [['T', 'Nouvel enregistrement'], ['A', 'Mise au bon format'], ['A', 'Ajout dans {tab}']] },
    { id: 'faq', d: 2, l: 'Répondre aux questions clients récurrentes', ex: 'Horaires, délais, tarifs, suivi : toujours les mêmes réponses.', m: 300, a: .60, cx: 2,
      s: [['T', 'Message client ({mail} ou chat du site)'], ['I', 'L\'IA répond avec votre base de connaissances'], ['H', 'Cas complexe : transmis à un humain']] },
    { id: 'trimail', d: 2, l: 'Trier et dispatcher les emails entrants', ex: 'Lire chaque email pour savoir qui doit s\'en occuper.', m: 180, a: .70, cx: 1,
      s: [['T', 'Nouvel email dans {mail}'], ['I', 'L\'IA classe et résume'], ['A', 'Transfert au bon service'], ['A', '{chat} : notification']] },
    { id: 'cmd', d: 2, l: 'Informer les clients sur leurs commandes', ex: 'Répondre à « où en est ma commande ? », prévenir des retards.', m: 120, a: .80, cx: 1,
      s: [['T', 'Commande mise à jour ({shop})'], ['A', 'Email ou SMS automatique'], ['A', 'Suivi à jour dans {tab}']] },
    { id: 'contenus', d: 3, l: 'Rédiger posts, newsletters et contenus', ex: 'Trouver l\'idée, écrire, adapter à chaque réseau.', m: 240, a: .50, cx: 2,
      s: [['T', 'Idée ajoutée dans {tab}'], ['I', 'L\'IA rédige les déclinaisons'], ['H', 'Vous validez'], ['A', 'Publication programmée']] },
    { id: 'veille', d: 3, l: 'Faire la veille concurrentielle et sectorielle', ex: 'Parcourir sites, newsletters et réseaux pour repérer ce qui compte.', m: 120, a: .75, cx: 1,
      s: [['T', 'Chaque matin'], ['A', 'Lecture des sources (sites, flux)'], ['I', 'L\'IA résume l\'essentiel'], ['A', 'Synthèse par {mail}']] },
    { id: 'onboard', d: 4, l: 'Accueillir nouveaux clients ou collaborateurs', ex: 'Créer les accès, envoyer les documents, planifier les premières étapes.', m: 180, a: .65, cx: 2,
      s: [['T', 'Contrat signé'], ['A', 'Dossiers et accès créés ({docs})'], ['A', 'Emails de bienvenue'], ['A', 'Tâches assignées']] },
    { id: 'rdv', d: 4, l: 'Planifier rendez-vous et rappels', ex: 'Échanges d\'emails pour trouver un créneau, rappels la veille.', m: 120, a: .80, cx: 1,
      s: [['T', 'Demande de rendez-vous'], ['A', 'Créneau réservé dans {agenda}'], ['A', 'Rappel automatique la veille']] },
    { id: 'docs', d: 4, l: 'Chercher une information dans les documents internes', ex: 'Retrouver une procédure, un contrat, une réponse déjà donnée.', m: 180, a: .50, cx: 3,
      s: [['T', 'Question posée par un collaborateur'], ['I', 'Un agent IA cherche dans {docs}'], ['A', 'Réponse avec la source']] }
  ];
  const OBJ = [['temps', 'Libérer du temps', 'Moins de tâches répétitives pour l\'équipe'], ['erreurs', 'Réduire les erreurs', 'Fini les oublis et les ressaisies'],
    ['clients', 'Répondre plus vite aux clients', 'Délais de réponse et satisfaction'], ['croissance', 'Grandir sans recruter', 'Absorber plus d\'activité à effectif constant']];
  const DELAIS = ['Dès que possible', 'Dans les 3 mois', 'Dans 6 mois ou plus', 'Je me renseigne'];
  const EXP = ['Jamais', 'Un peu (Zapier, Make, macros…)', 'Oui, régulièrement'];

  /* ---------------------------------------------------------------- état */
  const KEY = 'audit-ia-melissa-v1';
  let st = { step: 0, maxStep: 0, prenom: '', email: '', ent: '', secteur: '', taille: '6 à 20', cout: 38, tools: [], tasks: {}, custom: [], obj: 'temps', delai: '', exp: '', ctx: '', done: false, scen: 'realiste' };
  try { const raw = localStorage.getItem(KEY); if (raw) st = Object.assign(st, JSON.parse(raw)); } catch (e) { /* stockage indisponible */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ignoré */ } };

  let toastT;
  function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 3200); }

  /* ---------------------------------------------------------------- outils → noms */
  function names(tools) {
    const has = k => tools.includes(k);
    const crm = ['hubspot', 'salesforce', 'pipedrive'].find(has);
    const fact = ['pennylane', 'sellsy', 'quickbooks'].find(has);
    return {
      mail: has('google') ? 'Gmail' : has('ms') ? 'Outlook' : 'votre messagerie',
      tab: has('gsheets') ? 'Google Sheets' : has('excel') ? 'Excel' : 'un tableur',
      crm: crm ? TOOL_NAMES[crm] : has('autrecrm') ? 'votre CRM' : 'un CRM simple',
      chat: has('slack') ? 'Slack' : has('teams') ? 'Teams' : has('whatsapp') ? 'WhatsApp' : 'notification',
      compta: fact ? TOOL_NAMES[fact] : has('autrefact') ? 'votre outil de facturation' : 'votre facturation',
      shop: has('shop') ? 'Shopify / WooCommerce' : 'votre boutique',
      docs: has('notion') ? 'Notion' : has('google') ? 'Google Drive' : has('ms') ? 'SharePoint' : 'vos documents',
      agenda: has('google') ? 'Google Agenda' : has('ms') ? 'Outlook' : 'l\'agenda',
      site: has('site') ? 'Formulaire du site' : 'Formulaire'
    };
  }
  const fill = (txt, n) => txt.replace(/\{(\w+)\}/g, (_, k) => n[k] || k);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------------------------------------------------------------- calculs */
  function compute(s, scen) {
    const factor = scen === 'prudent' ? PRUDENT : 1;
    const rows = [];
    TASKS.forEach(t => { const v = s.tasks[t.id]; if (v && v.on) rows.push({ id: t.id, l: t.l, d: DEPTS[t.d], a: t.a, cx: t.cx, steps: t.s, pers: v.p, min: v.m }); });
    (s.custom || []).forEach((c, i) => rows.push({ id: 'c' + i, l: c.l, d: 'Autre', a: .5, cx: 2, steps: [['T', 'Déclencheur à définir'], ['I', 'IA ou règles métier'], ['A', 'Action dans vos outils']], pers: c.p, min: c.m, custom: true }));
    rows.forEach(r => {
      r.weekMin = r.pers * r.min;
      r.hYear = r.weekMin / 60 * WEEKS;
      r.rate = Math.min(.95, r.a * factor);
      r.hRec = r.hYear * r.rate;
      r.cost = r.hYear * s.cout;
      r.save = r.hRec * s.cout;
      r.setup = PRICING[r.cx].setup;
      r.run = PRICING[r.cx].run;
      r.netYear = r.save - r.run * 12;
      r.ratio = r.netYear / r.setup;
      r.start = START_MONTH[r.cx];
    });
    rows.sort((x, y) => y.ratio - x.ratio);
    const sum = k => rows.reduce((t, r) => t + r[k], 0);
    const tot = { weekMin: sum('weekMin'), hYear: sum('hYear'), hRec: sum('hRec'), cost: sum('cost'), save: sum('save'), setup: sum('setup'), runM: sum('run') };
    tot.share = tot.hYear ? tot.hRec / tot.hYear : 0;
    tot.fte = tot.hRec / FTE_HOURS;
    // trajectoire mensuelle du gain net cumulé
    const curve = [];
    for (let m = 0; m <= 24; m++) {
      let v = 0;
      rows.forEach(r => { if (m >= r.start - 1) { v -= r.setup; v += Math.max(0, m - (r.start - 1)) * (r.save / 12 - r.run); } });
      curve.push(v);
    }
    tot.curve = curve;
    tot.payback = curve.findIndex((v, m) => m > 0 && v >= 0);
    tot.net12 = curve[12]; tot.net24 = curve[24];
    const invest12 = tot.setup + rows.reduce((t, r) => t + r.run * Math.max(0, 12 - (r.start - 1)), 0);
    tot.roi12 = invest12 ? (tot.net12 / invest12) * 100 : 0;
    return { rows, tot };
  }

  /* ---------------------------------------------------------------- aperçu (hero) */
  (function sample() {
    const demo = { cout: 38, tasks: { leads: { on: 1, p: 1, m: 180 }, crm: { on: 1, p: 3, m: 120 }, impayes: { on: 1, p: 1, m: 120 }, faq: { on: 1, p: 2, m: 240 }, report: { on: 1, p: 1, m: 180 }, trimail: { on: 1, p: 2, m: 120 } }, custom: [] };
    const { rows, tot } = compute(demo, 'realiste');
    $('sampleKpis').innerHTML =
      kpi('Temps perdu', hrs(tot.weekMin), 'par semaine') + kpi('Coût annuel', keur(tot.cost), 'en tâches répétitives') +
      kpi('Récupérable', keur(tot.save), Math.round(tot.hRec) + ' h par an', true) + kpi('Rentabilisé', tot.payback > 0 ? 'mois ' + tot.payback : '—', 'après la mise en place');
    $('sampleFlow').innerHTML = flowHTML(rows[0].steps, names(['google', 'hubspot', 'slack']));
  })();
  function kpi(k, v, s, hl) { return '<div class="kpi' + (hl ? ' hl' : '') + '"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span><span class="s">' + esc(s) + '</span></div>'; }
  function flowHTML(steps, n) {
    return steps.map((s, i) => (i ? '<span class="arrow" aria-hidden="true">→</span>' : '') + '<span class="step-chip k-' + s[0] + '">' + esc(cap(fill(s[1], n))) + '</span>').join('');
  }

  /* ---------------------------------------------------------------- étape 1 */
  ['q-prenom', 'q-email', 'q-ent', 'q-secteur', 'q-ctx'].forEach(id => {
    const k = id.slice(2); const el = $(id); el.value = st[k] || '';
    el.addEventListener('input', () => { st[k] = el.value; save(); });
  });
  function radioChips(container, options, key, cls) {
    const el = $(container);
    el.innerHTML = options.map(o => {
      const val = Array.isArray(o) ? o[0] : o;
      const inner = Array.isArray(o) ? '<b>' + esc(o[1]) + '</b><small>' + esc(o[2]) + '</small>' : esc(o);
      return '<button type="button" role="radio" class="' + cls + '" data-v="' + esc(val) + '" aria-checked="' + (st[key] === val) + '">' + inner + '</button>';
    }).join('');
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      st[key] = b.dataset.v; save();
      el.querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-checked', x === b));
    });
  }
  radioChips('q-taille', TAILLES, 'taille', 'chip');
  const cout = $('q-cout');
  const setCout = v => { st.cout = Math.max(15, Math.min(150, Math.round(v))); cout.value = st.cout; $('q-cout-v').textContent = st.cout + ' €/h'; save(); updateLive(); };
  cout.addEventListener('input', () => setCout(+cout.value));
  $('q-brut-go').addEventListener('click', () => {
    const b = parseFloat(String($('q-brut').value).replace(/\s/g, '').replace(',', '.'));
    if (!(b > 0)) { toast('Indiquez un salaire brut mensuel, par exemple 2800.'); return; }
    setCout(b * 1.42 / 151.67); toast('Coût horaire mis à jour : ' + st.cout + ' €/h');
  });

  /* ---------------------------------------------------------------- étape 2 */
  $('toolGroups').innerHTML = TOOLS.map(g => '<div class="tool-group"><span class="lbl">' + esc(g.g) + '</span><div class="chips">' +
    g.items.map(([k, l]) => '<button type="button" class="chip" data-tool="' + k + '" aria-pressed="' + st.tools.includes(k) + '">' + esc(l) + '</button>').join('') + '</div></div>').join('');
  $('toolGroups').addEventListener('click', e => {
    const b = e.target.closest('[data-tool]'); if (!b) return;
    const k = b.dataset.tool, i = st.tools.indexOf(k);
    i >= 0 ? st.tools.splice(i, 1) : st.tools.push(k);
    if (k === 'nocrm' && i < 0) st.tools = st.tools.filter(x => !['hubspot', 'salesforce', 'pipedrive', 'autrecrm'].includes(x));
    if (['hubspot', 'salesforce', 'pipedrive', 'autrecrm'].includes(k) && i < 0) st.tools = st.tools.filter(x => x !== 'nocrm');
    document.querySelectorAll('[data-tool]').forEach(x => x.setAttribute('aria-pressed', st.tools.includes(x.dataset.tool)));
    save();
  });

  /* ---------------------------------------------------------------- étape 3 */
  function renderTasks() {
    $('taskList').innerHTML = DEPTS.map((d, di) => '<div class="dept"><h4>' + esc(d) + '</h4>' +
      TASKS.filter(t => t.d === di).map(t => {
        const v = st.tasks[t.id] || { on: 0, p: 1, m: t.m };
        return '<div class="task' + (v.on ? ' on' : '') + '" data-task="' + t.id + '">' +
          '<button type="button" class="task-head" aria-expanded="' + !!v.on + '"><span class="box" aria-hidden="true"></span><span><b>' + esc(t.l) + '</b><small>' + esc(t.ex) + '</small></span><span class="auto">' + Math.round(t.a * 100) + ' % automatisable</span></button>' +
          (v.on ? taskBody(t.id, v) : '') + '</div>';
      }).join('') + '</div>').join('') +
      (st.custom.length ? '<div class="dept"><h4>Vos tâches ajoutées</h4>' + st.custom.map((c, i) =>
        '<div class="task on" data-custom="' + i + '"><div class="task-head" style="cursor:default"><span class="box" aria-hidden="true"></span><span><b>' + esc(c.l) + '</b><small>' + c.p + ' pers. × ' + hrs(c.m) + ' / semaine</small></span><button type="button" class="chip" data-del="' + i + '" style="padding:5px 10px;font-size:12.5px">Retirer</button></div></div>').join('') + '</div>' : '');
  }
  function taskBody(id, v) {
    return '<div class="task-body">' +
      '<div class="field"><label for="p-' + id + '">Personnes concernées</label><div class="stepper"><button type="button" data-step="-1" aria-label="Une personne de moins">−</button><input type="number" id="p-' + id + '" min="1" max="500" value="' + v.p + '" data-pers><button type="button" data-step="1" aria-label="Une personne de plus">+</button></div></div>' +
      '<div class="field"><label for="m-' + id + '">Temps par personne et par semaine</label><div class="range-row"><input type="range" id="m-' + id + '" min="15" max="900" step="15" value="' + v.m + '" data-min><span class="range-val">' + hrs(v.m) + '</span></div></div>' +
      '<p class="task-total">Total : <b>' + hrs(v.p * v.m) + ' par semaine</b>, soit <b>' + nf.format(Math.round(v.p * v.m / 60 * WEEKS)) + ' h par an</b>.</p></div>';
  }
  function refreshTask(card) {
    const id = card.dataset.task, v = st.tasks[id];
    card.querySelector('.range-val').textContent = hrs(v.m);
    card.querySelector('.task-total').innerHTML = 'Total : <b>' + hrs(v.p * v.m) + ' par semaine</b>, soit <b>' + nf.format(Math.round(v.p * v.m / 60 * WEEKS)) + ' h par an</b>.';
    save(); updateLive();
  }
  $('taskList').addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (del) { st.custom.splice(+del.dataset.del, 1); save(); renderTasks(); updateLive(); return; }
    const card = e.target.closest('[data-task]'); if (!card) return;
    const id = card.dataset.task, t = TASKS.find(x => x.id === id);
    if (e.target.closest('.task-head')) {
      const v = st.tasks[id] || { on: 0, p: 1, m: t.m };
      v.on = v.on ? 0 : 1; st.tasks[id] = v; save();
      const fresh = document.createElement('div'); fresh.innerHTML = '';
      card.classList.toggle('on', !!v.on);
      card.querySelector('.task-head').setAttribute('aria-expanded', !!v.on);
      const body = card.querySelector('.task-body');
      if (v.on && !body) card.insertAdjacentHTML('beforeend', taskBody(id, v));
      if (!v.on && body) body.remove();
      updateLive(); return;
    }
    const stp = e.target.closest('[data-step]');
    if (stp) { const v = st.tasks[id]; v.p = Math.max(1, Math.min(500, v.p + +stp.dataset.step)); card.querySelector('[data-pers]').value = v.p; refreshTask(card); }
  });
  $('taskList').addEventListener('input', e => {
    const card = e.target.closest('[data-task]'); if (!card) return;
    const v = st.tasks[card.dataset.task];
    if (e.target.matches('[data-pers]')) v.p = Math.max(1, Math.min(500, parseInt(e.target.value, 10) || 1));
    if (e.target.matches('[data-min]')) v.m = +e.target.value;
    refreshTask(card);
  });
  $('c-add').addEventListener('click', () => {
    const l = $('c-label').value.trim(), p = Math.max(1, parseInt($('c-pers').value, 10) || 1), m = Math.max(15, parseInt($('c-min').value, 10) || 60);
    if (!l) { toast('Donnez un nom à la tâche, par exemple « Préparer les plannings ».'); $('c-label').focus(); return; }
    st.custom.push({ l, p, m }); $('c-label').value = ''; save(); renderTasks(); updateLive();
  });
  renderTasks();

  /* ---------------------------------------------------------------- étape 4 */
  radioChips('q-obj', OBJ, 'obj', 'rcard');
  radioChips('q-delai', DELAIS, 'delai', 'chip');
  radioChips('q-exp', EXP, 'exp', 'chip');

  /* ---------------------------------------------------------------- navigation */
  const panes = [...document.querySelectorAll('.wz-pane')];
  const stepBtns = [...document.querySelectorAll('#wzSteps button')];
  function updateLive() {
    const { tot, rows } = compute(st, st.scen);
    $('liveH').textContent = hrs(tot.weekMin) + ' / sem.';
    $('liveC').textContent = rows.length ? rows.length + ' tâche' + (rows.length > 1 ? 's' : '') + ' · ' + keur(tot.cost) + ' par an' : 'Sélectionnez vos tâches à l\'étape 3.';
    if (st.done) renderReport();
  }
  function go(i, focus) {
    st.step = i; st.maxStep = Math.max(st.maxStep, i); save();
    panes.forEach((p, k) => { p.hidden = k !== i; });
    stepBtns.forEach((b, k) => {
      b.toggleAttribute('aria-current', false); if (k === i) b.setAttribute('aria-current', 'step');
      b.classList.toggle('done', k < st.maxStep || (st.done && k !== i));
      b.disabled = k > st.maxStep && !st.done;
    });
    $('wzBar').style.width = ((i + 1) / 4 * 100) + '%';
    $('wzPrev').disabled = i === 0;
    $('wzNext').textContent = i === 3 ? 'Voir mon rapport →' : 'Suivant →';
    $('wzMsg').textContent = '';
    if (focus) { const t = panes[i].querySelector('h3'); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); $('wizard').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  stepBtns.forEach(b => b.addEventListener('click', () => go(+b.dataset.go, true)));
  $('wzPrev').addEventListener('click', () => go(Math.max(0, st.step - 1), true));
  $('wzNext').addEventListener('click', () => {
    if (st.step === 2 && !compute(st, st.scen).rows.length) { $('wzMsg').textContent = 'Cochez au moins une tâche pour obtenir votre rapport.'; return; }
    if (st.step < 3) { go(st.step + 1, true); return; }
    if (!compute(st, st.scen).rows.length) { go(2, true); $('wzMsg').textContent = 'Cochez au moins une tâche pour obtenir votre rapport.'; return; }
    st.done = true; save(); renderReport();
    stepBtns.forEach(b => { b.disabled = false; b.classList.add('done'); });
    $('report').classList.add('rise');
    document.getElementById('rapport').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------------------------------------------------------------- rapport */
  document.querySelectorAll('[data-scen]').forEach(b => b.addEventListener('click', () => {
    st.scen = b.dataset.scen; save();
    document.querySelectorAll('[data-scen]').forEach(x => x.setAttribute('aria-pressed', x === b));
    renderReport();
  }));
  function renderReport() {
    const { rows, tot } = compute(st, st.scen);
    if (!rows.length) return;
    const n = names(st.tools);
    $('reportEmpty').hidden = true; $('report').hidden = false;
    document.querySelectorAll('[data-scen]').forEach(x => x.setAttribute('aria-pressed', x.dataset.scen === st.scen));
    const d = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    $('rpDate').textContent = 'Rapport d\'audit · ' + d;
    $('rpTitle').textContent = st.ent ? 'Le potentiel d\'automatisation de ' + st.ent : 'Votre potentiel d\'automatisation';
    $('rpSub').textContent = [st.secteur, st.taille ? st.taille + ' personnes' : '', 'coût horaire ' + st.cout + ' €/h', rows.length + ' tâche' + (rows.length > 1 ? 's' : '') + ' analysée' + (rows.length > 1 ? 's' : '')].filter(Boolean).join(' · ');
    $('rpKpis').innerHTML =
      kpi('Temps perdu aujourd\'hui', hrs(tot.weekMin), 'par semaine, soit ' + nf.format(Math.round(tot.hYear)) + ' h par an') +
      kpi('Coût annuel de ces tâches', keur(tot.cost), 'au coût horaire de ' + st.cout + ' €') +
      kpi('Gain annuel potentiel', keur(tot.save), nf.format(Math.round(tot.hRec)) + ' h récupérables par an', true) +
      kpi('Retour sur investissement', tot.payback > 0 ? 'Mois ' + tot.payback : 'Au-delà de 24 mois', tot.payback > 0 ? 'gain net à 12 mois : ' + keur(tot.net12) : 'à affiner ensemble lors de l\'appel');
    $('rpInsight').innerHTML = '<span>Potentiel d\'automatisation : <b>' + Math.round(tot.share * 100) + ' %</b> du temps analysé</span>' +
      '<span>Équivalent libéré : <b>' + (tot.fte >= 0.1 ? tot.fte.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' temps plein' : Math.round(tot.hRec / 7) + ' journées de travail') + '</b> par an</span>' +
      '<span>Soit <b>' + Math.round(tot.hRec / 7) + ' journées</b> rendues à votre équipe</span>';

    // graphique : heures par tâche
    const byH = rows.slice().sort((a, b) => b.hYear - a.hYear);
    const max = byH[0].hYear || 1;
    $('chartBars').innerHTML = byH.map(r => {
      const w1 = r.hRec / max * 100, w2 = (r.hYear - r.hRec) / max * 100;
      return '<div class="hrow"><div class="lab">' + esc(r.l) + '<small>' + esc(r.d) + '</small></div>' +
        '<div class="track hit" tabindex="0" data-tt="' + esc(r.id) + '"><div class="segs" style="width:' + (w1 + w2) + '%"><i class="s1" style="flex:' + r.hRec + '"></i><i class="s2" style="flex:' + (r.hYear - r.hRec) + '"></i></div>' +
        '<span class="val"><b>' + nf.format(Math.round(r.hRec)) + ' h</b> / ' + nf.format(Math.round(r.hYear)) + ' h</span></div></div>';
    }).join('');
    $('chartBars').querySelectorAll('[data-tt]').forEach(el => {
      const r = rows.find(x => x.id === el.dataset.tt);
      const html = '<b>' + esc(r.l) + '</b><div class="row"><span><i style="background:var(--pink)"></i>Récupérable</span><span>' + nf.format(Math.round(r.hRec)) + ' h · ' + eur(r.save) + '</span></div>' +
        '<div class="row"><span><i style="background:#4A3E63"></i>Reste humain</span><span>' + nf.format(Math.round(r.hYear - r.hRec)) + ' h</span></div>' +
        '<div class="row"><span>Taux appliqué</span><span>' + Math.round(r.rate * 100) + ' %</span></div>';
      bindTip(el, () => html);
    });
    $('tableBars').innerHTML = '<table class="data"><thead><tr><th>Tâche</th><th>H / an</th><th>Récupérable</th><th>Coût actuel</th><th>Gain / an</th></tr></thead><tbody>' +
      byH.map(r => '<tr><td>' + esc(r.l) + '</td><td>' + nf.format(Math.round(r.hYear)) + '</td><td>' + nf.format(Math.round(r.hRec)) + ' h</td><td>' + eur(r.cost) + '</td><td>' + eur(r.save) + '</td></tr>').join('') +
      '<tr><td><b>Total</b></td><td><b>' + nf.format(Math.round(tot.hYear)) + '</b></td><td><b>' + nf.format(Math.round(tot.hRec)) + ' h</b></td><td><b>' + eur(tot.cost) + '</b></td><td><b>' + eur(tot.save) + '</b></td></tr></tbody></table>';

    // workflows proposés
    const tier = r => r.cx === 1 && r.ratio > 0.8 ? ['b1', 'Gain rapide'] : r.cx === 3 ? ['b3', 'Projet avancé'] : ['b2', 'Projet structurant'];
    $('wfList').innerHTML = rows.map((r, i) => {
      const t = tier(r);
      return '<article class="wf"><div><div class="wf-top"><span class="mono" style="font-size:12px;color:var(--faint)">#' + (i + 1) + '</span><span class="badge ' + t[0] + '">' + t[1] + '</span><span class="fine">' + esc(PRICING[r.cx].label) + ' · mise en place ' + esc(PRICING[r.cx].delay) + '</span></div>' +
        '<h3 style="margin-top:8px">' + esc(r.l) + '</h3><div class="mini-flow">' + flowHTML(r.steps, n) + '</div></div>' +
        '<div class="wf-stats"><span class="k">Heures / an</span><span class="k">Gain / an</span><span class="k">Automatisable</span>' +
        '<span class="v">' + nf.format(Math.round(r.hRec)) + ' h</span><span class="v">' + keur(r.save) + '</span><span class="v">' + Math.round(r.rate * 100) + ' %</span></div></article>';
    }).join('');

    // feuille de route
    const ph = [[1, 'Mois 1', 'Gains rapides'], [2, 'Mois 2 et 3', 'Projets structurants'], [3, 'À partir du mois 4', 'Projets avancés']];
    $('roadmap').innerHTML = ph.map(([cx, when, title]) => {
      const list = rows.filter(r => r.cx === cx);
      return '<div class="phase"><span class="when">' + when + '</span><h3 style="font-size:17px">' + title + '</h3>' +
        (list.length ? '<ul>' + list.map(r => '<li><b>' + esc(r.l) + '</b> · ' + keur(r.save) + ' / an</li>').join('') + '</ul>' : '<p class="empty">Rien à prévoir dans cette phase.</p>') + '</div>';
    }).join('');

    // ROI
    $('roiSide').innerHTML =
      '<div class="roi-line"><span>Mise en place (une fois)</span><b>' + eur(tot.setup) + '</b></div>' +
      '<div class="roi-line"><span>Fonctionnement (hébergement, IA)</span><b>' + eur(tot.runM) + ' / mois</b></div>' +
      '<div class="roi-line"><span>Gain brut annuel</span><b>' + eur(tot.save) + '</b></div>' +
      '<div class="roi-line total"><span>Gain net à 12 mois</span><b>' + eur(tot.net12) + '</b></div>' +
      '<div class="roi-line total"><span>Gain net à 24 mois</span><b>' + eur(tot.net24) + '</b></div>' +
      '<div class="roi-line"><span>ROI à 12 mois</span><b>' + (tot.roi12 >= 0 ? '+' : '') + Math.round(tot.roi12) + ' %</b></div>' +
      '<p class="fine">Montants indicatifs, hors taxes. Le budget réel est établi ensemble pendant l\'appel.</p>';
    drawRoi(tot);

    // rendez-vous
    const pre = st.prenom ? st.prenom + ', ' : '';
    $('rdvEyebrow').textContent = 'Votre prochaine étape';
    $('rdvTitle').textContent = pre + 'allons chercher ces ' + keur(tot.save) + ' ensemble';
    $('rdvLede').textContent = 'Votre audit montre ' + nf.format(Math.round(tot.hRec)) + ' heures récupérables par an. En un appel, je vous aide à valider les priorités, à chiffrer précisément le projet et à définir un budget.';
    $('calLink').href = calendlyUrl(rows, tot);
    $('copySum').hidden = false;
    $('calNote').textContent = 'Le résumé de votre audit est pré-rempli dans la prise de rendez-vous : vous pouvez le relire avant d\'envoyer.';
  }

  /* graphique ROI (SVG, une série + seuil de rentabilité) */
  function drawRoi(tot) {
    const W = 640, H = 300, L = 64, R = 20, T = 18, B = 36;
    const vals = tot.curve, minV = Math.min(0, ...vals), maxV = Math.max(0, ...vals);
    const step = niceStep((maxV - minV) / 4);
    const y0 = Math.floor(minV / step) * step, y1 = Math.ceil(maxV / step) * step || step;
    const x = m => L + m / 24 * (W - L - R), y = v => T + (y1 - v) / (y1 - y0) * (H - T - B);
    let g = '';
    for (let v = y0; v <= y1 + 1e-6; v += step) g += '<line class="grid-l" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="ax" x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + esc(keur(v)) + '</text>';
    [0, 6, 12, 18, 24].forEach(m => { g += '<text class="ax" x="' + x(m) + '" y="' + (H - 12) + '" text-anchor="middle">' + (m ? 'M' + m : 'Départ') + '</text>'; });
    const pts = vals.map((v, m) => x(m) + ',' + y(v)).join(' ');
    const area = 'M' + x(0) + ',' + y(0) + ' L' + pts.split(' ').join(' L') + ' L' + x(24) + ',' + y(0) + ' Z';
    let mark = '';
    if (tot.payback > 0) {
      const px = x(tot.payback), py = y(vals[tot.payback]);
      mark = '<line x1="' + px + '" x2="' + px + '" y1="' + T + '" y2="' + (H - B) + '" stroke="#4A3E63" stroke-width="1"/>' +
        '<circle cx="' + px + '" cy="' + py + '" r="5" fill="var(--pink)" stroke="var(--bg-2)" stroke-width="2"/>' +
        '<text x="' + (px + 8) + '" y="' + (T + 12) + '" fill="var(--text)" font-family="Figtree, system-ui, sans-serif" font-size="13" font-weight="700">Rentabilisé au mois ' + tot.payback + '</text>';
    }
    const end = '<circle cx="' + x(24) + '" cy="' + y(vals[24]) + '" r="5" fill="var(--pink)" stroke="var(--bg-2)" stroke-width="2"/>' +
      '<text x="' + (x(24) - 8) + '" y="' + (y(vals[24]) - 12) + '" text-anchor="end" fill="var(--text)" font-family="Figtree, system-ui, sans-serif" font-size="13" font-weight="700">' + esc(keur(vals[24])) + ' à 24 mois</text>';
    $('chartRoi').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gain net cumulé sur 24 mois">' + g +
      '<line class="zero-l" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0) + '" y2="' + y(0) + '"/>' +
      '<text x="' + (W - R) + '" y="' + (y(0) + 16) + '" text-anchor="end" fill="var(--muted)" font-family="Figtree, system-ui, sans-serif" font-size="12">Seuil de rentabilité</text>' +
      '<path d="' + area + '" fill="rgba(240,21,126,.1)"/>' +
      '<polyline points="' + pts + '" fill="none" stroke="var(--pink)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' + mark + end +
      '<line id="roiCross" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--muted)" stroke-width="1" visibility="hidden"/>' +
      '<rect x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - B) + '" fill="transparent" id="roiHit"/></svg>';
    const svg = $('chartRoi').querySelector('svg'), hit = $('roiHit'), cross = $('roiCross');
    const pick = e => {
      const r = svg.getBoundingClientRect(); const sx = (e.clientX - r.left) / r.width * W;
      const m = Math.max(0, Math.min(24, Math.round((sx - L) / (W - L - R) * 24)));
      cross.setAttribute('x1', x(m)); cross.setAttribute('x2', x(m)); cross.setAttribute('visibility', 'visible');
      showTip(e.clientX, e.clientY, '<b>' + (m ? 'Mois ' + m : 'Départ') + '</b><div class="row"><span><i style="background:var(--pink)"></i>Gain net cumulé</span><span>' + eur(vals[m]) + '</span></div>');
    };
    hit.addEventListener('mousemove', pick);
    hit.addEventListener('mouseleave', () => { cross.setAttribute('visibility', 'hidden'); hideTip(); });
  }
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1)))); const f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  }

  /* infobulles */
  const tt = $('tt');
  function showTip(cx, cy, html) {
    tt.innerHTML = html; tt.hidden = false;
    const w = tt.offsetWidth, h = tt.offsetHeight;
    tt.style.left = Math.min(window.innerWidth - w - 12, Math.max(12, cx + 14)) + 'px';
    tt.style.top = Math.max(12, cy - h - 14) + 'px';
  }
  function hideTip() { tt.hidden = true; }
  function bindTip(el, html) {
    el.addEventListener('mousemove', e => showTip(e.clientX, e.clientY, html()));
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('focus', () => { const r = el.getBoundingClientRect(); showTip(r.left + r.width / 2, r.top, html()); });
    el.addEventListener('blur', hideTip);
  }
  window.addEventListener('scroll', hideTip, { passive: true });

  /* ---------------------------------------------------------------- Calendly */
  function summary(rows, tot) {
    const top = rows.slice(0, 3).map(r => '- ' + r.l + ' (' + keur(r.save) + '/an)').join('\n');
    const tools = st.tools.map(k => TOOL_NAMES[k]).join(', ') || 'non précisés';
    const obj = (OBJ.find(o => o[0] === st.obj) || [])[1] || '';
    return ('Audit IA express' + (st.ent ? ' - ' + st.ent : '') + (st.secteur ? ' (' + st.secteur + ')' : '') + '\n' +
      'Équipe : ' + st.taille + ' pers. · Coût horaire : ' + st.cout + ' €/h\n' +
      'Temps perdu : ' + hrs(tot.weekMin) + '/semaine · Coût annuel : ' + keur(tot.cost) + '\n' +
      'Potentiel : ' + nf.format(Math.round(tot.hRec)) + ' h/an récupérables, soit ' + keur(tot.save) + '/an (hypothèse ' + (st.scen === 'prudent' ? 'prudente' : 'réaliste') + ')\n' +
      'Priorités :\n' + top + '\n' +
      'Outils : ' + tools + '\n' +
      (obj ? 'Objectif : ' + obj + '\n' : '') + (st.delai ? 'Délai : ' + st.delai + '\n' : '') + (st.exp ? 'Expérience : ' + st.exp + '\n' : '') +
      (st.ctx ? 'Contexte : ' + st.ctx : '')).slice(0, 1800);
  }
  function calendlyUrl(rows, tot) {
    const p = new URLSearchParams();
    if (st.prenom) p.set('name', st.prenom);
    if (/^\S+@\S+\.\S+$/.test(st.email)) p.set('email', st.email);
    p.set('a1', summary(rows, tot));
    return CALENDLY + '?' + p.toString();
  }
  $('copySum').addEventListener('click', () => {
    const { rows, tot } = compute(st, st.scen);
    const txt = summary(rows, tot);
    const fallback = () => { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } ta.remove(); return ok; };
    const done = ok => toast(ok ? 'Résumé copié : collez-le dans un email ou dans votre prise de rendez-vous.' : 'Copie bloquée par le navigateur.');
    try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(fallback())); } catch (e) { done(fallback()); }
  });

  /* ---------------------------------------------------------------- démarrage */
  setCout(st.cout);
  go(Math.min(st.step, 3), false);
  if (st.done) { stepBtns.forEach(b => { b.disabled = false; b.classList.add('done'); }); renderReport(); }
  updateLive();
})();
