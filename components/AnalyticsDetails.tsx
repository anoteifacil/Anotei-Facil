
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Order, OrderStatus } from '../types';

interface AnalyticsDetailsProps {
  orders: Order[];
  onBack: () => void;
}

const AnalyticsDetails: React.FC<AnalyticsDetailsProps> = ({ orders, onBack }) => {
  // --- State & Init ---

  // Calculate available years from data for the Year picker
  const availableYears = useMemo(() => {
    const years = new Set<number>(orders.map(o => new Date(o.deliveryDate).getFullYear()));
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [orders]);

  // Default Month (Latest or Current)
  const defaultMonth = useMemo(() => {
    if (orders.length === 0) {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    const sorted = [...orders].sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime());
    const latest = new Date(sorted[0].deliveryDate);
    return `${latest.getFullYear()}-${String(latest.getMonth() + 1).padStart(2, '0')}`;
  }, [orders]);

  const [viewMode, setViewMode] = useState<'month' | 'year' | 'all'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // --- Metrics Calculation Helper ---
  
  const getMetricsForPeriod = (mode: 'month' | 'year' | 'all', dateRef: string | number) => {
    let filteredOrders: Order[] = [];

    if (mode === 'all') {
        filteredOrders = orders;
    } else if (mode === 'year') {
        const year = typeof dateRef === 'number' ? dateRef : parseInt(dateRef as string);
        filteredOrders = orders.filter(o => new Date(o.deliveryDate).getFullYear() === year);
    } else {
        // Month
        const [y, m] = (dateRef as string).split('-').map(Number);
        filteredOrders = orders.filter(o => {
            const d = new Date(o.deliveryDate);
            return d.getFullYear() === y && (d.getMonth() + 1) === m;
        });
    }

    // Calculate Stats
    // Filter to only include COMPLETED orders for Revenue calculation
    const validOrders = filteredOrders.filter(o => o.status === OrderStatus.COMPLETED);
    
    const revenue = validOrders.reduce((sum, o) => sum + o.totalValue, 0);
    const count = filteredOrders.length; // Total orders includes all (pending/completed/canceled) for activity volume
    const avgTicket = validOrders.length > 0 ? revenue / validOrders.length : 0;

    return { revenue, count, avgTicket, filteredOrders, validOrders };
  };

  // 1. Current Metrics
  const currentMetrics = useMemo(() => {
    return getMetricsForPeriod(viewMode, viewMode === 'month' ? selectedMonth : selectedYear);
  }, [viewMode, selectedMonth, selectedYear, orders]);

  // 2. Previous Metrics (Comparison)
  const prevMetrics = useMemo(() => {
    if (viewMode === 'all') return null; // No comparison for 'all'

    let prevRef: string | number = '';
    
    if (viewMode === 'year') {
        prevRef = selectedYear - 1;
    } else {
        // Previous Month
        const [y, m] = selectedMonth.split('-').map(Number);
        let prevM = m - 1;
        let prevY = y;
        if (prevM === 0) {
            prevM = 12;
            prevY = y - 1;
        }
        prevRef = `${prevY}-${String(prevM).padStart(2, '0')}`;
    }

    return getMetricsForPeriod(viewMode, prevRef);
  }, [viewMode, selectedMonth, selectedYear, orders]);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // --- Chart Data Logic ---
  
  const chartData = useMemo(() => {
    const data = [];
    
    if (viewMode === 'month') {
      // Daily evolution
      const [y, m] = selectedMonth.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();

      for (let d = 1; d <= daysInMonth; d++) {
        const dayRevenue = currentMetrics.validOrders
            .filter(o => new Date(o.deliveryDate).getDate() === d)
            .reduce((sum, o) => sum + o.totalValue, 0);
        
        data.push({ name: d, revenue: dayRevenue, label: `Dia ${d}` });
      }

    } else if (viewMode === 'year') {
       // Monthly evolution
       const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
       for (let i = 0; i < 12; i++) {
           const monthRevenue = currentMetrics.validOrders
               .filter(o => new Date(o.deliveryDate).getMonth() === i)
               .reduce((sum, o) => sum + o.totalValue, 0);
           
           data.push({ name: months[i], revenue: monthRevenue, label: months[i] });
       }
    } else {
       // Yearly evolution
       if (availableYears.length === 0) return [];
       const minYear = Math.min(...availableYears);
       const maxYear = Math.max(...availableYears);

       for (let y = minYear; y <= maxYear; y++) {
           const yearRevenue = currentMetrics.validOrders
               .filter(o => new Date(o.deliveryDate).getFullYear() === y)
               .reduce((sum, o) => sum + o.totalValue, 0);
            
           data.push({ name: y.toString(), revenue: yearRevenue, label: y.toString() });
       }
    }
    return data;
  }, [viewMode, selectedMonth, currentMetrics, availableYears]);

  // --- Top Products Logic ---

  const topProducts = useMemo(() => {
    const productMap: {[key: string]: {name: string, qty: number, value: number}} = {};
    
    currentMetrics.validOrders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                if (!productMap[item.productId]) {
                    productMap[item.productId] = { name: item.productName, qty: 0, value: 0 };
                }
                productMap[item.productId].qty += item.quantity;
                productMap[item.productId].value += (item.quantity * item.unitPrice);
            });
        }
    });

    return Object.values(productMap)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
  }, [currentMetrics]);

  // --- Render Helpers ---

  const renderGrowth = (current: number, prevValue: number | undefined) => {
      if (viewMode === 'all' || prevValue === undefined) return null;
      const growth = calculateGrowth(current, prevValue);
      const isPositive = growth >= 0;
      const label = viewMode === 'month' ? 'mês anterior' : 'ano anterior';

      return (
        <span className={`flex items-center font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{growth.toFixed(1)}%
            <span className="text-wa-textSecondary font-normal ml-1">vs {label}</span>
        </span>
      );
  };

  return (
    <div className="fixed inset-0 bg-wa-bg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-wa-header p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-wa-textPrimary hover:text-wa-green p-1 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-wa-textPrimary text-xl font-bold hidden sm:block">Análise de Desempenho</h2>
          <h2 className="text-wa-textPrimary text-lg font-bold sm:hidden">Análise</h2>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center bg-[#202c33] rounded-lg border border-[#2a3942] p-0.5 h-9">
            <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as 'month' | 'year' | 'all')}
                className="bg-transparent text-wa-textPrimary text-xs font-bold outline-none border-none py-1 px-2 cursor-pointer h-full"
            >
                <option value="month">Mês</option>
                <option value="year">Ano</option>
                <option value="all">Tudo</option>
            </select>
            
            {/* Separator */}
            <div className="w-px h-5 bg-[#2a3942] mx-1"></div>

            {/* Contextual Picker */}
            {viewMode === 'month' && (
                <div className="relative flex items-center">
                    <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-transparent text-wa-textPrimary text-xs font-medium outline-none border-none px-2 w-32 cursor-pointer"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
            )}
            {viewMode === 'year' && (
                 <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-transparent text-wa-textPrimary text-xs font-medium outline-none border-none px-2 cursor-pointer"
                 >
                     {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
            )}
            {viewMode === 'all' && (
                <span className="text-wa-textSecondary text-xs font-medium px-2 flex items-center whitespace-nowrap">Todo o período</span>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Revenue */}
            <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34]">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-wa-textSecondary text-xs uppercase font-bold">Faturamento</p>
                        <h3 className="text-2xl font-bold text-wa-textPrimary mt-1">R$ {currentMetrics.revenue.toLocaleString('pt-BR')}</h3>
                    </div>
                    <div className="p-2 bg-wa-green/10 rounded-lg">
                        <DollarSign className="w-5 h-5 text-wa-green" />
                    </div>
                </div>
                <div className="mt-3 flex items-center text-xs h-4">
                     {renderGrowth(currentMetrics.revenue, prevMetrics?.revenue)}
                </div>
            </div>

            {/* Total Orders */}
            <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34]">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-wa-textSecondary text-xs uppercase font-bold">Total Pedidos</p>
                        <h3 className="text-2xl font-bold text-wa-textPrimary mt-1">{currentMetrics.count}</h3>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <ShoppingBag className="w-5 h-5 text-blue-400" />
                    </div>
                </div>
                <div className="mt-3 flex items-center text-xs h-4">
                     {renderGrowth(currentMetrics.count, prevMetrics?.count)}
                </div>
            </div>

            {/* Avg Ticket */}
            <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34]">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-wa-textSecondary text-xs uppercase font-bold">Ticket Médio</p>
                        <h3 className="text-2xl font-bold text-wa-textPrimary mt-1">R$ {currentMetrics.avgTicket.toFixed(2)}</h3>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                </div>
                <div className="mt-3 flex items-center text-xs h-4">
                     {renderGrowth(currentMetrics.avgTicket, prevMetrics?.avgTicket)}
                </div>
            </div>
        </div>

        {/* Chart Area */}
        <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-wa-textPrimary font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-wa-green" /> Evolução de Receita
                </h3>
                {/* Legend/Info */}
                <span className="text-wa-textSecondary text-[10px] uppercase font-bold bg-[#202c33] px-2 py-1 rounded">
                    {viewMode === 'month' ? 'Diária' : viewMode === 'year' ? 'Mensal' : 'Anual'}
                </span>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00a884" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00a884" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#202c33" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#8696a0" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            interval={viewMode === 'month' ? 2 : 0}
                        />
                        <YAxis 
                            stroke="#8696a0" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(val) => `R$${val/1000}k`} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2c34', borderColor: '#0b141a', color: '#e9edef' }}
                            itemStyle={{ color: '#00a884' }}
                            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                            labelFormatter={(label) => viewMode === 'month' ? `Dia ${label}` : `${label}`}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#00a884" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top Products */}
        <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34]">
            <h3 className="text-wa-textPrimary font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-yellow-500" /> Produtos Mais Vendidos
            </h3>
            <div className="space-y-3">
                {topProducts.length > 0 ? (
                    topProducts.map((prod, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-[#202c33] pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-[#202c33] text-wa-textSecondary'}`}>
                                    {idx + 1}
                                </span>
                                <div>
                                    <p className="text-wa-textPrimary text-sm font-medium">{prod.name}</p>
                                    <p className="text-wa-textSecondary text-xs">{prod.qty} unidades vendidas</p>
                                </div>
                            </div>
                            <p className="text-wa-green font-bold text-sm">R$ {prod.value.toFixed(2)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-wa-textSecondary text-center text-sm py-4">Nenhum dado de produto disponível para este período.</p>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDetails;
