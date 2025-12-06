import React from 'react';
import { FileText, ShoppingCart, Users, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import StatsCard from '../common/StatsCard';
import { useDashboardStats } from '../../hooks/useDashboard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface DashboardProps {
  purchases: any[];
  sales: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ purchases, sales }) => {
  const { data: dashboardStats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
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

  // Utiliser les données du dashboard ou les données locales en fallback
  const stats = dashboardStats?.overview || {
    totalPurchases: purchases.reduce((sum, p) => sum + p.total, 0),
    totalSales: sales.reduce((sum, s) => sum + s.total, 0),
    totalSuppliers: 0,
    totalClients: 0,
    totalPurchaseInvoices: purchases.length,
    totalSaleInvoices: sales.length,
    totalProducts: 0,
    profit: 0,
    profitMargin: 0,
    purchasesChange: 0,
    salesChange: 0,
    profitChange: 0
  };

  const recentActivity = dashboardStats?.recentActivity || {
    recentPurchases: purchases.slice(-5).reverse(),
    recentSales: sales.slice(-5).reverse()
  };

  const profit = stats.profit !== undefined ? stats.profit : (stats.totalSales - stats.totalPurchases);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Achats"
          value={stats.totalPurchases}
          icon={ShoppingCart}
          color="bg-red-500"
          change={{ 
            value: stats.purchasesChange || 0, 
            positive: (stats.purchasesChange || 0) >= 0 
          }}
        />
        <StatsCard
          title="Total Ventes"
          value={stats.totalSales}
          icon={FileText}
          color="bg-blue-500"
          change={{ 
            value: stats.salesChange || 0, 
            positive: (stats.salesChange || 0) >= 0 
          }}
        />
        <StatsCard
          title="Bénéfice"
          value={profit}
          icon={profit >= 0 ? TrendingUp : TrendingDown}
          color={profit >= 0 ? "bg-green-500" : "bg-red-500"}
          change={{ 
            value: stats.profitChange || 0, 
            positive: (stats.profitChange || 0) >= 0 
          }}
        />
        <StatsCard
          title="Factures Total"
          value={`${stats.totalPurchaseInvoices + stats.totalSaleInvoices}`}
          icon={Users}
          color="bg-purple-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Purchases */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800">Achats Récents</h3>
          </div>
          <div className="p-4 lg:p-6">
            {recentActivity.recentPurchases.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun achat récent</p>
            ) : (
              <div className="space-y-3 lg:space-y-4">
                {recentActivity.recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{purchase.invoiceNumber}</p>
                      <p className="text-xs lg:text-sm text-gray-600">{purchase.supplier?.name || purchase.supplierName}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{purchase.total.toFixed(2)} DH</p>
                      <p className="text-xs lg:text-sm text-gray-500">{new Date(purchase.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800">Ventes Récentes</h3>
          </div>
          <div className="p-4 lg:p-6">
            {recentActivity.recentSales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune vente récente</p>
            ) : (
              <div className="space-y-3 lg:space-y-4">
                {recentActivity.recentSales.map((sale) => (
                  <div key={sale.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{sale.invoiceNumber}</p>
                      <p className="text-xs lg:text-sm text-gray-600">{sale.client?.name || sale.clientName}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{sale.total.toFixed(2)} DH</p>
                      <p className="text-xs lg:text-sm text-gray-500">{new Date(sale.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <button className="flex flex-col sm:flex-row items-center justify-center p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 mb-2 sm:mb-0 sm:mr-2" />
            <span className="text-gray-600 text-sm lg:text-base text-center">Nouvelle Facture Achat</span>
          </button>
          <button className="flex flex-col sm:flex-row items-center justify-center p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 mb-2 sm:mb-0 sm:mr-2" />
            <span className="text-gray-600 text-sm lg:text-base text-center">Nouvelle Facture Vente</span>
          </button>
          <button className="flex flex-col sm:flex-row items-center justify-center p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors sm:col-span-2 lg:col-span-1">
            <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 mb-2 sm:mb-0 sm:mr-2" />
            <span className="text-gray-600 text-sm lg:text-base text-center">Nouveau Fournisseur</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;