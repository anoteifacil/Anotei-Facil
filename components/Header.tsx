
import React from 'react';
import { Search, Store } from 'lucide-react';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchValue?: string;
  onProfileClick?: () => void;
  searchPlaceholder?: string;
}

const Header: React.FC<HeaderProps> = ({ title, showSearch, onSearch, searchValue, onProfileClick, searchPlaceholder }) => {
  return (
    <div className="bg-wa-header p-4 sticky top-0 z-20 shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-wa-textPrimary text-xl font-bold">{title}</h1>
        <div className="flex space-x-4 text-wa-textPrimary">
          {/* Removed Camera Icon */}
          {/* Replaced MoreVertical with Store icon for Company Profile */}
          <button onClick={onProfileClick} className="focus:outline-none">
            <Store className="w-6 h-6 cursor-pointer hover:text-wa-green transition-colors" />
          </button>
        </div>
      </div>
      
      {showSearch && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-wa-textSecondary" />
          </div>
          <input
            type="text"
            className="bg-wa-input text-wa-textPrimary text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-wa-green focus:border-wa-green placeholder-wa-textSecondary border-none outline-none transition-all"
            placeholder={searchPlaceholder || "Pesquisar..."}
            value={searchValue}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default Header;
