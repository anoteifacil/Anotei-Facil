
import React, { useMemo, useState } from 'react';
import { Order, OrderStatus } from '../types';
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface OrdersProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

type FilterType = 'all' | 'pending' | 'completed';

const TabOrders: React.FC<OrdersProps> = ({ orders, onOrderClick }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const sortedOrders = useMemo(() => {
    let filtered = orders;
    if (filter === 'pending') {
      filtered = orders.filter(o => o.status === OrderStatus.PENDING);
    } else if (filter === 'completed') {
      filtered = orders.filter(o => o.status === OrderStatus.COMPLETED);
    }

    // Sort: Pending first, then by Delivery Date ascending
    return filtered.sort((a, b) => {
      // Priority 1: Status
      if (a.status === OrderStatus.PENDING && b.status !== OrderStatus.PENDING) return -1;
      if (a.status !== OrderStatus.PENDING && b.status === OrderStatus.PENDING) return 1;

      // Priority 2: Date
      return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
    });
  }, [orders, filter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <div className="pb-24">
      {/* Filters */}
      <div className="px-4 py-2 flex space-x-2 overflow-x-auto no-scrollbar bg-wa-bg sticky top-0 z-10">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-wa-green text-black' : 'bg-wa-input text-wa-textSecondary'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${filter === 'pending' ? 'bg-wa-green text-black' : 'bg-wa-input text-wa-textSecondary'}`}
        >
          Pendentes
          {orders.some(o => o.status === OrderStatus.PENDING) && <div className={`w-2 h-2 rounded-full ${filter === 'pending' ? 'bg-black' : 'bg-wa-green'}`}></div>}
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'completed' ? 'bg-wa-green text-black' : 'bg-wa-input text-wa-textSecondary'}`}
        >
          Concluídos
        </button>
      </div>

      {/* List */}
      <div className="mt-2">
        {sortedOrders.map((order) => (
          <div 
            key={order.id} 
            onClick={() => onOrderClick(order)}
            className="flex items-start p-4 border-b border-[#1f2c34] hover:bg-wa-card active:bg-[#182329] transition-colors cursor-pointer"
          >
             {/* Icon based on status */}
             <div className="mr-4 mt-1">
               {order.status === OrderStatus.PENDING ? (
                 <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                   <Clock className="w-6 h-6 text-yellow-500" />
                 </div>
               ) : order.status === OrderStatus.COMPLETED ? (
                 <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                 </div>
               ) : (
                 <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                 </div>
               )}
             </div>

             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-wa-textPrimary font-semibold text-lg truncate">{order.customerName}</h3>
                  <span className={`text-xs ${order.status === OrderStatus.PENDING ? 'text-wa-green font-bold' : 'text-wa-textSecondary'}`}>
                    {formatDate(order.deliveryDate)}
                  </span>
                </div>
                <p className="text-wa-textSecondary text-sm truncate">{order.productSummary}</p>
                <div className="flex justify-between items-center mt-1">
                   <p className="text-wa-textSecondary text-xs flex items-center gap-1">
                     <Calendar className="w-3 h-3" /> Previsão
                   </p>
                   {order.status === OrderStatus.PENDING && (
                      <span className="bg-wa-green text-black text-[10px] font-bold px-2 py-0.5 rounded-full">PENDENTE</span>
                   )}
                </div>
             </div>
          </div>
        ))}
        {sortedOrders.length === 0 && (
            <div className="p-8 text-center text-wa-textSecondary">
                <p>Nenhum pedido encontrado.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TabOrders;
