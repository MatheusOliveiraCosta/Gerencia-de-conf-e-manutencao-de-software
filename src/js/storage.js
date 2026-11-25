// Adaptador de demonstração. Alexandre: substituir/estender com Supabase e RLS.
const KEY = 'dietlife.demo.meals.v1';
function read() { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
function write(items) { localStorage.setItem(KEY, JSON.stringify(items)); }
export async function listMeals(date) { return read().filter(item => item.date === date); }
export async function addMeal(data) {
  const item = { ...data, id: crypto.randomUUID() };
  write([...read(), item]); return item;
}
export async function updateMeal(id, data) {
  const items = read(); const index = items.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Alimento não encontrado.');
  items[index] = { ...items[index], ...data, id }; write(items); return items[index];
}
export async function removeMeal(id) { write(read().filter(item => item.id !== id)); }
