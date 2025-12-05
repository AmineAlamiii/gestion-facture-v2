import { 
  Supplier, 
  Client, 
  PurchaseInvoice, 
  SaleInvoice, 
  Product,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  CreateClientRequest,
  UpdateClientRequest,
  CreatePurchaseInvoiceRequest,
  UpdatePurchaseInvoiceRequest,
  CreateSaleInvoiceRequest,
  UpdateSaleInvoiceRequest,
  ApiResponse,
  PaginatedResponse
} from '../types';

// Configuration de l'API - Utilise la configuration centralisée
import { getApiBaseUrl } from '../config/api';

// Types pour les réponses de l'API
interface ApiError {
  success: false;
  error: string;
  message?: string;
}

// Classe pour gérer les erreurs API
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Fonction utilitaire pour faire des appels API
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Erreur de réseau ou autre
    throw new ApiError(
      'Erreur de connexion au serveur',
      0,
      { originalError: error }
    );
  }
}

// Service pour les fournisseurs
export const supplierService = {
  async getAll(search?: string): Promise<Supplier[]> {
    const endpoint = search ? `/suppliers?search=${encodeURIComponent(search)}` : '/suppliers';
    const response = await apiCall<ApiResponse<Supplier[]>>(endpoint);
    return response.data || [];
  },

  async getById(id: string): Promise<Supplier> {
    const response = await apiCall<ApiResponse<Supplier>>(`/suppliers/${id}`);
    if (!response.data) {
      throw new ApiError('Fournisseur non trouvé', 404);
    }
    return response.data;
  },

  async create(data: CreateSupplierRequest): Promise<Supplier> {
    const response = await apiCall<ApiResponse<Supplier>>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.data) {
      throw new ApiError('Erreur lors de la création du fournisseur', 500);
    }
    return response.data;
  },

  async update(params: { id: string; data: UpdateSupplierRequest }): Promise<Supplier> {
    const response = await apiCall<ApiResponse<Supplier>>(`/suppliers/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    if (!response.data) {
      throw new ApiError('Erreur lors de la mise à jour du fournisseur', 500);
    }
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiCall<ApiResponse>(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },

  async getStats(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>('/suppliers/stats');
    return response.data;
  },
};

// Service pour les clients
export const clientService = {
  async getAll(search?: string): Promise<Client[]> {
    const endpoint = search ? `/clients?search=${encodeURIComponent(search)}` : '/clients';
    const response = await apiCall<ApiResponse<Client[]>>(endpoint);
    return response.data || [];
  },

  async getById(id: string): Promise<Client> {
    const response = await apiCall<ApiResponse<Client>>(`/clients/${id}`);
    if (!response.data) {
      throw new ApiError('Client non trouvé', 404);
    }
    return response.data;
  },

  async create(data: CreateClientRequest): Promise<Client> {
    const response = await apiCall<ApiResponse<Client>>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.data) {
      throw new ApiError('Erreur lors de la création du client', 500);
    }
    return response.data;
  },

  async update(id: string, data: UpdateClientRequest): Promise<Client> {
    const response = await apiCall<ApiResponse<Client>>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.data) {
      throw new ApiError('Erreur lors de la mise à jour du client', 500);
    }
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiCall<ApiResponse>(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  async getStats(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>('/clients/stats');
    return response.data;
  },
};

// Service pour les factures d'achat
export const purchaseInvoiceService = {
  async getAll(status?: string, search?: string): Promise<PurchaseInvoice[]> {
    let endpoint = '/invoices/purchases';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    const response = await apiCall<ApiResponse<PurchaseInvoice[]>>(endpoint);
    return response.data || [];
  },

  async getById(id: string): Promise<PurchaseInvoice> {
    const response = await apiCall<ApiResponse<PurchaseInvoice>>(`/invoices/purchases/${id}`);
    if (!response.data) {
      throw new ApiError('Facture d\'achat non trouvée', 404);
    }
    return response.data;
  },

  async create(data: CreatePurchaseInvoiceRequest): Promise<PurchaseInvoice> {
    const response = await apiCall<ApiResponse<PurchaseInvoice>>('/invoices/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.data) {
      throw new ApiError('Erreur lors de la création de la facture d\'achat', 500);
    }
    return response.data;
  },

  async update(id: string, data: UpdatePurchaseInvoiceRequest): Promise<PurchaseInvoice> {
    const response = await apiCall<ApiResponse<PurchaseInvoice>>(`/invoices/purchases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.data) {
      throw new ApiError('Erreur lors de la mise à jour de la facture d\'achat', 500);
    }
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiCall<ApiResponse>(`/invoices/purchases/${id}`, {
      method: 'DELETE',
    });
  },
};

// Service pour les factures de vente
export const saleInvoiceService = {
  async getAll(status?: string, search?: string): Promise<SaleInvoice[]> {
    let endpoint = '/invoices/sales';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    const response = await apiCall<ApiResponse<SaleInvoice[]>>(endpoint);
    return response.data || [];
  },

  async getById(id: string): Promise<SaleInvoice> {
    const response = await apiCall<ApiResponse<SaleInvoice>>(`/invoices/sales/${id}`);
    if (!response.data) {
      throw new ApiError('Facture de vente non trouvée', 404);
    }
    return response.data;
  },

  async create(data: CreateSaleInvoiceRequest): Promise<SaleInvoice> {
    const response = await apiCall<ApiResponse<SaleInvoice>>('/invoices/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.data) {
      throw new ApiError('Erreur lors de la création de la facture de vente', 500);
    }
    return response.data;
  },

  async update(id: string, data: UpdateSaleInvoiceRequest): Promise<SaleInvoice> {
    const response = await apiCall<ApiResponse<SaleInvoice>>(`/invoices/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.data) {
      throw new ApiError('Erreur lors de la mise à jour de la facture de vente', 500);
    }
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiCall<ApiResponse>(`/invoices/sales/${id}`, {
      method: 'DELETE',
    });
  },
};

// Service pour les produits
export const productService = {
  async getAll(search?: string, lowStock?: boolean, threshold?: number): Promise<Product[]> {
    let endpoint = '/products';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (lowStock) params.append('lowStock', 'true');
    if (threshold) params.append('threshold', threshold.toString());
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    const response = await apiCall<ApiResponse<Product[]>>(endpoint);
    return response.data || [];
  },

  async getById(id: string): Promise<Product> {
    const response = await apiCall<ApiResponse<Product>>(`/products/${id}`);
    if (!response.data) {
      throw new ApiError('Produit non trouvé', 404);
    }
    return response.data;
  },

  async getByDescription(description: string): Promise<Product> {
    const response = await apiCall<ApiResponse<Product>>(`/products/search/${encodeURIComponent(description)}`);
    if (!response.data) {
      throw new ApiError('Produit non trouvé', 404);
    }
    return response.data;
  },

  async getStats(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>('/products/stats');
    return response.data;
  },

  async getStockReport(): Promise<string> {
    const response = await apiCall<ApiResponse<{ report: string }>>('/products/report/stock');
    return response.data?.report || '';
  },

  async getLowStock(threshold: number = 10): Promise<Product[]> {
    const response = await apiCall<ApiResponse<Product[]>>(`/products/low-stock?threshold=${threshold}`);
    return response.data || [];
  },
};

// Service pour le tableau de bord
export const dashboardService = {
  async getStats(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>('/dashboard/stats');
    return response.data;
  },

  async getCharts(period?: number): Promise<any> {
    const endpoint = period ? `/dashboard/charts?period=${period}` : '/dashboard/charts';
    const response = await apiCall<ApiResponse<any>>(endpoint);
    return response.data;
  },

  async getHealth(): Promise<any> {
    const response = await apiCall<ApiResponse<any>>('/dashboard/health');
    return response.data;
  },
};

// Service de santé de l'API
export const healthService = {
  async check(): Promise<boolean> {
    try {
      const response = await apiCall<ApiResponse<any>>('/health');
      return response.success;
    } catch {
      return false;
    }
  },
};

// Export de la classe d'erreur pour utilisation dans les composants
export { ApiError };
