import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { ExamBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { ExamTarget, PriorityLevel, Topic, TopicStatus } from '../../types';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  RotateCcw, 
  CheckSquare, 
  Flame, 
  Tag, 
  HelpCircle, 
  Sparkles 
} from 'lucide-react';

export const MateriasEditalView: React.FC = () => {
  const { topics, updateTopicStatus, updateTopicPriority, selectedExam, setSelectedExam } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrack, setFilterTrack] = useState<'todos' | 'comum' | 'transpetro' | 'petrobras'>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    'Língua Portuguesa': true,
    'Metrologia e Instrumentação': true,
    'Mecânica dos Fluidos e Dutos': true,
  });
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects(prev => ({ ...prev, [subjectName]: !prev[subjectName] }));
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const expandAll = () => {
    const allSubj: Record<string, boolean> = {};
    topics.forEach(t => {
      allSubj[t.subjectName] = true;
    });
    setExpandedSubjects(allSubj);
  };

  const collapseAll = () => {
    setExpandedSubjects({});
  };

  // Filter topics
  const filteredTopics = topics.filter(topic => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = topic.name.toLowerCase().includes(q);
      const matchSubj = topic.subjectName.toLowerCase().includes(q);
      const matchSubtopics = topic.subtopics.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchSubj && !matchSubtopics) return false;
    }

    // Track filter
    if (filterTrack === 'comum' && !topic.isCommon) return false;
    if (filterTrack === 'transpetro' && topic.examTarget !== 'transpetro' && !topic.isCommon) return false;
    if (filterTrack === 'petrobras' && topic.examTarget !== 'petrobras' && !topic.isCommon) return false;

    // Priority filter
    if (filterPriority !== 'todos' && topic.priority !== filterPriority) return false;

    // Status filter
    if (filterStatus !== 'todos' && topic.status !== filterStatus) return false;

    return true;
  });

  // Group by Block -> Subject
  const basicBlockTopics = filteredTopics.filter(t => t.block === 'Conhecimentos Básicos');
  const specificBlockTopics = filteredTopics.filter(t => t.block === 'Conhecimentos Específicos');

  const groupBySubject = (list: Topic[]) => {
    const map: Record<string, Topic[]> = {};
    list.forEach(t => {
      if (!map[t.subjectName]) map[t.subjectName] = [];
      map[t.subjectName].push(t);
    });
    return map;
  };

  const basicSubjectsMap = groupBySubject(basicBlockTopics);
  const specificSubjectsMap = groupBySubject(specificBlockTopics);

  const commonCount = topics.filter(t => t.isCommon).length;
  const transpetroExclusive = topics.filter(t => t.examTarget === 'transpetro' && !t.isCommon).length;
  const petrobrasExclusive = topics.filter(t => t.examTarget === 'petrobras' && !t.isCommon).length;

  return (
    <div id="view-materias-edital" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1F3A] via-[#123B5D] to-[#1E4E79] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
              Edital Verticalizado
            </span>
            <span className="text-xs text-slate-300 font-mono">
              {topics.length} Tópicos Mapeados
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Matérias & Conteúdo Programático
          </h1>
          <p className="text-slate-200 text-sm max-w-2xl mt-0.5">
            Organização hierárquica completa. Identifique os tópicos em comum para maximizar seu tempo nas duas provas.
          </p>
        </div>

        {/* Quick Common vs Exclusive Indicator */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[240px] space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-teal-300 font-bold">Em Comum (Ambos):</span>
            <span className="font-mono font-bold text-white">{commonCount} tópicos</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-300 font-bold">Exclusivos Transpetro:</span>
            <span className="font-mono font-bold text-white">{transpetroExclusive} tópicos</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-indigo-300 font-bold">Exclusivos Petrobras:</span>
            <span className="font-mono font-bold text-white">{petrobrasExclusive} tópicos</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por tópico, matéria, palavra-chave ou subtópico..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#123B5D] focus:border-[#123B5D] text-xs font-medium"
            />
          </div>

          {/* Quick Expand / Collapse Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Expandir Tudo
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Recolher Tudo
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-[#123B5D]" />
            <span>Trilha:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterTrack('todos')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterTrack === 'todos'
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos os Tópicos
            </button>
            <button
              onClick={() => setFilterTrack('comum')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterTrack === 'comum'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
            >
              ⚡ Em Comum (Transpetro + Petrobras)
            </button>
            <button
              onClick={() => setFilterTrack('transpetro')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterTrack === 'transpetro'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              Transpetro (Dutos)
            </button>
            <button
              onClick={() => setFilterTrack('petrobras')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterTrack === 'petrobras'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              Petrobras (Operação)
            </button>
          </div>

          {/* Priority filter */}
          <div className="ml-auto flex items-center gap-2">
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
            >
              <option value="todos">Prioridade: Todas</option>
              <option value="critica">Crítica (Vermelho)</option>
              <option value="alta">Alta (Âmbar)</option>
              <option value="media">Média (Azul)</option>
              <option value="baixa">Baixa (Cinza)</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
            >
              <option value="todos">Status: Todos</option>
              <option value="dominado">Dominado</option>
              <option value="revisado">Revisado</option>
              <option value="estudado">Estudado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="nao_iniciado">Não Iniciado</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BLOCO: CONHECIMENTOS BÁSICOS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
            CB
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
            BLOCO 1 — CONHECIMENTOS BÁSICOS (LÍNGUA PORTUGUESA E MATEMÁTICA)
          </h2>
        </div>

        <div className="space-y-3">
          {Object.entries(basicSubjectsMap).map(([subjectName, subjectTopics]) => {
            const isExpanded = !!expandedSubjects[subjectName];
            const studied = subjectTopics.filter(t => t.status === 'estudado' || t.status === 'revisado' || t.status === 'dominado').length;

            return (
              <div key={subjectName} className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                <button
                  onClick={() => toggleSubject(subjectName)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#123B5D]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {subjectName}
                        </h3>
                        {subjectName === 'Língua Portuguesa' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            ⭐ Ponto Forte do Usuário
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {subjectTopics.length} tópicos programados {subjectName === 'Língua Portuguesa' ? '• Alta proficiência: foco em manutenção ágil e pegadinhas Cesgranrio' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      {studied}/{subjectTopics.length} dominados
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 sm:p-5 divide-y divide-slate-100 space-y-3">
                    {subjectTopics.map(topic => (
                      <TopicItem
                        key={topic.id}
                        topic={topic}
                        isExpanded={!!expandedTopics[topic.id]}
                        onToggle={() => toggleTopic(topic.id)}
                        onUpdateStatus={status => updateTopicStatus(topic.id, status)}
                        onUpdatePriority={prio => updateTopicPriority(topic.id, prio)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BLOCO: CONHECIMENTOS ESPECÍFICOS / OPERAÇÃO */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center font-black text-xs">
            CE
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
            BLOCO 2 — CONHECIMENTOS ESPECÍFICOS & OPERAÇÃO INDUSTRIAL
          </h2>
        </div>

        <div className="space-y-3">
          {Object.entries(specificSubjectsMap).map(([subjectName, subjectTopics]) => {
            const isExpanded = !!expandedSubjects[subjectName];
            const studied = subjectTopics.filter(t => t.status === 'estudado' || t.status === 'revisado' || t.status === 'dominado').length;

            return (
              <div key={subjectName} className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                <button
                  onClick={() => toggleSubject(subjectName)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#123B5D]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {subjectName}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {subjectTopics.length} tópicos de edital
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      {studied}/{subjectTopics.length} dominados
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 sm:p-5 divide-y divide-slate-100 space-y-3">
                    {subjectTopics.map(topic => (
                      <TopicItem
                        key={topic.id}
                        topic={topic}
                        isExpanded={!!expandedTopics[topic.id]}
                        onToggle={() => toggleTopic(topic.id)}
                        onUpdateStatus={status => updateTopicStatus(topic.id, status)}
                        onUpdatePriority={prio => updateTopicPriority(topic.id, prio)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// Sub-component for individual detailed Topic Item
interface TopicItemProps {
  topic: Topic;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (status: TopicStatus) => void;
  onUpdatePriority: (prio: PriorityLevel) => void;
}

const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  isExpanded,
  onToggle,
  onUpdateStatus,
  onUpdatePriority,
}) => {
  const accuracy =
    topic.questionsDone > 0
      ? Math.round((topic.questionsCorrect / topic.questionsDone) * 100)
      : 0;

  return (
    <div className="pt-3 first:pt-0 space-y-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Left: Code, Name, Badges */}
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {topic.code}
            </span>
            <ExamBadge target={topic.examTarget} isCommon={topic.isCommon} />
            <PriorityBadge priority={topic.priority} />
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              topic.difficulty === 'facil'
                ? 'bg-emerald-50 text-emerald-700'
                : topic.difficulty === 'media'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-rose-50 text-rose-700'
            }`}>
              Dificuldade: {topic.difficulty}
            </span>
            {topic.subjectId === 'portugues' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                ⭐ Ponto Forte
              </span>
            )}
          </div>

          <h4
            onClick={onToggle}
            className="font-bold text-slate-900 text-sm hover:text-[#123B5D] cursor-pointer flex items-center gap-1.5"
          >
            {topic.name}
            <span className="text-xs text-slate-400 font-normal">
              ({isExpanded ? 'recolher detalhes' : 'ver subtópicos e filtro'})
            </span>
          </h4>
        </div>

        {/* Right: Interactive Status Dropdown & Performance Pills */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          
          {/* Question accuracy pill */}
          <span className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
            {topic.questionsDone} Qs • <strong className="text-amber-800">{accuracy}% acertos</strong>
          </span>

          {/* Revision count pill */}
          <span className="text-xs font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-xl">
            {topic.revisionCount} revisões ({topic.currentRevisionStage || 'D+1'})
          </span>

          {/* Interactive Status Changer */}
          <select
            value={topic.status}
            onChange={e => onUpdateStatus(e.target.value as TopicStatus)}
            className="text-xs font-bold p-1.5 rounded-xl border border-slate-300 bg-white cursor-pointer"
          >
            <option value="nao_iniciado">Não Iniciado</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="estudado">Estudado</option>
            <option value="revisado">Revisado</option>
            <option value="dominado">Dominado</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>
      </div>

      {/* Expanded Details: Subtopics & Recommended Cesgranrio Filter */}
      {isExpanded && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs mt-2 animate-fadeIn">
          
          {/* Subtopics Checklist */}
          <div>
            <span className="font-bold text-slate-900 block mb-1.5">
              📌 Subtópicos contemplados no edital:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1">
              {topic.subtopics.map((sub, idx) => (
                <li key={idx}>{sub}</li>
              ))}
            </ul>
          </div>

          {/* Cesgranrio Filter Model */}
          {topic.suggestedCesgranrioFilter && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Filtro Sugerido para Questões (Cesgranrio / QConcursos):
              </span>
              <div className="font-mono text-[11px] text-amber-900 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                <div><strong>BANCA:</strong> {topic.suggestedCesgranrioFilter.banca}</div>
                <div><strong>ÓRGÃO:</strong> {topic.suggestedCesgranrioFilter.orgao}</div>
                <div><strong>ASSUNTO:</strong> {topic.suggestedCesgranrioFilter.assunto}</div>
                <div><strong>NÍVEL:</strong> {topic.suggestedCesgranrioFilter.nivel}</div>
              </div>
              <p className="text-[11px] text-amber-800 pt-1 italic">
                💡 <strong>Dica Estratégica:</strong> {topic.suggestedCesgranrioFilter.dicaFiltro}
              </p>
            </div>
          )}

          {/* Quick Topic Notes */}
          {topic.notes && (
            <div className="text-slate-600 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
              📝 <strong>Anotações pessoais:</strong> {topic.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
