import React, { useEffect } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useCondominium } from '../../context/CondominiumContext';

interface TermsOfUseProps {
    onBack: () => void;
}

export const TermsOfUse: React.FC<TermsOfUseProps> = ({ onBack }) => {
    const { condominium } = useCondominium();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Termos de Uso</h1>
                        <p className="text-slate-500 mt-1">Última atualização: Dezembro 2025</p>
                    </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600">
                    <p className="lead">
                        Bem-vindo ao <strong>{condominium?.name || 'Maison Manager'}</strong>. Ao utilizar nossa plataforma, você concorda com os termos descritos abaixo para garantir uma convivência harmoniosa e segura.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">1. Aceitação dos Termos</h3>
                    <p>
                        Ao acessar e utilizar o sistema <strong>Maison Manager</strong>, você expressa sua concordância e consentimento com estes Termos de Uso e com nossa Política de Privacidade. Caso não concorde com qualquer disposição, recomendamos que não utilize a plataforma.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">2. Uso Responsável da Plataforma</h3>
                    <p>
                        O usuário compromete-se a utilizar a plataforma de forma ética e legal, abstendo-se de:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Compartilhar suas credenciais de acesso com terceiros.</li>
                        <li>Utilizar o sistema para fins fraudulentos ou ilegais.</li>
                        <li>Tentar violar a segurança do sistema ou acessar dados de outros usuários.</li>
                        <li>Publicar conteúdo ofensivo, discriminatório ou que viole direitos de terceiros nos murais e comunicados.</li>
                    </ul>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">3. Responsabilidades do Usuário</h3>
                    <p>
                        Você é integralmente responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta. Notifique a administração imediatamente sobre qualquer uso não autorizado.
                    </p>
                    <p>
                        As informações fornecidas no cadastro (como dados de veículos, animais e contatos) devem ser mantidas atualizadas para garantir a segurança e a comunicação eficiente do condomínio.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">4. Reservas e Áreas Comuns</h3>
                    <p>
                        Ao realizar reservas de áreas comuns (Churrasqueira, Salão de Festas, etc.), o usuário declara estar ciente das normas do Regimento Interno do condomínio, incluindo horários de silêncio, limites de convidados e taxas de limpeza, se aplicáveis.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">5. Propriedade Intelectual</h3>
                    <p>
                        Todo o conteúdo, layout, design e código fonte do sistema <strong>Maison Manager</strong> são de propriedade exclusiva ou licenciados, sendo vedada a cópia, reprodução ou engenharia reversa sem autorização expressa.
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">6. Alterações nos Termos</h3>
                    <p>
                        A administração reserva-se o direito de atualizar estes Termos de Uso periodicamente. Recomendamos a consulta regular deste documento. O uso continuado do sistema após alterações implica na aceitação dos novos termos.
                    </p>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-sm">
                            Dúvidas? Entre em contato com a administração do condomínio.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
