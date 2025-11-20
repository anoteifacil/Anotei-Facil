
import React, { useMemo, useState } from 'react';
import { Customer } from '../types';
import { Phone, ArrowDown01, ArrowDownAZ, FileText } from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  searchQuery: string;
  onCustomerClick: (customer: Customer) => void;
}

type SortMode = 'numeric' | 'alpha';

const TabCustomers: React.FC<CustomersProps> = ({ customers, searchQuery, onCustomerClick }) => {
  const [sortMode, setSortMode] = useState<SortMode>('alpha');

  const filteredCustomers = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const cleanQuery = lowerQuery.replace(/\D/g, ''); // Digits only from query
    
    const filtered = customers.filter(c => {
      // 1. Name Match
      const nameMatch = c.name.toLowerCase().includes(lowerQuery);
      
      // 2. Document Match (Smart)
      let docMatch = false;
      if (c.cpfCnpj) {
        // Match against the formatted string (e.g. user types "123.456")
        const rawMatch = c.cpfCnpj.toLowerCase().includes(lowerQuery);
        
        // Match against clean numbers (e.g. user types "123456")
        const cleanDoc = c.cpfCnpj.replace(/\D/g, '');
        const digitMatch = cleanQuery.length > 0 && cleanDoc.includes(cleanQuery);
        
        docMatch = rawMatch || digitMatch;
      }

      return nameMatch || docMatch;
    });
    
    return filtered.sort((a, b) => {
      if (sortMode === 'numeric') {
        return a.id - b.id;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  }, [customers, searchQuery, sortMode]);

  return (
    <div className="pb-24">
      {/* Sort Controls */}
      <div className="flex justify-end px-4 py-2 border-b border-[#1f2c34]">
         <button 
            onClick={() => setSortMode(prev => prev === 'alpha' ? 'numeric' : 'alpha')}
            className="flex items-center space-x-2 text-wa-green text-xs font-medium bg-[#1f2c34] px-3 py-1 rounded-md"
         >
            {sortMode === 'alpha' ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowDown01 className="w-4 h-4" />}
            <span>{sortMode === 'alpha' ? 'Ordem A-Z' : 'Ordem Numérica (ID)'}</span>
         </button>
      </div>

      {filteredCustomers.map((customer) => (
        <div 
          key={customer.id} 
          onClick={() => onCustomerClick(customer)}
          className="flex items-center p-3 px-4 border-b border-[#1f2c34] hover:bg-wa-card cursor-pointer transition-colors"
        >
           <div className="relative mr-4">
             <img 
              src={customer.image} 
              alt={customer.name} 
              className="w-12 h-12 rounded-full object-cover"
             />
             <div className="absolute -bottom-1 -right-1 bg-wa-card p-0.5 rounded-full">
                <div className="bg-wa-green w-3 h-3 rounded-full border-2 border-wa-card"></div>
             </div>
           </div>
           
           <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="text-wa-textPrimary font-semibold text-base truncate">{customer.name}</h3>
                <span className="text-wa-textSecondary text-xs flex-shrink-0 ml-2">ID: {customer.id}</span>
              </div>
              
              <div className="flex justify-between items-center mt-0.5">
                 <div className="flex flex-col">
                    <p className="text-wa-textSecondary text-sm truncate w-40">
                        {new Date(customer.lastOrderDate).toLocaleDateString('pt-BR')}
                    </p>
                    
                    {/* Show Document if searched and found, or if just listed */}
                    {customer.cpfCnpj && searchQuery !== '' && 
                     (customer.cpfCnpj.includes(searchQuery) || customer.cpfCnpj.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, ''))) && (
                        <p className="text-wa-green text-xs flex items-center gap-1 mt-0.5">
                            <FileText className="w-3 h-3" /> {customer.cpfCnpj}
                        </p>
                    )}
                 </div>
                 <Phone className="w-4 h-4 text-wa-green flex-shrink-0" />
              </div>
           </div>
        </div>
      ))}
      
      {filteredCustomers.length === 0 && (
            <div className="p-8 text-center text-wa-textSecondary">
                <p>Nenhum cliente encontrado.</p>
            </div>
        )}
    </div>
  );
};

export default TabCustomers;
