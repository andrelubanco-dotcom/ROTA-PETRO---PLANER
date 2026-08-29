export type ExamTarget = 'transpetro' | 'petrobras' | 'ambos';

export type PriorityLevel = 'critica' | 'alta' | 'media' | 'baixa';

export type TopicStatus = 
  | 'nao_iniciado' 
  | 'em_andamento' 
  | 'estudado' 
  | 'revisado' 
  | 'dominado' 
  | 'atrasado';

export type TaskType = 'teoria' | 'revisao' | 'questoes' | 'simulado' | 'extra';

export type BlockType = 
  | 'bloco1_revisao' 
  | 'bloco2_conteudo' 
  | 'bloco3_questoes' 
  | 'bloco4_extra';

export type RevisionInterval = 'D+1' | 'D+7' | 'D+15' | 'D+21' | 'D+30' | 'D+45' | 'personalizado';
export type RevisionStage = RevisionInterval;

export type ErrorReason = 
  | 'falta_teoria' 
  | 'atencao_pegadinha' 
  | 'calculo_formula' 
  | 'interpretacao' 
  | 'falta_tempo';

export type ErrorDiagnosticType = 
  | 'conceito' 
  | 'formula' 
  | 'calculo' 
  | 'interpretacao' 
  | 'unidade' 
  | 'distracao' 
  | 'pegadinha';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Topic {
  id: string;
  code: string;
  name: string;
  subjectId: string;
  subjectName: string;
  block: 'Conhecimentos Básicos' | 'Conhecimentos Específicos';
  examTarget: ExamTarget;
  isCommon: boolean; // Present in both Transpetro & Petrobras
  priority: PriorityLevel;
  difficulty: 'facil' | 'media' | 'dificil';
  status: TopicStatus;
  revisionCount: number;
  questionsDone: number;
  questionsCorrect: number;
  lastStudiedDate?: string;
  nextReviewDate?: string;
  currentRevisionStage?: RevisionInterval;
  notes?: string;
  subtopics: string[];
  suggestedCesgranrioFilter?: {
    banca: string;
    orgao: string;
    assunto: string;
    subtopico: string;
    nivel: string;
    dicaFiltro: string;
  };
}

export interface Subject {
  id: string;
  name: string;
  category: 'basica' | 'especifica';
  color: string;
  iconName: string;
  totalTopics: number;
  studiedTopics: number;
}

export interface Task {
  id: string;
  title: string;
  topicId?: string;
  topicIds?: string[];
  subjectName: string;
  topicName: string;
  subtopic?: string;
  strategicReason?: string;
  type: TaskType;
  priority: PriorityLevel;
  suggestedDurationMinutes: number;
  blockType: BlockType;
  date: string; // YYYY-MM-DD
  status: 'pendente' | 'concluido' | 'adiado';
  completedAt?: string;
  isOverdue?: boolean;
  checklist: ChecklistItem[];
  notes?: string;
  targetExam: ExamTarget;
  revisionStage?: RevisionInterval;
  reviewLinks?: string[];
  highlight?: boolean;
  highlightColor?: string | null;
  pinned?: boolean;
  isFullSimulation?: boolean;
}

export interface RevisionItem {
  id: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  originalStudyDate?: string;
  revisionStage: RevisionInterval;
  dueDate: string;
  suggestedQuestions: number;
  status?: 'em_dia' | 'vencida' | 'concluida';
  completed?: boolean;
  priority: PriorityLevel;
  completedAt?: string;
  targetExam?: ExamTarget;
}

export interface QuestionRecord {
  id: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  date: string;
  totalQuestions: number;
  correctAnswers?: number;
  correct?: number;
  errors?: number;
  timeSpentMinutes?: number;
  banca: string;
  targetExam?: ExamTarget;
  examTarget?: ExamTarget;
  mainErrorReason?: ErrorReason;
  errorDiagnostics?: Partial<Record<ErrorDiagnosticType, number>>;
  notes?: string;
}

export interface SimuladoRecord {
  id: string;
  title: string;
  targetExam: ExamTarget;
  date: string;
  basicScore?: number;
  basicTotal?: number;
  specificScore?: number;
  specificTotal?: number;
  finalScore?: number;
  maxScore?: number;
  totalQuestions?: number;
  correct?: number;
  errors?: number;
  scorePercentage?: number;
  timeSpentMinutes: number;
  rankingPosition?: number;
  totalParticipants?: number;
  weakTopics?: string[];
  strongTopics?: string[];
  completed?: boolean;
  status?: 'pendente' | 'concluido';
  notes?: string;
}

export interface DailyStudyLog {
  date: string; // YYYY-MM-DD
  minutesStudied: number;
  questionsDone: number;
  tasksCompleted: number;
  revisionsDone: number;
}

export interface UserSettings {
  userName: string;
  targetExams: ExamTarget; // 'transpetro' | 'petrobras' | 'ambos'
  examDateTranspetro: string; // 2026-11-15
  examDatePetrobras: string;   // 2026-12-06
  dailyStudyHoursAvailable: number; // e.g. 3.5
  dailyHours?: number;
  preferredShift: 'manha' | 'tarde' | 'noite' | 'misto';
  studyDaysPerWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  revisionIntervals: string[]; // ['D+1', 'D+7', 'D+21', 'D+45']
  tdahSimplifiedMode: boolean;
  showTimer: boolean;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  dailyQuestionGoal: number;
  weeklyHoursGoal: number;
  monthlyRevisionGoal: number;
  soundEffects: boolean;
  confettiEnabled: boolean;
}

export type ActiveTab = 
  | 'dashboard'
  | 'plano_hoje'
  | 'cronograma'
  | 'materias_edital'
  | 'revisoes'
  | 'questoes'
  | 'desempenho'
  | 'recuperar_atrasos'
  | 'simulados'
  | 'google_workspace'
  | 'configuracoes';
