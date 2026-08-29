import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { 
  Settings, 
  User, 
  Clock, 
  Calendar, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Save 
} from 'lucide-react';
import { playSuccessSound } from '../../utils/audio';

export const ConfiguracoesView: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useStudy();

  const [userName, setUserName] = useState(settings.userName);
  const [dailyHours, setDailyHours] = useState(settings.dailyStudyHoursAvailable);
  const [preferredShift, setPreferredShift] = useState(settings.preferredShift);
  const [examDateTranspetro, setExamDateTranspetro] = useState(settings.examDateTranspetro);
  const [examDatePetrobras, setExamDatePetrobras] = useState(settings.examDatePetrobras);
  const [tdahMode, setTdahMode] = useState(settings.tdahSimplifiedMode);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffects);
  const [confettiEnabled, setConfettiEnabled] = useState(settings.confettiEnabled);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName,
      dailyStudyHoursAvailable: Number(dailyHours),
      preferredShift,
      examDateTranspetro,
      examDatePetrobras,
      tdahSimplifiedMode: tdahMode,
      soundEffects,
      confettiEnabled,
    });

    if (soundEffects) {
      playSuccessSound(true);
    }

    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 4000);
  };

  const handleExportData = () => {
    const backup = {
      settings,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rota-petro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="view-configuracoes" className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#123B5D] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider">
              Preferências & Ajustes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Configurações do Planner
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Personalize suas horas de estudo diárias, datas de provas e recursos anti-distração.
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
          <Settings className="w-6 h-6" />
        </div>
      </div>

      {saveFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">Configurações salvas e sincronizadas com sucesso!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        {/* Profile and Daily Time */}
        <div className="space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            Perfil & Rotina Diária
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Seu Nome / Como quer ser chamado</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Horas Disponíveis por Dia</label>
              <input
                type="number"
                step={0.5}
                min={1}
                max={12}
                value={dailyHours}
                onChange={e => setDailyHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Turno Preferencial</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'manha', label: 'Manhã' },
                { id: 'tarde', label: 'Tarde' },
                { id: 'noite', label: 'Noite' },
                { id: 'misto', label: 'Misto / Flexível' },
              ].map(shift => (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => setPreferredShift(shift.id as any)}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                    preferredShift === shift.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {shift.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exam Dates */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-teal-600" />
            Datas das Provas (Contador Regressivo)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Data Prova TRANSPETRO (Dutos)</label>
              <input
                type="date"
                value={examDateTranspetro}
                onChange={e => setExamDateTranspetro(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Data Prova PETROBRAS (Operações)</label>
              <input
                type="date"
                value={examDatePetrobras}
                onChange={e => setExamDatePetrobras(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs"
              />
            </div>
          </div>
        </div>

        {/* TDAH & Sensory Enhancements */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Recursos Amigáveis para TDAH & Gamificação
          </h2>

          <div className="space-y-3">
            {/* TDAH Mode Toggle */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 border border-amber-200 cursor-pointer">
              <div className="pr-4">
                <span className="font-bold text-slate-900 text-sm block">
                  Exibir Banner &quot;Faça só isso agora&quot; no Dashboard
                </span>
                <span className="text-xs text-slate-500">
                  Mostra apenas a tarefa atual, a próxima na fila e 1 revisão urgente para evitar paralisia por análise.
                </span>
              </div>
              <input
                type="checkbox"
                checked={tdahMode}
                onChange={e => setTdahMode(e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
            </label>

            {/* Sound Chimes */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div className="pr-4">
                <span className="font-bold text-slate-900 text-sm block">
                  Sinos e Efeitos Sonoros de Conclusão (Dopamina Positiva)
                </span>
                <span className="text-xs text-slate-500">
                  Sons harmônicos gerados via Web Audio sintetizado ao concluir tarefas e pomodoros.
                </span>
              </div>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={e => setSoundEffects(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
            </label>

            {/* Confetti */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div className="pr-4">
                <span className="font-bold text-slate-900 text-sm block">
                  Chuva de Confetes Visual em Conquistas
                </span>
                <span className="text-xs text-slate-500">
                  Disparo leve de confetes ao finalizar tarefas prioritárias e simulados.
                </span>
              </div>
              <input
                type="checkbox"
                checked={confettiEnabled}
                onChange={e => setConfettiEnabled(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#0B1F3A] hover:bg-[#123B5D] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-teal-400" />
            Salvar Todas as Preferências
          </button>
        </div>

      </form>

      {/* Data Management & Backup */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          Gerenciamento & Backup de Dados
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-800 block text-sm">Backup do Plano de Estudos</span>
            <span className="text-slate-500">Baixe um arquivo JSON com todas as suas matérias, tarefas e questões.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportData}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Exportar JSON
            </button>

            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar os dados de demonstração iniciais da ROTA PETRO?')) {
                  resetAllData();
                }
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Resetar Dados
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
