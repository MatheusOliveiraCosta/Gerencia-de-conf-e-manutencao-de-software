import { validateMeal } from './domain.js';
import { getSession } from './auth.js';
import { getSupabaseClient, isSupabaseConfigured } from './supabase-client.js';

const DEMO_KEY = 'dietlife.demo.meals.v1';
const MEAL_COLUMNS = 'id, name, calories, period, date';

function normalizeMealRow(row) {
  return {
    id: row.id,
    name: row.name,
    calories: Number(row.calories),
    period: row.period,
    date: row.date
  };
}

function readDemo() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeMealRow) : [];
  } catch {
    return [];
  }
}

function writeDemo(items) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(items));
}

function ensureValidMeal(data) {
  const result = validateMeal(data);
  if (!result.valid) {
    throw new Error(Object.values(result.errors).join(' '));
  }
  return result.data;
}

function formatStorageError(error, fallbackMessage) {
  const code = String(error?.code || '');
  const message = String(error?.message || '').toLowerCase();

  if (code === 'PGRST301' || message.includes('jwt expired') || message.includes('invalid jwt')) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  if (code === '42501' || message.includes('row-level security') || message.includes('permission denied')) {
    return 'Sem permissão para acessar este registro. Faça login novamente.';
  }
  if (code === '23514' || code === '22P02') {
    return 'Os dados informados não atendem às regras de validação do banco.';
  }
  if (message.includes('failed to fetch') || message.includes('networkerror') || message.includes('load failed')) {
    return 'Sem conexão com o banco de dados. Verifique sua internet e tente novamente.';
  }

  return fallbackMessage;
}

async function requireRemoteContext() {
  const client = await getSupabaseClient();
  const session = await getSession();

  if (!client || !session?.user?.id) {
    throw new Error('Faça login para consultar ou salvar suas refeições.');
  }

  return { client, userId: session.user.id };
}

export async function listMeals(date) {
  if (!isSupabaseConfigured()) {
    return readDemo().filter(item => item.date === date);
  }

  const { client, userId } = await requireRemoteContext();
  const { data, error } = await client
    .from('meals')
    .select(MEAL_COLUMNS)
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(formatStorageError(error, 'Não foi possível carregar suas refeições.'));
  }

  return (data || []).map(normalizeMealRow);
}

export async function addMeal(data) {
  const meal = ensureValidMeal(data);

  if (!isSupabaseConfigured()) {
    const item = { ...meal, id: crypto.randomUUID() };
    writeDemo([...readDemo(), item]);
    return item;
  }

  const { client, userId } = await requireRemoteContext();
  const { data: inserted, error } = await client
    .from('meals')
    .insert({ ...meal, user_id: userId })
    .select(MEAL_COLUMNS)
    .single();

  if (error) {
    throw new Error(formatStorageError(error, 'Não foi possível salvar o alimento.'));
  }

  return normalizeMealRow(inserted);
}

export async function updateMeal(id, data) {
  if (!id) throw new Error('Identificador do alimento inválido.');
  const meal = ensureValidMeal(data);

  if (!isSupabaseConfigured()) {
    const items = readDemo();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Alimento não encontrado.');
    items[index] = { ...items[index], ...meal, id };
    writeDemo(items);
    return items[index];
  }

  const { client, userId } = await requireRemoteContext();
  const { data: updated, error } = await client
    .from('meals')
    .update(meal)
    .eq('id', id)
    .eq('user_id', userId)
    .select(MEAL_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(formatStorageError(error, 'Não foi possível atualizar o alimento.'));
  }
  if (!updated) {
    throw new Error('Alimento não encontrado ou sem permissão para editar.');
  }

  return normalizeMealRow(updated);
}

export async function removeMeal(id) {
  if (!id) throw new Error('Identificador do alimento inválido.');

  if (!isSupabaseConfigured()) {
    const items = readDemo();
    const next = items.filter(item => item.id !== id);
    if (next.length === items.length) throw new Error('Alimento não encontrado.');
    writeDemo(next);
    return;
  }

  const { client, userId } = await requireRemoteContext();
  const { data: deleted, error } = await client
    .from('meals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id');

  if (error) {
    throw new Error(formatStorageError(error, 'Não foi possível excluir o alimento.'));
  }
  if (!deleted || deleted.length === 0) {
    throw new Error('Alimento não encontrado ou sem permissão para excluir.');
  }
}