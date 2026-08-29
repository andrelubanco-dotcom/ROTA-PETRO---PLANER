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
  Save,
  Database,
  Cloud,
  CloudUpload,
  CloudDownload,
  Key,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Code,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { playSuccessSound } from '../../utils/audio';
import { getSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../../lib/supabase';

export const ConfiguracoesView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetAllData,
    supabaseState,
    syncNowWithSupabase,
    pullFromSupabaseNow,
    saveSupabaseCredentials,
    clearSupabaseCredentials,
    testSupabase
  } = useStudy();

  const [userName, setUserName] = useState(settings.userName);
  const [dailyHours, setDailyHours] = useState(settings.dailyStudyHoursAvailable);
  const [preferredShift, setPreferredShift] = useState(settings.preferredShift);
  const [examDateTranspetro, setExamDateTranspetro] = useState(settings.examDateTranspetro);
  const [examDatePetrobras, setExamDatePetrobras] = useState(settings.examDatePetrobras);
  const [tdahMode, setTdahMode] = useState(settings.tdahSimplifiedMode);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffects);
  const [confettiEnabled, setConfettiEnabled] = useState(settings.confettiEnabled);
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Supabase state
  const currentConfig = getSupabaseConfig();
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState(currentConfig.url);
  const [customSupabaseAnonKey, setCustomSupabaseAnonKey] = useState(currentConfig.anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestFeedback, setSupabaseTestFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [syncStatusMessage, setSyncStatusMessage] = useState<{ success: boolean; message: string } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

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

  const handleSaveSupabase = async () => {
    if (!customSupabaseUrl.trim() || !customSupabaseAnonKey.trim()) {
      setSupabaseTestFeedback({
        success: false,
        message: 'Por favor, preencha a URL do Projeto e a Chave Anon.',
      });
      return;
    }

    setIsTestingSupabase(true);
    setSupabaseTestFeedback(null);
    try {
      const result = await saveSupabaseCredentials(customSupabaseUrl, customSupabaseAnonKey);
      setSupabaseTestFeedback(result);
      if (result.success && soundEffects) {
        playSuccessSound(true);
      }
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleTestSupabaseOnly = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestFeedback(null);
    try {
      const result = await testSupabase(customSupabaseUrl, customSupabaseAnonKey);
      setSupabaseTestFeedback(result);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncStatusMessage(null);
    const result = await syncNowWithSupabase();
    setSyncStatusMessage(result);
    if (result.success && soundEffects) {
      playSuccessSound(true);
    }
    setTimeout(() => setSyncStatusMessage(null), 6000);
  };

  const handlePullFromSupabase = async () => {
    if (!window.confirm('Deseja baixar os dados do Supabase? Isso atualizará suas matérias, tarefas e questões locais com a versão da nuvem.')) {
      return;
    }
    setSyncStatusMessage(null);
    const result = await pullFromSupabaseNow();
    setSyncStatusMessage(result);
    if (result.success && soundEffects) {
      playSuccessSound(true);
    }
    setTimeout(() => setSyncStatusMessage(null), 6000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
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
            Configurações & Banco de Dados
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Personalize seu perfil de estudos, integre ao banco de dados Supabase e mantenha seu progresso sincronizado.
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

      {/* SUPABASE CLOUD DATABASE INTEGRATION */}
      <div id="supabase-settings-card" className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-base">
                  Banco de Dados Supabase (Nuvem)
                </h2>
                {supabaseState.isConnected ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    CONECTADO
                  </span>
                ) : supabaseState.isConfigured ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
                    Configurado (Offline)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                    Armazenamento Local
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Sincronize tarefas, tópicos do edital e questões em tempo real para acessar do celular e computador.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Code className="w-4 h-4 text-emerald-600" />
            Ver Script SQL
          </button>
        </div>

        {/* Sync actions if connected */}
        {supabaseState.isConfigured && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  Status de Sincronização
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                {supabaseState.lastSyncedAt 
                  ? `Último envio para a nuvem: ${supabaseState.lastSyncedAt}` 
                  : 'Nenhum backup em nuvem realizado ainda nesta sessão.'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={supabaseState.isSyncing}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                {supabaseState.isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudUpload className="w-4 h-4" />
                )}
                {supabaseState.isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
              </button>

              <button
                type="button"
                onClick={handlePullFromSupabase}
                disabled={supabaseState.isSyncing}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Baixar os dados existentes no Supabase para este navegador"
              >
                <CloudDownload className="w-4 h-4 text-slate-600" />
                Baixar da Nuvem
              </button>
            </div>
          </div>
        )}

        {/* Sync message feedback */}
        {syncStatusMessage && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fadeIn ${
            syncStatusMessage.success 
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}>
            {syncStatusMessage.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{syncStatusMessage.message}</span>
          </div>
        )}

        {/* Supabase Connection Form */}
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                URL do Projeto Supabase (Project URL)
              </label>
              <input
                type="text"
                placeholder="https://exemplo.supabase.co"
                value={customSupabaseUrl}
                onChange={e => setCustomSupabaseUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Disponível no seu painel Supabase em <strong>Project Settings &gt; API &gt; Project URL</strong>.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                Chave Pública Anon (Project API Key)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={customSupabaseAnonKey}
                onChange={e => setCustomSupabaseAnonKey(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Chave de acesso público/anon encontrada em <strong>Project Settings &gt; API &gt; anon public</strong>.
              </span>
            </div>
          </div>

          {/* Test feedback */}
          {supabaseTestFeedback && (
            <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
              supabaseTestFeedback.success 
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
                : 'bg-amber-50 border border-amber-300 text-amber-900'
            }`}>
              {supabaseTestFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{supabaseTestFeedback.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveSupabase}
                disabled={isTestingSupabase}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isTestingSupabase ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar & Conectar
              </button>

              <button
                type="button"
                onClick={handleTestSupabaseOnly}
                disabled={isTestingSupabase}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Testar Conexão
              </button>
            </div>

            {supabaseState.isConfigured && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Deseja desconectar o Supabase? O aplicativo continuará funcionando normalmente com o armazenamento local persistente.')) {
                    clearSupabaseCredentials();
                    setCustomSupabaseUrl('');
                    setCustomSupabaseAnonKey('');
                    setSupabaseTestFeedback(null);
                  }
                }}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Desconectar
              </button>
            )}
          </div>
        </div>
      </div>

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
              <label className="font-bold text-slate-700 block mb-1">Horas Disponíveis por Dia (Total 210 min = 3.5h)</label>
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
            className="px-6 py-3 rounded-2xl bg-[#0B1F3A] hover:bg-[#123B5D] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
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
          Gerenciamento & Backup de Dados Locais
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-800 block text-sm">Backup do Plano de Estudos</span>
            <span className="text-slate-500">Baixe um arquivo JSON com todas as suas matérias, tarefas e questões.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportData}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Exportar JSON
            </button>

            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar os dados iniciais da ROTA PETRO?')) {
                  resetAllData();
                }
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Resetar Dados
            </button>
          </div>
        </div>
      </div>

      {/* SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-scaleUp">
            
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Script SQL para o Supabase
                  </h3>
                  <p className="text-xs text-slate-500">
                    Copie e cole este código no <strong>SQL Editor</strong> do seu painel Supabase para criar as tabelas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-900 text-slate-100 font-mono text-xs rounded-b-none">
              <pre className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-slate-900">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 rounded-b-3xl">
              <span className="text-xs text-slate-600">
                Cria 6 tabelas com políticas RLS para perfil, matérias, tarefas, revisões e simulados.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedSql ? 'Copiado!' : 'Copiar Script SQL'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
