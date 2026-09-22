/* =========================================================
   AutomWatch — mock data
   In production, CLIENTS/SCENARIOS would come from the n8n
   API (per-client instance) and AI_REPORTS from a nightly job
   that re-analyzes each workflow's JSON against:
     - the live status of each node's credentials/connections
     - each node's installed version vs. the n8n nodes registry
     - a web search over the official docs / changelog of every
       third-party API used in the workflow
     - general AI/automation news that could affect the workflow
   ========================================================= */

const CLIENTS = [
  { id: 'c1', name: 'Atelier Rivoli', plan: 'Maintenance Pro', contact: 'contact@atelier-rivoli.fr' },
  { id: 'c2', name: 'NordSea Logistics', plan: 'Maintenance Pro', contact: 'ops@nordsea-log.com' },
  { id: 'c3', name: 'Cabinet Ferrand & Associés', plan: 'Maintenance Essentielle', contact: 'it@ferrand-avocats.fr' },
  { id: 'c4', name: 'Bloom Cosmetics', plan: 'Maintenance Pro', contact: 'tech@bloomcosmetics.com' },
  { id: 'c5', name: 'Studio Kaïra', plan: 'Maintenance Essentielle', contact: 'hello@studiokaira.com' },
  { id: 'c6', name: 'Verger & Co', plan: 'Maintenance Pro', contact: 'dsi@vergerco.fr' },
];

const SCENARIOS = [
  {
    id: 's1', clientId: 'c1', name: 'Synchro commandes Shopify → Facturation',
    status: 'error', lastRun: '2026-09-22T05:58:00', lastRunOk: false,
    errors7d: 14,
    apps: [ { name: 'Shopify', connected: true }, { name: 'QuickBooks', connected: false }, { name: 'Slack', connected: true } ],
    nodes: [ { name: 'HTTP Request', version: '4.2', latest: '4.2', outdated: false }, { name: 'QuickBooks Online', version: '1.0', latest: '1.3', outdated: true } ],
  },
  {
    id: 's2', clientId: 'c1', name: 'Relance paniers abandonnés',
    status: 'ok', lastRun: '2026-09-22T06:00:00', lastRunOk: true,
    errors7d: 0,
    apps: [ { name: 'Shopify', connected: true }, { name: 'Mailchimp', connected: true } ],
    nodes: [ { name: 'Mailchimp', version: '2.1', latest: '2.1', outdated: false } ],
  },
  {
    id: 's3', clientId: 'c2', name: 'Suivi colis transporteurs → Notion',
    status: 'warning', lastRun: '2026-09-22T05:30:00', lastRunOk: true,
    errors7d: 3,
    apps: [ { name: 'DHL API', connected: true }, { name: 'Notion', connected: true }, { name: 'Twilio', connected: true } ],
    nodes: [ { name: 'Notion', version: '2.2', latest: '2.4', outdated: true }, { name: 'Twilio', version: '1.1', latest: '1.1', outdated: false } ],
  },
  {
    id: 's4', clientId: 'c2', name: 'Alerte rupture de stock entrepôt',
    status: 'ok', lastRun: '2026-09-22T06:05:00', lastRunOk: true,
    errors7d: 0,
    apps: [ { name: 'Airtable', connected: true }, { name: 'Slack', connected: true } ],
    nodes: [ { name: 'Airtable', version: '2.1', latest: '2.1', outdated: false } ],
  },
  {
    id: 's5', clientId: 'c3', name: 'Génération contrats depuis formulaire',
    status: 'error', lastRun: '2026-09-22T04:12:00', lastRunOk: false,
    errors7d: 22,
    apps: [ { name: 'Typeform', connected: true }, { name: 'DocuSign', connected: false }, { name: 'Google Drive', connected: true } ],
    nodes: [ { name: 'DocuSign', version: '1.0', latest: '1.2', outdated: true } ],
  },
  {
    id: 's6', clientId: 'c3', name: 'Archivage e-mails clients',
    status: 'ok', lastRun: '2026-09-22T05:45:00', lastRunOk: true,
    errors7d: 1,
    apps: [ { name: 'Gmail', connected: true }, { name: 'Google Drive', connected: true } ],
    nodes: [ { name: 'Gmail', version: '2.1', latest: '2.1', outdated: false } ],
  },
  {
    id: 's7', clientId: 'c4', name: 'Publication produits multi-marketplace',
    status: 'warning', lastRun: '2026-09-22T05:20:00', lastRunOk: true,
    errors7d: 5,
    apps: [ { name: 'Shopify', connected: true }, { name: 'Amazon SP-API', connected: true }, { name: 'Google Sheets', connected: true } ],
    nodes: [ { name: 'Amazon SP-API (Community)', version: '0.9', latest: '1.1', outdated: true }, { name: 'Google Sheets', version: '4.5', latest: '4.5', outdated: false } ],
  },
  {
    id: 's8', clientId: 'c4', name: 'Reporting ventes hebdo',
    status: 'ok', lastRun: '2026-09-21T22:00:00', lastRunOk: true,
    errors7d: 0,
    apps: [ { name: 'Shopify', connected: true }, { name: 'Google Sheets', connected: true }, { name: 'Slack', connected: true } ],
    nodes: [ { name: 'Shopify', version: '4.0', latest: '4.0', outdated: false } ],
  },
  {
    id: 's9', clientId: 'c5', name: 'Onboarding clients (Stripe → CRM)',
    status: 'warning', lastRun: '2026-09-22T06:02:00', lastRunOk: true,
    errors7d: 2,
    apps: [ { name: 'Stripe', connected: true }, { name: 'HubSpot', connected: true } ],
    nodes: [ { name: 'Stripe', version: '1.4', latest: '1.6', outdated: true } ],
  },
  {
    id: 's10', clientId: 'c6', name: 'Import factures fournisseurs (OCR)',
    status: 'error', lastRun: '2026-09-22T03:40:00', lastRunOk: false,
    errors7d: 9,
    apps: [ { name: 'Google Drive', connected: true }, { name: 'OpenAI', connected: true }, { name: 'Pennylane', connected: false } ],
    nodes: [ { name: 'Pennylane (Community)', version: '0.4', latest: '0.6', outdated: true } ],
  },
  {
    id: 's11', clientId: 'c6', name: 'Relance devis en attente',
    status: 'ok', lastRun: '2026-09-22T06:00:00', lastRunOk: true,
    errors7d: 0,
    apps: [ { name: 'Pennylane', connected: false }, { name: 'Gmail', connected: true } ],
    nodes: [ { name: 'Gmail', version: '2.1', latest: '2.1', outdated: false } ],
  },
];

/* AI daily analysis — combines internal scenario diagnostics with a
   simulated web-search pass over API docs / changelogs / AI news. */
const AI_REPORTS = [
  {
    scenarioId: 's1', risk: 'high',
    findings: [
      {
        type: 'connection',
        title: 'Connexion QuickBooks expirée',
        detail: "Le token OAuth QuickBooks a expiré le 21/09. Toutes les exécutions depuis échouent au nœud « Créer facture ».",
        source: 'Logs d\'exécution n8n',
        action: 'Reconnecter le compte QuickBooks dans les identifiants du nœud, puis relancer le scénario en échec.',
      },
      {
        type: 'api_change',
        title: 'Dépréciation annoncée sur l\'API QuickBooks v2',
        detail: "La documentation développeur QuickBooks indique que l'endpoint Invoice v2 utilisé sera retiré le 1er décembre 2026 au profit de v3.",
        source: 'developer.intuit.com/changelog',
        action: 'Prévoir la migration du nœud QuickBooks (actuellement v1.0, dernière v1.3) vers l\'intégration v3 avant la dépréciation.',
      },
    ],
  },
  {
    scenarioId: 's3', risk: 'medium',
    findings: [
      {
        type: 'node_update',
        title: 'Nœud Notion à mettre à jour',
        detail: "La version installée (2.2) ne supporte pas encore les nouvelles propriétés « status » introduites par l'API Notion 2025-09. Risque d'échec silencieux sur les bases utilisant ce type de champ.",
        source: 'community.n8n.io + docs Notion API',
        action: 'Mettre à jour le nœud Notion vers la version 2.4 lors de la prochaine fenêtre de maintenance.',
      },
    ],
  },
  {
    scenarioId: 's5', risk: 'high',
    findings: [
      {
        type: 'connection',
        title: 'App DocuSign déconnectée',
        detail: "Le webhook DocuSign ne répond plus depuis 3 jours (401 Unauthorized). Les contrats générés ne sont plus envoyés à la signature.",
        source: 'Logs d\'exécution n8n',
        action: 'Régénérer la clé d\'intégration DocuSign côté compte client et la remettre dans n8n.',
      },
      {
        type: 'node_update',
        title: 'Nœud DocuSign obsolète',
        detail: "Version 1.0 installée, la 1.2 corrige justement un bug connu d'expiration prématurée des tokens JWT, potentiellement la cause racine.",
        source: 'Changelog n8n-nodes-base',
        action: 'Mettre à jour le nœud DocuSign vers 1.2 en même temps que la reconnexion.',
      },
    ],
  },
  {
    scenarioId: 's7', risk: 'medium',
    findings: [
      {
        type: 'api_change',
        title: 'Changement de quota Amazon SP-API',
        detail: "Amazon a annoncé une baisse du rate-limit sur l'endpoint Listings Items (0.5 req/s au lieu de 1 req/s) à partir d'octobre 2026, ce qui peut provoquer des erreurs 429 sur les gros catalogues.",
        source: 'developer-docs.amazon.com/sp-api/changelog',
        action: 'Ajouter un nœud « Wait » / limiteur de débit avant les appels Listings Items pour rester sous le nouveau quota.',
      },
      {
        type: 'node_update',
        title: 'Nœud communautaire Amazon SP-API en retard',
        detail: "Version 0.9 installée vs 1.1 disponible : la 1.1 ajoute justement la gestion du nouveau rate-limit.",
        source: 'npm — n8n-nodes-amazon-sp-api',
        action: 'Planifier la mise à jour du nœud avant le changement de quota d\'octobre.',
      },
    ],
  },
  {
    scenarioId: 's9', risk: 'low',
    findings: [
      {
        type: 'node_update',
        title: 'Nœud Stripe en retard de version',
        detail: "Version 1.4 installée, la 1.6 ajoute la prise en charge de l'API Stripe 2026-08 (nouveaux statuts d'abonnement). Pas de risque immédiat mais recommandé.",
        source: 'docs.stripe.com/changelog',
        action: 'Mettre à jour lors du prochain cycle de maintenance, sans urgence.',
      },
    ],
  },
  {
    scenarioId: 's10', risk: 'high',
    findings: [
      {
        type: 'connection',
        title: 'App Pennylane déconnectée',
        detail: "L'intégration Pennylane est en erreur d'authentification depuis 2 jours ; les factures OCR ne sont plus poussées en comptabilité.",
        source: 'Logs d\'exécution n8n',
        action: 'Régénérer la clé API Pennylane et vérifier les scopes « invoices:write ».',
      },
      {
        type: 'ai_news',
        title: 'Changement de modèle recommandé pour l\'OCR',
        detail: "OpenAI a annoncé la dépréciation progressive du modèle utilisé pour l'extraction de champs de factures au profit d'un modèle plus récent avec de meilleures performances sur les documents scannés.",
        source: 'openai.com/index — actualités modèles',
        action: 'Tester le nouveau modèle sur un échantillon de factures avant bascule complète.',
      },
    ],
  },
];

const ALERTS = [
  { id: 'a1', scenarioId: 's1', severity: 'error', title: 'Échec d\'exécution — Créer facture QuickBooks', time: '2026-09-22T05:58:00', desc: '401 Unauthorized — le token OAuth a expiré.' },
  { id: 'a2', scenarioId: 's5', severity: 'error', title: 'Webhook DocuSign injoignable', time: '2026-09-22T04:12:00', desc: '401 Unauthorized depuis 3 jours consécutifs.' },
  { id: 'a3', scenarioId: 's10', severity: 'error', title: 'Échec d\'authentification Pennylane', time: '2026-09-22T03:40:00', desc: 'Le scénario n\'a pas pu pousser 6 factures.' },
  { id: 'a4', scenarioId: 's7', severity: 'warning', title: 'Ralentissement API Amazon SP-API', time: '2026-09-21T21:14:00', desc: 'Plusieurs 429 Too Many Requests détectés sur le catalogue.' },
  { id: 'a5', scenarioId: 's3', severity: 'warning', title: 'Champ Notion non reconnu', time: '2026-09-21T18:02:00', desc: 'Une propriété "status" n\'a pas pu être mise à jour sur 4 pages.' },
  { id: 'a6', scenarioId: 's9', severity: 'resolved', title: 'Timeout HubSpot résolu', time: '2026-09-21T09:30:00', desc: 'Incident temporaire côté HubSpot, revenu à la normale.' },
];

const ACTIVITY = [
  { time: '06:14', text: 'Analyse IA quotidienne terminée — <b>11 scénarios</b> analysés, <b>6 recommandations</b> générées.' },
  { time: '05:58', text: 'Erreur détectée sur <b>Synchro commandes Shopify → Facturation</b>.' },
  { time: '04:12', text: 'Erreur détectée sur <b>Génération contrats depuis formulaire</b>.' },
  { time: '00:00', text: 'Sauvegarde nocturne de <b>11 workflows</b> effectuée sur toutes les instances clients.' },
  { time: 'Hier', text: 'Mise à jour manuelle du nœud <b>Airtable</b> effectuée.' },
];

/* ============================= State ============================= */
const state = { search: '', filterClient: '', filterStatus: '', filterUpdatesOnly: false };

const STATUS_LABEL = { ok: 'OK', warning: 'Avertissement', error: 'Erreur' };
const RISK_LABEL = { low: 'Risque faible', medium: 'Risque moyen', high: 'Risque élevé' };
const FINDING_ICON = {
  connection: '&#128268;', api_change: '&#128196;', node_update: '&#8635;', ai_news: '&#129504;',
};

function clientById(id) { return CLIENTS.find(c => c.id === id); }
function scenarioById(id) { return SCENARIOS.find(s => s.id === id); }

function relativeTime(iso) {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'à l\'instant';
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function anonSpan(text) { return `<span class="anon">${text}</span>`; }

/* ============================= Rendering ============================= */

function computeStats() {
  const disconnectedApps = new Set();
  let outdatedNodes = 0;
  SCENARIOS.forEach(s => {
    s.apps.forEach(a => { if (!a.connected) disconnectedApps.add(a.name + s.clientId); });
    s.nodes.forEach(n => { if (n.outdated) outdatedNodes++; });
  });
  const errorScenarios = SCENARIOS.filter(s => s.status === 'error').length;
  const warningScenarios = SCENARIOS.filter(s => s.status === 'warning').length;
  return {
    clients: CLIENTS.length,
    scenarios: SCENARIOS.length,
    errorScenarios, warningScenarios,
    disconnectedApps: disconnectedApps.size,
    outdatedNodes,
    aiFindings: AI_REPORTS.reduce((n, r) => n + r.findings.length, 0),
  };
}

function renderKpis() {
  const s = computeStats();
  const grid = document.getElementById('kpi-grid');
  grid.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-card__label">Clients suivis</div>
      <div class="kpi-card__value">${s.clients}</div>
      <div class="kpi-card__sub">${s.scenarios} scénarios actifs</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card__label">Scénarios en erreur</div>
      <div class="kpi-card__value ${s.errorScenarios ? 'tone-err' : 'tone-ok'}">${s.errorScenarios}</div>
      <div class="kpi-card__sub">${s.warningScenarios} en avertissement</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card__label">Apps déconnectées</div>
      <div class="kpi-card__value ${s.disconnectedApps ? 'tone-err' : 'tone-ok'}">${s.disconnectedApps}</div>
      <div class="kpi-card__sub">Ré-authentification requise</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card__label">Nœuds à mettre à jour</div>
      <div class="kpi-card__value ${s.outdatedNodes ? 'tone-warn' : 'tone-ok'}">${s.outdatedNodes}</div>
      <div class="kpi-card__sub">Versions en retard détectées</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card__label">Recommandations IA</div>
      <div class="kpi-card__value tone-accent">${s.aiFindings}</div>
      <div class="kpi-card__sub">Générées ce matin</div>
    </div>
  `;

  const navAlert = document.getElementById('nav-alert-count');
  navAlert.textContent = s.errorScenarios + s.warningScenarios;
  const navAi = document.getElementById('nav-ai-count');
  navAi.textContent = s.aiFindings;

  const pill = document.getElementById('health-pill');
  if (s.errorScenarios > 0) {
    pill.innerHTML = `<span class="dot dot--error"></span> ${s.errorScenarios} scénario(s) en erreur`;
  } else if (s.warningScenarios > 0) {
    pill.innerHTML = `<span class="dot dot--warning"></span> ${s.warningScenarios} avertissement(s)`;
  } else {
    pill.innerHTML = `<span class="dot dot--ok"></span> Parc en bonne santé`;
  }
}

function renderPriorityList() {
  const items = [];
  SCENARIOS.filter(s => s.status !== 'ok').forEach(s => {
    const client = clientById(s.clientId);
    items.push({
      severity: s.status, title: s.name,
      metaHtml: `${anonSpan(client.name)} · ${s.errors7d} erreur(s) sur 7 jours`,
      onClick: () => openScenarioDrawer(s.id),
    });
  });
  const list = document.getElementById('priority-list');
  const order = { error: 0, warning: 1 };
  items.sort((a, b) => order[a.severity] - order[b.severity]);
  if (!items.length) {
    list.innerHTML = `<div class="cell-sub">Aucune priorité — tous les scénarios sont sains.</div>`;
    return;
  }
  list.innerHTML = items.map(it => `
    <div class="priority-item" data-action="priority-${items.indexOf(it)}">
      <span class="priority-item__badge badge badge--${it.severity}">${STATUS_LABEL[it.severity]}</span>
      <div class="priority-item__body">
        <div class="priority-item__title">${it.title}</div>
        <div class="priority-item__meta">${it.metaHtml}</div>
      </div>
    </div>
  `).join('');
  [...list.children].forEach((el, i) => el.addEventListener('click', items[i].onClick));
}

function renderClientHealth() {
  const list = document.getElementById('client-health-list');
  const rows = CLIENTS.map(c => {
    const scs = SCENARIOS.filter(s => s.clientId === c.id);
    const total = scs.length || 1;
    const bad = scs.filter(s => s.status !== 'ok').length;
    const score = Math.round(((total - bad) / total) * 100);
    const color = score >= 90 ? 'var(--ok)' : score >= 60 ? 'var(--warn)' : 'var(--err)';
    return { name: c.name, score, color };
  }).sort((a, b) => a.score - b.score);
  list.innerHTML = rows.map(r => `
    <div class="client-health-row">
      <div class="client-health-row__name anon">${r.name}</div>
      <div class="client-health-row__bar"><div class="client-health-row__fill" style="width:${r.score}%;background:${r.color}"></div></div>
      <div class="client-health-row__score">${r.score}%</div>
    </div>
  `).join('');
}

function renderActivity() {
  document.getElementById('activity-feed').innerHTML = ACTIVITY.map(a => `
    <div class="activity-row">
      <div class="activity-row__time">${a.time}</div>
      <div class="activity-row__text">${a.text}</div>
    </div>
  `).join('');
}

function matchesFilters(s) {
  const client = clientById(s.clientId);
  if (state.filterClient && s.clientId !== state.filterClient) return false;
  if (state.filterStatus && s.status !== state.filterStatus) return false;
  if (state.filterUpdatesOnly && !s.nodes.some(n => n.outdated)) return false;
  if (state.search) {
    const q = state.search.toLowerCase();
    const hay = `${s.name} ${client.name} ${s.apps.map(a => a.name).join(' ')}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderScenariosTable() {
  const tbody = document.getElementById('scenarios-tbody');
  const rows = SCENARIOS.filter(matchesFilters);
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-dim" style="padding:24px 16px;">Aucun scénario ne correspond à ces filtres.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(s => {
    const client = clientById(s.clientId);
    const outdated = s.nodes.filter(n => n.outdated).length;
    return `
    <tr data-id="${s.id}">
      <td><span class="badge badge--${s.status}">${STATUS_LABEL[s.status]}</span></td>
      <td>
        <div class="cell-primary">${s.name}</div>
      </td>
      <td class="anon">${client.name}</td>
      <td>
        <div class="app-dots">
          ${s.apps.map(a => `<span class="app-dot app-dot--${a.connected ? 'connected' : 'disconnected'}" title="${a.name} — ${a.connected ? 'connectée' : 'déconnectée'}"></span>`).join('')}
        </div>
      </td>
      <td>${outdated ? `<span class="text-warn">${outdated}</span>` : `<span class="text-dim">0</span>`}</td>
      <td class="mono text-dim">${fmtTime(s.lastRun)}</td>
      <td>${s.errors7d ? `<span class="text-err">${s.errors7d}</span>` : `<span class="text-dim">0</span>`}</td>
      <td class="chevron">›</td>
    </tr>
  `;
  }).join('');
  [...tbody.querySelectorAll('tr[data-id]')].forEach(tr => {
    tr.addEventListener('click', () => openScenarioDrawer(tr.dataset.id));
  });
}

function populateClientFilter() {
  const sel = document.getElementById('filter-client');
  sel.innerHTML = `<option value="">Tous les clients</option>` +
    CLIENTS.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function renderClientsGrid() {
  const grid = document.getElementById('clients-grid');
  grid.innerHTML = CLIENTS.map(c => {
    const scs = SCENARIOS.filter(s => s.clientId === c.id);
    const errors = scs.filter(s => s.status === 'error').length;
    const warnings = scs.filter(s => s.status === 'warning').length;
    return `
    <div class="client-card" data-id="${c.id}">
      <div class="client-card__head">
        <div>
          <div class="client-card__name anon">${c.name}</div>
          <div class="client-card__plan">${c.plan}</div>
        </div>
        ${errors ? `<span class="badge badge--error">${errors} erreur(s)</span>` : warnings ? `<span class="badge badge--warning">${warnings} alerte(s)</span>` : `<span class="badge badge--ok">Sain</span>`}
      </div>
      <div class="client-card__stats">
        <div><div class="client-card__stat-value">${scs.length}</div><div class="client-card__stat-label">Scénarios</div></div>
        <div><div class="client-card__stat-value">${scs.reduce((n, s) => n + s.errors7d, 0)}</div><div class="client-card__stat-label">Erreurs / 7j</div></div>
        <div><div class="client-card__stat-value">${scs.reduce((n, s) => n + s.nodes.filter(x => x.outdated).length, 0)}</div><div class="client-card__stat-label">MAJ nœuds</div></div>
      </div>
    </div>
  `;
  }).join('');
  [...grid.querySelectorAll('.client-card')].forEach(el => {
    el.addEventListener('click', () => openClientDrawer(el.dataset.id));
  });
}

function renderAlerts() {
  const el = document.getElementById('alerts-timeline');
  el.innerHTML = ALERTS.map(a => {
    const s = scenarioById(a.scenarioId);
    const client = clientById(s.clientId);
    const cls = a.severity === 'resolved' ? 'is-resolved' : a.severity === 'warning' ? 'is-warning' : '';
    const icon = a.severity === 'resolved' ? '&#10003;' : a.severity === 'warning' ? '&#9888;' : '&#10071;';
    return `
    <div class="timeline-item ${cls}" data-scenario="${a.scenarioId}">
      <div class="timeline-item__icon">${icon}</div>
      <div class="timeline-item__body">
        <div class="timeline-item__top">
          <span class="timeline-item__title">${a.title}</span>
          <span class="timeline-item__time">${fmtTime(a.time)}</span>
        </div>
        <div class="timeline-item__desc"><span class="anon">${client.name}</span> · ${s.name} — ${a.desc}</div>
      </div>
    </div>
  `;
  }).join('');
  [...el.querySelectorAll('.timeline-item')].forEach(item => {
    item.addEventListener('click', () => openScenarioDrawer(item.dataset.scenario));
  });
}

function renderAiSummary() {
  const byRisk = { high: 0, medium: 0, low: 0 };
  AI_REPORTS.forEach(r => byRisk[r.risk]++);
  const totalFindings = AI_REPORTS.reduce((n, r) => n + r.findings.length, 0);
  const bar = document.getElementById('ai-summary-bar');
  bar.innerHTML = `
    <div class="ai-summary-card">
      <div class="ai-summary-card__icon badge--error" style="background:var(--err-soft);color:var(--err)">&#9888;</div>
      <div><div class="ai-summary-card__value">${byRisk.high}</div><div class="ai-summary-card__label">Scénarios à risque élevé</div></div>
    </div>
    <div class="ai-summary-card">
      <div class="ai-summary-card__icon" style="background:var(--warn-soft);color:var(--warn)">&#9888;</div>
      <div><div class="ai-summary-card__value">${byRisk.medium}</div><div class="ai-summary-card__label">Risque moyen</div></div>
    </div>
    <div class="ai-summary-card">
      <div class="ai-summary-card__icon" style="background:var(--ok-soft);color:var(--ok)">&#9679;</div>
      <div><div class="ai-summary-card__value">${byRisk.low}</div><div class="ai-summary-card__label">Risque faible</div></div>
    </div>
    <div class="ai-summary-card">
      <div class="ai-summary-card__icon" style="background:var(--accent-soft);color:var(--accent)">&#128269;</div>
      <div><div class="ai-summary-card__value">${totalFindings}</div><div class="ai-summary-card__label">Recommandations totales</div></div>
    </div>
  `;
}

function renderAiReports() {
  const list = document.getElementById('ai-report-list');
  const order = { high: 0, medium: 1, low: 2 };
  const reports = [...AI_REPORTS].sort((a, b) => order[a.risk] - order[b.risk]);
  list.innerHTML = reports.map(r => {
    const s = scenarioById(r.scenarioId);
    const client = clientById(s.clientId);
    return `
    <div class="ai-card">
      <div class="ai-card__head">
        <div>
          <div class="ai-card__scenario">${s.name}</div>
          <div class="ai-card__client anon">${client.name}</div>
        </div>
        <span class="ai-card__risk badge badge--${r.risk === 'high' ? 'error' : r.risk === 'medium' ? 'warning' : 'ok'}">${RISK_LABEL[r.risk]}</span>
      </div>
      <div class="ai-card__body">
        ${r.findings.map(f => `
          <div class="ai-finding">
            <div class="ai-finding__icon" style="background:var(--accent-soft)">${FINDING_ICON[f.type] || '&#8226;'}</div>
            <div style="flex:1;min-width:0;">
              <div class="ai-finding__title">${f.title}</div>
              <div class="ai-finding__detail">${f.detail}</div>
              <div class="ai-finding__meta"><span class="ai-finding__source">${f.source}</span></div>
              <div class="ai-finding__action"><b>Action suggérée —</b> ${f.action}</div>
            </div>
          </div>
        `).join('')}
        <div class="ai-finding-actions">
          <button class="btn btn--ghost btn--sm" data-ignore>Ignorer</button>
          <button class="btn btn--primary btn--sm" data-treated>Marquer comme traité</button>
        </div>
      </div>
    </div>
  `;
  }).join('');

  [...list.querySelectorAll('[data-treated]')].forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.ai-card');
      card.style.opacity = '.45';
      card.style.pointerEvents = 'none';
      showToast('Recommandation marquée comme traitée.');
    });
  });
  [...list.querySelectorAll('[data-ignore]')].forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.ai-card');
      card.remove();
      showToast('Recommandation ignorée.');
    });
  });
}

/* ============================= Drawer ============================= */

function openScenarioDrawer(id) {
  const s = scenarioById(id);
  const client = clientById(s.clientId);
  document.getElementById('drawer-title').textContent = s.name;
  document.getElementById('drawer-body').innerHTML = `
    <div class="drawer-section">
      <h4>Résumé</h4>
      <div class="drawer-row"><span>Client</span><span class="anon">${client.name}</span></div>
      <div class="drawer-row"><span>Statut</span><span class="badge badge--${s.status}">${STATUS_LABEL[s.status]}</span></div>
      <div class="drawer-row"><span>Dernière exécution</span><span class="mono">${fmtTime(s.lastRun)}</span></div>
      <div class="drawer-row"><span>Erreurs (7 jours)</span><span>${s.errors7d}</span></div>
    </div>
    <div class="drawer-section">
      <h4>Apps connectées</h4>
      ${s.apps.map(a => `<div class="drawer-row"><span>${a.name}</span><span class="badge ${a.connected ? 'badge--ok' : 'badge--error'}">${a.connected ? 'Connectée' : 'Déconnectée'}</span></div>`).join('')}
    </div>
    <div class="drawer-section">
      <h4>Nœuds</h4>
      ${s.nodes.map(n => `<div class="drawer-row"><span>${n.name}</span><span class="${n.outdated ? 'text-warn' : 'text-dim'} mono">v${n.version}${n.outdated ? ` → v${n.latest}` : ' (à jour)'}</span></div>`).join('')}
    </div>
    ${AI_REPORTS.some(r => r.scenarioId === id) ? `
    <div class="drawer-section">
      <h4>Recommandations IA</h4>
      ${AI_REPORTS.find(r => r.scenarioId === id).findings.map(f => `<div class="ai-finding__action" style="margin-bottom:8px;"><b>${f.title} —</b> ${f.action}</div>`).join('')}
    </div>` : ''}
  `;
  openDrawer();
}

function openClientDrawer(id) {
  const c = clientById(id);
  const scs = SCENARIOS.filter(s => s.clientId === id);
  document.getElementById('drawer-title').innerHTML = `<span class="anon">${c.name}</span>`;
  document.getElementById('drawer-body').innerHTML = `
    <div class="drawer-section">
      <h4>Informations</h4>
      <div class="drawer-row"><span>Contrat</span><span>${c.plan}</span></div>
      <div class="drawer-row"><span>Contact</span><span class="anon">${c.contact}</span></div>
      <div class="drawer-row"><span>Scénarios suivis</span><span>${scs.length}</span></div>
    </div>
    <div class="drawer-section">
      <h4>Scénarios</h4>
      ${scs.map(s => `<div class="drawer-row" style="cursor:pointer" data-open="${s.id}"><span>${s.name}</span><span class="badge badge--${s.status}">${STATUS_LABEL[s.status]}</span></div>`).join('')}
    </div>
  `;
  [...document.querySelectorAll('[data-open]')].forEach(el => {
    el.addEventListener('click', () => openScenarioDrawer(el.dataset.open));
  });
  openDrawer();
}

function openDrawer() {
  document.getElementById('overlay').classList.add('is-active');
  document.getElementById('drawer').classList.add('is-active');
}
function closeDrawer() {
  document.getElementById('overlay').classList.remove('is-active');
  document.getElementById('drawer').classList.remove('is-active');
}

/* ============================= Toast ============================= */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('is-active');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-active'), 2600);
}

/* ============================= View switching ============================= */
function switchView(view) {
  [...document.querySelectorAll('.nav-item')].forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  [...document.querySelectorAll('.view')].forEach(v => v.classList.toggle('is-active', v.id === `view-${view}`));
}

/* ============================= Anonymisation ============================= */
function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

function setAnon(on) {
  document.querySelector('.app').dataset.anon = on ? 'on' : 'off';
  const btn = document.getElementById('anon-toggle');
  btn.classList.toggle('is-on', on);
  btn.querySelector('.icon-toggle__label').textContent = on ? 'Clients anonymisés' : 'Clients visibles';
  btn.querySelector('.icon-toggle__icon').innerHTML = on
    ? '<svg viewBox="0 0 24 24"><path d="M12 6c-5 0-9.27 3.11-11 7.5C2.73 17.89 7 21 12 21s9.27-3.11 11-7.5C21.27 9.11 17 6 12 6zm0 12.5a5 5 0 110-10 5 5 0 010 10zM12 10.5a3 3 0 100 6 3 3 0 000-6z"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M2 4.27l2.28 2.28.46.46A11.8 11.8 0 001 13.5C2.73 17.89 7 21 12 21c1.99 0 3.86-.5 5.49-1.38l.42.42L20.73 22 22 20.73 3.27 3 2 4.27zM12 18.5a5 5 0 01-4.9-6.03l1.55 1.55a3 3 0 003.38 3.38l1.55 1.55A5 5 0 0112 18.5zm.08-9L15 12.42V12a3 3 0 00-3-3l.08-1.5zM12 6c5 0 9.27 3.11 11 7.5a12.02 12.02 0 01-3.15 4.5l-1.42-1.42A9.98 9.98 0 0021 13.5 9.97 9.97 0 0012 8c-.6 0-1.19.05-1.76.14L8.8 6.7A12.4 12.4 0 0112 6z"/></svg>';
  safeSet('aw-anon', on ? '1' : '0');
}

/* ============================= Init ============================= */
function renderAll() {
  renderKpis();
  renderPriorityList();
  renderClientHealth();
  renderActivity();
  renderScenariosTable();
  renderClientsGrid();
  renderAlerts();
  renderAiSummary();
  renderAiReports();
}

function init() {
  populateClientFilter();
  renderAll();

  const storedAnon = safeGet('aw-anon');
  setAnon(storedAnon === null ? true : storedAnon === '1');

  [...document.querySelectorAll('.nav-item')].forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('overlay').addEventListener('click', closeDrawer);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);

  document.getElementById('anon-toggle').addEventListener('click', () => {
    const isOn = document.querySelector('.app').dataset.anon === 'on';
    setAnon(!isOn);
  });

  document.getElementById('global-search').addEventListener('input', (e) => {
    state.search = e.target.value.trim();
    renderScenariosTable();
    if (state.search) switchView('scenarios');
  });
  document.getElementById('filter-client').addEventListener('change', (e) => {
    state.filterClient = e.target.value; renderScenariosTable();
  });
  document.getElementById('filter-status').addEventListener('change', (e) => {
    state.filterStatus = e.target.value; renderScenariosTable();
  });
  document.getElementById('filter-updates').addEventListener('change', (e) => {
    state.filterUpdatesOnly = e.target.checked; renderScenariosTable();
  });

  document.getElementById('run-analysis-btn').addEventListener('click', (e) => {
    const btn = e.target;
    btn.disabled = true;
    btn.textContent = 'Analyse en cours…';
    setTimeout(() => {
      const now = new Date();
      document.getElementById('last-analysis-time').textContent =
        `Aujourd'hui à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      btn.disabled = false;
      btn.textContent = 'Lancer une analyse';
      showToast('Analyse IA terminée — aucun nouveau risque critique détecté.');
    }, 1600);
  });
}

document.addEventListener('DOMContentLoaded', init);
