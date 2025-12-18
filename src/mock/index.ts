
import { Resident, RegistrationRequest, Transaction, Issue, FinancialRecord, Reservation, Announcement, BlockedDate, Infraction, InventoryItem, SystemLog } from '../types';

export const MOCK_RESIDENTS: Resident[] = [
  { id: '1', name: 'Alice Freeman', unit: '101-A', email: 'alice@example.com', phone: '(555) 123-4567', status: 'Ativo', type: 'Proprietário', startDate: '10/01/2022', balance: 0 },
  { id: '2', name: 'Bob Smith', unit: '102-B', email: 'bob@example.com', phone: '(555) 234-5678', status: 'Ativo', type: 'Inquilino', startDate: '05/03/2023', balance: 150 },
  { id: '3', name: 'Charlie Davis', unit: '201-A', email: 'charlie@example.com', phone: '(555) 345-6789', status: 'Pendente', type: 'Proprietário', startDate: '20/12/2024', balance: 0 },
  { id: '4', name: 'Diana Prince', unit: 'Cobertura', email: 'diana@example.com', phone: '(555) 999-9999', status: 'Ativo', type: 'Proprietário', startDate: '01/06/2021', balance: -50 },
  { id: '5', name: 'Evan Wright', unit: '304-B', email: 'evan@example.com', phone: '(555) 111-2222', status: 'Inativo', type: 'Inquilino', startDate: '15/08/2022', balance: 0 },
];

export const MOCK_REQUESTS: RegistrationRequest[] = [
  { 
    id: 'req1', 
    name: 'Lucas Mendes', 
    email: 'lucas.m@email.com', 
    unit: '405-C', 
    date: 'Há 2 horas', 
    status: 'Pendente', 
    type: 'Inquilino',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    moveInDate: '2025-12-28',
    observations: 'Possuo um cachorro de pequeno porte. Contrato de aluguel anexado.'
  },
  { 
    id: 'req2', 
    name: 'Fernanda Lima', 
    email: 'fer.lima@email.com', 
    unit: '102-A', 
    date: 'Há 5 horas', 
    status: 'Pendente', 
    type: 'Proprietário',
    phone: '(21) 99999-8888',
    cpf: '987.654.321-11',
    moveInDate: '2026-01-05',
    observations: 'Compra recente, aguardando chaves.'
  },
  { 
    id: 'req3', 
    name: 'Roberto Carlos', 
    email: 'rc.king@email.com', 
    unit: 'Cobertura B', 
    date: 'Ontem', 
    status: 'Pendente', 
    type: 'Proprietário',
    phone: '(11) 97777-6666',
    cpf: '555.444.333-22',
    moveInDate: '2025-12-20',
    observations: ''
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', description: 'Taxa Condominial - Unidade 101', type: 'income', category: 'Condomínio', date: '2025-12-05', amount: 1250.00, status: 'paid', observation: 'Pagamento via PIX' },
  { id: 't2', description: 'Taxa Condominial - Unidade 102', type: 'income', category: 'Condomínio', date: '2025-12-05', amount: 1250.00, status: 'paid' },
  { id: 't3', description: 'Manutenção Elevador', type: 'expense', category: 'Manutenção', date: '2025-12-10', amount: 450.00, status: 'paid', observation: 'NF 4502' },
  { id: 't4', description: 'Jardinagem Mensal', type: 'expense', category: 'Serviços', date: '2025-12-12', amount: 800.00, status: 'pending' },
  { id: 't5', description: 'Aluguel Salão de Festas', type: 'income', category: 'Reservas', date: '2025-12-15', amount: 300.00, status: 'paid' },
  { id: 't6', description: 'Conta de Energia (Área Comum)', type: 'expense', category: 'Utilidades', date: '2025-12-20', amount: 1120.50, status: 'pending' },
];

export const MOCK_ISSUES: Issue[] = [
  { 
    id: '101', 
    title: 'Vazamento na Garagem G1', 
    category: 'Maintenance', 
    status: 'Open', 
    date: '2023-10-25', 
    reportedBy: 'Alice Freeman', 
    unit: '101-A',
    description: 'Notei uma poça d’água perto da vaga 45 no subsolo G1. Parece estar pingando da tubulação vermelha.'
  },
  { 
    id: '102', 
    title: 'Ar condicionado da Academia', 
    category: 'Maintenance', 
    status: 'In Progress', 
    date: '2023-10-24', 
    reportedBy: 'Bob Smith', 
    unit: '102-B',
    description: 'O equipamento de ar condicionado da academia não está gelando, apenas ventilando. O ambiente está muito quente.',
    adminResponse: 'Técnico agendado para visita no dia 26/10.'
  },
  { 
    id: '103', 
    title: 'Barulho excessivo Unidade 505', 
    category: 'Noise', 
    status: 'Resolved', 
    date: '2023-10-20', 
    reportedBy: 'Diana Prince', 
    unit: 'Penthouse',
    description: 'Som alto e arrastar de móveis após as 23h na unidade 505.',
    adminResponse: 'Notificação enviada e morador orientado.'
  },
  { 
    id: '104', 
    title: 'Portão da garagem travando', 
    category: 'Security', 
    status: 'Open', 
    date: '2023-10-26', 
    reportedBy: 'Portaria', 
    unit: 'N/A',
    description: 'O motor do portão principal está fazendo um barulho estranho e travando na abertura.'
  },
];

export const MOCK_FINANCIALS: FinancialRecord[] = [
  { month: 'May', revenue: 45000, expenses: 32000 },
  { month: 'Jun', revenue: 46000, expenses: 35000 },
  { month: 'Jul', revenue: 44500, expenses: 28000 },
  { month: 'Aug', revenue: 48000, expenses: 42000 },
  { month: 'Sep', revenue: 47000, expenses: 31000 },
  { month: 'Oct', revenue: 49000, expenses: 30000 },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'r1', area: 'Deck com Churrasqueira', date: '2025-12-20', time: '18:00 - 22:00', status: 'Confirmed', residentName: 'Alice Freeman', unit: '101-A' },
  { id: 'r2', area: 'Salão de Festas', date: '2025-12-28', time: '12:00 - 18:00', status: 'Pending', residentName: 'Bob Smith', unit: '102-B' },
  { id: 'r3', area: 'Quadra de Tênis', date: '2025-12-10', time: '08:00 - 10:00', status: 'Rejected', residentName: 'Charlie Davis', unit: '201-A' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Manutenção na Piscina', description: 'A piscina ficará interditada para limpeza e manutenção de filtros nesta terça-feira, das 08h às 14h.', type: 'Manutenção', date: '2025-12-15', sentViaWhatsapp: true, targetAudience: 'Todos os moradores' },
  { id: '2', title: 'Festa de Fim de Ano', description: 'Convidamos todos os moradores para a confraternização no salão de festas no dia 20/12.', type: 'Evento', date: '2025-12-10', sentViaWhatsapp: false, targetAudience: 'Todos os moradores' },
  { id: '3', title: 'Mudança nas regras de lixo', description: 'A coleta seletiva agora passa às quartas-feiras pela manhã. Por favor, organizar o descarte.', type: 'Aviso', date: '2025-12-05', sentViaWhatsapp: true, targetAudience: 'Todos os moradores' },
];

export const MOCK_BLOCKED_DATES: BlockedDate[] = [];

export const MOCK_UTILITY_DATA = [
  { name: 'Jan', water: 180, gas: 80, energy: 5500 },
  { name: 'Fev', water: 300, gas: 200, energy: 5300 },
  { name: 'Mar', water: 240, gas: 120, energy: 5100 },
  { name: 'Abr', water: 170, gas: 190, energy: 4900 },
  { name: 'Mai', water: 210, gas: 130, energy: 5200 },
  { name: 'Jun', water: 220, gas: 140, energy: 5350 },
];

export const REGIMENT_ARTICLES = [
  "Art. 12 - Barulho excessivo após as 22h",
  "Art. 15 - Uso indevido da vaga de garagem",
  "Art. 22 - Alteração de fachada sem autorização",
  "Art. 45 - Descarte incorreto de lixo",
  "Art. 50 - Danos ao patrimônio comum",
];

export const MOCK_INFRACTIONS: Infraction[] = [
  {
    id: 'inf1',
    residentId: '1',
    residentName: 'Alice Freeman',
    type: 'notification',
    date: '2025-11-10',
    time: '22:30',
    reason: 'Barulho excessivo relatado por vizinhos após o horário de silêncio.',
    status: 'Sent',
    article: 'Art. 12 - Barulho excessivo após as 22h'
  },
  {
    id: 'inf2',
    residentId: '1',
    residentName: 'Alice Freeman',
    type: 'fine',
    date: '2025-12-02',
    time: '09:15',
    reason: 'Estacionamento em vaga de visitante por mais de 24 horas sem autorização.',
    value: 150.00,
    status: 'Sent',
    article: 'Art. 15 - Uso indevido da vaga de garagem'
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Detergente', category: 'Limpeza', quantity: 10, minLevel: 1, status: 'In Stock', lastUpdated: '2025-12-10' },
  { id: '2', name: 'Lâmpada LED 9W', category: 'Elétrica', quantity: 5, minLevel: 5, status: 'Low Stock', lastUpdated: '2025-12-12' },
  { id: '3', name: 'Papel Toalha (Fardo)', category: 'Higiene', quantity: 0, minLevel: 2, status: 'Out of Stock', lastUpdated: '2025-12-15' },
  { id: '4', name: 'Cloro Piscina (Balde)', category: 'Piscina', quantity: 3, minLevel: 1, status: 'In Stock', lastUpdated: '2025-12-05' },
];

export const MOCK_SYSTEM_LOGS: SystemLog[] = [
  { id: 'l1', adminName: 'João Silva', action: 'UPDATE', module: 'Financeiro', description: 'Alterou status da fatura T6 para Pago.', timestamp: '17/12/2025 10:15', ip: '192.168.1.45' },
  { id: 'l2', adminName: 'Maria Souza', action: 'CREATE', module: 'Avisos', description: 'Publicou novo aviso: Manutenção na Piscina.', timestamp: '17/12/2025 09:30', ip: '187.12.44.102' },
  { id: 'l3', adminName: 'Admin User', action: 'LOGIN', module: 'Segurança', description: 'Login realizado com sucesso.', timestamp: '17/12/2025 08:12', ip: '201.55.12.8' },
  { id: 'l4', adminName: 'Ricardo Santos', action: 'DELETE', module: 'Moradores', description: 'Excluiu cadastro temporário da unidade 404.', timestamp: '16/12/2025 17:40', ip: '177.32.11.55' },
  { id: 'l5', adminName: 'Maria Souza', action: 'UPDATE', module: 'Reservas', description: 'Aprovou reserva do Salão de Festas para Alice Freeman.', timestamp: '16/12/2025 14:22', ip: '187.12.44.102' },
];
