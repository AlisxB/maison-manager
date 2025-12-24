import React, { useState, useEffect } from 'react';
import { Droplets, Flame, Zap, Plus, Save, History, FileText } from 'lucide-react';
import { ReadingService, WaterReading, GasReading, ElectricityReading } from '../../services/readingService';
import { UnitService, UserService, Unit } from '../../services/userService';

type TabType = 'water' | 'gas' | 'electricity';

export const AdminReadings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('water');
    const [units, setUnits] = useState<Unit[]>([]);
    const [residents, setResidents] = useState<any[]>([]); // To show resident name
    const [loading, setLoading] = useState(false);

    // Lists
    const [waterReadings, setWaterReadings] = useState<WaterReading[]>([]);
    const [gasReadings, setGasReadings] = useState<GasReading[]>([]);
    const [elecReadings, setElecReadings] = useState<ElectricityReading[]>([]);

    // Forms
    const [waterForm, setWaterForm] = useState({ unitId: '', date: '', value: '', image: '' });
    const [gasForm, setGasForm] = useState({ supplier: '', date: '', totalPrice: '', cyl1: '', cyl2: '', cyl3: '', cyl4: '' });
    const [elecForm, setElecForm] = useState({ date: '', kwh: '', totalValue: '', status: 'PENDENTE' });

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        if (activeTab === 'water') fetchWaterReadings();
        if (activeTab === 'gas') fetchGasReadings();
        if (activeTab === 'electricity') fetchElecReadings();
    }, [activeTab]);

    const fetchUnits = async () => {
        try {
            const [unitsData, usersData] = await Promise.all([
                UnitService.getAll(),
                UserService.getAll({ status: 'ATIVO' })
            ]);
            setUnits(unitsData);
            setResidents(usersData.filter((u: any) => u.role === 'RESIDENT' || u.unit_id));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchWaterReadings = async () => {
        const data = await ReadingService.getAllWater();
        setWaterReadings(data);
    };
    const fetchGasReadings = async () => {
        const data = await ReadingService.getAllGas();
        setGasReadings(data);
    };
    const fetchElecReadings = async () => {
        const data = await ReadingService.getAllElectricity();
        setElecReadings(data);
    };

    // Submits
    const handleWaterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReadingService.createWater({
                unit_id: waterForm.unitId,
                reading_date: waterForm.date,
                value_m3: parseFloat(waterForm.value),
                image_url: waterForm.image
            });
            alert('Leitura de Água salva!');
            setWaterForm({ unitId: '', date: '', value: '', image: '' });
            fetchWaterReadings();
        } catch (err) { alert('Erro ao salvar'); }
    };

    const handleGasSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReadingService.createGas({
                supplier: gasForm.supplier,
                purchase_date: gasForm.date,
                total_price: parseFloat(gasForm.totalPrice),
                cylinder_1_kg: parseFloat(gasForm.cyl1),
                cylinder_2_kg: parseFloat(gasForm.cyl2),
                cylinder_3_kg: parseFloat(gasForm.cyl3),
                cylinder_4_kg: parseFloat(gasForm.cyl4),
            });
            alert('Registro de Gás salvo!');
            setGasForm({ supplier: '', date: '', totalPrice: '', cyl1: '', cyl2: '', cyl3: '', cyl4: '' });
            fetchGasReadings();
        } catch (err) { alert('Erro ao salvar'); }
    };

    const handleElecSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReadingService.createElectricity({
                due_date: elecForm.date,
                consumption_kwh: parseFloat(elecForm.kwh),
                total_value: parseFloat(elecForm.totalValue),
                status: elecForm.status as any
            });
            alert('Registro de Energia salvo!');
            setElecForm({ date: '', kwh: '', totalValue: '', status: 'PENDING' });
            fetchElecReadings();
        } catch (err) { alert('Erro ao salvar'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Leituras e Consumo</h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie leituras de água, gás e energia.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('water')}
                    className={`pb-3 px-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'water' ? 'border-[#437476] text-[#437476]' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Droplets size={18} />
                    <span>Água (Individual)</span>
                </button>
                <button
                    onClick={() => setActiveTab('gas')}
                    className={`pb-3 px-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'gas' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Flame size={18} />
                    <span>Gás (Coletivo)</span>
                </button>
                <button
                    onClick={() => setActiveTab('electricity')}
                    className={`pb-3 px-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'electricity' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Zap size={18} />
                    <span>Energia (Coletivo)</span>
                </button>
            </div>

            {/* Content using Grid for Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
                            <Plus size={20} className="text-[#437476]" />
                            <span>Nova Leitura: {activeTab === 'water' ? 'Água' : activeTab === 'gas' ? 'Gás' : 'Energia'}</span>
                        </h3>

                        {/* WATER FORM */}
                        {activeTab === 'water' && (
                            <form onSubmit={handleWaterSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                                    <select
                                        required
                                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#437476]/20"
                                        value={waterForm.unitId}
                                        onChange={e => setWaterForm({ ...waterForm, unitId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {units.map(u => {
                                            const resident = residents.find(r => r.unit_id === u.id);
                                            return (
                                                <option key={u.id} value={u.id}>
                                                    Bl {u.block} - Apt {u.number} {resident ? `(${resident.name})` : '(Vazio)'}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Leitura</label>
                                    <input
                                        type="date" required
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={waterForm.date}
                                        onChange={e => setWaterForm({ ...waterForm, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Leitura (m³)</label>
                                    <input
                                        type="number" step="0.001" required
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={waterForm.value}
                                        onChange={e => setWaterForm({ ...waterForm, value: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Comprovante (URL/Foto)</label>
                                    <input
                                        type="text" placeholder="http://..."
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={waterForm.image}
                                        onChange={e => setWaterForm({ ...waterForm, image: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-[#437476] text-white py-3 rounded-xl font-medium hover:bg-[#365e5f] transition-all">
                                    Salvar Leitura
                                </button>
                            </form>
                        )}

                        {/* GAS FORM */}
                        {activeTab === 'gas' && (
                            <form onSubmit={handleGasSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor</label>
                                    <input
                                        type="text" required
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={gasForm.supplier}
                                        onChange={e => setGasForm({ ...gasForm, supplier: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Compra</label>
                                    <input
                                        type="date" required
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={gasForm.date}
                                        onChange={e => setGasForm({ ...gasForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-500">Cilindro 1 (kg)</label>
                                        <input type="number" step="0.1" required className="w-full p-2 rounded-lg border" value={gasForm.cyl1} onChange={e => setGasForm({ ...gasForm, cyl1: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500">Cilindro 2 (kg)</label>
                                        <input type="number" step="0.1" required className="w-full p-2 rounded-lg border" value={gasForm.cyl2} onChange={e => setGasForm({ ...gasForm, cyl2: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500">Cilindro 3 (kg)</label>
                                        <input type="number" step="0.1" required className="w-full p-2 rounded-lg border" value={gasForm.cyl3} onChange={e => setGasForm({ ...gasForm, cyl3: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500">Cilindro 4 (kg)</label>
                                        <input type="number" step="0.1" required className="w-full p-2 rounded-lg border" value={gasForm.cyl4} onChange={e => setGasForm({ ...gasForm, cyl4: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={gasForm.totalPrice}
                                        onChange={e => setGasForm({ ...gasForm, totalPrice: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-all">
                                    Registrar Compra
                                </button>
                            </form>
                        )}

                        {/* ELECTRICITY FORM */}
                        {activeTab === 'electricity' && (
                            <form onSubmit={handleElecSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Vencimento</label>
                                    <input
                                        type="date" required
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={elecForm.date}
                                        onChange={e => setElecForm({ ...elecForm, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Consumo (kWh)</label>
                                    <input
                                        type="number" step="0.1" required
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={elecForm.kwh}
                                        onChange={e => setElecForm({ ...elecForm, kwh: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total (R$)</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={elecForm.totalValue}
                                        onChange={e => setElecForm({ ...elecForm, totalValue: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status Pagamento</label>
                                    <select
                                        className="w-full p-2.5 rounded-xl border border-slate-200"
                                        value={elecForm.status}
                                        onChange={e => setElecForm({ ...elecForm, status: e.target.value })}
                                    >
                                        <option value="PENDENTE">Pendente</option>
                                        <option value="PAGO">Pago</option>
                                        <option value="ATRASADO">Em Atraso</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-yellow-500 text-white py-3 rounded-xl font-medium hover:bg-yellow-600 transition-all">
                                    Registrar Fatura
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <History size={20} />
                            Histórico de Registros
                        </h3>
                        <span className="text-sm text-slate-400">
                            {activeTab === 'water' && `${waterReadings.length} registros`}
                            {activeTab === 'gas' && `${gasReadings.length} registros`}
                            {activeTab === 'electricity' && `${elecReadings.length} registros`}
                        </span>
                    </div>

                    {/* WATER LIST */}
                    {activeTab === 'water' && waterReadings.map(r => {
                        const unit = units.find(u => u.id === r.unit_id);
                        return (
                            <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#437476]/10 text-[#437476] rounded-lg">
                                        <Droplets size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">
                                            {unit ? `Bl ${unit.block} - Apt ${unit.number}` : 'Unidade Desconhecida'}
                                        </h4>
                                        <p className="text-sm text-slate-500">Data: {new Date(r.reading_date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-slate-800">{r.value_m3} m³</p>
                                    {r.image_url && (
                                        <a href={r.image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#437476] hover:underline flex items-center justify-end gap-1">
                                            <FileText size={12} /> Comprovante
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* GAS LIST */}
                    {activeTab === 'gas' && gasReadings.map(r => (
                        <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-50 text-orange-500 rounded-lg">
                                        <Flame size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{r.supplier}</h4>
                                        <p className="text-sm text-slate-500">Data: {new Date(r.purchase_date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-slate-800">R$ {r.total_price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-50 p-2 rounded-lg text-slate-600">
                                <div>C1: {r.cylinder_1_kg}kg</div>
                                <div>C2: {r.cylinder_2_kg}kg</div>
                                <div>C3: {r.cylinder_3_kg}kg</div>
                                <div>C4: {r.cylinder_4_kg}kg</div>
                            </div>
                        </div>
                    ))}

                    {/* ELECTRICITY LIST */}
                    {activeTab === 'electricity' && elecReadings.map(r => (
                        <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-50 text-yellow-500 rounded-lg">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Fatura Energia</h4>
                                    <p className="text-sm text-slate-500">Venc: {new Date(r.due_date).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-slate-800">R$ {r.total_value.toFixed(2)}</p>
                                <p className="text-sm font-medium text-slate-600">{r.consumption_kwh} kWh <span className={`ml-2 px-2 py-0.5 rounded-full text-xs text-white ${r.status === 'PAGO' ? 'bg-green-500' : r.status === 'ATRASADO' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                                    {r.status === 'PAGO' && 'Pago'}
                                    {r.status === 'ATRASADO' && 'Atrasado'}
                                    {r.status === 'PENDENTE' && 'Pendente'}
                                    {!['PAGO', 'ATRASADO', 'PENDENTE'].includes(r.status) && r.status}
                                </span></p>
                            </div>
                        </div>
                    ))}

                    {/* Empty States */}
                    {(activeTab === 'water' && waterReadings.length === 0) && <div className="p-8 text-center text-slate-400">Nenhuma leitura de água registrada.</div>}
                    {(activeTab === 'gas' && gasReadings.length === 0) && <div className="p-8 text-center text-slate-400">Nenhum registro de gás.</div>}
                    {(activeTab === 'electricity' && elecReadings.length === 0) && <div className="p-8 text-center text-slate-400">Nenhuma fatura de energia.</div>}
                </div>
            </div>
        </div>
    );
};
