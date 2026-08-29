import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { ErrorReason, ExamTarget, QuestionRecord } from '../../types';
import { 
  CheckSquare, 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  BarChart2, 
  PieChart, 
  X, 
  Sparkles, 
  Target, 
  BookOpen 
} from 'lucide-react';

export const QuestoesView: React.FC = () => {
  const { 
    questionRecords, 
    addQuestionRecord, 
    topics, 
    totalQuestionsSolved, 
    overallAccuracy 
  } = useStudy();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || '');
  const [banca, setBanca] = useState('Fundação Cesgranrio');
  const [targetExam, setTargetExam] = useState<ExamTarget>('ambos');
  const [totalQuestions, setTotalQuestions] = useState<number>(20);
  const [correctAnswers, setCorrectAnswers] = useState<number>(16);
  const [timeMinutes, setTimeMinutes] = useState<number>(30);
  const [errorReason, setErrorReason] = useState<ErrorReason>('atencao_pegadinha');
  const [notes, setNotes] = useState('');

  const calculatedErrors = Math.max(0, totalQuestions - correctAnswers);
  const calculatedPct = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = topics.find(t => t.id === selectedTopicId);
    if (!topic) return;

    addQuestionRecord({
      date: '2026-08-29',
      topicId: topic.id,
      topicName: topic.name,
      subjectName: topic.subjectName,
      targetExam,
      banca,
      totalQuestions: Number(totalQuestions),
      correctAnswers: Number(correctAnswers),
      timeSpentMinutes: Number(timeMinutes),
      mainErrorReason: calculatedErrors > 0 ? errorReason : undefined,
      notes: notes.trim() || undefined,
    });

    setIsModalOpen(false);
    setNotes('');
  };

  // Calculate error diagnosis distribution
  const errorMap: Record<string, number> = {
    falta_teoria: 0,
    atencao_pegadinha: 0,
    calculo_formula: 0,
    falta_tempo: 0,
    interpretacao: 0,
  };

  questionRecords.forEach(r => {
    if (r.mainErrorReason && errorMap[r.mainErrorReason] !== undefined) {
      errorMap[r.mainErrorReason] += (r.totalQuestions - r.correctAnswers);
    }
  });

  const errorLabels: Record<string, { label: string; desc: string; color: string }> = {
    atencao_pegadinha: { label: 'Atenção / Pegadinhas Cesgranrio', desc: 'Leitura rápida ou desatenção em enunciados capciosos', color: 'bg-amber-500' },
    falta_teoria: { label: 'Lacuna Teórica / Conceitual', desc: 'Conteúdo esquecido ou não aprofundado no edital', color: 'bg-rose-500' },
    calculo_formula: { label: 'Erro de Cálculo / Fórmula', desc: 'Conversão de unidades (bar, Pa, m³/h) ou álgebra', color: 'bg-purple-500' },
    interpretacao: { label: 'Interpretação do Enunciado', desc: 'Dificuldade de extrair as variáveis do texto', color: 'bg-blue-500' },
    falta_tempo: { label: 'Gestão de Tempo na Prova', desc: 'Mais de 3 minutos gastos na mesma questão', color: 'bg-slate-500' },
  };

  const totalErrorsAcrossAll = questionRecords.reduce((acc, r) => acc + (r.totalQuestions - r.correctAnswers), 0);

  return (
    <div id="view-questoes" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-[#4D320A] to-[#123B5D] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              Treino de Alta Performance
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Foco: Cesgranrio Petrobras & Transpetro
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Banco de Questões & Registro de Erros
          </h1>
          <p className="text-slate-200 text-sm max-w-2xl mt-0.5">
            Monitore o percentual de acertos e identifique a causa raiz de cada erro para blindar sua pontuação.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Registrar Sessão de Questões
        </button>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Resolvidas</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
            {totalQuestionsSolved}
          </div>
          <span className="text-[11px] text-slate-700 font-medium">questões de fixação</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Taxa Geral de Acertos</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-800 mt-1">
            {overallAccuracy}%
          </div>
          <span className="text-[11px] text-slate-700 font-medium">Meta para corte: &gt;80%</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total de Erros</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-700 mt-1">
            {totalErrorsAcrossAll}
          </div>
          <span className="text-[11px] text-slate-700 font-medium">oportunidades de aprendizado</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Banca Principal</span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">
            Cesgranrio
          </div>
          <span className="text-[11px] text-teal-800 font-semibold">Perfil técnico e direto</span>
        </div>
      </div>

      {/* Main Grid: Error Diagnosis & Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Error Reason Diagnosis Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Diagnóstico de Causa dos Erros
                </h3>
                <span className="text-xs text-slate-500">Por que você erra nas questões?</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(errorLabels).map(([key, item]) => {
              const count = errorMap[key] || 0;
              const pct = totalErrorsAcrossAll > 0 ? Math.round((count / totalErrorsAcrossAll) * 100) : 0;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.label}</span>
                    <span className="font-mono text-slate-600 font-bold">
                      {count} erros ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${Math.max(3, pct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            💡 <strong>Dica Cesgranrio:</strong> A maior fonte de erros em provas da Petrobras são <em>pegadinhas de conversão de unidades</em> e interpretação de esquemas de tubulação.
          </div>
        </div>

        {/* History of Question Sessions (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-500" />
              Histórico de Sessões Realizadas
            </h3>
            <span className="text-xs text-slate-500">{questionRecords.length} registros</span>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {questionRecords.map(rec => {
              const pct = Math.round((rec.correctAnswers / rec.totalQuestions) * 100);
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all space-y-2 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">{rec.date} • {rec.banca}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{rec.topicName}</h4>
                      <span className="text-xs text-slate-500">{rec.subjectName}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-amber-800">
                        {rec.correctAnswers}/{rec.totalQuestions} ({pct}%)
                      </div>
                      <span className="text-[11px] text-slate-700 font-mono">
                        {rec.timeSpentMinutes} minutos
                      </span>
                    </div>
                  </div>

                  {rec.mainErrorReason && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Motivo principal do erro:</span>
                      <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px]">
                        {errorLabels[rec.mainErrorReason]?.label || rec.mainErrorReason}
                      </span>
                    </div>
                  )}

                  {rec.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-100">
                      &quot;{rec.notes}&quot;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal: Registrar Sessão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                Registrar Nova Sessão de Questões
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tópico Estudado</label>
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
                  <label className="font-bold text-slate-700 block mb-1">Banca</label>
                  <input
                    type="text"
                    value={banca}
                    onChange={e => setBanca(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Foco de Prova</label>
                  <select
                    value={targetExam}
                    onChange={e => setTargetExam(e.target.value as ExamTarget)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="ambos">Ambas (Geral)</option>
                    <option value="transpetro">Transpetro</option>
                    <option value="petrobras">Petrobras</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total de Questões</label>
                  <input
                    type="number"
                    min={1}
                    value={totalQuestions}
                    onChange={e => setTotalQuestions(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Acertos</label>
                  <input
                    type="number"
                    min={0}
                    max={totalQuestions}
                    value={correctAnswers}
                    onChange={e => setCorrectAnswers(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tempo (minutos)</label>
                  <input
                    type="number"
                    min={1}
                    value={timeMinutes}
                    onChange={e => setTimeMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Calculated accuracy feedback */}
              <div className="p-3 rounded-xl bg-slate-100 flex items-center justify-between text-xs font-bold">
                <span>Percentual Calculado:</span>
                <span className="font-mono text-amber-800 text-sm">{calculatedPct}% ({calculatedErrors} erros)</span>
              </div>

              {calculatedErrors > 0 && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Motivo Principal dos {calculatedErrors} Erros
                  </label>
                  <select
                    value={errorReason}
                    onChange={e => setErrorReason(e.target.value as ErrorReason)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="atencao_pegadinha">Atenção / Pegadinha no enunciado</option>
                    <option value="falta_teoria">Falta de teoria / conceito esquecido</option>
                    <option value="calculo_formula">Erro de cálculo / fórmula matemática</option>
                    <option value="interpretacao">Interpretação do texto da questão</option>
                    <option value="falta_tempo">Falta de tempo / correria</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Anotações / Aprendizado</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pegadinha típica da Cesgranrio sobre cavitação na sucção vs recalque..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-xs"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
