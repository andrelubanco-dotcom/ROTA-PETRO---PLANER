import { Task, Topic, PriorityLevel, TaskType, BlockType, ExamTarget } from '../types';

/**
 * Hard deadline for Transpetro (Dutos e Terminais) syllabus completion.
 */
export const HARD_DEADLINE_DATE = '2026-11-28';
export const HARD_DEADLINE_LABEL = '28/11/2026 — Prova Dutos e Terminais (Transpetro)';
export const START_DATE = '2026-08-29';

// Month definitions for the navigation bar
export interface MonthConfig {
  id: string; // e.g. '2026-08'
  label: string; // 'Agosto 2026'
  shortLabel: string; // 'Ago/26'
  year: number;
  monthIndex: number; // 0 = Jan, 7 = Aug, 10 = Nov, etc.
  daysInMonth: number;
  phase: 'intensivo_pos_edital' | 'reta_final' | 'pos_prova_admissao';
  badge: string;
}

export const MONTHS_LIST: MonthConfig[] = [
  {
    id: '2026-08',
    label: 'Agosto de 2026',
    shortLabel: 'Agosto 2026',
    year: 2026,
    monthIndex: 7, // August
    daysInMonth: 31,
    phase: 'intensivo_pos_edital',
    badge: 'Kickoff Pós-Edital',
  },
  {
    id: '2026-09',
    label: 'Setembro de 2026',
    shortLabel: 'Setembro 2026',
    year: 2026,
    monthIndex: 8, // September
    daysInMonth: 30,
    phase: 'intensivo_pos_edital',
    badge: 'Fase 1: Fundamentos & Sim. 1 e 2',
  },
  {
    id: '2026-10',
    label: 'Outubro de 2026',
    shortLabel: 'Outubro 2026',
    year: 2026,
    monthIndex: 9, // October
    daysInMonth: 31,
    phase: 'intensivo_pos_edital',
    badge: 'Fase 2: Integração & Sim. 3 e 4',
  },
  {
    id: '2026-11',
    label: 'Novembro de 2026',
    shortLabel: 'Novembro 2026',
    year: 2026,
    monthIndex: 10, // November
    daysInMonth: 30,
    phase: 'reta_final',
    badge: '⭐ PROVA TRANSPETRO (28/11)',
  },
  {
    id: '2026-12',
    label: 'Dezembro de 2026',
    shortLabel: 'Dezembro 2026',
    year: 2026,
    monthIndex: 11, // December
    daysInMonth: 31,
    phase: 'pos_prova_admissao',
    badge: 'Gabaritos & Prova Petrobras (13/12)',
  },
  {
    id: '2027-01',
    label: 'Janeiro de 2027',
    shortLabel: 'Janeiro 2027',
    year: 2027,
    monthIndex: 0, // January
    daysInMonth: 31,
    phase: 'pos_prova_admissao',
    badge: 'Resultados Preliminares & Recursos',
  },
  {
    id: '2027-02',
    label: 'Fevereiro de 2027',
    shortLabel: 'Fevereiro 2027',
    year: 2027,
    monthIndex: 1, // February
    daysInMonth: 28,
    phase: 'pos_prova_admissao',
    badge: 'Heteroidentificação & Biopsicossocial',
  },
  {
    id: '2027-03',
    label: 'Março de 2027',
    shortLabel: 'Março 2027',
    year: 2027,
    monthIndex: 2, // March
    daysInMonth: 31,
    phase: 'pos_prova_admissao',
    badge: 'Convocação & Admissão Transpetro',
  },
];

// Special milestone dates (6 Official Sunday Simulations + Kickoff + Exam Day)
export interface SpecialMilestone {
  date: string;
  title: string;
  type: 'prova_oficial' | 'simulado' | 'resultado' | 'reta_final';
  description: string;
  badgeColor: string;
}

export const SPECIAL_MILESTONES: Record<string, SpecialMilestone> = {
  '2026-08-29': {
    date: '2026-08-29',
    title: 'Início Oficial do Ciclo Intensivo Rota Petro',
    type: 'reta_final',
    description: 'Kickoff do plano de 92 dias até a aprovação. Diagnóstico inicial.',
    badgeColor: 'bg-teal-500 text-white',
  },
  '2026-09-13': {
    date: '2026-09-13',
    title: 'Simulado 01 — Simulado Completo Cesgranrio',
    type: 'simulado',
    description: '60 questões (40 específicas + 10 Port + 10 Mat) em 4 horas líquidas.',
    badgeColor: 'bg-orange-500 text-white',
  },
  '2026-09-27': {
    date: '2026-09-27',
    title: 'Simulado 02 — Simulado Completo Cesgranrio',
    type: 'simulado',
    description: '60 questões com foco no fechamento da Fase 1.',
    badgeColor: 'bg-orange-500 text-white',
  },
  '2026-10-11': {
    date: '2026-10-11',
    title: 'Simulado 03 — Simulado Completo Cesgranrio',
    type: 'simulado',
    description: '60 questões avaliando integração e bloco de fluidos/bombas.',
    badgeColor: 'bg-orange-500 text-white',
  },
  '2026-10-25': {
    date: '2026-10-25',
    title: 'Simulado 04 — Simulado Completo Cesgranrio',
    type: 'simulado',
    description: '60 questões com padrão de tempo e pressão da banca.',
    badgeColor: 'bg-orange-500 text-white',
  },
  '2026-11-08': {
    date: '2026-11-08',
    title: 'Simulado 05 — Simulado Geral Cesgranrio',
    type: 'simulado',
    description: 'Todas as matérias no peso oficial do edital antes da reta final.',
    badgeColor: 'bg-orange-500 text-white',
  },
  '2026-11-22': {
    date: '2026-11-22',
    title: 'Simulado 06 — Simulado Geral de Véspera',
    type: 'simulado',
    description: 'Último simulado completo de 4 horas antes da prova.',
    badgeColor: 'bg-rose-500 text-white',
  },
  '2026-11-28': {
    date: '2026-11-28',
    title: '🏆 PROVA TRANSPETRO — DUTOS E TERMINAIS',
    type: 'prova_oficial',
    description: 'DATA LIMITE FINAL. 100% do edital dominado!',
    badgeColor: 'bg-amber-500 text-slate-950 font-black',
  },
  '2026-12-13': {
    date: '2026-12-13',
    title: '⚓ PROVA PETROBRAS — ÊNFASE OPERAÇÃO',
    type: 'prova_oficial',
    description: 'Segunda oportunidade para quem optou por ambos os concursos.',
    badgeColor: 'bg-emerald-600 text-white font-bold',
  },
};

/**
 * Pareto P1 Topics that need high priority / flashcard highlight
 */
const P1_TOPIC_CODES = new Set([
  'CE-09', // Instrumentos de pressão, nível, temp, vazão
  'CE-10', // Mecânica Geral
  'CE-12', // Mecânica dos Fluidos
  'CE-15', // Resistência dos Materiais
  'CE-21', // Cálculo estequiométrico
  'CE-22', // Estudo dos gases
  'CE-26', // Unidades de concentração
  'CE-29', // Soluções aquosas
  'CE-02', // Transmissão e transmissores
  'CE-03', // Controle de processos
  'CE-17', // Equipamentos de processo (bombas)
  'CB-MAT-02', // Razão, proporção, porcentagem
  'CB-MAT-04', // Equações e sistemas
  'CB-MAT-07', // Estatística
  'CB-MAT-01', // Conjuntos numéricos
]);

/**
 * Generates full post-edital task schedule covering from 2026-08-29 to 2026-11-28 (92 days)
 * Strictly following the ROTA PETRO PLANNER master prompt structure:
 * - Mon-Sat: Exactly 4 cards: REVISÃO (30m), TEORIA (100m, Bloco A 50m + Bloco B 50m), QUESTÕES (60m), EXTRA (20m) = 210 min
 * - Sunday (Normal): Exclusively revisional (210 min: REVISÃO 60m, TEORIA/Revisão Central 100m, QUESTÕES 30m, EXTRA 20m)
 * - Sunday (Simulation): Single 240 min simulation card on 6 official dates (13/09, 27/09, 11/10, 25/10, 08/11, 22/11)
 * - Flashcard Highlights with "⚡ FLASHCARDS — MEGA IMPORTANTE"
 */
export function generateFullPostEditalTasks(topics: Topic[]): Task[] {
  const generatedTasks: Task[] = [];

  // Index topics
  const portTopics = topics.filter(t => t.subjectId === 'portugues');
  const matTopics = topics.filter(t => t.subjectId === 'matematica');
  const specificTopics = topics.filter(t => t.block === 'Conhecimentos Específicos');

  // Days list from 2026-08-29 to 2026-11-28
  const startDate = new Date(2026, 7, 29); // Aug 29 2026
  const endDate = new Date(2026, 10, 28);  // Nov 28 2026

  let currentDate = new Date(startDate);
  let dayIndex = 0;
  let specIndex = 0;
  let matIndex = 0;
  let portIndex = 0;

  while (currentDate <= endDate) {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

    // 1. Check if it's the official exam day (28/11/2026)
    if (dateStr === HARD_DEADLINE_DATE) {
      generatedTasks.push({
        id: `task-${dateStr}-exam`,
        title: '🏆 PROVA OFICIAL TRANSPETRO — DUTOS E TERMINAIS',
        topicName: 'Data Limite Final — Fundação Cesgranrio',
        subjectName: 'Concurso Transpetro 2026',
        subtopic: 'Apresentação no local de prova com documento oficial, caneta esferográfica preta de corpo transparente e cartão de confirmação',
        strategicReason: 'Dia da prova oficial Cesgranrio — 100% do edital coberto e revisado nos ciclos pós-edital.',
        type: 'simulado',
        priority: 'critica',
        suggestedDurationMinutes: 240,
        blockType: 'bloco2_conteudo',
        date: dateStr,
        status: 'pendente',
        targetExam: 'transpetro',
        checklist: [
          { id: 'ex-1', text: 'Documento original com foto e cartão de confirmação', done: false },
          { id: 'ex-2', text: 'Caneta preta de corpo transparente (mínimo 2 unidades)', done: false },
          { id: 'ex-3', text: 'Chegar com 1 hora de antecedência ao fechamento dos portões', done: false },
          { id: 'ex-4', text: 'Executar estratégia de prova: Português -> Específicos Dutos -> Matemática', done: false },
        ],
        notes: 'Momento da sua aprovação! Você cumpriu 100% do plano intensivo Rota Petro.',
      });
      break;
    }

    // 2. Check if it's a Sunday with a scheduled 4-hour Mock Exam (6 official dates)
    const isSimuladoDay = SPECIAL_MILESTONES[dateStr]?.type === 'simulado';

    if (dayOfWeek === 0 && isSimuladoDay) {
      const milestone = SPECIAL_MILESTONES[dateStr];
      generatedTasks.push({
        id: `task-${dateStr}-simulado`,
        title: milestone.title,
        topicName: 'Simulado Oficial Cesgranrio (60 Questões)',
        subjectName: 'Simulados Rota Petro',
        subtopic: '40 Conhecimentos Específicos + 10 Português + 10 Matemática em 4 horas (240 min)',
        strategicReason: 'Avaliação diagnóstica completa de tempo, ritmo de resolução e identificação de erros por tipo de falha.',
        type: 'simulado',
        priority: 'critica',
        suggestedDurationMinutes: 240,
        blockType: 'bloco2_conteudo',
        date: dateStr,
        status: 'pendente',
        targetExam: 'ambos',
        isFullSimulation: true,
        checklist: [
          { id: `sim-${dateStr}-1`, text: 'Executar sem consulta em ambiente silencioso cronometrando 4 horas', done: false },
          { id: `sim-${dateStr}-2`, text: 'Preencher folha de respostas e registrar tempo por bloco', done: false },
          { id: `sim-${dateStr}-3`, text: 'Classificar erros: Conceito, Fórmula, Cálculo, Interpretação, Unidade ou Pegadinha', done: false },
          { id: `sim-${dateStr}-4`, text: 'Registrar pontuação e recalibrar prioridades para a semana seguinte', done: false },
        ],
      });
    }
    // 3. Sunday without simulation (Exclusively revisional - exactly 210 min across 4 visual cards)
    else if (dayOfWeek === 0) {
      const currentSpecRev = specificTopics[(specIndex + 1) % specificTopics.length];
      const currentMatRev = matTopics[(matIndex + 1) % matTopics.length];

      // Card 1: REVISÃO (60 min)
      generatedTasks.push({
        id: `task-${dateStr}-rev`,
        title: `Revisão Ativa & Flashcards Vencidos (Ciclo 1-7-15-30)`,
        topicId: currentSpecRev?.id,
        topicIds: [currentSpecRev?.id || 'ce-01'],
        subjectName: 'Revisão Dominical',
        topicName: 'Revisões Acumuladas da Semana',
        subtopic: 'Ciclos espaçados e recuperação ativa dos tópicos mais cobrados',
        strategicReason: 'Domingo sem teoria nova: foco exclusivo em consolidar a memória de longo prazo e eliminar dúvidas.',
        type: 'revisao',
        priority: 'alta',
        suggestedDurationMinutes: 60,
        blockType: 'bloco1_revisao',
        date: dateStr,
        status: 'pendente',
        targetExam: 'ambos',
        checklist: [
          { id: `sun-${dateStr}-1`, text: 'Recuperação ativa das anotações e fichamentos da semana', done: false },
          { id: `sun-${dateStr}-2`, text: 'Revisar flashcards com taxa de acerto inferior a 80%', done: false },
        ],
      });

      // Card 2: TEORIA (100 min, titled "Revisão Central — 2 blocos de 50 min", no new theory)
      generatedTasks.push({
        id: `task-${dateStr}-teoria-rev`,
        title: `Revisão Central — 2 blocos de 50 min`,
        topicId: currentSpecRev?.id,
        topicIds: [currentSpecRev?.id || 'ce-12', currentMatRev?.id || 'mat-02'],
        subjectName: 'Revisão e Reconstrução de Conceitos',
        topicName: 'Revisão Central Integrada',
        subtopic: `${currentSpecRev?.name || 'Mecânica dos Fluidos'} + ${currentMatRev?.name || 'Matemática'}`,
        strategicReason: 'Reconstrução ativa de conceitos complexos e fórmulas operacionais já estudadas sem introduzir matéria nova.',
        type: 'teoria',
        priority: 'alta',
        suggestedDurationMinutes: 100,
        blockType: 'bloco2_conteudo',
        date: dateStr,
        status: 'pendente',
        targetExam: 'ambos',
        checklist: [
          { id: `sun-t-${dateStr}-1`, text: `Bloco A — 50 min: Reconstrução conceitual de ${currentSpecRev?.name || 'Específicos'}`, done: false },
          { id: `sun-t-${dateStr}-2`, text: `Bloco B — 50 min: Reconstrução e fórmulas de ${currentMatRev?.name || 'Matemática'}`, done: false },
        ],
      });

      // Card 3: QUESTÕES (30 min)
      generatedTasks.push({
        id: `task-${dateStr}-questoes-rev`,
        title: `Refazer Erros & Questões de Revisão Cesgranrio`,
        topicId: currentSpecRev?.id,
        subjectName: 'Caderno de Erros',
        topicName: 'Questões de Fixação',
        subtopic: 'Resolução das questões erradas durante a semana',
        strategicReason: 'Treino defensivo para zerar as reincidências de erros conceituais e de cálculo.',
        type: 'questoes',
        priority: 'alta',
        suggestedDurationMinutes: 30,
        blockType: 'bloco3_questoes',
        date: dateStr,
        status: 'pendente',
        targetExam: 'ambos',
        checklist: [
          { id: `sun-q-${dateStr}-1`, text: 'Refazer questões erradas no caderno de erros', done: false },
          { id: `sun-q-${dateStr}-2`, text: 'Verificar se o erro foi por pegadinha, falta de fórmula ou interpretação', done: false },
        ],
      });

      // Card 4: EXTRA (20 min)
      generatedTasks.push({
        id: `task-${dateStr}-extra`,
        title: `Fechamento: Flashcards e Planejamento da Próxima Semana`,
        subjectName: 'Planejamento e Organização',
        topicName: 'Planejamento Semanal',
        subtopic: 'Ajuste de metas e baralho de fórmulas',
        strategicReason: 'Preparação do ambiente mental e alinhamento dos objetivos para a próxima semana.',
        type: 'extra',
        priority: 'media',
        suggestedDurationMinutes: 20,
        blockType: 'bloco4_extra',
        date: dateStr,
        status: 'pendente',
        targetExam: 'ambos',
        checklist: [
          { id: `sun-e-${dateStr}-1`, text: 'Verificar agenda da semana seguinte e cronograma de estudos', done: false },
          { id: `sun-e-${dateStr}-2`, text: 'Organizar baralho de flashcards mega importantes', done: false },
        ],
      });
    }
    // 4. Monday to Saturday (Exactly 4 cards: 30 + 100 + 60 + 20 = 210 min)
    else {
      // Pick 2 Specific Topics for Bloco A and Bloco B
      const specTopicA = specificTopics[specIndex % specificTopics.length];
      const specTopicB = specificTopics[(specIndex + 1) % specificTopics.length];
      specIndex += 2;

      // Rotate Basic topic (Matemática with 25% reinforcement, Português maintenance ~5%)
      const isMatematicaDay = dayIndex % 4 !== 0; // 3 out of 4 days Math, 1 Português
      const currentBasic = isMatematicaDay
        ? matTopics[matIndex++ % matTopics.length]
        : portTopics[portIndex++ % portTopics.length];

      const isP1Topic = P1_TOPIC_CODES.has(specTopicA?.code) || P1_TOPIC_CODES.has(specTopicB?.code) || currentBasic?.code === 'CB-MAT-02';

      // =========================================================================
      // CARD 1: REVISÃO — 30 min
      // =========================================================================
      generatedTasks.push({
        id: `task-${dateStr}-card1-rev`,
        title: `Revisão D+1 / D+7: ${currentBasic?.name || 'Matemática e Fórmulas'}`,
        topicId: currentBasic?.id,
        topicIds: [currentBasic?.id || 'mat-02'],
        subjectName: currentBasic?.subjectName || 'Conhecimentos Básicos',
        topicName: currentBasic?.name || 'Revisão Diária',
        subtopic: currentBasic?.subtopics?.[0] || 'Recuperação ativa curta e revisão de fórmulas',
        strategicReason: 'Revisão espaçada (D+1, D+7, D+15, D+30) com recuperação ativa antes do início do bloco teórico.',
        type: 'revisao',
        priority: currentBasic?.priority || 'alta',
        suggestedDurationMinutes: 30,
        blockType: 'bloco1_revisao',
        date: dateStr,
        status: 'pendente',
        targetExam: 'ambos',
        checklist: [
          { id: `c1-${dateStr}-1`, text: `Recuperação ativa curta de ${currentBasic?.name || 'tópico'}`, done: false },
          { id: `c1-${dateStr}-2`, text: 'Resolver 3 a 5 flashcards ou questões rápidas de fixação', done: false },
        ],
      });

      // =========================================================================
      // CARD 2: TEORIA — 100 min (Single card titled "Teoria Central" with Bloco A 50m + Bloco B 50m)
      // =========================================================================
      generatedTasks.push({
        id: `task-${dateStr}-card2-teoria`,
        title: 'Teoria Central',
        topicId: specTopicA?.id,
        topicIds: [specTopicA?.id || 'ce-12', specTopicB?.id || 'ce-09'],
        subjectName: 'Conhecimentos Específicos',
        topicName: `${specTopicA?.name || 'Específica'} & ${specTopicB?.name || 'Específica'}`,
        subtopic: `Bloco A: ${specTopicA?.name} | Bloco B: ${specTopicB?.name}`,
        strategicReason: 'Estudo teórico aprofundado dividido em dois blocos focados de 50 minutos para maximizar a retenção.',
        type: 'teoria',
        priority: isP1Topic ? 'critica' : 'alta',
        suggestedDurationMinutes: 100,
        blockType: 'bloco2_conteudo',
        date: dateStr,
        status: 'pendente',
        targetExam: 'ambos',
        checklist: [
          { 
            id: `c2-${dateStr}-blocoA`, 
            text: `Bloco A — 50 min: ${specTopicA?.name} (Objetivo: ${specTopicA?.subtopics?.[0] || 'Compreender fundamentos e relações essenciais'})`, 
            done: false 
          },
          { 
            id: `c2-${dateStr}-blocoB`, 
            text: `Bloco B — 50 min: ${specTopicB?.name} (Objetivo: ${specTopicB?.subtopics?.[0] || 'Aplicar conceitos e destacar fórmulas operacionais'})`, 
            done: false 
          },
        ],
      });

      // =========================================================================
      // CARD 3: QUESTÕES — 60 min (Cesgranrio standard, autoral ou prova real)
      // =========================================================================
      generatedTasks.push({
        id: `task-${dateStr}-card3-questoes`,
        title: `Treino de Questões CESGRANRIO — ${specTopicA?.code || 'CE'} & ${specTopicB?.code || 'CE'}`,
        topicId: specTopicA?.id,
        topicIds: [specTopicA?.id || 'ce-12', specTopicB?.id || 'ce-09'],
        subjectName: 'Bateria de Questões',
        topicName: `${specTopicA?.name || 'Específica'}`,
        subtopic: 'QUESTÃO AUTORAL — ESTILO CESGRANRIO e provas anteriores Transpetro/Petrobras',
        strategicReason: 'Treino intensivo de aplicação e velocidade, registrando acertos, erros e tipos de falhas.',
        type: 'questoes',
        priority: 'critica',
        suggestedDurationMinutes: 60,
        blockType: 'bloco3_questoes',
        date: dateStr,
        status: 'pendente',
        targetExam: 'ambos',
        checklist: [
          { id: `c3-${dateStr}-1`, text: `Resolver 15 a 20 questões de ${specTopicA?.name} e ${specTopicB?.name}`, done: false },
          { id: `c3-${dateStr}-2`, text: 'Classificar erros: Conceito, Fórmula, Cálculo, Interpretação ou Pegadinha', done: false },
          { id: `c3-${dateStr}-3`, text: 'Registrar quantitativo e taxa de acerto no painel de questões', done: false },
        ],
      });

      // =========================================================================
      // CARD 4: EXTRA — 20 min (Fechamento: síntese, fórmulas e dicas de operação)
      // =========================================================================
      const hasFlashcardHighlight = isP1Topic || dayIndex % 2 === 0;

      generatedTasks.push({
        id: `task-${dateStr}-card4-extra`,
        title: hasFlashcardHighlight 
          ? `⚡ FLASHCARDS — MEGA IMPORTANTE: Fechamento, Síntese & Fórmulas`
          : `Fechamento: síntese, fórmulas e dicas de operação`,
        topicId: specTopicA?.id,
        topicIds: [specTopicA?.id || 'ce-12'],
        subjectName: 'Fechamento Operacional',
        topicName: 'Síntese de Fórmulas e Macetes',
        subtopic: `${specTopicA?.name} — Fórmulas essenciais, unidades SI e dicas de operação`,
        strategicReason: 'Consolidação final do dia: criação de flashcards de alto valor, mapa de fórmulas e preparação do próximo ciclo.',
        type: 'extra',
        priority: hasFlashcardHighlight ? 'critica' : 'media',
        suggestedDurationMinutes: 20,
        blockType: 'bloco4_extra',
        date: dateStr,
        status: 'pendente',
        targetExam: 'ambos',
        highlight: hasFlashcardHighlight,
        highlightColor: hasFlashcardHighlight ? 'amber' : null,
        pinned: hasFlashcardHighlight,
        checklist: [
          { id: `c4-${dateStr}-1`, text: 'Frente: Pergunta conceitual ou relação de cálculo chave', done: false },
          { id: `c4-${dateStr}-2`, text: 'Verso: Resposta direta, fórmula e unidades no SI', done: false },
          { id: `c4-${dateStr}-3`, text: 'Macete / Ponto de Atenção da Cesgranrio e Erro Comum', done: false },
          { id: `c4-${dateStr}-4`, text: 'Registrar novos flashcards para revisão no ciclo D+1', done: false },
        ],
      });
    }

    // Advance date
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }

  return generatedTasks;
}

/**
 * Smart Rebalancing of Overdue Tasks strictly bounded by 2026-11-28.
 */
export function rebalanceTasksRespectingDeadline(
  tasks: Task[],
  strategy: 'diluir' | 'empurrar' | 'priorizar_critico' | 'reorganizacao_completa',
  todayDateStr: string = '2026-08-29'
): { updatedTasks: Task[]; movedCount: number; message: string } {
  const deadline = HARD_DEADLINE_DATE;
  let movedCount = 0;

  // Identify overdue tasks (before today or marked overdue)
  const overdueTasks = tasks.filter(
    t => (t.isOverdue || t.date < todayDateStr) && t.status !== 'concluido'
  );

  if (overdueTasks.length === 0) {
    return {
      updatedTasks: tasks,
      movedCount: 0,
      message: 'Nenhuma tarefa em atraso detectada para redistribuição.',
    };
  }

  const priorityWeight: Record<PriorityLevel, number> = {
    critica: 4,
    alta: 3,
    media: 2,
    baixa: 1,
  };

  const sortedOverdue = [...overdueTasks].sort((a, b) => {
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const overdueIds = new Set(sortedOverdue.map(t => t.id));
  const todayDate = new Date(todayDateStr);

  const updatedTasks = tasks.map(t => {
    if (overdueIds.has(t.id)) {
      movedCount++;
      const index = sortedOverdue.findIndex(s => s.id === t.id);

      let targetDate = new Date(todayDate);

      if (strategy === 'diluir') {
        // Distribute 1 task per day across the next 7-14 days
        const offset = (index % 12) + 1;
        targetDate.setDate(todayDate.getDate() + offset);
      } else if (strategy === 'priorizar_critico') {
        // Critical go to next 1-3 days, others distributed later
        const offset = t.priority === 'critica' || t.priority === 'alta' 
          ? (index % 3) + 1 
          : (index % 10) + 4;
        targetDate.setDate(todayDate.getDate() + offset);
      } else if (strategy === 'empurrar') {
        // Linear shift (+2 days)
        targetDate.setDate(todayDate.getDate() + 2 + Math.floor(index / 2));
      } else {
        // Reorganização completa
        const offset = (index % 14) + 1;
        targetDate.setDate(todayDate.getDate() + offset);
      }

      // STRICT CAP: Never exceed the final deadline 2026-11-28 (Transpetro Exam Date)
      const targetDateStr = targetDate.toISOString().split('T')[0];
      const finalDateStr = targetDateStr > deadline ? deadline : targetDateStr;

      return {
        ...t,
        date: finalDateStr,
        status: 'pendente' as const,
        isOverdue: false,
        notes: (t.notes ? t.notes + ' ' : '') + `[Reorganizado pelo protocolo Rota Petro. Data limite: 28/11/2026]`,
      };
    }
    return t;
  });

  const strategyLabels = {
    diluir: 'Diluição Suave (1 a 2 blocos/dia nos próximos dias)',
    priorizar_critico: 'Priorização de Tópicos Críticos P1 da Cesgranrio',
    empurrar: 'Deslocamento Linear com Teto em 28/11/2026',
    reorganizacao_completa: 'Reorganização Global Pós-Edital Rota Petro',
  };

  return {
    updatedTasks,
    movedCount,
    message: `${movedCount} tarefa(s) reajustada(s) com sucesso através da estratégia "${strategyLabels[strategy]}", respeitando rigorosamente a data limite da prova em 28/11/2026 e o teto diário de 210 minutos.`,
  };
}
