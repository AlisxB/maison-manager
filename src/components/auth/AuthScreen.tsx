
import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  ArrowRight,
  User,
  ShieldCheck,
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
  PlusCircle,
  Trash2
} from 'lucide-react';
import { Role } from '../../types';

// onLogin is removed from props as we use context
interface AuthScreenProps { }

const AuthScreen: React.FC<AuthScreenProps> = () => {
  const { signIn } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados do Formulário de Cadastro
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    block: '',
    unit: '',
    entryDate: '',
    hasPets: 'Não',
    petsList: [{ quantity: 1, type: '' }],
    password: '',
    confirmPassword: ''
  });

  const handleDemoLogin = (role: Role) => {
    onLogin(role);
  };

  const handleForgotPassword = () => {
    alert('Funcionalidade de recuperação de senha enviada para o e-mail informado (Simulação).');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    alert('Solicitação de acesso enviada com sucesso! Aguarde a aprovação da administração.');
    setView('login');
  };

  const handleAddPetRow = () => {
    setRegForm(prev => ({
      ...prev,
      petsList: [...prev.petsList, { quantity: 1, type: '' }]
    }));
  };

  const handleRemovePetRow = (index: number) => {
    if (regForm.petsList.length === 1 && index === 0) return;
    const newPets = regForm.petsList.filter((_, i) => i !== index);
    setRegForm({ ...regForm, petsList: newPets });
  };

  const handlePetChange = (index: number, field: 'quantity' | 'type', value: string | number) => {
    const newPets = [...regForm.petsList];
    newPets[index] = { ...newPets[index], [field]: value };
    setRegForm({ ...regForm, petsList: newPets });
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
              <h1 className="text-xl font-black text-slate-800 tracking-tighter">Maison <span className="text-[#437476]">Manager</span></h1>
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
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                        value={regForm.phone}
                        onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
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
                        onChange={e => setRegForm({ ...regForm, block: e.target.value })}
                      >
                        <option value="">Selecione...</option>
                        <option value="A">Bloco A</option>
                        <option value="B">Bloco B</option>
                        <option value="C">Bloco C</option>
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
                      <input
                        type="text"
                        required
                        placeholder="Ex: 101"
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                        value={regForm.unit}
                        onChange={e => setRegForm({ ...regForm, unit: e.target.value })}
                      />
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
              </div>

              {/* Seção 3: Animais de Estimação */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Animais</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8">
                  <div className="flex items-center gap-3 mb-6 text-[#437476]">
                    <Cat size={20} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Animais de Estimação</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <p className="text-sm font-bold text-slate-600">Você possui algum animal de estimação residindo na unidade?</p>
                    <div className="flex gap-10">
                      {['Sim', 'Não'].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${regForm.hasPets === opt ? 'border-[#437476] bg-white' : 'border-slate-300 group-hover:border-[#437476]'}`}
                            onClick={() => setRegForm({ ...regForm, hasPets: opt })}
                          >
                            {regForm.hasPets === opt && <div className="w-3.5 h-3.5 rounded-full bg-[#437476] animate-in zoom-in-50 duration-300" />}
                          </div>
                          <span className={`text-sm font-black transition-colors ${regForm.hasPets === opt ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}`}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lista de Animais (Expande dinamicamente) */}
                  {regForm.hasPets === 'Sim' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 mt-8 pt-8 border-t border-slate-200/60">
                      {regForm.petsList.map((pet, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-4 space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Qtd</label>
                            <input
                              type="number"
                              min="1"
                              className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                              value={pet.quantity}
                              onChange={(e) => handlePetChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div className="col-span-6 space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Espécie</label>
                            <div className="relative">
                              <select
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium appearance-none"
                                value={pet.type}
                                onChange={(e) => handlePetChange(index, 'type', e.target.value)}
                              >
                                <option value="">Selecione...</option>
                                <option value="Cachorro">Cachorro</option>
                                <option value="Gato">Gato</option>
                                <option value="Pássaro">Pássaro</option>
                                <option value="Outro">Outro</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown size={16} />
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 pb-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemovePetRow(index)}
                              className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Remover animal"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-start pt-4">
                        <button
                          type="button"
                          onClick={handleAddPetRow}
                          className="flex items-center gap-2 px-5 py-2.5 text-[#437476] font-black text-[10px] uppercase tracking-widest hover:bg-[#437476]/5 rounded-xl transition-all"
                        >
                          <PlusCircle size={16} /> Adicionar Animal
                        </button>
                      </div>
                    </div>
                  )}
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
        <h2 className="mt-6 text-center text-4xl font-black text-slate-800 tracking-tight">Maison <span className="text-[#437476]">Manager</span></h2>
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#437476]/5 focus:border-[#437476] transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const formData = new FormData();
                  formData.append('username', email);
                  formData.append('password', password);

                  const response = await api.post('/auth/login', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });

                  signIn(response.data.access_token);
                } catch (err) {
                  alert('Falha no login. Verifique suas credenciais.');
                  console.error(err);
                }
              }}
              className="w-full py-4.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-200 text-sm uppercase tracking-widest active:scale-[0.98] py-4"
            >
              Acessar Painel
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-white text-slate-400 font-black uppercase tracking-[0.2em]">Entrar como demo</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => handleDemoLogin('ADMIN')}
                className="w-full group flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:border-[#437476] hover:bg-[#437476]/5 transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-[#437476] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#437476]/20 transition-transform group-hover:scale-110">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-700 group-hover:text-[#437476]">Administrador</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Gestão Completa</p>
                </div>
                <ArrowRight size={18} className="ml-auto text-slate-300 group-hover:text-[#437476] transform group-hover:translate-x-1 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('RESIDENT')}
                className="w-full group flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:border-emerald-600 hover:bg-emerald-50 transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 transition-transform group-hover:scale-110">
                  <User size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-700 group-hover:text-emerald-700">Morador</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Portal do Condômino</p>
                </div>
                <ArrowRight size={18} className="ml-auto text-slate-300 group-hover:text-emerald-700 transform group-hover:translate-x-1 transition-all" />
              </button>
            </div>

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
