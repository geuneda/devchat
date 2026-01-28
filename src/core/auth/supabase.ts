import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { getConfig } from '../config';

let supabaseClient: SupabaseClient | null = null;

export interface AuthResult {
  success: boolean;
  user?: SupabaseUser;
  session?: Session;
  error?: string;
}

export interface DecodedToken {
  sub: string;
  email?: string;
  exp: number;
  iat: number;
}

function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config = getConfig();
  const url = config.supabaseUrl;
  const key = config.supabaseAnonKey;

  if (!url || !key) {
    return null;
  }

  supabaseClient = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  const config = getConfig();
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase가 설정되지 않았습니다.' };
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    user: data.user ?? undefined,
    session: data.session ?? undefined,
  };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase가 설정되지 않았습니다.' };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    user: data.user,
    session: data.session,
  };
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
}

export async function getSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data } = await client.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<SupabaseUser | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data } = await client.auth.getUser();
  return data.user;
}

export async function refreshSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client.auth.refreshSession();
  if (error) {
    return null;
  }

  return data.session;
}

export function decodeTokenPayload(jwt: string): DecodedToken | null {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

    if (!payload.sub || !payload.exp) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch {
    return null;
  }
}

export async function verifyTokenWithSupabase(jwt: string): Promise<DecodedToken | null> {
  const client = getSupabaseClient();
  if (!client) {
    return decodeTokenPayload(jwt);
  }

  try {
    const { data, error } = await client.auth.getUser(jwt);

    if (error || !data.user) {
      return null;
    }

    const decoded = decodeTokenPayload(jwt);
    if (!decoded) {
      return null;
    }

    if (decoded.sub !== data.user.id) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function verifyToken(jwt: string): DecodedToken | null {
  return decodeTokenPayload(jwt);
}

export function resetSupabaseClient(): void {
  supabaseClient = null;
}
