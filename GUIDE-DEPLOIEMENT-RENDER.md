# 📝 Guide Rapide - Déploiement sur Render

## 🎯 9 Étapes Simples pour Déployer

### ✅ ÉTAPE 1 : Préparer le Code

1. Assurez-vous que votre code est sur **GitHub/GitLab/Bitbucket**
2. Le fichier `render.yaml` doit être à la **racine** du dépôt
3. Si ce n'est pas fait, poussez votre code :
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push
   ```

---

### ✅ ÉTAPE 2 : Créer un Compte Render

1. Allez sur **https://render.com**
2. Cliquez sur **"Get Started for Free"**
3. Créez votre compte (c'est gratuit !)

---

### ✅ ÉTAPE 3 : Créer la Base de Données (Manuellement en Premier)

**⚠️ IMPORTANT** : Render ne supporte pas la création de bases de données PostgreSQL dans les Blueprints.
**Vous DEVEZ créer la base de données manuellement AVANT de créer le Blueprint.**

1. Dans Render, cliquez sur **"New +"** → **"PostgreSQL"**
2. Configurez :
   - **Name**: `invoice-management-db`
   - **Database**: `invoice_management`
   - **User**: (laissé par défaut ou `invoice_user`)
   - **Region**: Choisissez la région la plus proche (ex: Frankfurt)
   - **Plan**: **Free** (assurez-vous que c'est bien Free)
3. Cliquez sur **"Create Database"**
4. ⏳ Attendez que la base de données soit créée (1-2 minutes)
5. **COPIEZ l'Internal Database URL** (vous en aurez besoin plus tard)
   - Allez dans votre base de données → onglet **"Info"**
   - Copiez **"Internal Database URL"**

### ✅ ÉTAPE 4 : Créer le Blueprint

1. Dans Render, cliquez sur **"New +"** → **"Blueprint"**
2. Connectez votre dépôt Git (GitHub/GitLab/Bitbucket)
3. Sélectionnez votre dépôt
4. Render détectera automatiquement `render.yaml`

**⚠️ Si Render demande votre carte bancaire :**
- Render peut demander une carte bancaire pour vérification, même pour le plan gratuit
- **Vous NE serez PAS facturé** si vous utilisez le plan gratuit
- La carte est demandée pour prévenir les abus ou faciliter d'éventuelles mises à niveau
- Si vous fournissez une carte, assurez-vous de sélectionner le **plan "Free"** pour chaque service

5. **IMPORTANT** : Vérifiez que chaque service est configuré en **plan "Free"** :
   - ✅ Backend : Plan **Free**  
   - ✅ Frontend : Plan **Free**

6. Cliquez sur **"Apply"**
7. ⏳ Attendez 2-5 minutes que les services soient créés

**2 services seront créés automatiquement :**
- ✅ Service Web Backend (GRATUIT - mis en veille après 15 min)
- ✅ Site Statique Frontend (GRATUIT - sans limitations)

**⚠️ La base de données a déjà été créée à l'étape 3 !**

---

### ✅ ÉTAPE 5 : Configurer la Base de Données dans le Backend

1. Dans le service **"invoice-management-backend"**, allez dans **"Environment"**
2. Cliquez sur **"Add Environment Variable"**
3. Ajoutez :
   - **Key**: `DATABASE_URL`
   - **Value**: Collez l'**Internal Database URL** que vous avez copiée à l'étape 3
4. Cliquez sur **"Save Changes"**
5. Le backend redémarrera automatiquement

### ✅ ÉTAPE 6 : Exécuter les Migrations (⚠️ OBLIGATOIRE)

**⚠️ SANS CETTE ÉTAPE, VOTRE APP NE FONCTIONNERA PAS !**

1. Dans Render, cliquez sur le service **"invoice-management-backend"**
2. Cliquez sur l'onglet **"Shell"** (en haut)
3. Cliquez sur **"Connect"**
4. Tapez ces commandes :
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
5. ✅ Vous devriez voir : `Applied migration: ...`

---

### ✅ ÉTAPE 5 : Configurer le Backend

1. Dans le service **"invoice-management-backend"**, allez dans **"Environment"**
2. Cliquez sur **"Add Environment Variable"**
3. Ajoutez :
   - **Key** : `FRONTEND_URL`
   - **Value** : Copiez l'URL de votre frontend (ex: `https://invoice-management-frontend.onrender.com`)
     - Vous trouverez cette URL dans le service **"invoice-management-frontend"**
4. Cliquez sur **"Save Changes"**
5. Le backend redémarrera automatiquement

---

### ✅ ÉTAPE 6 : Configurer le Frontend

1. Dans le service **"invoice-management-frontend"**, allez dans **"Environment"**
2. Cliquez sur **"Add Environment Variable"**
3. Ajoutez :
   - **Key** : `VITE_API_URL`
   - **Value** : L'URL de votre backend + `/api`
     - Exemple : `https://invoice-management-backend.onrender.com/api`
     - Vous trouverez l'URL dans le service **"invoice-management-backend"**
4. Cliquez sur **"Save Changes"**
5. ⏳ Attendez que le frontend se reconstruise (2-3 minutes)

---

### ✅ ÉTAPE 7 : Tester

1. **Vérifier le Backend** :
   - Ouvrez : `https://votre-backend.onrender.com/api/health`
   - Vous devriez voir : `{"success": true, ...}`

2. **Vérifier le Frontend** :
   - Ouvrez l'URL de votre frontend
   - L'application devrait se charger

3. **Tester l'application** :
   - Créez un fournisseur
   - Créez un client
   - Créez une facture d'achat
   - Vérifiez le stock

---

## 🎉 C'est Fini !

Votre application est maintenant en ligne sur Render ! 🚀

---

## 📋 Checklist Rapide

- [ ] Code sur GitHub/GitLab/Bitbucket
- [ ] `render.yaml` à la racine
- [ ] Compte Render créé
- [ ] Blueprint créé et appliqué
- [ ] Migrations exécutées (`npx prisma migrate deploy`)
- [ ] `FRONTEND_URL` ajouté dans le backend
- [ ] `VITE_API_URL` ajouté dans le frontend
- [ ] Backend fonctionne (`/api/health`)
- [ ] Frontend fonctionne et se connecte au backend

---

## 🔄 Alternative : Méthode Manuelle (Sans Blueprint)

Si vous préférez éviter la demande de carte bancaire, vous pouvez créer les services manuellement :

### Option A : Déploiement Manuel Étape par Étape

1. **Créer la base de données** :
   - **"New +"** → **"PostgreSQL"**
   - Name : `invoice-management-db`
   - Plan : **Free**
   - Region : Choisissez la plus proche
   - Cliquez sur **"Create Database"**
   - Copiez l'**Internal Database URL**

2. **Créer le Backend** :
   - **"New +"** → **"Web Service"**
   - Connectez votre dépôt Git
   - Name : `invoice-management-backend`
   - Environment : **Node**
   - Root Directory : `backend`
   - Build Command : `cd backend && npm install && npx prisma generate`
   - Start Command : `cd backend && npm start`
   - Plan : **Free**
   - Ajoutez la variable `DATABASE_URL` avec l'Internal Database URL copiée
   - Cliquez sur **"Create Web Service"**

3. **Créer le Frontend** :
   - **"New +"** → **"Static Site"**
   - Connectez votre dépôt Git
   - Name : `invoice-management-frontend`
   - Root Directory : `frontend`
   - Build Command : `cd frontend && npm install && npm run build`
   - Publish Directory : `dist`
   - Plan : **Free**
   - Cliquez sur **"Create Static Site"**

Puis suivez les étapes 4-7 ci-dessus pour les migrations et configuration.

---

## 🆘 Besoin d'Aide ?

Consultez le fichier **`README-RENDER.md`** pour :
- Plus de détails sur chaque étape
- Résolution de problèmes
- Informations sur les plans et pricing
- Méthode de déploiement manuelle complète

---

## 🔗 URLs Importantes

Après le déploiement, notez ces URLs :

- **Backend** : `https://invoice-management-backend.onrender.com`
- **Frontend** : `https://invoice-management-frontend.onrender.com`
- **API Health Check** : `https://invoice-management-backend.onrender.com/api/health`

