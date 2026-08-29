import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { PriorityBadge, ExamBadge } from '../common/Badge';
import { ModoFocoTDAHBanner } from '../common/ModoFocoTDAHBanner';
import { BlockType, PriorityLevel, Task, TaskType } from '../../types';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Plus, 
  RotateCcw, 
  BookOpen, 
  CheckSquare, 
  Sparkles, 
  Flame, 
  Zap, 
  X, 
  ListChecks 
} from 'lucide-react';

export const PlanoHojeView: React.FC = () => {
  const { 
    todayTasks, 
    completeTask, 
    postponeTask, 
    openFocusMode, 
    addNewTask, 
    topics, 
    settings 
  } = useStudy();

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType>('bloco2_conteudo');
  
  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Máquinas e Equipamentos de Fluxo');
  const [newTopic, setNewTopic] = useState('Bombas Centrífugas e Alternativas');
  const [newSubtopic, setNewSubtopic] = useState('');
  const [newType, setNewType] = useState<TaskType>('teoria');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('alta');
  const [newDuration, setNewDuration] = useState<number>(30);

  // Group tasks into the 4 structured blocks
  const bloco1Tasks = todayTasks.filter(t => t.blockType === 'bloco1_revisao');
  const bloco2Tasks = todayTasks.filter(t => t.blockType === 'bloco2_conteudo');
  const bloco3Tasks = todayTasks.filter(t => t.blockType === 'bloco3_questoes');
  const bloco4Tasks = todayTasks.filter(t => t.blockType === 'bloco4_extra');

  // Daily totals
  const totalPlannedMinutes = todayTasks.reduce((acc, t) => acc + (t.suggestedDurationMinutes || 0), 0);
  const completedTasks = todayTasks.filter(t => t.status === 'concluido');
  const completedMinutes = completedTasks.reduce((acc, t) => acc + (t.suggestedDurationMinutes || 0), 0);
  const completedPct = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addNewTask({
      title: newTitle,
      subjectName: newSubject,
      topicName: newTopic,
      subtopic: newSubtopic || undefined,
      type: newType,
      priority: newPriority,
      suggestedDurationMinutes: Number(newDuration),
      blockType: selectedBlockType,
      date: '2026-08-29',
      targetExam: 'ambos',
      checklist: [
        { id: `c-${Date.now()}-1`, text: 'Leitura atenta e marcações-chave', done: false },
        { id: `c-${Date.now()}-2`, text: 'Resolução de questões de fixação', done: false },
      ],
    });

    setNewTitle('');
    setNewSubtopic('');
    setIsNewTaskModalOpen(false);
  };

  const openAddModal = (block: BlockType, defaultType: TaskType) => {
    setSelectedBlockType(block);
    setNewType(defaultType);
    setIsNewTaskModalOpen(true);
  };

  return (
    <div id="view-plano-hoje" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* TDAH Focused Banner if enabled */}
      <ModoFocoTDAHBanner />

      {/* Header Banner for Today */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B1F3A] to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-5 border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-500/30">
              Rotina Diária de 210 min
            </span>
            <span className="text-xs text-slate-300 font-mono">
              29 de Agosto de 2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            Plano de Estudos de Hoje
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl hidden sm:block">
            4 blocos estruturados (Revisão 30m • Teoria 100m • Questões 60m • Fechamento 20m) para retenção máxima.
          </p>
        </div>

        {/* Daily Time & Completion Meter */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-700/80 min-w-[200px] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Tempo Total:</span>
            <span className="font-mono font-bold text-teal-300">
              {Math.floor(totalPlannedMinutes / 60)}h {totalPlannedMinutes % 60}m (210 min)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Progresso Hoje:</span>
            <span className="font-mono font-bold text-emerald-400">
              {completedTasks.length}/{todayTasks.length} ({completedPct}%)
            </span>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, completedPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* The 4 Core Blocks */}
      <div className="space-y-5">
        
        {/* ========================================================================= */}
        {/* BLOCO 1 — REVISÃO PRIORITÁRIA */}
        {/* ========================================================================= */}
        <div id="bloco-1-revisao" className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-purple-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-purple-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                    1. REVISÃO — 30 min
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[11px] font-extrabold">
                    {bloco1Tasks.length} {bloco1Tasks.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 hidden sm:block">
                  Ciclos D+1, D+7, D+15, D+30 e recuperação ativa dos tópicos críticos.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAddModal('bloco1_revisao', 'revisao')}
              className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>

          {bloco1Tasks.length === 0 ? (
            <div className="text-center py-5 bg-purple-50/50 rounded-2xl border border-dashed border-purple-200">
              <p className="text-xs text-purple-800 font-medium">Nenhuma revisão pendente para hoje neste bloco.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {bloco1Tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={() => openFocusMode(task)}
                  onComplete={() => completeTask(task.id)}
                  onPostpone={() => postponeTask(task.id)}
                  accentColor="purple"
                />
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BLOCO 2 — CONTEÚDO NOVO (TEORIA CENTRAL) */}
        {/* ========================================================================= */}
        <div id="bloco-2-conteudo" className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-blue-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-blue-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                    2. TEORIA CENTRAL — 100 min (2x 50 min)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-extrabold">
                    {bloco2Tasks.length} {bloco2Tasks.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 hidden sm:block">
                  Dividido internamente em Bloco A (50 min) e Bloco B (50 min) de tópicos específicos.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAddModal('bloco2_conteudo', 'teoria')}
              className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>

          {bloco2Tasks.length === 0 ? (
            <div className="text-center py-5 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200">
              <p className="text-xs text-blue-800 font-medium">Nenhum tópico agendado para este bloco.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {bloco2Tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={() => openFocusMode(task)}
                  onComplete={() => completeTask(task.id)}
                  onPostpone={() => postponeTask(task.id)}
                  accentColor="blue"
                />
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BLOCO 3 — QUESTÕES CESGRANRIO */}
        {/* ========================================================================= */}
        <div id="bloco-3-questoes" className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-amber-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
                3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                    3. QUESTÕES CESGRANRIO — 60 min
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                    {bloco3Tasks.length} {bloco3Tasks.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 hidden sm:block">
                  Resolução cronometrada com registro de acertos e catálogo de erros.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAddModal('bloco3_questoes', 'questoes')}
              className="flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>

          {bloco3Tasks.length === 0 ? (
            <div className="text-center py-5 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200">
              <p className="text-xs text-amber-800 font-medium">Nenhum treino de questões para este bloco.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {bloco3Tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={() => openFocusMode(task)}
                  onComplete={() => completeTask(task.id)}
                  onPostpone={() => postponeTask(task.id)}
                  accentColor="amber"
                />
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BLOCO 4 — FECHAMENTO: SÍNTESE & FÓRMULAS */}
        {/* ========================================================================= */}
        <div id="bloco-4-extra" className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-teal-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-teal-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                4
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                    4. FECHAMENTO & FÓRMULAS — 20 min
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[11px] font-extrabold">
                    {bloco4Tasks.length} {bloco4Tasks.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 hidden sm:block">
                  Síntese de fórmulas, mapa mental e preparação do próximo ciclo de revisão.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAddModal('bloco4_extra', 'extra')}
              className="flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>

          {bloco4Tasks.length === 0 ? (
            <div className="text-center py-5 bg-teal-50/50 rounded-2xl border border-dashed border-teal-200">
              <p className="text-xs text-teal-800 font-medium">Nenhuma tarefa de fechamento pendente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {bloco4Tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={() => openFocusMode(task)}
                  onComplete={() => completeTask(task.id)}
                  onPostpone={() => postponeTask(task.id)}
                  accentColor="teal"
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL ADICIONAR TAREFA */}
      {/* ========================================================================= */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                Adicionar Nova Tarefa ao Bloco
              </h3>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teoria: Permutadores casco e tubo / MLDT"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Matéria</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tópico</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtópico / Foco</label>
                <input
                  type="text"
                  placeholder="Ex: Chicanas e cálculo de MLDT"
                  value={newSubtopic}
                  onChange={e => setNewSubtopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as TaskType)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="teoria">Teoria</option>
                    <option value="revisao">Revisão</option>
                    <option value="questoes">Questões</option>
                    <option value="extra">Extra</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioridade</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="critica">Crítica</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duração (min)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newDuration}
                    onChange={e => setNewDuration(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-xs"
                >
                  Adicionar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-component for individual Task Card with 3 buttons: Iniciar, Concluir, Adiar
interface TaskCardProps {
  task: Task;
  onStart: () => void;
  onComplete: () => void;
  onPostpone: () => void;
  accentColor: 'purple' | 'blue' | 'amber' | 'teal';
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStart,
  onComplete,
  onPostpone,
}) => {
  const isDone = task.status === 'concluido';
  const isHighlighted = task.highlight || task.title.includes('FLASHCARDS — MEGA IMPORTANTE');

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
        isDone
          ? 'bg-emerald-50/40 border-emerald-200/80 opacity-75'
          : isHighlighted
          ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
          : 'bg-white border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-xs'
      }`}
    >
      <div className="space-y-2">
        {/* Highlight Banner if mega importante */}
        {isHighlighted && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] tracking-wide uppercase shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ FLASHCARDS — MEGA IMPORTANTE</span>
          </div>
        )}

        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/60">
              {task.subjectName}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>

          <div className="flex items-center gap-1 text-slate-600 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>{task.suggestedDurationMinutes} min</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`font-black text-sm sm:text-base leading-snug ${
          isDone ? 'line-through text-slate-400' : 'text-slate-900'
        }`}>
          {task.title}
        </h3>

        {/* Subtopic */}
        {task.subtopic && (
          <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 font-medium">
            <strong className="text-slate-900">Foco:</strong> {task.subtopic}
          </p>
        )}

        {/* Strategic Reason hidden on very small screens to avoid clutter */}
        {task.strategicReason && (
          <p className="text-[11px] text-teal-900 bg-teal-50/70 p-2 rounded-xl border border-teal-100 font-medium hidden sm:block">
            <strong className="text-teal-950">Estratégia:</strong> {task.strategicReason}
          </p>
        )}

        {/* Checklist summary if present */}
        {task.checklist && task.checklist.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-bold pt-0.5">
            <ListChecks className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {task.checklist.filter(c => c.done).length}/{task.checklist.length} passos concluídos
            </span>
          </div>
        )}
      </div>

      {/* 3 Action Buttons (Iniciar, Concluir, Adiar) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        {!isDone ? (
          <>
            <button
              onClick={onStart}
              className="flex-1 min-h-[42px] px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Abrir cronômetro no Modo Foco"
            >
              <Play className="w-4 h-4 fill-current" />
              INICIAR
            </button>

            <button
              onClick={onComplete}
              className="min-h-[42px] px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 font-black text-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Marcar como concluída diretamente"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden xs:inline">Concluir</span>
            </button>

            <button
              onClick={onPostpone}
              className="min-h-[42px] px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
              title="Adiar para o próximo dia útil"
            >
              Adiar
            </button>
          </>
        ) : (
          <div className="w-full py-2.5 flex items-center justify-center gap-1.5 text-emerald-800 font-extrabold text-xs bg-emerald-100/70 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Concluído com sucesso!
          </div>
        )}
      </div>
    </div>
  );
};
