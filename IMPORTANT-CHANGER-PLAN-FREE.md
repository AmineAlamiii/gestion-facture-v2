# ⚠️ IMPORTANT : Changer le Plan en "Free" sur Render

## 🎯 Problème

Lorsque vous créez un Blueprint sur Render, il sélectionne par défaut le plan **"Starter" ($7/mois)** au lieu du plan **"Free" (gratuit)**.

## ✅ Solution : Comment Changer le Plan en "Free"

### Étape 1 : Voir le Résumé du Blueprint

Quand Render affiche le résumé de votre Blueprint avec :
- "Review render.yaml configurations"
- "Estimated pricing: $7 per month"
- Service `invoice-management-backend` avec "(Starter) $7 / month"

**NE CLIQUEZ PAS ENCORE sur "Deploy Blueprint" !**

### Étape 2 : Changer le Plan du Backend

1. **Cliquez sur le service `invoice-management-backend`** dans la liste
   - Ou cherchez un bouton "Edit" / "Configure" à côté du service

2. Une fenêtre ou une section de configuration s'ouvrira

3. **Cherchez** l'une de ces options :
   - **"Instance Type"**
   - **"Plan"**
   - **"Pricing Plan"**
   - Un menu déroulant avec "Starter" sélectionné

4. **Changez** :
   - De **"Starter"** ou **"Starter $7/mois"**
   - À **"Free"** ou **"Starter Free"** ou **"Free Tier"**

5. **Vérifiez** :
   - Le prix devrait changer de **$7/mois** à **$0/mois** ou **"Free"**
   - Fermez la fenêtre de configuration

### Étape 3 : Vérifier le Prix Total

1. Regardez la section **"Estimated pricing"** en bas de la page
2. Le **"Total"** devrait maintenant être **"$0 per month"** au lieu de **"$7 per month"**
3. Si c'est encore $7, répétez l'étape 2

### Étape 4 : Déployer

Une fois que le prix affiche **$0/mois**, vous pouvez :
- Cliquer sur **"Deploy Blueprint"** ou **"Apply"**
- Le déploiement commencera avec le plan gratuit

## 💡 Notes Importantes

- ⚠️ **Ne déployez PAS si le prix est encore $7/mois** - vous seriez facturé
- ✅ Le plan **Free** mettra le service en veille après 15 minutes d'inactivité
- ✅ Pour le **frontend (site statique)**, il est généralement gratuit automatiquement
- ✅ Si vous ne trouvez pas l'option pour changer le plan, essayez de :
  - Cliquer sur "Edit" à côté du service
  - Scroller vers le bas dans la configuration
  - Chercher dans les paramètres avancés

## 🔄 Alternative : Déploiement Manuel

Si vous avez des difficultés à changer le plan dans le Blueprint :
1. Annulez le Blueprint
2. Utilisez la **Méthode Manuelle** (voir `GUIDE-DEPLOIEMENT-RENDER.md`)
3. Lors de la création manuelle de chaque service, vous pourrez sélectionner le plan "Free" directement

## 📝 Checklist

Avant de cliquer sur "Deploy Blueprint" :

- [ ] Le service backend affiche **"Free"** ou **"$0/mois"** et non **"Starter $7/mois"**
- [ ] Le **"Total"** dans "Estimated pricing" affiche **"$0 per month"**
- [ ] Vous êtes sûr que vous ne serez pas facturé

Une fois ces vérifications faites, vous pouvez déployer en toute sécurité ! 🚀


