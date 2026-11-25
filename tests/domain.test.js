import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMeal } from '../src/js/domain.js';
// Exemplo inicial. Matheus Costa: ampliar para >= 3 testes reais.
test('rejeita calorias negativas', () => {
  const result = validateMeal({ name:'Arroz', calories:-10, period:'lunch', date:'2026-11-25' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.calories);
});
