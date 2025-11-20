
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, ScanBarcode, Save, Plus, Trash } from 'lucide-react';
import { Product } from '../types';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
}

const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Geral');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && productToEdit) {
      setName(productToEdit.name);
      setBarcode(productToEdit.barcode || '');
      setPrice(productToEdit.price.toString());
      setCategory(productToEdit.category);
      setImages(productToEdit.images || []);
    } else if (isOpen && !productToEdit) {
      resetForm();
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  // Helper to convert Blob/File to Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setImages(prev => [...prev, base64]);
      } catch (err) {
        console.error("Error converting image", err);
        // Fallback to blob url for this session only if base64 fails
        const imageUrl = URL.createObjectURL(file);
        setImages(prev => [...prev, imageUrl]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name || !price) {
      alert('Nome e Preço são obrigatórios');
      return;
    }

    const product: Product = {
      id: productToEdit ? productToEdit.id : `p${Date.now()}`,
      name,
      price: parseFloat(price.replace(',', '.')),
      images: images.length > 0 ? images : ['https://picsum.photos/200'],
      barcode,
      category,
      stock: productToEdit ? productToEdit.stock : 0 // Maintain existing stock or 0, removed from UI
    };

    onSave(product);
    onClose();
  };

  const resetForm = () => {
    setName('');
    setBarcode('');
    setPrice('');
    setImages([]);
    setCategory('Geral');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-end justify-center sm:items-center">
      <div className="bg-wa-bg w-full h-full sm:h-auto sm:max-w-md sm:rounded-xl flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="bg-wa-header p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-wa-textSecondary hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-wa-textPrimary text-xl font-bold">
              {productToEdit ? 'Editar Produto' : 'Novo Produto'}
            </h2>
          </div>
          <button 
            onClick={handleSave}
            className="text-wa-green font-bold uppercase text-sm tracking-wide"
          >
            Salvar
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Image Selection Gallery */}
          <div className="space-y-2">
            <label className="text-wa-green text-sm font-medium ml-1 block">Imagens do Produto</label>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
              {/* Add Button */}
              <div 
                className="w-24 h-24 rounded-lg bg-wa-input border-2 border-dashed border-wa-textSecondary flex-shrink-0 flex items-center justify-center cursor-pointer hover:border-wa-green group snap-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center text-wa-textSecondary group-hover:text-wa-green">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Adicionar</span>
                </div>
              </div>
              
              {/* Image List */}
              {images.map((img, idx) => (
                <div key={idx} className="w-24 h-24 rounded-lg bg-wa-card relative flex-shrink-0 snap-start border border-[#1f2c34]">
                  <img src={img} alt={`Prod ${idx}`} className="w-full h-full object-cover rounded-lg" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5 rounded-b-lg font-bold">
                      CAPA
                    </div>
                  )}
                </div>
              ))}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            
            {/* Name */}
            <div className="space-y-1">
              <label className="text-wa-green text-sm font-medium ml-1">Nome do Produto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bolo de Cenoura"
                className="w-full bg-wa-input text-wa-textPrimary p-3 rounded-lg border border-transparent focus:border-wa-green outline-none transition-all"
              />
            </div>

            {/* Barcode */}
            <div className="space-y-1">
              <label className="text-wa-green text-sm font-medium ml-1 flex items-center gap-2">
                <ScanBarcode className="w-4 h-4" /> Código de Barras
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Ler ou digitar código"
                  className="w-full bg-wa-input text-wa-textPrimary p-3 pr-10 rounded-lg border border-transparent focus:border-wa-green outline-none transition-all"
                />
                <ScanBarcode className="absolute right-3 top-3.5 w-5 h-5 text-wa-textSecondary" />
              </div>
            </div>

            {/* Price and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-wa-green text-sm font-medium ml-1">Preço (R$)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-wa-input text-wa-textPrimary p-3 rounded-lg border border-transparent focus:border-wa-green outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-wa-textSecondary text-sm font-medium ml-1">Categoria</label>
                 <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Geral"
                  className="w-full bg-wa-input text-wa-textPrimary p-3 rounded-lg border border-transparent focus:border-wa-green outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProductModal;