import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { PriorityBadge, StatusBadge, ExamBadge } from '../common/Badge';
import { ModoFocoTDAHBanner } from '../common/ModoFocoTDAHBanner';
import { 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  AlertTriangle, 
  CheckSquare, 
  ArrowRight, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Target, 
  Zap, 
  BarChart3, 
  Flame, 
  Layers 
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    topics,
    tasks,
    todayTasks,
    overdueTasks,
    overdueRevisions,
    todayRevisions,
    questionRecords,
    simulados,
    settings,
    setActiveTab,
    openFocusMode,
    completeTask,
    totalStudyHours,
    totalQuestionsSolved,
    overallAccuracy,
    overallProgressPercentage,
  } = useStudy();

  const totalTopics = topics.length;
  const studiedTopics = topics.filter(t => t.status === 'estudado' || t.status === 'revisado' || t.status === 'dominado').length;
  const pendingTopics = totalTopics - studiedTopics;
  const overdueCount = overdueTasks.length + overdueRevisions.length;

  // Group subjects and calculate completion percentages
  const subjectsMap: Record<string, { name: string; total: number; studied: number }> = {};
  topics.forEach(t => {
    if (!subjectsMap[t.subjectName]) {
      subjectsMap[t.subjectName] = { name: t.subjectName, total: 0, studied: 0 };
    }
    subjectsMap[t.subjectName].total += 1;
    if (t.status === 'estudado' || t.status === 'revisado' || t.status === 'dominado') {
      subjectsMap[t.subjectName].studied += 1;
    }
  });

  const subjectsList = Object.values(subjectsMap);

  // Today summary
  const todayTheoryTasks = todayTasks.filter(t => t.type === 'teoria');
  const todayRevisionTasks = todayTasks.filter(t => t.type === 'revisao');
  const todayQuestionTasks = todayTasks.filter(t => t.type === 'questoes');

  // Last studied topics
  const recentTopics = [...topics]
    .filter(t => t.lastStudiedDate)
    .sort((a, b) => (b.lastStudiedDate || '').localeCompare(a.lastStudiedDate || ''))
    .slice(0, 4);

  // Critical / High priority items for the week
  const weekPriorities = topics
    .filter(t => t.priority === 'critica' && t.status !== 'dominado')
    .slice(0, 4);

  // Countdown calculations
  const curr = new Date('2026-08-29T00:00:00');
  const transpetroDate = new Date(`${settings.examDateTranspetro}T00:00:00`);
  const petrobrasDate = new Date(`${settings.examDatePetrobras}T00:00:00`);
  const daysTranspetro = Math.max(0, Math.ceil((transpetroDate.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)));
  const daysPetrobras = Math.max(0, Math.ceil((petrobrasDate.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div id="view-dashboard" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* TDAH Focused Banner if active */}
      <ModoFocoTDAHBanner />

      {/* Hero Welcome & Countdowns */}
      <div className="bg-gradient-to-br from-[#0B1F3A] via-[#123B5D] to-[#1E4E79] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-48 h-48 rounded-full bg-teal-500/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Preparação Estratégica 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {settings.userName}! Vamos focar na sua aprovação?
            </h1>
            <p className="text-slate-200 text-sm max-w-2xl leading-relaxed">
              Você está seguindo a rota balanceada para <strong className="text-white">Transpetro</strong> e <strong className="text-white">Petrobras</strong>. Mantenha os blocos curtos e revise pontualmente no ciclo D+X.
            </p>
          </div>

          {/* Dual Countdown Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/15 text-center min-w-[130px]">
              <span className="text-[11px] font-bold text-teal-300 block uppercase tracking-wider">
                TRANSPETRO
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">
                {daysTranspetro} <span className="text-xs font-normal text-slate-300">dias</span>
              </div>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                Dutos e Terminais
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/15 text-center min-w-[130px]">
              <span className="text-[11px] font-bold text-blue-300 block uppercase tracking-wider">
                PETROBRAS
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">
                {daysPetrobras} <span className="text-xs font-normal text-slate-300">dias</span>
              </div>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                Técnico de Operações
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Stats Row (6 key cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Matérias</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {subjectsList.length}
          </div>
          <span className="text-[11px] text-slate-700">Edital Completo</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Tópicos Feitos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
            {studiedTopics}
          </div>
          <span className="text-[11px] text-slate-700 font-medium">de {totalTopics} tópicos</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Pendentes</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {pendingTopics}
          </div>
          <span className="text-[11px] text-slate-700 font-medium">a cobrir</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          overdueCount > 0 ? 'bg-rose-50/70 border-rose-200 shadow-2xs' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className={`text-xs font-semibold ${overdueCount > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
              Atrasos
            </span>
            <AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono ${overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {overdueCount}
          </div>
          {overdueCount > 0 ? (
            <button
              onClick={() => setActiveTab('recuperar_atrasos')}
              className="text-[11px] text-rose-700 font-bold hover:underline"
            >
              Replanejar ➔
            </button>
          ) : (
            <span className="text-[11px] text-emerald-600 font-semibold">Em dia!</span>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Questões</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {totalQuestionsSolved}
          </div>
          <span className="text-[11px] text-amber-800 font-semibold">
            {overallAccuracy}% de acerto
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Progresso Total</span>
            <Target className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-700 font-mono">
            {overallProgressPercentage}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1">
            <div
              className="bg-teal-500 h-full rounded-full"
              style={{ width: `${overallProgressPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* Middle Grid: Bloco HOJE & Subject Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bloco HOJE (5 Cols on large) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">
                    Plano de Hoje (29/08)
                  </h2>
                  <span className="text-xs text-slate-700">
                    {todayTasks.length} blocos programados
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('plano_hoje')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                Abrir Plano <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick breakdown of today's target */}
            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-100">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-purple-700">Revisar</span>
                <span className="text-base font-black font-mono">{todayRevisionTasks.length} blocos</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-blue-700">Teoria</span>
                <span className="text-base font-black font-mono">{todayTheoryTasks.length} blocos</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-100">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-700">Questões</span>
                <span className="text-base font-black font-mono">20 Qs</span>
              </div>
            </div>

            {/* Next 3 immediate tasks */}
            <div className="space-y-2.5 pt-1">
              {todayTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    task.status === 'concluido'
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                      : 'bg-slate-50 border-slate-200 hover:border-teal-400'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        task.type === 'revisao'
                          ? 'bg-purple-100 text-purple-800'
                          : task.type === 'questoes'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.type.toUpperCase()}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <span className="text-[11px] text-slate-700 font-mono">
                        {task.suggestedDurationMinutes}m
                      </span>
                    </div>
                    <h3 className={`text-xs font-bold truncate ${
                      task.status === 'concluido' ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </h3>
                  </div>

                  {task.status !== 'concluido' ? (
                    <button
                      onClick={() => openFocusMode(task)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-500 text-xs font-bold shrink-0 shadow-xs"
                    >
                      Iniciar
                    </button>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('plano_hoje')}
              className="w-full py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B5D] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              Ver Quadro Completo em 4 Blocos
            </button>
          </div>
        </div>

        {/* Progresso por Matéria (7 Cols on large) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">
                    Progresso por Matéria do Edital
                  </h2>
                  <span className="text-xs text-slate-700">
                    Cobertura de tópicos por disciplina
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('materias_edital')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                Ver Edital Detalhado <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of subjects with progress bars */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {subjectsList.map(subj => {
                const pct = subj.total > 0 ? Math.round((subj.studied / subj.total) * 100) : 0;
                return (
                  <div key={subj.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[260px] sm:max-w-md">
                        {subj.name}
                      </span>
                      <span className="font-mono text-slate-700">
                        <strong className="text-slate-900 font-bold">{subj.studied}</strong>/{subj.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 80
                            ? 'bg-emerald-500'
                            : pct >= 50
                            ? 'bg-blue-600'
                            : pct >= 25
                            ? 'bg-amber-500'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              &gt;80% Dominado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              50-80% Em Estudo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              Iniciando
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Grid: 3 Scannable Cards (Prioridades, Atenção/Atrasos, Últimos Assuntos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Prioridades da Semana */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Prioridades Críticas da Semana
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                Alto Peso
              </span>
            </div>

            <div className="space-y-2">
              {weekPriorities.map(t => (
                <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <ExamBadge target={t.examTarget} isCommon={t.isCommon} />
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="font-bold text-slate-900 leading-snug">{t.name}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('materias_edital')}
            className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800 text-center block pt-2 border-t border-slate-100"
          >
            Ver todos os tópicos críticos ➔
          </button>
        </div>

        {/* 2. Bloco Atenção (Atrasos) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Atenção: Tarefas Atrasadas
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                {overdueCount} itens
              </span>
            </div>

            {overdueTasks.length > 0 || overdueRevisions.length > 0 ? (
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map(ot => (
                  <div key={ot.id} className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-rose-700">Vencida em {ot.date}</span>
                      <PriorityBadge priority={ot.priority} />
                    </div>
                    <p className="font-bold text-slate-900 truncate">{ot.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700">Nenhum atraso pendente!</p>
                <p className="text-[11px] text-slate-400">Seu cronograma está perfeitamente em dia.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('recuperar_atrasos')}
            className="mt-3 text-xs font-bold text-rose-600 hover:text-rose-800 text-center block pt-2 border-t border-slate-100"
          >
            Replanejar Atrasos sem Sobrecarga ➔
          </button>
        </div>

        {/* 3. Últimos Assuntos Estudados */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                Últimos Assuntos & Ciclos
              </h3>
              <span className="text-[11px] text-slate-700 font-semibold">Histórico</span>
            </div>

            <div className="space-y-2">
              {recentTopics.map(rt => (
                <div key={rt.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-mono text-slate-700">{rt.lastStudiedDate}</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                      {rt.currentRevisionStage || 'D+1'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 truncate">{rt.name}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('revisoes')}
            className="mt-3 text-xs font-bold text-purple-600 hover:text-purple-800 text-center block pt-2 border-t border-slate-100"
          >
            Ver Calendário Espaçado (D+X) ➔
          </button>
        </div>

      </div>

    </div>
  );
};
