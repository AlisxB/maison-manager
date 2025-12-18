import React from 'react';
import { Droplets, Flame, Zap, BarChart3, CheckCircle, FileText, Calendar, Check } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { MOCK_UTILITY_DATA } from '../../mock';

export const ResidentConsumption: React.FC = () => {
  // Mock specific data for this view
  const currentMonth = {
    water: 14.5, // m3
    gas: 450, // kg (condo total)
    energy: 3200 // kWh (condo total)
  };

  const readingsHistory = [
    { id: 1, date: '15/12/2025', previous: 1240, current: 1254.5, consumption: 14.5, value: 185.40, status: 'Verificado' },
    { id: 2, date: '15/11/2025', previous: 1228, current: 1240, consumption: 12.0, value: 152.80, status: 'Verificado' },
    { id: 3, date: '15/10/2025', previous: 1215, current: 1228, consumption: 13.0, value: 164.20, status: 'Verificado' },
    { id: 4, date: '15/09/2025', previous: 1205, current: 1215, consumption: 10.0, value: 128.50, status: 'Verificado' },
  ];

  return (
     <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Consumo e Leituras</h2>
           <p className="text-sm text-slate-500 mt-1">Acompanhe seu consumo individual de água e os gastos gerais do condomínio.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Water Card */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="p-4 bg-cyan-50 text-cyan-600 rounded-full">
                 <Droplets size={28} />
              </div>
              <div>
                 <p className="text-sm font-medium text-slate-500">Minha Água (Dez)</p>
                 <h3 className="text-2xl font-bold text-slate-900">{currentMonth.water} m³</h3>
                 <p className="text-xs text-slate-400 mt-1">R$ 185,40 (estimado)</p>
              </div>
           </div>
           
           {/* Gas Card */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
                 <Flame size={28} />
              </div>
              <div>
                 <p className="text-sm font-medium text-slate-500">Gás Condomínio</p>
                 <h3 className="text-2xl font-bold text-slate-900">{currentMonth.gas} kg</h3>
                 <p className="text-xs text-slate-400 mt-1">Rateio global</p>
              </div>
           </div>

           {/* Energy Card */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="p-4 bg-yellow-50 text-yellow-600 rounded-full">
                 <Zap size={28} />
              </div>
              <div>
                 <p className="text-sm font-medium text-slate-500">Energia Condomínio</p>
                 <h3 className="text-2xl font-bold text-slate-900">{currentMonth.energy} kWh</h3>
                 <p className="text-xs text-slate-400 mt-1">Áreas comuns</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Chart Section */}
           <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="mb-6">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 size={20} className="text-cyan-600" />
                    Histórico de Consumo de Água
                 </h3>
                 <p className="text-sm text-slate-500">Seu consumo individual nos últimos 6 meses (m³).</p>
              </div>
              <div className="h-72 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_UTILITY_DATA}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                       <Bar dataKey="water" name="Água (m³)" fill="#0891b2" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Quick Tips or Summary Side */}
           <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 h-full">
              <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                 <CheckCircle size={20} /> Dicas de Economia
              </h3>
              <ul className="space-y-4 text-sm text-emerald-800/80">
                 <li className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Verifique torneiras pingando. Uma gota por segundo desperdiça 30 litros por dia.</span>
                 </li>
                 <li className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Reduza o tempo no banho. 5 minutos são suficientes para higienizar e economizar.</span>
                 </li>
                 <li className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Use a máquina de lavar sempre na capacidade máxima para otimizar os ciclos.</span>
                 </li>
                 <li className="flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Relate vazamentos nas áreas comuns imediatamente pelo app.</span>
                 </li>
              </ul>
           </div>
        </div>

        {/* Readings History Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
           <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
              <div>
                 <h3 className="text-lg font-bold text-slate-800">Registro de Leituras</h3>
                 <p className="text-sm text-slate-500">Histórico detalhado das medições realizadas no seu hidrômetro.</p>
              </div>
              <button className="px-4 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all">
                 <FileText size={16} /> Exportar Relatório
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                 <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                       <th className="px-6 py-4">Data da Leitura</th>
                       <th className="px-6 py-4 text-right">Anterior (m³)</th>
                       <th className="px-6 py-4 text-right">Atual (m³)</th>
                       <th className="px-6 py-4 text-right">Consumo</th>
                       <th className="px-6 py-4 text-right">Valor Estimado</th>
                       <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {readingsHistory.map((item) => (
                       <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                             <Calendar size={16} className="text-slate-400" />
                             {item.date}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-slate-500">{item.previous}</td>
                          <td className="px-6 py-4 text-right font-mono text-slate-500">{item.current}</td>
                          <td className="px-6 py-4 text-right">
                             <span className="font-bold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-md">
                                {item.consumption} m³
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right text-slate-800 font-medium">
                             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <Check size={10} /> {item.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
     </div>
  );
};