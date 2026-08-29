import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { ExamTarget } from '../../types';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  Bell, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal,
  Database,
  LogIn,
  LogOut,
  ShieldCheck,
  Crown,
  CreditCard
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    selectedExam, 
    setSelectedExam, 
    settings, 
    updateSettings, 
    todayTasks, 
    overdueTasks,
    overdueRevisions,
    setActiveTab,
    openFocusMode,
    tasks,
    supabaseState
  } = useStudy();

  const { user, login, logout, isAuthenticating } = useAuth();

  // Calculate days remaining to exams based on current simulation date 2026-08-29
  const currentDate = new Date('2026-08-29T00:00:00');
  
  const transpetroDate = new Date(`${settings.examDateTranspetro}T00:00:00`);
  const diffTranspetroMs = transpetroDate.getTime() - currentDate.getTime();
  const daysTranspetro = Math.max(0, Math.ceil(diffTranspetroMs / (1000 * 60 * 60 * 24)));

  const petrobrasDate = new Date(`${settings.examDatePetrobras}T00:00:00`);
  const diffPetrobrasMs = petrobrasDate.getTime() - currentDate.getTime();
  const daysPetrobras = Math.max(0, Math.ceil(diffPetrobrasMs / (1000 * 60 * 60 * 24)));

  const completedTodayCount = todayTasks.filter(t => t.status === 'concluido').length;
  const totalTodayCount = todayTasks.length;
  const progressTodayPct = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  const firstPendingTask = todayTasks.find(t => t.status === 'pendente') || tasks[0];

  return (
    <header id="app-main-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-3 transition-all shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 max-w-7xl mx-auto">
        
        {/* Brand & Filter Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B1F3A] to-[#2563EB] flex items-center justify-center text-white shadow-sm font-black text-lg tracking-wider">
              RP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-base lg:text-lg tracking-tight flex items-center gap-1.5">
                  ROTA PETRO
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Planner
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-700 hidden sm:block">
                Transpetro (Dutos) & Petrobras (Técnico de Operações)
              </p>
            </div>
          </div>

          {/* Exam Target Selector Tabs */}
          <div className="ml-2 hidden lg:flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="filter-exam-ambos"
              onClick={() => setSelectedExam('ambos')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedExam === 'ambos'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-800 hover:text-slate-900'
              }`}
            >
              Trilha Unificada (Ambos)
            </button>
            <button
              id="filter-exam-transpetro"
              onClick={() => setSelectedExam('transpetro')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedExam === 'transpetro'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-800 hover:text-blue-700'
              }`}
            >
              Transpetro
            </button>
            <button
              id="filter-exam-petrobras"
              onClick={() => setSelectedExam('petrobras')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedExam === 'petrobras'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-800 hover:text-indigo-700'
              }`}
            >
              Petrobras
            </button>
          </div>
        </div>

        {/* Right Controls: Countdowns, TDAH Mode, Focus Trigger, Audio */}
        <div className="flex items-center flex-wrap gap-2 md:gap-3 justify-between md:justify-end">
          
          {/* Exam Countdown Badges */}
          <div className="flex items-center gap-2">
            <div 
              id="countdown-badge-transpetro"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs"
              title={`Prova Transpetro em ${settings.examDateTranspetro}`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-blue-950">Transpetro:</span>
              <span className="font-bold text-blue-700 font-mono">{daysTranspetro}d</span>
            </div>

            <div 
              id="countdown-badge-petrobras"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/80 border border-indigo-200/80 text-indigo-900 text-xs"
              title={`Prova Petrobras em ${settings.examDatePetrobras}`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold text-indigo-950">Petrobras:</span>
              <span className="font-bold text-indigo-700 font-mono">{daysPetrobras}d</span>
            </div>
          </div>

          {/* Quick Overdue Alert if any */}
          {(overdueTasks.length > 0 || overdueRevisions.length > 0) && (
            <button
              id="header-overdue-alert-btn"
              onClick={() => setActiveTab('recuperar_atrasos')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors text-xs font-semibold animate-pulse"
              title="Tarefas ou revisões atrasadas detectadas! Clique para replanejar."
            >
              <Bell className="w-3.5 h-3.5 text-rose-500" />
              <span>{overdueTasks.length + overdueRevisions.length} Atraso(s)</span>
            </button>
          )}

          {/* Supabase Cloud Sync Quick Badge */}
          <button
            id="header-supabase-btn"
            onClick={() => setActiveTab('configuracoes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
              supabaseState.isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-emerald-700'
            }`}
            title={supabaseState.isConnected ? 'Supabase Conectado (Sincronização em Nuvem Ativa)' : 'Configurar Banco de Dados Supabase'}
          >
            <Database className={`w-3.5 h-3.5 ${supabaseState.isConnected ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Supabase:</span>
            <span>{supabaseState.isConnected ? 'Online' : 'Local'}</span>
          </button>

          {/* Admin Panel Quick Access Button */}
          {user?.isAdmin && (
            <button
              id="header-admin-panel-btn"
              onClick={() => setActiveTab('admin_panel')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-900 border border-purple-300 hover:bg-purple-100 transition-all shadow-xs cursor-pointer"
              title="Acessar Painel de Controle Administrativo"
            >
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Plan Status / Paywall Trigger Button */}
          {user && !user.isEntitled && (
            <button
              id="header-unlock-plan-btn"
              onClick={() => setActiveTab('paywall')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs cursor-pointer"
              title="Liberar Acesso Vitalício por R$ 49,90"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Desbloquear R$ 49,90</span>
            </button>
          )}

          {user && user.isEntitled && !user.isAdmin && (
            <div 
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
              title="Acesso vitalício ativo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vitalício</span>
            </div>
          )}

          {/* Google Workspace Hub quick access */}
          <button
            id="header-workspace-btn"
            onClick={() => setActiveTab('google_workspace')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-blue-700 transition-all shadow-xs"
            title="Abrir integrações com Google Drive, Google Agenda e Google Sheets"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Google Workspace</span>
          </button>

          {/* TDAH Simplified Mode Toggle */}
          <button
            id="toggle-tdah-mode-btn"
            onClick={() => updateSettings({ tdahSimplifiedMode: !settings.tdahSimplifiedMode })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              settings.tdahSimplifiedMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-amber-700'
            }`}
            title="Ativa o Modo Foco TDAH para exibir apenas a tarefa atual sem distrações"
          >
            <Zap className={`w-3.5 h-3.5 ${settings.tdahSimplifiedMode ? 'text-white' : 'text-amber-500'}`} />
            <span className="hidden sm:inline">Modo TDAH:</span>
            <span>{settings.tdahSimplifiedMode ? 'ATIVO' : 'Normal'}</span>
          </button>

          {/* Start Focus Mode Modal Button */}
          {firstPendingTask && (
            <button
              id="header-quick-focus-btn"
              onClick={() => openFocusMode(firstPendingTask)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#123B5D] text-white hover:bg-[#0B1F3A] transition-all shadow-xs"
              title="Abrir tela de foco com cronômetro para a tarefa atual"
            >
              <Clock className="w-3.5 h-3.5 text-teal-300" />
              <span className="hidden sm:inline">Focar Agora</span>
            </button>
          )}

          {/* User Auth Profile / Login Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Usuário'} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                  {user.displayName || 'Aluno'}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[110px]">
                  {user.isAdmin ? 'Admin' : user.isEntitled ? 'Vitalício' : 'Pendente'}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Encerrar Sessão (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              disabled={isAuthenticating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar com Google</span>
            </button>
          )}

          {/* Audio toggle button */}
          <button
            id="toggle-sound-btn"
            onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={settings.soundEffects ? 'Sons ativados' : 'Sons desativados'}
          >
            {settings.soundEffects ? (
              <Volume2 className="w-4 h-4 text-teal-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
