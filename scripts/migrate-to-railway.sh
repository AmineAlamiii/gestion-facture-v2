#!/bin/bash

# Script de migration de Neon vers Railway
# Usage: ./scripts/migrate-to-railway.sh

echo "🚀 Migration de Neon vers Railway"
echo "=================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que DATABASE_URL est défini
if [ -z "$RAILWAY_DATABASE_URL" ]; then
    echo -e "${RED}❌ Erreur: RAILWAY_DATABASE_URL n'est pas défini${NC}"
    echo ""
    echo "Pour utiliser ce script:"
    echo "  export RAILWAY_DATABASE_URL='postgresql://user:pass@host:port/db'"
    echo ""
    exit 1
fi

echo -e "${YELLOW}⚠️  ATTENTION: Ce script va migrer vos données vers Railway${NC}"
echo "Assurez-vous d'avoir:"
echo "  1. Créé une base de données PostgreSQL sur Railway"
echo "  2. Récupéré la DATABASE_URL de Railway"
echo "  3. Sauvegardé vos données de Neon"
echo ""
read -p "Continuer? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration annulée"
    exit 0
fi

# Aller dans le dossier backend
cd "$(dirname "$0")/../backend" || exit 1

echo ""
echo "📦 Étape 1: Génération du client Prisma..."
npx prisma generate

echo ""
echo "🔄 Étape 2: Application des migrations sur Railway..."
export DATABASE_URL="$RAILWAY_DATABASE_URL"
npx prisma migrate deploy

echo ""
echo "✅ Migration terminée!"
echo ""
echo "Prochaines étapes:"
echo "  1. Mettez à jour DATABASE_URL dans Vercel"
echo "  2. Redéployez votre application"
echo "  3. Testez que tout fonctionne"
echo ""

