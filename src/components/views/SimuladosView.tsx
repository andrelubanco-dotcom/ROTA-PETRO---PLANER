import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { ExamBadge } from '../common/Badge';
import { ExamTarget, SimuladoRecord } from '../../types';
import { 
  FileSpreadsheet, 
  Plus, 
  Award, 
  Clock, 
  TrendingUp, 
  Target, 
  Calendar, 
  X, 
  CheckCircle2, 
  Sparkles,
  Edit3,
  Flame,
  AlertCircle
} from 'lucide-react';

export const SimuladosView: React.FC = () => {
  const { simulados, addSimuladoRecord, updateSimulado, setActiveTab } = useStudy();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSimuladoId, setEditingSimuladoId] = useState<string | null>(null);

  // Form State - Standardized to Cesgranrio (20 Basic + 40 Specific = 60 questions)
  const [title, setTitle] = useState('Simulado Diagnóstico 01 (Transpetro / Petrobras - Ênfase 4)');
  const [targetExam, setTargetExam] = useState<ExamTarget>('ambos');
  const [dateStr, setDateStr] = useState('2026-09-12');
  const [basicScore, setBasicScore] = useState<number>(0);
  const [basicTotal, setBasicTotal] = useState<number>(20);
  const [specificScore, setSpecificScore] = useState<number>(0);
  const [specificTotal, setSpecificTotal] = useState<number>(40);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const finalScore = basicScore + specificScore;
  const maxScore = basicTotal + specificTotal;
  const pct = maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 0;

  const completedSimulados = simulados.filter(
    s => s.status === 'concluido' || s.completed === true || ((s.timeSpentMinutes || 0) > 0 && (s.finalScore || 0) > 0)
  );

  const highestScore = completedSimulados.length > 0
    ? Math.max(...completedSimulados.map(s => s.finalScore || 0))
    : 0;

  const avgAccuracy = completedSimulados.length > 0
    ? Math.round(
        completedSimulados.reduce((a, s) => a + ((s.finalScore || 0) / (s.maxScore || 60)) * 100, 0) /
          completedSimulados.length
      )
    : 0;

  const avgTimeMinutes = completedSimulados.length > 0
    ? Math.round(
        completedSimulados.reduce((a, s) => a + (s.timeSpentMinutes || 0), 0) /
          completedSimulados.length
      )
    : 0;

  const avgTimeDisplay = avgTimeMinutes > 0
    ? `${Math.floor(avgTimeMinutes / 60)}h ${(avgTimeMinutes % 60).toString().padStart(2, '0')}m`
    : '0h 00m';

  const openNewModal = () => {
    setEditingSimuladoId(null);
    setTitle(`Simulado Geral 0${simulados.length + 1} — Cesgranrio`);
    setTargetExam('ambos');
    setDateStr('2026-09-12');
    setBasicScore(0);
    setBasicTotal(20);
    setSpecificScore(0);
    setSpecificTotal(40);
    setTimeSpent(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sim: SimuladoRecord) => {
    setEditingSimuladoId(sim.id);
    setTitle(sim.title);
    setTargetExam(sim.targetExam);
    setDateStr(sim.date);
    setBasicScore(sim.basicScore || 0);
    setBasicTotal(sim.basicTotal || 20);
    setSpecificScore(sim.specificScore || 0);
    setSpecificTotal(sim.specificTotal || 40);
    setTimeSpent(sim.timeSpentMinutes || 0);
    setNotes(sim.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveSimulado = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSimuladoId) {
      updateSimulado(editingSimuladoId, {
        title,
        targetExam,
        date: dateStr,
        basicScore: Number(basicScore),
        basicTotal: Number(basicTotal),
        specificScore: Number(specificScore),
        specificTotal: Number(specificTotal),
        finalScore,
        maxScore,
        totalQuestions: maxScore,
        scorePercentage: pct,
        timeSpentMinutes: Number(timeSpent),
        status: finalScore > 0 || timeSpent > 0 ? 'concluido' : 'pendente',
        completed: finalScore > 0 || timeSpent > 0,
        notes: notes.trim() || undefined,
      });
    } else {
      addSimuladoRecord({
        title,
        targetExam,
        date: dateStr,
        basicScore: Number(basicScore),
        basicTotal: Number(basicTotal),
        specificScore: Number(specificScore),
        specificTotal: Number(specificTotal),
        finalScore,
        maxScore,
        totalQuestions: maxScore,
        timeSpentMinutes: Number(timeSpent),
        status: finalScore > 0 || timeSpent > 0 ? 'concluido' : 'pendente',
        completed: finalScore > 0 || timeSpent > 0,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div id="view-simulados" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-950 via-[#4A200B] to-[#123B5D] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
              ⚡ Sprint Pós-Edital
            </span>
            <span className="text-xs text-slate-300 font-mono">
              60 Questões (20 Básicos + 40 Específicos)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Simulados & Desempenho Global
          </h1>
          <p className="text-slate-200 text-sm max-w-2xl mt-0.5">
            Cronograma quinzenal com 6 simulados programados no formato exato da Fundação Cesgranrio (limite de 4 horas).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('google_workspace')}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
            title="Sincronizar com Google Agenda e Planilhas"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Sincronizar Google Workspace
          </button>

          <button
            id="btn-add-simulado"
            onClick={openNewModal}
            className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Registrar Novo Simulado
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Simulados Feitos</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
            {completedSimulados.length}
          </div>
          <span className="text-[11px] text-slate-700 font-medium">de 6 programados</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Melhor Nota Líquida</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-orange-700 mt-1">
            {highestScore} <span className="text-sm font-normal text-slate-500">/ 60 pts</span>
          </div>
          <span className="text-[11px] text-slate-700 font-medium">Meta de corte: ~45-48 pts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Média de Acertos</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-1">
            {avgAccuracy}%
          </div>
          <span className="text-[11px] text-slate-700 font-medium">
            {completedSimulados.length > 0 ? 'Consistência aferida' : 'Aguardando 1º simulado'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Tempo Médio / Prova</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-blue-700 mt-1">
            {avgTimeDisplay}
          </div>
          <span className="text-[11px] text-slate-700 font-medium">Limite oficial: 4h (Cesgranrio)</span>
        </div>

      </div>

      {/* List of 6 Simulados & Performance Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-orange-600" />
              Cronograma de 6 Simulados (Pós-Edital)
            </h2>
            <span className="text-xs text-slate-500">
              Estrutura oficial: 20 Questões de Conhecimentos Básicos + 40 Questões de Conhecimentos Específicos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {simulados.map((sim, index) => {
            const isDone = sim.status === 'concluido' || sim.completed === true || ((sim.timeSpentMinutes || 0) > 0 && (sim.finalScore || 0) > 0);
            const scorePct = sim.maxScore ? Math.round(((sim.finalScore || 0) / sim.maxScore) * 100) : 0;
            const basicPct = sim.basicTotal ? Math.round(((sim.basicScore || 0) / sim.basicTotal) * 100) : 0;
            const specPct = sim.specificTotal ? Math.round(((sim.specificScore || 0) / sim.specificTotal) * 100) : 0;

            return (
              <div
                key={sim.id}
                className={`bg-white rounded-3xl p-6 border shadow-xs space-y-4 transition-all flex flex-col justify-between ${
                  isDone 
                    ? 'border-emerald-300 ring-1 ring-emerald-200' 
                    : 'border-slate-200 hover:border-orange-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ExamBadge target={sim.targetExam} />
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {sim.date}
                      </span>
                      {isDone ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Realizado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          🕒 Programado
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {sim.title}
                    </h3>
                  </div>

                  {/* Dual Blocks: Básico vs Específico */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-1">
                      <span className="font-bold text-blue-900 block">Conhec. Básicos</span>
                      <div className="font-mono font-bold text-blue-800 text-sm">
                        {sim.basicScore || 0}/{sim.basicTotal || 20} ({basicPct}%)
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs space-y-1">
                      <span className="font-bold text-teal-900 block">Conhec. Específicos</span>
                      <div className="font-mono font-bold text-teal-800 text-sm">
                        {sim.specificScore || 0}/{sim.specificTotal || 40} ({specPct}%)
                      </div>
                    </div>
                  </div>

                  {/* Notes / Learnings */}
                  {sim.notes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      💡 {sim.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Bar: Total Score, Tempo, & Quick Launch Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {Math.floor((sim.timeSpentMinutes || 0) / 60)}h{' '}
                      {((sim.timeSpentMinutes || 0) % 60).toString().padStart(2, '0')}m
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(sim)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isDone
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-xs'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isDone ? 'Editar Nota' : 'Lançar Resultado'}
                    </button>

                    <div className="text-right">
                      <span className="font-black font-mono text-orange-700 text-lg">
                        {sim.finalScore || 0}/{sim.maxScore || 60}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-bold">({scorePct}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Registrar / Editar Simulado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingSimuladoId ? 'Lançar / Atualizar Simulado' : 'Registrar Novo Simulado'}
                </h3>
                <span className="text-xs text-slate-500">
                  Estrutura Cesgranrio: 20 Conhec. Básicos + 40 Conhec. Específicos (Total: 60)
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSimulado} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título do Simulado</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Concurso Foco</label>
                  <select
                    value={targetExam}
                    onChange={e => setTargetExam(e.target.value as ExamTarget)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="transpetro">Transpetro — Dutos e Terminais</option>
                    <option value="petrobras">Petrobras — Técnico de Operações</option>
                    <option value="ambos">Ambos / Geral Cesgranrio</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Data de Realização</label>
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={e => setDateStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Básico: 20 Questões */}
              <div className="grid grid-cols-2 gap-3 bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                <div>
                  <label className="font-bold text-blue-950 block mb-1">Acertos Conhec. Básicos</label>
                  <input
                    type="number"
                    min={0}
                    max={basicTotal}
                    value={basicScore}
                    onChange={e => setBasicScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-blue-900 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-blue-950 block mb-1">Total Conhec. Básicos</label>
                  <input
                    type="number"
                    min={1}
                    value={basicTotal}
                    onChange={e => setBasicTotal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-slate-100"
                  />
                </div>
              </div>

              {/* Específico: 40 Questões */}
              <div className="grid grid-cols-2 gap-3 bg-teal-50/60 p-3 rounded-2xl border border-teal-100">
                <div>
                  <label className="font-bold text-teal-950 block mb-1">Acertos Conhec. Específicos</label>
                  <input
                    type="number"
                    min={0}
                    max={specificTotal}
                    value={specificScore}
                    onChange={e => setSpecificScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-teal-900 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-teal-950 block mb-1">Total Conhec. Específicos</label>
                  <input
                    type="number"
                    min={1}
                    value={specificTotal}
                    onChange={e => setSpecificTotal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tempo Total Gasto (minutos)</label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  placeholder="Ex: 210 (3h 30m)"
                  value={timeSpent}
                  onChange={e => setTimeSpent(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Tempo formatado: {Math.floor(timeSpent / 60)}h {(timeSpent % 60).toString().padStart(2, '0')}m (Limite da prova: 4h = 240min)
                </span>
              </div>

              {/* Live Calculated total score */}
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-orange-950 block">Nota Total Calculada:</span>
                  <span className="text-[10px] text-orange-800">
                    {finalScore >= 45 ? '🔥 Excelente aproveitamento (Zona de corte)' : 'Meta Cesgranrio: ≥ 45 pts'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-orange-800 text-lg block">
                    {finalScore} de {maxScore} pts
                  </span>
                  <span className="text-xs font-bold text-orange-900">({pct}%)</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observações & Análise de Erros</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Faltou tempo para as 5 últimas de termodinâmica..."
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
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black shadow-xs"
                >
                  Salvar Resultado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
