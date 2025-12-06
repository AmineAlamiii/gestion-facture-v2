import React from 'react';
import { Edit, Trash2, Eye, Plus, Package, Printer } from 'lucide-react';
import { PurchaseInvoice } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/invoiceUtils';

interface PurchaseListProps {
  purchases: PurchaseInvoice[];
  onEdit: (purchase: PurchaseInvoice) => void;
  onDelete: (id: string) => void;
  onView: (purchase: PurchaseInvoice) => void;
  onPrint: (purchase: PurchaseInvoice) => void;
  onCreateNew: () => void;
  onViewStock: () => void;
}

const PurchaseList: React.FC<PurchaseListProps> = ({
  purchases,
  onEdit,
  onDelete,
  onView,
  onPrint,
  onCreateNew,
  onViewStock,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800">Factures d'Achat</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={onViewStock}
              className="bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm lg:text-base"
            >
              <Package className="w-4 h-4 mr-2" />
              Stock Produits
            </button>
            <button
              onClick={onCreateNew}
              className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Facture
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-gray-900 text-sm">{purchase.invoiceNumber}</p>
                <p className="text-xs text-gray-600 mt-1">{purchase.supplier?.name || 'N/A'}</p>
              </div>
              <StatusBadge status={purchase.status} />
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-500">{formatDate(purchase.date)}</span>
              <span className="font-medium text-gray-900 text-sm">{formatCurrency(purchase.total)}</span>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onView(purchase)}
                className="text-blue-600 hover:text-blue-900 transition-colors p-1"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(purchase)}
                className="text-green-600 hover:text-green-900 transition-colors p-1"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPrint(purchase)}
                className="text-purple-600 hover:text-purple-900 transition-colors p-1"
                title="Imprimer"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(purchase.id)}
                className="text-red-600 hover:text-red-900 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]">
                N° Facture
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                Fournisseur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                  {purchase.invoiceNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 break-words">
                  {purchase.supplier?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 break-words">
                  {formatDate(purchase.date)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                  {formatCurrency(purchase.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={purchase.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(purchase)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(purchase)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPrint(purchase)}
                      className="text-purple-600 hover:text-purple-900 transition-colors"
                      title="Imprimer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(purchase.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {purchases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-base lg:text-lg">Aucune facture d'achat</p>
          <p className="text-gray-400 mt-2 text-sm lg:text-base">Commencez par créer votre première facture d'achat</p>
        </div>
      )}
    </div>
  );
};

export default PurchaseList;