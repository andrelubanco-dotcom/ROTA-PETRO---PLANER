import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { PriorityBadge } from '../common/Badge';
import { 
  AlertTriangle, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  HeartHandshake,
  Target,
  Layers,
  CalendarCheck
} from 'lucide-react';
import { HARD_DEADLINE_DATE, HARD_DEADLINE_LABEL } from '../../utils/scheduleGenerator';

export const RecuperarAtrasosView: React.FC = () => {
  const { 
    tasks,
    overdueTasks, 
    overdueRevisions, 
    rescheduleOverdueTasks, 
    completeTask, 
    completeRevision, 
    settings,
    setActiveTab 
  } = useStudy();

  const [rescheduleStrategy, setRescheduleStrategy] = useState<'diluir' | 'empurrar' | 'priorizar_critico' | 'reorganizacao_completa'>('diluir');
  const [successInfo, setSuccessInfo] = useState<{ count: number; message: string } | null>(null);

  const totalOverdue = overdueTasks.length + overdueRevisions.length;
  const totalPending = tasks.filter(t => t.status !== 'concluido').length;

  const handleReschedule = () => {
    const result = rescheduleOverdueTasks(rescheduleStrategy);
    const updatedCount = result?.rebalancedCount ?? (totalOverdue || totalPending);
    
    setSuccessInfo({
      count: updatedCount,
      message: `Cronograma reorganizado com sucesso! ${updatedCount} tarefas foram realocadas no calendário respeitando rigorosamente o limite final de 28/11/2026.`
    });
    
    setTimeout(() => {
      // Keep notification active
    }, 10000);
  };

  return (
    <div id="view-recuperar-atrasos" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-[#4A151E] to-[#123B5D] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider border border-rose-500/30">
              Protocolo Anti-Ansiedade TDAH
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Data Limite: 28/11/2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Recuperação Inteligente de Atrasos
          </h1>
          <p className="text-slate-200 text-sm max-w-2xl leading-relaxed">
            Atrasos acontecem e fazem parte da preparação pós-edital. O algoritmo reequilibra automaticamente todas as tarefas 
            ao longo dos meses de agosto a novembro, garantindo que todo o conteúdo seja concluído impreterivelmente até <strong className="text-amber-300">28/11/2026</strong>.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[200px] text-right">
          <span className="text-xs text-slate-300 block">Itens com Atraso Detectado</span>
          <div className="text-3xl font-black font-mono text-rose-300 mt-0.5">
            {totalOverdue}
          </div>
          <span className="text-[11px] text-rose-200 block">
            {overdueRevisions.length} revisões • {overdueTasks.length} tarefas
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successInfo && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-emerald-900 text-sm">Cronograma Atualizado e Sincronizado</h3>
              <p className="text-xs text-emerald-800 mt-0.5">{successInfo.message}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('cronograma')}
            className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Ver no Cronograma Mensal</span>
          </button>
        </div>
      )}

      {/* Reorganization Engine Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                Escolha a Estratégia de Reorganização
              </h2>
              <p className="text-xs text-slate-500">
                O motor de cálculo realocará tarefas no intervalo de 29/08/2026 a 28/11/2026 sem sobrecarregar sua rotina diária ({settings.dailyStudyHoursAvailable}h/dia).
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-xl self-start sm:self-auto border border-amber-200">
            Fixado: 28/11/2026
          </span>
        </div>

        {/* 4 Strategy Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Strategy 1: Diluir */}
          <label
            onClick={() => setRescheduleStrategy('diluir')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              rescheduleStrategy === 'diluir'
                ? 'bg-rose-50/60 border-rose-500 shadow-xs ring-2 ring-rose-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">1. Diluir Suavemente</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  TDAH Friendly
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Distribui 1 a 2 blocos por dia nos próximos 7 a 14 dias úteis, mantendo a carga diária suave.
              </p>
            </div>
            <div className="text-[11px] font-bold text-rose-700">
              Impacto diário: +25 a 35 min
            </div>
          </label>

          {/* Strategy 2: Priorizar Crítico */}
          <label
            onClick={() => setRescheduleStrategy('priorizar_critico')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              rescheduleStrategy === 'priorizar_critico'
                ? 'bg-rose-50/60 border-rose-500 shadow-xs ring-2 ring-rose-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">2. Priorizar Crítico</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Estratégico
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Puxa para os primeiros dias os temas de peso crítico Cesgranrio (Dutos, Fluidos, Materiais).
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-700">
              Foco nos maiores acertos
            </div>
          </label>

          {/* Strategy 3: Empurrar em Bloco */}
          <label
            onClick={() => setRescheduleStrategy('empurrar')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              rescheduleStrategy === 'empurrar'
                ? 'bg-rose-50/60 border-rose-500 shadow-xs ring-2 ring-rose-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">3. Empurrar em Bloco</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                  Sequencial
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Desloca a sequência em 1 a 3 dias, comprimindo o cronograma respeitando a trava final de 28/11/2026.
              </p>
            </div>
            <div className="text-[11px] font-bold text-slate-700">
              Deslocamento linear
            </div>
          </label>

          {/* Strategy 4: Reorganização Completa Pós-Edital */}
          <label
            onClick={() => setRescheduleStrategy('reorganizacao_completa')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              rescheduleStrategy === 'reorganizacao_completa'
                ? 'bg-rose-50/60 border-rose-500 shadow-xs ring-2 ring-rose-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">4. Reorganizar Tudo</span>
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                  Geral
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Redistribui uniformemente todas as tarefas pendentes pelos dias restantes até o dia da prova (28/11/2026).
              </p>
            </div>
            <div className="text-[11px] font-bold text-sky-700">
              Otimização de 92 dias
            </div>
          </label>

        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Nenhum dado é perdido. As tarefas são reajustadas no cronograma sem ultrapassar 28/11/2026.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleReschedule}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              RECALCULAR E ATUALIZAR CRONOGRAMA AGORA
            </button>
          </div>
        </div>

      </div>

      {/* Overdue Items List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Overdue Tasks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              Tarefas Teóricas & Questões ({overdueTasks.length})
            </h3>
          </div>

          {overdueTasks.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-700">Nenhuma tarefa atrasada no momento!</p>
              <p className="text-[11px] text-slate-400 mt-1">Seu cronograma está perfeitamente alinhado.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {overdueTasks.map(t => (
                <div key={t.id} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-rose-700 font-bold">Vencida em {t.date.split('-').reverse().join('/')}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{t.title}</h4>
                  <p className="text-slate-500 text-[11px]">{t.subjectName} • {t.suggestedDurationMinutes}m</p>

                  <div className="pt-2 border-t border-rose-100 flex items-center justify-end">
                    <button
                      onClick={() => completeTask(t.id)}
                      className="px-3 py-1 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-[11px]"
                    >
                      Concluir agora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Revisions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              Ciclos Espaçados Vencidos ({overdueRevisions.length})
            </h3>
          </div>

          {overdueRevisions.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-700">Nenhuma revisão atrasada!</p>
              <p className="text-[11px] text-slate-400 mt-1">Todas as revisões D+1, D+7, D+21 estão em dia.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {overdueRevisions.map(r => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-purple-700 font-bold">Vencida em {r.dueDate.split('-').reverse().join('/')}</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-mono text-[10px] font-bold">{r.revisionStage}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{r.topicName}</h4>
                  <p className="text-slate-500 text-[11px]">{r.subjectName} • {r.suggestedQuestions} questões recomendadas</p>

                  <div className="pt-2 border-t border-purple-100 flex items-center justify-end">
                    <button
                      onClick={() => completeRevision(r.id)}
                      className="px-3 py-1 rounded-lg bg-white border border-purple-300 hover:bg-purple-50 text-purple-700 font-bold text-[11px]"
                    >
                      Concluir e avançar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
