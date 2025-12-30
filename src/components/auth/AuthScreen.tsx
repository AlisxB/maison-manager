import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCondominium } from '../../context/CondominiumContext';
import {
  Home,
  User,
  Mail,
  Lock,
  Key,
  UserPlus,
  Phone,
  Building,
  Calendar,
  ChevronDown,
  ArrowLeft,
  Cat,
  Eye,
  EyeOff,
  PlusCircle,
  Trash2
} from 'lucide-react';

// onLogin is removed from props as we use context
interface AuthScreenProps { }

const AuthScreen: React.FC<AuthScreenProps> = () => {
  const { signIn } = useAuth();
  const { condominium } = useCondominium();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados do Formulário de Cadastro
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    block: '',
    unit: '',
    entryDate: '',
    password: '',
    confirmPassword: '',
    unit_id: '',
    profile_type: 'INQUILINO'
  });

  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Public Units
  React.useEffect(() => {
    if (view === 'register') {
      api.get('/auth/units')
        .then(response => setUnits(response.data))
        .catch(console.error);
    }
  }, [view]);

  // Mask helper
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const uniqueBlocks = Array.from(new Set(units.map(u => u.block))).sort();
  const availableUnits = units.filter(u => u.block === regForm.block).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));



  const handleForgotPassword = () => {
    alert('Funcionalidade de recuperação de senha enviada para o e-mail informado (Simulação).');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    // Validação de Senha Forte
    const password = regForm.password;
    if (password.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (!/^[A-Z]/.test(password)) {
      alert("A primeira letra da senha deve ser maiúscula.");
      return;
    }
    if (!/[!@#$%^&*()\-+]/.test(password)) {
      alert("A senha deve conter pelo menos um caractere especial (!@#$%^&*()-+).");
      return;
    }

    if (!regForm.unit_id) {
      alert("Selecione uma unidade válida.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: regForm.name,
        email: regForm.email,
        phone: regForm.phone,
        password: regForm.password,
        unit_id: regForm.unit_id,
        profile_type: regForm.profile_type
      });
      alert('Solicitação de acesso enviada com sucesso! Aguarde a aprovação da administração.');
      setView('login');
    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        alert('Erro de Validação:\n' + detail.map((err: any) => `- ${err.loc?.[1] || err.loc?.[0] || 'Campo'}: ${err.msg}`).join('\n'));
      } else if (typeof detail === 'object') {
        alert('Erro: ' + JSON.stringify(detail));
      } else {
        alert(detail || "Erro ao solicitar acesso.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden font-['Inter']">
        {/* Elementos Decorativos de Fundo */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#437476]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-3xl"></div>

        <div className="w-full max-w-3xl relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Logo/Voltar Header */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#437476] flex items-center justify-center text-white shadow-lg">
                <Home size={22} fill="currentColor" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tighter">{condominium?.login_title || condominium?.name || 'Maison Manager'}</h1>
            </div>
            <button
              onClick={() => setView('login')}
              className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#437476] transition-all uppercase tracking-widest group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Voltar ao Login
            </button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 p-8 sm:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]">
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-3">Solicitar Acesso</h2>
              <p className="text-slate-500 font-medium max-w-md">Preencha os campos abaixo para que possamos validar sua entrada no Maison Manager.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-8">
              {/* Seção 1: Identificação */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Dados Pessoais</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#437476] transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="COMO CONSTA NO SEU DOCUMENTO"
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                      value={regForm.name}
                      onChange={e => setRegForm({ ...regForm, name: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#437476] transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="exemplo@email.com"
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                        value={regForm.email}
                        onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Telefone Celular</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#437476] transition-colors">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                        value={regForm.phone}
                        onChange={e => setRegForm({ ...regForm, phone: formatPhoneNumber(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Unidade */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Localização</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bloco</label>
                    <div className="relative group">
                      <select
                        required
                        className="block w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium appearance-none"
                        value={regForm.block}
                        onChange={e => setRegForm({ ...regForm, block: e.target.value, unit: '', unit_id: '' })}
                      >
                        <option value="">Selecione...</option>
                        {uniqueBlocks.map(block => (
                          <option key={block} value={block}>Bloco {block}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nº da Unidade</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#437476] transition-colors">
                        <Building size={18} />
                      </div>
                      <select
                        required
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium appearance-none"
                        value={regForm.unit_id}
                        onChange={e => setRegForm({ ...regForm, unit_id: e.target.value })}
                        disabled={!regForm.block}
                      >
                        <option value="">Selecione a Unidade...</option>
                        {availableUnits.map(u => (
                          <option key={u.id} value={u.id}>{u.number}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Previsão de Mudança</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#437476] transition-colors">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                      value={regForm.entryDate}
                      onChange={e => setRegForm({ ...regForm, entryDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Seção 3: Tipo de Ocupação */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Tipo de Ocupação</span>
                    <div className="h-px bg-slate-100 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border rounded-2xl p-4 flex items-center justify-center gap-3 transition-all ${regForm.profile_type === 'INQUILINO' ? 'border-[#437476] bg-[#437476]/5 text-[#437476]' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                      <input
                        type="radio"
                        name="profile_type"
                        value="INQUILINO"
                        checked={regForm.profile_type === 'INQUILINO'}
                        onChange={e => setRegForm({ ...regForm, profile_type: 'INQUILINO' })}
                        className="hidden"
                      />
                      <span className="text-xs font-bold uppercase tracking-wider">Inquilino</span>
                    </label>
                    <label className={`cursor-pointer border rounded-2xl p-4 flex items-center justify-center gap-3 transition-all ${regForm.profile_type === 'PROPRIETARIO' ? 'border-[#437476] bg-[#437476]/5 text-[#437476]' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                      <input
                        type="radio"
                        name="profile_type"
                        value="PROPRIETARIO"
                        checked={regForm.profile_type === 'PROPRIETARIO'}
                        onChange={e => setRegForm({ ...regForm, profile_type: 'PROPRIETARIO' })}
                        className="hidden"
                      />
                      <span className="text-xs font-bold uppercase tracking-wider">Proprietário</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Seção 4: Segurança */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Segurança</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#437476] transition-colors">
                        <Key size={18} />
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                        value={regForm.password}
                        onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirme sua Senha</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#437476] transition-colors">
                        <Key size={18} />
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                        value={regForm.confirmPassword}
                        onChange={e => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex flex-col gap-4">
                <button
                  type="submit"
                  className="w-full py-5 bg-[#437476] text-white font-black rounded-3xl hover:bg-[#365e5f] hover:-translate-y-1 transition-all shadow-2xl shadow-[#437476]/30 text-sm uppercase tracking-widest active:scale-[0.98]"
                >
                  Enviar Solicitação para a Administração
                </button>
              </div>
            </form>
          </div>

          <p className="mt-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] opacity-40">
            &copy; 2025 Maison Manager. Excelência em Gestão.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-['Inter']">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#437476]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#437476] to-[#2d4d4e] flex items-center justify-center text-white shadow-xl shadow-[#437476]/20 ring-4 ring-white">
            <Home size={32} fill="currentColor" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-black text-slate-800 tracking-tight">
          {condominium?.login_title || condominium?.name || 'Maison Manager'}
        </h2>
        <p className="mt-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestão Condominial Inteligente</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500 delay-150">
        <div className="bg-white py-10 px-4 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] sm:rounded-[2.5rem] sm:px-12 border border-slate-100">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#437476] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Senha</label>
                  <button
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-[#437476] hover:text-[#365e5f] hover:underline flex items-center gap-1 transition-colors uppercase tracking-tight"
                  >
                    <Key size={10} /> Esqueci a senha
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#437476] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#437476] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const formData = new URLSearchParams();
                  formData.append('username', email);
                  formData.append('password', password);

                  const response = await api.post('/auth/login', formData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                  });

                  await signIn();
                } catch (err) {
                  alert('Falha no login. Verifique suas credenciais.');
                  console.error(err);
                }
              }}
              className="w-full py-4.5 bg-[#437476] text-white font-black rounded-2xl hover:bg-[#365e5f] hover:-translate-y-0.5 transition-all shadow-xl shadow-[#437476]/30 text-sm uppercase tracking-widest active:scale-[0.98] py-4"
            >
              Acessar Painel
            </button>



            <div className="pt-2 text-center">
              <button
                onClick={() => setView('register')}
                className="text-[11px] font-black text-slate-500 hover:text-[#437476] flex items-center justify-center gap-2 mx-auto transition-all group uppercase tracking-widest"
              >
                <UserPlus size={16} className="text-slate-300 group-hover:text-[#437476] transition-colors" />
                Novo no condomínio? <span className="text-[#437476] group-hover:underline">Solicitar acesso</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-60">
          &copy; 2025 Maison Manager.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
