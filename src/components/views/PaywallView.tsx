import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  CreditCard, 
  RefreshCw, 
  Lock, 
  BookOpen, 
  Flame, 
  RotateCcw, 
  Award,
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';
import { refreshUserToken } from '../../lib/firebaseClient';

export const PaywallView: React.FC = () => {
  const { user, login, logout, refreshClaims, isAuthenticating } = useAuth();
  const { setActiveTab } = useStudy();
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      await login();
      return;
    }

    setIsInitiatingCheckout(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const idToken = await refreshUserToken();
      if (!idToken) throw new Error('Não foi possível obter o token de sessão.');

      const response = await fetch('/api/billing/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isConfigured === false) {
          setErrorMessage('O sistema de pagamento do Mercado Pago está sendo configurado pelo administrador. Se você é o dono da conta, cadastre o token MERCADOPAGO_ACCESS_TOKEN.');
        } else {
          setErrorMessage(data.error || 'Erro ao gerar checkout do Mercado Pago.');
        }
        return;
      }

      // Redirect to official Mercado Pago Checkout Pro
      const checkoutUrl = data.initPoint || data.sandboxInitPoint;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de checkout não retornada pelo servidor.');
      }
    } catch (err: any) {
      console.error('[Checkout Error]', err);
      setErrorMessage(err.message || 'Erro ao conectar ao Mercado Pago.');
    } finally {
      setIsInitiatingCheckout(false);
    }
  };

  const handleVerifyStatus = async () => {
    setIsCheckingPayment(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const idToken = await refreshUserToken();
      if (!idToken) throw new Error('Sessão expirada. Faça login novamente.');

      const response = await fetch('/api/billing/check-status', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (data.isEntitled) {
        await refreshClaims();
        setInfoMessage('Pagamento confirmado com sucesso! Seu acesso vitalício está liberado.');
        setTimeout(() => {
          setActiveTab('plano_hoje');
        }, 1200);
      } else {
        setInfoMessage(
          data.status === 'pending'
            ? 'Seu pagamento ainda está em processamento pelo Mercado Pago/Pix. Assim que for confirmado pelo banco, o acesso será liberado automaticamente.'
            : 'Nenhum pagamento aprovado foi localizado para este e-mail ainda. Se você já pagou via Pix, aguarde 1 minuto e verifique novamente.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao verificar situação.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden mb-8 border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>ACESSO VITALÍCIO — TRANSPETRO 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Desbloqueie o Motor Completo do <span className="text-emerald-400">ROTA PETRO</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
            O único ecossistema adaptativo desenhado exclusivamente para o concurso <strong>Transpetro — Dutos e Terminais</strong> (Fundação Cesgranrio), com 100% de cobertura do edital, método 4 cartões e ciclo de revisões 1-7-15-30.
          </p>

          <div className="flex flex-wrap items-baseline gap-3 mb-6 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xs w-fit">
            <span className="text-slate-400 text-sm font-medium">Investimento único:</span>
            <span className="text-4xl font-black text-white">R$ 49,90</span>
            <span className="text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20">Sem mensalidades</span>
          </div>
        </div>
      </div>

      {/* Error & Info Alerts */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {infoMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p>{infoMessage}</p>
        </div>
      )}

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">Cronograma Pós-Edital 100% Automatizado</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Distribuído rigorosamente de segunda a sábado em 210 minutos diários (30m Revisão + 100m Teoria Central + 60m Questões + 20m Fechamento).
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">Filtro de Pareto & Prova Cesgranrio</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Hierarquia matemática P1, P2 e P3 baseada na distribuição real das provas da Transpetro/Petrobras e reforço imediato de deficiências.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">Algoritmo Spaced Repetition 1–7–15–30</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Agendamento automático de repetições espaçadas e adaptação de prazos conforme seu percentual de acertos em cada matéria.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">6 Simulados Oficiais de 60 Questões</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Diagnóstico de 7 causas de erro (conceito, fórmula, unidade, cálculo, pegadinha) e rebalanceamento automático da sua rota.
          </p>
        </div>
      </div>

      {/* Action Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center shadow-xs mb-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pagamento 100% Seguro via Mercado Pago</span>
          </div>

          <p className="text-slate-600 text-sm mb-6">
            Pague via <strong>Pix</strong> (liberação imediata), Cartão de Crédito em até 12x ou Boleto Bancário.
          </p>

          <button
            id="paywall-checkout-button"
            onClick={handleCheckout}
            disabled={isInitiatingCheckout || isAuthenticating}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {isInitiatingCheckout ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Gerando Checkout Seguro...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Comprar Acesso Vitalício por R$ 49,90</span>
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={handleVerifyStatus}
              disabled={isCheckingPayment}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPayment ? 'animate-spin' : ''}`} />
              <span>Já paguei — verificar situação</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-4">
            <span>🛡️ Garantia incondicional de 7 dias</span>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('termos_privacidade')}
              className="underline hover:text-slate-800"
            >
              Termos e Privacidade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
