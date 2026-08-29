import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Key, 
  FileText, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  Search,
  Lock,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminUserListItem, AdminAuditLog } from '../../types';
import { refreshUserToken } from '../../lib/firebaseClient';

interface DiagnosticItem {
  name: string;
  isConfigured: boolean;
  description: string;
}

export const AdminPanelView: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'diagnostics' | 'audit'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const idToken = await refreshUserToken();
      if (!idToken) throw new Error('Não autenticado');

      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      // Fetch diagnostics
      const diagRes = await fetch('/api/admin/diagnostics', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (diagRes.ok) {
        const data = await diagRes.json();
        setDiagnostics(data.diagnostics || []);
      }

      // Fetch audit logs
      const auditRes = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err: any) {
      console.error('[Admin Panel Error]', err);
      setActionMessage({ type: 'error', text: err.message || 'Erro ao carregar dados administrativos.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAdminData();
    }
  }, [user]);

  const handleGrantAccess = async (targetUid: string) => {
    if (!confirm('Deseja conceder acesso vitalício cortesia a este usuário?')) return;
    try {
      const idToken = await refreshUserToken();
      const res = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ targetUid }),
      });
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Acesso concedido com sucesso!' });
        fetchAdminData();
      } else {
        const data = await res.json();
        setActionMessage({ type: 'error', text: data.error || 'Erro ao conceder acesso.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erro de comunicação com o servidor.' });
    }
  };

  const handleRevokeAccess = async (targetUid: string) => {
    if (!confirm('Deseja revogar o acesso deste usuário?')) return;
    try {
      const idToken = await refreshUserToken();
      const res = await fetch('/api/admin/revoke-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ targetUid }),
      });
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Acesso revogado com sucesso.' });
        fetchAdminData();
      } else {
        const data = await res.json();
        setActionMessage({ type: 'error', text: data.error || 'Erro ao revogar acesso.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erro de comunicação.' });
    }
  };

  const exportUsersCSV = () => {
    const headers = ['UID', 'Nome', 'Email', 'Papel', 'Status de Acesso', 'Data Criacao', 'Ultimo Login'];
    const rows = users.map(u => [
      u.uid,
      `"${u.displayName}"`,
      u.email,
      u.role,
      u.accessStatus,
      u.createdAt,
      u.lastLoginAt || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `usuarios_rota_petro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-rose-900 mb-2">Acesso Restrito ao Administrador</h2>
        <p className="text-sm text-rose-700">
          Esta área é restrita ao e-mail proprietário configurado em <code>ADMIN_EMAIL</code> no servidor.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>PAINEL ADMINISTRATIVO AUTORIZADO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Controle de Clientes & Servidor</h1>
          <p className="text-xs text-slate-400 mt-1">Conectado como: <strong>{user.email}</strong> (ADMIN)</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar Dados</span>
          </button>

          <button
            onClick={exportUsersCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className={`mb-6 p-4 rounded-2xl border text-sm flex items-center gap-3 ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários Cadastrados ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'diagnostics'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Diagnóstico de Secrets & Servidor</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Log de Auditoria ({auditLogs.length})</span>
        </button>
      </div>

      {/* Subtab Users */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por nome, e-mail ou UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-500">Exibindo {filteredUsers.length} usuários</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Papel</th>
                  <th className="py-3 px-4">Acesso ROTA PETRO</th>
                  <th className="py-3 px-4">Cadastro / Último Login</th>
                  <th className="py-3 px-4 text-right">Ações Administrativas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.displayName}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{u.email}</div>
                      <div className="text-slate-400 text-[10px] font-mono">UID: {u.uid.substring(0, 10)}...</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        u.isEntitled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.isEntitled ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-amber-600" />}
                        <span>{u.isEntitled ? 'ATIVO (VITALÍCIO)' : 'PENDENTE'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div>Cad: {new Date(u.createdAt).toLocaleDateString('pt-BR')}</div>
                      <div>Login: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('pt-BR') : 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!u.isAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          {u.isEntitled ? (
                            <button
                              onClick={() => handleRevokeAccess(u.uid)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] border border-rose-200 transition-colors cursor-pointer"
                              title="Revogar Acesso"
                            >
                              <UserX className="w-3.5 h-3.5 inline mr-1" />
                              Revogar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGrantAccess(u.uid)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                              title="Conceder Acesso Cortesia"
                            >
                              <UserCheck className="w-3.5 h-3.5 inline mr-1" />
                              Liberar Cortesia
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab Diagnostics */}
      {activeSubTab === 'diagnostics' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-2">Diagnóstico Seguro de Variáveis de Ambiente</h3>
          <p className="text-slate-500 text-xs mb-6 leading-relaxed">
            Este painel verifica se as chaves necessárias estão declaradas no servidor do AI Studio/Cloud Run, sem expor os valores secretos no navegador.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {diagnostics.map((diag) => (
              <div key={diag.name} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-start justify-between">
                <div>
                  <div className="font-mono font-bold text-xs text-slate-900">{diag.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{diag.description}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                  diag.isConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {diag.isConfigured ? 'CONFIGURADO' : 'AUSENTE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Registro Imutável de Auditoria Administrativa</h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Nenhum evento registrado ainda.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-800">{log.action.toUpperCase()}</span>
                    <span className="text-slate-400 text-[10px]">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Admin: <code>{log.adminEmail}</code> &rarr; Alvo: <code>{log.targetUid}</code>
                  </div>
                  {log.details && <div className="text-slate-500 text-[10px] mt-1 italic">{log.details}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
