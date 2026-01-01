import React from 'react';
import { LayoutDashboard, Home, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RoleSelectionScreenProps {
    onSelect: (view: string) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelect }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-['Inter'] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vh] h-[50vh] bg-[#437476]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vh] h-[50vh] bg-emerald-500/5 rounded-full blur-3xl"></div>

            <div className="z-10 w-full max-w-4xl">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-3">
                        Bem-vindo, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Como deseja acessar o sistema hoje?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
                    {/* Admin Card */}
                    <button
                        onClick={() => onSelect('admin_dashboard')}
                        className="group relative bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#437476]/10 hover:border-[#437476]/30 transition-all duration-300 text-left animate-in fade-in slide-in-from-left-4 duration-700 delay-100 flex flex-col h-64 justify-between overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-[#437476]/5 rounded-full blur-3xl translate-x-12 -translate-y-12 group-hover:bg-[#437476]/10 transition-colors"></div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-[#437476]/10 flex items-center justify-center text-[#437476] mb-6 group-hover:scale-110 transition-transform duration-300">
                                <LayoutDashboard size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-[#437476] transition-colors">Painel Administrativo</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Gerencie unidades, financeira, ocorrências e configurações do condomínio.
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center text-[#437476] font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                            Acessar Gestão <ArrowRight size={16} className="ml-2" />
                        </div>
                    </button>

                    {/* Resident Card */}
                    <button
                        onClick={() => onSelect('resident_dashboard')}
                        className="group relative bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 text-left animate-in fade-in slide-in-from-right-4 duration-700 delay-200 flex flex-col h-64 justify-between overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl translate-x-12 -translate-y-12 group-hover:bg-emerald-500/10 transition-colors"></div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Home size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">Painel do Morador</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Visualize seus comunicados, reservas, boletos e abra chamados.
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center text-emerald-600 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                            Acessar Minha Unidade <ArrowRight size={16} className="ml-2" />
                        </div>
                    </button>
                </div>

                <p className="mt-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-60 animate-in fade-in duration-1000 delay-500">
                    Maison Manager
                </p>
            </div>
        </div>
    );
};
