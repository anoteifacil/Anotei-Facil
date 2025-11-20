import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Pencil, Mail, Phone, MapPin, FileText, Check, User, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { CompanyProfile } from '../types';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CompanyProfile;
  onSave: (profile: CompanyProfile) => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({ isOpen, onClose, profile, onSave, onLogout, onDeleteAccount }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [logo, setLogo] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset to current profile data when opening
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone);
      setAddress(profile.address);
      setCnpj(profile.cnpj || '');
      setLogo(profile.logo);
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

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
        setLogo(base64);
      } catch (err) {
        const imageUrl = URL.createObjectURL(file);
        setLogo(imageUrl);
      }
    }
  };

  const handleSave = () => {
    const updatedProfile: CompanyProfile = {
      name,
      email,
      phone,
      address,
      cnpj,
      logo
    };
    onSave(updatedProfile);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-wa-bg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-wa-header p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-wa-textPrimary hover:text-wa-green p-1 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-wa-textPrimary text-xl font-bold">Perfil da Empresa</h2>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="text-wa-textPrimary hover:text-wa-green transition-colors">
            <Pencil className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={handleSave} className="text-wa-green hover:text-wa-greenDark font-bold text-sm uppercase">
            Salvar
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-0">
        
        {/* Hero Section with Logo */}
        <div className="w-full bg-wa-card pb-8 pt-8 flex flex-col items-center border-b border-[#1f2c34]">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-wa-bg shadow-xl bg-[#202c33] flex items-center justify-center">
               {logo ? (
                 <img src={logo} alt="Company Logo" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-12 h-12 text-wa-textSecondary" />
               )}
            </div>
            
            {isEditing && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-8 h-8 text-white" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
            />
          </div>

          {isEditing ? (
             <input
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="mt-4 text-center bg-wa-input text-wa-textPrimary text-xl font-bold p-2 rounded-lg border border-transparent focus:border-wa-green outline-none"
               placeholder="Nome da Empresa"
             />
          ) : (
             <h1 className="text-2xl font-bold text-wa-textPrimary mt-4 text-center px-4">{name}</h1>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Info Card */}
          <div className="bg-wa-card rounded-xl p-4 shadow-sm border border-[#1f2c34] space-y-5">
            
            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-wa-green" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-wa-textSecondary font-medium uppercase">Telefone</p>
                {isEditing ? (
                   <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-wa-input text-wa-textPrimary p-2 rounded-md mt-1 outline-none focus:ring-1 focus:ring-wa-green"
                   />
                ) : (
                   <p className="text-base text-wa-textPrimary">{phone}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-wa-textSecondary font-medium uppercase">E-mail</p>
                {isEditing ? (
                   <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-wa-input text-wa-textPrimary p-2 rounded-md mt-1 outline-none focus:ring-1 focus:ring-wa-green"
                   />
                ) : (
                   <p className="text-base text-wa-textPrimary">{email}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-wa-textSecondary font-medium uppercase">Endereço</p>
                 {isEditing ? (
                   <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-wa-input text-wa-textPrimary p-2 rounded-md mt-1 outline-none focus:ring-1 focus:ring-wa-green resize-none"
                   />
                ) : (
                   <p className="text-base text-wa-textPrimary">{address}</p>
                )}
              </div>
            </div>

             {/* CNPJ */}
             <div className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 rounded-full bg-[#202c33] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-wa-textSecondary font-medium uppercase">CNPJ</p>
                {isEditing ? (
                   <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full bg-wa-input text-wa-textPrimary p-2 rounded-md mt-1 outline-none focus:ring-1 focus:ring-wa-green"
                   />
                ) : (
                   <p className="text-base text-wa-textPrimary font-mono">{cnpj}</p>
                )}
              </div>
            </div>

          </div>

          {/* Account Actions */}
          <div className="space-y-3 pt-4">
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-wa-card border border-wa-textSecondary/30 text-wa-textPrimary hover:bg-[#2a3942] py-3 rounded-xl font-medium transition-colors"
              >
                <LogOut className="w-5 h-5" /> Sair da Conta
              </button>
            )}
            
            {onDeleteAccount && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 bg-wa-card border border-red-500/50 text-red-500 hover:bg-red-500/10 py-3 rounded-xl font-medium transition-colors"
              >
                <Trash2 className="w-5 h-5" /> Excluir Conta
              </button>
            )}
          </div>
          
          <div className="bg-wa-card rounded-xl p-4 border border-[#1f2c34] mt-4">
            <p className="text-center text-wa-textSecondary text-xs">
               AnoteiFacil v1.0.3 • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

       {/* Delete Account Confirmation Modal */}
       {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-wa-card w-full max-w-xs rounded-xl p-6 shadow-2xl border border-[#1f2c34]">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-wa-textPrimary">Excluir Conta Permanentemente?</h3>
                <p className="text-sm text-wa-textSecondary mt-2">
                  Todos os seus dados, pedidos, produtos e clientes serão apagados. Esta ação não pode ser desfeita.
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
                  onClick={() => {
                    if (onDeleteAccount) onDeleteAccount();
                  }}
                  className="flex-1 py-2.5 rounded-lg text-white font-medium bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfileModal;