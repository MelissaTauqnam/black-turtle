# Audit IA : mise en ligne sur Lovable

Le site est une page HTML autonome : rien à installer, rien à convertir.

## Contenu

```
public/audit/index.html    la page
public/audit/audit.js      le questionnaire, les calculs et le rapport
public/audit/img/          photo de Melissa et Pistache
src/pages/Index.tsx        renvoie la page d'accueil du site vers l'audit
```

## Méthode recommandée : via GitHub

1. Dans Lovable, connectez le projet à GitHub (bouton **GitHub** en haut à droite → *Connect*).
2. Dans le dépôt GitHub créé par Lovable, ajoutez le dossier `public/audit/` tel quel.
3. Remplacez `src/pages/Index.tsx` par celui fourni ici.
4. Lovable se synchronise tout seul. Cliquez sur **Publish** : l'audit est en ligne à la racine de votre domaine.

## Sans GitHub

Dans Lovable, passez en mode **Code** (éditeur de fichiers), créez les fichiers
aux mêmes emplacements et collez leur contenu. Les deux images s'ajoutent par
glisser-déposer dans `public/audit/img/`.

## Après la mise en ligne

- Tarifs : bloc `PRICING` en haut de `audit.js` (mise en place et coût mensuel par niveau de complexité).
- Calendly : ajoutez une question en **première position** de l'événement (« Résumé de votre audit ») : elle reçoit le résumé pré-rempli.
- Aperçu sur les réseaux sociaux : ajoutez dans `index.html`
  `<meta property="og:image" content="https://VOTRE-DOMAINE/audit/img/pistache.webp">`
  une fois votre domaine connu.
