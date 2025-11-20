import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, ShoppingBag, Package, Users } from 'lucide-react';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  pendingOrdersCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, pendingOrdersCount }) => {
  
  const navItems = [
    { id: Tab.DASHBOARD, label: 'Painel', icon: LayoutDashboard },
    { id: Tab.ORDERS, label: 'Pedidos', icon: ShoppingBag },
    { id: Tab.PRODUCTS, label: 'Produtos', icon: Package },
    { id: Tab.CUSTOMERS, label: 'Clientes', icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-wa-header border-t border-[#2a3942] py-2 px-2 z-40 flex justify-between items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-full py-1 relative group`}
          >
            <div className={`px-5 py-1 rounded-full transition-colors ${isActive ? 'bg-wa-green/20' : 'bg-transparent'}`}>
               <Icon 
                  className={`w-6 h-6 transition-colors ${isActive ? 'text-wa-green' : 'text-wa-textSecondary group-hover:text-wa-textPrimary'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
            </div>
            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-wa-textPrimary' : 'text-wa-textSecondary'}`}>
              {item.label}
            </span>

            {/* Badge for Orders */}
            {item.id === Tab.ORDERS && pendingOrdersCount > 0 && (
              <div className="absolute top-0 right-[25%] w-5 h-5 bg-wa-green text-black text-xs font-bold rounded-full flex items-center justify-center border-2 border-wa-header">
                {pendingOrdersCount}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;