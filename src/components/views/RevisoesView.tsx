import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { PriorityBadge } from '../common/Badge';
import { RevisionItem, RevisionStage } from '../../types';
import { 
  RotateCcw, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Plus, 
  X, 
  CheckSquare, 
  Sparkles, 
  Target 
} from 'lucide-react';

export const RevisoesView: React.FC = () => {
  const { 
    revisions, 
    todayRevisions, 
    overdueRevisions, 
    completeRevision, 
    postponeRevision, 
    scheduleNewRevision, 
    topics, 
    openFocusMode,
    tasks
  } = useStudy();

  const [activeSubTab, setActiveSubTab] = useState<'hoje' | 'atrasadas' | 'proximos' | 'todas'>('hoje');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Revision Form
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || '');
  const [selectedStage, setSelectedStage] = useState<RevisionStage>('D+1');
  const [suggestedQs, setSuggestedQs] = useState<number>(15);

  const upcomingRevisions = revisions.filter(r => r.dueDate > '2026-08-29' && !r.completed);

  const handleCreateRevision = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = topics.find(t => t.id === selectedTopicId);
    if (!topic) return;

    scheduleNewRevision({
      topicId: topic.id,
      topicName: topic.name,
      subjectName: topic.subjectName,
      dueDate: '2026-08-29',
      revisionStage: selectedStage,
      suggestedQuestions: suggestedQs,
      priority: topic.priority,
      targetExam: topic.examTarget,
    });

    setIsModalOpen(false);
  };

  const handleStartRevisionFocus = (rev: RevisionItem) => {
    // Find matching task or create temporary focus task
    const matchingTask = tasks.find(t => t.id.includes(rev.topicId) || t.title.includes(rev.topicName));
    if (matchingTask) {
      openFocusMode(matchingTask);
    } else {
      openFocusMode({
        id: `rev-${rev.id}`,
        title: `Revisão ${rev.revisionStage}: ${rev.topicName}`,
        subjectName: rev.subjectName,
        priority: rev.priority,
        status: 'pendente',
        suggestedDurationMinutes: 30,
        type: 'revisao',
        blockType: 'bloco1_revisao',
        subtopic: `Ciclo ${rev.revisionStage} • Meta: ${rev.suggestedQuestions} questões`,
        checklist: [
          { id: '1', text: 'Recuperação ativa (fórmulas e macetes)', done: false },
          { id: '2', text: `Resolver ${rev.suggestedQuestions} questões de fixação`, done: false },
          { id: '3', text: 'Catalogar erros no Caderno de Erros', done: false },
        ]
      });
    }
  };

  return (
    <div id="view-revisoes" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-[#3B125D] to-[#123B5D] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
              Curva do Esquecimento (Ebbinghaus)
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Ciclos D+1 • D+7 • D+15 • D+30
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Revisões Espaçadas Inteligentes
          </h1>
          <p className="text-slate-200 text-sm max-w-2xl mt-0.5">
            Ao concluir cada ciclo, o sistema avança automaticamente o tópico para o próximo intervalo.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Agendar Nova Revisão
        </button>
      </div>

      {/* Sub-tabs Selector */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveSubTab('hoje')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeSubTab === 'hoje'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Revisões de Hoje ({todayRevisions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('atrasadas')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeSubTab === 'atrasadas'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-rose-50 hover:text-rose-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Revisões Atrasadas ({overdueRevisions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('proximos')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeSubTab === 'proximos'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Próximos 7 Dias ({upcomingRevisions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('todas')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeSubTab === 'todas'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Todos os Ciclos Agendados ({revisions.length})
        </button>
      </div>

      {/* Revision List */}
      <div className="space-y-4">
        
        {activeSubTab === 'hoje' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Ciclos programados para revisão hoje (28/08)
              </h2>
            </div>

            {todayRevisions.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">Tudo limpo para hoje!</h3>
                <p className="text-xs text-slate-500">Nenhum ciclo pendente no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayRevisions.map(rev => (
                  <RevisionCard
                    key={rev.id}
                    revision={rev}
                    onStartFocus={() => handleStartRevisionFocus(rev)}
                    onComplete={() => completeRevision(rev.id)}
                    onPostpone={() => postponeRevision(rev.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'atrasadas' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-rose-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Revisões com prazo vencido
              </h2>
              <span className="text-xs text-rose-700 font-semibold">Prioridade Máxima de Replanejamento</span>
            </div>

            {overdueRevisions.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">Nenhuma revisão atrasada!</h3>
                <p className="text-xs text-slate-500">Seu espaçamento está 100% calibrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overdueRevisions.map(rev => (
                  <RevisionCard
                    key={rev.id}
                    revision={rev}
                    isOverdue
                    onStartFocus={() => handleStartRevisionFocus(rev)}
                    onComplete={() => completeRevision(rev.id)}
                    onPostpone={() => postponeRevision(rev.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'proximos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Revisões agendadas para os próximos 7 dias
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingRevisions.map(rev => (
                <RevisionCard
                  key={rev.id}
                  revision={rev}
                  onStartFocus={() => handleStartRevisionFocus(rev)}
                  onComplete={() => completeRevision(rev.id)}
                  onPostpone={() => postponeRevision(rev.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'todas' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                Visão Completa de Todos os Ciclos Cadastrados
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {revisions.map(rev => (
                <RevisionCard
                  key={rev.id}
                  revision={rev}
                  onStartFocus={() => handleStartRevisionFocus(rev)}
                  onComplete={() => completeRevision(rev.id)}
                  onPostpone={() => postponeRevision(rev.id)}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal: Agendar Revisão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                Agendar Novo Ciclo de Revisão
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRevision} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Selecione o Tópico do Edital</label>
                <select
                  value={selectedTopicId}
                  onChange={e => setSelectedTopicId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.subjectName}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estágio do Ciclo</label>
                  <select
                    value={selectedStage}
                    onChange={e => setSelectedStage(e.target.value as RevisionStage)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="D+1">D+1 (24 horas após teoria)</option>
                    <option value="D+7">D+7 (1 semana após)</option>
                    <option value="D+15">D+15 (15 dias após)</option>
                    <option value="D+30">D+30 (1 mês após)</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Qtd. Questões de Fixação</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={suggestedQs}
                    onChange={e => setSuggestedQs(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xs"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-component for individual Revision Card
interface RevisionCardProps {
  revision: RevisionItem;
  isOverdue?: boolean;
  onStartFocus: () => void;
  onComplete: () => void;
  onPostpone: () => void;
}

const RevisionCard: React.FC<RevisionCardProps> = ({
  revision,
  isOverdue,
  onStartFocus,
  onComplete,
  onPostpone,
}) => {
  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3.5 ${
        revision.completed
          ? 'bg-emerald-50/40 border-emerald-200 opacity-70'
          : isOverdue
          ? 'bg-rose-50/60 border-rose-300 shadow-2xs'
          : 'bg-white border-purple-200/90 hover:border-purple-400 shadow-2xs'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-900 font-mono text-xs font-black">
              {revision.revisionStage}
            </span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
              {revision.subjectName}
            </span>
          </div>

          <span className={`text-xs font-mono font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
            {isOverdue ? `Atrasada (${revision.dueDate})` : `Vence: ${revision.dueDate}`}
          </span>
        </div>

        <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
          {revision.topicName}
        </h3>

        <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5">
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
            Meta: <strong>{revision.suggestedQuestions} questões</strong>
          </span>
          <PriorityBadge priority={revision.priority} />
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {!revision.completed ? (
          <>
            <button
              onClick={onStartFocus}
              className="flex-1 min-h-[42px] px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Iniciar cronômetro de revisão"
            >
              <Clock className="w-4 h-4" />
              INICIAR CRONÔMETRO
            </button>

            <button
              onClick={onComplete}
              className="min-h-[42px] px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Concluir revisão e avançar estágio"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden xs:inline">Concluir</span>
            </button>

            <button
              onClick={onPostpone}
              className="min-h-[42px] px-2.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 font-medium text-xs transition-colors cursor-pointer"
              title="Adiar para amanhã"
            >
              +1d
            </button>
          </>
        ) : (
          <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-800 bg-emerald-100/70 rounded-xl border border-emerald-200">
            ✓ Revisão concluída!
          </div>
        )}
      </div>
    </div>
  );
};
