import { useState, useCallback } from 'react';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types';
import { clientService } from '../services/api';
import { useApiList, useApiMutation } from './useApi';

export function useClients(search?: string, limit?: number, skip?: number) {
  const [pagination, setPagination] = useState<any>(null);
  
  const { items, loading, error, refetch, addItem, updateItem, removeItem } = useApiList(
    async () => {
      const result = await clientService.getAll(search, limit, skip);
      if (result.pagination) {
        setPagination(result.pagination);
      }
      return result.data;
    },
    [search, limit, skip]
  );

  const createMutation = useApiMutation(clientService.create);
  const updateMutation = useApiMutation(clientService.update);
  const deleteMutation = useApiMutation(clientService.delete);

  const createClient = useCallback(async (data: CreateClientRequest): Promise<Client | null> => {
    const result = await createMutation.mutate(data);
    if (result) {
      addItem(result);
    }
    return result;
  }, [createMutation, addItem]);

  const updateClient = useCallback(async (id: string, data: UpdateClientRequest): Promise<Client | null> => {
    const result = await updateMutation.mutate({ id, ...data });
    if (result) {
      updateItem(id, result);
    }
    return result;
  }, [updateMutation, updateItem]);

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteMutation.mutate(id);
    if (result !== null) {
      removeItem(id);
      return true;
    }
    return false;
  }, [deleteMutation, removeItem]);

  return {
    clients: items,
    pagination,
    loading: loading || createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: error || createMutation.error || updateMutation.error || deleteMutation.error,
    refetch,
    createClient,
    updateClient,
    deleteClient,
  };
}

export function useClient(id: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await clientService.getById(id);
      setClient(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du client');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(() => {
    fetchClient();
  }, [fetchClient]);

  return { client, loading, error, refetch };
}
