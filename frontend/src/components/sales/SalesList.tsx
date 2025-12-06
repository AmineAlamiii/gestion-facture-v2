import React from 'react';
import { Edit, Trash2, Eye, Plus, Printer } from 'lucide-react';
import { SaleInvoice } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/invoiceUtils';

interface SalesListProps {
  sales: SaleInvoice[];
  onEdit: (sale: SaleInvoice) => void;
  onDelete: (id: string) => void;
  onView: (sale: SaleInvoice) => void;
  onPrint: (sale: SaleInvoice) => void;
  onCreateNew: () => void;
}

const SalesList: React.FC<SalesListProps> = ({
  sales,
  onEdit,
  onDelete,
  onView,
  onPrint,
  onCreateNew,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800">Factures de Vente</h3>
            <button
              onClick={onCreateNew}
              className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm lg:text-base w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Facture
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {sales.map((sale) => (
            <div key={sale.id} className="p-4 border-b border-gray-200 last:border-b-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{sale.invoiceNumber}</p>
                  <p className="text-xs text-gray-600 mt-1">{sale.client?.name || 'N/A'}</p>
                </div>
                <StatusBadge status={sale.status} />
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500">{formatDate(sale.date)}</span>
                <span className="font-medium text-gray-900 text-sm">{formatCurrency(sale.total)}</span>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onView(sale)}
                  className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(sale)}
                  className="text-green-600 hover:text-green-900 transition-colors p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onPrint(sale)}
                  className="text-purple-600 hover:text-purple-900 transition-colors p-1"
                  title="Imprimer"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(sale.id)}
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
                  Client
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
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                    {sale.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 break-words">
                    {sale.client?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 break-words">
                    {formatDate(sale.date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={sale.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(sale)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(sale)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPrint(sale)}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                        title="Imprimer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(sale.id)}
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

        {sales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune facture de vente</p>
            <p className="text-gray-400 mt-2">Commencez par créer votre première facture de vente</p>
          </div>
        )}
      </div>
  );
};

export default SalesList;