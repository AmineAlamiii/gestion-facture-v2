import { getDatabase } from '../config/database';
import { 
  PurchaseInvoice, 
  SaleInvoice, 
  CreatePurchaseInvoiceRequest, 
  UpdatePurchaseInvoiceRequest,
  CreateSaleInvoiceRequest,
  UpdateSaleInvoiceRequest,
  InvoiceItem
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export class InvoiceModel {
  private db = getDatabase();

  // === PURCHASE INVOICES ===

  async findAllPurchases(): Promise<PurchaseInvoice[]> {
    const invoices = await this.db.allQuery(`
      SELECT 
        pi.*,
        s.id as supplier_id,
        s.name as supplier_name,
        s.email as supplier_email,
        s.phone as supplier_phone,
        s.address as supplier_address,
        s.taxId as supplier_taxId,
        s.createdAt as supplier_createdAt,
        s.updatedAt as supplier_updatedAt
      FROM purchase_invoices pi
      JOIN suppliers s ON pi.supplierId = s.id
      ORDER BY pi.date DESC, pi.createdAt DESC
    `);

    return Promise.all(invoices.map(invoice => this.formatPurchaseInvoice(invoice)));
  }

  async findPurchaseById(id: string): Promise<PurchaseInvoice | null> {
    const invoice = await this.db.getQuery(`
      SELECT 
        pi.*,
        s.id as supplier_id,
        s.name as supplier_name,
        s.email as supplier_email,
        s.phone as supplier_phone,
        s.address as supplier_address,
        s.taxId as supplier_taxId,
        s.createdAt as supplier_createdAt,
        s.updatedAt as supplier_updatedAt
      FROM purchase_invoices pi
      JOIN suppliers s ON pi.supplierId = s.id
      WHERE pi.id = ?
    `, [id]);

    if (!invoice) return null;
    return this.formatPurchaseInvoice(invoice);
  }

  async createPurchase(data: CreatePurchaseInvoiceRequest): Promise<PurchaseInvoice> {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Calculer les totaux
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
    const total = subtotal + taxAmount;

    // Créer la facture
    await this.db.runQuery(`
      INSERT INTO purchase_invoices (
        id, invoiceNumber, supplierId, date, dueDate, 
        subtotal, taxAmount, total, status, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, data.invoiceNumber, data.supplierId, data.date, data.dueDate,
      subtotal, taxAmount, total, data.status || 'pending', data.notes || '', now, now
    ]);

    // Créer les articles
    for (const item of data.items) {
      const itemId = uuidv4();
      const itemTotal = item.quantity * item.unitPrice;
      
      await this.db.runQuery(`
        INSERT INTO invoice_items (
          id, invoiceId, invoiceType, description, quantity, 
          unitPrice, total, taxRate, createdAt
        ) VALUES (?, ?, 'purchase', ?, ?, ?, ?, ?, ?)
      `, [itemId, id, item.description, item.quantity, item.unitPrice, itemTotal, item.taxRate, now]);
    }

    // Mettre à jour les produits
    await this.updateProductsFromPurchase(id, data.items);

    const invoice = await this.findPurchaseById(id);
    if (!invoice) {
      throw new Error('Erreur lors de la création de la facture d\'achat');
    }
    return invoice;
  }

  async updatePurchase(id: string, data: UpdatePurchaseInvoiceRequest): Promise<PurchaseInvoice | null> {
    const now = new Date().toISOString();
    
    // Si des articles sont fournis, recalculer les totaux
    let subtotal = 0;
    let taxAmount = 0;
    let total = 0;

    if (data.items) {
      subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      taxAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
      total = subtotal + taxAmount;
    }

    // Construire la requête de mise à jour
    const fields = [];
    const values = [];

    if (data.invoiceNumber !== undefined) {
      fields.push('invoiceNumber = ?');
      values.push(data.invoiceNumber);
    }
    if (data.supplierId !== undefined) {
      fields.push('supplierId = ?');
      values.push(data.supplierId);
    }
    if (data.date !== undefined) {
      fields.push('date = ?');
      values.push(data.date);
    }
    if (data.dueDate !== undefined) {
      fields.push('dueDate = ?');
      values.push(data.dueDate);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.items) {
      fields.push('subtotal = ?', 'taxAmount = ?', 'total = ?');
      values.push(subtotal, taxAmount, total);
    }

    if (fields.length > 0) {
      fields.push('updatedAt = ?');
      values.push(now);
      values.push(id);

      await this.db.runQuery(`
        UPDATE purchase_invoices 
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values);

      // Mettre à jour les articles si fournis
      if (data.items) {
        // Supprimer les anciens articles
        await this.db.runQuery(`DELETE FROM invoice_items WHERE invoiceId = ? AND invoiceType = 'purchase'`, [id]);
        
        // Créer les nouveaux articles
        for (const item of data.items) {
          const itemId = uuidv4();
          const itemTotal = item.quantity * item.unitPrice;
          
          await this.db.runQuery(`
            INSERT INTO invoice_items (
              id, invoiceId, invoiceType, description, quantity, 
              unitPrice, total, taxRate, createdAt
            ) VALUES (?, ?, 'purchase', ?, ?, ?, ?, ?, ?)
          `, [itemId, id, item.description, item.quantity, item.unitPrice, itemTotal, item.taxRate, now]);
        }

        // Mettre à jour les produits
        await this.updateProductsFromPurchase(id, data.items);
      }
    }

    return this.findPurchaseById(id);
  }

  async deletePurchase(id: string): Promise<boolean> {
    // Supprimer les articles
    await this.db.runQuery(`DELETE FROM invoice_items WHERE invoiceId = ? AND invoiceType = 'purchase'`, [id]);
    
    // Supprimer la facture
    const result = await this.db.runQuery(`DELETE FROM purchase_invoices WHERE id = ?`, [id]);
    
    return result.changes > 0;
  }

  // === SALE INVOICES ===

  async findAllSales(): Promise<SaleInvoice[]> {
    const invoices = await this.db.allQuery(`
      SELECT 
        si.*,
        c.id as client_id,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        c.address as client_address,
        c.taxId as client_taxId,
        c.createdAt as client_createdAt,
        c.updatedAt as client_updatedAt
      FROM sale_invoices si
      JOIN clients c ON si.clientId = c.id
      ORDER BY si.date DESC, si.createdAt DESC
    `);

    return Promise.all(invoices.map(invoice => this.formatSaleInvoice(invoice)));
  }

  async findSaleById(id: string): Promise<SaleInvoice | null> {
    const invoice = await this.db.getQuery(`
      SELECT 
        si.*,
        c.id as client_id,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        c.address as client_address,
        c.taxId as client_taxId,
        c.createdAt as client_createdAt,
        c.updatedAt as client_updatedAt
      FROM sale_invoices si
      JOIN clients c ON si.clientId = c.id
      WHERE si.id = ?
    `, [id]);

    if (!invoice) return null;
    return this.formatSaleInvoice(invoice);
  }

  async createSale(data: CreateSaleInvoiceRequest): Promise<SaleInvoice> {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Calculer les totaux
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
    const total = subtotal + taxAmount;

    // Créer la facture
    await this.db.runQuery(`
      INSERT INTO sale_invoices (
        id, invoiceNumber, clientId, date, dueDate, 
        subtotal, taxAmount, total, status, notes, basedOnPurchase, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, data.invoiceNumber, data.clientId, data.date, data.dueDate,
      subtotal, taxAmount, total, data.status || 'paid', data.notes || '', data.basedOnPurchase || '', now, now
    ]);

    // Créer les articles
    for (const item of data.items) {
      const itemId = uuidv4();
      const itemTotal = item.quantity * item.unitPrice;
      
      await this.db.runQuery(`
        INSERT INTO invoice_items (
          id, invoiceId, invoiceType, description, quantity, 
          unitPrice, total, taxRate, createdAt
        ) VALUES (?, ?, 'sale', ?, ?, ?, ?, ?, ?)
      `, [itemId, id, item.description, item.quantity, item.unitPrice, itemTotal, item.taxRate, now]);
    }

    const invoice = await this.findSaleById(id);
    if (!invoice) {
      throw new Error('Erreur lors de la création de la facture de vente');
    }
    return invoice;
  }

  async updateSale(id: string, data: UpdateSaleInvoiceRequest): Promise<SaleInvoice | null> {
    const now = new Date().toISOString();
    
    // Si des articles sont fournis, recalculer les totaux
    let subtotal = 0;
    let taxAmount = 0;
    let total = 0;

    if (data.items) {
      subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      taxAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
      total = subtotal + taxAmount;
    }

    // Construire la requête de mise à jour
    const fields = [];
    const values = [];

    if (data.invoiceNumber !== undefined) {
      fields.push('invoiceNumber = ?');
      values.push(data.invoiceNumber);
    }
    if (data.clientId !== undefined) {
      fields.push('clientId = ?');
      values.push(data.clientId);
    }
    if (data.date !== undefined) {
      fields.push('date = ?');
      values.push(data.date);
    }
    if (data.dueDate !== undefined) {
      fields.push('dueDate = ?');
      values.push(data.dueDate);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.basedOnPurchase !== undefined) {
      fields.push('basedOnPurchase = ?');
      values.push(data.basedOnPurchase);
    }
    if (data.items) {
      fields.push('subtotal = ?', 'taxAmount = ?', 'total = ?');
      values.push(subtotal, taxAmount, total);
    }

    if (fields.length > 0) {
      fields.push('updatedAt = ?');
      values.push(now);
      values.push(id);

      await this.db.runQuery(`
        UPDATE sale_invoices 
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values);

      // Mettre à jour les articles si fournis
      if (data.items) {
        // Supprimer les anciens articles
        await this.db.runQuery(`DELETE FROM invoice_items WHERE invoiceId = ? AND invoiceType = 'sale'`, [id]);
        
        // Créer les nouveaux articles
        for (const item of data.items) {
          const itemId = uuidv4();
          const itemTotal = item.quantity * item.unitPrice;
          
          await this.db.runQuery(`
            INSERT INTO invoice_items (
              id, invoiceId, invoiceType, description, quantity, 
              unitPrice, total, taxRate, createdAt
            ) VALUES (?, ?, 'sale', ?, ?, ?, ?, ?, ?)
          `, [itemId, id, item.description, item.quantity, item.unitPrice, itemTotal, item.taxRate, now]);
        }
      }
    }

    return this.findSaleById(id);
  }

  async deleteSale(id: string): Promise<boolean> {
    // Supprimer les articles
    await this.db.runQuery(`DELETE FROM invoice_items WHERE invoiceId = ? AND invoiceType = 'sale'`, [id]);
    
    // Supprimer la facture
    const result = await this.db.runQuery(`DELETE FROM sale_invoices WHERE id = ?`, [id]);
    
    return result.changes > 0;
  }

  // === HELPER METHODS ===

  private async formatPurchaseInvoice(invoice: any): Promise<PurchaseInvoice> {
    const items = await this.getInvoiceItems(invoice.id, 'purchase');
    
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      supplier: {
        id: invoice.supplier_id,
        name: invoice.supplier_name,
        email: invoice.supplier_email,
        phone: invoice.supplier_phone,
        address: invoice.supplier_address,
        taxId: invoice.supplier_taxId,
        createdAt: invoice.supplier_createdAt,
        updatedAt: invoice.supplier_updatedAt,
      },
      date: invoice.date,
      dueDate: invoice.dueDate,
      items,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  private async formatSaleInvoice(invoice: any): Promise<SaleInvoice> {
    const items = await this.getInvoiceItems(invoice.id, 'sale');
    
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      client: {
        id: invoice.client_id,
        name: invoice.client_name,
        email: invoice.client_email,
        phone: invoice.client_phone,
        address: invoice.client_address,
        taxId: invoice.client_taxId,
        createdAt: invoice.client_createdAt,
        updatedAt: invoice.client_updatedAt,
      },
      date: invoice.date,
      dueDate: invoice.dueDate,
      items,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes,
      basedOnPurchase: invoice.basedOnPurchase,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  private async getInvoiceItems(invoiceId: string, type: 'purchase' | 'sale'): Promise<InvoiceItem[]> {
    const items = await this.db.allQuery(`
      SELECT * FROM invoice_items 
      WHERE invoiceId = ? AND invoiceType = ?
      ORDER BY createdAt ASC
    `, [invoiceId, type]);

    return items;
  }

  private async updateProductsFromPurchase(invoiceId: string, items: any[]): Promise<void> {
    for (const item of items) {
      const productKey = item.description.toLowerCase().trim();
      
      // Vérifier si le produit existe
      let product = await this.db.getQuery(`
        SELECT * FROM products WHERE LOWER(description) = ?
      `, [productKey]);

      if (product) {
        // Mettre à jour le produit existant
        const newTotalQuantity = product.totalQuantity + item.quantity;
        const newTotalValue = (product.totalQuantity * product.averageUnitPrice) + (item.quantity * item.unitPrice);
        const newAveragePrice = newTotalValue / newTotalQuantity;

        await this.db.runQuery(`
          UPDATE products 
          SET totalQuantity = ?, averageUnitPrice = ?, lastPurchasePrice = ?, 
              lastPurchaseDate = ?, updatedAt = ?
          WHERE id = ?
        `, [newTotalQuantity, newAveragePrice, item.unitPrice, new Date().toISOString(), new Date().toISOString(), product.id]);
      } else {
        // Créer un nouveau produit
        const productId = uuidv4();
        await this.db.runQuery(`
          INSERT INTO products (
            id, description, totalQuantity, averageUnitPrice, lastPurchasePrice, 
            lastPurchaseDate, supplierId, supplierName, taxRate, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          productId, item.description, item.quantity, item.unitPrice, item.unitPrice,
          new Date().toISOString(), '', '', item.taxRate, new Date().toISOString(), new Date().toISOString()
        ]);
      }

      // Ajouter l'historique d'achat
      const purchaseId = uuidv4();
      const invoice = await this.db.getQuery(`SELECT invoiceNumber FROM purchase_invoices WHERE id = ?`, [invoiceId]);
      
      await this.db.runQuery(`
        INSERT INTO product_purchases (
          id, productId, invoiceId, invoiceNumber, quantity, unitPrice, date, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        purchaseId, product?.id || '', invoiceId, invoice?.invoiceNumber || '', 
        item.quantity, item.unitPrice, new Date().toISOString(), new Date().toISOString()
      ]);
    }
  }
}
