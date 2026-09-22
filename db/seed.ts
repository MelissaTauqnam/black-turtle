import { config } from "dotenv";

config({ path: ".env.local" });

import { fakerFR as faker } from "@faker-js/faker";
import { eq, sql } from "drizzle-orm";

import {
  callSummaries,
  coachingNotes,
  competitors,
  industries,
  jobTitles,
  leadMagnetDefs,
  lostReasons,
  meetingSummaries,
  messageSnippets,
  noteSnippets,
  objections,
  pipelineStageDefs,
  sequenceDefs,
  sizeLabels,
  suggestionTemplates,
  supportSubjects,
  techStackPool,
} from "./seed-data";

faker.seed(42);

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function pickMany<T>(arr: readonly T[], n: number): T[] {
  return faker.helpers.arrayElements(arr as T[], Math.min(n, arr.length));
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randInt(8, 18), randInt(0, 59), 0, 0);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(randInt(8, 18), randInt(0, 59), 0, 0);
  return d;
}

async function chunkInsert<T extends Record<string, unknown>, R>(
  insertFn: (batch: T[]) => Promise<R[]>,
  rows: T[],
  size = 100
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < rows.length; i += size) {
    const batch = rows.slice(i, i + size);
    results.push(...(await insertFn(batch)));
  }
  return results;
}

async function main() {
  const { db } = await import("./client");
  const schema = await import("./schema");
  const {
    teams,
    users,
    companies,
    contacts,
    pipelineStages,
    deals,
    interactions,
    tasks,
    notes,
    aiSuggestions,
    sequences,
    sequenceSteps,
    sequenceEnrollments,
    emails,
    leadMagnets,
    leadMagnetDownloads,
    productUsageSnapshots,
    billingEvents,
    supportTickets,
    scores,
    activityLog,
  } = schema;

  console.log("Nettoyage de la base...");
  await db.execute(sql`
    TRUNCATE TABLE
      activity_log, scores, support_tickets, billing_events, product_usage_snapshots,
      lead_magnet_downloads, lead_magnets, emails, sequence_enrollments, sequence_steps,
      sequences, ai_suggestions, notes, tasks, interactions, deals, contacts, companies,
      pipeline_stages, users, teams
    RESTART IDENTITY CASCADE
  `);

  // ---------------------------------------------------------------------
  // Organisation : équipe, manager, commerciaux, admin
  // ---------------------------------------------------------------------
  console.log("Utilisateurs & équipe...");
  const [team] = await db.insert(teams).values({ name: "Équipe Commerciale Paris" }).returning();

  const [admin] = await db
    .insert(users)
    .values({
      name: "Camille Fontaine",
      email: "camille.fontaine@atlasgrowth.fr",
      role: "admin",
      avatarSeed: "camille-fontaine",
      jobTitle: "Administratrice plateforme",
    })
    .returning();

  const [manager] = await db
    .insert(users)
    .values({
      name: "Julien Moreau",
      email: "julien.moreau@atlasgrowth.fr",
      role: "manager",
      teamId: team.id,
      avatarSeed: "julien-moreau",
      jobTitle: "Manager commercial",
      monthlyTargetAmount: "80000",
    })
    .returning();

  const commercialDefs = [
    { name: "Léa Girard", email: "lea.girard@atlasgrowth.fr", avatarSeed: "lea-girard" },
    { name: "Thomas Bernard", email: "thomas.bernard@atlasgrowth.fr", avatarSeed: "thomas-bernard" },
    { name: "Nora Haddad", email: "nora.haddad@atlasgrowth.fr", avatarSeed: "nora-haddad" },
  ];

  const commercials = await db
    .insert(users)
    .values(
      commercialDefs.map((c) => ({
        name: c.name,
        email: c.email,
        role: "commercial" as const,
        teamId: team.id,
        avatarSeed: c.avatarSeed,
        jobTitle: "Account Executive",
        monthlyTargetAmount: String(randInt(35000, 55000)),
      }))
    )
    .returning();

  await db.update(teams).set({ managerId: manager.id }).where(eq(teams.id, team.id));

  // ---------------------------------------------------------------------
  // Pipeline
  // ---------------------------------------------------------------------
  console.log("Étapes du pipeline...");
  const stages = await db.insert(pipelineStages).values([...pipelineStageDefs]).returning();
  const stageByName = Object.fromEntries(stages.map((s) => [s.name, s]));

  // ---------------------------------------------------------------------
  // Entreprises (40 — 15 clients, 25 prospects)
  // ---------------------------------------------------------------------
  console.log("Entreprises...");
  const companyRows = Array.from({ length: 40 }).map((_, i) => {
    const isClient = i < 15;
    const owner = pick(commercials);
    return {
      name: faker.company.name(),
      domain: faker.internet.domainName(),
      industry: pick(industries),
      sizeLabel: pick(sizeLabels),
      status: (isClient ? "client" : "prospect") as "client" | "prospect",
      ownerId: owner.id,
      city: faker.location.city(),
      techStack: pickMany(techStackPool, randInt(2, 5)),
      fundingInfo:
        Math.random() > 0.6
          ? `Levée de ${randInt(1, 20)}M€ en ${randInt(2021, 2025)}`
          : null,
    };
  });
  const companyList = await chunkInsert((batch) => db.insert(companies).values(batch).returning(), companyRows);
  const clientCompanies = companyList.slice(0, 15);
  const prospectCompanies = companyList.slice(15);

  // ---------------------------------------------------------------------
  // Contacts (80 — 2 par entreprise)
  // ---------------------------------------------------------------------
  console.log("Contacts...");
  const contactRows = companyList.flatMap((company) =>
    Array.from({ length: 2 }).map((_, idx) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return {
        companyId: company.id,
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName, provider: company.domain ?? undefined }).toLowerCase(),
        phone: faker.phone.number({ style: "international" }),
        roleTitle: pick(jobTitles),
        isPrimary: idx === 0,
        isDecisionMaker: idx === 0 || Math.random() > 0.6,
      };
    })
  );
  const contactList = await chunkInsert((batch) => db.insert(contacts).values(batch).returning(), contactRows);
  const contactsByCompany = new Map<string, typeof contactList>();
  for (const c of contactList) {
    const arr = contactsByCompany.get(c.companyId) ?? [];
    arr.push(c);
    contactsByCompany.set(c.companyId, arr);
  }

  // ---------------------------------------------------------------------
  // Deals (25, un par entreprise prospect)
  // ---------------------------------------------------------------------
  console.log("Deals...");
  const stageDistribution = [
    "Nouveau",
    "Nouveau",
    "Nouveau",
    "Nouveau",
    "Qualifié",
    "Qualifié",
    "Qualifié",
    "Qualifié",
    "Qualifié",
    "Démo planifiée",
    "Démo planifiée",
    "Démo planifiée",
    "Démo planifiée",
    "Proposition envoyée",
    "Proposition envoyée",
    "Proposition envoyée",
    "Proposition envoyée",
    "Négociation",
    "Négociation",
    "Négociation",
    "Gagné",
    "Gagné",
    "Gagné",
    "Perdu",
    "Perdu",
  ];
  const dealNamePrefixes = [
    "Contrat annuel",
    "Licence Pro",
    "Déploiement national",
    "Offre découverte",
    "Abonnement Business",
  ];
  const dealRows = prospectCompanies.map((company, i) => {
    const stageName = stageDistribution[i];
    const stage = stageByName[stageName];
    const isWon = stage.isWon;
    const isLost = stage.isLost;
    const status = isWon ? "won" : isLost ? "lost" : "open";
    const probability = isWon ? 100 : isLost ? 0 : [10, 25, 45, 60, 75][stage.order - 1] ?? 50;
    return {
      companyId: company.id,
      stageId: stage.id,
      ownerId: company.ownerId,
      name: `${pick(dealNamePrefixes)} — ${company.name}`,
      amount: String(randInt(4000, 48000)),
      probability,
      expectedCloseDate: isWon || isLost ? daysAgo(randInt(1, 40)) : daysFromNow(randInt(5, 60)),
      status: status as "open" | "won" | "lost",
      lostReason: isLost ? pick(lostReasons) : null,
    };
  });
  const dealList = await chunkInsert((batch) => db.insert(deals).values(batch).returning(), dealRows);
  const dealsByCompany = new Map(dealList.map((d) => [d.companyId, d]));

  // ---------------------------------------------------------------------
  // Interactions (300)
  // ---------------------------------------------------------------------
  console.log("Interactions...");
  const activeCompanies = companyList.filter((c) => dealsByCompany.has(c.id) || c.status === "client");
  const typePlan: Array<"call" | "meeting" | "email" | "message" | "note"> = [
    ...Array(90).fill("call"),
    ...Array(60).fill("meeting"),
    ...Array(100).fill("email"),
    ...Array(30).fill("message"),
    ...Array(20).fill("note"),
  ];
  const interactionRows = typePlan.map((type) => {
    const company =
      Math.random() < 0.6 ? pick(activeCompanies) : pick(companyList);
    const companyContacts = contactsByCompany.get(company.id) ?? [];
    const contact = companyContacts.length ? pick(companyContacts) : null;
    const deal = dealsByCompany.get(company.id);
    const occurredAt = daysAgo(randInt(0, 120));
    const direction = Math.random() > 0.5 ? "outbound" : "inbound";

    let aiSummary: string | null = null;
    let transcript: string | null = null;
    let durationSeconds: number | null = null;
    let subject: string | null = null;
    let sentiment: "positive" | "neutral" | "negative" | null = null;
    let channel = "email";
    let recordingUrl: string | null = null;

    if (type === "call") {
      channel = "Aircall";
      durationSeconds = randInt(120, 1800);
      aiSummary = pick(callSummaries);
      sentiment = pick(["positive", "neutral", "negative"] as const);
      transcript = `[Extrait transcrit] Commercial: Bonjour ${contact?.name ?? ""}, merci de prendre cet appel. ${contact?.name ?? "Le contact"}: Bonjour, oui avec plaisir. Commercial: Je voulais faire un point sur ${company.name} et comprendre où vous en êtes. ${contact?.name ?? "Le contact"}: On avance, mais on a une question sur ${pick(objections)}. On regarde aussi ${pick(competitors)} en parallèle.`;
      recordingUrl = `https://recordings.local/calls/${faker.string.uuid()}.mp3`;
    } else if (type === "meeting") {
      channel = pick(["Google Meet", "Zoom", "Teams"]);
      durationSeconds = randInt(900, 3600);
      aiSummary = pick(meetingSummaries);
      sentiment = pick(["positive", "neutral", "negative"] as const);
      transcript = `[Résumé auto] Réunion avec ${companyContacts.map((c) => c.name).join(", ") || "l'équipe " + company.name}. Objection principale évoquée : ${pick(objections)}. Concurrent mentionné : ${pick(competitors)}.`;
      recordingUrl = `https://recordings.local/meetings/${faker.string.uuid()}.mp4`;
    } else if (type === "email") {
      channel = "Gmail";
      subject = pick([
        "Suite à notre échange",
        "Proposition commerciale",
        "Merci pour votre temps",
        "Quelques infos complémentaires",
        "Relance : toujours partant ?",
      ]);
      aiSummary = pick(messageSnippets);
    } else if (type === "message") {
      channel = "LinkedIn";
      aiSummary = pick(messageSnippets);
    } else {
      channel = "Note interne";
      aiSummary = pick(noteSnippets);
    }

    return {
      companyId: company.id,
      contactId: contact?.id ?? null,
      dealId: deal && Math.random() > 0.5 ? deal.id : null,
      ownerId: company.ownerId,
      type,
      channel,
      occurredAt,
      durationSeconds,
      direction: (type === "note" ? null : direction) as "inbound" | "outbound" | null,
      subject,
      aiSummary,
      transcript,
      sentiment,
      recordingUrl,
    };
  });
  const interactionList = await chunkInsert(
    (batch) => db.insert(interactions).values(batch).returning(),
    interactionRows
  );
  const interactionsByCompany = new Map<string, typeof interactionList>();
  for (const it of interactionList) {
    const arr = interactionsByCompany.get(it.companyId) ?? [];
    arr.push(it);
    interactionsByCompany.set(it.companyId, arr);
  }

  // ---------------------------------------------------------------------
  // Tâches
  // ---------------------------------------------------------------------
  console.log("Tâches...");
  const taskTitles = [
    "Relancer suite à la démo",
    "Envoyer la proposition commerciale",
    "Préparer le rendez-vous de cadrage",
    "Appeler pour qualifier le besoin",
    "Envoyer l'étude de cas",
    "Faire un point avant renouvellement",
    "Vérifier l'usage produit avant le comité",
    "Relancer sur LinkedIn",
  ];
  const taskRows = commercials.flatMap((commercial) => {
    const ownedCompanies = companyList.filter((c) => c.ownerId === commercial.id);
    return Array.from({ length: 15 }).map((_, i) => {
      const company = pick(ownedCompanies.length ? ownedCompanies : companyList);
      const deal = dealsByCompany.get(company.id);
      const offsetDays = i < 4 ? -randInt(1, 5) : i < 9 ? 0 : randInt(1, 10);
      const dueDate = offsetDays === 0 ? daysAgo(0) : offsetDays < 0 ? daysAgo(-offsetDays) : daysFromNow(offsetDays);
      const status: "todo" | "done" | "late" = offsetDays < 0 ? (Math.random() > 0.5 ? "late" : "done") : "todo";
      return {
        ownerId: commercial.id,
        companyId: company.id,
        dealId: deal?.id ?? null,
        title: `${pick(taskTitles)} — ${company.name}`,
        dueDate,
        status,
        type: pick(["call", "email", "linkedin", "generic"] as const),
      };
    });
  });
  await chunkInsert((batch) => db.insert(tasks).values(batch).returning(), taskRows);

  // ---------------------------------------------------------------------
  // Notes
  // ---------------------------------------------------------------------
  console.log("Notes...");
  const noteRows = pickMany(companyList, 20).map((company) => ({
    companyId: company.id,
    authorId: company.ownerId,
    body: pick(noteSnippets),
  }));
  await chunkInsert((batch) => db.insert(notes).values(batch).returning(), noteRows);

  // ---------------------------------------------------------------------
  // Suggestions IA
  // ---------------------------------------------------------------------
  console.log("Suggestions IA...");
  const suggestionCompanies = pickMany(companyList, 30);
  const suggestionRows = suggestionCompanies.map((company) => {
    const template = pick(suggestionTemplates);
    const deal = dealsByCompany.get(company.id);
    const companyInteractions = interactionsByCompany.get(company.id) ?? [];
    const sourceIds = pickMany(
      companyInteractions.map((it) => it.id),
      Math.min(2, companyInteractions.length)
    );
    const statusRoll = Math.random();
    const status: "proposed" | "accepted" | "dismissed" | "done" =
      statusRoll < 0.55 ? "proposed" : statusRoll < 0.75 ? "accepted" : statusRoll < 0.9 ? "dismissed" : "done";
    return {
      companyId: company.id,
      dealId: deal?.id ?? null,
      assignedToId: company.ownerId,
      type: template.type,
      channel: template.type === "upsell" ? "email" : pick(["email", "téléphone", "linkedin"]),
      title: template.title,
      content: template.content,
      justification: template.justification,
      dueDate: daysFromNow(randInt(0, 7)),
      sourceInteractionIds: sourceIds,
      status,
      dismissReason: status === "dismissed" ? pick(["Pas pertinent maintenant", "Déjà fait manuellement", "Mauvais timing"]) : null,
      feedback: status === "dismissed" || status === "accepted" ? pick(["Suggestion pertinente", "Trop générique", "Bon timing"]) : null,
    };
  });
  await chunkInsert((batch) => db.insert(aiSuggestions).values(batch).returning(), suggestionRows);

  // ---------------------------------------------------------------------
  // Séquences
  // ---------------------------------------------------------------------
  console.log("Séquences...");
  const sequenceList: Array<
    typeof sequences.$inferSelect & { steps: (typeof sequenceSteps.$inferSelect)[] }
  > = [];
  for (const def of sequenceDefs) {
    const [seq] = await db
      .insert(sequences)
      .values({
        name: def.name,
        description: def.description,
        status: "active",
        ownerId: pick(commercials).id,
        dailySendLimit: 50,
      })
      .returning();
    const steps = await db
      .insert(sequenceSteps)
      .values(
        def.steps.map((s, i) => ({
          sequenceId: seq.id,
          order: i + 1,
          type: s.type,
          mode: s.mode,
          delayDays: s.delayDays,
          condition: s.type === "wait" ? "a_ouvert" : null,
          subject: s.subject,
          body: s.body,
        }))
      )
      .returning();
    sequenceList.push({ ...seq, steps });
  }

  // ---------------------------------------------------------------------
  // Lead magnets
  // ---------------------------------------------------------------------
  console.log("Lead magnets...");
  const leadMagnetList = await chunkInsert(
    (batch) => db.insert(leadMagnets).values(batch).returning(),
    leadMagnetDefs.map((def, i) => ({
      title: def.title,
      type: def.type,
      persona: def.persona,
      fileUrl: `https://assets.local/lead-magnets/${faker.helpers.slugify(def.title).toLowerCase()}.pdf`,
      landingHeadline: def.landingHeadline,
      landingCopy: def.landingCopy,
      associatedSequenceId: sequenceList[i]?.id ?? null,
      published: true,
    }))
  );

  // ---------------------------------------------------------------------
  // Enrôlements dans les séquences + emails
  // ---------------------------------------------------------------------
  console.log("Enrôlements & emails...");
  const enrolledContacts = pickMany(contactList, 30);
  const enrollmentRows = enrolledContacts.map((contact) => {
    const sequence = pick(sequenceList);
    const roll = Math.random();
    const status: "active" | "stopped" | "completed" =
      roll < 0.55 ? "active" : roll < 0.8 ? "stopped" : "completed";
    const currentStepOrder =
      status === "completed" ? sequence.steps.length : randInt(1, sequence.steps.length);
    return {
      sequenceId: sequence.id,
      contactId: contact.id,
      currentStepOrder,
      status,
      stopReason: status === "stopped" ? pick(["A répondu", "Rendez-vous pris", "Changement d'étape du deal", "Désabonnement"]) : null,
      enrolledAt: daysAgo(randInt(3, 60)),
      _sequence: sequence,
    };
  });
  const enrollmentList = await chunkInsert(
    (batch) =>
      db
        .insert(sequenceEnrollments)
        .values(batch.map(({ _sequence, ...rest }) => rest))
        .returning(),
    enrollmentRows
  );

  const emailRows = enrollmentRows.flatMap((enrollment, idx) => {
    const inserted = enrollmentList[idx];
    const emailSteps = enrollment._sequence.steps.filter(
      (s) => s.type === "email" && s.order <= enrollment.currentStepOrder
    );
    return emailSteps.map((step) => {
      const roll = Math.random();
      const status: "draft" | "sent" | "opened" | "clicked" | "replied" | "bounced" =
        step.mode === "draft" && Math.random() > 0.6
          ? "draft"
          : roll < 0.3
            ? "sent"
            : roll < 0.6
              ? "opened"
              : roll < 0.8
                ? "clicked"
                : roll < 0.95
                  ? "replied"
                  : "bounced";
      const sentAt = status === "draft" ? null : daysAgo(randInt(1, 45));
      return {
        contactId: inserted.contactId,
        sequenceStepId: step.id,
        ownerId: null,
        subject: step.subject ?? "Email de séquence",
        body: (step.body ?? "").replace("{{prenom}}", "").replace("{{produit}}", process.env.NEXT_PUBLIC_NOM_PRODUIT_SAAS ?? "notre produit"),
        status,
        sentAt,
        openedAt: ["opened", "clicked", "replied"].includes(status) ? sentAt : null,
        clickedAt: ["clicked", "replied"].includes(status) ? sentAt : null,
        repliedAt: status === "replied" ? sentAt : null,
      };
    });
  });
  await chunkInsert((batch) => db.insert(emails).values(batch).returning(), emailRows);

  // ---------------------------------------------------------------------
  // Téléchargements de lead magnets
  // ---------------------------------------------------------------------
  console.log("Téléchargements de lead magnets...");
  const downloadRows = pickMany(contactList, 50).map((contact) => ({
    leadMagnetId: pick(leadMagnetList).id,
    contactId: contact.id,
    downloadedAt: daysAgo(randInt(1, 90)),
  }));
  await chunkInsert((batch) => db.insert(leadMagnetDownloads).values(batch).returning(), downloadRows);

  // ---------------------------------------------------------------------
  // Usage produit, facturation, support (clients)
  // ---------------------------------------------------------------------
  console.log("Usage produit, facturation, support...");
  const plans = ["Starter", "Pro", "Business"] as const;
  const featurePool = [
    "reporting",
    "automatisation",
    "intégration CRM",
    "scoring IA",
    "séquences email",
    "export API",
  ];

  const latestMrrByCompany = new Map<string, string>();
  const usageRows = clientCompanies.flatMap((company) => {
    const plan = pick(plans);
    const baseMrr = plan === "Starter" ? randInt(200, 500) : plan === "Pro" ? randInt(600, 1500) : randInt(1600, 4000);
    const snapshots = [2, 1, 0].map((monthsAgo) => ({
      companyId: company.id,
      plan,
      mrr: String(baseMrr + randInt(-50, 50) * (2 - monthsAgo)),
      seatsUsed: randInt(2, 25),
      lastLoginAt: monthsAgo === 0 ? daysAgo(randInt(0, 25)) : daysAgo(monthsAgo * 30 + randInt(0, 10)),
      featuresUsed: pickMany(featurePool, randInt(2, featurePool.length)),
      trialStatus: (Math.random() > 0.9 ? "past_due" : "active") as "active" | "past_due",
      snapshotAt: daysAgo(monthsAgo * 30),
    }));
    latestMrrByCompany.set(company.id, snapshots[snapshots.length - 1].mrr);
    return snapshots;
  });
  await chunkInsert((batch) => db.insert(productUsageSnapshots).values(batch).returning(), usageRows);

  const billingRows = clientCompanies.flatMap((company) => {
    const mrr = latestMrrByCompany.get(company.id) ?? "500";
    const events: Array<{ companyId: string; type: typeof billingEventTypeValues[number]; amount: string | null; occurredAt: Date }> = [
      { companyId: company.id, type: "subscription_started", amount: mrr, occurredAt: daysAgo(randInt(90, 400)) },
      { companyId: company.id, type: "subscription_renewed", amount: mrr, occurredAt: daysAgo(randInt(1, 60)) },
    ];
    if (Math.random() > 0.85) {
      events.push({ companyId: company.id, type: "payment_failed", amount: mrr, occurredAt: daysAgo(randInt(1, 15)) });
    }
    if (Math.random() > 0.8) {
      events.push({ companyId: company.id, type: "subscription_upgraded", amount: mrr, occurredAt: daysAgo(randInt(20, 80)) });
    }
    return events;
  });
  await chunkInsert((batch) => db.insert(billingEvents).values(batch).returning(), billingRows);

  const supportCompanies = [...clientCompanies, ...pickMany(prospectCompanies, 5)];
  const supportRows = Array.from({ length: 40 }).map(() => {
    const company = pick(supportCompanies);
    const companyContacts = contactsByCompany.get(company.id) ?? [];
    const status: "open" | "pending" | "closed" = pick(["open", "pending", "closed"] as const);
    const openedAt = daysAgo(randInt(1, 60));
    return {
      companyId: company.id,
      contactId: companyContacts.length ? pick(companyContacts).id : null,
      subject: pick(supportSubjects),
      status,
      priority: pick(["low", "normal", "high", "urgent"] as const),
      satisfactionScore: status === "closed" ? randInt(2, 5) : null,
      openedAt,
      closedAt: status === "closed" ? new Date(openedAt.getTime() + randInt(1, 5) * 86400000) : null,
    };
  });
  await chunkInsert((batch) => db.insert(supportTickets).values(batch).returning(), supportRows);

  // ---------------------------------------------------------------------
  // Scores (lead / health)
  // ---------------------------------------------------------------------
  console.log("Scores...");
  const scoreRows = [
    ...prospectCompanies.flatMap((company) => {
      const deal = dealsByCompany.get(company.id);
      const base = deal ? deal.probability : randInt(10, 60);
      return [30, 0].map((daysBack) => ({
        companyId: company.id,
        type: "lead" as const,
        value: Math.max(5, Math.min(95, base + randInt(-15, 15))),
        computedAt: daysAgo(daysBack),
      }));
    }),
    ...clientCompanies.flatMap((company) => {
      const base = randInt(40, 95);
      return [30, 0].map((daysBack) => ({
        companyId: company.id,
        type: "health" as const,
        value: Math.max(5, Math.min(99, base + randInt(-10, 10))),
        computedAt: daysAgo(daysBack),
      }));
    }),
  ];
  await chunkInsert((batch) => db.insert(scores).values(batch).returning(), scoreRows);

  // ---------------------------------------------------------------------
  // Journal d'audit
  // ---------------------------------------------------------------------
  console.log("Journal d'audit...");
  const auditActions = [
    "Changement d'étape du deal",
    "Suggestion IA acceptée",
    "Tâche complétée",
    "Contact ajouté",
    "Motif de perte renseigné",
    "Séquence démarrée",
    "Utilisateur connecté",
  ];
  const allUsers = [admin, manager, ...commercials];
  const auditRows = Array.from({ length: 35 }).map(() => {
    const user = pick(allUsers);
    const company = pick(companyList);
    return {
      userId: user.id,
      action: pick(auditActions),
      entityType: "company",
      entityId: company.id,
      occurredAt: daysAgo(randInt(0, 45)),
    };
  });
  await chunkInsert((batch) => db.insert(activityLog).values(batch).returning(), auditRows);

  console.log("\nSeed terminé ✔");
  console.log(`  ${allUsers.length} utilisateurs (1 admin, 1 manager, 3 commerciaux)`);
  console.log(`  ${companyList.length} entreprises (${clientCompanies.length} clients, ${prospectCompanies.length} prospects)`);
  console.log(`  ${contactList.length} contacts`);
  console.log(`  ${dealList.length} deals`);
  console.log(`  ${interactionList.length} interactions`);
  console.log(`  ${sequenceList.length} séquences, ${leadMagnetList.length} lead magnets`);
  console.log(`\nConnexion : identifiez-vous depuis /login avec l'un des profils seedés.`);
}

const billingEventTypeValues = [
  "subscription_started",
  "subscription_renewed",
  "subscription_upgraded",
  "subscription_downgraded",
  "payment_failed",
  "subscription_canceled",
] as const;

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
