import { useState, useCallback } from 'react';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../types';
import { supplierService } from '../services/api';
import { useApiList, useApiMutation } from './useApi';

export function useSuppliers(search?: string, limit?: number, skip?: number) {
  const [pagination, setPagination] = useState<any>(null);
  
  const { items, loading, error, refetch, addItem, updateItem, removeItem } = useApiList(
    async () => {
      const result = await supplierService.getAll(search, limit, skip);
      if (result.pagination) {
        setPagination(result.pagination);
      }
      return result.data;
    },
    [search, limit, skip]
  );

  const createMutation = useApiMutation(supplierService.create);
  const updateMutation = useApiMutation(supplierService.update);
  const deleteMutation = useApiMutation(supplierService.delete);

  const createSupplier = useCallback(async (data: CreateSupplierRequest): Promise<Supplier | null> => {
    const result = await createMutation.mutate(data);
    if (result) {
      addItem(result);
    }
    return result;
  }, [createMutation, addItem]);

  const updateSupplier = useCallback(async (id: string, data: UpdateSupplierRequest): Promise<Supplier | null> => {
    const result = await updateMutation.mutate({ id, ...data });
    if (result) {
      updateItem(id, result);
    }
    return result;
  }, [updateMutation, updateItem]);

  const deleteSupplier = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteMutation.mutate(id);
    if (result !== null) {
      removeItem(id);
      return true;
    }
    return false;
  }, [deleteMutation, removeItem]);

  return {
    suppliers: items,
    pagination,
    loading: loading || createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: error || createMutation.error || updateMutation.error || deleteMutation.error,
    refetch,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
}

export function useSupplier(id: string) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplier = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await supplierService.getById(id);
      setSupplier(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du fournisseur');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  return { supplier, loading, error, refetch };
}
