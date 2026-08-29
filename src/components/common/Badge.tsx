import React from 'react';
import { PriorityLevel, TopicStatus, ExamTarget } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

export const PriorityBadge: React.FC<{ priority: PriorityLevel; id?: string }> = ({ priority, id }) => {
  const map = {
    critica: { label: 'Crítica', bg: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
    alta: { label: 'Alta', bg: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
    media: { label: 'Média', bg: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
    baixa: { label: 'Baixa', bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  };

  const item = map[priority] || map.media;

  return (
    <span
      id={id || `badge-priority-${priority}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${item.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TopicStatus; id?: string }> = ({ status, id }) => {
  const map: Record<TopicStatus, { label: string; bg: string }> = {
    dominado: { label: 'Dominado', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    revisado: { label: 'Revisado', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
    estudado: { label: 'Estudado', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
    em_andamento: { label: 'Em Andamento', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
    nao_iniciado: { label: 'Não Iniciado', bg: 'bg-slate-100 text-slate-600 border-slate-300' },
    atrasado: { label: 'Atrasado', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
  };

  const item = map[status] || map.nao_iniciado;

  return (
    <span
      id={id || `badge-status-${status}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${item.bg}`}
    >
      {item.label}
    </span>
  );
};

export const ExamBadge: React.FC<{ target: ExamTarget; isCommon?: boolean; id?: string }> = ({
  target,
  isCommon,
  id,
}) => {
  if (isCommon || target === 'ambos') {
    return (
      <span
        id={id || 'badge-exam-ambos'}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        Transpetro + Petrobras (Comum)
      </span>
    );
  }

  if (target === 'transpetro') {
    return (
      <span
        id={id || 'badge-exam-transpetro'}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Transpetro (Dutos)
      </span>
    );
  }

  return (
    <span
      id={id || 'badge-exam-petrobras'}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      Petrobras (Operação)
    </span>
  );
};
