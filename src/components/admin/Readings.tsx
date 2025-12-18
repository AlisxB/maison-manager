import React, { useState } from 'react';
import { 
  Droplets, 
  Flame, 
  Zap, 
  Share2, 
  PlusCircle, 
  X,
  ShoppingBag,
  Truck,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { MOCK_RESIDENTS } from '../../mock';
import { Link as LinkIcon } from 'lucide-react';

export const AdminReadings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'water' | 'gas' | 'energy'>('water');
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isEnergyModalOpen, setIsEnergyModalOpen] = useState(false);
  const [waterForm, setWaterForm] = useState({ unit: '', reading: '', date: '2025-12-16', photoUrl: '' });
  const [gasForm, setGasForm] = useState({ provider: '', c1: 0, c2: 0, c3: 0, c4: 0, total: 0, date: '2025-12-17' });
  const [energyForm, setEnergyForm] = useState({ consumption: 0, total: 0, dueDate: '2025-12-17', status: 'Pendente' });

  // Mock data for Gas and Energy
  const mockGasPurchases = [
    { id: 1, date: '15/12/2025', provider: 'SuperGás', qty: '400 kg', total: 4500.00 },
    { id: 2, date: '10/11/2025', provider: 'Nacional Gás', qty: '350 kg', total: 4100.00 },
  ];

  const mockEnergyBills = [
    { id: 1, month: 'Dezembro/2025', consumption: '12500 kWh', total: 11200.00, status: 'Pendente' },
    { id: 2, month: 'Novembro/2025', consumption: '11800 kWh', total: 10500.00, status: 'Pago' },
  ];

  const TabButton = ({ id, label, icon: Icon }: { id: 'water' | 'gas' | 'energy', label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
        ${activeTab === id 
          ? 'bg-[#fcfbf9] text-[#437476] border-b-2 border-[#437476] shadow-sm' 
          : 'bg-[#e2e6e9] text-slate-500 hover:text-slate-700 hover:bg-[#dfe3e6]'}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-[#437476]">Leituras e Consumo</h2>
           <p className="text-sm text-slate-500 mt-1">Gerencie o consumo de água, gás e energia do condomínio.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#fcfbf9] border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">
           <Share2 size={16} /> Compartilhar Relatório
        </button>
      </div>

      <div className="flex rounded-lg overflow-hidden border border-slate-200">
         <TabButton id="water" label="Água (Individual)" icon={Droplets} />
         <TabButton id="gas" label="Gás (Geral)" icon={Flame} />
         <TabButton id="energy" label="Energia (Geral)" icon={Zap} />
      </div>

      <div className="bg-[#fcfbf9] border border-slate-200 rounded-lg shadow-sm min-h-[400px] flex flex-col">
        {activeTab === 'water' && (
          <>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
               <div>
                  <h3 className="text-lg font-bold text-slate-700">Leituras de Água</h3>
                  <p className="text-sm text-slate-500">Leituras individuais dos medidores de água dos moradores.</p>
               </div>
               <div className="flex gap-3">
                  <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 outline-none">
                     <option>Mês: Dezembro</option>
                     <option>Mês: Novembro</option>
                  </select>
                  <button 
                     onClick={() => setIsWaterModalOpen(true)}
                     className="flex items-center gap-2 px-4 py-2 bg-[#437476] text-white rounded-lg text-sm font-medium hover:bg-[#365e5f]"
                  >
                     <PlusCircle size={16} /> Registrar Leitura
                  </button>
               </div>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                     <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Unidade</th>
                        <th className="px-6 py-4">Morador</th>
                        <th className="px-6 py-4 text-right">Leitura (m³)</th>
                        <th className="px-6 py-4 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {MOCK_RESIDENTS.map((res, i) => (
                        <tr key={res.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-slate-500">15/12/2025</td>
                           <td className="px-6 py-4 font-bold text-slate-700">{res.unit}</td>
                           <td className="px-6 py-4">{res.name}</td>
                           <td className="px-6 py-4 text-right font-mono text-slate-700">{1000 + (i * 15)}.5</td>
                           <td className="px-6 py-4 text-center">
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Verificado</span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </>
        )}
        
        {activeTab === 'gas' && (
           <>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
               <div>
                  <h3 className="text-lg font-bold text-slate-700">Histórico de Compras de Gás</h3>
                  <p className="text-sm text-slate-500">Registro de abastecimento dos cilindros do condomínio.</p>
               </div>
               <button 
                  onClick={() => setIsGasModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-slate-800"
               >
                  <PlusCircle size={16} /> Nova Compra
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                     <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Fornecedor</th>
                        <th className="px-6 py-4">Quantidade</th>
                        <th className="px-6 py-4 text-right">Valor Total</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {mockGasPurchases.map((gas) => (
                        <tr key={gas.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-slate-900 font-medium">{gas.date}</td>
                           <td className="px-6 py-4">{gas.provider}</td>
                           <td className="px-6 py-4">{gas.qty}</td>
                           <td className="px-6 py-4 text-right font-bold text-slate-700">R$ {gas.total.toFixed(2)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
           </>
        )}

        {activeTab === 'energy' && (
           <>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
               <div>
                  <h3 className="text-lg font-bold text-slate-700">Contas de Energia</h3>
                  <p className="text-sm text-slate-500">Histórico de faturas da concessionária de energia.</p>
               </div>
               <button 
                  onClick={() => setIsEnergyModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-slate-800"
               >
                  <PlusCircle size={16} /> Nova Fatura
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                     <tr>
                        <th className="px-6 py-4">Mês de Referência</th>
                        <th className="px-6 py-4">Consumo Total</th>
                        <th className="px-6 py-4 text-right">Valor</th>
                        <th className="px-6 py-4 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {mockEnergyBills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-slate-900 font-medium">{bill.month}</td>
                           <td className="px-6 py-4">{bill.consumption}</td>
                           <td className="px-6 py-4 text-right font-bold text-slate-700">R$ {bill.total.toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                 bill.status === 'Pago' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                 {bill.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
           </>
        )}
      </div>

      {/* Water Modal */}
      {isWaterModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#fcfbf9] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-[#e5e7eb] animate-in fade-in zoom-in-95 duration-200 relative">
               <button 
                  onClick={() => setIsWaterModalOpen(false)} 
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
               >
                  <X size={20} />
               </button>
               <div className="px-8 py-6">
                  <div className="mb-6">
                     <h3 className="text-xl font-bold text-slate-700">Detalhes da Leitura de Água</h3>
                     <p className="text-sm text-slate-500 mt-1">Preencha os detalhes abaixo para registrar uma nova leitura do medidor de água.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                     <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Unidade (Apartamento)</label>
                        <select 
                           className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]"
                           value={waterForm.unit}
                           onChange={e => setWaterForm({...waterForm, unit: e.target.value})}
                        >
                           <option>Selecione uma unidade</option>
                           {MOCK_RESIDENTS.map(r => <option key={r.id} value={r.unit}>{r.unit} - {r.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Data da Leitura</label>
                        <div className="relative">
                           <input 
                              type="text" 
                              value={waterForm.date}
                              readOnly 
                              className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm text-slate-600 outline-none"
                           />
                           <Calendar size={18} className="absolute right-4 top-3.5 text-slate-400" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Medidor</label>
                        <input 
                           type="text" 
                           disabled 
                           value="Água" 
                           className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm text-slate-500" 
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Link da Foto (Opcional)</label>
                        <div className="relative">
                           <LinkIcon size={18} className="absolute left-3 top-3.5 text-slate-400" />
                           <input 
                              type="text" 
                              placeholder="https://exemplo.com/foto.jpg"
                              className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]"
                              value={waterForm.photoUrl}
                              onChange={e => setWaterForm({...waterForm, photoUrl: e.target.value})}
                           />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Cole a URL de uma imagem que comprove a leitura.</p>
                     </div>
                     <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-slate-600 mb-2">Valor da Leitura (m³)</label>
                        <div className="relative">
                           <input 
                              type="number" 
                              placeholder="ex: 1234.5"
                              className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]"
                              value={waterForm.reading}
                              onChange={e => setWaterForm({...waterForm, reading: e.target.value})}
                           />
                           <div className="absolute right-3 top-3.5 flex flex-col gap-0.5">
                              <ChevronDown size={10} className="text-slate-400 rotate-180" />
                              <ChevronDown size={10} className="text-slate-400" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                     <button 
                        onClick={() => setIsWaterModalOpen(false)}
                        className="px-6 py-3 bg-[#437476] text-white text-sm font-medium rounded-lg hover:bg-[#365e5f] shadow-sm transition-colors"
                     >
                        Enviar Leitura
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Gas Modal */}
      {isGasModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#fcfbf9] rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-[#e5e7eb] animate-in fade-in zoom-in-95 duration-200 relative">
               <button 
                  onClick={() => setIsGasModalOpen(false)} 
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
               >
                  <X size={20} />
               </button>
               
               <div className="px-8 py-8">
                  <div className="mb-6">
                     <h3 className="text-xl font-bold text-slate-700">Registrar Nova Compra de Gás</h3>
                     <p className="text-sm text-slate-500 mt-1">Preencha os detalhes da compra abaixo.</p>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Empresa Fornecedora</label>
                        <div className="relative">
                           <Truck size={18} className="absolute left-3 top-3.5 text-slate-400" />
                           <input 
                              type="text" 
                              placeholder="Ex: SuperGás" 
                              className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]" 
                              value={gasForm.provider}
                              onChange={e => setGasForm({...gasForm, provider: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((num) => (
                           <div key={num}>
                              <label className="block text-xs font-bold text-slate-600 mb-1.5 text-center">Cilindro {num} (kg)</label>
                              <div className="relative">
                                 <ShoppingBag size={14} className="absolute left-2.5 top-3 text-slate-400" />
                                 <input 
                                    type="number" 
                                    placeholder="0" 
                                    className="w-full pl-8 pr-2 py-2.5 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476] text-center"
                                 />
                                 <div className="absolute right-1 top-2.5 flex flex-col gap-0">
                                    <ChevronDown size={8} className="text-slate-400 rotate-180" />
                                    <ChevronDown size={8} className="text-slate-400" />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Valor Total (R$)</label>
                        <div className="relative">
                           <span className="absolute left-3 top-3 text-slate-400 font-bold">$</span>
                           <input 
                              type="number" 
                              placeholder="0" 
                              className="w-full pl-8 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]" 
                              value={gasForm.total || ''}
                              onChange={e => setGasForm({...gasForm, total: parseFloat(e.target.value)})}
                           />
                           <div className="absolute right-3 top-3.5 flex flex-col gap-0.5">
                              <ChevronDown size={10} className="text-slate-400 rotate-180" />
                              <ChevronDown size={10} className="text-slate-400" />
                           </div>
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Data da Compra</label>
                        <div className="relative">
                           <input 
                              type="text" 
                              value={gasForm.date}
                              readOnly 
                              className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm text-slate-600 outline-none"
                           />
                           <Calendar size={18} className="absolute right-4 top-3.5 text-slate-400" />
                        </div>
                     </div>
                  </div>

                  <button 
                     onClick={() => setIsGasModalOpen(false)}
                     className="w-full mt-8 py-3 bg-[#437476] text-white text-sm font-medium rounded-lg hover:bg-[#365e5f] shadow-sm transition-colors"
                  >
                     Salvar Compra
                  </button>
               </div>
            </div>
         </div>
      )}
      
      {/* Energy Modal */}
      {isEnergyModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#fcfbf9] rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-[#e5e7eb] animate-in fade-in zoom-in-95 duration-200 relative">
               <button 
                  onClick={() => setIsEnergyModalOpen(false)} 
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
               >
                  <X size={20} />
               </button>

               <div className="px-8 py-8">
                  <div className="mb-6">
                     <h3 className="text-xl font-bold text-slate-700">Registrar Nova Conta de Energia</h3>
                     <p className="text-sm text-slate-500 mt-1">Preencha os detalhes da conta abaixo.</p>
                  </div>

                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-slate-600 mb-2">Consumo (kWh)</label>
                           <div className="relative">
                              <Zap size={18} className="absolute left-3 top-3.5 text-slate-400" />
                              <input 
                                 type="number" 
                                 placeholder="0" 
                                 className="w-full pl-10 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]" 
                                 value={energyForm.consumption || ''}
                                 onChange={e => setEnergyForm({...energyForm, consumption: parseFloat(e.target.value)})}
                              />
                              <div className="absolute right-2 top-3.5 flex flex-col gap-0.5">
                                 <ChevronDown size={10} className="text-slate-400 rotate-180" />
                                 <ChevronDown size={10} className="text-slate-400" />
                              </div>
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-600 mb-2">Valor Total (R$)</label>
                           <div className="relative">
                              <span className="absolute left-3 top-3 text-slate-400 font-bold">$</span>
                              <input 
                                 type="number" 
                                 placeholder="0" 
                                 className="w-full pl-8 pr-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#437476]" 
                                 value={energyForm.total || ''}
                                 onChange={e => setEnergyForm({...energyForm, total: parseFloat(e.target.value)})}
                              />
                              <div className="absolute right-2 top-3.5 flex flex-col gap-0.5">
                                 <ChevronDown size={10} className="text-slate-400 rotate-180" />
                                 <ChevronDown size={10} className="text-slate-400" />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-slate-600 mb-2">Data de Vencimento</label>
                           <div className="relative">
                              <input 
                                 type="text" 
                                 value={energyForm.dueDate}
                                 readOnly 
                                 className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm text-slate-600 outline-none"
                              />
                              <Calendar size={18} className="absolute right-3 top-3.5 text-slate-400" />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-600 mb-2">Status</label>
                           <select 
                              className="w-full px-4 py-3 bg-[#f3f4f6] border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#437476]"
                              value={energyForm.status}
                              onChange={e => setEnergyForm({...energyForm, status: e.target.value})}
                           >
                              <option>Pendente</option>
                              <option>Pago</option>
                              <option>Atrasado</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <button 
                     onClick={() => setIsEnergyModalOpen(false)}
                     className="w-full mt-8 py-3 bg-[#437476] text-white text-sm font-medium rounded-lg hover:bg-[#365e5f] shadow-sm transition-colors"
                  >
                     Salvar Conta
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};