import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  CalendarCheck2,
  CalendarDays,
  BookOpen,
  RotateCcw,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    todayTasks,
    overdueTasks,
    overdueRevisions,
    todayRevisions,
    overallProgressPercentage,
    settings,
  } = useStudy();

  const pendingTodayTasks = todayTasks.filter(t => t.status === 'pendente').length;
  const pendingRevisionsToday = todayRevisions.length;
  const totalOverdue = overdueTasks.length + overdueRevisions.length;

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    color: string; // Active accent color
    activeBg: string;
    activeText: string;
    badge?: number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: '#2563EB',
      activeBg: 'bg-blue-50 text-blue-900 border-blue-600',
      activeText: 'text-blue-700',
    },
    {
      id: 'plano_hoje',
      label: 'Plano de Hoje',
      icon: CalendarCheck2,
      color: '#14B8A6',
      activeBg: 'bg-teal-50 text-teal-900 border-teal-600',
      activeText: 'text-teal-700',
      badge: pendingTodayTasks > 0 ? pendingTodayTasks : undefined,
      badgeColor: 'bg-teal-500 text-white',
    },
    {
      id: 'cronograma',
      label: 'Cronograma',
      icon: CalendarDays,
      color: '#0284C7',
      activeBg: 'bg-sky-50 text-sky-900 border-sky-600',
      activeText: 'text-sky-700',
    },
    {
      id: 'materias_edital',
      label: 'Matérias e Edital',
      icon: BookOpen,
      color: '#123B5D',
      activeBg: 'bg-slate-100 text-[#0B1F3A] border-[#123B5D]',
      activeText: 'text-[#123B5D]',
    },
    {
      id: 'revisoes',
      label: 'Revisões (D+X)',
      icon: RotateCcw,
      color: '#7C3AED',
      activeBg: 'bg-purple-50 text-purple-900 border-purple-600',
      activeText: 'text-purple-700',
      badge: pendingRevisionsToday > 0 ? pendingRevisionsToday : undefined,
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'questoes',
      label: 'Questões',
      icon: CheckSquare,
      color: '#F59E0B',
      activeBg: 'bg-amber-50 text-amber-900 border-amber-500',
      activeText: 'text-amber-700',
    },
    {
      id: 'desempenho',
      label: 'Desempenho',
      icon: TrendingUp,
      color: '#22C55E',
      activeBg: 'bg-emerald-50 text-emerald-900 border-emerald-600',
      activeText: 'text-emerald-700',
    },
    {
      id: 'recuperar_atrasos',
      label: 'Recuperar Atrasos',
      icon: AlertTriangle,
      color: '#EF4444',
      activeBg: 'bg-rose-50 text-rose-900 border-rose-500',
      activeText: 'text-rose-700',
      badge: totalOverdue > 0 ? totalOverdue : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'simulados',
      label: 'Simulados',
      icon: FileSpreadsheet,
      color: '#F97316',
      activeBg: 'bg-orange-50 text-orange-900 border-orange-500',
      activeText: 'text-orange-700',
    },
    {
      id: 'google_workspace',
      label: 'Google Workspace',
      icon: Sparkles,
      color: '#0284C7',
      activeBg: 'bg-sky-50 text-sky-900 border-sky-600',
      activeText: 'text-sky-700',
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      color: '#64748B',
      activeBg: 'bg-slate-100 text-slate-900 border-slate-600',
      activeText: 'text-slate-700',
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 z-20"
    >
      {/* Top Brand Banner */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-sm">
            RP
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight block">
              ROTA PETRO
            </span>
            <span className="text-[11px] text-slate-700 font-medium block">
              Plano de Estudos Especial
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
          v2.4
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">
          Módulos de Estudo
        </div>

        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left group ${
                isActive
                  ? `${item.activeBg} border-l-4 shadow-xs font-bold`
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? item.activeText : 'text-slate-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-extrabold shadow-xs ${
                    item.badgeColor || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom TDAH Progress Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              Edital Coberto
            </span>
            <span className="text-xs font-mono font-bold text-blue-700">
              {overallProgressPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, overallProgressPercentage)}%` }}
            />
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-700">
            <span>{settings.userName}</span>
            <span className="font-semibold text-teal-700">Meta: 3.5h/dia</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
