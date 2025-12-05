// Point d'entrée serverless pour Vercel
// Ce fichier adapte l'application Express pour fonctionner avec les Serverless Functions de Vercel

const express = require('express');
const cors = require('cors');
const prisma = require('../backend/src/lib/prisma');

const app = express();

// Configuration CORS pour Vercel
const allowedOrigins = [
  'http://localhost:5173', // Développement local
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : [])
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || 
        origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Fonction pour initialiser les données de test (seulement en développement)
async function initTestData() {
  try {
    const supplierCount = await prisma.supplier.count();
    
    if (supplierCount === 0 && process.env.NODE_ENV !== 'production') {
      console.log('📝 Insertion des données de test...');
      
      await prisma.supplier.createMany({
        data: [
          {
            id: 'supplier-1',
            name: 'Fournisseur Tech SARL',
            email: 'contact@fournisseurtech.fr',
            phone: '01 23 45 67 89',
            address: '123 Rue de la Tech, 75001 Paris',
            taxId: 'FR12345678901'
          },
          {
            id: 'supplier-2',
            name: 'Matériaux Pro',
            email: 'info@materiauxpro.fr',
            phone: '01 34 56 78 90',
            address: '456 Avenue des Matériaux, 69000 Lyon',
            taxId: 'FR23456789012'
          }
        ]
      });

      await prisma.client.createMany({
        data: [
          {
            id: 'client-1',
            name: 'Entreprise ABC',
            email: 'contact@abc-entreprise.fr',
            phone: '01 45 67 89 01',
            address: '789 Boulevard du Client, 75008 Paris',
            taxId: 'FR34567890123'
          },
          {
            id: 'client-2',
            name: 'Société XYZ',
            email: 'info@xyz-societe.fr',
            phone: '01 56 78 90 12',
            address: '456 Avenue du Commerce, 69000 Lyon',
            taxId: 'FR45678901234'
          }
        ]
      });

      console.log('✅ Données de test insérées avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données de test:', error);
  }
}

// Routes API - Importées depuis app-prisma.js
// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API fonctionnelle avec Prisma sur Vercel' });
});

// Route pour vérifier les tables
app.get('/api/check-tables', async (req, res) => {
  try {
    const results = {
      suppliers: { count: await prisma.supplier.count() },
      clients: { count: await prisma.client.count() },
      purchaseInvoices: { count: await prisma.purchaseInvoice.count() },
      saleInvoices: { count: await prisma.saleInvoice.count() },
      products: { count: await prisma.product.count() }
    };

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

// Routes des fournisseurs
app.get('/api/suppliers', async (req, res) => {
  try {
    const { search } = req.query;
    
    const suppliers = await prisma.supplier.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

app.get('/api/suppliers/list', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des fournisseurs:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id }
    });

    if (!supplier) {
      res.status(404).json({ success: false, error: `Fournisseur avec l'ID ${id} non trouvé` });
      return;
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, email, phone, address, taxId } = req.body;
    
    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        taxId
      }
    });

    res.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Erreur lors de la création du fournisseur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, taxId } = req.body;
    
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        taxId
      }
    });

    res.json({ success: true, data: supplier });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, error: `Fournisseur avec l'ID ${req.params.id} non trouvé` });
    } else {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
    }
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.supplier.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Fournisseur supprimé avec succès' });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Fournisseur non trouvé' });
    } else {
      console.error('Erreur lors de la suppression du fournisseur:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Routes des clients
app.get('/api/clients', async (req, res) => {
  try {
    const { search } = req.query;
    
    const clients = await prisma.client.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id }
    });

    if (!client) {
      res.status(404).json({ success: false, error: 'Client non trouvé' });
      return;
    }

    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, email, phone, address, taxId } = req.body;
    
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        taxId
      }
    });

    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, taxId } = req.body;
    
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        taxId
      }
    });

    res.json({ success: true, data: client });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Client non trouvé' });
    } else {
      console.error('Erreur lors de la mise à jour du client:', error);
      res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
    }
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.client.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Client supprimé avec succès' });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Client non trouvé' });
    } else {
      console.error('Erreur lors de la suppression du client:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Routes des factures d'achat
app.get('/api/invoices/purchases', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const invoices = await prisma.purchaseInvoice.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformedInvoices = invoices.map(invoice => ({
      ...invoice,
      supplier: invoice.supplier ? {
        id: invoice.supplier.id,
        name: invoice.supplier.name,
        email: invoice.supplier.email
      } : null
    }));

    res.json({ success: true, data: transformedInvoices });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures d\'achat:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

app.get('/api/invoices/purchases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        supplier: true
      }
    });

    if (!invoice) {
      res.status(404).json({ success: false, error: 'Facture d\'achat non trouvée' });
      return;
    }

    const items = await prisma.invoiceItem.findMany({
      where: {
        invoiceId: id,
        invoiceType: 'purchase'
      }
    });

    invoice.items = items;

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture d\'achat:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

app.post('/api/invoices/purchases', async (req, res) => {
  try {
    const { invoiceNumber, supplier, supplierId: directSupplierId, date, dueDate, status, items, notes } = req.body;
    
    const supplierId = directSupplierId || (typeof supplier === 'object' ? supplier.id : supplier);
    
    if (!supplierId) {
      res.status(400).json({ success: false, error: 'ID du fournisseur requis' });
      return;
    }

    const supplierData = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { name: true }
    });
    
    const supplierName = supplierData?.name || (typeof supplier === 'object' ? supplier.name : null) || 'N/A';
    
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
    const total = subtotal + taxAmount;

    const invoice = await prisma.purchaseInvoice.create({
      data: {
        invoiceNumber,
        supplierId,
        date,
        dueDate,
        status,
        subtotal,
        taxAmount,
        total,
        notes
      }
    });

    const createdItems = await Promise.all(
      items.map(item =>
        prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            invoiceType: 'purchase',
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            taxRate: item.taxRate
          }
        })
      )
    );

    invoice.items = createdItems;

    for (const item of items) {
      const existingProduct = await prisma.product.findUnique({
        where: { description: item.description }
      });

      if (existingProduct) {
        const newTotalQuantity = existingProduct.totalQuantity + item.quantity;
        const newAveragePrice = ((existingProduct.averageUnitPrice * existingProduct.totalQuantity) + (item.unitPrice * item.quantity)) / newTotalQuantity;
        
        await prisma.product.update({
          where: { description: item.description },
          data: {
            totalQuantity: newTotalQuantity,
            averageUnitPrice: newAveragePrice,
            lastPurchasePrice: item.unitPrice,
            lastPurchaseDate: date,
            supplierId,
            supplierName,
            taxRate: item.taxRate
          }
        });
      } else {
        await prisma.product.create({
          data: {
            description: item.description,
            totalQuantity: item.quantity,
            averageUnitPrice: item.unitPrice,
            lastPurchasePrice: item.unitPrice,
            lastPurchaseDate: date,
            supplierId,
            supplierName,
            taxRate: item.taxRate
          }
        });
      }
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Erreur lors de la création de la facture d\'achat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/invoices/purchases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      res.status(404).json({ success: false, error: 'Facture d\'achat non trouvée' });
      return;
    }

    const items = await prisma.invoiceItem.findMany({
      where: {
        invoiceId: id,
        invoiceType: 'purchase'
      }
    });

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { description: item.description }
      });

      if (product) {
        const newQuantity = Math.max(0, product.totalQuantity - item.quantity);
        
        if (newQuantity === 0) {
          await prisma.product.delete({
            where: { description: item.description }
          });
        } else {
          await prisma.product.update({
            where: { description: item.description },
            data: { totalQuantity: newQuantity }
          });
        }
      }
    }

    await prisma.purchaseInvoice.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Facture d\'achat supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture d\'achat:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

// Routes des factures de vente
app.get('/api/invoices/sales', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const invoices = await prisma.saleInvoice.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformedInvoices = invoices.map(invoice => ({
      ...invoice,
      client: invoice.client ? {
        id: invoice.client.id,
        name: invoice.client.name,
        email: invoice.client.email
      } : null
    }));

    res.json({ success: true, data: transformedInvoices });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures de vente:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

app.get('/api/invoices/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.saleInvoice.findUnique({
      where: { id },
      include: {
        client: true
      }
    });

    if (!invoice) {
      res.status(404).json({ success: false, error: 'Facture de vente non trouvée' });
      return;
    }

    const items = await prisma.invoiceItem.findMany({
      where: {
        invoiceId: id,
        invoiceType: 'sale'
      }
    });

    invoice.items = items;

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture de vente:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

app.post('/api/invoices/sales', async (req, res) => {
  try {
    const { invoiceNumber, client, clientId: directClientId, date, dueDate, status, paymentMethod, items, notes } = req.body;
    
    const clientId = directClientId || (typeof client === 'object' ? client.id : client);
    
    if (!clientId) {
      res.status(400).json({ success: false, error: 'ID du client requis' });
      return;
    }
    
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
    const total = subtotal + taxAmount;

    const invoice = await prisma.saleInvoice.create({
      data: {
        invoiceNumber,
        clientId,
        date,
        dueDate,
        status,
        subtotal,
        taxAmount,
        total,
        paymentMethod: paymentMethod || 'Espèces',
        notes
      }
    });

    const createdItems = await Promise.all(
      items.map(item =>
        prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            invoiceType: 'sale',
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            taxRate: item.taxRate
          }
        })
      )
    );

    invoice.items = createdItems;

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Erreur lors de la création de la facture de vente:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/invoices/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.saleInvoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      res.status(404).json({ success: false, error: 'Facture de vente non trouvée' });
      return;
    }

    const items = await prisma.invoiceItem.findMany({
      where: {
        invoiceId: id,
        invoiceType: 'sale'
      }
    });

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { description: item.description }
      });

      if (product) {
        const newQuantity = product.totalQuantity + item.quantity;
        
        await prisma.product.update({
          where: { description: item.description },
          data: { totalQuantity: newQuantity }
        });
      }
    }

    await prisma.saleInvoice.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Facture de vente supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture de vente:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

// Routes des produits
app.get('/api/products', async (req, res) => {
  try {
    const { search } = req.query;
    
    const products = await prisma.product.findMany({
      where: search ? {
        description: { contains: search, mode: 'insensitive' }
      } : {},
      include: {
        supplier: true
      },
      orderBy: { description: 'asc' }
    });

    const productsWithPurchases = await Promise.all(
      products.map(async (product) => {
        const invoiceItems = await prisma.invoiceItem.findMany({
          where: {
            invoiceType: 'purchase',
            description: product.description
          },
          orderBy: { createdAt: 'desc' }
        });

        const purchases = await Promise.all(
          invoiceItems.map(async (item) => {
            const purchaseInvoice = await prisma.purchaseInvoice.findUnique({
              where: { id: item.invoiceId },
              select: {
                invoiceNumber: true,
                date: true
              }
            });

            return {
              invoiceId: item.invoiceId,
              invoiceNumber: purchaseInvoice?.invoiceNumber || '',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              date: purchaseInvoice?.date || ''
            };
          })
        );

        return {
          ...product,
          supplierName: product.supplier?.name || product.supplierName || 'N/A',
          supplierId: product.supplierId || '',
          purchases: purchases
        };
      })
    );

    res.json({ success: true, data: productsWithPurchases });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

// Route du tableau de bord
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [
      totalSuppliers,
      totalClients,
      totalPurchaseInvoices,
      totalSaleInvoices,
      totalProducts,
      totalPurchases,
      totalSales
    ] = await Promise.all([
      prisma.supplier.count(),
      prisma.client.count(),
      prisma.purchaseInvoice.count(),
      prisma.saleInvoice.count(),
      prisma.product.count(),
      prisma.purchaseInvoice.aggregate({ _sum: { total: true } }),
      prisma.saleInvoice.aggregate({ _sum: { total: true } })
    ]);

    const profit = (totalSales._sum.total || 0) - (totalPurchases._sum.total || 0);
    const profitMargin = (totalSales._sum.total || 0) > 0 ? (profit / (totalSales._sum.total || 0)) * 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalSuppliers,
          totalClients,
          totalPurchaseInvoices,
          totalSaleInvoices,
          totalProducts,
          totalPurchases: totalPurchases._sum.total || 0,
          totalSales: totalSales._sum.total || 0,
          profit,
          profitMargin
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route non trouvée' });
});

// Export pour Vercel Serverless Functions
// Vercel peut utiliser directement l'app Express
module.exports = app;

