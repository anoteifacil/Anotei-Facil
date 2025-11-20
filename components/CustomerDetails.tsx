
import React, { useState } from 'react';
import { ArrowLeft, Pencil, Trash2, Phone, MapPin, FileText, Calendar, AlertTriangle, MessageCircle } from 'lucide-react';
import { Customer } from '../types';

interface CustomerDetailsProps {
  customer: Customer;
  onBack: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: number) => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, onBack, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(customer.id);
  };

  // Prepare phone numbers for links
  const cleanPhone = customer.phone.replace(/\D/g, '');
  // Assumption: If length is 10 or 11 (e.g. 11 99999 9999), it's a Brazilian number without country code, so prepend 55.
  // If it's longer, assume it might already have a country code.
  const whatsappNumber = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

  return (
    <div className="fixed inset-0 bg-wa-bg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-wa-header p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-wa-textPrimary hover:text-wa-green p-1 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-wa-textPrimary text-xl font-bold truncate max-w-[200px]">Cliente</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onEdit(customer)} className="text-wa-textPrimary hover:text-wa-green transition-colors">
            <Pencil className="w-5 h-5" />
          </button>
          <button onClick={handleDeleteClick} className="text-wa-danger hover:text-red-400 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-0">
        {/* Hero Profile */}
        <div className="w-full bg-wa-card pb-6 pt-8 flex flex-col items-center border-b border-[#1f2c34]">
          <div className="relative">
            <img 
              src={customer.image} 
              alt={customer.name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-wa-bg shadow-xl"
            />
            <div className="absolute bottom-1 right-1 bg-wa-green w-6 h-6 rounded-full border-4 border-wa-card"></div>
          </div>
          <h1 className="text-2xl font-bold text-wa-textPrimary mt-4 text-center px-4">{customer.name}</h1>
          <p className="text-wa-textSecondary text-sm mt-1">ID: {customer.id}</p>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Contact Info Card */}
          <div className="bg-wa-card rounded-xl p-4 shadow-sm border border-[#1f2c34] space-y-4">
             <h3 className="text-wa-green text-sm font-bold uppercase tracking-wider mb-2">Informações de Contato</h3>
             
             <div className="flex items-start gap-3">
               <div className="mt-1 w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center flex-shrink-0">
                 <Phone className="w-4 h-4 text-wa-green" />
               </div>
               <div className="w-full">
                 <p className="text-xs text-wa-textSecondary font-medium uppercase">Telefone</p>
                 <p className="text-base text-wa-textPrimary">{customer.phone}</p>
                 
                 {/* Action Buttons */}
                 <div className="flex gap-3 mt-3">
                    <a 
                      href={`tel:${cleanPhone}`}
                      className="flex-1 bg-[#202c33] hover:bg-[#2a3942] text-wa-green py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium border border-[#2a3942]"
                    >
                      <Phone className="w-4 h-4" /> Ligar
                    </a>
                    <a 
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-wa-green hover:bg-wa-greenDark text-black py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-bold shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                 </div>
               </div>
             </div>

             <div className="flex items-start gap-3 pt-2 border-t border-[#202c33]">
               <div className="mt-1 w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center flex-shrink-0">
                 <MapPin className="w-4 h-4 text-red-400" />
               </div>
               <div>
                 <p className="text-xs text-wa-textSecondary font-medium uppercase">Endereço</p>
                 <p className="text-base text-wa-textPrimary break-words">
                    {customer.address || <span className="text-wa-textSecondary italic">Não informado</span>}
                 </p>
               </div>
             </div>
          </div>

          {/* Legal Info Card */}
          <div className="bg-wa-card rounded-xl p-4 shadow-sm border border-[#1f2c34] space-y-4">
            <h3 className="text-wa-green text-sm font-bold uppercase tracking-wider mb-2">Dados Fiscais</h3>
            
            <div className="flex items-start gap-3">
               <div className="mt-1 w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center flex-shrink-0">
                 <FileText className="w-4 h-4 text-blue-400" />
               </div>
               <div>
                 <p className="text-xs text-wa-textSecondary font-medium uppercase">CPF / CNPJ</p>
                 <p className="text-base text-wa-textPrimary font-mono">
                    {customer.cpfCnpj || <span className="text-wa-textSecondary italic">Não informado</span>}
                 </p>
               </div>
             </div>
          </div>

          {/* History Card */}
          <div className="bg-wa-card rounded-xl p-4 shadow-sm border border-[#1f2c34] space-y-4">
            <h3 className="text-wa-green text-sm font-bold uppercase tracking-wider mb-2">Histórico</h3>
            
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center flex-shrink-0">
                 <Calendar className="w-4 h-4 text-yellow-500" />
               </div>
               <div>
                 <p className="text-xs text-wa-textSecondary font-medium uppercase">Último Pedido</p>
                 <p className="text-base text-wa-textPrimary">
                   {new Date(customer.lastOrderDate).toLocaleDateString('pt-BR', { 
                     weekday: 'long', 
                     year: 'numeric', 
                     month: 'long', 
                     day: 'numeric' 
                   })}
                 </p>
               </div>
             </div>
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
                <h3 className="text-lg font-bold text-wa-textPrimary">Excluir Cliente?</h3>
                <p className="text-sm text-wa-textSecondary mt-2">
                  Tem certeza que deseja excluir <strong>{customer.name}</strong>? Todos os dados e histórico serão perdidos.
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

export default CustomerDetails;
