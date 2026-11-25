
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMeal, totalCalories } from '../src/js/domain.js';

const meal = {
    name: 'Arroz',
    calories: 130,
    period: 'lunch',
    date: '2026-11-25'
};

// Teste 1 - Cadastro válido
test('aceita alimento com dados validos', () => {
    const result = validateMeal(meal);

    assert.equal(result.valid, true);
    assert.deepEqual(result.data, meal);
});

// Teste 2 - Calorias negativas
test('rejeita calorias negativas', () => {
    const result = validateMeal({
        ...meal,
        calories: -10
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.calories);
});

// Teste 3 - Nome vazio
test('rejeita nome vazio', () => {
    const result = validateMeal({
        ...meal,
        name: ''
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.name);
});

// Teste 4 - Soma das calorias
test('calcula corretamente o total de calorias', () => {
    const result = totalCalories([
        { calories: 90 },
        { calories: 130 }
    ]);

    assert.equal(result, 300);
});

// Teste 5 - Turno inválido
test('rejeita turno inexistente', () => {
    const result = validateMeal({
        ...meal,
        period: 'invalido'
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.period);
});
