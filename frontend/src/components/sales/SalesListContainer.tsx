import React, { useState } from 'react';
import { useSaleInvoices } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { useProducts } from '../../hooks/useProducts';
import SalesList from './SalesList';
import SalesForm from './SalesForm';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { numberToWords } from '../../utils/invoiceUtils';
import { getApiBaseUrl } from '../../config/api';

const SalesListContainer: React.FC = () => {
  const [editingSale, setEditingSale] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { 
    saleInvoices: sales, 
    loading: salesLoading, 
    error: salesError, 
    createSaleInvoice, 
    updateSaleInvoice, 
    deleteSaleInvoice 
  } = useSaleInvoices();

  const { 
    clients, 
    loading: clientsLoading, 
    error: clientsError 
  } = useClients();

  const { 
    products, 
    loading: productsLoading, 
    error: productsError 
  } = useProducts();

  const handleCreateNew = () => {
    setEditingSale(null);
    setShowForm(true);
  };

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleSave = async (saleData: any) => {
    try {
      // Transformer les données pour correspondre au format attendu par le backend
      const transformedData = {
        invoiceNumber: saleData.invoiceNumber,
        clientId: saleData.client?.id || saleData.clientId,
        date: saleData.date,
        dueDate: saleData.dueDate,
        status: saleData.status,
        paymentMethod: saleData.paymentMethod || 'Espèces',
        notes: saleData.notes || '',
        basedOnPurchase: saleData.basedOnPurchase || '',
        items: saleData.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate
        }))
      };

      if (editingSale) {
        await updateSaleInvoice(editingSale.id, transformedData);
      } else {
        await createSaleInvoice(transformedData);
      }
      setShowForm(false);
      setEditingSale(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSaleInvoice(id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleView = (sale: any) => {
    // TODO: Implémenter la vue détaillée
    console.log('Voir la facture:', sale);
  };

  const handlePrint = async (sale: any) => {
    try {
      // Récupérer les détails complets de la facture
      const response = await fetch(`${getApiBaseUrl()}/invoices/sales/${sale.id}`);
      const result = await response.json();
      
      if (!result.success) {
        console.error('Erreur lors de la récupération de la facture:', result.error);
        alert('Erreur lors de la récupération de la facture');
        return;
      }
      
      const fullSale = result.data;
      
      // Calculer le total TTC (avec TVA)
      const totalTTC = fullSale.total || 0;
      const amountInWords = numberToWords(Math.floor(totalTTC)) + ' DIRHAMS';
      
      // Ouvrir une nouvelle fenêtre pour l'impression
      const printWindow = window.open('', '_blank');
      if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Facture de Vente - ${fullSale.invoiceNumber}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 15px; 
              font-size: 16px;
              line-height: 1.6;
              color: #2c3e50;
            }
            .content {
              padding-bottom: 140px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 35px; 
              padding-bottom: 25px;
            }
            .company-logo {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
              gap: 20px;
            }
            .logo-img {
              max-height: 180px;
              max-width: 400px;
              object-fit: contain;
            }
            .invoice-info { margin-bottom: 25px; font-size: 17px; }
            .client-info { margin-bottom: 25px; font-size: 17px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 2px solid #333; padding: 15px; text-align: left; font-size: 17px; height: 60px; vertical-align: middle; }
            .items-table th { background-color: #f8f9fa; font-weight: bold; font-size: 17px; text-align: center; }
            .total { text-align: right; font-weight: bold; margin-bottom: 20px; }
            .status { padding: 4px 8px; border-radius: 4px; }
            .status.pending { background-color: #fef3c7; color: #92400e; }
            .status.paid { background-color: #d1fae5; color: #065f46; }
            .status.overdue { background-color: #fee2e2; color: #991b1b; }
            .footer {
              padding: 15px 15px;
              text-align: center;
              color: #666;
              font-size: 14px;
              position: fixed;
              bottom: 15px;
              left: 15px;
              right: 15px;
              background-color: white;
              z-index: 1000;
            }
            @media print {
              @page {
                size: A4;
                margin: 0;
                @top-left { content: ""; }
                @top-center { content: ""; }
                @top-right { content: ""; }
                @bottom-left { content: ""; }
                @bottom-center { content: ""; }
                @bottom-right { content: ""; }
              }
              body {
                margin: 0;
                padding: 10mm;
                height: auto;
                overflow: visible;
              }
              .content {
                padding-bottom: 0;
                height: auto;
              }
              .footer {
                position: absolute;
                bottom: 10px;
                left: 10px;
                right: 10px;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="content">
            <div class="main-content">
              <div class="header">
                <div class="company-logo">
                  <img src="/images/image.png" alt="LYOUSR MÉDICAL" class="logo-img" />
                  <p style="color: #2563eb; font-weight: 600; font-size: 18px; margin: 0; letter-spacing: 1px;">SARL AU</p>
                </div>
              </div>
              
              <div class="invoice-info" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div>
                  <p style="font-size: 18px; margin: 5px 0;"><strong style="color: #1e40af;">Date:</strong> <span style="color: #374151;">${new Date(fullSale.date).toLocaleDateString('fr-FR')}</span></p>
                </div>
                <div style="text-align: right;">
                  <p style="font-size: 18px; margin: 5px 0;"><strong style="color: #1e40af;">N° Facture:</strong> <span style="color: #374151;">${fullSale.invoiceNumber}</span></p>
                </div>
              </div>
              
              <div class="client-info" style="margin-bottom: 20px; background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <p style="font-size: 18px; margin: 0;"><strong style="color: #1e40af;">Client:</strong> <span style="color: #374151; font-weight: 500;">${fullSale.client?.name || 'N/A'}</span></p>
              </div>

              <!-- Mode de paiement -->
              <div style="margin-bottom: 30px; background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="font-size: 18px; margin: 0;"><strong style="color: #92400e;">Mode de paiement:</strong> <span style="color: #78350f; font-weight: 500;">${fullSale.paymentMethod || 'Espèces'}</span></p>
              </div>
              
              <!-- Tableau principal -->
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="width: 50%;">Désignation</th>
                    <th style="width: 2%;">Quantité</th>
                    <th style="width: 15%;">Prix U.H.T</th>
                    <th style="width: 15%;">Total H.T</th>
                  </tr>
                </thead>
                <tbody>
                  ${fullSale.items?.map((item: any) => `
                    <tr>
                      <td>${item.description}</td>
                      <td style="text-align: right;">${item.quantity.toFixed(2)}</td>
                      <td style="text-align: right;">${item.unitPrice.toFixed(2)}</td>
                      <td style="text-align: right;">${item.total.toFixed(2)}</td>
                    </tr>
                  `).join('') || ''}
                </tbody>
              </table>
              
              <!-- Tableau des totaux séparé, en dessous et à droite -->
              <div style="display: flex; justify-content: flex-end; margin-top: 25px; margin-bottom: 30px;">
                <table style="width: 280px; border-collapse: collapse; border: 2px solid #333; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tbody>
                    <tr>
                      <td style="padding: 12px 15px; text-align: left; font-weight: bold; border: 2px solid #333; font-size: 16px; background-color: #f8f9fa; color: #1e40af;">Total HT</td>
                      <td style="padding: 12px 15px; text-align: right; border: 2px solid #333; font-size: 16px; background-color: #fff; font-weight: 600;">${fullSale.subtotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 15px; text-align: left; font-weight: bold; border: 2px solid #333; font-size: 16px; background-color: #f8f9fa; color: #1e40af;">TVA 20%</td>
                      <td style="padding: 12px 15px; text-align: right; border: 2px solid #333; font-size: 16px; background-color: #fff; font-weight: 600;">${fullSale.taxAmount?.toFixed(2) || '0.00'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 15px; text-align: left; font-weight: bold; border: 2px solid #333; font-size: 17px; background-color: #2563eb; color: #fff;">Total TTC</td>
                      <td style="padding: 12px 15px; text-align: right; font-weight: bold; border: 2px solid #333; font-size: 17px; background-color: #2563eb; color: #fff;">${fullSale.total?.toFixed(2) || '0.00'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Montant en lettres -->
              <div style="margin-top: 30px; margin-bottom: 30px; font-size: 18px; background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <p style="margin: 0;"><strong style="color: #1e40af;">Arrêtée la présente facture à la somme de :</strong> <span style="color: #374151; font-weight: 600;">${amountInWords}</span></p>
              </div>
              
              ${fullSale.notes ? `
                <div style="margin-top: 40px;">
                  <h3 style="font-size: 17px;">Notes:</h3>
                  <p style="font-size: 15px;">${fullSale.notes}</p>
                </div>
              ` : ''}
            </div>
            
            <footer class="footer">
              <div style="margin-bottom: 12px; font-weight: 600; color: #2563eb; font-size: 15px; letter-spacing: 0.5px;">
                N°3 LOTISSEMENT MABROUKA RUE MOHAMED VI RESIDENCE MOHAMMED VI FES
              </div>
              <div style="margin-bottom: 8px; color: #374151; font-size: 14px; font-weight: 500;">
                TÉL : 05 32 02 57 39 / 06 94 86 41 49
              </div>
              <div style="margin-bottom: 8px; color: #374151; font-size: 14px; font-weight: 500;">
                E-MAIL : Lyourmodomall.com/www.lyousmucial.co
              </div>
              <div style="color: #6b7280; font-size: 13px;">
                RC : 62295 / TP : 14000024 / IF : 45635405 / C.N.SS : 1772459 / ICE : 00222452000023
              </div>
            </footer>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de l\'impression de la facture');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSale(null);
  };

  const loading = salesLoading || clientsLoading || productsLoading;
  const error = salesError || clientsError || productsError;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Chargement des factures de vente..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error}
        className="mb-4"
      />
    );
  }

  if (showForm) {
    return (
      <SalesForm
        sale={editingSale}
        clients={clients}
        products={products}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <SalesList
      sales={sales}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      onPrint={handlePrint}
      onCreateNew={handleCreateNew}
    />
  );
};

export default SalesListContainer;
