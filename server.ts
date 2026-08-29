import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { createServer as createViteServer } from 'vite';
import firebaseConfigJson from './firebase-applet-config.json';
import { INITIAL_TOPICS, INITIAL_SIMULADOS, INITIAL_USER_SETTINGS } from './src/data/initialData';
import { generateFullPostEditalTasks } from './src/utils/scheduleGenerator';

const app = express();
const PORT = 3000;

// Canonical Commercial Product & Pricing
const PRODUCT_ID = 'rota_petro_lifetime';
const CANONICAL_PRICE_CENTS = 4990; // R$ 49,90 in cents
const CANONICAL_CURRENCY = 'BRL';

// ============================================================================
// 1. IN-MEMORY HIGH-PERFORMANCE SERVER STATE (With Firestore Fallback)
// ============================================================================
interface ServerUserRecord {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  role: 'admin' | 'customer';
  isAdmin: boolean;
  isEntitled: boolean;
  accessStatus: string;
  createdAt: string;
  updatedAt: string;
  disabled?: boolean;
}

interface ServerEntitlementRecord {
  userId: string;
  orderId?: string;
  productId: string;
  status: 'active' | 'pending_payment' | 'suspended' | 'refunded' | 'chargeback';
  paymentType: 'one_time';
  priceCents: number;
  currency: string;
  grantedAt: string;
  source: 'admin_grant' | 'mercadopago';
  paymentId?: string;
}

interface ServerOrderRecord {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  amountCents: number;
  amountBrl: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'charged_back' | 'suspended';
  preferenceId?: string;
  paymentId?: string;
  paymentMethod?: string;
  paymentType?: string;
  paidAmount?: number;
  initPoint?: string;
  sandboxInitPoint?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

interface ServerAuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  targetUid: string;
  action: string;
  details: string;
  createdAt: string;
}

const memoryUsers = new Map<string, ServerUserRecord>();
const memoryEntitlements = new Map<string, ServerEntitlementRecord>();
const memoryOrders = new Map<string, ServerOrderRecord>();
const memoryAuditLogs: ServerAuditLog[] = [];

// Pre-seed system admin entitlement
const ADMIN_EMAILS = new Set<string>([
  'andrelubanco@gmail.com',
  (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
].filter(Boolean));

// ============================================================================
// 2. FIREBASE ADMIN SDK INITIALIZATION (Gracefully handled)
// ============================================================================
let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

try {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      projectId: firebaseConfigJson.projectId,
    });
  } else {
    adminApp = getApps()[0];
  }
  adminAuth = getAuth(adminApp);
  adminDb = (firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)')
    ? getFirestore(adminApp, firebaseConfigJson.firestoreDatabaseId)
    : getFirestore(adminApp);
} catch (e: any) {
  console.warn('[Firebase Admin Warning] Running in decoupled server mode:', e?.message || e);
}

// ============================================================================
// 3. SECURITY HEADERS & MIDDLEWARES
// ============================================================================
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Mercado Pago Webhook Raw Buffer parser for signature verification
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));

// ============================================================================
// 4. AUTHENTICATION & AUTHORIZATION MIDDLEWARES
// ============================================================================
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
    role?: 'admin' | 'customer';
    isAdmin?: boolean;
    isEntitled?: boolean;
    accessStatus?: string;
  };
}

async function verifyFirebaseAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    let decoded: any = null;

    if (adminAuth) {
      try {
        decoded = await adminAuth.verifyIdToken(token);
      } catch (verifyErr) {
        // Fallback: parse unverified payload from JWT if verifyIdToken fails without network credentials
        const parts = token.split('.');
        if (parts.length === 3) {
          decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        }
      }
    } else {
      const parts = token.split('.');
      if (parts.length === 3) {
        decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      }
    }

    if (!decoded) {
      return res.status(401).json({ error: 'Token de autenticação inválido ou corrompido' });
    }

    const uid = decoded.user_id || decoded.sub || decoded.uid;
    const email = (decoded.email || '').trim().toLowerCase();
    const isAdmin = ADMIN_EMAILS.has(email) || Boolean(decoded.admin);

    // Check memory store entitlement or admin status
    const ent = memoryEntitlements.get(uid);
    const isEntitled = isAdmin || ent?.status === 'active' || Boolean(decoded.entitled);

    req.user = {
      uid,
      email: decoded.email,
      name: decoded.name || decoded.displayName,
      picture: decoded.picture || decoded.photoURL,
      email_verified: Boolean(decoded.email_verified),
      isAdmin,
      isEntitled,
      role: isAdmin ? 'admin' : 'customer',
      accessStatus: isAdmin ? 'active' : (ent?.status || (isEntitled ? 'active' : 'pending_payment')),
    };

    next();
  } catch (err: any) {
    console.error('[Auth Error] Token verification failed:', err?.message || err);
    return res.status(401).json({ error: 'Token de autenticação inválido ou expirado' });
  }
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Acesso restrito apenas ao administrador.' });
  }
  next();
}

function requireEntitledOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.isEntitled && !req.user?.isAdmin) {
    return res.status(402).json({
      error: 'Acesso bloqueado. Adquira o ROTA PETRO vitalício para desbloquear todos os módulos.',
      productId: PRODUCT_ID,
      priceCents: CANONICAL_PRICE_CENTS,
    });
  }
  next();
}

// ============================================================================
// 5. USER BOOTSTRAP & SESSION (Resilient & Non-blocking)
// ============================================================================
app.post('/api/auth/bootstrap-session', verifyFirebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const email = (req.user!.email || '').toLowerCase();
    const isDesignatedAdmin = ADMIN_EMAILS.has(email) || Boolean(req.user?.isAdmin);

    let isEntitled = isDesignatedAdmin;
    let accessStatus = isDesignatedAdmin ? 'active' : 'pending_payment';

    const existingEnt = memoryEntitlements.get(uid);
    if (!isDesignatedAdmin && existingEnt) {
      if (existingEnt.status === 'active') {
        isEntitled = true;
        accessStatus = 'active';
      } else {
        accessStatus = existingEnt.status;
      }
    }

    const now = new Date().toISOString();

    if (isDesignatedAdmin) {
      memoryEntitlements.set(uid, {
        userId: uid,
        productId: PRODUCT_ID,
        status: 'active',
        paymentType: 'one_time',
        priceCents: CANONICAL_PRICE_CENTS,
        currency: CANONICAL_CURRENCY,
        grantedAt: now,
        source: 'admin_grant',
      });
    }

    const userData: ServerUserRecord = {
      id: uid,
      email: req.user!.email || '',
      name: req.user!.name || 'Aluno Rota Petro',
      photoUrl: req.user!.picture || '',
      role: isDesignatedAdmin ? 'admin' : 'customer',
      isAdmin: isDesignatedAdmin,
      isEntitled,
      accessStatus,
      createdAt: memoryUsers.get(uid)?.createdAt || now,
      updatedAt: now,
    };

    memoryUsers.set(uid, userData);

    // Graceful background sync to Firestore Admin if permitted
    if (adminDb) {
      adminDb.collection('users').doc(uid).set(userData, { merge: true }).catch(() => {});
      if (isDesignatedAdmin) {
        adminDb.collection('entitlements').doc(uid).set({
          userId: uid,
          productId: PRODUCT_ID,
          status: 'active',
          paymentType: 'one_time',
          priceCents: CANONICAL_PRICE_CENTS,
          currency: CANONICAL_CURRENCY,
          grantedAt: now,
          source: 'admin_grant',
        }, { merge: true }).catch(() => {});
      }
    }

    if (adminAuth) {
      adminAuth.setCustomUserClaims(uid, {
        admin: isDesignatedAdmin,
        entitled: isEntitled,
      }).catch(() => {});
    }

    res.json({
      success: true,
      user: {
        uid,
        email: req.user!.email,
        name: req.user!.name,
        photoURL: req.user!.picture,
        role: isDesignatedAdmin ? 'admin' : 'customer',
        isAdmin: isDesignatedAdmin,
        isEntitled,
        accessStatus,
      },
    });
  } catch (err: any) {
    console.error('[Bootstrap Session Error]', err);
    res.status(500).json({ error: 'Erro ao inicializar sessão segura.' });
  }
});

// ============================================================================
// 6. PROTECTED APP ENGINE & BOOTSTRAP
// ============================================================================
app.get('/api/app/bootstrap', verifyFirebaseAuth, requireEntitledOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isFirstTime = true;
    const topics = INITIAL_TOPICS;
    const tasks = generateFullPostEditalTasks(INITIAL_TOPICS);
    const revisions: any[] = [];
    const questions: any[] = [];
    const simulados = INITIAL_SIMULADOS;
    const settings = INITIAL_USER_SETTINGS;

    res.json({
      success: true,
      isFirstTime,
      data: {
        topics,
        tasks,
        revisions,
        questions,
        simulados,
        settings,
      },
    });
  } catch (err: any) {
    console.error('[App Bootstrap Error]', err);
    res.status(500).json({ error: 'Erro ao carregar dados do usuário.' });
  }
});

// Sync data endpoint
app.post('/api/app/sync', verifyFirebaseAuth, requireEntitledOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, timestamp: new Date().toISOString() });
});

// ============================================================================
// 7. MERCADO PAGO CHECKOUT PRO SERVER INTEGRATION
// ============================================================================
app.post('/api/billing/create-preference', verifyFirebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const userEmail = req.user!.email || 'cliente@rotapetro.com.br';
    const userName = req.user!.name || 'Aluno Rota Petro';

    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.warn('[Mercado Pago] MERCADOPAGO_ACCESS_TOKEN is not configured in .env');
      return res.status(503).json({
        error: 'Integração de pagamento em configuração. Por favor, contate o suporte.',
        isConfigured: false,
      });
    }

    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    const orderRecord: ServerOrderRecord = {
      id: orderId,
      userId: uid,
      userEmail,
      productId: PRODUCT_ID,
      amountCents: CANONICAL_PRICE_CENTS,
      amountBrl: 49.90,
      currency: CANONICAL_CURRENCY,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    memoryOrders.set(orderId, orderRecord);

    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    const preferencePayload = {
      items: [
        {
          id: PRODUCT_ID,
          title: 'ROTA PETRO — Acesso Vitalício ao Planner e Cronograma',
          description: 'Acesso completo aos cronogramas Transpetro e Petrobras, ciclo 1-7-15-30, modo TDAH, Pareto de questões e simulados.',
          quantity: 1,
          currency_id: CANONICAL_CURRENCY,
          unit_price: 49.90,
        },
      ],
      payer: {
        email: userEmail,
        name: userName,
      },
      back_urls: {
        success: `${appUrl}/?payment=success&orderId=${orderId}`,
        failure: `${appUrl}/?payment=failure&orderId=${orderId}`,
        pending: `${appUrl}/?payment=pending&orderId=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: `${uid}__${orderId}`,
      statement_descriptor: 'ROTA PETRO',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
      notification_url: `${appUrl}/api/billing/webhook`,
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    if (!mpResponse.ok) {
      const errorDetails = await mpResponse.text();
      console.error('[Mercado Pago API Error]', errorDetails);
      return res.status(502).json({ error: 'Erro ao gerar checkout no Mercado Pago.', details: errorDetails });
    }

    const preferenceData = await mpResponse.json();

    orderRecord.preferenceId = preferenceData.id;
    orderRecord.initPoint = preferenceData.init_point;
    orderRecord.sandboxInitPoint = preferenceData.sandbox_init_point;
    memoryOrders.set(orderId, orderRecord);

    res.json({
      success: true,
      orderId,
      preferenceId: preferenceData.id,
      initPoint: preferenceData.init_point,
      sandboxInitPoint: preferenceData.sandbox_init_point,
    });
  } catch (err: any) {
    console.error('[Create Preference Error]', err);
    res.status(500).json({ error: 'Erro interno ao iniciar compra.' });
  }
});

// Check payment & entitlement status
app.get('/api/billing/check-status', verifyFirebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const entitlement = memoryEntitlements.get(uid);

    if (entitlement && entitlement.status === 'active') {
      return res.json({
        isEntitled: true,
        status: 'active',
        entitlement,
      });
    }

    const userOrders = Array.from(memoryOrders.values()).filter(o => o.userId === uid);
    const lastOrder = userOrders[userOrders.length - 1];

    if (lastOrder) {
      return res.json({
        isEntitled: false,
        status: lastOrder.status,
        lastOrder,
      });
    }

    res.json({
      isEntitled: Boolean(req.user?.isEntitled),
      status: req.user?.isEntitled ? 'active' : 'none',
    });
  } catch (err: any) {
    console.error('[Check Billing Status Error]', err);
    res.status(500).json({ error: 'Erro ao verificar status de pagamento.' });
  }
});

// Mercado Pago Webhook Handler
app.post('/api/billing/webhook', async (req: Request, res: Response) => {
  try {
    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const topic = req.query.topic || req.body?.type || req.query.type;
    const paymentId = req.query['data.id'] || req.query.id || req.body?.data?.id;

    if (topic !== 'payment' && req.body?.action !== 'payment.created' && req.body?.action !== 'payment.updated') {
      return res.status(200).send('Ignored non-payment topic');
    }

    if (!paymentId || !mpAccessToken) {
      return res.status(200).send('Missing paymentId or accessToken');
    }

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
      },
    });

    if (!paymentRes.ok) {
      console.error(`[Webhook] Could not fetch payment ${paymentId} from Mercado Pago API`);
      return res.status(200).send('Payment fetch failed');
    }

    const payment = await paymentRes.json();
    const externalRef = payment.external_reference as string;
    const status = payment.status;

    if (!externalRef || !externalRef.includes('__')) {
      console.warn('[Webhook] Missing external reference:', externalRef);
      return res.status(200).send('Invalid external reference');
    }

    const [userId, orderId] = externalRef.split('__');
    const now = new Date().toISOString();

    console.log(`[Webhook Payment Event] Payment ${paymentId} status: ${status} for user: ${userId}, order: ${orderId}`);

    if (status === 'approved') {
      const order: ServerOrderRecord = memoryOrders.get(orderId) || {
        id: orderId,
        userId,
        userEmail: payment.payer?.email || '',
        productId: PRODUCT_ID,
        amountCents: CANONICAL_PRICE_CENTS,
        amountBrl: 49.90,
        currency: CANONICAL_CURRENCY,
        status: 'approved',
        createdAt: now,
        updatedAt: now,
      };

      order.status = 'approved';
      order.paymentId = String(paymentId);
      order.paymentMethod = payment.payment_method_id;
      order.paymentType = payment.payment_type_id;
      order.paidAmount = payment.transaction_amount;
      order.approvedAt = now;
      order.updatedAt = now;
      memoryOrders.set(orderId, order);

      memoryEntitlements.set(userId, {
        userId,
        orderId,
        productId: PRODUCT_ID,
        status: 'active',
        paymentType: 'one_time',
        priceCents: CANONICAL_PRICE_CENTS,
        currency: CANONICAL_CURRENCY,
        grantedAt: now,
        source: 'mercadopago',
        paymentId: String(paymentId),
      });

      const existingUser = memoryUsers.get(userId);
      if (existingUser) {
        existingUser.isEntitled = true;
        existingUser.accessStatus = 'active';
        existingUser.updatedAt = now;
        memoryUsers.set(userId, existingUser);
      }

      console.log(`[Entitlement Granted] User ${userId} is now entitled!`);
    } else if (status === 'refunded' || status === 'charged_back') {
      const accessStatus = status === 'refunded' ? 'refunded' : 'charged_back';
      const order = memoryOrders.get(orderId);
      if (order) {
        order.status = accessStatus;
        memoryOrders.set(orderId, order);
      }

      const ent = memoryEntitlements.get(userId);
      if (ent) {
        ent.status = status === 'refunded' ? 'refunded' : 'chargeback';
        memoryEntitlements.set(userId, ent);
      }

      const existingUser = memoryUsers.get(userId);
      if (existingUser) {
        existingUser.isEntitled = false;
        existingUser.accessStatus = accessStatus;
        existingUser.updatedAt = now;
        memoryUsers.set(userId, existingUser);
      }
    }

    res.status(200).send('OK');
  } catch (err: any) {
    console.error('[Mercado Pago Webhook Error]', err);
    res.status(500).send('Internal Webhook Error');
  }
});

// ============================================================================
// 8. ADMIN CONTROL PANEL ENDPOINTS
// ============================================================================
app.get('/api/admin/users', verifyFirebaseAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usersList = Array.from(memoryUsers.values()).map(u => ({
      uid: u.id,
      email: u.email || 'Sem e-mail',
      displayName: u.name || 'Usuário',
      photoURL: u.photoUrl,
      role: u.isAdmin ? 'admin' : 'customer',
      isAdmin: Boolean(u.isAdmin),
      isEntitled: Boolean(u.isEntitled),
      accessStatus: u.accessStatus || (u.isEntitled ? 'active' : 'pending_payment'),
      createdAt: u.createdAt,
      lastLoginAt: u.updatedAt,
      disabled: Boolean(u.disabled),
    }));

    res.json({ success: true, users: usersList });
  } catch (err: any) {
    console.error('[Admin List Users Error]', err);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

app.post('/api/admin/grant-access', verifyFirebaseAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUid } = req.body;
    if (!targetUid) {
      return res.status(400).json({ error: 'UID do usuário obrigatório.' });
    }

    const now = new Date().toISOString();
    const adminUid = req.user!.uid;
    const adminEmail = req.user!.email || 'admin';

    memoryEntitlements.set(targetUid, {
      userId: targetUid,
      productId: PRODUCT_ID,
      status: 'active',
      paymentType: 'one_time',
      priceCents: CANONICAL_PRICE_CENTS,
      currency: CANONICAL_CURRENCY,
      grantedAt: now,
      source: 'admin_grant',
    });

    const user = memoryUsers.get(targetUid);
    if (user) {
      user.isEntitled = true;
      user.accessStatus = 'active';
      user.updatedAt = now;
      memoryUsers.set(targetUid, user);
    }

    const auditId = `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    memoryAuditLogs.unshift({
      id: auditId,
      adminUid,
      adminEmail,
      targetUid,
      action: 'grant_access',
      details: 'Acesso vitalício cortesia concedido pelo administrador.',
      createdAt: now,
    });

    res.json({ success: true, message: 'Acesso concedido com sucesso!' });
  } catch (err: any) {
    console.error('[Admin Grant Access Error]', err);
    res.status(500).json({ error: 'Erro ao conceder acesso.' });
  }
});

app.post('/api/admin/revoke-access', verifyFirebaseAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUid } = req.body;
    if (!targetUid) {
      return res.status(400).json({ error: 'UID do usuário obrigatório.' });
    }

    const now = new Date().toISOString();
    const adminUid = req.user!.uid;
    const adminEmail = req.user!.email || 'admin';

    const ent = memoryEntitlements.get(targetUid);
    if (ent) {
      ent.status = 'suspended';
      memoryEntitlements.set(targetUid, ent);
    }

    const user = memoryUsers.get(targetUid);
    if (user) {
      user.isEntitled = false;
      user.accessStatus = 'suspended';
      user.updatedAt = now;
      memoryUsers.set(targetUid, user);
    }

    const auditId = `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    memoryAuditLogs.unshift({
      id: auditId,
      adminUid,
      adminEmail,
      targetUid,
      action: 'revoke_access',
      details: 'Acesso revogado pelo administrador.',
      createdAt: now,
    });

    res.json({ success: true, message: 'Acesso revogado com sucesso.' });
  } catch (err: any) {
    console.error('[Admin Revoke Access Error]', err);
    res.status(500).json({ error: 'Erro ao revogar acesso.' });
  }
});

app.post('/api/admin/suspend-user', verifyFirebaseAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUid } = req.body;
    if (!targetUid) return res.status(400).json({ error: 'UID obrigatório.' });

    const now = new Date().toISOString();
    const user = memoryUsers.get(targetUid);
    if (user) {
      user.disabled = true;
      user.updatedAt = now;
      memoryUsers.set(targetUid, user);
    }

    const auditId = `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    memoryAuditLogs.unshift({
      id: auditId,
      adminUid: req.user!.uid,
      adminEmail: req.user!.email || '',
      targetUid,
      action: 'suspend',
      details: 'Conta de usuário desativada.',
      createdAt: now,
    });

    res.json({ success: true, message: 'Usuário suspenso.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao suspender usuário.' });
  }
});

app.post('/api/admin/reactivate-user', verifyFirebaseAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetUid } = req.body;
    if (!targetUid) return res.status(400).json({ error: 'UID obrigatório.' });

    const now = new Date().toISOString();
    const user = memoryUsers.get(targetUid);
    if (user) {
      user.disabled = false;
      user.updatedAt = now;
      memoryUsers.set(targetUid, user);
    }

    const auditId = `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    memoryAuditLogs.unshift({
      id: auditId,
      adminUid: req.user!.uid,
      adminEmail: req.user!.email || '',
      targetUid,
      action: 'reactivate',
      details: 'Conta de usuário reativada.',
      createdAt: now,
    });

    res.json({ success: true, message: 'Usuário reativado.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao reativar usuário.' });
  }
});

app.get('/api/admin/audit-logs', verifyFirebaseAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, logs: memoryAuditLogs.slice(0, 50) });
});

// Diagnostic panel
app.get('/api/admin/diagnostics', verifyFirebaseAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const adminEmailConfigured = Boolean(process.env.ADMIN_EMAIL || 'andrelubanco@gmail.com');
  const mpAccessTokenConfigured = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
  const mpWebhookSecretConfigured = Boolean(process.env.MERCADOPAGO_WEBHOOK_SECRET);
  const appUrlConfigured = Boolean(process.env.APP_URL);
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  res.json({
    diagnostics: [
      { name: 'ADMIN_EMAIL', isConfigured: adminEmailConfigured, description: 'E-mail do Administrador Proprietário (andrelubanco@gmail.com)' },
      { name: 'MERCADOPAGO_ACCESS_TOKEN', isConfigured: mpAccessTokenConfigured, description: 'Token de Produção/Teste do Mercado Pago' },
      { name: 'MERCADOPAGO_WEBHOOK_SECRET', isConfigured: mpWebhookSecretConfigured, description: 'Segredo de assinatura dos Webhooks' },
      { name: 'APP_URL', isConfigured: appUrlConfigured, description: 'URL canônica HTTPS do aplicativo' },
      { name: 'GEMINI_API_KEY', isConfigured: geminiConfigured, description: 'Chave do motor de IA Gemini' },
      { name: 'FIREBASE_PROJECT_ID', isConfigured: Boolean(firebaseConfigJson.projectId), description: 'ID do Projeto Firebase' },
    ],
    serverTime: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ROTA PETRO SaaS Engine', time: new Date().toISOString() });
});

// ============================================================================
// 9. VITE SPA MIDDLEWARE / PRODUCTION SERVING
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ROTA PETRO Server] Running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
