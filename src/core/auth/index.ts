import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import Conf from 'conf';
import {
  signUp,
  signIn,
  signOut,
  getSession,
  getUser,
  refreshSession,
  verifyToken,
  verifyTokenWithSupabase,
  isSupabaseConfigured,
  AuthResult,
  DecodedToken,
} from './supabase';

export { AuthResult, DecodedToken, isSupabaseConfigured, verifyToken, verifyTokenWithSupabase };

export interface AuthUser {
  uid: string;
  email: string;
  nick: string;
  createdAt: number;
}

interface AuthStore {
  currentUser: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
}

const authStore = new Conf<AuthStore>({
  projectName: 'devchat',
  configName: 'auth',
  defaults: {
    currentUser: null,
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
  },
});

class AuthManager {
  private session: Session | null = null;
  private user: SupabaseUser | null = null;

  async initialize(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      this.session = await getSession();
      if (this.session) {
        this.user = await getUser();
        this.saveToStore();
        return true;
      }

      const storedToken = authStore.get('accessToken');
      const storedExpiry = authStore.get('tokenExpiry');

      if (storedToken && storedExpiry) {
        const now = Date.now();
        if (storedExpiry > now) {
          this.session = await refreshSession();
          if (this.session) {
            this.user = await getUser();
            this.saveToStore();
            return true;
          }
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  async register(email: string, password: string, nick: string): Promise<AuthResult> {
    const result = await signUp(email, password);

    if (result.success && result.user && result.session) {
      this.session = result.session;
      this.user = result.user;

      const authUser: AuthUser = {
        uid: result.user.id,
        email: result.user.email || email,
        nick,
        createdAt: Date.now(),
      };

      authStore.set('currentUser', authUser);
      this.saveToStore();
    }

    return result;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const result = await signIn(email, password);

    if (result.success && result.user && result.session) {
      this.session = result.session;
      this.user = result.user;

      const existingUser = authStore.get('currentUser');
      const authUser: AuthUser = {
        uid: result.user.id,
        email: result.user.email || email,
        nick: existingUser?.nick || email.split('@')[0],
        createdAt: existingUser?.createdAt || Date.now(),
      };

      authStore.set('currentUser', authUser);
      this.saveToStore();
    }

    return result;
  }

  async logout(): Promise<void> {
    await signOut();
    this.session = null;
    this.user = null;
    authStore.set('currentUser', null);
    authStore.set('accessToken', null);
    authStore.set('refreshToken', null);
    authStore.set('tokenExpiry', null);
  }

  isLoggedIn(): boolean {
    return this.session !== null && this.user !== null;
  }

  getToken(): string | null {
    return this.session?.access_token || authStore.get('accessToken');
  }

  getUid(): string | null {
    return this.user?.id || authStore.get('currentUser')?.uid || null;
  }

  getCurrentUser(): AuthUser | null {
    if (this.user) {
      const stored = authStore.get('currentUser');
      if (stored && stored.uid === this.user.id) {
        return stored;
      }
    }
    return authStore.get('currentUser');
  }

  updateNick(nick: string): void {
    const currentUser = authStore.get('currentUser');
    if (currentUser) {
      authStore.set('currentUser', { ...currentUser, nick });
    }
  }

  async refreshToken(): Promise<boolean> {
    const newSession = await refreshSession();
    if (newSession) {
      this.session = newSession;
      this.saveToStore();
      return true;
    }
    return false;
  }

  private saveToStore(): void {
    if (this.session) {
      authStore.set('accessToken', this.session.access_token);
      authStore.set('refreshToken', this.session.refresh_token);
      authStore.set('tokenExpiry', this.session.expires_at ? this.session.expires_at * 1000 : null);
    }
  }
}

let authManagerInstance: AuthManager | null = null;

export function getAuthManager(): AuthManager {
  if (!authManagerInstance) {
    authManagerInstance = new AuthManager();
  }
  return authManagerInstance;
}

export function clearAuthStore(): void {
  authStore.clear();
}
