import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveTab,
  ExamTarget,
  PriorityLevel,
  QuestionRecord,
  RevisionInterval,
  RevisionItem,
  SimuladoRecord,
  Task,
  Topic,
  TopicStatus,
  UserSettings,
  DailyStudyLog,
} from '../types';
import {
  INITIAL_DAILY_LOGS,
  INITIAL_QUESTION_RECORDS,
  INITIAL_REVISIONS,
  INITIAL_SIMULADOS,
  INITIAL_TASKS,
  INITIAL_TOPICS,
  INITIAL_USER_SETTINGS,
} from '../data/initialData';
import { playSuccessChime, triggerConfetti } from '../utils/audio';
import { rebalanceTasksRespectingDeadline, generateFullPostEditalTasks, HARD_DEADLINE_DATE } from '../utils/scheduleGenerator';

interface StudyContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedExam: ExamTarget;
  setSelectedExam: (exam: ExamTarget) => void;
  topics: Topic[];
  tasks: Task[];
  revisions: RevisionItem[];
  questionRecords: QuestionRecord[];
  simulados: SimuladoRecord[];
  dailyLogs: DailyStudyLog[];
  settings: UserSettings;
  
  // Focus Mode
  focusTask: Task | null;
  isFocusModalOpen: boolean;
  openFocusMode: (task: Task) => void;
  closeFocusMode: () => void;
  
  // Task Actions
  completeTask: (taskId: string) => void;
  postponeTask: (taskId: string, targetDate?: string) => void;
  toggleChecklistItem: (taskId: string, checklistId: string) => void;
  addNewTask: (taskData: Omit<Task, 'id' | 'status'>) => void;
  
  // Topic Actions
  updateTopic: (topic: Topic) => void;
  updateTopicStatus: (topicId: string, status: TopicStatus) => void;
  updateTopicPriority: (topicId: string, priority: PriorityLevel) => void;
  
  // Revision Actions
  completeRevision: (revisionId: string) => void;
  postponeRevision: (revisionId: string) => void;
  scheduleNewRevision: (data: any) => void;
  
  // Question & Diagnostics Actions
  addQuestionRecord: (record: Omit<QuestionRecord, 'id'>) => void;
  
  // Recovery / Overdue Actions
  rescheduleOverdueTasks: (mode?: any) => any;
  resetScheduleToFullEdital: () => void;
  
  // Simulado Actions
  addSimulado: (simulado: Omit<SimuladoRecord, 'id' | 'scorePercentage'>) => void;
  addSimuladoRecord: (simulado: Omit<SimuladoRecord, 'id' | 'scorePercentage'>) => void;
  updateSimulado: (id: string, updates: Partial<SimuladoRecord>) => void;
  
  // Settings & Storage
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetToDefaults: () => void;
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  
  // Computed helpers
  todayTasks: Task[];
  overdueTasks: Task[];
  todayRevisions: RevisionItem[];
  overdueRevisions: RevisionItem[];
  totalStudyHours: number;
  totalQuestionsSolved: number;
  overallAccuracy: number;
  overallProgressPercentage: number;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOPICS: 'rota_petro_topics_v4',
  TASKS: 'rota_petro_tasks_v4',
  REVISIONS: 'rota_petro_revisions_v4',
  QUESTIONS: 'rota_petro_questions_v4',
  SIMULADOS: 'rota_petro_simulados_v4',
  SETTINGS: 'rota_petro_settings_v4',
  DAILY_LOGS: 'rota_petro_dailylogs_v4',
};

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedExam, setSelectedExam] = useState<ExamTarget>('ambos');

  // Core collections initialized with local storage fallback
  const [topics, setTopics] = useState<Topic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TOPICS);
      return saved ? JSON.parse(saved) : INITIAL_TOPICS;
    } catch {
      return INITIAL_TOPICS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          return parsed;
        }
      }
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [revisions, setRevisions] = useState<RevisionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVISIONS);
      return saved ? JSON.parse(saved) : INITIAL_REVISIONS;
    } catch {
      return INITIAL_REVISIONS;
    }
  });

  const [questionRecords, setQuestionRecords] = useState<QuestionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return saved ? JSON.parse(saved) : INITIAL_QUESTION_RECORDS;
    } catch {
      return INITIAL_QUESTION_RECORDS;
    }
  });

  const [simulados, setSimulados] = useState<SimuladoRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIMULADOS);
      return saved ? JSON.parse(saved) : INITIAL_SIMULADOS;
    } catch {
      return INITIAL_SIMULADOS;
    }
  });

  const [dailyLogs, setDailyLogs] = useState<DailyStudyLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_DAILY_LOGS;
    } catch {
      return INITIAL_DAILY_LOGS;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_USER_SETTINGS;
    } catch {
      return INITIAL_USER_SETTINGS;
    }
  });

  // Focus Mode State
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState<boolean>(false);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [topics]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(revisions));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [revisions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questionRecords));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [questionRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULADOS, JSON.stringify(simulados));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [simulados]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(dailyLogs));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [dailyLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [settings]);

  // Focus Mode Handlers
  const openFocusMode = (task: Task) => {
    setFocusTask(task);
    setIsFocusModalOpen(true);
  };

  const closeFocusMode = () => {
    setIsFocusModalOpen(false);
  };

  // Helper date string (Simulated today: 2026-08-29)
  const getTodayStr = () => '2026-08-29';

  // Task Handlers
  const completeTask = (taskId: string) => {
    const today = getTodayStr();
    let completedItem: Task | undefined;

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          completedItem = {
            ...t,
            status: 'concluido',
            completedAt: new Date().toISOString(),
            isOverdue: false,
          };
          return completedItem;
        }
        return t;
      })
    );

    if (completedItem) {
      // If task is linked to a topic, update topic status
      if (completedItem.topicId) {
        setTopics(prev =>
          prev.map(top => {
            if (top.id === completedItem?.topicId) {
              const newStatus: TopicStatus =
                top.status === 'nao_iniciado' || top.status === 'em_andamento'
                  ? 'estudado'
                  : top.status;
              return {
                ...top,
                status: newStatus,
                lastStudiedDate: today,
              };
            }
            return top;
          })
        );

        // If it was a theory task, schedule D+1 automatically
        if (completedItem.type === 'teoria') {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 1);
          const nextDateStr = nextDate.toISOString().split('T')[0];

          const newRev: RevisionItem = {
            id: `rev-${Date.now()}`,
            topicId: completedItem.topicId,
            topicName: completedItem.topicName,
            subjectName: completedItem.subjectName,
            originalStudyDate: today,
            revisionStage: 'D+1',
            dueDate: nextDateStr,
            suggestedQuestions: 10,
            status: 'em_dia',
            priority: completedItem.priority,
            targetExam: completedItem.targetExam,
          };

          setRevisions(prev => {
            const exists = prev.some(r => r.topicId === completedItem?.topicId && r.revisionStage === 'D+1');
            if (exists) return prev;
            return [...prev, newRev];
          });
        }
      }

      // Update daily study log
      setDailyLogs(prev => {
        const existing = prev.find(l => l.date === today);
        const duration = completedItem?.suggestedDurationMinutes || 25;
        if (existing) {
          return prev.map(l =>
            l.date === today
              ? {
                  ...l,
                  minutesStudied: l.minutesStudied + duration,
                  tasksCompleted: l.tasksCompleted + 1,
                }
              : l
          );
        } else {
          return [
            ...prev,
            {
              date: today,
              minutesStudied: duration,
              questionsDone: 0,
              tasksCompleted: 1,
              revisionsDone: 0,
            },
          ];
        }
      });
    }

    playSuccessChime(settings.soundEffects);
    if (settings.confettiEnabled) {
      triggerConfetti();
    }
  };

  const postponeTask = (taskId: string, targetDate?: string) => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    const dateStr = targetDate || defaultDate.toISOString().split('T')[0];

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            date: dateStr,
            status: 'pendente',
            isOverdue: false,
            notes: (t.notes ? t.notes + ' ' : '') + `[Adiado para ${dateStr}]`,
          };
        }
        return t;
      })
    );
  };

  const toggleChecklistItem = (taskId: string, checklistId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: t.checklist.map(item =>
              item.id === checklistId ? { ...item, done: !item.done } : item
            ),
          };
        }
        return t;
      })
    );

    if (focusTask && focusTask.id === taskId) {
      setFocusTask(prev =>
        prev
          ? {
              ...prev,
              checklist: prev.checklist.map(item =>
                item.id === checklistId ? { ...item, done: !item.done } : item
              ),
            }
          : null
      );
    }
  };

  const addNewTask = (taskData: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      status: 'pendente',
    };
    setTasks(prev => [newTask, ...prev]);
    playSuccessChime(settings.soundEffects);
  };

  // Topic Handlers
  const updateTopic = (topic: Topic) => {
    setTopics(prev => prev.map(t => (t.id === topic.id ? topic : t)));
  };

  const updateTopicStatus = (topicId: string, status: TopicStatus) => {
    setTopics(prev =>
      prev.map(t =>
        t.id === topicId
          ? {
              ...t,
              status,
              lastStudiedDate:
                status === 'estudado' || status === 'dominado' || status === 'revisado'
                  ? getTodayStr()
                  : t.lastStudiedDate,
            }
          : t
      )
    );
  };

  const updateTopicPriority = (topicId: string, priority: PriorityLevel) => {
    setTopics(prev =>
      prev.map(t => (t.id === topicId ? { ...t, priority } : t))
    );
  };

  // Revision Handlers
  const completeRevision = (revisionId: string) => {
    const rev = revisions.find(r => r.id === revisionId);
    if (!rev) return;

    setRevisions(prev =>
      prev.map(r =>
        r.id === revisionId
          ? {
              ...r,
              status: 'concluida',
              completed: true,
              completedAt: new Date().toISOString(),
            }
          : r
      )
    );

    let nextStage: RevisionInterval | null = null;
    let daysToAdd = 7;

    if (rev.revisionStage === 'D+1') {
      nextStage = 'D+7';
      daysToAdd = 7;
    } else if (rev.revisionStage === 'D+7') {
      nextStage = 'D+15';
      daysToAdd = 15;
    } else if (rev.revisionStage === 'D+15' || rev.revisionStage === 'D+21') {
      nextStage = 'D+30';
      daysToAdd = 30;
    }

    if (nextStage) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      setRevisions(prev => [
        ...prev,
        {
          id: `rev-${Date.now()}`,
          topicId: rev.topicId,
          topicName: rev.topicName,
          subjectName: rev.subjectName,
          originalStudyDate: rev.originalStudyDate || getTodayStr(),
          revisionStage: nextStage!,
          dueDate: nextDateStr,
          suggestedQuestions: nextStage === 'D+7' ? 10 : 15,
          status: 'em_dia',
          priority: rev.priority,
          targetExam: rev.targetExam,
        },
      ]);
    }

    setTopics(prev =>
      prev.map(t =>
        t.id === rev.topicId
          ? {
              ...t,
              revisionCount: t.revisionCount + 1,
              currentRevisionStage: nextStage || 'D+30',
              status: t.status === 'dominado' ? 'dominado' : 'revisado',
            }
          : t
      )
    );

    playSuccessChime(settings.soundEffects);
    if (settings.confettiEnabled) {
      triggerConfetti();
    }
  };

  const postponeRevision = (revisionId: string) => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const dateStr = nextDay.toISOString().split('T')[0];

    setRevisions(prev =>
      prev.map(r =>
        r.id === revisionId
          ? {
              ...r,
              dueDate: dateStr,
              status: 'em_dia',
            }
          : r
      )
    );
  };

  const scheduleNewRevision = (data: any) => {
    const topic = topics.find(t => t.id === (data.topicId || data));
    if (!topic && typeof data !== 'object') return;

    const newRev: RevisionItem = {
      id: `rev-${Date.now()}`,
      topicId: data.topicId || topic?.id || '',
      topicName: data.topicName || topic?.name || '',
      subjectName: data.subjectName || topic?.subjectName || '',
      originalStudyDate: getTodayStr(),
      revisionStage: data.revisionStage || data.stage || 'D+1',
      dueDate: data.dueDate || getTodayStr(),
      suggestedQuestions: data.suggestedQuestions || 12,
      status: 'em_dia',
      priority: data.priority || topic?.priority || 'alta',
      targetExam: data.targetExam || topic?.examTarget || 'ambos',
    };

    setRevisions(prev => [...prev, newRev]);
  };

  // Question log
  const addQuestionRecord = (record: Omit<QuestionRecord, 'id'>) => {
    const correctCount = record.correctAnswers !== undefined ? record.correctAnswers : (record.correct || 0);
    const newRecord: QuestionRecord = {
      ...record,
      correctAnswers: correctCount,
      correct: correctCount,
      id: `q-${Date.now()}`,
    };
    setQuestionRecords(prev => [newRecord, ...prev]);

    // Update topic questions count
    setTopics(prev =>
      prev.map(t => {
        if (t.id === record.topicId) {
          return {
            ...t,
            questionsDone: t.questionsDone + record.totalQuestions,
            questionsCorrect: t.questionsCorrect + correctCount,
          };
        }
        return t;
      })
    );

    // Update daily study log questions
    setDailyLogs(prev => {
      const today = getTodayStr();
      const existing = prev.find(l => l.date === today);
      if (existing) {
        return prev.map(l =>
          l.date === today
            ? { ...l, questionsDone: l.questionsDone + record.totalQuestions }
            : l
        );
      } else {
        return [
          ...prev,
          {
            date: today,
            minutesStudied: 30,
            questionsDone: record.totalQuestions,
            tasksCompleted: 0,
            revisionsDone: 0,
          },
        ];
      }
    });

    playSuccessChime(settings.soundEffects);
    if (settings.confettiEnabled) {
      triggerConfetti();
    }
  };

  // Smart Overdue Tasks Rebalancer (Strictly respecting 2026-11-28 deadline)
  const rescheduleOverdueTasks = (strategy: 'diluir' | 'empurrar' | 'priorizar_critico' | 'reorganizacao_completa' = 'diluir') => {
    const result = rebalanceTasksRespectingDeadline(tasks, strategy, getTodayStr());
    setTasks(result.updatedTasks);

    // Also update overdue revisions
    const baseDate = new Date();
    setRevisions(prev =>
      prev.map(r => {
        if (r.dueDate < '2026-08-29' && !r.completed) {
          const nextDay = new Date(baseDate);
          nextDay.setDate(baseDate.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split('T')[0];
          const cappedDate = nextDayStr > HARD_DEADLINE_DATE ? HARD_DEADLINE_DATE : nextDayStr;
          return {
            ...r,
            dueDate: cappedDate,
            status: 'em_dia',
          };
        }
        return r;
      })
    );

    playSuccessChime(settings.soundEffects);
    if (settings.confettiEnabled) {
      triggerConfetti();
    }

    return result;
  };

  const resetScheduleToFullEdital = () => {
    const freshTasks = generateFullPostEditalTasks(topics);
    setTasks(freshTasks);
    playSuccessChime(settings.soundEffects);
    if (settings.confettiEnabled) {
      triggerConfetti();
    }
  };

  // Simulado actions
  const addSimulado = (simulado: Omit<SimuladoRecord, 'id' | 'scorePercentage'>) => {
    const totalQ = simulado.maxScore || simulado.totalQuestions || 60;
    const correctQ = simulado.finalScore || simulado.correct || 0;
    const pct = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;

    const newSim: SimuladoRecord = {
      ...simulado,
      id: `sim-${Date.now()}`,
      scorePercentage: pct,
      maxScore: totalQ,
      finalScore: correctQ,
    };
    setSimulados(prev => [newSim, ...prev]);
    playSuccessChime(settings.soundEffects);
    if (settings.confettiEnabled) {
      triggerConfetti();
    }
  };

  const addSimuladoRecord = addSimulado;

  const updateSimulado = (id: string, updates: Partial<SimuladoRecord>) => {
    setSimulados(prev =>
      prev.map(s => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          const totalQ = updated.maxScore || updated.totalQuestions || 60;
          const correctQ = updated.finalScore || updated.correct || 0;
          if (totalQ > 0) {
            updated.scorePercentage = Math.round((correctQ / totalQ) * 100);
          }
          return updated;
        }
        return s;
      })
    );
  };

  // Settings
  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setTopics(INITIAL_TOPICS);
    setTasks(INITIAL_TASKS);
    setRevisions(INITIAL_REVISIONS);
    setQuestionRecords(INITIAL_QUESTION_RECORDS);
    setSimulados(INITIAL_SIMULADOS);
    setDailyLogs(INITIAL_DAILY_LOGS);
    setSettings(INITIAL_USER_SETTINGS);
    localStorage.clear();
  };

  const resetAllData = resetToDefaults;

  const exportDataJSON = () => {
    const bundle = {
      topics,
      tasks,
      revisions,
      questionRecords,
      simulados,
      dailyLogs,
      settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(bundle, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.topics && parsed.tasks) {
        if (parsed.topics) setTopics(parsed.topics);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.revisions) setRevisions(parsed.revisions);
        if (parsed.questionRecords) setQuestionRecords(parsed.questionRecords);
        if (parsed.simulados) setSimulados(parsed.simulados);
        if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
        if (parsed.settings) setSettings(parsed.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Computed data
  const todayStr = '2026-08-29';
  const todayTasks = tasks.filter(t => t.date === todayStr && !t.isOverdue);
  const overdueTasks = tasks.filter(t => t.isOverdue || (t.date < todayStr && t.status !== 'concluido'));
  const todayRevisions = revisions.filter(r => r.dueDate === todayStr && !r.completed);
  const overdueRevisions = revisions.filter(r => r.dueDate < todayStr && !r.completed);

  const totalStudyMinutes = dailyLogs.reduce((acc, log) => acc + log.minutesStudied, 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  const totalQuestionsSolved = questionRecords.reduce((acc, q) => acc + q.totalQuestions, 0);
  const totalQuestionsCorrect = questionRecords.reduce((acc, q) => acc + (q.correctAnswers || q.correct || 0), 0);
  const overallAccuracy =
    totalQuestionsSolved > 0
      ? Math.round((totalQuestionsCorrect / totalQuestionsSolved) * 100)
      : 0;

  const studiedCount = topics.filter(t => t.status === 'estudado' || t.status === 'revisado' || t.status === 'dominado').length;
  const overallProgressPercentage = Math.round((studiedCount / (topics.length || 1)) * 100);

  return (
    <StudyContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedExam,
        setSelectedExam,
        topics,
        tasks,
        revisions,
        questionRecords,
        simulados,
        dailyLogs,
        settings,
        focusTask,
        isFocusModalOpen,
        openFocusMode,
        closeFocusMode,
        completeTask,
        postponeTask,
        toggleChecklistItem,
        addNewTask,
        updateTopic,
        updateTopicStatus,
        updateTopicPriority,
        completeRevision,
        postponeRevision,
        scheduleNewRevision,
        addQuestionRecord,
        rescheduleOverdueTasks,
        resetScheduleToFullEdital,
        addSimulado,
        addSimuladoRecord,
        updateSimulado,
        updateSettings,
        resetToDefaults,
        resetAllData,
        exportDataJSON,
        importDataJSON,
        todayTasks,
        overdueTasks,
        todayRevisions,
        overdueRevisions,
        totalStudyHours,
        totalQuestionsSolved,
        overallAccuracy,
        overallProgressPercentage,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
