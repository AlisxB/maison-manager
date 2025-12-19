import React, { useEffect, useState } from 'react';
import { Droplets, Flame, Zap, BarChart3, CheckCircle, FileText, Calendar, Check, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { ReadingService, WaterReading, GasReading, ElectricityReading } from '../../services/readingService';

export const ResidentConsumption: React.FC = () => {
   const [waterReadings, setWaterReadings] = useState<WaterReading[]>([]);
   const [gasReadings, setGasReadings] = useState<GasReading[]>([]);
   const [energyReadings, setEnergyReadings] = useState<ElectricityReading[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [water, gas, energy] = await Promise.all([
               ReadingService.getAllWater(),
               ReadingService.getAllGas(),
               ReadingService.getAllElectricity()
            ]);
            // Sort by date descending
            setWaterReadings(water.sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime()));
            setGasReadings(gas.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()));
            setEnergyReadings(energy.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()));
         } catch (error) {
            console.error("Error fetching readings:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   // Calculate Current Month Data (or last available)
   const currentWater = waterReadings.length > 0 ? waterReadings[0].value_m3 : 0;
   const currentGas = gasReadings.length > 0
      ? (gasReadings[0].cylinder_1_kg + gasReadings[0].cylinder_2_kg + gasReadings[0].cylinder_3_kg + gasReadings[0].cylinder_4_kg)
      : 0;
   const currentEnergy = energyReadings.length > 0 ? energyReadings[0].consumption_kwh : 0;

   // Prepare Chart Data (Last 6 months)
   // We'll map water readings to chart format
   const chartData = waterReadings.slice(0, 6).reverse().map(r => ({
      name: new Date(r.reading_date).toLocaleDateString('pt-BR', { month: 'short' }),
      water: r.value_m3,
      date: r.reading_date
   }));

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
                  <p className="text-sm font-medium text-slate-500">Minha Água (Última)</p>
                  <h3 className="text-2xl font-bold text-slate-900">{currentWater} m³</h3>
                  <p className="text-xs text-slate-400 mt-1">
                     {waterReadings.length > 0 ? new Date(waterReadings[0].reading_date).toLocaleDateString('pt-BR') : 'Sem dados'}
                  </p>
               </div>
            </div>

            {/* Gas Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
                  <Flame size={28} />
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-500">Gás Condomínio</p>
                  <h3 className="text-2xl font-bold text-slate-900">{currentGas} kg</h3>
                  <p className="text-xs text-slate-400 mt-1">Total Comprado</p>
               </div>
            </div>

            {/* Energy Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="p-4 bg-yellow-50 text-yellow-600 rounded-full">
                  <Zap size={28} />
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-500">Energia Condomínio</p>
                  <h3 className="text-2xl font-bold text-slate-900">{currentEnergy} kWh</h3>
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
                  <p className="text-sm text-slate-500">Seu consumo individual nos últimos meses (m³).</p>
               </div>
               <div className="h-72 w-full">
                  {chartData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                           <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                           <Bar dataKey="water" name="Água (m³)" fill="#0891b2" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <BarChart3 size={48} className="mb-2 opacity-50" />
                        <p>Ainda não há dados suficientes para o gráfico.</p>
                     </div>
                  )}
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
                  <h3 className="text-lg font-bold text-slate-800">Registro de Leituras (Água)</h3>
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
                        <th className="px-6 py-4 text-right">Consumo (m³)</th>
                        <th className="px-6 py-4 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {waterReadings.length > 0 ? waterReadings.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                              <Calendar size={16} className="text-slate-400" />
                              {new Date(item.reading_date).toLocaleDateString('pt-BR')}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <span className="font-bold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-md">
                                 {item.value_m3} m³
                              </span>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                 <Check size={10} /> Verificado
                              </span>
                           </td>
                        </tr>
                     )) : (
                        <tr>
                           <td colSpan={3} className="p-8 text-center text-slate-400">
                              Nenhuma leitura encontrada.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};