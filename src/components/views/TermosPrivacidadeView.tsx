import React from 'react';
import { Shield, Lock, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const TermosPrivacidadeView: React.FC = () => {
  const { setActiveTab } = useStudy();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <button
        onClick={() => setActiveTab('plano_hoje')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Planner</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-8 text-slate-700 text-sm leading-relaxed">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>TRANSPARÊNCIA E LGPD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Termos de Uso e Política de Privacidade
          </h1>
          <p className="text-xs text-slate-400 mt-1">Última atualização: 29 de Agosto de 2026</p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>1. Sobre o ROTA PETRO</span>
          </h2>
          <p>
            O <strong>ROTA PETRO</strong> é uma ferramenta independente de organização e planejamento pedagógico de estudos para o concurso da Transpetro 2026 (Técnico de Dutos e Terminais) e Petrobras. O aplicativo opera no modelo de <strong>acesso vitalício de pagamento único (R$ 49,90)</strong>, sem qualquer tipo de renovação ou cobrança recorrente oculta.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>2. Dados Coletados e Finalidade</span>
          </h2>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), coletamos estritamente os dados mínimos necessários para a prestação do serviço:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>Identificação:</strong> Nome de exibição e e-mail verificados fornecidos pela autenticação Google (Firebase Auth).</li>
            <li><strong>Progresso Pedagógico:</strong> Registro de tarefas concluídas, notas em simulados, histórico de revisões 1-7-15-30 e estatísticas de erros em questões.</li>
            <li><strong>Pagamentos:</strong> Identificador do pedido e confirmação de pagamento gerada pelo Mercado Pago. Nenhum dado de cartão de crédito é recebido ou armazenado pelo ROTA PETRO.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>3. Isolamento e Segurança de Dados</span>
          </h2>
          <p>
            Cada usuário possui partição estritamente isolada no Cloud Firestore por meio de identificador único (UID). Um usuário <strong>nunca</strong> tem acesso aos dados, anotações ou progresso de terceiros. Todas as transações e autorizações de acesso são validadas pelo servidor backend.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>4. Política de Reembolso e Cancelamento</span>
          </h2>
          <p>
            Garantimos o direito de arrependimento e reembolso integral em até <strong>7 (sete) dias corridos</strong> após a confirmação da compra, conforme o Código de Defesa do Consumidor. A solicitação pode ser efetuada diretamente pelo suporte ou através da plataforma do Mercado Pago.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">5. Seus Direitos e Exclusão de Conta</h2>
          <p>
            Você pode solicitar a qualquer momento a exportação completa do seu histórico ou a exclusão definitiva dos seus dados e conta entrando em contato pelo e-mail de suporte.
          </p>
        </section>
      </div>
    </div>
  );
};
