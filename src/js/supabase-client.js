// Configuração pública do cliente Supabase (somente URL e chave anon/publishable).
// NUNCA coloque a chave service_role ou segredos privados neste arquivo.
export const SUPABASE_CDN_URL = 'https://esm.sh/@supabase/supabase-js@2.119.2';

const DEFAULT_CONFIG = {
  url: 'https://fkyqqhkdikfvvvagnkdw.supabase.co',
  anonKey: 'sb_publishable_IywDM52wzcsd4fACmRSE_w_elSbDNZ-'
};

let clientPromise = null;

function isPlaceholder(value) {
  const text = String(value || '').trim();
  if (!text) return true;
  return /^(SEU_|YOUR_|https:\/\/SEU-PROJETO|https:\/\/your-project)/i.test(text);
}

function isServiceRoleKey(key) {
  const value = String(key || '').trim();
  if (!value) return false;
  if (value.startsWith('sb_secret_')) return true;

  const parts = value.split('.');
  if (parts.length !== 3) return false;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload?.role === 'service_role';
  } catch {
    return false;
  }
}

export function getSupabaseConfig() {
  const runtime = globalThis.__DIETLIFE_CONFIG__ || {};
  const url = String(runtime.supabaseUrl ?? DEFAULT_CONFIG.url).trim();
  const anonKey = String(runtime.supabaseAnonKey ?? DEFAULT_CONFIG.anonKey).trim();
  return { url, anonKey };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  if (isPlaceholder(url) || isPlaceholder(anonKey)) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;

  const { url, anonKey } = getSupabaseConfig();
  if (isServiceRoleKey(anonKey)) {
    throw new Error('Configuração insegura: não utilize chave service_role no navegador.');
  }

  if (!clientPromise) {
    clientPromise = import(SUPABASE_CDN_URL)
      .then(({ createClient }) =>
        createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        })
      )
      .catch(() => {
        clientPromise = null;
        throw new Error('Não foi possível carregar o cliente Supabase. Verifique sua conexão com a internet.');
      });
  }

  return clientPromise;
}