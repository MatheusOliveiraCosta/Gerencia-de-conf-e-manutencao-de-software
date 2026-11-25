import { cp, mkdir, rm, writeFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of ['src/index.html', 'src/css/style.css', 'src/js/app.js', 'api/validate-meal.js']) await access(file);
await cp('src', 'dist', { recursive: true });
let commit = process.env.GITHUB_SHA || 'local';
if (commit === 'local') { try { commit = execFileSync('git',['rev-parse','HEAD'],{stdio:['ignore','pipe','ignore']}).toString().trim(); } catch {} }
await writeFile('dist/version.json', JSON.stringify({ commit }, null, 2));
console.log('Build concluído: dist/');
