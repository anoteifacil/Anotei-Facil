
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Order, OrderStatus } from '../types';
import { ChevronRight, TrendingUp, Delete } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  onViewAnalytics: () => void;
}

const TabDashboard: React.FC<DashboardProps> = ({ orders, onViewAnalytics }) => {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
  
  // Only sum revenue for COMPLETED orders
  const totalRevenue = orders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .reduce((acc, curr) => acc + curr.totalValue, 0);

  // Calculator State
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const handleCalcPress = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcResult('');
      return;
    }
    if (val === 'DEL') {
      setCalcInput(prev => prev.slice(0, -1));
      return;
    }
    if (val === '=') {
      try {
        // Basic safety replacement and check
        const expression = calcInput.replace(/x/g, '*').replace(/÷/g, '/');
        // Allow numbers, operators, dot, parenthesis
        if (/^[0-9+\-*/(). ]+$/.test(expression)) {
           // eslint-disable-next-line no-new-func
           const res = new Function('return ' + expression)();
           setCalcResult(String(res));
           // Update input to result for continuous calculation
           setCalcInput(String(res));
        }
      } catch (e) {
        setCalcResult('Erro');
      }
      return;
    }

    // Prevent multiple operators
    const isOperator = ['+', '-', 'x', '÷'].includes(val);
    const lastChar = calcInput.slice(-1);
    const isLastOperator = ['+', '-', 'x', '÷', '*', '/'].includes(lastChar);

    if (isOperator && isLastOperator) {
      setCalcInput(prev => prev.slice(0, -1) + val);
      return;
    }

    setCalcInput(prev => prev + val);
  };

  const data = [
    { name: 'Pendentes', value: pendingOrders, color: '#eab308' },
    { name: 'Concluídos', value: completedOrders, color: '#00a884' },
    { name: 'Cancelados', value: orders.filter(o => o.status === OrderStatus.CANCELED).length, color: '#ef4444' },
  ];

  const calcButtons = [
    'C', '÷', 'x', 'DEL',
    '7', '8', '9', '-',
    '4', '5', '6', '+',
    '1', '2', '3', '=',
    '0', '.'
  ];

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-wa-card p-4 rounded-xl shadow-sm border border-gray-800">
          <p className="text-wa-textSecondary text-xs uppercase font-semibold">Total Pedidos</p>
          <p className="text-wa-textPrimary text-2xl font-bold mt-1">{totalOrders}</p>
        </div>
        <div className="bg-wa-card p-4 rounded-xl shadow-sm border border-gray-800">
          <p className="text-wa-textSecondary text-xs uppercase font-semibold">Receita Total</p>
          <p className="text-wa-green text-2xl font-bold mt-1">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-wa-card p-4 rounded-xl shadow-sm border border-gray-800">
          <p className="text-wa-textSecondary text-xs uppercase font-semibold">Pendentes</p>
          <p className="text-yellow-500 text-2xl font-bold mt-1">{pendingOrders}</p>
        </div>
        <div className="bg-wa-card p-4 rounded-xl shadow-sm border border-gray-800">
          <p className="text-wa-textSecondary text-xs uppercase font-semibold">Entregues</p>
          <p className="text-blue-400 text-2xl font-bold mt-1">{completedOrders}</p>
        </div>
      </div>

      {/* Chart Section - Clickable for Details */}
      <div 
        onClick={onViewAnalytics}
        className="bg-wa-card p-4 rounded-xl border border-gray-800 cursor-pointer hover:bg-[#182329] transition-colors group relative"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-wa-green" />
             <h2 className="text-wa-textPrimary font-semibold">Visão Geral de Pedidos</h2>
          </div>
          <div className="flex items-center text-wa-green text-xs font-bold group-hover:translate-x-1 transition-transform">
             Ver Análise <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <div className="h-64 w-full pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#8696a0" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8696a0" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#202c33'}}
                contentStyle={{ backgroundColor: '#1f2c34', borderColor: '#0b141a', color: '#e9edef' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-center text-wa-textSecondary text-xs mt-2 opacity-60">Toque para ver relatório detalhado por período</p>
      </div>
      
      {/* Calculator Section */}
      <div className="bg-wa-card p-4 rounded-xl border border-gray-800">
         <h2 className="text-wa-textPrimary font-semibold mb-4">Calculadora</h2>
         
         {/* Display */}
         <div className="bg-[#0b141a] p-4 rounded-lg mb-4 text-right border border-gray-800">
            <div className="text-wa-textSecondary text-sm h-5 mb-1">{calcResult && `Ans: ${calcResult}`}</div>
            <div className="text-2xl text-wa-textPrimary font-mono tracking-wider h-8 overflow-hidden whitespace-nowrap">{calcInput || '0'}</div>
         </div>

         {/* Keypad */}
         <div className="grid grid-cols-4 gap-2">
            {calcButtons.map((btn) => (
              <button
                key={btn}
                onClick={() => handleCalcPress(btn)}
                className={`
                  p-3 rounded-lg font-bold text-lg transition-all active:scale-95
                  ${btn === '=' ? 'bg-wa-green text-black row-span-2 h-full flex items-center justify-center' : ''}
                  ${btn === '0' ? 'col-span-2' : ''}
                  ${['C', 'DEL'].includes(btn) ? 'text-red-400 bg-[#202c33] hover:bg-[#2a3942]' : ''}
                  ${['÷', 'x', '-', '+'].includes(btn) ? 'text-wa-green bg-[#202c33] hover:bg-[#2a3942]' : ''}
                  ${!['C', 'DEL', '÷', 'x', '-', '+', '=', '0'].includes(btn) ? 'bg-[#202c33] text-wa-textPrimary hover:bg-[#2a3942]' : ''}
                  ${btn === '0' ? 'bg-[#202c33] text-wa-textPrimary hover:bg-[#2a3942]' : ''}
                  ${btn === '.' ? 'bg-[#202c33] text-wa-textPrimary hover:bg-[#2a3942]' : ''}
                `}
                style={{
                  gridColumn: btn === '=' ? '4' : btn === '0' ? '1 / span 2' : 'auto',
                  gridRow: btn === '=' ? '4 / span 2' : 'auto'
                }}
              >
                {btn === 'DEL' ? <Delete className="w-5 h-5 mx-auto" /> : btn}
              </button>
            ))}
         </div>
      </div>
    </div>
  );
};

export default TabDashboard;
