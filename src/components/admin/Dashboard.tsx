import React, { useEffect, useState } from 'react';
import { Users, Droplets, Flame, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { DashboardService, DashboardStats } from '../../services/dashboardService';

import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'RESIDENTE';
  const canViewFinancials = ['ADMIN', 'SINDICO', 'SUBSINDICO', 'CONSELHO', 'FINANCEIRO'].includes(role);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, subtext, icon: Icon, iconClassName, colorClass = "text-slate-600", inverseTrend = false }: any) => {
    let trendColor = 'text-slate-400';
    if (subtext.includes('+')) trendColor = inverseTrend ? 'text-rose-500' : 'text-emerald-500';
    else if (subtext.includes('-')) trendColor = inverseTrend ? 'text-emerald-500' : 'text-rose-500';

    return (
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
          <div className={`p-2 rounded-xl bg-slate-50 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-colors ${iconClassName}`}>
            {Icon && <Icon size={18} />}
          </div>
        </div>
        <div>
          <div className={`text-2xl font-black ${colorClass}`}>{value}</div>
          <p className={`text-[10px] font-bold mt-1 ${trendColor}`}>
            {subtext}
          </p>
        </div>
      </div>
    );
  };

  /* Translation Helpers */
  const monthMap: Record<string, string> = {
    'Jan': 'Jan', 'Feb': 'Fev', 'Mar': 'Mar', 'Apr': 'Abr', 'May': 'Mai', 'Jun': 'Jun',
    'Jul': 'Jul', 'Aug': 'Ago', 'Sep': 'Set', 'Oct': 'Out', 'Nov': 'Nov', 'Dec': 'Dez'
  };

  const getTranslatedMonth = (englishName: string) => monthMap[englishName] || englishName;

  const utilityMap: Record<string, string> = {
    'water': 'Água',
    'gas': 'Gás',
    'energy': 'Energia'
  };

  const getResidentStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'ATIVO') return <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-600">Ativo</span>;
    if (s === 'PENDENTE') return <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-50 text-amber-600">Pendente</span>;
    if (s === 'INATIVO') return <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-500">Inativo</span>;
    return <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-50 text-slate-600">{status}</span>;
  };

  const ChartCard = ({ title, subtext, color, dataKey }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-80">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {dataKey === 'water' && <Droplets size={18} className="text-[#437476]" />}
          {dataKey === 'gas' && <Flame size={18} className="text-[#dcb008]" />}
          {dataKey === 'energy' && <Zap size={18} className="text-[#e11d48]" />}
          <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-1">{subtext}</p>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats?.charts || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={10}
              tickFormatter={(val) => getTranslatedMonth(val)}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', color: '#475569' }}
              formatter={(value: number, name: string) => [
                value,
                utilityMap[name] || name
              ]}
              labelFormatter={(label) => getTranslatedMonth(label)}
            />
            <Bar dataKey={dataKey} fill={color} radius={[6, 6, 6, 6]} barSize={24} name={utilityMap[dataKey] || dataKey} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Carregando painel...</div>;
  }

  if (!stats) {
    return <div className="p-10 text-center text-red-400 font-bold">Erro ao carregar dados.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#437476] tracking-tight">Painel do Administrador</h2>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${canViewFinancials ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
        {canViewFinancials && (
          <StatCard
            title="Receita (Mês)"
            value={stats.financial.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            subtext={`${stats.financial.revenue_growth > 0 ? '+' : ''}${stats.financial.revenue_growth.toFixed(1)}% vs anterior`}
            icon={() => <span className="text-emerald-600 font-black text-sm">$</span>}
            colorClass="text-emerald-700"
            iconClassName="text-emerald-600"
          />
        )}
        <StatCard
          title="Inquilinos"
          value={stats.occupancy.residents_count}
          subtext={`${stats.occupancy.occupied_units} unidades ocupadas`}
          icon={Users}
          iconClassName="text-[#437476]"
          colorClass="text-slate-800"
        />
        <StatCard
          title="Água (m³)"
          value={stats.readings.water_total.toFixed(0)}
          subtext={`${stats.readings.water_growth > 0 ? '+' : ''}${stats.readings.water_growth.toFixed(1)}% vs anterior`}
          icon={Droplets}
          iconClassName="text-cyan-500"
          colorClass="text-slate-800"
          inverseTrend
        />
        <StatCard
          title="Gás (kg)"
          value={stats.readings.gas_total.toFixed(0)}
          subtext={`${stats.readings.gas_growth > 0 ? '+' : ''}${stats.readings.gas_growth.toFixed(1)}% vs anterior`}
          icon={Flame}
          iconClassName="text-amber-500"
          colorClass="text-slate-800"
          inverseTrend
        />
        <StatCard
          title="Energia (kWh)"
          value={stats.readings.energy_total.toFixed(0)}
          subtext={`${stats.readings.energy_growth > 0 ? '+' : ''}${stats.readings.energy_growth.toFixed(1)}% vs anterior`}
          icon={Zap}
          iconClassName="text-rose-500"
          colorClass="text-slate-800"
          inverseTrend
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <ChartCard title="Consumo de Água" subtext="Últimos 6 meses (m³)." color="#437476" dataKey="water" />
        <ChartCard title="Consumo de Gás" subtext="Últimos 6 meses (kg)." color="#dcb008" dataKey="gas" />
        <ChartCard title="Energia Elétrica" subtext="Últimos 6 meses (kWh)." color="#e11d48" dataKey="energy" />

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Moradores Recentes</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Visão geral dos novos membros.</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto">
            {stats.recent_residents.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-4">Nenhum morador recente.</div>
            ) : (
              stats.recent_residents.map((res) => (
                <div key={res.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 font-black text-xs group-hover:bg-[#437476] group-hover:text-white transition-colors">
                      {res.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-[#437476] transition-colors">{res.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Unidade {res.unit}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-bold text-slate-300">{res.start_date}</span>
                    {getResidentStatusBadge(res.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};