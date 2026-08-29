import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Task, RevisionItem, SimuladoRecord, Topic } from '../types';

// Scopes requested for Drive, Calendar, and Sheets
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token will be requested on interactive login if expired
        if (onAuthSuccess && cachedAccessToken) {
          onAuthSuccess(user, cachedAccessToken);
        } else if (onAuthFailure) {
          onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter o Access Token do Google Workspace.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro na autenticação do Google Workspace:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ==========================================
// 1. GOOGLE DRIVE API
// ==========================================

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  size?: string;
}

export const listDriveFiles = async (searchTerm = ''): Promise<DriveFileItem[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google.');

  let q = "trashed = false";
  if (searchTerm.trim()) {
    q += ` and name contains '${searchTerm.replace(/'/g, "\\'")}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,webViewLink,webContentLink,iconLink,modifiedTime,size)&orderBy=modifiedTime desc&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erro ao listar arquivos do Google Drive.');
  }

  const data = await res.json();
  return data.files || [];
};

export const saveBackupToGoogleDrive = async (
  backupData: any,
  fileName = `ROTA_PETRO_Backup_${new Date().toISOString().split('T')[0]}.json`
): Promise<{ id: string; name: string; webViewLink?: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google.');

  const fileContent = JSON.stringify(backupData, null, 2);
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Backup completo do Plano de Estudos ROTA PETRO (Transpetro e Petrobras)'
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append(
    'file',
    new Blob([fileContent], { type: 'application/json' })
  );

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erro ao salvar arquivo no Google Drive.');
  }

  return await res.json();
};

// ==========================================
// 2. GOOGLE CALENDAR API
// ==========================================

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  colorId?: string;
}

export const listCalendarEvents = async (timeMin?: string): Promise<CalendarEventItem[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google.');

  const from = timeMin || new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(from)}&maxResults=25&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erro ao carregar eventos da Google Agenda.');
  }

  const data = await res.json();
  return data.items || [];
};

export const createCalendarEvent = async (event: {
  summary: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  durationMinutes?: number;
}): Promise<CalendarEventItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google.');

  let startObj: { dateTime?: string; date?: string };
  let endObj: { dateTime?: string; date?: string };

  if (event.startTime) {
    const startDateTime = new Date(`${event.startDate}T${event.startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (event.durationMinutes || 60) * 60000);
    startObj = { dateTime: startDateTime.toISOString() };
    endObj = { dateTime: endDateTime.toISOString() };
  } else {
    // All-day event
    startObj = { date: event.startDate };
    const nextDay = new Date(new Date(event.startDate).getTime() + 86400000)
      .toISOString()
      .split('T')[0];
    endObj = { date: nextDay };
  }

  const body = {
    summary: event.summary,
    description: event.description || 'Sessão de estudos agendada via ROTA PETRO.',
    start: startObj,
    end: endObj,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'popup', minutes: 60 }
      ]
    },
    colorId: '9' // Blueish / Dark Cyan
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erro ao criar evento na Google Agenda.');
  }

  return await res.json();
};

export const syncSimuladosToCalendar = async (
  simulados: SimuladoRecord[]
): Promise<{ createdCount: number }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google.');

  let createdCount = 0;
  for (const sim of simulados) {
    const simDate = sim.date;
    const body = {
      summary: `📝 SIMULADO CESGRANRIO: ${sim.title}`,
      description: `Simulado programado ROTA PETRO (Ênfase 4: Dutos e Terminais).\n- Estrutura: 20 Questões Conhecimentos Básicos + 40 Questões Conhecimentos Específicos.\n- Duração limite oficial: 4 horas.\n- Notas/Orientações: ${sim.notes || 'Executar em ambiente silencioso e cronometrado.'}`,
      start: {
        dateTime: `${simDate}T08:00:00-03:00`
      },
      end: {
        dateTime: `${simDate}T12:00:00-03:00`
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 1440 }, // 1 day before
          { method: 'popup', minutes: 60 }
        ]
      },
      colorId: '6' // Orange / Tangerine
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      createdCount++;
    }
  }

  return { createdCount };
};

// ==========================================
// 3. GOOGLE SHEETS API
// ==========================================

export interface SpreadsheetCreationResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export const createStudyTrackerSpreadsheet = async (
  simulados: SimuladoRecord[],
  topics: Topic[],
  userName: string
): Promise<SpreadsheetCreationResult> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google.');

  const title = `ROTA PETRO — Acompanhamento de Estudos (${userName})`;

  const payload = {
    properties: {
      title
    },
    sheets: [
      {
        properties: {
          title: 'Simulados Cesgranrio',
          gridProperties: { rowCount: 50, columnCount: 10 }
        }
      },
      {
        properties: {
          title: 'Edital & Matérias',
          gridProperties: { rowCount: 100, columnCount: 10 }
        }
      },
      {
        properties: {
          title: 'Registro de Metas',
          gridProperties: { rowCount: 30, columnCount: 6 }
        }
      }
    ]
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Erro ao criar Planilha no Google Sheets.');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Now populate initial values into sheets
  // Sheet 1: Simulados Cesgranrio
  const simuladosRows = [
    [
      'ID',
      'Título do Simulado',
      'Data Programada',
      'Conhec. Básicos (Acertos/20)',
      'Conhec. Específicos (Acertos/40)',
      'Nota Final (/60)',
      'Aproveitamento (%)',
      'Tempo Gasto (min)',
      'Status',
      'Observações'
    ],
    ...simulados.map((s, idx) => [
      `SIM-${idx + 1}`,
      s.title,
      s.date,
      s.basicScore || 0,
      s.specificScore || 0,
      s.finalScore || 0,
      `${s.scorePercentage || 0}%`,
      s.timeSpentMinutes || 0,
      s.status === 'concluido' ? 'CONCLUÍDO' : 'PENDENTE',
      s.notes || ''
    ])
  ];

  // Sheet 2: Edital & Matérias
  const topicsRows = [
    [
      'Código',
      'Matéria',
      'Bloco',
      'Nome do Tópico',
      'Prioridade',
      'Dificuldade',
      'Status',
      'Questões Feitas',
      'Acertos',
      'Aproveitamento (%)'
    ],
    ...topics.map(t => [
      t.code,
      t.subjectName,
      t.block,
      t.name,
      t.priority.toUpperCase(),
      t.difficulty.toUpperCase(),
      t.status.toUpperCase(),
      t.questionsDone,
      t.questionsCorrect,
      t.questionsDone > 0 ? `${Math.round((t.questionsCorrect / t.questionsDone) * 100)}%` : '0%'
    ])
  ];

  // Populate data in batch
  const updateDataPayload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: 'Simulados Cesgranrio!A1:J' + simuladosRows.length,
        values: simuladosRows
      },
      {
        range: 'Edital & Matérias!A1:J' + topicsRows.length,
        values: topicsRows
      }
    ]
  };

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateDataPayload)
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl: sheetData.spreadsheetUrl,
    title
  };
};

export const syncSimuladosToExistingSheet = async (
  spreadsheetId: string,
  simulados: SimuladoRecord[]
): Promise<void> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google.');

  const simuladosRows = [
    [
      'ID',
      'Título do Simulado',
      'Data Programada',
      'Conhec. Básicos (Acertos/20)',
      'Conhec. Específicos (Acertos/40)',
      'Nota Final (/60)',
      'Aproveitamento (%)',
      'Tempo Gasto (min)',
      'Status',
      'Observações'
    ],
    ...simulados.map((s, idx) => [
      `SIM-${idx + 1}`,
      s.title,
      s.date,
      s.basicScore || 0,
      s.specificScore || 0,
      s.finalScore || 0,
      `${s.scorePercentage || 0}%`,
      s.timeSpentMinutes || 0,
      s.status === 'concluido' ? 'CONCLUÍDO' : 'PENDENTE',
      s.notes || ''
    ])
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Simulados%20Cesgranrio!A1:J${simuladosRows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: simuladosRows })
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erro ao sincronizar com o Google Sheets.');
  }
};
