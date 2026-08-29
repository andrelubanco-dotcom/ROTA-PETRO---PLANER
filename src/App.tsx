import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { ModoFocoModal } from './components/common/ModoFocoModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PlanoHojeView } from './components/views/PlanoHojeView';
import { CronogramaView } from './components/views/CronogramaView';
import { MateriasEditalView } from './components/views/MateriasEditalView';
import { RevisoesView } from './components/views/RevisoesView';
import { QuestoesView } from './components/views/QuestoesView';
import { DesempenhoView } from './components/views/DesempenhoView';
import { RecuperarAtrasosView } from './components/views/RecuperarAtrasosView';
import { SimuladosView } from './components/views/SimuladosView';
import { ConfiguracoesView } from './components/views/ConfiguracoesView';
import { GoogleWorkspaceHub } from './components/workspace/GoogleWorkspaceHub';
import { PaywallView } from './components/views/PaywallView';
import { AdminPanelView } from './components/views/AdminPanelView';
import { TermosPrivacidadeView } from './components/views/TermosPrivacidadeView';
import { CloudUpload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const MigrationBanner: React.FC = () => {
  const { user, hasLegacyLocalData, migrateLegacyDataToAccount, dismissLegacyMigration } = useAuth();
  const [migrated, setMigrated] = React.useState(false);
  const [isMigrating, setIsMigrating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!user || !hasLegacyLocalData || migrated) return null;

  const handleMigrate = async () => {
    setIsMigrating(true);
    setError(null);
    try {
      const result = await migrateLegacyDataToAccount();
      if (result.success) {
        setMigrated(true);
      } else {
        setError('Não foi possível sincronizar o histórico.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao sincronizar dados locais.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
          <CloudUpload className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">Histórico de Estudos Local Detectado</h4>
          <p className="text-xs text-amber-800">
            Você possui progresso salvo neste navegador. Deseja transferir e sincronizar com sua conta na nuvem?
          </p>
          {error && <p className="text-xs font-semibold text-rose-600 mt-1">{error}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={dismissLegacyMigration}
          className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Dispensar
        </button>
        <button
          onClick={handleMigrate}
          disabled={isMigrating}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isMigrating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sincronizando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sincronizar Histórico</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { activeTab } = useStudy();
  const { user, isAuthenticating } = useAuth();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'plano_hoje':
        return <PlanoHojeView />;
      case 'cronograma':
        return <CronogramaView />;
      case 'materias_edital':
        return <MateriasEditalView />;
      case 'revisoes':
        return <RevisoesView />;
      case 'questoes':
        return <QuestoesView />;
      case 'desempenho':
        return <DesempenhoView />;
      case 'recuperar_atrasos':
        return <RecuperarAtrasosView />;
      case 'simulados':
        return <SimuladosView />;
      case 'google_workspace':
        return <GoogleWorkspaceHub />;
      case 'configuracoes':
        return <ConfiguracoesView />;
      case 'paywall':
        return <PaywallView />;
      case 'admin_panel':
        return <AdminPanelView />;
      case 'termos_privacidade':
        return <TermosPrivacidadeView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F6F9] overflow-hidden text-slate-900 font-sans antialiased">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Global Top Header with Countdowns & Exam Filters */}
        <Header />

        {/* Dynamic View Body with custom scrollbar */}
        <main
          id="main-app-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12"
        >
          <MigrationBanner />
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Focus Mode Modal with Pomodoro & Stopwatch */}
      <ModoFocoModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <MainContent />
      </StudyProvider>
    </AuthProvider>
  );
}

