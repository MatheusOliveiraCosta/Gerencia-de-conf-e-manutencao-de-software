export const PERIODS = [
  { id: 'breakfast', label: 'Café da manhã', time: 'Manhã', icon: '☀' },
  { id: 'lunch', label: 'Almoço', time: 'Meio-dia', icon: '◉' },
  { id: 'snack', label: 'Café da tarde', time: 'Tarde', icon: '☕' },
  { id: 'dinner', label: 'Janta', time: 'Noite', icon: '☾' }
];
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function validateMeal(input = {}) {
  const errors = {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const raw = input.calories;
  const calories = typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== '') ? Number(raw) : NaN;
  if (!name || name.length > 100) errors.name = 'Informe um alimento de até 100 caracteres.';
  if (!Number.isFinite(calories) || calories < 0 || calories > 10000) errors.calories = 'Informe calorias entre 0 e 10.000.';
  if (!PERIODS.some(p => p.id === input.period)) errors.period = 'Selecione um turno válido.';
  const date = input.date;
  const validDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date)) && new Date(date+'T00:00:00Z').toISOString().slice(0,10) === date;
  if (!validDate) errors.date = 'Informe uma data válida.';
  return { valid: Object.keys(errors).length === 0, errors, data: { name, calories, period: input.period, date } };
}
export function totalCalories(items) {
  return Math.round(items.reduce((sum, item) => sum + Number(item.calories), 0)*100)/100;
}
