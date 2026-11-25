import { validateMeal } from '../src/js/domain.js';
export default function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Use POST.' }); }
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return res.status(400).json({ error: 'JSON inválido.' }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Dados inválidos.' });
  const result = validateMeal(body);
  return res.status(result.valid ? 200 : 422).json(result);
}
