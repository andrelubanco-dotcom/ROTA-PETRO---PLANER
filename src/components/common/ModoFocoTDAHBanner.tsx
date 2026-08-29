import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { PriorityBadge } from './Badge';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  Clock 
} from 'lucide-react';

export const ModoFocoTDAHBanner: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    todayTasks, 
    overdueRevisions, 
    todayRevisions,
    completeTask, 
    openFocusMode,
    setActiveTab 
  } = useStudy();

  if (!settings.tdahSimplifiedMode) return null;

  const pendingTasks = todayTasks.filter(t => t.status === 'pendente');
  const currentTask = pendingTasks[0];
  const nextTask = pendingTasks[1];
  const urgentRevision = overdueRevisions[0] || todayRevisions[0];

  const total = todayTasks.length;
  const done = todayTasks.filter(t => t.status === 'concluido').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section 
      id="tdah-foco-absoluto-section"
      className="mb-8 p-5 sm:p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-3xl border-2 border-amber-400 shadow-sm transition-all"
    >
      <div className="flex items-center justify-between pb-4 border-b border-amber-200/80 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-amber-950 uppercase tracking-tight">
                MODO FOCO TDAH — FAÇA SÓ ISSO AGORA
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold">
                Anti-Sobrecarga
              </span>
            </div>
            <p className="text-xs text-amber-900/80">
              Esqueça o resto do edital por um momento. Concentre-se apenas na tarefa atual.
            </p>
          </div>
        </div>

        <button
          onClick={() => updateSettings({ tdahSimplifiedMode: false })}
          className="text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-xl transition-colors"
        >
          Ver Visão Completa ✕
        </button>
      </div>

      {/* Progress Bar for the day */}
      <div className="mb-6 bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
          <span>Progresso do Dia</span>
          <span className="text-amber-700 font-mono">{done} de {total} tarefas concluídas ({pct}%)</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
      </div>

      {/* 3 Focused Columns / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. CURRENT TASK */}
        <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 shadow-xs relative flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-extrabold uppercase tracking-wide">
                1. TAREFA ATUAL (FOCO)
              </span>
              {currentTask && <PriorityBadge priority={currentTask.priority} />}
            </div>

            {currentTask ? (
              <>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                  {currentTask.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  {currentTask.subjectName} • {currentTask.suggestedDurationMinutes} min
                </p>
              </>
            ) : (
              <div className="py-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-slate-800">Tudo concluído por hoje!</p>
                <p className="text-xs text-slate-500">Descanse seu cérebro, você venceu o dia.</p>
              </div>
            )}
          </div>

          {currentTask && (
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => openFocusMode(currentTask)}
                className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                FOCAR CRONÔMETRO
              </button>
              <button
                onClick={() => completeTask(currentTask.id)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 transition-colors"
                title="Concluir direto"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 2. NEXT TASK */}
        <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wide">
                2. PRÓXIMA NA FILA
              </span>
              {nextTask && <PriorityBadge priority={nextTask.priority} />}
            </div>

            {nextTask ? (
              <>
                <h3 className="font-bold text-slate-800 text-sm leading-snug">
                  {nextTask.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {nextTask.subjectName} • {nextTask.suggestedDurationMinutes} min
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400 italic py-3">
                Nenhuma tarefa seguinte programada para hoje.
              </p>
            )}
          </div>

          {nextTask && (
            <div className="pt-3 mt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Aguardando conclusão da atual
              </span>
            </div>
          )}
        </div>

        {/* 3. URGENT REVISION */}
        <div className="p-4 bg-white/90 rounded-2xl border border-purple-200 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[11px] font-bold uppercase tracking-wide flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                3. REVISÃO URGENTE
              </span>
              {urgentRevision && (
                <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-mono text-[10px] font-bold">
                  {urgentRevision.revisionStage}
                </span>
              )}
            </div>

            {urgentRevision ? (
              <>
                <h3 className="font-bold text-slate-800 text-sm leading-snug">
                  {urgentRevision.topicName}
                </h3>
                <p className="text-xs text-purple-700 font-medium">
                  {urgentRevision.subjectName} • {urgentRevision.suggestedQuestions} questões recomendadas
                </p>
              </>
            ) : (
              <p className="text-xs text-emerald-600 font-medium py-3 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Todas as revisões em dia!
              </p>
            )}
          </div>

          {urgentRevision && (
            <div className="pt-3 mt-2 border-t border-purple-100">
              <button
                onClick={() => setActiveTab('revisoes')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                Abrir painel de revisões <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
