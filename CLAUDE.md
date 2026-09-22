# CLAUDE.md — Sales Hub

Cockpit commercial IA pour une agence qui vend un SaaS. Ce document explique les conventions,
commandes et décisions prises pour ce projet — à lire avant de continuer le développement.

## Où on en est

**V1 "design only"** : l'objectif de cette itération est de valider le design et les parcours
UX sur toutes les pages, avec des données réalistes, **avant** de brancher n8n et une vraie
authentification Supabase. Voir la section "Ce qui est volontairement simplifié" plus bas —
c'est la référence pour ne pas confondre un raccourci assumé avec un bug.

Avancement (voir aussi les tâches dans l'outil de suivi de la session) :

- ✅ Phase 1 — Socle : scaffold Next.js/Tailwind/shadcn, schéma Drizzle complet (21 tables),
  seed FR réaliste, layout (sidebar/topbar/Cmd+K/thème), auth simulée par sélecteur de rôle,
  `lib/permissions.ts` + tests Vitest.
- ⬜ Phase 2 — Fiches prospect/client, timeline, pipeline (Kanban + tableau).
- ⬜ Phase 3 — Suggestions IA + vue "Ma journée".
- ⬜ Phase 4 — Séquences email.
- ⬜ Phase 5 — Lead magnets.
- ⬜ Phase 6 — Performance commerciale.
- ⬜ Phase 7 — Administration, page Intégrations, finitions.

## Démarrer en local

```bash
cp .env.example .env.local   # puis ajustez DATABASE_URL si besoin
docker compose up -d         # Postgres local (ou utilisez un Postgres système, voir plus bas)
pnpm install
pnpm db:generate && pnpm exec drizzle-kit migrate   # applique le schéma (non-interactif)
pnpm db:seed                 # peuple la base avec des données de démo en français
pnpm dev
```

Connectez-vous depuis `/login` en choisissant un des profils seedés (admin, manager, ou un
des 3 commerciaux) — il n'y a pas de mot de passe dans ce V1 (voir plus bas).

> Dans le sandbox de développement utilisé pour construire ce projet, le daemon Docker n'était
> pas disponible : le Postgres système (`pg_ctlcluster 16 main start`) a été utilisé à la
> place, avec un rôle/une base `sales_hub` créés manuellement. Le `docker-compose.yml` reste la
> voie recommandée sur une machine avec Docker.

## Commandes

- `pnpm dev` — serveur de dev (Turbopack)
- `pnpm build` / `pnpm start` — build et lancement en production
- `pnpm lint` — ESLint
- `pnpm test` / `pnpm test:watch` — Vitest
- `pnpm db:generate` — génère une migration SQL à partir de `db/schema.ts`
- `pnpm exec drizzle-kit migrate` — applique les migrations (non-interactif, à préférer à
  `db:push` qui demande un TTY)
- `pnpm db:studio` — Drizzle Studio (explorateur de données)
- `pnpm db:seed` — réinitialise et repeuple la base (`db/seed.ts`, données dans `db/seed-data.ts`)

## Stack & décisions

- **Next.js 15 (App Router) + TypeScript strict**, Tailwind CSS v4 (config CSS-first, pas de
  `tailwind.config.js`), shadcn/ui en style "new-york".
  - Le registre `ui.shadcn.com` est bloqué par la politique réseau de l'environnement de build
    utilisé ici ; les composants `components/ui/*` ont donc été écrits à la main (copie fidèle
    du code shadcn standard) plutôt que générés par le CLI. Pour ajouter un nouveau composant
    shadcn sur une machine avec accès réseau, `pnpm dlx shadcn@latest add <composant>`
    fonctionnera normalement grâce à `components.json`.
- **Drizzle ORM** plutôt que Prisma : plus proche du SQL, pas de moteur de requête binaire
  séparé à gérer, migrations lisibles en clair, et le même schéma se porte tel quel vers
  Supabase Postgres quand on branchera le vrai backend.
- **Zod** pour valider les entrées externes (query params d'API, formulaires à venir).
- **TanStack Query** côté client (recherche globale, futurs formulaires avec mutations).
- **Vitest** pour la logique métier pure (`lib/permissions.test.ts`). Les tests Playwright
  (3 parcours critiques) sont prévus pour la phase 8, une fois le backend réel branché — les
  faire porter sur l'auth simulée serait du travail jetable.
- **next-themes** pour le mode clair/sombre (`class` strategy, cookie/localStorage géré par la
  librairie), **sonner** pour les toasts, **cmdk** pour la palette Cmd+K.

## Auth simulée (à remplacer avant prod)

Il n'y a pas de vrai système d'authentification dans ce V1. `lib/auth.ts` lit un cookie
`sales_hub_uid` contenant l'id d'un utilisateur seedé ; `/login` et le sélecteur de rôle dans
la topbar (`components/layout/role-switcher.tsx`) permettent de changer d'identité en un clic
via une Server Action (`lib/actions/session.ts`), sans mot de passe. Si le cookie est absent,
invalide, ou pointe vers un utilisateur supprimé, `getCurrentUser()` retombe sur le premier
admin du seed pour que l'app reste toujours utilisable.

**Pourquoi ce choix** : l'objectif de ce V1 est de valider le design, pas l'infrastructure
d'auth. Brancher Supabase Auth maintenant aurait ajouté de la configuration (projet Supabase,
clés, redirections) sans rien apporter à la validation du design.

**Avant la mise en production**, remplacer par Supabase Auth + Row Level Security réelles.
En attendant, `lib/permissions.ts` (règles pures, testées) + `lib/auth.ts::getVisibleOwnerIds`
(scope calculé à partir de l'équipe réelle en base) sont la **seule** ligne de défense : toute
nouvelle query serveur qui liste des entreprises/deals/stats **doit** filtrer par ce scope. Ne
jamais supposer que le filtrage client (masquer un lien dans l'UI) suffit.

## Ce qui est volontairement simplifié dans ce V1

Ne pas les traiter comme des bugs — ce sont des choix de périmètre validés avec l'utilisatrice
pour ce premier chantier "design only" :

- **Pas de vraie authentification** (voir ci-dessus) — pas de RLS Postgres/Supabase active.
- **Pas de n8n branché** : les suggestions IA, résumés, emails générés, scores, etc. sont des
  contenus réalistes écrits dans le seed (`db/seed-data.ts`). Il n'y a pas de table `jobs`, pas
  d'endpoint `/api/dev/mock-n8n`, pas de callback : les actions "Générer…" simuleront un
  chargement puis piocheront un résultat pré-écrit (phase 3+).
- **Pas d'API d'ingestion** (`/api/v1/ingest/{type}`), pas de `docs/n8n-contract.md`, pas de
  `scripts/simulate-ingest.ts`. Ces éléments sont prévus dans le document de cadrage original
  mais reportés à un chantier ultérieur, une fois le design validé.
- **Pas d'intégrations tierces réelles** (HubSpot, Stripe, Aircall…) — la page Intégrations
  (phase 7) affichera un statut "Non connecté" pour chaque source, à titre illustratif.

## Modèle de données

Schéma complet dans `db/schema.ts` (Drizzle). Toutes les tables ont `id` (uuid), `created_at`,
`updated_at` ; les tables susceptibles d'être alimentées par ingestion externe plus tard ont
aussi `source` (défaut `"seed"`) et `external_id`, même si rien ne les exploite encore.

Tables : `teams`, `users`, `companies`, `contacts`, `pipeline_stages`, `deals`, `interactions`
(timeline unifiée), `tasks`, `notes`, `ai_suggestions`, `sequences`, `sequence_steps`,
`sequence_enrollments`, `emails`, `lead_magnets`, `lead_magnet_downloads`,
`product_usage_snapshots`, `billing_events`, `support_tickets`, `scores`, `activity_log`.

**Ajout par rapport à la liste d'entités minimales du document de cadrage** : `support_tickets`.
Nécessaire pour l'onglet "Support" des fiches client mentionné dans le document et pour la
source de données "Support (Intercom, Zendesk…)" — sans cette table, cet onglet n'aurait rien
à afficher.

**Tables volontairement absentes** de ce V1 (à ajouter quand on branchera n8n) : `jobs`,
`ingestion_logs`.

## Permissions

`lib/permissions.ts` contient la logique pure (testée) : un commercial ne voit que ses propres
fiches (`ownerId === user.id`), un manager voit son équipe, un admin voit tout (`"all"`).
`lib/auth.ts::getVisibleOwnerIds` calcule ce scope à partir des données réelles (équipe en
base). Toute nouvelle route ou Server Component qui liste des `companies`/`deals`/stats doit
appeler cette fonction et filtrer dessus — voir `app/api/search/route.ts` pour un exemple.

## Conventions

- Interface entièrement en français (libellés, contenus du seed, messages d'erreur).
- Composants shadcn dans `components/ui/*` — ne pas les modifier au cas par cas, préférer un
  wrapper dans `components/layout/*` ou `components/<module>/*` pour une variation spécifique.
- Un module fonctionnel = un dossier dans `components/<module>/` (ex. `components/fiche/`,
  `components/pipeline/`) + ses pages dans `app/(app)/<route>/`.
- Toute entrée externe (query params, bodies d'API, formulaires) est validée avec Zod dans
  `lib/validations/<domaine>.ts` avant d'toucher la base.
- Montants stockés en `numeric` Postgres → chaînes de caractères côté Drizzle/JS ; formater à
  l'affichage avec `Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })`.
- Dates : `date-fns` avec le locale `fr` pour l'affichage.
