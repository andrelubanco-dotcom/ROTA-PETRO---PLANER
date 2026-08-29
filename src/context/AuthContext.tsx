import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  getIdToken 
} from 'firebase/auth';
import { 
  auth, 
  loginWithGoogle as firebaseLoginWithGoogle, 
  logoutUser as firebaseLogoutUser,
  refreshUserToken 
} from '../lib/firebaseClient';
import { AuthUser, UserAccessStatus } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshClaims: () => Promise<void>;
  hasLegacyLocalData: boolean;
  dismissLegacyMigration: () => void;
  migrateLegacyDataToAccount: () => Promise<{ success: boolean; count: number }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasLegacyLocalData, setHasLegacyLocalData] = useState<boolean>(false);

  // Check for legacy localStorage data on initial load
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      const legacyKeys = keys.filter(k => k.startsWith('rota_petro_') && !k.startsWith('rota_petro_migrated_'));
      setHasLegacyLocalData(legacyKeys.length > 0);
    } catch {
      setHasLegacyLocalData(false);
    }
  }, [user]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      setAuthError(null);

      if (!fbUser) {
        setFirebaseUser(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setFirebaseUser(fbUser);

      try {
        const idToken = await getIdToken(fbUser, true);
        
        // Call backend server to bootstrap session & verify admin/entitlements
        const response = await fetch('/api/auth/bootstrap-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao autenticar sessão com o servidor.');
        }

        const data = await response.json();
        const serverUser = data.user;

        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || serverUser.name || 'Aluno Rota Petro',
          photoURL: fbUser.photoURL || serverUser.photoURL,
          role: serverUser.role || 'customer',
          isAdmin: Boolean(serverUser.isAdmin),
          isEntitled: Boolean(serverUser.isEntitled),
          accessStatus: serverUser.accessStatus || 'pending_payment',
          emailVerified: fbUser.emailVerified,
        });
      } catch (err: any) {
        console.error('[Auth Context Error]', err);
        setAuthError(err.message || 'Erro ao carregar permissões do usuário.');
        
        // Fallback user structure in case of temporary network glitch
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          role: 'customer',
          isAdmin: false,
          isEntitled: false,
          accessStatus: 'pending_payment',
          emailVerified: fbUser.emailVerified,
        });
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await firebaseLoginWithGoogle();
    } catch (err: any) {
      console.error('[Login Error]', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError('Falha ao autenticar com conta Google. Tente novamente.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseLogoutUser();
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('[Logout Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshClaims = async () => {
    if (!firebaseUser) return;
    try {
      const idToken = await refreshUserToken();
      if (!idToken) return;

      const response = await fetch('/api/auth/bootstrap-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const serverUser = data.user;
        setUser(prev => prev ? {
          ...prev,
          role: serverUser.role,
          isAdmin: serverUser.isAdmin,
          isEntitled: serverUser.isEntitled,
          accessStatus: serverUser.accessStatus,
        } : null);
      }
    } catch (err) {
      console.error('[Refresh Claims Error]', err);
    }
  };

  const dismissLegacyMigration = () => {
    if (user?.uid) {
      localStorage.setItem(`rota_petro_migrated_${user.uid}`, 'dismissed');
    }
    setHasLegacyLocalData(false);
  };

  const migrateLegacyDataToAccount = async (): Promise<{ success: boolean; count: number }> => {
    if (!user) return { success: false, count: 0 };
    try {
      // Collect legacy keys
      let count = 0;
      const keys = ['rota_petro_tasks', 'rota_petro_topics', 'rota_petro_revisions', 'rota_petro_questions', 'rota_petro_simulados', 'rota_petro_settings'];
      
      // Store under user-specific prefix
      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) {
          localStorage.setItem(`${key}_${user.uid}`, value);
          count++;
        }
      }

      localStorage.setItem(`rota_petro_migrated_${user.uid}`, 'true');
      setHasLegacyLocalData(false);
      return { success: true, count };
    } catch {
      return { success: false, count: 0 };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticating,
        authError,
        login,
        logout,
        refreshClaims,
        hasLegacyLocalData,
        dismissLegacyMigration,
        migrateLegacyDataToAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
