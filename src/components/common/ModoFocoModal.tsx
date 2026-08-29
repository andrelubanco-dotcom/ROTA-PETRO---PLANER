import React, { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { PriorityBadge } from './Badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  Clock, 
  CheckSquare, 
  Sparkles, 
  Plus, 
  Calendar,
  Zap,
  Flame,
  Volume2,
  VolumeX,
  Layers
} from 'lucide-react';
import { playTimerBell, playSuccessChime } from '../../utils/audio';

export const ModoFocoModal: React.FC = () => {
  const { focusTask, isFocusModalOpen, closeFocusMode, completeTask, postponeTask, toggleChecklistItem, settings } = useStudy();

  const [timerMode, setTimerMode] = useState<'pomodoro' | 'cronometro'>('pomodoro');
  const [totalPlannedSeconds, setTotalPlannedSeconds] = useState<number>(30 * 60);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(30 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Set initial duration from task when opened
  useEffect(() => {
    if (focusTask) {
      const minutes = focusTask.suggestedDurationMinutes || 30;
      setTotalPlannedSeconds(minutes * 60);
      setTimeLeftSeconds(minutes * 60);
      setStopwatchSeconds(0);
      setIsRunning(false);
    }
  }, [focusTask]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (timerMode === 'pomodoro') {
          setTimeLeftSeconds(prev => {
            if (prev <= 1) {
              setIsRunning(false);
              playTimerBell(settings.soundEffects);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds(prev => prev + 1);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerMode, settings.soundEffects]);

  if (!isFocusModalOpen || !focusTask) return null;

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    completeTask(focusTask.id);
    closeFocusMode();
  };

  const handlePostpone = () => {
    postponeTask(focusTask.id);
    closeFocusMode();
  };

  const addMinutes = (mins: number) => {
    setTimeLeftSeconds(prev => prev + mins * 60);
    setTotalPlannedSeconds(prev => prev + mins * 60);
  };

  const setPresetMinutes = (mins: number) => {
    setIsRunning(false);
    setTotalPlannedSeconds(mins * 60);
    setTimeLeftSeconds(mins * 60);
  };

  const isRevision = focusTask.type === 'revisao' || focusTask.blockType === 'bloco1_revisao' || focusTask.title.toLowerCase().includes('revisão');
  const isHighlighted = focusTask.highlight || focusTask.title.includes('FLASHCARDS — MEGA IMPORTANTE');

  // Percentage progress for the timer
  const progressPct = totalPlannedSeconds > 0 
    ? Math.min(100, Math.max(0, Math.round(((totalPlannedSeconds - timeLeftSeconds) / totalPlannedSeconds) * 100)))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              isRevision ? 'bg-purple-500/20 text-purple-400' : 'bg-teal-500/20 text-teal-400'
            }`}>
              {isRevision ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest block ${
                isRevision ? 'text-purple-400' : 'text-teal-400'
              }`}>
                {isRevision ? 'CRONÔMETRO DE REVISÃO ESPAÇADA' : 'MODO FOCO DIÁRIO'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Sessão imersiva • Sem distrações
              </span>
            </div>
          </div>

          <button
            onClick={closeFocusMode}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Fechar cronômetro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Details & Mega Timer Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Main Task Title & Badges */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                {focusTask.subjectName}
              </span>
              <PriorityBadge priority={focusTask.priority} />
              {isHighlighted && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  MEGA IMPORTANTE
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
              {focusTask.title}
            </h2>

            {focusTask.subtopic && (
              <p className="text-xs text-slate-300 bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 font-medium inline-block">
                <strong className="text-teal-400">Foco:</strong> {focusTask.subtopic}
              </p>
            )}
          </div>

          {/* ========================================================================= */}
          {/* GIGANTIC TIMER DISPLAY */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-b from-slate-950 to-slate-900/90 rounded-3xl p-5 sm:p-8 text-center text-white space-y-5 shadow-2xl border border-slate-800 relative overflow-hidden">
            
            {/* Mode Switcher */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setTimerMode('pomodoro');
                  setIsRunning(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  timerMode === 'pomodoro'
                    ? 'bg-teal-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Regressivo (Foco)
              </button>
              <button
                onClick={() => {
                  setTimerMode('cronometro');
                  setIsRunning(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  timerMode === 'cronometro'
                    ? 'bg-teal-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Cronômetro Livre
              </button>
            </div>

            {/* Quick Presets (15m, 25m, 30m, 50m, 60m) */}
            {timerMode === 'pomodoro' && (
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {[15, 25, 30, 50, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setPresetMinutes(mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                      totalPlannedSeconds === mins * 60
                        ? 'bg-teal-400/20 text-teal-300 border border-teal-400/40'
                        : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}

            {/* Extra Large Digital Display */}
            <div className="py-2 sm:py-4">
              <div className="font-mono text-6xl xs:text-7xl sm:text-8xl md:text-9xl font-black tracking-tight text-teal-400 select-none drop-shadow-[0_0_25px_rgba(45,212,191,0.25)]">
                {timerMode === 'pomodoro' ? formatTime(timeLeftSeconds) : formatTime(stopwatchSeconds)}
              </div>
              
              {/* Status pill under digits */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  isRunning 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  {isRunning ? 'Em Andamento' : 'Pausado'}
                </span>

                {timerMode === 'pomodoro' && (
                  <span className="text-xs font-mono text-slate-400">
                    {progressPct}% concluído
                  </span>
                )}
              </div>

              {/* Linear Progress Bar */}
              {timerMode === 'pomodoro' && (
                <div className="w-full max-w-md mx-auto bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}
            </div>

            {/* Giant Main Play/Pause Button & Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 sm:px-12 py-4 sm:py-4.5 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-xl active:scale-95 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-400/20'
                    : 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-teal-400/25'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-6 h-6 fill-current" />
                    PAUSAR
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current" />
                    INICIAR
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  if (timerMode === 'pomodoro') {
                    setTimeLeftSeconds(totalPlannedSeconds);
                  } else {
                    setStopwatchSeconds(0);
                  }
                }}
                className="p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                title="Reiniciar tempo"
              >
                <RotateCcw className="w-6 h-6" />
              </button>

              {timerMode === 'pomodoro' && (
                <button
                  onClick={() => addMinutes(5)}
                  className="px-4 py-4 rounded-2xl bg-slate-800 text-teal-300 hover:bg-slate-700 hover:text-teal-200 font-mono font-bold text-sm transition-colors cursor-pointer"
                  title="Adicionar +5 minutos"
                >
                  +5m
                </button>
              )}
            </div>
          </div>

          {/* Simple Checklist Block */}
          {focusTask.checklist && focusTask.checklist.length > 0 && (
            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-teal-400" />
                  Passos da Tarefa ({focusTask.checklist.filter(c => c.done).length}/{focusTask.checklist.length})
                </h3>
              </div>

              <div className="space-y-2">
                {focusTask.checklist.map(item => (
                  <label
                    key={item.id}
                    onClick={() => toggleChecklistItem(focusTask.id, item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      item.done
                        ? 'bg-slate-900/60 border-teal-500/30 text-slate-500 line-through'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-teal-500/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {}}
                      className="w-4 h-4 text-teal-500 rounded border-slate-700 focus:ring-teal-400 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-medium leading-tight select-none">
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handlePostpone}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            Adiar para amanhã
          </button>

          <button
            onClick={handleFinish}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            CONCLUIR TAREFA AGORA (+DOPAMINA)
          </button>
        </div>

      </div>
    </div>
  );
};

