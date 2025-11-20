
import React, { useState, useRef } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Camera, Mail, Lock, User, FileText, ArrowRight, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Validation & Formatting (Reused Logic) ---
  const formatCpfCnpj = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    const truncated = numeric.slice(0, 14);

    if (truncated.length <= 11) {
      return truncated
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      return truncated
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1'); 
    }
  };

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(e.target.value);
    setCpfCnpj(formatted);
  };

  const validateCpfCnpjLength = (doc: string): boolean => {
    const cleanDoc = doc.replace(/[^\d]+/g, '');
    return cleanDoc.length === 11 || cleanDoc.length === 14;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
    }
  };

  // --- Auth Handlers ---

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao conectar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, insira seu e-mail.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      let msg = 'Erro ao enviar e-mail de redefinição.';
      if (err.code === 'auth/user-not-found') {
        msg = 'Usuário não encontrado.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'E-mail inválido.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Registration Logic
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (!name) {
            throw new Error('Nome é obrigatório.');
        }
        if (cpfCnpj && !validateCpfCnpjLength(cpfCnpj)) {
            throw new Error('CPF ou CNPJ inválido.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update Profile (Name & Photo)
        await updateProfile(userCredential.user, {
          displayName: name,
          photoURL: photo || 'https://picsum.photos/200' 
        });
      }
    } catch (err: any) {
      console.error(err);
      let msg = 'Ocorreu um erro inesperado.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Senha ou e-mail incorretos.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Usuário já existe. Deseja fazer login?';
      } else if (err.code === 'auth/weak-password') {
        msg = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    if (isForgotPassword) {
        return {
            title: 'Recuperar Senha',
            subtitle: 'Insira seu e-mail para redefinir sua senha',
            icon: <KeyRound className="w-8 h-8 text-wa-green" />
        };
    }
    return {
        title: isLogin ? 'Bem-vindo de volta' : 'Crie sua conta',
        subtitle: isLogin ? 'Faça login para acessar o AnoteiFacil' : 'Comece a gerenciar sua empresa hoje',
        icon: <User className="w-8 h-8 text-wa-green" />
    };
  };

  const headerData = renderHeader();

  return (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
      <div className="bg-wa-card w-full max-w-md p-8 rounded-2xl shadow-2xl border border-[#1f2c34]">
        
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wa-green/20 mb-4">
            {headerData.icon}
          </div>
          <h1 className="text-2xl font-bold text-wa-textPrimary">
            {headerData.title}
          </h1>
          <p className="text-wa-textSecondary text-sm mt-2">
            {headerData.subtitle}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {isForgotPassword ? (
            // --- Forgot Password View ---
            resetSent ? (
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 bg-wa-green/10 rounded-lg text-wa-textPrimary border border-wa-green/20">
                        <p className="text-sm">Enviamos um link para você alterar sua senha no e-mail:</p>
                        <p className="font-bold text-wa-green mt-1">{email}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsForgotPassword(false);
                            setResetSent(false);
                            setIsLogin(true);
                            setError('');
                        }}
                         className="w-full bg-wa-green hover:bg-wa-greenDark text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        Entrar
                    </button>
                </div>
            ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-wa-textSecondary" />
                        </div>
                        <input
                          type="email"
                          placeholder="E-mail"
                          className="bg-wa-input text-wa-textPrimary text-sm rounded-lg block w-full pl-10 p-3 outline-none focus:ring-1 focus:ring-wa-green"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-wa-green hover:bg-wa-greenDark text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? 'Enviando...' : 'Obter link de redefinição'}
                      </button>
                       <button
                        type="button"
                        onClick={() => {
                            setIsForgotPassword(false);
                            setError('');
                        }}
                        className="w-full text-wa-textSecondary hover:text-wa-textPrimary text-sm mt-2 flex items-center justify-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" /> Voltar para Login
                      </button>
                </form>
            )
        ) : (
            // --- Main Auth Form ---
            <>
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            
            {/* Register Fields */}
            {!isLogin && (
                <>
                {/* Photo Upload */}
                <div className="flex justify-center mb-4">
                    <div 
                    className="w-24 h-24 rounded-full bg-wa-input border-2 border-dashed border-wa-textSecondary flex items-center justify-center cursor-pointer overflow-hidden relative group"
                    onClick={() => fileInputRef.current?.click()}
                    >
                    {photo ? (
                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Camera className="w-8 h-8 text-wa-textSecondary group-hover:text-wa-green transition-colors" />
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </div>
                </div>

                {/* Name */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-wa-textSecondary" />
                    </div>
                    <input
                    type="text"
                    placeholder="Nome Completo"
                    className="bg-wa-input text-wa-textPrimary text-sm rounded-lg block w-full pl-10 p-3 outline-none focus:ring-1 focus:ring-wa-green"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    />
                </div>

                {/* CPF/CNPJ */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-wa-textSecondary" />
                    </div>
                    <input
                    type="text"
                    placeholder="CPF ou CNPJ"
                    className="bg-wa-input text-wa-textPrimary text-sm rounded-lg block w-full pl-10 p-3 outline-none focus:ring-1 focus:ring-wa-green"
                    value={cpfCnpj}
                    onChange={handleCpfCnpjChange}
                    maxLength={18}
                    />
                </div>
                </>
            )}

            {/* Common Fields */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-wa-textSecondary" />
                </div>
                <input
                type="email"
                placeholder="E-mail"
                className="bg-wa-input text-wa-textPrimary text-sm rounded-lg block w-full pl-10 p-3 outline-none focus:ring-1 focus:ring-wa-green"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-wa-textSecondary" />
                </div>
                <input
                type="password"
                placeholder="Senha"
                className="bg-wa-input text-wa-textPrimary text-sm rounded-lg block w-full pl-10 p-3 outline-none focus:ring-1 focus:ring-wa-green"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>

            {/* Forgot Password Link (Login Only) */}
            {isLogin && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            setIsForgotPassword(true);
                            setError('');
                        }}
                        className="text-xs text-wa-green hover:underline font-medium"
                    >
                        Esqueceu sua senha?
                    </button>
                </div>
            )}

            {!isLogin && (
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-wa-textSecondary" />
                </div>
                <input
                    type="password"
                    placeholder="Confirmar Senha"
                    className="bg-wa-input text-wa-textPrimary text-sm rounded-lg block w-full pl-10 p-3 outline-none focus:ring-1 focus:ring-wa-green"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-wa-green hover:bg-wa-greenDark text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Registrar')}
                {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#2a3942]"></div>
            <span className="text-wa-textSecondary text-xs uppercase">Ou</span>
            <div className="h-px flex-1 bg-[#2a3942]"></div>
            </div>

            <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mt-6 bg-white text-gray-800 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-3 hover:bg-gray-100"
            >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Entrar com Google
            </button>

            <div className="mt-8 text-center">
            <p className="text-wa-textSecondary text-sm">
                {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
                <button 
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                }}
                className="ml-2 text-wa-green font-bold hover:underline focus:outline-none"
                >
                {isLogin ? 'Inscrever-se' : 'Fazer login'}
                </button>
            </p>
            </div>
            </>
        )}

      </div>
    </div>
  );
};

export default AuthScreen;
