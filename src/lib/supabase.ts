import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task, Topic, RevisionItem, QuestionRecord, SimuladoRecord, UserSettings, DailyStudyLog } from '../types';

const STORAGE_KEY_URL = 'rota_petro_supabase_url';
const STORAGE_KEY_KEY = 'rota_petro_supabase_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
}

/**
 * Get current Supabase credentials (from Vite env or user custom storage)
 */
export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  const customUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const customKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  if (customUrl && customKey) {
    return {
      url: customUrl,
      anonKey: customKey,
      isConfigured: true,
      source: 'custom',
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  // Invalidate cached client
  cachedClient = null;
}

export function clearCustomSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

/**
 * Get or initialize the Supabase client
 */
export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSupabaseConfig();
  if (!config.isConfigured || !config.url || !config.anonKey) {
    return null;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
}

/**
 * Test connectivity with Supabase project
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = customUrl || getSupabaseConfig().url;
    const key = customKey || getSupabaseConfig().anonKey;

    if (!url || !key) {
      return { success: false, message: 'URL do Projeto ou Chave Anon não informadas.' };
    }

    const client = createClient(url, key);
    // Simple ping to check response
    const { error } = await client.from('study_profiles').select('id').limit(1);
    
    // If error is 42P01 (relation does not exist), the connection works but tables need to be created
    if (error && error.code === '42P01') {
      return { 
        success: true, 
        message: 'Conectado com sucesso ao Supabase! (As tabelas precisam ser criadas com o script SQL fornecido).' 
      };
    }

    if (error && error.message.includes('Invalid API key')) {
      return { success: false, message: 'Chave Anon inválida ou expirada.' };
    }

    if (error && !error.message.includes('permission denied')) {
      return { success: true, message: `Conexão bem-sucedida! (${error.message || 'Pronto para uso'})` };
    }

    return { success: true, message: 'Conexão estabelecida com sucesso com o Supabase!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Falha ao conectar ao servidor do Supabase.' };
  }
}

/**
 * Push all local data into Supabase tables for the given user profile
 */
export async function pushAllToSupabase(payload: {
  userId: string;
  settings: UserSettings;
  tasks: Task[];
  topics: Topic[];
  revisions: RevisionItem[];
  questions: QuestionRecord[];
  simulados: SimuladoRecord[];
  dailyLogs: DailyStudyLog[];
}): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Supabase não está configurado.' };
  }

  try {
    const { userId, settings, tasks, topics, revisions, questions, simulados, dailyLogs } = payload;

    // 1. Upsert Profile / Settings
    await supabase.from('study_profiles').upsert({
      id: userId,
      user_name: settings.userName,
      target_exams: settings.targetExams,
      exam_date_transpetro: settings.examDateTranspetro,
      exam_date_petrobras: settings.examDatePetrobras,
      daily_hours: settings.dailyStudyHoursAvailable,
      preferred_shift: settings.preferredShift,
      tdah_mode: settings.tdahSimplifiedMode,
      sound_effects: settings.soundEffects,
      confetti_enabled: settings.confettiEnabled,
      raw_settings: settings,
      updated_at: new Date().toISOString(),
    });

    // 2. Sync Topics
    if (topics && topics.length > 0) {
      const topicRows = topics.map(t => ({
        user_id: userId,
        topic_id: t.id,
        code: t.code,
        name: t.name,
        subject_id: t.subjectId,
        subject_name: t.subjectName,
        block: t.block,
        exam_target: t.examTarget,
        priority: t.priority,
        status: t.status,
        revision_count: t.revisionCount,
        questions_done: t.questionsDone,
        questions_correct: t.questionsCorrect,
        last_studied_date: t.lastStudiedDate || null,
        next_review_date: t.nextReviewDate || null,
        current_revision_stage: t.currentRevisionStage || null,
        notes: t.notes || null,
        raw_data: t,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('study_topics').upsert(topicRows, { onConflict: 'user_id,topic_id' });
    }

    // 3. Sync Tasks
    if (tasks && tasks.length > 0) {
      const taskRows = tasks.map(tk => ({
        user_id: userId,
        task_id: tk.id,
        title: tk.title,
        subject_name: tk.subjectName,
        topic_name: tk.topicName,
        subtopic: tk.subtopic || null,
        type: tk.type,
        priority: tk.priority,
        suggested_duration_minutes: tk.suggestedDurationMinutes,
        block_type: tk.blockType,
        date: tk.date,
        status: tk.status,
        completed_at: tk.completedAt || null,
        checklist: tk.checklist || [],
        notes: tk.notes || null,
        target_exam: tk.targetExam,
        highlight: tk.highlight || false,
        raw_data: tk,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('study_tasks').upsert(taskRows, { onConflict: 'user_id,task_id' });
    }

    // 4. Sync Revisions
    if (revisions && revisions.length > 0) {
      const revRows = revisions.map(r => ({
        user_id: userId,
        revision_id: r.id,
        topic_id: r.topicId,
        topic_name: r.topicName,
        subject_name: r.subjectName,
        revision_stage: r.revisionStage,
        due_date: r.dueDate,
        suggested_questions: r.suggestedQuestions,
        completed: r.completed || false,
        priority: r.priority,
        completed_at: r.completedAt || null,
        target_exam: r.targetExam || 'ambos',
        raw_data: r,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('study_revisions').upsert(revRows, { onConflict: 'user_id,revision_id' });
    }

    // 5. Sync Questions
    if (questions && questions.length > 0) {
      const qRows = questions.map(q => ({
        user_id: userId,
        question_id: q.id,
        topic_id: q.topicId,
        topic_name: q.topicName,
        subject_name: q.subjectName,
        date: q.date,
        total_questions: q.totalQuestions,
        correct_answers: q.correctAnswers ?? q.correct ?? 0,
        errors: q.errors ?? 0,
        banca: q.banca,
        main_error_reason: q.mainErrorReason || null,
        raw_data: q,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('study_questions').upsert(qRows, { onConflict: 'user_id,question_id' });
    }

    // 6. Sync Simulados
    if (simulados && simulados.length > 0) {
      const simRows = simulados.map(s => ({
        user_id: userId,
        simulado_id: s.id,
        title: s.title,
        target_exam: s.targetExam,
        date: s.date,
        final_score: s.finalScore || 0,
        max_score: s.maxScore || 60,
        score_percentage: s.scorePercentage || 0,
        time_spent_minutes: s.timeSpentMinutes,
        completed: s.completed ?? (s.status === 'concluido'),
        notes: s.notes || null,
        raw_data: s,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('study_simulados').upsert(simRows, { onConflict: 'user_id,simulado_id' });
    }

    return { success: true, message: 'Todos os dados e avanços foram salvos no Supabase com sucesso!' };
  } catch (err: any) {
    console.error('Erro ao sincronizar com o Supabase:', err);
    return { success: false, message: err?.message || 'Erro ao sincronizar dados com o Supabase.' };
  }
}

/**
 * Fetch data for user from Supabase
 */
export async function pullFromSupabase(userId: string): Promise<{
  success: boolean;
  data?: {
    settings?: UserSettings;
    tasks?: Task[];
    topics?: Topic[];
    revisions?: RevisionItem[];
    questions?: QuestionRecord[];
    simulados?: SimuladoRecord[];
  };
  message: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Supabase não está configurado.' };
  }

  try {
    const [profileRes, topicsRes, tasksRes, revisionsRes, questionsRes, simuladosRes] = await Promise.all([
      supabase.from('study_profiles').select('*').eq('id', userId).single(),
      supabase.from('study_topics').select('*').eq('user_id', userId),
      supabase.from('study_tasks').select('*').eq('user_id', userId),
      supabase.from('study_revisions').select('*').eq('user_id', userId),
      supabase.from('study_questions').select('*').eq('user_id', userId),
      supabase.from('study_simulados').select('*').eq('user_id', userId),
    ]);

    return {
      success: true,
      message: 'Dados recuperados do Supabase com sucesso!',
      data: {
        settings: profileRes.data?.raw_settings,
        topics: topicsRes.data?.map(d => d.raw_data || d),
        tasks: tasksRes.data?.map(d => d.raw_data || d),
        revisions: revisionsRes.data?.map(d => d.raw_data || d),
        questions: questionsRes.data?.map(d => d.raw_data || d),
        simulados: simuladosRes.data?.map(d => d.raw_data || d),
      },
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro ao baixar dados do Supabase.' };
  }
}

/**
 * Complete SQL DDL Migration schema to set up Supabase database in 1 click
 */
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- BANCO DE DADOS: ROTA PETRO PLANNER (TRANSPETRO & PETROBRAS 2026)
-- Execute este script no SQL Editor do seu projeto Supabase
-- =========================================================================

-- 1. Tabela de Perfil e Configurações do Aluno
CREATE TABLE IF NOT EXISTS public.study_profiles (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL DEFAULT 'Aluno Rota Petro',
    target_exams TEXT NOT NULL DEFAULT 'ambos',
    exam_date_transpetro TEXT DEFAULT '2026-11-15',
    exam_date_petrobras TEXT DEFAULT '2026-12-06',
    daily_hours NUMERIC(4,2) DEFAULT 3.5,
    preferred_shift TEXT DEFAULT 'noite',
    tdah_mode BOOLEAN DEFAULT FALSE,
    sound_effects BOOLEAN DEFAULT TRUE,
    confetti_enabled BOOLEAN DEFAULT TRUE,
    raw_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Tópicos do Edital (38 Tópicos Específicos + Básicas)
CREATE TABLE IF NOT EXISTS public.study_topics (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    block TEXT NOT NULL,
    exam_target TEXT NOT NULL DEFAULT 'ambos',
    priority TEXT NOT NULL DEFAULT 'alta',
    status TEXT NOT NULL DEFAULT 'nao_iniciado',
    revision_count INT DEFAULT 0,
    questions_done INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    last_studied_date DATE,
    next_review_date DATE,
    current_revision_stage TEXT,
    notes TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT study_topics_user_topic_unique UNIQUE (user_id, topic_id)
);

-- 3. Tabela de Tarefas e Calendário em 4 Blocos Diários (210 min)
CREATE TABLE IF NOT EXISTS public.study_tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    subtopic TEXT,
    type TEXT NOT NULL,
    priority TEXT NOT NULL,
    suggested_duration_minutes INT NOT NULL DEFAULT 30,
    block_type TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    completed_at TIMESTAMP WITH TIME ZONE,
    checklist JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    target_exam TEXT DEFAULT 'ambos',
    highlight BOOLEAN DEFAULT FALSE,
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT study_tasks_user_task_unique UNIQUE (user_id, task_id)
);

-- 4. Tabela de Revisões Espaçadas (Ciclos 1-7-15-30)
CREATE TABLE IF NOT EXISTS public.study_revisions (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    revision_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    revision_stage TEXT NOT NULL,
    due_date DATE NOT NULL,
    suggested_questions INT DEFAULT 5,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'alta',
    completed_at TIMESTAMP WITH TIME ZONE,
    target_exam TEXT DEFAULT 'ambos',
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT study_revisions_user_rev_unique UNIQUE (user_id, revision_id)
);

-- 5. Tabela do Caderno de Erros e Banco de Questões
CREATE TABLE IF NOT EXISTS public.study_questions (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    date DATE NOT NULL,
    total_questions INT NOT NULL DEFAULT 1,
    correct_answers INT NOT NULL DEFAULT 0,
    errors INT NOT NULL DEFAULT 0,
    banca TEXT DEFAULT 'CESGRANRIO',
    main_error_reason TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT study_questions_user_q_unique UNIQUE (user_id, question_id)
);

-- 6. Tabela dos 6 Simulados Oficiais (60 questões cada)
CREATE TABLE IF NOT EXISTS public.study_simulados (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    simulado_id TEXT NOT NULL,
    title TEXT NOT NULL,
    target_exam TEXT NOT NULL,
    date DATE NOT NULL,
    final_score NUMERIC(5,2) DEFAULT 0,
    max_score NUMERIC(5,2) DEFAULT 60,
    score_percentage NUMERIC(5,2) DEFAULT 0,
    time_spent_minutes INT DEFAULT 240,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT study_simulados_user_sim_unique UNIQUE (user_id, simulado_id)
);

-- Habilitar Políticas de Segurança RLS (Row Level Security)
ALTER TABLE public.study_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_simulados ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público com Anon Key para sincronização simplificada
CREATE POLICY "Permitir acesso completo para o usuário anon/autenticado" ON public.study_profiles FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo para topicos" ON public.study_topics FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo para tarefas" ON public.study_tasks FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo para revisoes" ON public.study_revisions FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo para questoes" ON public.study_questions FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo para simulados" ON public.study_simulados FOR ALL USING (true);
`;
