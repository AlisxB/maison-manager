import React from 'react';
import { FileText, Download } from 'lucide-react';

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#437476]">Relatórios</h2>
      <div className="p-12 text-center text-slate-500 bg-white rounded-lg border border-slate-200 shadow-sm">
        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-700">Central de Relatórios</h3>
        <p className="mb-6">Selecione um tipo de relatório para gerar.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {['Financeiro Mensal', 'Inadimplência', 'Ocorrências', 'Consumo de Água', 'Reservas', 'Manutenção'].map((report, i) => (
                <button key={i} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 text-slate-600 transition-colors">
                    <Download size={16} /> {report}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};