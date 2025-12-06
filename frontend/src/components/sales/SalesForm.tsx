import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { SaleInvoice, Client, InvoiceItem, Product } from '../../types';
import { generateInvoiceNumber, calculateTotal, numberToWords } from '../../utils/invoiceUtils';
import SearchableSelect from '../common/SearchableSelect';
import InvoicePreview from './InvoicePreview';

interface SalesFormProps {
  sale?: SaleInvoice;
  clients: Client[];
  products: Product[];
  onSave: (sale: Omit<SaleInvoice, 'id'>) => void;
  onCancel: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({
  sale,
  clients,
  products,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    invoiceNumber: sale?.invoiceNumber || generateInvoiceNumber('VTE'),
    client: sale?.client || null,
    date: sale?.date || new Date().toISOString().split('T')[0],
    dueDate: sale?.dueDate || '',
    status: sale?.status || 'paid' as const,
    paymentMethod: sale?.paymentMethod || 'Espèces',
    notes: sale?.notes || '',
    items: sale?.items || [] as InvoiceItem[],
  });

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const selectedClient = formData.client;

  // Filtrer les produits selon le terme de recherche
  const filteredProducts = products.filter(product =>
    product.description.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.supplierName.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const addProductToSale = (product: Product, margin: number = 30) => {
    const marginMultiplier = 1 + (margin / 100);
    const newItem: InvoiceItem = {
      id: Date.now().toString() + Math.random(),
      description: product.description,
      quantity: 1, // Start with quantity 1, user can modify
      unitPrice: product.averageUnitPrice * marginMultiplier,
      total: product.averageUnitPrice * marginMultiplier,
      taxRate: product.taxRate,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    setShowProductSelector(false);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || formData.items.length === 0) return;

    const total = calculateTotal(formData.items);
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = formData.items.reduce((sum, item) => sum + (item.total * item.taxRate / 100), 0);

    onSave({
      invoiceNumber: formData.invoiceNumber,
      client: selectedClient,
      date: formData.date,
      dueDate: formData.dueDate,
      items: formData.items,
      subtotal,
      taxAmount,
      total,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    });
  };

  const handlePreviewInvoice = () => {
    if (!selectedClient || formData.items.length === 0) return;

    const total = calculateTotal(formData.items);
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = formData.items.reduce((sum, item) => sum + (item.total * item.taxRate / 100), 0);

    const previewInvoice: SaleInvoice = {
      id: sale?.id || 'preview',
      invoiceNumber: formData.invoiceNumber,
      client: selectedClient,
      date: formData.date,
      dueDate: formData.dueDate,
      items: formData.items,
      subtotal,
      taxAmount,
      total,
      status: formData.status,
      notes: formData.notes,
    };

    setShowInvoicePreview(true);
  };

  const handlePrintInvoice = () => {
    if (!selectedClient || formData.items.length === 0) return;

    const total = calculateTotal(formData.items);
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = formData.items.reduce((sum, item) => sum + (item.total * item.taxRate / 100), 0);
    const amountInWords = numberToWords(Math.floor(total)) + ' DIRHAMS';

    // Créer le contenu HTML optimisé pour l'aperçu et l'impression
    const printHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${formData.invoiceNumber}</title>
  <style>
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      line-height: 1.2;
      color: #333;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
      background: white;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 5mm;
      background: white;
      height: 277mm;
    }
    .header {
      background: #2563eb;
      color: white;
      padding: 15px;
      text-align: center;
      margin-bottom: 15px;
      border-radius: 8px;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    .header h1 {
      font-size: 20px;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .header p {
      margin: 2px 0;
      font-size: 11px;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .invoice-title {
      font-size: 24px;
      color: #1f2937;
      font-weight: bold;
    }
    .invoice-number {
      font-size: 12px;
      color: #6b7280;
      margin-top: 3px;
    }
    .dates {
      background: #f3f4f6;
      padding: 10px;
      border-radius: 8px;
      text-align: right;
      min-width: 150px;
    }
    .dates p {
      margin: 3px 0;
      font-size: 11px;
    }
    .dates strong {
      color: #1f2937;
      font-weight: bold;
    }
    .client-section {
      margin-bottom: 15px;
    }
    .client-section h3 {
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 14px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 3px;
      font-weight: bold;
    }
    .client-info {
      background: #f9fafb;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .client-name {
      font-weight: bold;
      font-size: 13px;
      color: #1f2937;
      margin-bottom: 5px;
    }
    .client-details p {
      margin: 3px 0;
      color: #4b5563;
      font-size: 11px;
    }
    .items-section {
      margin-bottom: 15px;
    }
    .items-section h3 {
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 14px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 3px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    th {
      background: #2563eb;
      color: white;
      padding: 8px 6px;
      text-align: left;
      font-weight: bold;
      font-size: 11px;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    td {
      padding: 6px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 10px;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 15px;
    }
    .totals {
      background: #f9fafb;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      min-width: 200px;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      padding: 3px 0;
      font-size: 11px;
    }
    .total-final {
      border-top: 2px solid #2563eb;
      padding-top: 8px;
      margin-top: 8px;
      font-weight: bold;
      font-size: 13px;
    }
    .total-final .amount {
      color: #2563eb;
      font-weight: bold;
    }
    .notes-section {
      margin-bottom: 15px;
    }
    .notes-section h4 {
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: bold;
    }
    .notes-content {
      background: #fef3c7;
      padding: 10px;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      font-size: 10px;
    }
    .conditions-section {
      margin-bottom: 15px;
    }
    .conditions-section h4 {
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: bold;
    }
    .conditions-content {
      background: #dbeafe;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .conditions-content ul {
      padding-left: 15px;
    }
    .conditions-content li {
      margin-bottom: 4px;
      color: #4b5563;
      font-size: 10px;
    }
    .footer {
      background: #374151;
      color: white;
      padding: 15px;
      text-align: center;
      border-radius: 8px;
      margin-top: 15px;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    .footer p {
      margin: 3px 0;
      font-size: 10px;
    }
    .footer .company-name {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 5px;
    }
    .footer .legal-info {
      font-size: 9px;
      color: #d1d5db;
    }
    .footer .website {
      color: #93c5fd;
      margin-top: 5px;
      font-size: 10px;
    }
    
    /* Styles pour l'aperçu à l'écran */
    @media screen {
      body {
        background: #f5f5f5;
        padding: 10px;
      }
      .container {
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
      }
    }
    
    /* Bouton d'impression flottant */
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      z-index: 1000;
      transition: all 0.3s ease;
    }
    .print-button:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }
    
    @media print {
      .print-button {
        display: none;
      }
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      .container {
        box-shadow: none;
        border-radius: 0;
        height: auto;
        margin: 0;
        padding: 10mm;
      }
      @page {
        margin: 0;
        size: A4;
      }
    }
  </style>
  <script>
    function printInvoice() {
      window.print();
    }
    
    // Auto-focus pour permettre Ctrl+P immédiatement
    window.onload = function() {
      document.body.focus();
    }
    
    // Raccourci clavier Ctrl+P
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printInvoice();
      }
    });
  </script>
</head>
<body>
  <button class="print-button" onclick="printInvoice()">🖨️ Imprimer (Ctrl+P)</button>
  
  <div class="container">
    <!-- En-tête -->
    <div class="header">
      <h1>VOTRE ENTREPRISE</h1>
      <p>Solutions professionnelles</p>
      <p>N°3 LOTISSEMENT MABROUKA RUE MOHAMED VI, RESIDENCE MOHAMMED VI FES</p>
      <p>Tél: 05 32 02 57 39 / 06 94 86 41 49 | Email: Lyourmodomall.com</p>
      <p>RC: 62295 / TP: 14000024 / IF: 45635405 / C.N.SS: 1772459 / ICE: 00222452000023</p>
    </div>

    <!-- En-tête facture -->
    <div class="invoice-header">
      <div>
        <div class="invoice-title">FACTURE</div>
        <div class="invoice-number">N° ${formData.invoiceNumber}</div>
      </div>
      <div class="dates">
        <p><strong>Date d'émission:</strong></p>
        <p>${new Date(formData.date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Date d'échéance:</strong></p>
        <p>${new Date(formData.dueDate).toLocaleDateString('fr-FR')}</p>
      </div>
    </div>

    <!-- Informations client -->
    <div class="client-section">
      <h3>Facturé à:</h3>
      <div class="client-info">
        <div class="client-name">${selectedClient.name}</div>
        <div class="client-details">
          <p>${selectedClient.address}</p>
          <p>Email: ${selectedClient.email}</p>
          <p>Téléphone: ${selectedClient.phone}</p>
          ${selectedClient.taxId ? `<p>N° TVA: ${selectedClient.taxId}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Articles -->
    <div class="items-section">
      <h3>Détail des prestations</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-center">Qté</th>
            <th class="text-right">Prix unit.</th>
            <th class="text-center">TVA</th>
            <th class="text-right">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${formData.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${item.unitPrice.toFixed(2)} DH</td>
              <td class="text-center">${item.taxRate}%</td>
              <td class="text-right"><strong>${item.total.toFixed(2)} DH</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Totaux -->
    <div class="totals-section">
      <div class="totals">
        <div class="total-line">
          <span>Sous-total HT:</span>
          <span><strong>${subtotal.toFixed(2)} DH</strong></span>
        </div>
        <div class="total-line">
          <span>TVA:</span>
          <span><strong>${taxAmount.toFixed(2)} DH</strong></span>
        </div>
        <div class="total-line total-final">
          <span>Total TTC:</span>
          <span class="amount">${total.toFixed(2)} DH</span>
        </div>
      </div>
    </div>

    <!-- Montant en toutes lettres -->
    <div class="amount-in-words-section" style="margin-bottom: 15px; text-align: center;">
      <p style="font-size: 14px; font-weight: bold; color: #1f2937;">
        Arrêtée la présente facture à la somme de : ${amountInWords}
      </p>
    </div>

    ${formData.notes ? `
    <!-- Notes -->
    <div class="notes-section">
      <h4>Notes:</h4>
      <div class="notes-content">
        ${formData.notes}
      </div>
    </div>
    ` : ''}

    <!-- Conditions de paiement -->
    <div class="conditions-section">
      <h4>Conditions de paiement</h4>
      <div class="conditions-content">
        <ul>
          <li>Paiement à réception de facture</li>
          <li>Pénalités de retard: 3 fois le taux d'intérêt légal</li>
          <li>Indemnité forfaitaire pour frais de recouvrement: 40 DH</li>
          <li>Escompte pour paiement anticipé: nous consulter</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="company-name" style="color: #93c5fd; font-weight: bold; margin-bottom: 8px;">N°3 LOTISSEMENT MABROUKA RUE MOHAMED VI RESIDENCE MOHAMMED VI FES</p>
      <p class="legal-info">TÉL : 05 32 02 57 39 / 06 94 86 41 49</p>
      <p class="legal-info">E-MAIL : Lyourmodomall.com/www.lyousmucial.co</p>
      <p class="legal-info">RC : 62295 / TP : 14000024 / IF : 45635405 / C.N.SS : 1772459 / ICE : 00222452000023</p>
    </div>
  </div>
</body>
</html>`;

    // Créer un blob et ouvrir dans un nouvel onglet
    const blob = new Blob([printHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Ouvrir dans un nouvel onglet
    try {
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.focus();
        // Nettoyer l'URL après un délai
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } else {
        // Si popup bloquée, créer un lien de téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.download = `Facture_${formData.invoiceNumber}.html`;
        link.click();
        URL.revokeObjectURL(url);
        alert('Popup bloquée. Le fichier a été téléchargé. Ouvrez-le pour imprimer.');
      }
    } catch (error) {
      // En cas d'erreur, télécharger le fichier
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${formData.invoiceNumber}.html`;
      link.click();
      URL.revokeObjectURL(url);
      console.log('Erreur popup, fichier téléchargé à la place');
    }
  };

  // Fonction pour imprimer directement depuis l'aperçu
  const printFromPreview = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-base lg:text-lg font-semibold text-gray-800">
          {sale ? 'Modifier la facture de vente' : 'Nouvelle facture de vente'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de facture
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <SearchableSelect
              options={clients}
              value={formData.client?.id || ''}
              onChange={(client) => setFormData({ ...formData, client })}
              placeholder="Sélectionner un client"
              label="Client"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="paid">Payé</option>
                <option value="overdue">En retard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Espèces">Espèces</option>
                <option value="Chèque">Chèque</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Carte bancaire">Carte bancaire</option>
                <option value="Traite">Traite</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-800">Produits</h4>
              <button
                type="button"
                onClick={() => setShowProductSelector(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ajouter Produit
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix unitaire
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TVA (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={item.taxRate}
                        onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-right">
                    <span className="text-sm font-medium text-gray-700">
                      Total: {(item.total + (item.total * item.taxRate / 100)).toFixed(2)} DH
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {formData.items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun produit ajouté</p>
                <p className="text-gray-400 text-sm">Cliquez sur "Ajouter Produit" pour commencer</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {formData.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total TTC:</span>
                <span>{calculateTotal(formData.items).toFixed(2)} DH</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 lg:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base"
            >
              Annuler
            </button>
            {formData.items.length > 0 && selectedClient && (
              <button
                type="button"
                onClick={handlePreviewInvoice}
                className="px-4 lg:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base"
              >
                Aperçu Facture
              </button>
            )}
            <button
              type="submit"
              className="px-4 lg:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
              disabled={formData.items.length === 0}
            >
              {sale ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>

      {/* Invoice Preview Modal */}
      {showInvoicePreview && selectedClient && (
        <InvoicePreview
          invoice={{
            id: sale?.id || 'preview',
            invoiceNumber: formData.invoiceNumber,
            client: selectedClient,
            date: formData.date,
            dueDate: formData.dueDate,
            items: formData.items,
            subtotal: formData.items.reduce((sum, item) => sum + item.total, 0),
            taxAmount: formData.items.reduce((sum, item) => sum + (item.total * item.taxRate / 100), 0),
            total: calculateTotal(formData.items),
            status: formData.status,
            notes: formData.notes,
          }}
          onClose={() => setShowInvoicePreview(false)}
          onPrint={handlePrintInvoice}
        />
      )}

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">Sélectionner un produit</h3>
              <button 
                onClick={() => {
                  setShowProductSelector(false);
                  setProductSearchTerm('');
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Barre de recherche */}
              <div className="mb-4">
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Rechercher un produit par nom ou fournisseur..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Stock: {product.totalQuantity} • Dernier fournisseur: {product.supplierName}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Prix moyen: {product.averageUnitPrice.toFixed(2)} DH</span>
                          <span>Dernier prix: {product.lastPurchasePrice.toFixed(2)} DH</span>
                          <span>TVA: {product.taxRate}%</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addProductToSale(product, 30)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors font-semibold"
                        >
                          +30%
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && products.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun produit trouvé</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Essayez avec un autre terme de recherche
                  </p>
                </div>
              )}

              {products.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun produit disponible</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Créez d'abord des factures d'achat
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesForm;