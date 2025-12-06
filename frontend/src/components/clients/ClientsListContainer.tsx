import React, { useState } from 'react';
import { useClients } from '../../hooks/useClients';
import ClientsList from './ClientsList';
import ClientForm from './ClientForm';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import Pagination from '../common/Pagination';

const ClientsListContainer: React.FC = () => {
  const [editingClient, setEditingClient] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  const { 
    clients, 
    pagination,
    loading, 
    error, 
    createClient, 
    updateClient, 
    deleteClient 
  } = useClients(undefined, itemsPerPage, (currentPage - 1) * itemsPerPage);

  const handleCreateNew = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleSave = async (clientData: any) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, clientData);
      } else {
        await createClient(clientData);
      }
      setShowForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Chargement des clients..." />
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
      <ClientForm
        client={editingClient}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = pagination ? Math.ceil(pagination.total / itemsPerPage) : 1;

  return (
    <>
      <ClientsList
        clients={clients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />
      {pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={pagination.total}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}
    </>
  );
};

export default ClientsListContainer;
