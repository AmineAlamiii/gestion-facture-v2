import React, { useState } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardContainer from './components/dashboard/DashboardContainer';
import PurchaseListContainer from './components/purchases/PurchaseListContainer';
import SalesListContainer from './components/sales/SalesListContainer';
import ClientsListContainer from './components/clients/ClientsListContainer';
import SuppliersListContainer from './components/suppliers/SuppliersListContainer';
import ProductStockContainer from './components/products/ProductStockContainer';

function AppContent() {
  const { isAuthenticated, login, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProductStock, setShowProductStock] = useState(false);

  // Écouter les événements de déconnexion automatique (token expiré)
  React.useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [logout]);

  const handleViewStock = () => {
    setShowProductStock(true);
  };

  const handleCloseStock = () => {
    setShowProductStock(false);
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Tableau de Bord';
      case 'purchases':
        return 'Factures d\'Achat';
      case 'sales':
        return 'Factures de Vente';
      case 'clients':
        return 'Clients';
      case 'suppliers':
        return 'Fournisseurs';
      case 'products':
        return 'Stock des Produits';
      default:
        return 'Gestion de Factures';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContainer />;
      case 'purchases':
        return <PurchaseListContainer />;
      case 'sales':
        return <SalesListContainer />;
      case 'clients':
        return <ClientsListContainer />;
      case 'suppliers':
        return <SuppliersListContainer />;
      case 'products':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock des Produits</h3>
              <p className="text-gray-600 mb-6">
                Consultez et gérez le stock de vos produits
              </p>
              <button
                onClick={handleViewStock}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voir le Stock
              </button>
            </div>
          </div>
        );
      default:
        return <DashboardContainer />;
    }
  };

  // Si l'utilisateur n'est pas authentifié, afficher la page de login
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 lg:flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="flex-1 flex flex-col lg:ml-0">
          <Header title={getSectionTitle()} />
          
          <main className="flex-1 p-4 lg:p-6">
            {renderContent()}
          </main>
        </div>
      </div>

      {showProductStock && (
        <ProductStockContainer onClose={handleCloseStock} />
      )}
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;