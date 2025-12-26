import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, FinancialSummary } from '../services/financialService';

interface ReportContext {
    user: any;
    condominium: any;
    month: string;
    year: string;
}

export const addPDFHeader = (doc: jsPDF, title: string, context: ReportContext) => {
    const { user, condominium, month, year } = context;
    const condoName = condominium?.name || 'Maison Manager';
    const address = condominium?.address || '';

    // Find month label
    const months = [
        { val: '1', label: 'Janeiro' }, { val: '2', label: 'Fevereiro' }, { val: '3', label: 'Março' },
        { val: '4', label: 'Abril' }, { val: '5', label: 'Maio' }, { val: '6', label: 'Junho' },
        { val: '7', label: 'Julho' }, { val: '8', label: 'Agosto' }, { val: '9', label: 'Setembro' },
        { val: '10', label: 'Outubro' }, { val: '11', label: 'Novembro' }, { val: '12', label: 'Dezembro' }
    ];
    const monthLabel = months.find(m => m.val === month)?.label;

    // Brand Banner
    doc.setFillColor(67, 116, 118); // #437476
    doc.rect(0, 0, 210, 40, 'F');

    // Condo Info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(condoName, 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(address || 'Sistema de Gestão Condominial', 14, 28);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 34);

    // Report Title
    doc.setTextColor(50);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${title} - ${monthLabel}/${year}`, 14, 55);

    // User Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Solicitado por: ${user?.name || 'Administrador'}`, 14, 62);

    // Footer function
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Maison Manager - ${condoName} | Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }
};

export const generateFinancialPDF = (
    transactions: Transaction[],
    summary: FinancialSummary,
    context: ReportContext
) => {
    const doc = new jsPDF();
    addPDFHeader(doc, 'Relatório Financeiro', context);

    // Summary Box
    const startY = 70;
    doc.setDrawColor(200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, startY, 182, 25, 3, 3, 'FD');

    const incomeFmt = summary.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const expenseFmt = summary.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const balanceFmt = summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    doc.setFontSize(10); doc.setTextColor(80);
    doc.text('Receitas', 30, startY + 8);
    doc.text('Despesas', 90, startY + 8);
    doc.text('Saldo', 150, startY + 8);

    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); doc.text(incomeFmt, 30, startY + 18);
    doc.setTextColor(239, 68, 68); doc.text(expenseFmt, 90, startY + 18);
    doc.setTextColor(67, 116, 118); doc.text(balanceFmt, 150, startY + 18);

    // Table
    const headers = [['Data', 'Descrição', 'Categoria', 'Valor', 'Status']];
    const data = transactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        t.description,
        t.category,
        (t.type === 'income' ? '+ ' : '- ') + Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        t.status === 'paid' ? 'Pago' : 'Pendente'
    ]);

    autoTable(doc, {
        head: headers,
        body: data,
        startY: startY + 35,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [67, 116, 118] }
    });

    doc.save(`financeiro-${context.month}-${context.year}.pdf`);
};
