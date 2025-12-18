import React, { useState } from 'react';
import { Camera, Mail, Phone, Save, Plus, Trash2, Car, Cat, X } from 'lucide-react';

export const ResidentProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    name: 'Alice Freeman',
    email: 'alice@example.com',
    phone: '(555) 123-4567',
    unit: '101-A'
  });

  const [vehicles, setVehicles] = useState([
    { id: 1, model: 'Honda Civic', color: 'Prata', plate: 'ABC-1234' },
    { id: 2, model: 'Toyota Corolla', color: 'Preto', plate: 'XYZ-9876' }
  ]);

  const [pets, setPets] = useState([
    { id: 1, name: 'Rex', type: 'Cachorro', breed: 'Golden Retriever' }
  ]);

  // Modal States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ model: '', color: '', plate: '' });
  const [newPet, setNewPet] = useState({ name: '', type: 'Cachorro', breed: '' });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    setVehicles([...vehicles, { id: Date.now(), ...newVehicle }]);
    setIsVehicleModalOpen(false);
    setNewVehicle({ model: '', color: '', plate: '' });
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Limit to 7 characters (standard length without hyphen)
    if (value.length > 7) {
      value = value.slice(0, 7);
    }
    
    // Add visual hyphen
    if (value.length > 3) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    }
    
    setNewVehicle({...newVehicle, plate: value});
  };

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    setPets([...pets, { id: Date.now(), ...newPet }]);
    setIsPetModalOpen(false);
    setNewPet({ name: '', type: 'Cachorro', breed: '' });
  };

  const removeVehicle = (id: number) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const removePet = (id: number) => {
    setPets(pets.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Meu Perfil</h2>
        <p className="text-sm text-slate-500 mt-1">Gerencie suas informações pessoais, veículos e animais de estimação.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Info Column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-3xl font-bold border-4 border-white shadow-md mx-auto">
                {profile.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition-colors shadow-sm">
                <Camera size={14} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
            <p className="text-slate-500 text-sm font-medium">Unidade {profile.unit}</p>
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full mt-3 font-bold uppercase">
              Proprietário
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Dados de Contato</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">E-mail</label>
                <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                  <Mail size={16} className="text-slate-400" />
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    className="bg-transparent outline-none text-sm text-slate-700 w-full"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Telefone</label>
                <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                  <Phone size={16} className="text-slate-400" />
                  <input 
                    type="tel" 
                    value={profile.phone} 
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    className="bg-transparent outline-none text-sm text-slate-700 w-full"
                  />
                </div>
              </div>
              <button className="w-full mt-2 bg-slate-900 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>

        {/* Assets Column (Vehicles & Pets) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Vehicles Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <Car size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Meus Veículos</h3>
                  <p className="text-xs text-slate-500">Cadastre para acesso automático.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsVehicleModalOpen(true)}
                className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>

            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:shadow-md transition-shadow group relative">
                    <div>
                      <h4 className="font-bold text-slate-800">{vehicle.model}</h4>
                      <p className="text-sm text-slate-500">{vehicle.color}</p>
                      <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded mt-2 inline-block border border-slate-200 text-slate-600">
                        {vehicle.plate}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => removeVehicle(vehicle.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500">Nenhum veículo cadastrado.</p>
              </div>
            )}
          </div>

          {/* Pets Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                  <Cat size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Meus Pets</h3>
                  <p className="text-xs text-slate-500">Mantenha o cadastro atualizado.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPetModalOpen(true)}
                className="text-sm font-medium text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>

            {pets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pets.map(pet => (
                  <div key={pet.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:shadow-md transition-shadow group">
                    <div>
                      <h4 className="font-bold text-slate-800">{pet.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          {pet.type}
                        </span>
                        <span className="text-xs text-slate-500">{pet.breed}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => removePet(pet.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500">Nenhum pet cadastrado.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Novo Veículo</h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Modelo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Honda Civic"
                  value={newVehicle.model}
                  onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cor</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Prata"
                  value={newVehicle.color}
                  onChange={e => setNewVehicle({...newVehicle, color: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Placa</label>
                <input 
                  type="text" 
                  required
                  placeholder="ABC-1234"
                  value={newVehicle.plate}
                  onChange={handlePlateChange}
                  maxLength={8}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">
                Adicionar Veículo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Pet Modal */}
      {isPetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Novo Pet</h3>
              <button onClick={() => setIsPetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddPet} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nome</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Rex"
                  value={newPet.name}
                  onChange={e => setNewPet({...newPet, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipo</label>
                <select 
                  value={newPet.type}
                  onChange={e => setNewPet({...newPet, type: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Cachorro">Cachorro</option>
                  <option value="Gato">Gato</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Raça</label>
                <input 
                  type="text" 
                  placeholder="Ex: Vira-lata"
                  value={newPet.breed}
                  onChange={e => setNewPet({...newPet, breed: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">
                Adicionar Pet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};