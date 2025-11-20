
import React, { useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, Package, User, AlertCircle, ChevronRight, Share2, Copy, Printer, Trash2, CreditCard } from 'lucide-react';
import { Order, OrderStatus, Customer, CompanyProfile } from '../types';

interface OrderDetailsProps {
  order: Order;
  customers: Customer[];
  companyProfile: CompanyProfile;
  onBack: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, paymentMethod?: string) => void;
  onDelete: (orderId: string) => void;
  onCustomerClick?: (customerId: number) => void;
  onProductClick?: (productId: string) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, customers, companyProfile, onBack, onUpdateStatus, onDelete, onCustomerClick, onProductClick }) => {
  const [confirmAction, setConfirmAction] = useState<'complete' | 'cancel' | 'delete' | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  // Find full customer details
  const customerData = customers.find(c => c.id === order.customerId);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = () => {
    if (confirmAction === 'complete') {
      if (!selectedPaymentMethod) {
        alert('Por favor, selecione um método de pagamento.');
        return;
      }
      onUpdateStatus(order.id, OrderStatus.COMPLETED, selectedPaymentMethod);
    } else if (confirmAction === 'cancel') {
      onUpdateStatus(order.id, OrderStatus.CANCELED);
    } else if (confirmAction === 'delete') {
      onDelete(order.id);
    }
    if (confirmAction !== 'delete') onBack();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'text-yellow-500 bg-yellow-500/10';
      case OrderStatus.COMPLETED: return 'text-green-500 bg-green-500/10';
      case OrderStatus.CANCELED: return 'text-red-500 bg-red-500/10';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'Pendente';
      case OrderStatus.COMPLETED: return 'Concluído';
      case OrderStatus.CANCELED: return 'Cancelado';
    }
  };

  const handleCustomerCardClick = () => {
    if (order.customerId && onCustomerClick) {
      onCustomerClick(order.customerId);
    }
  };

  const handleProductItemClick = (productId: string) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  };

  // --- Share Logic ---
  const handleShareReceipt = async () => {
    const companyName = "AnoteiFacil - Fábrica de Alimentos";
    const itemsList = order.items 
      ? order.items.map(i => `• ${i.quantity}x ${i.productName} (R$ ${i.unitPrice.toFixed(2)})`).join('\n')
      : `• ${order.productSummary}`;

    const customerInfo = customerData ? `
👤 *CLIENTE:* ${customerData.name}
📞 *Tel:* ${customerData.phone}
📍 *End:* ${customerData.address || 'Não informado'}
📄 *Doc:* ${customerData.cpfCnpj || 'Não informado'}
` : `👤 *CLIENTE:* ${order.customerName}`;

    const paymentInfo = order.paymentMethod ? `\n💳 *Pagamento:* ${order.paymentMethod}` : '';

    const receiptText = `
🧾 *COMPROVANTE DE PEDIDO*
${companyName}
--------------------------------
${customerInfo}
--------------------------------
📦 *RESUMO DO PEDIDO #${order.id}*

${itemsList}

💰 *TOTAL: R$ ${order.totalValue.toFixed(2)}*${paymentInfo}
--------------------------------
📅 *Previsão:* ${formatDate(order.deliveryDate)}
🔖 *Status:* ${getStatusText(order.status).toUpperCase()}
`.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido #${order.id} - ${order.customerName}`,
          text: receiptText,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(receiptText);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 3000);
      } catch (err) {
        alert('Não foi possível copiar o comprovante.');
      }
    }
  };

  // --- Print Logic ---
  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items
      ? order.items.map(item => `
        <tr>
          <td>${item.quantity}x ${item.productName}</td>
          <td style="text-align: right;">R$ ${item.unitPrice.toFixed(2)}</td>
          <td style="text-align: right;">R$ ${(item.quantity * item.unitPrice).toFixed(2)}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="3">${order.productSummary}</td></tr>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido #${order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
            .company-name { font-size: 20px; font-weight: bold; margin: 5px 0; text-transform: uppercase; }
            .meta { font-size: 12px; color: #666; line-height: 1.4; }
            
            .row { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .col { width: 48%; }
            .card { background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
            .card-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 10px; letter-spacing: 0.5px; }
            .info-text { font-size: 14px; line-height: 1.5; font-weight: 500; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; color: #888; border-bottom: 1px solid #ddd; padding: 10px 5px; }
            td { padding: 12px 5px; border-bottom: 1px solid #eee; font-size: 14px; }
            .total-section { text-align: right; margin-top: 10px; }
            .total-label { font-size: 14px; color: #666; margin-right: 10px; }
            .total-value { font-size: 24px; font-weight: bold; color: #000; }
            .payment-method { text-align: right; font-size: 12px; color: #666; margin-top: 5px; text-transform: uppercase; }
            
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; }
            
            @media print {
              body { padding: 0; -webkit-print-color-adjust: exact; }
              .card { border: 1px solid #ddd; background: none; padding: 0; }
              .row { display: flex; justify-content: space-between; }
              .col { width: 48%; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyProfile.name}</div>
            <div class="meta">
              ${companyProfile.address}<br/>
              Tel: ${companyProfile.phone} | Email: ${companyProfile.email}<br/>
              CNPJ: ${companyProfile.cnpj || 'N/A'}
            </div>
          </div>

          <div class="row">
            <div class="col">
              <div class="card">
                <div class="card-title">Cliente</div>
                <div class="info-text">
                  ${order.customerName}<br/>
                  ${customerData ? `
                    Tel: ${customerData.phone}<br/>
                    ${customerData.cpfCnpj ? `Doc: ${customerData.cpfCnpj}<br/>` : ''}
                    ${customerData.address ? `${customerData.address}` : ''}
                  ` : ''}
                </div>
              </div>
            </div>
            <div class="col">
              <div class="card">
                <div class="card-title">Detalhes do Pedido</div>
                <div class="info-text">
                  ID: <strong>#${order.id}</strong><br/>
                  Data: ${new Date(order.deliveryDate).toLocaleDateString('pt-BR')}<br/>
                  Status: ${getStatusText(order.status).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div class="card-title" style="margin-bottom: 15px;">Itens do Pedido</div>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th style="text-align: right;">Preço Unit.</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-section">
            <span class="total-label">TOTAL A PAGAR</span>
            <span class="total-value">R$ ${order.totalValue.toFixed(2)}</span>
            ${order.paymentMethod ? `<div class="payment-method">Pagamento: ${order.paymentMethod}</div>` : ''}
          </div>

          <div class="footer">
            Comprovante gerado em ${new Date().toLocaleString('pt-BR')} via AnoteiFacil
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-wa-bg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-wa-header p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-wa-textPrimary hover:text-wa-green p-1 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-wa-textPrimary text-xl font-bold">Detalhes do Pedido</h2>
        </div>
        <div className="flex items-center gap-2">
          {order.status !== OrderStatus.PENDING && (
             <button 
               onClick={() => setConfirmAction('delete')}
               className="text-wa-danger hover:text-red-400 p-2 rounded-full transition-colors"
               title="Excluir Pedido"
             >
               <Trash2 className="w-6 h-6" />
             </button>
          )}
           <button 
            onClick={handlePrintReceipt}
            className="text-wa-textPrimary hover:text-wa-green p-2 rounded-full transition-colors"
            title="Imprimir Comprovante"
          >
            <Printer className="w-6 h-6" />
          </button>
          <button 
            onClick={handleShareReceipt}
            className="text-wa-textPrimary hover:text-wa-green p-2 rounded-full transition-colors"
            title="Compartilhar Comprovante"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Status Card */}
        <div className="bg-wa-card p-5 rounded-xl border border-[#1f2c34] flex items-center justify-between">
           <div>
             <p className="text-wa-textSecondary text-xs uppercase font-bold mb-1">Status Atual</p>
             <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                {order.status === OrderStatus.PENDING && <Clock className="w-4 h-4 mr-2" />}
                {order.status === OrderStatus.COMPLETED && <CheckCircle className="w-4 h-4 mr-2" />}
                {order.status === OrderStatus.CANCELED && <XCircle className="w-4 h-4 mr-2" />}
                {getStatusText(order.status)}
             </div>
           </div>
           <div className="text-right">
             <p className="text-wa-textSecondary text-xs uppercase font-bold mb-1">ID do Pedido</p>
             <p className="text-wa-textPrimary font-mono">#{order.id}</p>
           </div>
        </div>

        {/* Customer Info */}
        <div 
          onClick={handleCustomerCardClick}
          className={`bg-wa-card p-4 rounded-xl border border-[#1f2c34] space-y-3 transition-colors ${order.customerId && onCustomerClick ? 'cursor-pointer hover:bg-[#182329] active:bg-[#202c33]' : ''}`}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-wa-green font-bold flex items-center gap-2">
              <User className="w-5 h-5" /> Cliente
            </h3>
            {order.customerId && onCustomerClick && <ChevronRight className="w-5 h-5 text-wa-textSecondary" />}
          </div>
          <div className="pl-7">
             <p className="text-xl font-semibold text-wa-textPrimary">{order.customerName}</p>
             {order.customerId && <p className="text-xs text-wa-textSecondary mt-1">Toque para ver perfil</p>}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34] space-y-3">
          <h3 className="text-wa-green font-bold flex items-center gap-2">
             <Calendar className="w-5 h-5" /> Previsão de Entrega
          </h3>
          <div className="pl-7">
             <p className="text-lg text-wa-textPrimary capitalize">{formatDate(order.deliveryDate)}</p>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-wa-card p-4 rounded-xl border border-[#1f2c34] space-y-3">
          <h3 className="text-wa-green font-bold flex items-center gap-2">
             <Package className="w-5 h-5" /> Itens do Pedido
          </h3>
          
          <div className="space-y-3 pt-1">
             {order.items ? (
               order.items.map((item, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => handleProductItemClick(item.productId)}
                   className="flex gap-3 p-2 rounded-lg hover:bg-[#202c33] transition-colors border border-transparent hover:border-[#2a3942] cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#0b141a] border border-[#2a3942]">
                       {item.image ? (
                         <img src={item.image} className="w-full h-full object-cover" alt={item.productName} />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-wa-textSecondary" />
                         </div>
                       )}
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-baseline mb-1">
                           <p className="text-wa-textPrimary font-medium text-sm mr-2 group-hover:text-wa-green transition-colors whitespace-nowrap">{item.productName}</p>
                           <p className="text-wa-textPrimary font-bold text-sm whitespace-nowrap">R$ {(item.quantity * item.unitPrice).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center text-xs text-wa-textSecondary">
                           <span className="bg-[#202c33] text-wa-textPrimary font-medium px-1.5 py-0.5 rounded border border-[#2a3942] mr-2">
                             {item.quantity}x
                           </span>
                           <span className="whitespace-nowrap">Unit: R$ {item.unitPrice.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-wa-textSecondary opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                 </div>
               ))
             ) : (
               /* Fallback for old mock data (should be covered by updated mockData) */
               <div className="bg-[#202c33] p-3 rounded-lg border border-[#2a3942]">
                   <p className="text-wa-textPrimary italic text-sm">{order.productSummary}</p>
               </div>
             )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#2a3942] mt-2">
             <span className="text-wa-textSecondary font-medium">Total Geral</span>
             <span className="text-xl text-wa-green font-bold">R$ {order.totalValue.toFixed(2)}</span>
          </div>
          
          {/* Show Payment Method if available */}
          {order.paymentMethod && (
             <div className="flex justify-between items-center pt-2">
                <span className="text-wa-textSecondary font-medium text-sm">Pagamento via</span>
                <span className="text-wa-textPrimary font-bold text-sm uppercase">{order.paymentMethod}</span>
             </div>
          )}
        </div>

        {/* Action Buttons */}
        {order.status === OrderStatus.PENDING && (
          <div className="pt-4 grid grid-cols-2 gap-4 pb-6">
             <button 
               onClick={() => setConfirmAction('cancel')}
               className="bg-wa-card border border-red-500/50 text-red-500 hover:bg-red-500/10 py-3 rounded-xl font-bold transition-colors"
             >
               Cancelar Pedido
             </button>
             <button 
               onClick={() => {
                 setConfirmAction('complete');
                 setSelectedPaymentMethod('');
               }}
               className="bg-wa-green hover:bg-wa-greenDark text-black py-3 rounded-xl font-bold transition-colors shadow-lg"
             >
               Concluir Entrega
             </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-wa-card w-full max-w-xs rounded-xl p-6 shadow-2xl border border-[#1f2c34]">
            <div className="flex flex-col items-center text-center space-y-4">
              {confirmAction === 'complete' ? (
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-bold text-wa-textPrimary">
                  {confirmAction === 'complete' ? 'Concluir Pedido?' : confirmAction === 'delete' ? 'Excluir Pedido?' : 'Cancelar Pedido?'}
                </h3>
                <p className="text-sm text-wa-textSecondary mt-2">
                  {confirmAction === 'complete' 
                    ? 'Selecione a forma de pagamento para finalizar a entrega.' 
                    : confirmAction === 'delete'
                    ? 'Tem certeza que deseja excluir este pedido do histórico? Esta ação não pode ser desfeita.'
                    : 'Tem certeza que deseja cancelar este pedido?'}
                </p>
              </div>
              
              {/* Payment Method Selection */}
              {confirmAction === 'complete' && (
                  <div className="w-full mt-2 space-y-2">
                      {['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito'].map(method => (
                          <button
                            key={method}
                            onClick={() => setSelectedPaymentMethod(method)}
                            className={`w-full py-2 px-3 rounded-lg text-sm font-bold border transition-all ${selectedPaymentMethod === method ? 'bg-wa-green text-black border-wa-green' : 'bg-[#202c33] text-wa-textPrimary border-[#2a3942] hover:border-wa-green/50'}`}
                          >
                              {method}
                          </button>
                      ))}
                  </div>
              )}

              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 rounded-lg text-wa-textPrimary font-medium bg-[#2a3942]"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleStatusChange}
                  disabled={confirmAction === 'complete' && !selectedPaymentMethod}
                  className={`flex-1 py-2.5 rounded-lg text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    confirmAction === 'complete' ? 'bg-wa-green text-black' : 'bg-red-500'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-wa-header text-white px-4 py-2 rounded-full shadow-lg z-[70] flex items-center gap-2 border border-wa-green animate-in fade-in slide-in-from-bottom-5">
          <Copy className="w-4 h-4 text-wa-green" />
          <span className="text-sm font-medium">Comprovante copiado!</span>
        </div>
      )}

    </div>
  );
};

export default OrderDetails;
