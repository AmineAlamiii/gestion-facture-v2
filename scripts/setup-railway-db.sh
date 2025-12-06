#!/bin/bash

# Script pour configurer la base de données Railway
# Usage: ./scripts/setup-railway-db.sh

echo "🚀 Configuration de la base de données Railway"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier que DATABASE_URL est défini
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Erreur: DATABASE_URL n'est pas défini${NC}"
    echo ""
    echo "Pour utiliser ce script:"
    echo "  export DATABASE_URL='postgresql://postgres:pass@host:port/railway'"
    echo ""
    echo "Ou utilisez DATABASE_PUBLIC_URL de Railway"
    exit 1
fi

# Aller dans le dossier backend
cd "$(dirname "$0")/../backend" || exit 1

echo "📦 Étape 1: Génération du client Prisma..."
npx prisma generate

echo ""
echo "🔄 Étape 2: Application des migrations sur Railway..."
npx prisma migrate deploy

echo ""
echo "✅ Base de données Railway configurée!"
echo ""
echo "Prochaines étapes:"
echo "  1. Vérifiez que DATABASE_URL est bien configuré dans Vercel"
echo "  2. Redéployez votre application Vercel"
echo "  3. Testez l'API: https://votre-app.vercel.app/api/health"
echo ""

