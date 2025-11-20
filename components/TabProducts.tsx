
import React, { useMemo } from 'react';
import { Product } from '../types';
import { Package } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  searchQuery: string;
  onProductClick: (product: Product) => void;
}

const TabProducts: React.FC<ProductsProps> = ({ products, searchQuery, onProductClick }) => {
  
  const sortedProducts = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return products
      .filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        (p.barcode && p.barcode.includes(lowerQuery))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchQuery]);

  return (
    <div className="pb-24">
      {sortedProducts.map((product) => (
        <div 
          key={product.id} 
          onClick={() => onProductClick(product)}
          className="flex items-center p-3 px-4 border-b border-[#1f2c34] hover:bg-wa-card cursor-pointer transition-colors"
        >
           <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-12 h-12 rounded-lg object-cover mr-4"
           />
           <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="text-wa-textPrimary font-semibold text-base">{product.name}</h3>
                <span className="text-wa-textPrimary font-medium">R$ {product.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-1">
                 <p className="text-wa-textSecondary text-sm">{product.category}</p>
                 {/* Show barcode if it matches search query for better feedback */}
                 {product.barcode && product.barcode.includes(searchQuery) && searchQuery !== '' && (
                    <p className="text-wa-green text-xs bg-wa-green/10 px-2 py-0.5 rounded">
                      Code: {product.barcode}
                    </p>
                 )}
              </div>
           </div>
        </div>
      ))}
       {sortedProducts.length === 0 && (
            <div className="p-8 text-center text-wa-textSecondary flex flex-col items-center">
                <Package className="w-12 h-12 mb-2 opacity-50"/>
                <p>Nenhum produto encontrado.</p>
            </div>
        )}
    </div>
  );
};

export default TabProducts;
