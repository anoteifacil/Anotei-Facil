import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, User, Phone, MapPin, FileText } from 'lucide-react';
import { Customer } from '../types';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customerToEdit?: Customer | null;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose, onSave, customerToEdit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data when editing
  useEffect(() => {
    if (isOpen && customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setCpfCnpj(customerToEdit.cpfCnpj || '');
      setAddress(customerToEdit.address || '');
      setImage(customerToEdit.image);
    } else if (isOpen && !customerToEdit) {
      resetForm();
    }
  }, [isOpen, customerToEdit]);

  if (!isOpen) return null;

  // --- Formatting Logic (Masking) ---

  const formatCpfCnpj = (value: string) => {
    // Remove everything that is not a digit
    const numeric = value.replace(/\D/g, '');
    
    // Limit to 14 digits (CNPJ max length)
    const truncated = numeric.slice(0, 14);

    if (truncated.length <= 11) {
      // CPF Mask: 000.000.000-00
      return truncated
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      // CNPJ Mask: 00.000.000/0000-00
      return truncated
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1'); 
    }
  };

  const formatPhone = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    const truncated = numeric.slice(0, 11); // Max 11 digits for cell phone (XX) 9XXXX-XXXX
    
    // (00) 00000-0000
    return truncated
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2');
  };

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(e.target.value);
    setCpfCnpj(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  // --- Simplified Validation Logic ---

  const validateDocumentLength = (doc: string): boolean => {
    const cleanDoc = doc.replace(/[^\d]+/g, '');
    // Only check valid lengths: 11 (CPF) or 14 (CNPJ)
    if (cleanDoc.length === 11) return true;
    if (cleanDoc.length === 14) return true;
    
    // If empty, it's valid because it's optional, unless required by business rule. 
    // Here we allow empty.
    if (cleanDoc.length === 0) return true; 
    
    return false;
  };

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
            setImage(base64);
        } catch (err) {
            console.error("Err base64", err);
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    }
  };

  const handleSave = () => {
    if (!name || !phone) {
      alert('Por favor, preencha o Nome e o Telefone.');
      return;
    }

    // Relaxed phone validation: Must have at least 10 digits (DD + 8 numbers)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
         alert('O número de telefone parece inválido.');
         return;
    }

    if (cpfCnpj) {
        if (!validateDocumentLength(cpfCnpj)) {
            alert('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos.');
            return;
        }
    }

    const customer: Customer = {
      id: customerToEdit ? customerToEdit.id : Date.now(),
      name,
      phone,
      cpfCnpj,
      address,
      image: image || 'https://picsum.photos/200',
      lastOrderDate: customerToEdit ? customerToEdit.lastOrderDate : new Date().toISOString()
    };

    onSave(customer);
    if (!customerToEdit) resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setCpfCnpj('');
    setAddress('');
    setImage(null);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-end justify-center sm:items-center">
      <div className="bg-wa-bg w-full h-[90vh] sm:h-auto sm:max-w-md sm:rounded-xl flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-2xl">
        
        {/* Header */}
        <div className="bg-wa-header p-4 flex items-center justify-between shadow-md rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-wa-textSecondary hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-wa-textPrimary text-xl font-bold">
              {customerToEdit ? 'Editar Cliente' : 'Novo Cliente'}
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
          
          {/* Image Selection */}
          <div className="flex flex-col items-center">
            <div 
              className="w-32 h-32 rounded-full bg-wa-input border-2 border-dashed border-wa-textSecondary flex items-center justify-center cursor-pointer overflow-hidden relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-10 h-10 text-wa-textSecondary group-hover:text-wa-green transition-colors" />
              )}
              <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-50 py-1 flex justify-center">
                <span className="text-xs text-white font-medium">{image ? 'Alterar' : 'Foto'}</span>
              </div>
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
              <label className="text-wa-green text-sm font-medium ml-1 flex items-center gap-2">
                <User className="w-4 h-4" /> Nome ou Empresa
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Padaria do Sol"
                className="w-full bg-wa-input text-wa-textPrimary p-3 rounded-lg border border-transparent focus:border-wa-green outline-none transition-all"
              />
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-1">
              <label className="text-wa-green text-sm font-medium ml-1 flex items-center gap-2">
                <FileText className="w-4 h-4" /> CPF ou CNPJ
              </label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={handleCpfCnpjChange}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                maxLength={18}
                className="w-full bg-wa-input text-wa-textPrimary p-3 rounded-lg border border-transparent focus:border-wa-green outline-none transition-all font-mono"
              />
              <p className="text-[10px] text-wa-textSecondary ml-1">Formatação automática. Insira apenas números.</p>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-wa-green text-sm font-medium ml-1 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(00) 90000-0000"
                maxLength={15}
                className="w-full bg-wa-input text-wa-textPrimary p-3 rounded-lg border border-transparent focus:border-wa-green outline-none transition-all"
              />
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-wa-green text-sm font-medium ml-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Endereço Detalhado
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Número, Bairro, Cidade..."
                className="w-full bg-wa-input text-wa-textPrimary p-3 rounded-lg border border-transparent focus:border-wa-green outline-none transition-all resize-none"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerModal;