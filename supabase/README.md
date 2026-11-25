# Supabase — Autenticação e Persistência (DietLife)

Configuração do backend gerenciado (Supabase Auth + PostgreSQL com Row Level Security) para o DietLife.

## Dependência no frontend

O cliente utiliza `@supabase/supabase-js@2.49.4` carregado sob demanda via ES Module CDN (`https://esm.sh/@supabase/supabase-js@2.49.4`), sem bundler e sem alterar `package.json`.

## Passo a passo de setup

1. **Criar projeto no Supabase**
   - Acesse [supabase.com](https://supabase.com), crie um novo projeto e aguarde o provisionamento.
2. **Aplicar o schema e as políticas RLS**
   - Abra **SQL Editor** no painel do Supabase.
   - Cole e execute o conteúdo integral de `supabase/schema.sql`.
   - Verifique em **Table Editor** se a tabela `public.meals` foi criada com **RLS Enabled**.
3. **Configurar confirmação de e-mail (opcional para testes rápidos)**
   - Em **Authentication → Providers → Email**, mantenha **Confirm email** ativo para fluxo com verificação ou desative para login imediato após o cadastro.
   - Se usar confirmação por e-mail, adicione `http://localhost:3000` e `https://dietlife-xi.vercel.app` em **Authentication → URL Configuration → Redirect URLs**.
4. **Configurar chaves públicas no cliente**
   - Em **Project Settings → API**, copie **Project URL** e a chave **anon / public** (ou **publishable**).
   - Preencha `DEFAULT_CONFIG.url` e `DEFAULT_CONFIG.anonKey` em `src/js/supabase-client.js`.
   - **Nunca** utilize a chave `service_role` ou segredos privados no código do navegador.
5. **Executar e validar localmente**
   ```bash
   npm run build
   npm test
   npm run dev