import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Voltar
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Política de Privacidade</h1>
                        <p className="text-slate-500 mt-1">Última atualização: 25 de Dezembro de 2025</p>
                    </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600">
                    <p className="lead">
                        A sua privacidade é importante para nós. É política do Maison Manager respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Maison Manager, e outros sites que possuímos e operamos.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">1. Informações que coletamos</h3>
                    <p>
                        Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
                    </p>
                    <p>
                        Retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">2. Compartilhamento de Dados</h3>
                    <p>
                        Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei ou para a administração do seu condomínio (ex: empresa de portaria remota).
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">3. Cookies</h3>
                    <p>
                        Utilizamos apenas cookies essenciais para autenticação e segurança do sistema (HttpOnly Cookies). Não utilizamos cookies de rastreamento de terceiros para fins publicitários.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">4. Seus Direitos (LGPD)</h3>
                    <p>
                        Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados. Seus direitos incluem acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">5. Contato</h3>
                    <p>
                        Para exercer seus direitos de titular de dados, entre em contato com a administração do seu condomínio através da seção "Fale Conosco" ou diretamente na administração.
                    </p>
                </div>
            </div>
        </div>
    );
};
