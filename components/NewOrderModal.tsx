
import React, { useState, useMemo } from 'react';
import { X, Search, ChevronRight, ShoppingCart, Calendar, User, Check, Minus, Plus, ArrowLeft } from 'lucide-react';
import { Customer, Product, Order, OrderStatus, OrderItem } from '../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  customers: Customer[];
  products: Product[];
}

type Step = 'customer' | 'products' | 'review';

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onSave, customers, products }) => {
  const [step, setStep] = useState<Step>('customer');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Order Data
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [negotiatedPrices, setNegotiatedPrices] = useState<{ [productId: string]: number }>({});
  const [deliveryDate, setDeliveryDate] = useState('');

  if (!isOpen) return null;

  // --- Logic ---

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep('products');
    setSearchQuery('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = newQty;
      }
      return newCart;
    });
  };

  const setQuantity = (productId: string, qty: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (qty <= 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = qty;
      }
      return newCart;
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const product = products.find(p => p.id === id);
      if (!product) return total;
      // Use negotiated price if available, otherwise default product price
      const price = negotiatedPrices[id] !== undefined ? negotiatedPrices[id] : product.price;
      return total + (price * (qty as number));
    }, 0);
  };

  const handleSave = () => {
    if (!selectedCustomer) return;

    const items: OrderItem[] = Object.entries(cart).map(([id, qty]) => {
      const product = products.find(p => p.id === id);
      // Determine final price
      const unitPrice = negotiatedPrices[id] !== undefined ? negotiatedPrices[id] : (product?.price || 0);
      
      return {
        productId: id,
        productName: product?.name || 'Produto Desconhecido',
        quantity: qty as number,
        unitPrice: unitPrice,
        image: product?.images[0] 
      };
    });

    // Create a summary string
    const summary = items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
    
    // Set default time to 12:00 since input was removed
    const finalDate = deliveryDate 
      ? `${deliveryDate}T12:00:00` 
      : new Date().toISOString();

    const newOrder: Order = {
      id: `o${Date.now()}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      productSummary: summary,
      totalValue: calculateTotal(),
      deliveryDate: finalDate,
      status: OrderStatus.PENDING,
      isNew: true,
      items: items
    };

    onSave(newOrder);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep('customer');
    setSelectedCustomer(null);
    setCart({});
    setNegotiatedPrices({});
    setDeliveryDate('');
    setSearchQuery('');
  };

  // --- Filtered Lists ---
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Renders ---

  const renderHeader = () => (
    <div className="bg-wa-header p-4 flex items-center gap-3 shadow-md shrink-0">
      <button onClick={step === 'customer' ? onClose : () => setStep(step === 'review' ? 'products' : 'customer')} className="text-wa-textSecondary hover:text-white">
        {step === 'customer' ? <X className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
      </button>
      <h2 className="text-wa-textPrimary text-xl font-bold">
        {step === 'customer' && 'Selecionar Cliente'}
        {step === 'products' && 'Adicionar Produtos'}
        {step === 'review' && 'Revisar Pedido'}
      </h2>
    </div>
  );

  const renderCustomerStep = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-3 bg-wa-bg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-wa-textSecondary" />
          </div>
          <input
            type="text"
            className="bg-wa-input text-wa-textPrimary text-sm rounded-lg block w-full pl-10 p-3 outline-none focus:ring-1 focus:ring-wa-green"
            placeholder="Buscar cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.map(customer => (
          <div 
            key={customer.id}
            onClick={() => handleCustomerSelect(customer)}
            className="flex items-center p-4 border-b border-[#1f2c34] hover:bg-wa-card cursor-pointer active:bg-[#182329]"
          >
            <img src={customer.image} alt={customer.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
            <div>
              <h3 className="text-wa-textPrimary font-semibold">{customer.name}</h3>
              <p className="text-wa-textSecondary text-sm">{customer.phone}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-wa-textSecondary ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderProductStep = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-3 bg-wa-bg">
         <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-wa-textSecondary" />
          </div>
          <input
            type="text"
            className="bg-wa-input text-wa-textPrimary text-sm rounded-lg block w-full pl-10 p-3 outline-none focus:ring-1 focus:ring-wa-green"
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filteredProducts.map(product => {
          const qty = cart[product.id] || 0;
          return (
            <div key={product.id} className="flex items-center p-3 border-b border-[#1f2c34] hover:bg-wa-card">
              <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover mr-3" />
              <div className="flex-1 min-w-0">
                <h3 className="text-wa-textPrimary font-medium truncate">{product.name}</h3>
                <p className="text-wa-green font-bold">R$ {product.price.toFixed(2)}</p>
              </div>
              
              {/* Counter */}
              <div className="flex items-center gap-3 bg-[#1f2c34] rounded-full p-1 ml-2">
                {qty > 0 ? (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}
                      className="w-8 h-8 rounded-full bg-wa-input flex items-center justify-center text-wa-textPrimary active:bg-black/20"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <input 
                      type="number"
                      value={qty}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setQuantity(product.id, isNaN(val) ? 0 : val);
                      }}
                      className="w-10 bg-transparent text-center text-wa-textPrimary font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 border-none"
                    />

                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }}
                      className="w-8 h-8 rounded-full bg-wa-green flex items-center justify-center text-black active:bg-wa-greenDark"
                    >
                      <Plus className="w-4 h-4 font-bold" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }}
                    className="w-8 h-8 rounded-full bg-wa-green flex items-center justify-center text-black active:bg-wa-greenDark"
                  >
                    <Plus className="w-4 h-4 font-bold" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Total */}
      <div className="bg-[#1f2c34] p-4 border-t border-[#2a3942] flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-10">
        <div>
          <p className="text-wa-textSecondary text-xs uppercase">Total Estimado</p>
          <p className="text-xl font-bold text-white">R$ {calculateTotal().toFixed(2)}</p>
        </div>
        <button 
          disabled={Object.keys(cart).length === 0}
          onClick={() => setStep('review')}
          className="bg-wa-green text-black px-6 py-3 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Avançar <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4 overflow-y-auto">
      
      {/* Customer Card */}
      <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34] flex items-center gap-3">
         <User className="text-wa-green w-5 h-5" />
         <div>
           <p className="text-xs text-wa-textSecondary uppercase">Cliente</p>
           <p className="text-wa-textPrimary font-bold text-lg">{selectedCustomer?.name}</p>
         </div>
         <button onClick={() => setStep('customer')} className="ml-auto text-wa-green text-xs font-bold">ALTERAR</button>
      </div>

      {/* Date Picker - Time Removed */}
      <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34] space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="text-wa-green w-5 h-5" />
          <span className="text-wa-textPrimary font-bold">Previsão de Entrega</span>
        </div>
        <div>
           <label className="text-xs text-wa-textSecondary mb-1 block">Data</label>
           <input 
             type="date" 
             value={deliveryDate}
             onChange={(e) => setDeliveryDate(e.target.value)}
             className="w-full bg-wa-input text-white p-2 rounded-lg outline-none focus:border-wa-green border border-transparent"
           />
        </div>
      </div>

      {/* Cart Summary with Negotiation */}
      <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34]">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-wa-green w-5 h-5" />
            <span className="text-wa-textPrimary font-bold">Itens do Pedido</span>
          </div>
          <button onClick={() => setStep('products')} className="text-wa-green text-xs font-bold">EDITAR ITENS</button>
        </div>
        
        <div className="space-y-4">
          {Object.entries(cart).map(([id, qty]) => {
            const product = products.find(p => p.id === id);
            if (!product) return null;
            const currentPrice = negotiatedPrices[id] !== undefined ? negotiatedPrices[id] : product.price;

            return (
              <div key={id} className="flex flex-col py-2 border-b border-[#1f2c34] last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-wa-textPrimary font-medium">{(qty as number)}x {product.name}</span>
                  <span className="text-wa-textSecondary text-sm">Sub: R$ {(currentPrice * (qty as number)).toFixed(2)}</span>
                </div>
                
                {/* Price Editor */}
                <div className="flex items-center gap-3 bg-[#202c33] p-2 rounded-lg">
                   <span className="text-xs text-wa-textSecondary whitespace-nowrap">Preço Unit.:</span>
                   <div className="relative flex-1">
                     <span className="absolute left-2 top-1/2 -translate-y-1/2 text-wa-textSecondary text-xs">R$</span>
                     <input 
                       type="number"
                       step="0.01"
                       value={currentPrice}
                       onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setNegotiatedPrices(prev => ({...prev, [id]: isNaN(val) ? 0 : val }));
                       }}
                       className="w-full bg-wa-input text-wa-textPrimary pl-7 py-1 pr-2 rounded border border-[#2a3942] focus:border-wa-green outline-none text-sm"
                     />
                   </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-[#2a3942] flex justify-between items-center">
          <span className="text-wa-textPrimary font-bold">Total Final</span>
          <span className="text-wa-green font-bold text-xl">R$ {calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleSave}
        disabled={!deliveryDate}
        className="w-full bg-wa-green hover:bg-wa-greenDark text-black font-bold py-4 rounded-xl shadow-lg mt-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" /> Confirmar Pedido
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-wa-bg w-full h-[90vh] sm:h-[80vh] sm:max-w-md sm:rounded-xl flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-2xl overflow-hidden">
        {renderHeader()}
        {step === 'customer' && renderCustomerStep()}
        {step === 'products' && renderProductStep()}
        {step === 'review' && renderReviewStep()}
      </div>
    </div>
  );
};

export default NewOrderModal;
