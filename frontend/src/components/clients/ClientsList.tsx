import React from 'react';
import { Edit, Trash2, Plus, User, Mail, Phone, MapPin } from 'lucide-react';
import { Client } from '../../types';

interface ClientsListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  onEdit,
  onDelete,
  onCreateNew,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800">Clients</h3>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm lg:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Client
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {clients.map((client) => (
          <div key={client.id} className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 text-blue-600 mr-2" />
                  <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-2" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-2" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onEdit(client)}
                className="text-green-600 hover:text-green-900 transition-colors p-1"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(client.id)}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                N° TVA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 break-words">{client.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 break-words">
                  {client.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 break-words">
                  {client.phone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 break-words">
                  {client.address}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 break-words">
                  {client.taxId || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(client)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(client.id)}
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

      {clients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-base lg:text-lg">Aucun client</p>
          <p className="text-gray-400 mt-2 text-sm lg:text-base">Commencez par ajouter votre premier client</p>
        </div>
      )}
    </div>
  );
};

export default ClientsList;