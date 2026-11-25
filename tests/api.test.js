// Testes de integração HTTP da rota POST /api/validate-meal.
// Diferente de tests/domain.test.js (que chama validateMeal() direto).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

// Raiz do projeto, independente de onde o comando "npm test" foi executado.
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const serverScript = fileURLToPath(new URL('../scripts/server.js', import.meta.url));

const meal = {
  name: 'Arroz',
  calories: 130,
  period: 'lunch',
  date: '2026-11-25'
};

let server;
let baseUrl;

// Pede ao sistema operacional uma porta livre.
function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

// Inicia scripts/server.js como processo filho e espera a mensagem de "pronto".
function startServer(port) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [serverScript], {
      cwd: projectRoot,
      env: { ...process.env, PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('Servidor nao iniciou em 5 segundos.'));
    }, 5000);

    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
      if (output.includes(`localhost:${port}`)) {
        clearTimeout(timer);
        resolve(child);
      }
    });
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
    child.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Servidor encerrou antes de ficar pronto (codigo ${code}).`));
    });
  });
}

// Envia o corpo como JSON e devolve status HTTP + corpo ja convertido.
async function postMeal(body) {
  const response = await fetch(`${baseUrl}/api/validate-meal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { status: response.status, json: await response.json() };
}

before(async () => {
  const port = await getFreePort();
  server = await startServer(port);
  baseUrl = `http://127.0.0.1:${port}`;
}, { timeout: 10000 });

// O "after" para rodar mesmo se um teste falhar: evitando processo pendurado travando o CI.
after(async () => {
  if (server && server.exitCode === null) {
    server.kill();
    await once(server, 'exit');
  }
});

// Teste 1 - Alimento valido
test('API aceita alimento valido com HTTP 200', async () => {
  const { status, json } = await postMeal(meal);

  assert.equal(status, 200);
  assert.equal(json.valid, true);
  assert.deepEqual(json.errors, {});
  assert.deepEqual(json.data, meal);
});

// Teste 2 - Calorias negativas
test('API rejeita calorias negativas com HTTP 422', async () => {
  const { status, json } = await postMeal({ ...meal, calories: -10 });

  assert.equal(status, 422);
  assert.equal(json.valid, false);
  assert.ok(json.errors.calories);
  assert.deepEqual(Object.keys(json.errors), ['calories']); // so esse campo falhou
});

// Teste 3 - Campo obrigatorio ausente
test('API rejeita alimento sem nome com HTTP 422', async () => {
  const { name, ...mealWithoutName } = meal;
  const { status, json } = await postMeal(mealWithoutName);

  assert.equal(status, 422);
  assert.equal(json.valid, false);
  assert.ok(json.errors.name);
  assert.deepEqual(Object.keys(json.errors), ['name']); // so esse campo falhou
});
