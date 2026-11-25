import { getSupabaseClient, isSupabaseConfigured } from './supabase-client.js';

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validateCredentials(email, password) {
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = typeof password === 'string' ? password : '';

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Informe um e-mail válido.');
  }
  if (cleanPassword.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.');
  }

  return { email: cleanEmail, password: cleanPassword };
}

function formatAuthError(error, fallbackMessage) {
  const raw = String(error?.message || '').toLowerCase();

  if (raw.includes('invalid login credentials') || raw.includes('invalid credentials')) {
    return 'E-mail ou senha inválidos.';
  }
  if (raw.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada ou spam.';
  }
  if (raw.includes('user already registered') || raw.includes('already been registered')) {
    return 'Este e-mail já está cadastrado. Tente entrar com sua conta.';
  }
  if (raw.includes('password should be at least') || raw.includes('weak password')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (raw.includes('invalid email') || raw.includes('unable to validate email')) {
    return 'Informe um e-mail válido.';
  }
  if (raw.includes('rate limit') || raw.includes('too many requests') || raw.includes('security purposes')) {
    return 'Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.';
  }
  if (raw.includes('signups not allowed')) {
    return 'O cadastro de novas contas está desativado neste projeto.';
  }
  if (raw.includes('refresh token') || raw.includes('jwt expired') || raw.includes('session')) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  if (raw.includes('failed to fetch') || raw.includes('networkerror') || raw.includes('load failed')) {
    return 'Sem conexão com o serviço de autenticação. Verifique sua internet e tente novamente.';
  }

  return fallbackMessage;
}

async function requireClient() {
  const client = await getSupabaseClient();
  if (!client) {
    throw new Error('Autenticação indisponível: configure SUPABASE_URL e SUPABASE_ANON_KEY em src/js/supabase-client.js.');
  }
  return client;
}

export function isAuthConfigured() {
  return isSupabaseConfigured();
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;

  const client = await getSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    await client.auth.signOut({ scope: 'local' }).catch(() => {});
    return null;
  }

  return data.session ?? null;
}

export async function signIn(email, password) {
  const credentials = validateCredentials(email, password);
  const client = await requireClient();

  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error) {
    throw new Error(formatAuthError(error, 'Não foi possível entrar. Tente novamente.'));
  }

  if (!data.session) {
    throw new Error('Não foi possível iniciar a sessão. Tente novamente.');
  }

  return {
    session: data.session,
    user: data.user,
    needsEmailConfirmation: false
  };
}

export async function signUp(email, password) {
  const credentials = validateCredentials(email, password);
  const client = await requireClient();

  const { data, error } = await client.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      emailRedirectTo: globalThis.location?.origin
    }
  });

  if (error) {
    throw new Error(formatAuthError(error, 'Não foi possível criar a conta. Tente novamente.'));
  }

  // Quando a confirmação de e-mail está ativa, o Supabase pode retornar identities vazio para e-mail já existente.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('Este e-mail já está cadastrado. Tente entrar com sua conta.');
  }

  return {
    session: data.session ?? null,
    user: data.user ?? null,
    needsEmailConfirmation: !data.session
  };
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;

  const client = await requireClient();
  const { error } = await client.auth.signOut();
  if (error) {
    throw new Error(formatAuthError(error, 'Não foi possível encerrar a sessão.'));
  }
}

export async function onAuthStateChange(callback) {
  if (!isSupabaseConfigured() || typeof callback !== 'function') {
    return () => {};
  }

  const client = await getSupabaseClient();
  const { data } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session ?? null);
  });

  return () => data?.subscription?.unsubscribe();
}