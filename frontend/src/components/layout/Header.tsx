import React from 'react';
import { User, LogOut } from 'lucide-react';
import { ApiStatus } from '../common/ApiStatus';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4 ml-0 lg:ml-0">
      <div className="flex items-center justify-between">
        <div className="ml-12 lg:ml-0">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          <ApiStatus />
          
          <div className="flex items-center space-x-1 lg:space-x-2">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
            </div>
            <span className="text-xs lg:text-sm font-medium text-gray-700 hidden sm:block">Med</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-xs lg:text-sm font-medium hidden sm:block">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;