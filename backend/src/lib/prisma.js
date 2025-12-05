const { PrismaClient } = require('@prisma/client');

// Configuration Prisma pour Vercel Serverless Functions
// Utilise globalThis pour éviter les multiples instances dans l'environnement serverless
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// En production (Vercel), on garde l'instance dans globalThis pour réutilisation
if (process.env.NODE_ENV === 'production') {
  globalForPrisma.prisma = prisma;
} else {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
