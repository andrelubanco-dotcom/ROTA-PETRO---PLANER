import React, { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { 
  googleSignIn, 
  logoutGoogle, 
  initAuth, 
  getAccessToken,
  listDriveFiles, 
  saveBackupToGoogleDrive,
  DriveFileItem,
  listCalendarEvents,
  createCalendarEvent,
  syncSimuladosToCalendar,
  CalendarEventItem,
  createStudyTrackerSpreadsheet,
  syncSimuladosToExistingSheet,
  SpreadsheetCreationResult
} from '../../services/googleWorkspace';
import { User } from 'firebase/auth';
import {
  FolderGit2,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  ExternalLink,
  Plus,
  Search,
  Upload,
  Sparkles,
  CalendarPlus,
  Clock,
  Shield,
  FileText
} from 'lucide-react';
import { playSuccessSound } from '../../utils/audio';

export const GoogleWorkspaceHub: React.FC = () => {
  const { 
    topics, 
    tasks, 
    revisions, 
    questionRecords, 
    simulados, 
    settings 
  } = useStudy();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeWorkspaceSubTab, setActiveWorkspaceSubTab] = useState<'overview' | 'drive' | 'calendar' | 'sheets'>('overview');

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveSearch, setDriveSearch] = useState('');
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveStatusMsg, setDriveStatusMsg] = useState<string | null>(null);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarStatusMsg, setCalendarStatusMsg] = useState<string | null>(null);

  // Sheets state
  const [createdSpreadsheet, setCreatedSpreadsheet] = useState<SpreadsheetCreationResult | null>(() => {
    const saved = localStorage.getItem('rota_petro_sheets_tracker');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [sheetsStatusMsg, setSheetsStatusMsg] = useState<string | null>(null);

  // Confirmation Modal state for destructive/mutating operations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'drive_backup' | 'calendar_sync_all' | 'calendar_add_today' | 'sheets_create' | 'sheets_sync';
    payload?: any;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'drive_backup'
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        playSuccessSound(settings.soundEffects);
      }
    } catch (err: any) {
      alert(`Falha ao conectar com o Google Workspace: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setCalendarEvents([]);
  };

  // Drive Actions
  const handleLoadDriveFiles = async () => {
    if (!token) return;
    setIsLoadingDrive(true);
    setDriveStatusMsg(null);
    try {
      const files = await listDriveFiles(driveSearch);
      setDriveFiles(files);
    } catch (err: any) {
      setDriveStatusMsg(`Erro: ${err.message}`);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const executeBackupToDrive = async () => {
    if (!token) return;
    setIsLoadingDrive(true);
    setDriveStatusMsg(null);
    try {
      const backupData = {
        app: 'ROTA PETRO',
        version: '2.4',
        user: settings.userName,
        exportedAt: new Date().toISOString(),
        topics,
        tasks,
        revisions,
        questionRecords,
        simulados,
        settings
      };
      const result = await saveBackupToGoogleDrive(backupData);
      playSuccessSound(settings.soundEffects);
      setDriveStatusMsg(`Arquivo salvo com sucesso no Google Drive: "${result.name}"`);
      handleLoadDriveFiles();
    } catch (err: any) {
      setDriveStatusMsg(`Erro ao salvar no Drive: ${err.message}`);
    } finally {
      setIsLoadingDrive(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Calendar Actions
  const handleLoadCalendarEvents = async () => {
    if (!token) return;
    setIsLoadingCalendar(true);
    setCalendarStatusMsg(null);
    try {
      const events = await listCalendarEvents();
      setCalendarEvents(events);
    } catch (err: any) {
      setCalendarStatusMsg(`Erro: ${err.message}`);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const executeSyncSimuladosToCalendar = async () => {
    if (!token) return;
    setIsLoadingCalendar(true);
    setCalendarStatusMsg(null);
    try {
      const { createdCount } = await syncSimuladosToCalendar(simulados);
      playSuccessSound(settings.soundEffects);
      setCalendarStatusMsg(`${createdCount} simulados Cesgranrio foram adicionados à sua Google Agenda!`);
      handleLoadCalendarEvents();
    } catch (err: any) {
      setCalendarStatusMsg(`Erro ao sincronizar com Google Agenda: ${err.message}`);
    } finally {
      setIsLoadingCalendar(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const executeAddTodayStudyBlockToCalendar = async () => {
    if (!token) return;
    setIsLoadingCalendar(true);
    setCalendarStatusMsg(null);
    try {
      const today = '2026-08-29';
      await createCalendarEvent({
        summary: `📚 ROTA PETRO: Sessão de Estudos (${settings.preferredShift.toUpperCase()})`,
        description: `Bloco de estudos focado em Cesgranrio:\n- Meta do dia: ${settings.dailyStudyHoursAvailable} horas\n- Conhecimentos Básicos (Língua Portuguesa/Matemática) e Específicos (Ênfase 4: Dutos e Terminais).`,
        startDate: today,
        startTime: settings.preferredShift === 'manha' ? '08:30' : settings.preferredShift === 'noite' ? '19:30' : '14:00',
        durationMinutes: Math.round((settings.dailyStudyHoursAvailable || 3.5) * 60)
      });
      playSuccessSound(settings.soundEffects);
      setCalendarStatusMsg('Sessão de estudos adicionada com sucesso à sua Google Agenda!');
      handleLoadCalendarEvents();
    } catch (err: any) {
      setCalendarStatusMsg(`Erro ao criar evento: ${err.message}`);
    } finally {
      setIsLoadingCalendar(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Sheets Actions
  const executeCreateSheetsTracker = async () => {
    if (!token) return;
    setIsLoadingSheets(true);
    setSheetsStatusMsg(null);
    try {
      const result = await createStudyTrackerSpreadsheet(simulados, topics, settings.userName);
      setCreatedSpreadsheet(result);
      localStorage.setItem('rota_petro_sheets_tracker', JSON.stringify(result));
      playSuccessSound(settings.soundEffects);
      setSheetsStatusMsg('Planilha criada com sucesso no seu Google Sheets!');
    } catch (err: any) {
      setSheetsStatusMsg(`Erro ao criar Planilha: ${err.message}`);
    } finally {
      setIsLoadingSheets(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const executeSyncSheetsData = async () => {
    if (!token || !createdSpreadsheet) return;
    setIsLoadingSheets(true);
    setSheetsStatusMsg(null);
    try {
      await syncSimuladosToExistingSheet(createdSpreadsheet.spreadsheetId, simulados);
      playSuccessSound(settings.soundEffects);
      setSheetsStatusMsg('Dados de simulados sincronizados na sua planilha do Google Sheets!');
    } catch (err: any) {
      setSheetsStatusMsg(`Erro ao sincronizar planilha: ${err.message}`);
    } finally {
      setIsLoadingSheets(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const triggerConfirmation = (
    actionType: 'drive_backup' | 'calendar_sync_all' | 'calendar_add_today' | 'sheets_create' | 'sheets_sync',
    title: string,
    description: string,
    payload?: any
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      description,
      actionType,
      payload
    });
  };

  const handleConfirmAction = () => {
    switch (confirmModal.actionType) {
      case 'drive_backup':
        executeBackupToDrive();
        break;
      case 'calendar_sync_all':
        executeSyncSimuladosToCalendar();
        break;
      case 'calendar_add_today':
        executeAddTodayStudyBlockToCalendar();
        break;
      case 'sheets_create':
        executeCreateSheetsTracker();
        break;
      case 'sheets_sync':
        executeSyncSheetsData();
        break;
    }
  };

  return (
    <div id="view-google-workspace" className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B1F3A] via-[#123B5D] to-[#0A4D68] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-blue-400/20 text-blue-200 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              Integração Oficial Google Workspace
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Drive • Calendar • Sheets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Google Workspace Hub
          </h1>
          <p className="text-slate-200 text-sm max-w-2xl mt-0.5">
            Sincronize seus horários de estudo na Google Agenda, salve apostilas e backups no Google Drive e acompanhe seu rendimento em tempo real pelo Google Sheets.
          </p>
        </div>

        {/* Auth Action or User Profile Card */}
        {user ? (
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/20 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-10 h-10 rounded-full border-2 border-white/40 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center">
                  {(user.displayName || user.email || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="font-extrabold text-white block text-sm">
                  {user.displayName || 'Usuário Google'}
                </span>
                <span className="text-slate-300 text-[11px] block">{user.email}</span>
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Conectado com permissão
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Desconectar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button bg-white text-slate-900 px-5 py-3 rounded-2xl font-bold text-xs shadow-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-3 self-start md:self-auto shrink-0 cursor-pointer"
          >
            <div className="gsi-material-button-icon">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
            </div>
            <span>{isLoggingIn ? 'Conectando ao Google...' : 'Conectar com Conta Google'}</span>
          </button>
        )}
      </div>

      {/* Sub navigation bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Visão Geral & Ferramentas', icon: Sparkles },
          { id: 'calendar', label: 'Google Agenda (Calendar)', icon: CalendarIcon },
          { id: 'drive', label: 'Google Drive (Arquivos & Backup)', icon: HardDrive },
          { id: 'sheets', label: 'Google Planilhas (Sheets)', icon: FileSpreadsheet }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeWorkspaceSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveWorkspaceSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* NOT LOGGED IN STATE */}
      {!user && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4 max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Conecte sua conta do Google
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Conecte seu Google Drive, Google Agenda e Google Sheets para sincronizar seus blocos diários de estudos, os 6 simulados programados e manter seus materiais sempre organizados com permissão explícita.
          </p>
          <div className="pt-2">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              {isLoggingIn ? 'Iniciando autenticação...' : 'Autorizar Acesso Google Workspace'}
            </button>
          </div>
        </div>
      )}

      {/* LOGGED IN CONTENT */}
      {user && (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeWorkspaceSubTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Calendar Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Google Agenda</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Sincronize os 6 simulados oficiais e suas sessões de estudo com notificações automáticas no celular.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() =>
                        triggerConfirmation(
                          'calendar_sync_all',
                          'Sincronizar 6 Simulados na Google Agenda?',
                          'Deseja adicionar os 6 simulados programados da Cesgranrio diretamente ao seu calendário principal do Google?'
                        )
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <CalendarPlus className="w-4 h-4 text-blue-600" /> Sincronizar 6 Simulados
                    </button>
                    <button
                      onClick={() => setActiveWorkspaceSubTab('calendar')}
                      className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      Ver Agenda Completa →
                    </button>
                  </div>
                </div>

                {/* Drive Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Google Drive</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Faça backup na nuvem com um clique e consulte seus resumos e apostilas de Dutos e Terminais.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() =>
                        triggerConfirmation(
                          'drive_backup',
                          'Salvar Backup no Google Drive?',
                          'Deseja salvar um arquivo JSON com todas as suas tarefas, matérias do edital e notas no seu Google Drive?'
                        )
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" /> Salvar Backup no Drive
                    </button>
                    <button
                      onClick={() => setActiveWorkspaceSubTab('drive')}
                      className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      Navegar Arquivos do Drive →
                    </button>
                  </div>
                </div>

                {/* Sheets Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Google Planilhas</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Gere uma planilha viva de controle para visualizar seu progresso em tabelas dinâmicas do Google Sheets.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {createdSpreadsheet ? (
                      <a
                        href={createdSpreadsheet.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" /> Abrir Minha Planilha
                      </a>
                    ) : (
                      <button
                        onClick={() =>
                          triggerConfirmation(
                            'sheets_create',
                            'Gerar Planilha Oficial no Google Sheets?',
                            'Criaremos uma nova planilha formatada no seu Google Sheets com abas para Simulados Cesgranrio e Matérias do Edital.'
                          )
                        }
                        className="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4 text-teal-600" /> Criar Planilha no Sheets
                      </button>
                    )}
                    <button
                      onClick={() => setActiveWorkspaceSubTab('sheets')}
                      className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      Opções da Planilha →
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CALENDAR */}
          {activeWorkspaceSubTab === 'calendar' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    Sincronização com Google Agenda
                  </h2>
                  <span className="text-xs text-slate-500">
                    Agende seus simulados quinzenais e blocos de estudo no seu calendário pessoal.
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      triggerConfirmation(
                        'calendar_add_today',
                        'Agendar Bloco de Hoje na Google Agenda?',
                        `Deseja agendar uma sessão de estudos de ${settings.dailyStudyHoursAvailable} horas no turno ${settings.preferredShift} para 29/08/2026?`
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-blue-600" /> Agendar Bloco de Hoje
                  </button>

                  <button
                    onClick={() =>
                      triggerConfirmation(
                        'calendar_sync_all',
                        'Sincronizar 6 Simulados na Google Agenda?',
                        'Deseja adicionar os 6 simulados programados da Cesgranrio diretamente ao seu calendário principal do Google?'
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <CalendarPlus className="w-4 h-4 text-blue-200" /> Sincronizar 6 Simulados
                  </button>

                  <button
                    onClick={handleLoadCalendarEvents}
                    disabled={isLoadingCalendar}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
                    title="Atualizar Eventos"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {calendarStatusMsg && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center gap-3 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{calendarStatusMsg}</span>
                </div>
              )}

              {/* Next Simulados Schedule Preview */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Simulados Programados para o Google Agenda:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {simulados.map((s, idx) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600">Simulado #{idx + 1}</span>
                        <span className="font-mono text-slate-500">{s.date}</span>
                      </div>
                      <span className="font-extrabold text-slate-900 block truncate">{s.title}</span>
                      <span className="text-[11px] text-slate-500 block">
                        20 CB + 40 CE = 60 Questões (08:00 às 12:00)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events list from Google Calendar */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Próximos Eventos Carregados da sua Google Agenda:
                  </h3>
                  {calendarEvents.length === 0 && !isLoadingCalendar && (
                    <button
                      onClick={handleLoadCalendarEvents}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Clique para carregar eventos
                    </button>
                  )}
                </div>

                {isLoadingCalendar ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-bold">
                    Carregando eventos do Google Calendar...
                  </div>
                ) : calendarEvents.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {calendarEvents.map(evt => (
                      <div
                        key={evt.id}
                        className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{evt.summary}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {evt.start.dateTime
                              ? new Date(evt.start.dateTime).toLocaleString('pt-BR')
                              : evt.start.date}
                          </span>
                        </div>
                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600"
                            title="Abrir no Google Calendar"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    Nenhum evento carregado ainda. Use o botão acima para sincronizar ou carregar seus eventos.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DRIVE */}
          {activeWorkspaceSubTab === 'drive' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-emerald-600" />
                    Google Drive (Arquivos & Backup)
                  </h2>
                  <span className="text-xs text-slate-500">
                    Salve backups automáticos do seu planner e localize PDFs e apostilas diretamente na sua nuvem.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      triggerConfirmation(
                        'drive_backup',
                        'Salvar Backup no Google Drive?',
                        'Deseja salvar um arquivo JSON com todas as suas tarefas, matérias do edital e notas no seu Google Drive?'
                      )
                    }
                    disabled={isLoadingDrive}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-4 h-4 text-emerald-200" /> Salvar Backup no Drive
                  </button>
                </div>
              </div>

              {driveStatusMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{driveStatusMsg}</span>
                </div>
              )}

              {/* Search & List files */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar apostilas, PDFs ou backups no Google Drive..."
                      value={driveSearch}
                      onChange={e => setDriveSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLoadDriveFiles()}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <button
                    onClick={handleLoadDriveFiles}
                    disabled={isLoadingDrive}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Search className="w-4 h-4" /> Buscar Arquivos
                  </button>
                </div>

                {isLoadingDrive ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-bold">
                    Buscando arquivos no seu Google Drive...
                  </div>
                ) : driveFiles.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {driveFiles.map(file => (
                      <div
                        key={file.id}
                        className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{file.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Modificado em:{' '}
                              {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('pt-BR') : '-'}
                            </span>
                          </div>
                        </div>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Abrir no Drive
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    Clique em &quot;Buscar Arquivos&quot; para listar seus documentos ou resumos do Google Drive.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SHEETS */}
          {activeWorkspaceSubTab === 'sheets' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                    Google Planilhas (Sheets)
                  </h2>
                  <span className="text-xs text-slate-500">
                    Exporte suas métricas de estudo, controle de simulados e progresso do edital em uma planilha estruturada.
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {createdSpreadsheet ? (
                    <>
                      <button
                        onClick={() =>
                          triggerConfirmation(
                            'sheets_sync',
                            'Atualizar Dados na Planilha Existente?',
                            'Deseja exportar as notas mais recentes dos seus simulados para a sua planilha do Google Sheets?'
                          )
                        }
                        disabled={isLoadingSheets}
                        className="px-4 py-2 rounded-xl bg-teal-50 text-teal-900 hover:bg-teal-100 font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4 text-teal-600" /> Atualizar Planilha
                      </button>

                      <a
                        href={createdSpreadsheet.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <ExternalLink className="w-4 h-4 text-teal-200" /> Abrir no Google Sheets
                      </a>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        triggerConfirmation(
                          'sheets_create',
                          'Criar Planilha Oficial no Google Sheets?',
                          'Criaremos uma nova planilha formatada no seu Google Sheets com abas para Simulados Cesgranrio e Matérias do Edital.'
                        )
                      }
                      disabled={isLoadingSheets}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4 text-teal-200" /> Criar Planilha Oficial no Sheets
                    </button>
                  )}
                </div>
              </div>

              {sheetsStatusMsg && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 flex items-center gap-3 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                  <span>{sheetsStatusMsg}</span>
                </div>
              )}

              {/* Spreadsheet Structure Preview */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 text-xs block">
                  Estrutura Automática da Planilha Integrada:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-teal-900 block">📊 Aba 1: Simulados Cesgranrio</span>
                    <p className="text-[11px] text-slate-500">
                      ID, Título, Data, Acertos em Conhecimentos Básicos (/20), Acertos em Específicos (/40), Nota Final (/60), Tempo Gasto e Status.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-blue-900 block">📚 Aba 2: Edital & Matérias</span>
                    <p className="text-[11px] text-slate-500">
                      Código, Disciplina, Tópico, Prioridade, Dificuldade, Status de estudo e histórico de questões resolvidas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE/MUTATING WORKSPACE OPERATIONS */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-base">
                {confirmModal.title}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm transition-all"
              >
                Confirmar & Continuar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
