# 🚀 Déploiement Rapide sur Vercel

## Étapes Rapides (5 minutes)

### 1. Préparer votre projet
Assurez-vous que votre `DATABASE_URL` est prêt (déjà fait ✅)

### 2. Connecter à Vercel
1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **"Add New Project"**
3. Importez votre repository `gestion-facture-v2`

### 3. Configuration dans Vercel
- **Framework Preset** : Laissez "Other" (détection automatique)
- **Root Directory** : Laissez vide (racine)
- **Build Command** : Sera détecté automatiquement depuis `vercel.json`
- **Output Directory** : `frontend/dist` (déjà configuré)

### 4. Variables d'environnement
Ajoutez dans Vercel → Settings → Environment Variables :

```
DATABASE_URL = votre-url-postgresql
NODE_ENV = production
```

### 5. Déployer
Cliquez sur **"Deploy"** et attendez 2-3 minutes.

## ✅ Vérification

Après le déploiement, testez :
- Frontend : `https://votre-app.vercel.app`
- API Health : `https://votre-app.vercel.app/api/health`
- API Suppliers : `https://votre-app.vercel.app/api/suppliers`

## 📝 Notes Importantes

1. **DATABASE_URL** : Doit être accessible depuis Vercel (whitelist IP si nécessaire)
2. **Prisma** : Le client sera généré automatiquement lors du build
3. **CORS** : Configuré automatiquement pour les domaines Vercel
4. **Frontend** : Utilise automatiquement `/api` en production (même domaine)

## 🐛 Problèmes Courants

- **Build échoue** : Vérifiez les logs dans Vercel
- **Erreur Prisma** : Vérifiez que `DATABASE_URL` est correct
- **404 sur /api** : Vérifiez que `vercel.json` est à la racine

Pour plus de détails, voir `README-VERCEL.md`

