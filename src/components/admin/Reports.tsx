import React, { useState } from 'react';
import { FileText, Download, AlertTriangle, Droplet, Calendar, DollarSign, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';
import { useCondominium } from '../../context/CondominiumContext';
import { FinancialService } from '../../services/financialService';
import { OccurrenceService } from '../../services/occurrenceService';
import { ReadingService } from '../../services/readingService';
import { ReservationService } from '../../services/reservationService';
import { UnitService, UserService } from '../../services/userService';
import { addPDFHeader, generateFinancialPDF } from '../../utils/pdfGenerator';

export const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const { condominium } = useCondominium();

  const currentMonthIdx = new Date().getMonth() + 1;
  const currentYearVal = new Date().getFullYear();

  const [filters, setFilters] = useState({
    month: String(currentMonthIdx),
    year: String(currentYearVal)
  });

  const [loading, setLoading] = useState(false);

  const months = [
    { val: '1', label: 'Janeiro' }, { val: '2', label: 'Fevereiro' }, { val: '3', label: 'Março' },
    { val: '4', label: 'Abril' }, { val: '5', label: 'Maio' }, { val: '6', label: 'Junho' },
    { val: '7', label: 'Julho' }, { val: '8', label: 'Agosto' }, { val: '9', label: 'Setembro' },
    { val: '10', label: 'Outubro' }, { val: '11', label: 'Novembro' }, { val: '12', label: 'Dezembro' }
  ];

  const years = ['2023', '2024', '2025', '2026'];
  const currentMonthLabel = months.find(m => m.val === filters.month)?.label;

  // --- Generators ---

  const generateFinancialReport = async () => {
    try {
      setLoading(true);
      const [txData, summaryData] = await Promise.all([
        FinancialService.getAll({ month: filters.month, year: filters.year }),
        FinancialService.getSummary(Number(filters.month), Number(filters.year))
      ]);

      generateFinancialPDF(txData, summaryData, {
        user,
        condominium,
        month: filters.month,
        year: filters.year
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar relatório financeiro.');
    } finally {
      setLoading(false);
    }
  };

  const generateOccurrenceReport = async () => {
    try {
      setLoading(true);
      const occurrences = await OccurrenceService.getAll();

      // Filter by selected month/year locally (since getAll returns all)
      const filtered = occurrences.filter(occ => {
        const d = new Date(occ.created_at);
        return d.getMonth() + 1 === Number(filters.month) && d.getFullYear() === Number(filters.year);
      });

      const doc = new jsPDF();
      addPDFHeader(doc, 'Relatório de Ocorrências', { user, condominium, month: filters.month, year: filters.year });

      if (filtered.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text('Nenhuma ocorrência registrada neste período.', 14, 80);
      } else {
        const headers = [['Data', 'Título', 'Categoria', 'Status', 'Morador']];
        const data = filtered.map(t => [
          new Date(t.created_at).toLocaleDateString('pt-BR'),
          t.title,
          t.category,
          t.status,
          t.is_anonymous ? 'Anônimo' : (t.user?.name || 'Não identificado')
        ]);

        autoTable(doc, {
          head: headers,
          body: data,
          startY: 70,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [67, 116, 118] } // Brand Green
        });
      }

      doc.save(`ocorrencias-${filters.month}-${filters.year}.pdf`);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const generateWaterReport = async () => {
    try {
      setLoading(true);
      const [readings, units] = await Promise.all([
        ReadingService.getAllWater(),
        UnitService.getAll()
      ]);

      // Create Unit Map
      const unitMap: Record<string, string> = {};
      units.forEach(u => {
        unitMap[u.id] = `Unidade ${u.number}${u.block ? ` - Bloco ${u.block}` : ''}`;
      });

      // Filter
      const filtered = readings.filter(r => {
        // Determine date field (reading_date or created_at)
        const d = new Date(r.reading_date || r.created_at);
        return d.getMonth() + 1 === Number(filters.month) && d.getFullYear() === Number(filters.year);
      });

      const doc = new jsPDF();
      addPDFHeader(doc, 'Relatório de Consumo de Água', { user, condominium, month: filters.month, year: filters.year });

      if (filtered.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text('Nenhuma leitura registrada neste período.', 14, 80);
      } else {
        const headers = [['Data Leitura', 'Unidade', 'Consumo (m³)']];
        const data = filtered.map(t => [
          new Date(t.reading_date || t.created_at).toLocaleDateString('pt-BR'),
          unitMap[t.unit_id] || 'Unidade Desconhecida',
          t.value_m3.toFixed(3) + ' m³'
        ]);

        autoTable(doc, {
          head: headers,
          body: data,
          startY: 70,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [67, 116, 118] } // Brand Green
        });
      }

      doc.save(`agua-${filters.month}-${filters.year}.pdf`);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const generateReservationReport = async () => {
    try {
      setLoading(true);
      const [reservations, users] = await Promise.all([
        ReservationService.getAll(),
        UserService.getAll()
      ]);

      // Create User Map
      const userMap: Record<string, string> = {};
      users.forEach(u => {
        userMap[u.id] = u.name;
      });

      // Filter
      const filtered = reservations.filter(r => {
        const d = new Date(r.start_time);
        return d.getMonth() + 1 === Number(filters.month) && d.getFullYear() === Number(filters.year);
      });

      const doc = new jsPDF();
      addPDFHeader(doc, 'Relatório de Reservas', { user, condominium, month: filters.month, year: filters.year });

      if (filtered.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text('Nenhuma reserva registrada neste período.', 14, 80);
      } else {
        const headers = [['Data', 'Área Comum', 'Solicitante', 'Horário', 'Status']];
        const data = filtered.map(t => [
          new Date(t.start_time).toLocaleDateString('pt-BR'),
          t.common_area?.name || 'Área Comum',
          userMap[t.user_id] || 'Desconhecido',
          `${new Date(t.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(t.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          t.status
        ]);

        autoTable(doc, {
          head: headers,
          body: data,
          startY: 70,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [67, 116, 118] } // Brand Green
        });
      }

      doc.save(`reservas-${filters.month}-${filters.year}.pdf`);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      title: 'Financeiro Mensal',
      desc: 'Receitas, despesas, balanço e fluxo de caixa detalhado.',
      icon: <DollarSign size={24} className="text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-100',
      action: generateFinancialReport
    },
    {
      title: 'Ocorrências',
      desc: 'Registro de reclamações, sugestões e incidentes.',
      icon: <AlertTriangle size={24} className="text-amber-500" />,
      color: 'bg-amber-50 border-amber-100',
      action: generateOccurrenceReport
    },
    {
      title: 'Consumo de Água',
      desc: 'Leituras e histórico de consumo hídrico das unidades.',
      icon: <Droplet size={24} className="text-blue-500" />,
      color: 'bg-blue-50 border-blue-100',
      action: generateWaterReport
    },
    {
      title: 'Reservas',
      desc: 'Uso de áreas comuns, salão de festas e churrasqueira.',
      icon: <Calendar size={24} className="text-purple-500" />,
      color: 'bg-purple-50 border-purple-100',
      action: generateReservationReport
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#437476]">Central de Relatórios</h2>
          <p className="text-sm text-slate-500 mt-1">Gere e exporte relatórios detalhados do condomínio.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative min-w-[140px]">
            <label className="absolute -top-2 left-3 px-1 bg-[#fcfbf9] text-[9px] font-black text-slate-400 uppercase tracking-tighter">Mês</label>
            <select
              className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#437476] appearance-none"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            >
              {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative min-w-[100px]">
            <label className="absolute -top-2 left-3 px-1 bg-[#fcfbf9] text-[9px] font-black text-slate-400 uppercase tracking-tighter">Ano</label>
            <select
              className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#437476] appearance-none"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${report.color} hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                {report.icon}
              </div>
              <button
                onClick={report.action}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Download size={14} />
                {loading ? 'Gerando...' : 'PDF'}
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{report.title}</h3>
            <p className="text-sm text-slate-500 font-medium">{report.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-200 text-center">
        <FileText size={48} className="mx-auto text-slate-200 mb-4" />
        <p className="text-sm text-slate-400 font-medium max-w-md mx-auto">
          Outros relatórios como Manutenção, Portaria e Visitantes estarão disponíveis em breve.
        </p>
      </div>
    </div>
  );
};