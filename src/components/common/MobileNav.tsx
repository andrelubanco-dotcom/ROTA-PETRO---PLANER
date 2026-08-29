import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { ActiveTab } from '../../types';
import {
  CalendarCheck2,
  LayoutDashboard,
  RotateCcw,
  BookOpen,
  MoreHorizontal,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  Sparkles,
  X
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, todayTasks, overdueTasks, overdueRevisions, todayRevisions } = useStudy();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const pendingToday = todayTasks.filter(t => t.status === 'pendente').length;
  const totalOverdue = overdueTasks.length + overdueRevisions.length;

  const mainTabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'plano_hoje', label: 'Hoje', icon: CalendarCheck2, badge: pendingToday > 0 ? pendingToday : undefined },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'revisoes', label: 'Revisões', icon: RotateCcw, badge: todayRevisions.length > 0 ? todayRevisions.length : undefined },
    { id: 'materias_edital', label: 'Edital', icon: BookOpen },
  ];

  const secondaryTabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'cronograma', label: 'Cronograma / Calendário', icon: LayoutDashboard },
    { id: 'questoes', label: 'Banco de Questões', icon: CheckSquare },
    { id: 'desempenho', label: 'Analytics e Desempenho', icon: TrendingUp },
    { id: 'recuperar_atrasos', label: 'Recuperar Atrasos', icon: AlertTriangle, badge: totalOverdue > 0 ? totalOverdue : undefined },
    { id: 'simulados', label: 'Simulados', icon: FileSpreadsheet },
    { id: 'google_workspace', label: 'Google Workspace', icon: Sparkles },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Drawer for secondary tabs */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-white rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto border-t border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-base">Menu Completo</span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {secondaryTabs.map(item => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Bar */}
      <nav
        id="app-mobile-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg"
      >
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-teal-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
            isDrawerOpen || !mainTabs.some(t => t.id === activeTab)
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {totalOverdue > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                !
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5">Mais</span>
        </button>
      </nav>
    </>
  );
};
