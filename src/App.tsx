import React from 'react';
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

const MainContent: React.FC = () => {
  const { activeTab } = useStudy();

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
    <StudyProvider>
      <MainContent />
    </StudyProvider>
  );
}
