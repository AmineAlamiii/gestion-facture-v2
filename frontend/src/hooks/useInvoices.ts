import { useState, useCallback } from 'react';
import { 
  PurchaseInvoice, 
  SaleInvoice, 
  CreatePurchaseInvoiceRequest, 
  UpdatePurchaseInvoiceRequest,
  CreateSaleInvoiceRequest,
  UpdateSaleInvoiceRequest
} from '../types';
import { purchaseInvoiceService, saleInvoiceService } from '../services/api';
import { useApiList, useApiMutation } from './useApi';

// Hook pour les factures d'achat
export function usePurchaseInvoices(status?: string, search?: string, limit?: number, skip?: number) {
  const [pagination, setPagination] = useState<any>(null);
  
  const { items, loading, error, refetch, addItem, updateItem, removeItem } = useApiList(
    async () => {
      const result = await purchaseInvoiceService.getAll(status, search, limit, skip);
      if (result.pagination) {
        setPagination(result.pagination);
      }
      return result.data;
    },
    [status, search, limit, skip]
  );

  const createMutation = useApiMutation(purchaseInvoiceService.create);
  const updateMutation = useApiMutation(purchaseInvoiceService.update);
  const deleteMutation = useApiMutation(purchaseInvoiceService.delete);

  const createPurchaseInvoice = useCallback(async (data: CreatePurchaseInvoiceRequest): Promise<PurchaseInvoice | null> => {
    const result = await createMutation.mutate(data);
    if (result) {
      addItem(result);
    }
    return result;
  }, [createMutation, addItem]);

  const updatePurchaseInvoice = useCallback(async (id: string, data: UpdatePurchaseInvoiceRequest): Promise<PurchaseInvoice | null> => {
    const result = await updateMutation.mutate({ id, ...data });
    if (result) {
      updateItem(id, result);
    }
    return result;
  }, [updateMutation, updateItem]);

  const deletePurchaseInvoice = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteMutation.mutate(id);
    if (result !== null) {
      removeItem(id);
      return true;
    }
    return false;
  }, [deleteMutation, removeItem]);

  return {
    purchaseInvoices: items,
    pagination,
    loading: loading || createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: error || createMutation.error || updateMutation.error || deleteMutation.error,
    refetch,
    createPurchaseInvoice,
    updatePurchaseInvoice,
    deletePurchaseInvoice,
  };
}

// Hook pour les factures de vente
export function useSaleInvoices(status?: string, search?: string, limit?: number, skip?: number) {
  const [pagination, setPagination] = useState<any>(null);
  
  const { items, loading, error, refetch, addItem, updateItem, removeItem } = useApiList(
    async () => {
      const result = await saleInvoiceService.getAll(status, search, limit, skip);
      if (result.pagination) {
        setPagination(result.pagination);
      }
      return result.data;
    },
    [status, search, limit, skip]
  );

  const createMutation = useApiMutation(saleInvoiceService.create);
  const updateMutation = useApiMutation(saleInvoiceService.update);
  const deleteMutation = useApiMutation(saleInvoiceService.delete);

  const createSaleInvoice = useCallback(async (data: CreateSaleInvoiceRequest): Promise<SaleInvoice | null> => {
    const result = await createMutation.mutate(data);
    if (result) {
      addItem(result);
    }
    return result;
  }, [createMutation, addItem]);

  const updateSaleInvoice = useCallback(async (id: string, data: UpdateSaleInvoiceRequest): Promise<SaleInvoice | null> => {
    const result = await updateMutation.mutate({ id, ...data });
    if (result) {
      updateItem(id, result);
    }
    return result;
  }, [updateMutation, updateItem]);

  const deleteSaleInvoice = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteMutation.mutate(id);
    if (result !== null) {
      removeItem(id);
      return true;
    }
    return false;
  }, [deleteMutation, removeItem]);

  return {
    saleInvoices: items,
    pagination,
    loading: loading || createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: error || createMutation.error || updateMutation.error || deleteMutation.error,
    refetch,
    createSaleInvoice,
    updateSaleInvoice,
    deleteSaleInvoice,
  };
}

// Hook pour une facture d'achat spécifique
export function usePurchaseInvoice(id: string) {
  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await purchaseInvoiceService.getById(id);
      setInvoice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la facture d\'achat');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return { invoice, loading, error, refetch };
}

// Hook pour une facture de vente spécifique
export function useSaleInvoice(id: string) {
  const [invoice, setInvoice] = useState<SaleInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await saleInvoiceService.getById(id);
      setInvoice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la facture de vente');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return { invoice, loading, error, refetch };
}
