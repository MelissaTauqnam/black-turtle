// Pools de contenus français réalistes utilisés par db/seed.ts.
// Séparés du script de seed pour garder celui-ci lisible.

export const industries = [
  "SaaS RH",
  "E-commerce",
  "Fintech",
  "Immobilier",
  "Santé",
  "Logistique",
  "Marketing digital",
  "EdTech",
  "Cybersécurité",
  "Industrie",
  "Assurance",
  "Agroalimentaire",
  "Média",
  "Voyage & tourisme",
  "Construction",
];

export const sizeLabels = ["1-10", "11-50", "51-200", "201-500", "500+"];

export const techStackPool = [
  "Salesforce",
  "HubSpot",
  "Slack",
  "Notion",
  "Zendesk",
  "Stripe",
  "Segment",
  "Airtable",
  "Intercom",
  "Zoom",
  "Aircall",
  "Pipedrive",
];

export const jobTitles = [
  "Directeur commercial",
  "Responsable des opérations",
  "Head of Growth",
  "Directrice marketing",
  "CEO",
  "COO",
  "Responsable achats",
  "Chef de projet digital",
  "Directeur financier",
  "Responsable RH",
  "VP Sales",
  "Product Manager",
];

export const pipelineStageDefs = [
  { name: "Nouveau", order: 1, isWon: false, isLost: false },
  { name: "Qualifié", order: 2, isWon: false, isLost: false },
  { name: "Démo planifiée", order: 3, isWon: false, isLost: false },
  { name: "Proposition envoyée", order: 4, isWon: false, isLost: false },
  { name: "Négociation", order: 5, isWon: false, isLost: false },
  { name: "Gagné", order: 6, isWon: true, isLost: false },
  { name: "Perdu", order: 7, isWon: false, isLost: true },
] as const;

export const lostReasons = [
  "Budget insuffisant cette année",
  "Parti chez un concurrent moins cher",
  "Projet reporté en interne",
  "Pas de réponse après plusieurs relances",
  "Fonctionnalité clé manquante (SSO)",
  "Décideur a quitté l'entreprise",
];

export const callSummaries = [
  "Premier appel de découverte. Le prospect cherche à remplacer son outil actuel, jugé trop rigide. Budget non confirmé.",
  "Point d'avancement suite à la démo. Bon accueil des fonctionnalités de reporting, une question reste sur l'intégration avec leur CRM existant.",
  "Appel de relance après silence de deux semaines. Le contact confirme toujours son intérêt mais le projet est ralenti en interne.",
  "Négociation tarifaire. Le client demande une remise sur l'engagement annuel, à valider avec le manager.",
  "Appel de closing. Accord de principe obtenu, envoi du contrat prévu sous 48h.",
  "Appel de suivi client. Adoption correcte du produit, une fonctionnalité avancée reste sous-utilisée.",
  "Appel de qualification BANT. Budget confirmé, décideur identifié, besoin urgent lié à une réorganisation.",
  "Appel technique avec l'équipe IT du prospect. Questions sur la sécurité et l'hébergement des données.",
];

export const meetingSummaries = [
  "Démo produit avec 3 participants côté client. Fort intérêt pour le module de reporting automatisé, objection sur le temps d'implémentation.",
  "Atelier de cadrage des besoins. Les cas d'usage prioritaires sont identifiés, prochaine étape : proposition chiffrée.",
  "Réunion de lancement (kickoff) suite à la signature. Plan d'implémentation validé sur 6 semaines.",
  "Comité de pilotage trimestriel avec le client. Bons indicateurs d'usage, opportunité d'upsell identifiée sur un module complémentaire.",
  "Visio de renégociation du contrat. Le client souhaite ajouter des sièges supplémentaires.",
  "Présentation à un comité de direction élargi. Plusieurs objections sur le ROI, besoin d'un business case chiffré.",
];

export const objections = [
  "le prix par rapport à la concurrence",
  "le temps d'implémentation jugé trop long",
  "l'absence de certification ISO 27001",
  "la dépendance à une intégration technique complexe",
  "le manque de retours clients dans leur secteur",
  "la nécessité de valider en comité de direction",
];

export const competitors = ["HubSpot", "Pipedrive", "Salesforce", "Zoho CRM", "Attio", "Close"];

export const messageSnippets = [
  "Merci pour l'échange, je reviens vers vous avec les infos demandées d'ici vendredi.",
  "Bonjour, avez-vous eu le temps de regarder la proposition envoyée la semaine dernière ?",
  "Petit rappel : la démo est prévue jeudi à 14h, voici le lien de connexion.",
  "Merci pour votre retour, je transmets à notre équipe technique et revient vers vous rapidement.",
  "Je vous partage l'étude de cas dont nous avons parlé, elle devrait répondre à vos questions sur le ROI.",
];

export const noteSnippets = [
  "Décideur final identifié : le CEO doit valider tout contrat > 10K€/an.",
  "Le client a un cycle budgétaire qui se clôture en fin de trimestre, à garder en tête pour le timing.",
  "Attention : le contact principal part en congés 3 semaines à partir de la semaine prochaine.",
  "Concurrent déjà en place (contrat en cours), renouvellement dans 4 mois.",
  "Le prospect a été recommandé par un client existant (Studio Lumen).",
];

export const suggestionTemplates: Array<{
  type: "relance" | "envoi_contenu" | "upsell" | "alerte_churn" | "prise_rdv" | "autre";
  title: string;
  content: string;
  justification: string;
}> = [
  {
    type: "relance",
    title: "Relancer après la démo",
    content: "Envoyer un email de relance récapitulant les points clés de la démo et proposer un prochain rendez-vous.",
    justification: "Aucune activité depuis la démo il y a 6 jours, le momentum risque de retomber.",
  },
  {
    type: "envoi_contenu",
    title: "Envoyer l'étude de cas sur l'implémentation rapide",
    content: "Partager l'étude de cas client qui répond directement à l'objection sur le temps d'implémentation.",
    justification: "Le contact a exprimé une inquiétude sur le délai de mise en place lors du dernier appel.",
  },
  {
    type: "upsell",
    title: "Proposer une extension de licences",
    content: "Contacter le client pour proposer des sièges supplémentaires suite au pic d'usage récent.",
    justification: "L'usage produit a augmenté de 40% ce mois-ci, signal fort d'un besoin d'extension.",
  },
  {
    type: "alerte_churn",
    title: "Alerter sur un risque de désengagement",
    content: "Programmer un appel de suivi : aucune connexion depuis 18 jours et un ticket support récent non résolu.",
    justification: "Baisse d'activité produit combinée à un ticket support ouvert depuis plus d'une semaine.",
  },
  {
    type: "prise_rdv",
    title: "Proposer un rendez-vous de cadrage",
    content: "Envoyer 3 créneaux pour un atelier de cadrage des besoins avec les équipes concernées.",
    justification: "Le prospect a téléchargé le lead magnet et visité deux fois la page tarifs cette semaine.",
  },
  {
    type: "autre",
    title: "Mettre à jour le montant du deal",
    content: "Revoir le montant du deal à la hausse suite à l'ajout de modules mentionné en réunion.",
    justification: "Le client a mentionné vouloir ajouter le module analytics lors du dernier point.",
  },
];

export const sequenceDefs = [
  {
    name: "Onboarding lead magnet — Guide prospection B2B",
    description: "Séquence de nurturing pour les contacts ayant téléchargé le guide de prospection.",
    steps: [
      { type: "email" as const, mode: "auto" as const, delayDays: 0, subject: "Voici votre guide 📘", body: "Bonjour {{prenom}}, merci d'avoir téléchargé notre guide. Le voici en pièce jointe." },
      { type: "wait" as const, mode: "auto" as const, delayDays: 2, subject: null, body: null },
      { type: "email" as const, mode: "auto" as const, delayDays: 0, subject: "Un point sur votre prospection ?", body: "Bonjour {{prenom}}, comment se passe votre prospection en ce moment ? Je peux vous montrer comment {{produit}} peut accélérer vos résultats." },
      { type: "call_task" as const, mode: "draft" as const, delayDays: 3, subject: "Appel de qualification", body: "Appeler {{prenom}} pour qualifier le besoin." },
      { type: "email" as const, mode: "draft" as const, delayDays: 4, subject: "Dernière relance", body: "Bonjour {{prenom}}, je reste disponible si vous souhaitez échanger sur vos enjeux de prospection." },
    ],
  },
  {
    name: "Relance post-démo",
    description: "Séquence courte pour maintenir l'engagement après une démo produit.",
    steps: [
      { type: "email" as const, mode: "auto" as const, delayDays: 0, subject: "Merci pour votre temps aujourd'hui", body: "Bonjour {{prenom}}, merci pour votre temps. Voici le récapitulatif des points abordés." },
      { type: "wait" as const, mode: "auto" as const, delayDays: 3, subject: null, body: null },
      { type: "linkedin_task" as const, mode: "draft" as const, delayDays: 0, subject: "Interagir sur LinkedIn", body: "Commenter une publication récente de {{prenom}} pour rester visible." },
      { type: "email" as const, mode: "draft" as const, delayDays: 3, subject: "Des questions suite à la démo ?", body: "Bonjour {{prenom}}, avez-vous des questions suite à notre échange ?" },
    ],
  },
  {
    name: "Réactivation clients inactifs",
    description: "Séquence pour réengager les clients dont l'usage produit baisse.",
    steps: [
      { type: "email" as const, mode: "draft" as const, delayDays: 0, subject: "On ne vous a pas vu récemment 👋", body: "Bonjour {{prenom}}, nous avons remarqué une baisse d'activité sur {{produit}}, tout va bien de votre côté ?" },
      { type: "call_task" as const, mode: "draft" as const, delayDays: 2, subject: "Appel de réengagement", body: "Comprendre les freins à l'usage et proposer un point d'accompagnement." },
      { type: "wait" as const, mode: "auto" as const, delayDays: 5, subject: null, body: null },
      { type: "email" as const, mode: "draft" as const, delayDays: 0, subject: "Un accompagnement personnalisé ?", body: "Bonjour {{prenom}}, nous pouvons organiser une session avec notre équipe succès client si utile." },
    ],
  },
];

export const leadMagnetDefs = [
  {
    title: "Guide : 10 leviers pour accélérer votre prospection B2B",
    type: "ebook" as const,
    persona: "Directeurs commerciaux PME",
    landingHeadline: "Doublez vos rendez-vous qualifiés en 90 jours",
    landingCopy:
      "Un guide concret de 20 pages avec les leviers utilisés par les meilleures équipes commerciales pour remplir leur pipeline sans exploser leur budget prospection.",
  },
  {
    title: "Checklist : auditer son cycle de vente en 15 points",
    type: "checklist" as const,
    persona: "Managers commerciaux",
    landingHeadline: "Identifiez les fuites dans votre pipeline",
    landingCopy:
      "Une checklist actionnable pour repérer rapidement où vos deals ralentissent et comment y remédier.",
  },
  {
    title: "Webinar : Comment l'IA transforme le suivi commercial",
    type: "webinar" as const,
    persona: "Directions commerciales & RevOps",
    landingHeadline: "45 minutes pour comprendre l'IA appliquée à la vente",
    landingCopy:
      "Un webinar avec retours d'expérience concrets sur l'usage de l'IA pour prioriser les actions commerciales.",
  },
];

export const supportSubjects = [
  "Question sur l'export des données",
  "Bug d'affichage sur le tableau de bord",
  "Demande d'ajout d'un utilisateur",
  "Difficulté à configurer une intégration",
  "Question sur la facturation",
  "Demande de fonctionnalité : filtres avancés",
  "Lenteur constatée sur le chargement des rapports",
  "Question sur les permissions d'accès",
];

export const coachingNotes = [
  "Bonne structure d'appel, mais la prochaine étape n'est pas toujours clairement fixée en fin d'échange.",
  "Excellent ratio d'écoute, continue à creuser les objections avant d'y répondre.",
  "Pense à reformuler le besoin du client avant de présenter la solution.",
  "Bon rythme de relance, attention à varier les canaux (pas uniquement l'email).",
];
