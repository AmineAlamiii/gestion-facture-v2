# Guide de Déploiement sur Vercel (Backend + Frontend)

Ce guide vous explique comment déployer votre application complète (backend + frontend) sur Vercel.

## 📋 Prérequis

- Un compte Vercel (gratuit) : [https://vercel.com](https://vercel.com)
- Un compte GitHub/GitLab/Bitbucket (pour connecter le repository)
- Une base de données PostgreSQL déjà déployée (le lien DATABASE_URL est déjà dans vos variables d'environnement)

## 🏗️ Architecture de Déploiement

- **Frontend** : Déployé sur Vercel (React + Vite)
- **Backend** : Déployé sur Vercel en tant que Serverless Functions (Express + Prisma)
- **Base de données** : PostgreSQL (déjà déployée, URL dans DATABASE_URL)

## 🚀 Déploiement sur Vercel

### Option 1 : Déploiement via l'Interface Vercel (Recommandé)

1. **Connecter votre repository**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Add New Project"
   - Importez votre repository GitHub/GitLab/Bitbucket
   - Sélectionnez le repository `gestion-facture-v2`

2. **Configurer le projet**
   - **Root Directory** : Laissez vide (racine du projet)
   - **Framework Preset** : Other (détection automatique)
   - **Build Command** : `npm run build` (défini dans `package.json`)
   - **Output Directory** : `frontend/dist` (pour le frontend)
   - **Install Command** : `npm install && cd backend && npm install && cd ../frontend && npm install`

3. **Configurer les variables d'environnement**
   
   Dans la section "Environment Variables", ajoutez :
   
   | Variable | Description | Exemple |
   |----------|-------------|---------|
   | `DATABASE_URL` | URL de votre base de données PostgreSQL | `postgresql://user:pass@host:5432/dbname` |
   | `NODE_ENV` | Environnement | `production` |
   | `FRONTEND_URL` | URL de votre frontend Vercel (optionnel) | `https://votre-app.vercel.app` |
   
   **Important** : `DATABASE_URL` doit être configuré car votre base de données est déjà déployée.

4. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel va automatiquement :
     - Installer les dépendances (racine, backend, frontend)
     - Générer le client Prisma
     - Builder le frontend
     - Déployer le backend en tant que Serverless Functions
     - Déployer le frontend

### Option 2 : Déploiement via CLI Vercel

1. **Installer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Se connecter à Vercel**
   ```bash
   vercel login
   ```

3. **Naviguer vers la racine du projet**
   ```bash
   cd /Users/aminealami/Public/Travails\ Projects/gestion-facture-v2
   ```

4. **Configurer les variables d'environnement**
   ```bash
   vercel env add DATABASE_URL
   # Entrez votre URL PostgreSQL
   
   vercel env add NODE_ENV production
   ```

5. **Déployer**
   ```bash
   vercel
   ```
   - Suivez les instructions interactives
   - Pour la production, utilisez : `vercel --prod`

## ⚙️ Configuration des Variables d'Environnement

### Variables requises

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `DATABASE_URL` | URL complète de votre base de données PostgreSQL | Déjà dans vos variables d'environnement |
| `NODE_ENV` | Environnement d'exécution | `production` |

### Variables optionnelles

| Variable | Description | Valeur par défaut |
|----------|-------------|------------------|
| `FRONTEND_URL` | URL du frontend (pour CORS) | Auto-détecté par Vercel |
| `FRONTEND_URLS` | URLs supplémentaires (séparées par virgules) | - |

### Comment ajouter des variables d'environnement

1. **Via l'interface Vercel** :
   - Allez dans votre projet → Settings → Environment Variables
   - Ajoutez chaque variable avec sa valeur
   - Sélectionnez les environnements (Production, Preview, Development)

2. **Via la CLI** :
   ```bash
   vercel env add DATABASE_URL production
   ```

## 📁 Structure du Projet pour Vercel

```
gestion-facture-v2/
├── api/
│   └── index.js          # Point d'entrée serverless pour le backend
├── backend/
│   ├── src/
│   │   └── lib/
│   │       └── prisma.js # Client Prisma configuré pour serverless
│   └── prisma/
│       └── schema.prisma # Schéma Prisma
├── frontend/
│   └── src/              # Application React
├── vercel.json           # Configuration Vercel
└── package.json          # Scripts de build
```

## 🔧 Configuration Technique

### Backend (Serverless Functions)

Le backend est adapté pour fonctionner avec les Serverless Functions de Vercel :
- Le fichier `api/index.js` exporte l'application Express
- Prisma est configuré pour fonctionner en environnement serverless
- Les routes `/api/*` sont automatiquement routées vers le backend

### Frontend

Le frontend est configuré pour :
- Utiliser l'URL relative `/api` en production (même domaine)
- Utiliser `VITE_API_URL` si défini (pour développement)
- Builder avec Vite dans le dossier `frontend/dist`

### Prisma

Prisma est configuré pour :
- Générer le client lors du build (`postinstall`)
- Réutiliser les instances en environnement serverless
- Se connecter à votre base de données PostgreSQL via `DATABASE_URL`

## 🔄 Déploiements Automatiques

Vercel déploie automatiquement :
- **Production** : À chaque push sur la branche `main` ou `master`
- **Preview** : À chaque pull request ou push sur d'autres branches

## 🌐 URLs de l'Application

Après le déploiement :
- **Frontend** : `https://votre-app.vercel.app`
- **Backend API** : `https://votre-app.vercel.app/api`
- **Health Check** : `https://votre-app.vercel.app/api/health`

## 🐛 Dépannage

### Problème : Erreur "Prisma Client not generated"

**Solution** : 
- Vérifiez que le script `postinstall` s'exécute correctement
- Vérifiez les logs de build dans Vercel
- Assurez-vous que `prisma` est dans les `devDependencies` du `package.json` racine

### Problème : Erreur de connexion à la base de données

**Solution** :
- Vérifiez que `DATABASE_URL` est correctement configuré dans Vercel
- Vérifiez que votre base de données accepte les connexions depuis Vercel (whitelist IP si nécessaire)
- Vérifiez les logs de la fonction serverless dans Vercel

### Problème : Routes API retournent 404

**Solution** :
- Vérifiez que `vercel.json` est correctement configuré
- Vérifiez que les routes commencent par `/api/`
- Vérifiez les logs de déploiement

### Problème : Erreur CORS

**Solution** :
- Le CORS est déjà configuré pour accepter les domaines Vercel
- Vérifiez que `FRONTEND_URL` correspond à votre domaine Vercel
- Les domaines `*.vercel.app` sont automatiquement autorisés

### Problème : Build échoue

**Solution** :
- Vérifiez que toutes les dépendances sont dans les `package.json` appropriés
- Vérifiez les logs de build dans Vercel
- Assurez-vous que Node.js version est compatible (Vercel utilise Node 18+ par défaut)

### Problème : Timeout des fonctions serverless

**Solution** :
- Les fonctions serverless Vercel ont un timeout de 10 secondes (gratuit) ou 60 secondes (Pro)
- Optimisez vos requêtes Prisma
- Utilisez des index sur les colonnes fréquemment interrogées

## 📊 Monitoring

Vercel fournit :
- **Analytics** : Statistiques de performance
- **Logs** : Logs en temps réel des fonctions serverless et des déploiements
- **Speed Insights** : Métriques de performance web
- **Function Logs** : Logs spécifiques aux Serverless Functions

## 🔐 Sécurité

- Les variables d'environnement sont chiffrées
- HTTPS est activé automatiquement
- Les headers de sécurité sont configurés automatiquement
- Prisma utilise des connexions sécurisées (SSL) pour PostgreSQL

## 💡 Optimisations

### Pour améliorer les performances :

1. **Prisma** :
   - Utilisez des requêtes optimisées avec `select` pour limiter les données
   - Ajoutez des index sur les colonnes fréquemment interrogées
   - Utilisez la pagination pour les grandes listes

2. **Serverless Functions** :
   - Gardez les fonctions légères
   - Utilisez le cache quand c'est possible
   - Optimisez les imports

3. **Frontend** :
   - Les assets sont automatiquement mis en cache
   - Utilisez le code splitting de Vite

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Prisma avec Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Documentation Vite](https://vitejs.dev/)

## ✅ Checklist de Déploiement

- [ ] Base de données PostgreSQL déployée et accessible
- [ ] Variable `DATABASE_URL` configurée dans Vercel
- [ ] Variable `NODE_ENV` configurée à `production`
- [ ] Repository connecté à Vercel
- [ ] Build réussi (vérifier les logs)
- [ ] Application accessible sur le domaine Vercel
- [ ] Test de connexion API fonctionnel (`/api/health`)
- [ ] Test des routes principales (suppliers, clients, etc.)
- [ ] Frontend se connecte correctement au backend
- [ ] Domaines personnalisés configurés (optionnel)

## 🎉 Félicitations !

Votre application complète (backend + frontend) est maintenant déployée sur Vercel ! 🚀

### Prochaines étapes

1. Testez toutes les fonctionnalités
2. Configurez un domaine personnalisé si nécessaire
3. Activez les analytics et monitoring
4. Configurez les webhooks pour les déploiements automatiques
