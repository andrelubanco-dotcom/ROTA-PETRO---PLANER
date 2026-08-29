import React, { useState, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { PriorityBadge, ExamBadge } from '../common/Badge';
import { PriorityLevel, TaskType, ExamTarget, Task } from '../../types';
import { 
  MONTHS_LIST, 
  SPECIAL_MILESTONES, 
  HARD_DEADLINE_DATE, 
  HARD_DEADLINE_LABEL 
} from '../../utils/scheduleGenerator';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  BookOpen, 
  CheckSquare, 
  Sparkles, 
  Zap,
  Target,
  Flag,
  Flame,
  Award,
  Layers
} from 'lucide-react';

export const CronogramaView: React.FC = () => {
  const { 
    tasks, 
    todayTasks, 
    overdueTasks, 
    openFocusMode, 
    completeTask, 
    postponeTask, 
    setActiveTab 
  } = useStudy();

  const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'dia'>('mes');
  
  // Selected month for the monthly view (default: Agosto 2026, id '2026-08')
  const [selectedMonthId, setSelectedMonthId] = useState<string>('2026-08');
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filters
  const [filterExam, setFilterExam] = useState<ExamTarget>('ambos');
  const [filterPriority, setFilterPriority] = useState<string>('todos');
  const [filterType, setFilterType] = useState<string>('todos');

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filterExam !== 'ambos' && t.targetExam !== 'ambos' && t.targetExam !== filterExam) {
      return false;
    }
    if (filterPriority !== 'todos' && t.priority !== filterPriority) {
      return false;
    }
    if (filterType !== 'todos' && t.type !== filterType) {
      return false;
    }
    return true;
  });

  // Calculate days remaining to 28/11/2026
  const today = new Date('2026-08-29');
  const deadline = new Date(HARD_DEADLINE_DATE);
  const diffTime = deadline.getTime() - today.getTime();
  const daysToDeadline = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Scroll controls for the month bar
  const scrollMonths = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Current selected month object
  const currentMonth = MONTHS_LIST.find(m => m.id === selectedMonthId) || MONTHS_LIST[0];

  // Generate calendar days for the selected month
  const getDaysForMonth = (year: number, monthIndex: number) => {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const totalDays = lastDay.getDate();
    
    // In JS, getDay() returns 0 for Sunday, 1 for Monday, etc.
    // Let's adjust so Monday is 0, Sunday is 6
    let startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];
    // Blank padding days before the 1st
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ dayNum: null, dateStr: '' });
    }

    for (let d = 1; d <= totalDays; d++) {
      const formattedMonth = (monthIndex + 1).toString().padStart(2, '0');
      const formattedDay = d.toString().padStart(2, '0');
      const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
      days.push({ dayNum: d, dateStr });
    }

    return days;
  };

  const calendarDays = getDaysForMonth(currentMonth.year, currentMonth.monthIndex);

  // Month tasks
  const monthTasks = filteredTasks.filter(t => t.date.startsWith(selectedMonthId));
  const monthCompletedTasks = monthTasks.filter(t => t.status === 'concluido');
  const monthProgressPct = monthTasks.length > 0 
    ? Math.round((monthCompletedTasks.length / monthTasks.length) * 100) 
    : 0;

  // Selected day tasks (if clicked on a day, otherwise all month tasks grouped)
  const activeDayTasks = selectedDayDate 
    ? filteredTasks.filter(t => t.date === selectedDayDate)
    : monthTasks;

  // Week days for simulation
  const weekDays = [
    { date: '2026-08-29', dayName: 'Sáb (Início)', dayNum: '29', isToday: true },
    { date: '2026-08-30', dayName: 'Domingo', dayNum: '30' },
    { date: '2026-08-31', dayName: 'Segunda', dayNum: '31' },
    { date: '2026-09-01', dayName: 'Terça', dayNum: '01' },
    { date: '2026-09-02', dayName: 'Quarta', dayNum: '02' },
    { date: '2026-09-03', dayName: 'Quinta', dayNum: '03' },
    { date: '2026-09-04', dayName: 'Sexta', dayNum: '04' },
  ];

  const upcomingTasks = filteredTasks.filter(t => t.date > '2026-08-29' && !t.isOverdue);
  const overdueList = filteredTasks.filter(t => t.isOverdue || (t.date < '2026-08-29' && t.status !== 'concluido'));

  return (
    <div id="view-cronograma" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* ========================================================================= */}
      {/* HARD DEADLINE BANNER — 28/11/2026 TRANSPETRO */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B2545] to-[#134E5E] rounded-3xl p-5 sm:p-6 text-white border border-slate-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-emerald-400" />
              Ciclo Intensivo Pós-Edital
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3 h-3 text-amber-400" />
              Data Limite Fixada: 28/11/2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Cronograma Pós-Edital Transpetro & Petrobras
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Todo o conteúdo teórico, revisões e simulados estão estrategicamente programados para serem concluídos 
            rigorosamente até <strong className="text-amber-300">28/11/2026</strong> (Prova Dutos e Terminais).
          </p>
        </div>

        {/* Countdown & Reorganize Button */}
        <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/15 text-center">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Faltam</span>
            <span className="text-2xl font-black font-mono text-amber-300 leading-none">{daysToDeadline}</span>
            <span className="text-[10px] text-slate-300 block">dias p/ Prova</span>
          </div>

          <button
            onClick={() => setActiveTab('recuperar_atrasos')}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
            title="Ajustar e rebalancear tarefas preservando o limite de 28/11/2026"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recuperar Atrasos</span>
          </button>
        </div>
      </div>

      {/* Header with View Toggle & Google Calendar Sync */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Modo de Visualização
            </h2>
            <p className="text-xs text-slate-500">
              Alterne entre o calendário mensal contínuo, a grade semanal e a lista diária
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('google_workspace')}
            className="px-3.5 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Sincronizar com Google Agenda"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Google Agenda</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('mes')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                viewMode === 'mes' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Mensal (Agosto a Março)
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'semana' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Semanal
            </button>
            <button
              onClick={() => setViewMode('dia')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'dia' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Diária
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCROLLABLE MONTH BAR (Requested: Agosto, Setembro, Outubro, Novembro, Dezembro, Janeiro, Fevereiro, Março) */}
      {/* ========================================================================= */}
      {viewMode === 'mes' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Navegação por Meses (Pós-Edital até Março/2027)
              </span>
            </div>

            {/* Scroll Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollMonths('left')}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-2xs"
                title="Rolar meses para a esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollMonths('right')}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-2xs"
                title="Rolar meses para a direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Month Pills */}
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
          >
            {MONTHS_LIST.map((m) => {
              const isSelected = selectedMonthId === m.id;
              const isTargetMonth = m.id === '2026-11' || m.phase === 'reta_final';
              const countInMonth = tasks.filter(t => t.date.startsWith(m.id)).length;

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMonthId(m.id);
                    setSelectedDayDate(null);
                  }}
                  className={`shrink-0 px-4 py-3 rounded-2xl border transition-all text-left min-w-[170px] flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-700 text-white border-sky-800 shadow-md ring-2 ring-sky-300'
                      : isTargetMonth
                      ? 'bg-amber-50 text-slate-900 border-amber-300 hover:border-amber-400'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {m.label}
                    </span>
                    {m.badge && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-white/20 text-amber-200' 
                          : 'bg-amber-500/20 text-amber-800 border border-amber-400/40'
                      }`}>
                        {m.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full text-[11px]">
                    <span className={isSelected ? 'text-sky-100 font-semibold' : 'text-slate-500'}>
                      {countInMonth} {countInMonth === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                    {m.id === '2026-11' && (
                      <span className={`text-[10px] font-black ${isSelected ? 'text-amber-300' : 'text-amber-700'}`}>
                        28/11 Prova ⭐
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Filter className="w-4 h-4 text-sky-600" />
          <span>Filtros do Cronograma:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Concurso Target Filter */}
          <select
            value={filterExam}
            onChange={e => setFilterExam(e.target.value as ExamTarget)}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
          >
            <option value="ambos">Todas as Provas (Transpetro + Petrobras)</option>
            <option value="transpetro">Apenas Transpetro</option>
            <option value="petrobras">Apenas Petrobras</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
          >
            <option value="todos">Todas Prioridades</option>
            <option value="critica">Crítica (Peso Cesgranrio)</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          {/* Task Type Filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="teoria">Teoria</option>
            <option value="revisao">Revisão</option>
            <option value="questoes">Questões</option>
            <option value="extra">Fechamento / Fórmulas</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MES VIEW CONTENT */}
      {/* ========================================================================= */}
      {viewMode === 'mes' && (
        <div className="space-y-6">
          
          {/* Calendar Grid Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <span>{currentMonth.label}</span>
                  {selectedMonthId === '2026-11' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                      🎯 Mês Decisivo: 28/11/2026 Prova Dutos e Terminais
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clique em qualquer dia para inspecionar os blocos programados
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-slate-600">
                  {monthCompletedTasks.length} de {monthTasks.length} tarefas concluídas ({monthProgressPct}%)
                </span>
                {selectedDayDate && (
                  <button
                    onClick={() => setSelectedDayDate(null)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                  >
                    Ver Mês Inteiro
                  </button>
                )}
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-black text-slate-500 pb-1">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span className="text-sky-700">Sáb</span>
              <span className="text-slate-400">Dom</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((cell, idx) => {
                if (!cell.dayNum) {
                  return <div key={`empty-${idx}`} className="p-2 min-h-[85px] bg-slate-50/50 rounded-2xl border border-transparent" />;
                }

                const dayDate = cell.dateStr;
                const dayTasks = filteredTasks.filter(t => t.date === dayDate);
                const isSelected = selectedDayDate === dayDate;
                const isToday = dayDate === '2026-08-29';
                const isExamDeadline = dayDate === HARD_DEADLINE_DATE;
                const milestone = SPECIAL_MILESTONES[dayDate];

                const completedCount = dayTasks.filter(t => t.status === 'concluido').length;

                return (
                  <div
                    key={dayDate}
                    onClick={() => setSelectedDayDate(isSelected ? null : dayDate)}
                    className={`p-2 rounded-2xl border transition-all min-h-[90px] sm:min-h-[105px] flex flex-col justify-between cursor-pointer hover:scale-[1.02] ${
                      isExamDeadline
                        ? 'bg-amber-100/80 border-2 border-amber-500 shadow-sm ring-2 ring-amber-200'
                        : isToday
                        ? 'bg-sky-50 border-2 border-sky-400 shadow-xs'
                        : isSelected
                        ? 'bg-sky-50/80 border-2 border-sky-600 shadow-sm'
                        : dayTasks.length > 0
                        ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                        : 'bg-white border-slate-100 text-slate-400 opacity-60'
                    }`}
                  >
                    {/* Day Number and Milestone Icon */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-black ${
                        isExamDeadline 
                          ? 'text-amber-950 text-sm' 
                          : isToday 
                          ? 'text-sky-800' 
                          : 'text-slate-800'
                      }`}>
                        {cell.dayNum}
                      </span>

                      {isExamDeadline ? (
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black" title="Data Limite: Prova Transpetro Dutos e Terminais">
                          🎯
                        </span>
                      ) : milestone ? (
                        <span className="text-[11px]" title={milestone.title}>
                          {milestone.type === 'simulado' ? '📝' : '📌'}
                        </span>
                      ) : isToday ? (
                        <span className="text-[9px] font-black px-1 rounded bg-sky-200 text-sky-900">HOJE</span>
                      ) : null}
                    </div>

                    {/* Milestone badge or tasks counts */}
                    <div className="space-y-1 my-1">
                      {isExamDeadline && (
                        <div className="text-[9px] font-black text-amber-950 bg-amber-200/80 px-1 py-0.5 rounded leading-tight text-center">
                          PROVA TRANSPETRO
                        </div>
                      )}

                      {milestone && !isExamDeadline && (
                        <div className="text-[9px] font-bold text-sky-900 bg-sky-100 px-1 py-0.5 rounded leading-tight truncate">
                          {milestone.title}
                        </div>
                      )}

                      {dayTasks.length > 0 && (
                        <div className="space-y-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold block text-center truncate ${
                            completedCount === dayTasks.length
                              ? 'bg-emerald-100 text-emerald-900'
                              : isSelected
                              ? 'bg-sky-600 text-white'
                              : 'bg-white text-slate-800 border border-slate-200'
                          }`}>
                            {dayTasks.length} {dayTasks.length === 1 ? 'bloco' : 'blocos'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Types indicator dots */}
                    <div className="flex items-center justify-center gap-1">
                      {dayTasks.some(t => t.type === 'revisao') && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Revisão" />
                      )}
                      {dayTasks.some(t => t.type === 'teoria') && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Teoria" />
                      )}
                      {dayTasks.some(t => t.type === 'questoes') && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Questões" />
                      )}
                      {dayTasks.some(t => t.type === 'simulado') && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Simulado" />
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Detailed Task Listing for Selected Day or Full Month */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-sky-600" />
                  <span>
                    {selectedDayDate 
                      ? `Tarefas Agendadas para ${selectedDayDate.split('-').reverse().join('/')}`
                      : `Todas as Tarefas de ${currentMonth.label} (${activeDayTasks.length} blocos)`
                    }
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDayDate 
                    ? 'Visualização detalhada dos blocos de estudo do dia selecionado'
                    : 'Mostrando o cronograma completo de estudos programado para este mês'
                  }
                </p>
              </div>

              {activeDayTasks.length > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200">
                  {activeDayTasks.reduce((acc, t) => acc + t.suggestedDurationMinutes, 0)} minutos de estudo
                </span>
              )}
            </div>

            {activeDayTasks.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nenhuma tarefa agendada para esta data</p>
                <p className="text-xs text-slate-400">
                  {selectedMonthId > '2026-11' 
                    ? 'O cronograma intensivo concentra-se até 28/11/2026 (Data da Prova Transpetro).'
                    : 'Dia livre ou reservado para descanso e recuperação.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDayTasks.map(t => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      t.status === 'concluido'
                        ? 'bg-emerald-50/60 border-emerald-200 opacity-70'
                        : t.type === 'revisao'
                        ? 'bg-purple-50/40 border-purple-200 hover:border-purple-300'
                        : t.type === 'questoes'
                        ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                        : 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                            {t.date.split('-').reverse().join('/')}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200">
                            {t.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PriorityBadge priority={t.priority} />
                          <span className="text-xs font-mono text-slate-500 font-semibold">{t.suggestedDurationMinutes}m</span>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {t.title}
                      </h4>

                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p className="font-semibold text-slate-700">{t.subjectName}</p>
                        {t.subtopic && <p className="text-[11px] text-slate-500">{t.subtopic}</p>}
                      </div>

                      {t.checklist && t.checklist.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Checklist:</span>
                          {t.checklist.map(item => (
                            <div key={item.id} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                              <span>{item.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => completeTask(t.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          t.status === 'concluido'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {t.status === 'concluido' ? '✓ Concluído' : 'Marcar Concluído'}
                      </button>

                      <button
                        onClick={() => openFocusMode(t)}
                        className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-xs transition-all"
                      >
                        Focar no Bloco
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SEMANA VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'semana' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map(day => {
            const dayTasks = filteredTasks.filter(t => t.date === day.date && !t.isOverdue);
            const isToday = day.isToday;

            return (
              <div
                key={day.date}
                className={`rounded-2xl p-3 border flex flex-col justify-between min-h-[320px] transition-all ${
                  isToday
                    ? 'bg-sky-50/50 border-2 border-sky-400 shadow-sm ring-2 ring-sky-100'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className={`text-xs font-extrabold ${isToday ? 'text-sky-900' : 'text-slate-700'}`}>
                      {day.dayName}
                    </span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-black ${
                      isToday ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {day.dayNum}
                    </span>
                  </div>

                  {/* Tasks for the day */}
                  <div className="space-y-2">
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => openFocusMode(t)}
                        className={`p-2 rounded-xl border text-[11px] cursor-pointer hover:scale-[1.02] transition-transform ${
                          t.status === 'concluido'
                            ? 'bg-emerald-50 border-emerald-200 opacity-60 line-through'
                            : t.type === 'revisao'
                            ? 'bg-purple-50 border-purple-200 text-purple-950 font-semibold'
                            : t.type === 'questoes'
                            ? 'bg-amber-50 border-amber-200 text-amber-950 font-semibold'
                            : 'bg-blue-50 border-blue-200 text-blue-950 font-semibold'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-mono text-[9px] uppercase px-1 rounded bg-white/60">
                            {t.type}
                          </span>
                          <span className="text-[9px] text-slate-500">{t.suggestedDurationMinutes}m</span>
                        </div>
                        <p className="truncate font-bold leading-tight">{t.title}</p>
                      </div>
                    ))}

                    {dayTasks.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic text-center py-6">
                        Livre / Descanso
                      </p>
                    )}
                  </div>
                </div>

                {isToday && (
                  <div className="mt-2 pt-2 border-t border-sky-200 text-[10px] text-center font-bold text-sky-800">
                    📍 Dia Atual (Início Oficial)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIA VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'dia' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">
              Agenda Diária Detalhada — 29 de Agosto de 2026 (Início Oficial)
            </h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              {todayTasks.length} blocos programados
            </span>
          </div>

          <div className="space-y-3">
            {todayTasks.map(t => (
              <div
                key={t.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-sky-400 transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {t.subjectName}
                    </span>
                    <PriorityBadge priority={t.priority} />
                    <span className="text-xs text-slate-500 font-mono">{t.suggestedDurationMinutes} min</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.title}</h4>
                  {t.subtopic && <p className="text-xs text-slate-500">{t.subtopic}</p>}
                </div>

                <button
                  onClick={() => openFocusMode(t)}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 shadow-xs"
                >
                  Focar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUMMARY LISTS: Hoje, Próximas, Vencidas */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* Tarefas de Hoje */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Tarefas de Hoje ({todayTasks.length})
            </h3>
          </div>
          <div className="space-y-2">
            {todayTasks.slice(0, 4).map(t => (
              <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-900 block truncate">{t.title}</span>
                <span className="text-[11px] text-slate-500">{t.subjectName} • {t.suggestedDurationMinutes}m</span>
              </div>
            ))}
          </div>
        </div>

        {/* Próximas Tarefas */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              Próximos Dias ({upcomingTasks.length})
            </h3>
          </div>
          <div className="space-y-2">
            {upcomingTasks.slice(0, 4).map(t => (
              <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-mono text-blue-700 font-bold">{t.date.split('-').reverse().join('/')}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                <span className="font-bold text-slate-900 block truncate">{t.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tarefas Vencidas */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Vencidas / Remanejadas ({overdueList.length})
            </h3>
          </div>
          <div className="space-y-2">
            {overdueList.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs font-bold text-slate-500">Nenhum atraso pendente!</p>
              </div>
            ) : (
              overdueList.slice(0, 4).map(t => (
                <div key={t.id} className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-rose-700">Atrasada desde {t.date}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <span className="font-bold text-slate-900 block truncate">{t.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
