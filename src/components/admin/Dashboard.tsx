import React from 'react';
import { Users, Droplets, Flame, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { MOCK_RESIDENTS, MOCK_UTILITY_DATA } from '../../mock';

export const AdminDashboard: React.FC = () => {
  const StatCard = ({ title, value, subtext, icon: Icon, iconClassName }: any) => (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        {Icon && <Icon size={16} className={iconClassName} />}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
      </div>
    </div>
  );

  const ChartCard = ({ title, subtext, color, dataKey }: any) => (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-80">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {dataKey === 'water' && <Droplets size={18} className="text-slate-500" />}
          {dataKey === 'gas' && <Flame size={18} className="text-slate-500" />}
          {dataKey === 'energy' && <Zap size={18} className="text-slate-500" />}
          <h3 className="text-lg font-medium text-slate-700">{title}</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_UTILITY_DATA}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#437476]">Painel do Administrador</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Receita Total" value="R$ 48.500,00" subtext="+2,4% do último mês" icon={() => <span className="text-slate-400 text-sm">R$</span>} />
        <StatCard title="Inquilinos" value="45" subtext="Total de unidades alugadas" icon={Users} iconClassName="text-slate-400" />
        <StatCard title="Consumo de Água" value="14.200 m³" subtext="+1,2% do último mês" icon={Droplets} iconClassName="text-slate-400" />
        <StatCard title="Consumo de Gás" value="850 m³" subtext="-0,5% do último mês" icon={Flame} iconClassName="text-slate-400" />
        <StatCard title="Consumo de Energia" value="12.450 kWh" subtext="+3,1% do último mês" icon={Zap} iconClassName="text-slate-400" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <ChartCard title="Água (m³)" subtext="Uso de água nos últimos 6 meses." color="#437476" dataKey="water" />
        <ChartCard title="Gás (m³)" subtext="Uso de gás nos últimos 6 meses." color="#dcb008" dataKey="gas" />
        <ChartCard title="Energia (kWh)" subtext="Uso de energia nos últimos 6 meses." color="#e11d48" dataKey="energy" />
        <div className="bg-[#f8f9fa] p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-700">Moradores Recentes</h3>
            <p className="text-xs text-slate-500 mt-1">Visão geral dos novos membros.</p>
          </div>
          <div className="flex-1 space-y-4">
            {MOCK_RESIDENTS.slice(0, 3).map((res) => (
              <div key={res.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">{res.name.charAt(0)}</div>
                  <div><p className="text-xs font-bold text-slate-700 uppercase">{res.name}</p><p className="text-[10px] text-slate-500">{res.unit}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-600">{res.startDate}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${res.status === 'Ativo' ? 'bg-green-50 text-white' : 'bg-yellow-50 text-white'}`}>{res.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};