import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { ExamBadge, PriorityBadge } from '../common/Badge';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Award, 
  CheckSquare, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles 
} from 'lucide-react';

export const DesempenhoView: React.FC = () => {
  const {
    topics,
    revisions,
    questionRecords,
    totalStudyHours,
    totalQuestionsSolved,
    overallAccuracy,
    overallProgressPercentage,
    setActiveTab,
  } = useStudy();

  // Dynamic retention index (starts at 0% when no revisions are completed)
  const completedRevisionsCount = revisions.filter(r => r.completed || r.status === 'concluida').length;
  const retentionIndex = revisions.length > 0
    ? Math.round((completedRevisionsCount / revisions.length) * 100)
    : 0;

  // Calculate stats by subject
  const subjectStats: Record<string, {
    name: string;
    totalTopics: number;
    completedTopics: number;
    questionsDone: number;
    questionsCorrect: number;
  }> = {};

  topics.forEach(t => {
    if (!subjectStats[t.subjectName]) {
      subjectStats[t.subjectName] = {
        name: t.subjectName,
        totalTopics: 0,
        completedTopics: 0,
        questionsDone: 0,
        questionsCorrect: 0,
      };
    }
    subjectStats[t.subjectName].totalTopics += 1;
    if (t.status === 'estudado' || t.status === 'revisado' || t.status === 'dominado') {
      subjectStats[t.subjectName].completedTopics += 1;
    }
    subjectStats[t.subjectName].questionsDone += t.questionsDone;
    subjectStats[t.subjectName].questionsCorrect += t.questionsCorrect;
  });

  const subjectList = Object.values(subjectStats).map(s => {
    const accuracy = s.questionsDone > 0 ? Math.round((s.questionsCorrect / s.questionsDone) * 100) : 0;
    const progress = s.totalTopics > 0 ? Math.round((s.completedTopics / s.totalTopics) * 100) : 0;
    return { ...s, accuracy, progress };
  });

  // Strengths: Português + topics with high accuracy
  const strongTopics = [...topics]
    .filter(t => (t.questionsDone >= 10 && (t.questionsCorrect / t.questionsDone) >= 0.8) || (t.subjectId === 'portugues' && t.notes?.includes('PONTO FORTE')))
    .sort((a, b) => {
      const accA = a.questionsDone > 0 ? a.questionsCorrect / a.questionsDone : 1;
      const accB = b.questionsDone > 0 ? b.questionsCorrect / b.questionsDone : 1;
      return accB - accA;
    })
    .slice(0, 4);

  // Weaknesses: Topics with accuracy < 75% or critical priority pending
  const weakTopics = [...topics]
    .filter(t => (t.questionsDone >= 5 && (t.questionsCorrect / t.questionsDone) < 0.75) || (t.priority === 'critica' && t.status === 'nao_iniciado'))
    .slice(0, 4);

  return (
    <div id="view-desempenho" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0E3D2A] to-[#123B5D] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              ⚡ Sprint Pós-Edital
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Monitoramento Contínuo Cesgranrio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Painel de Desempenho & Evolução
          </h1>
          <p className="text-slate-200 text-sm max-w-2xl mt-0.5">
            Acompanhe métricas reais de retenção nos ciclos D+X, precisão em questões e cobertura integral do edital.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[200px] text-right">
          <span className="text-xs text-slate-300 block">Horas Acumuladas</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
            {totalStudyHours} horas
          </div>
          <span className="text-[11px] text-emerald-200 block mt-0.5">Estudo Líquido</span>
        </div>
      </div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Cobertura Geral do Edital</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-900">
            {overallProgressPercentage}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgressPercentage}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-700 font-medium block">
            {topics.filter(t => t.status === 'estudado' || t.status === 'revisado' || t.status === 'dominado').length} de {topics.length} tópicos cobertos
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Aproveitamento em Questões</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-800">
            {overallAccuracy}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallAccuracy}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-700 font-medium block">
            {totalQuestionsSolved} questões registradas
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Índice de Retenção (D+X)</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black font-mono text-purple-800">
            {retentionIndex}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${retentionIndex}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-700 font-medium block">
            {completedRevisionsCount > 0
              ? `${completedRevisionsCount} revisões espaçadas concluídas`
              : '0% (Aguardando conclusão dos primeiros ciclos D+X)'}
          </span>
        </div>

      </div>

      {/* Subject Performance Table & Progress Bars */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Desempenho Detalhado por Matéria
            </h3>
            <span className="text-xs text-slate-500">
              Taxa de acertos em questões e avanço do conteúdo programático
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="pb-3">Disciplina</th>
                <th className="pb-3 text-center">Progresso Teórico</th>
                <th className="pb-3 text-center">Questões Feitas</th>
                <th className="pb-3 text-center">Acertos</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectList.map(s => (
                <tr key={s.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold text-slate-900 pr-4">
                    {s.name}
                  </td>

                  <td className="py-3 text-center min-w-[150px]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-500 h-full rounded-full"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-700">{s.progress}%</span>
                    </div>
                  </td>

                  <td className="py-3 text-center font-mono font-semibold text-slate-700">
                    {s.questionsDone} Qs
                  </td>

                  <td className="py-3 text-center font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded-lg ${
                      s.accuracy >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.accuracy >= 65
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.accuracy}%
                    </span>
                  </td>

                  <td className="py-3 text-right font-bold">
                    {s.accuracy >= 80 ? (
                      <span className="text-emerald-600 flex items-center justify-end gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Forte
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center justify-end gap-1">
                        <ArrowDownRight className="w-3.5 h-3.5" /> Atenção
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strengths & Weaknesses Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PONTOS FORTES */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
            <h3 className="font-extrabold text-emerald-950 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Pontos Fortes (Tópicos Dominados)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              &gt;80% acertos
            </span>
          </div>

          <div className="space-y-2.5">
            {strongTopics.map(t => {
              const acc = Math.round((t.questionsCorrect / t.questionsDone) * 100);
              return (
                <div key={t.id} className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold block">{t.subjectName}</span>
                    <span className="font-bold text-slate-900 block">{t.name}</span>
                  </div>
                  <span className="font-mono text-emerald-700 font-black text-sm">
                    {acc}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PONTOS DE ATENÇÃO / FRACOS */}
        <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-100">
            <h3 className="font-extrabold text-rose-950 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Pontos de Atenção (Revisar com Urgência)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
              Prioridade Alta
            </span>
          </div>

          <div className="space-y-2.5">
            {weakTopics.map(t => (
              <div key={t.id} className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-800 font-bold block">{t.subjectName}</span>
                  <span className="font-bold text-slate-900 block">{t.name}</span>
                </div>
                <button
                  onClick={() => setActiveTab('revisoes')}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors"
                >
                  Agendar
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
