
import React, { useState } from 'react';
import { ArrowLeft, Pencil, Trash2, ScanBarcode, Tag, DollarSign, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(product.id);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="fixed inset-0 bg-wa-bg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-wa-header p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-wa-textPrimary hover:text-wa-green p-1 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-wa-textPrimary text-xl font-bold truncate max-w-[200px]">Detalhes</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onEdit(product)} className="text-wa-textPrimary hover:text-wa-green transition-colors">
            <Pencil className="w-5 h-5" />
          </button>
          <button onClick={handleDeleteClick} className="text-wa-danger hover:text-red-400 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-0">
        
        {/* Gallery Section */}
        <div className="relative w-full bg-wa-card group">
          <div className="w-full h-80 bg-black flex items-center justify-center overflow-hidden relative">
            <img 
              src={product.images[activeImageIndex]} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                  className="absolute left-2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                   onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                   className="absolute right-2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-wa-green w-4' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Thumbnails Strip (Only if > 1 image) */}
          {product.images.length > 1 && (
            <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar bg-[#0b141a]">
               {product.images.map((img, idx) => (
                 <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 flex-shrink-0 rounded-md border-2 overflow-hidden transition-colors ${idx === activeImageIndex ? 'border-wa-green' : 'border-transparent opacity-60'}`}
                 >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          )}

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-12 pointer-events-none">
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
            <p className="text-wa-textSecondary text-sm">{product.category}</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Info Card */}
          <div className="bg-wa-card rounded-xl p-4 shadow-sm border border-[#1f2c34] space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#1f2c34] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-wa-green/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-wa-green" />
                </div>
                <div>
                  <p className="text-xs text-wa-textSecondary font-medium uppercase">Preço Unitário</p>
                  <p className="text-xl font-bold text-wa-textPrimary">R$ {product.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ScanBarcode className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-wa-textSecondary font-medium uppercase">Código de Barras</p>
                <p className="text-base text-wa-textPrimary font-mono tracking-wide">
                  {product.barcode || 'Sem código'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
               <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                 <Tag className="w-5 h-5 text-purple-400" />
               </div>
               <div>
                 <p className="text-xs text-wa-textSecondary font-medium uppercase">Categoria</p>
                 <p className="text-base text-wa-textPrimary">{product.category}</p>
               </div>
            </div>

          </div>

          <div className="bg-wa-card rounded-xl p-4 border border-[#1f2c34]">
            <p className="text-wa-textSecondary text-sm italic">
              Última atualização: {new Date().toLocaleDateString()}
            </p>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-wa-card w-full max-w-xs rounded-xl p-6 shadow-2xl border border-[#1f2c34] transform transition-all scale-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-wa-textPrimary">Excluir Produto?</h3>
                <p className="text-sm text-wa-textSecondary mt-2">
                  Você tem certeza que deseja excluir <strong>{product.name}</strong>? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg text-wa-textPrimary font-medium bg-[#2a3942] hover:bg-[#374248] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-lg text-white font-medium bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
