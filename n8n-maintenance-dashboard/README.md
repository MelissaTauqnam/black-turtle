# AutomWatch — Supervision des automatisations clients

Interface de supervision centralisée pour la maintenance de workflows n8n multi-clients, dans l'esprit du post r/n8n *"Stop losing your n8n workflows"*.

## Ce que ça montre

- **Vue d'ensemble** : KPI (clients, scénarios en erreur, apps déconnectées, nœuds à mettre à jour, recommandations IA), priorités du jour, santé par client, activité récente.
- **Scénarios** : liste filtrable de tous les workflows n8n suivis (client, statut, apps connectées/déconnectées, nœuds obsolètes, erreurs sur 7 jours).
- **Clients** : vue par client (contrat de maintenance, contact, périmètre d'automatisation).
- **Erreurs & Alertes** : timeline des incidents détectés sur le parc.
- **Analyse IA quotidienne** : chaque matin, chaque scénario est ré-analysé et croisé avec une veille web (docs des API tierces utilisées, changelogs, actualité IA) pour anticiper les pannes avant qu'elles n'arrivent — token sur le point d'expirer, endpoint bientôt déprécié, nœud en retard de version, changement de quota, nouveau modèle recommandé, etc. Chaque recommandation cite sa source et une action concrète à réaliser.
- **Paramètres** : connexions aux instances n8n, fréquence de l'analyse, notifications, sources de veille.

## Statut

Prototype front-end (HTML/CSS/JS vanilla, aucune dépendance) avec données de démonstration, pensé pour valider le concept d'interface avant branchement sur :
- l'API n8n de chaque instance cliente (statut des exécutions, credentials, versions de nœuds),
- un job planifié (ex. cron quotidien) qui exécute l'analyse IA + recherche web et alimente `AI_REPORTS`,
- un système de notifications (email/Slack) sur incident critique.

## Lancer en local

Aucune installation requise : ouvrir `index.html` dans un navigateur, ou servir le dossier avec un serveur statique :

```bash
npx serve n8n-maintenance-dashboard
```
