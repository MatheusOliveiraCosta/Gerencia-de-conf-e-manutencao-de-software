# DietLife — Operação Deploy

Sistema web de diário alimentar para registrar alimentos e calorias em quatro turnos do dia. Projeto da disciplina **Gerência de Configuração e Manutenção de Software**, UTFPR.

**Problema:** pessoas que desejam organizar suas refeições frequentemente não têm um registro centralizado e simples das calorias informadas ao longo do dia. O DietLife permite cadastrar, consultar, editar e excluir alimentos, acompanhando o total diário. Não é uma ferramenta de prescrição nutricional.

**Entrega:** 25/11/2026, até 21h30 (prazo interno informado pela equipe). Apresentação de até 12 minutos. Confirmar aprovação da ideia própria com a professora.

**Estado atual (25/11/2026):** cinco testes unitários, build e pipeline CI/CD já executados com sucesso; a publicação inicial foi realizada na Vercel (execução #12, commit `ef9ae19`). A falha proposital e a correção foram relatadas pelo líder; falta registrar/confirmar as respectivas execuções e a recuperação. As entregas de autenticação e edição/exclusão ainda precisam ser verificadas na versão integrada. Não declare uma tarefa concluída sem evidências.

**Repositório:** https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software  
**Aplicação publicada:** https://dietlife-xi.vercel.app/  
**Ações do pipeline:** https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/actions

**Matheus de Jesus:** sua nova tarefa é exclusivamente complementar os testes da API. Vá diretamente à [seção 5.5](#55-matheus-de-jesus--testes-de-integracao-da-api). Não refaça os testes unitários nem o CI/CD já implementados.

## 1. Integrantes e responsabilidades

| Integrante | Papel principal | Branch | Arquivos sob responsabilidade |
|---|---|---|---|
| Matheus Costa | Líder de integração, testes unitários e engenheiro de pipeline | `feat/tests`, `feat/ci-cd`, `feat/deploy-vercel` | `tests/domain.test.js`, `.github/workflows/ci-cd.yml`, `vercel.json`, configuração GitHub/Vercel, integração |
| Alexandre de Lucas | Backend e autenticação | `feat/backend-auth` | `src/js/auth.js`, `src/js/storage.js`, `src/js/account-ui.js`, `supabase/`, configuração pública do cliente |
| Camille Dal´ Lin | Frontend e funcionalidades | `feat/meal-crud` | `src/js/app.js`, `src/index.html`, `src/css/style.css` |
| Matheus de Jesus | Testes de integração da API | `feat/integration-tests` | `tests/api.test.js` (novo arquivo) |
| Nelson Meirelles da Costa Junior | Documentação e evidências | `docs/` | `docs/`, checklist de uso, capturas, PDF técnico com ajuda da equipe |

Matheus Costa revisa e integra todos os PRs e atualiza este README com os links e resultados. Alexandre e Camille combinam alterações na interface da conta: Camille é responsável pelo HTML; Alexandre pode solicitar a remoção do texto provisório após validar a autenticação. Não modifiquem arquivos atribuídos aos demais sem alinhamento. Todos devem saber explicar o projeto.

## 2. Tecnologias e arquitetura

- HTML, CSS e JavaScript (ES modules), sem framework de frontend.
- Node.js 22: servidor HTTP local, build e testes nativos (`node:test`).
- Vercel Functions: API `POST /api/validate-meal` (validação de entrada no servidor).
- Supabase Auth + PostgreSQL (planejado, ainda não conectado): autenticação e persistência por usuário; RLS protege os registros.
- GitHub e GitHub Actions: versionamento e automação CI/CD (já configurados).
- Vercel: hospedagem e publicação por CLI após aprovação do pipeline na main.

```text
Navegador (HTML/CSS/JS)
  ├─ POST /api/validate-meal → Node.js / Vercel Function
  └─ Adaptador de dados e autenticação
       ├─ Atual: armazenamento local (demonstração)
       └─ Planejado: Supabase Auth + PostgreSQL com RLS

GitHub → CI (npm ci → build → testes) → artefato → CD (Vercel)
```

A função de validação é stateless; os dados persistentes não serão gravados no filesystem da Vercel. A validação da API não substitui as constraints e políticas do banco remoto. Supabase é um backend gerenciado; não há necessidade de servidor Express separado. O enunciado recomenda armazenamento local e desaconselha complexidade desnecessária. Caso a autenticação atrase, priorizem a versão demonstrável local, informando claramente a limitação e validando essa decisão com a professora.

## 3. Executar localmente

Requisitos: Node.js 22, npm e Git. Abra o terminal na raiz do projeto.

```bash
npm ci
npm run dev
```

Acesse http://localhost:3000. Não abra o HTML diretamente, pois o sistema usa módulos e API HTTP. Para parar o servidor: Ctrl+C.

```bash
npm run build  # gera dist/ e version.json
npm test       # executa os testes automatizados
```

O build copia os arquivos estáticos de `src/` para `dist/`. `api/` permanece na raiz para ser empacotado pela Vercel. `dist/version.json` registra o commit quando disponível. O servidor local serve `src/` e a função de validação.

### Estado das funcionalidades

- [x] Interface responsiva, data selecionável e quatro turnos de refeição.
- [x] Adicionar e consultar alimentos por data no modo demonstração.
- [x] Somatório de calorias por turno e por dia.
- [x] Validação de nome, turno, data e calorias no cliente e API.
- [x] Persistência local no navegador.
- [x] Formulário visual de login/cadastro, sem autenticação efetiva.
- [ ] Login, cadastro, logout e isolamento real de registros por usuário.
- [ ] Edição e exclusão disponíveis na interface (adaptador local já oferece as operações).
- [x] Cinco testes unitários executados com sucesso.
- [ ] Três testes adicionais de integração da API — Matheus de Jesus.
- [x] Pipeline CI/CD executado no GitHub e publicação na Vercel (execução #12).
- [ ] Falha e correção relatadas; confirmar bloqueio e recuperação no Actions e registrar evidências.
- [ ] PDF técnico final e links da entrega.

### Contrato para desenvolvimento paralelo

Cada item de `meals` usa o formato `{ id, name, calories, period, date }`. No banco remoto, acrescentar `user_id` e retornar os mesmos campos ao frontend.

| Campo | Regra |
|---|---|
| `id` | UUID, gerado no adaptador ou banco |
| `name` | texto não vazio, após trim, até 100 caracteres |
| `calories` | número finito de 0 a 10000, com até duas casas na interface |
| `period` | `breakfast`, `lunch`, `snack`, `dinner` |
| `date` | data válida no formato `YYYY-MM-DD` |

`domain.js` exporta `PERIODS`, `today()`, `validateMeal(input)` (retorna `{ valid, errors, data }`) e `totalCalories(items)`. Não alterem as assinaturas sem consenso. `storage.js` exporta operações assíncronas `listMeals(date)`, `addMeal(data)`, `updateMeal(id, data)` e `removeMeal(id)`. `auth.js` exporta `getSession()`, `signIn(email,password)`, `signUp(email,password)` e `signOut()`. O contrato de sessão é `null` ou `{ user: { id, email }, ... }`. A UI deve usar `textContent` para nomes informados por usuários, não inserir HTML arbitrário. O modo demo não deve ser confundido com autenticação.

## 4. Fluxo de Git — obrigatório para todos

O repositório já existe. Matheus Costa deve conferir se os integrantes têm acesso de colaborador.

Demais integrantes: se ainda não clonaram o projeto, executem:

```bash
git clone https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software.git
cd Gerencia-de-conf-e-manutencao-de-software
```

Se já clonaram, abram a pasta existente e não clonem novamente. Com o diretório de trabalho limpo, atualizem a main e criem sua branch (substituam `MINHA_BRANCH` pelo nome da seção 1):

```bash
git switch main
git pull origin main
git switch -c MINHA_BRANCH
npm ci
```

Se a branch já existir, usem `git switch MINHA_BRANCH` em vez de recriá-la. Para iniciar o sistema localmente, `npm run dev`.

Ao concluir uma pequena entrega:

```bash
git status
git add CAMINHOS_DOS_SEUS_ARQUIVOS
git commit -m "feat: descreva a alteração"
git push -u origin MINHA_BRANCH
```

Abra um Pull Request para `main`. Não faça push diretamente na `main` durante o desenvolvimento normal. Não faça `git add .` indiscriminadamente se houver segredos. Matheus verifica os PRs, solicita correções e integra. Se precisar atualizar a branch: `git fetch origin` e `git merge origin/main`, resolvendo conflitos com o responsável. Os testes unitários e o CI/CD já foram integrados; mantenham os commits de novas tarefas separados. Proteção da main com status check é recomendada, quando disponível no plano/repositório.

## 5. Tarefas e prompts para copiar e colar na IA

Abra o repositório em VS Code e use sua IA de programação. Cole apenas o prompt do seu papel, com o projeto aberto. Os prompts originais de Matheus Costa ficam como referência histórica, pois os testes unitários e o pipeline já foram implementados. Matheus de Jesus deve usar apenas a seção 5.5. Se a IA não tiver acesso ao repositório, envie o código dos arquivos atribuídos. Revise tudo, rode os comandos, faça commits próprios e não aceite alteração em arquivos de terceiros sem combinar. Não envie senhas/tokens à IA.

### 5.1 Matheus Costa — integração, testes automatizados, CI/CD e Vercel

Os testes unitários e o CI/CD já foram integrados à `main`. Os prompts abaixo registram o planejamento original e não precisam ser executados novamente. O foco agora é revisar PRs, verificar a recuperação e concluir a entrega.

#### 5.1.1 Integração, CI/CD e Vercel

- [ ] Criar repositório, convidar equipe e enviar a base.
- [x] Criar workflow com build, testes, artefato e publicação condicionada ao sucesso.
- [x] Criar projeto Vercel e configurar os secrets no GitHub.
- [ ] Integrar os PRs e demonstrar falha, bloqueio e recuperação dos testes automatizados.
- [ ] Registrar versão publicada, link, SHA e execuções; conferir entrega final.

**Prompt:**

```text
Estou desenvolvendo o DietLife para a disciplina Gerência de Configuração e Manutenção de Software. Leia o README e package.json. Sou Matheus Costa, responsável pelo GitHub Actions, Vercel, integração e testes automatizados (em tarefa separada). Não implemente as funcionalidades dos outros colegas.
Crie .github/workflows/ci-cd.yml usando Node.js 22, npm ci, npm run build e npm test. Execute CI em pull_request para main e push em main. Use permissões mínimas e ações oficiais do GitHub. Gere um artefato após build e testes passarem. A entrega/publicação deve depender do sucesso do job CI (needs), rodar apenas em push na main, nunca em PR, e ficar visivelmente skipped se CI falhar. Use checkout do mesmo SHA, configure Vercel CLI, VERCEL_ORG_ID, VERCEL_PROJECT_ID e VERCEL_TOKEN como secrets, vercel pull --yes --environment=production, vercel build --prod e vercel deploy --prebuilt --prod. Gere e faça upload do artefato .vercel/output antes de publicar, incluindo arquivos ocultos somente dentro desse diretório (não inclua .vercel/.env.production.local); também registre o SHA e URL da publicação. Se separar jobs de preparo e deploy, transfira o artefato validado e não reconstrua uma versão diferente. Configure concorrência de produção para evitar deploy antigo sobre novo. Mantenha git.deploymentEnabled=false no vercel.json e explique como desvincular integração automática Git/Vercel para impedir publicação independente dos testes. Explique setup do projeto Vercel com CLI, obtenção dos IDs e secrets sem expor tokens e como criar evidências de sucesso/falha/recuperação. Não invente resultados. Use os scripts e estrutura existentes e me mostre como testar e publicar.
```

**Setup e cuidados de publicação:** criar projeto Vercel sem vincular o Git (ou desconectar a integração automática). Rodar `npx vercel link` na raiz para escolher/criar o projeto, conferir `orgId` e `projectId` em `.vercel/project.json`, gerar token na conta Vercel e cadastrar os três secrets em GitHub → Settings → Secrets and variables → Actions. Não publicar manualmente para contornar CI. Configurar o framework como Other, build `npm run build`, output `dist`, Node 22. Se Alexandre usar configuração pública de Supabase, alinhar as variáveis de build com ele antes do deploy. Valide o endpoint `/api/validate-meal` na aplicação hospedada. Nunca inclua service role key, token Vercel ou arquivos `.env` em artefatos.

#### 5.1.2 Matheus Costa — testes automatizados (`feat/tests`)

- [x] Ampliar os testes para cinco.
- [x] Cobrir comportamentos reais com `node:test` e `assert/strict`.
- [x] Rodar `npm test` (cinco aprovados); encaminhar evidência ao relatório.
- [ ] Simular uma regressão e comprovar bloqueio/recuperação.

**Prompt:**

```text
Leia o README, src/js/domain.js, api/validate-meal.js e tests/domain.test.js. Sou Matheus Costa, responsável por testes e CI/CD. Use apenas node:test e node:assert/strict, já configurados em npm test, sem instalar Jest. Crie testes reais para cadastro válido normalizado, rejeição de nome vazio, rejeição de calorias negativas ou vazias, turno inválido, data inválida e total de calorias de vários alimentos. Inclua, se possível, testes do handler API com req/res simulados verificando 200 e 422. Não use testes que apenas conferem constantes sem comportamento. Não altere a lógica da aplicação para fazer testes passarem: comunique defeitos ao responsável. Rode npm test, explique o resultado e monte uma tabela com caso, entrada, resultado esperado e resultado observado. Prepare uma regressão temporária e reversível no cálculo ou validação, que faça um teste real falhar; explique o procedimento de correção e como capturar evidência no Actions. Não deixe a regressão na entrega final e não invente resultados.
```

### 5.2 Alexandre de Lucas — backend e autenticação

- [ ] Criar projeto Supabase e executar `supabase/schema.sql` com tabela e RLS.
- [ ] Integrar login/cadastro/logout e persistência da sessão.
- [ ] Implementar adaptador remoto mantendo as assinaturas existentes.
- [ ] Testar com dois usuários distintos e confirmar isolamento.
- [ ] Enviar PR, instruções de configuração e resultados para Matheus.

**Prompt:**

```text
Leia o README, src/js/auth.js, src/js/storage.js e src/js/account-ui.js do DietLife. Sou Alexandre, responsável pelo backend. A base usa HTML/CSS/JS sem bundler, Node 22 e uma Vercel Function de validação. Implemente autenticação real usando Supabase Auth (email/senha, cadastro, login, sessão e logout) e persistência PostgreSQL. Crie supabase/schema.sql com tabela meals (id UUID default, user_id UUID FK auth.users, name, calories numeric, period, date) e constraints equivalentes ao domain.js. Ative RLS e crie políticas SELECT, INSERT, UPDATE e DELETE apenas para auth.uid() = user_id, incluindo WITH CHECK nos writes, e privilégios apropriados para authenticated. Não use service_role no cliente. Use supabase-js v2 por módulo CDN com versão fixa verificada, ou uma alternativa sem bundler compatível com navegador; documente a dependência. Crie uma configuração pública para URL e publishable/anon key, sem segredos, coordenando com Matheus caso use env de build. Mantenha os exports assíncronos listMeals(date), addMeal(data), updateMeal(id,data), removeMeal(id), getSession(), signIn(email,password), signUp(email,password), signOut(). Trate erros, confirmação de email, sessão expirada, logout e estado da conta; não guarde senha. Mantenha o modo demonstração local separado e claramente rotulado quando Supabase não for configurado; em modo remoto não misture registros de demo e contas reais, exija sessão para operações de refeição e avise a interface quando não houver sessão. Atualize account-ui.js para atualizar botões, email e lista ao mudar sessão sem duplicar listeners. Combine qualquer ajuste de HTML com Camille. Teste dois usuários, confirme RLS e registre resultados reais. Não altere o pipeline ou os arquivos de teste de Matheus Costa. Explique o setup passo a passo e faça uma lista das limitações.
```

### 5.3 Camille Dal´ Lin — frontend, edição e exclusão

- [ ] Implementar ações de editar e excluir em cada alimento.
- [ ] Reutilizar o modal preenchendo campos existentes e validar antes de salvar.
- [ ] Recalcular o total e preservar o filtro de data após as operações.
- [ ] Melhorar feedback de sucesso, erro, carregamento e acessibilidade.
- [ ] Verificar desktop e celular, enviar PR.

**Prompt:**

```text
Leia o README e o frontend do DietLife. Sou Camille, responsável por completar a interface. Trabalhe em src/js/app.js, src/index.html e src/css/style.css. Não reescreva a aplicação nem altere as APIs de storage.js ou auth.js, pois outro colega está implementando o backend. Hoje adicionar e consultar alimentos por data e turno já funcionam. Implemente botões editar e excluir por alimento. Para editar, reutilize o modal existente, carregue nome, calorias e turno, altere título e botão, valide via validateMeal e POST /api/validate-meal e use await updateMeal(id,data). Para excluir, confirme antes e use await removeMeal(id). Recalcule o total diário e do turno após qualquer alteração, trate falhas sem perder dados e mantenha o layout responsivo. Evite innerHTML para dados do usuário, inclua aria-label e não duplique listeners. Trate erro de sessão do backend com mensagem clara; combine com Alexandre o texto do formulário de conta. Mantenha o comportamento de adicionar/consultar e teste recarregamento da página. Não mude pipeline, schema ou testes. Explique cada alteração e como testar no navegador.
```

### 5.4 Nelson Meirelles da Costa Junior — tarefas simples de qualidade e documentação

Não precisa programar. Sua tarefa é conferir a aplicação, tirar prints e organizar informações para o PDF. Peça os dados técnicos aos respectivos responsáveis; não invente resultados ou histórico.

- [ ] Abrir a aplicação local ou publicada e cadastrar alimentos em dois turnos (ex.: banana 90 kcal, arroz 130 kcal; conferir total 220 kcal).
- [ ] Conferir se calorias negativas são rejeitadas e se os dados continuam após atualizar a página. Após Camille concluir, conferir editar/excluir.
- [ ] Tirar prints legíveis da tela inicial, cadastro, total e validação.
- [ ] Solicitar prints dos colegas: commits/branches, CI verde, CI vermelho com publicação bloqueada, recuperação e página publicada.
- [ ] Salvar os prints em `docs/evidencias/` com nomes `01-aplicacao.png`, `02-branches.png`, etc. Não mostrar senhas, tokens ou dados pessoais.
- [ ] Preencher `docs/RELATORIO-TEMPLATE.md` com os dados reais e pedir que os colegas escrevam/revisem suas seções. Exportar para PDF e conferir se abre. Enviar ao líder.

**Prompt:**

```text
Sou Nelson e minha tarefa no DietLife é simples: documentação e evidências, sem programar. Leia o README e docs/RELATORIO-TEMPLATE.md. Ajude-me passo a passo a abrir a aplicação, cadastrar banana com 90 kcal e arroz com 130 kcal, conferir 220 kcal, testar valor negativo e persistência, editar/excluir quando a função estiver pronta. Crie um checklist manual para eu preencher com resultado real. Explique como tirar prints no Windows, nomeá-los e salvar em docs/evidencias. Ajude a organizar o documento técnico de acordo com o modelo e diga exatamente quais informações e capturas preciso pedir a cada colega. Use somente os resultados e imagens que eu fornecer, marque informações ausentes como pendentes e não invente execução do pipeline ou publicação. Explique como exportar o documento para PDF e conferir os links. Não altere código, testes, pipeline ou README principal.
```

### 5.5 Matheus de Jesus — testes de integração da API

**Tempo estimado: 40–50 minutos.** Não precisa configurar Supabase, Vercel nem GitHub Actions. A API de validação já existe; você vai verificar se ela responde corretamente a requisições HTTP. Matheus Costa já criou cinco testes unitários, então não repita o trabalho dele.

#### Passo 1 — Preparar sua branch

Se ainda não clonou, siga os comandos da seção 4. Abra o projeto no VS Code. Com o terminal na raiz do repositório e sem alterações pendentes:

```bash
git switch main
git pull origin main
git switch -c feat/integration-tests
npm ci
npm test
```

Se a branch já existir, use `git switch feat/integration-tests`. Confirme que os testes anteriores passam antes de começar. Se houver falha na main, avise Matheus Costa.

#### Passo 2 — Criar os testes

Crie somente `tests/api.test.js`. Leia `api/validate-meal.js`, `scripts/server.js`, `src/js/domain.js` e `package.json`. A rota existente é `POST /api/validate-meal`; ela valida dados, mas não grava refeições no banco.

| Caso | Corpo JSON enviado | Resultado esperado |
|---|---|---|
| Alimento válido | `{"name":"Arroz","calories":130,"period":"lunch","date":"2026-11-25"}` | HTTP 200 e `valid: true` |
| Calorias negativas | Mesmo objeto, com `calories: -10` | HTTP 422, `valid: false` e `errors.calories` |
| Campo obrigatório ausente | Mesmo objeto, removendo `name` | HTTP 422, `valid: false` e `errors.name` |

**Prompt pronto para copiar e colar na IA (com o projeto aberto):**

```text
Sou Matheus de Jesus, integrante do DietLife, trabalho da disciplina Gerência de Configuração e Manutenção de Software. Minha tarefa é complementar os cinco testes unitários já existentes com três testes de integração HTTP da API de validação, sem alterar o restante do projeto.

Leia README.md, api/validate-meal.js, scripts/server.js, src/js/domain.js, tests/domain.test.js e package.json. Estou trabalhando na branch feat/integration-tests. Crie apenas tests/api.test.js usando node:test, node:assert/strict e fetch nativo do Node.js 22, sem instalar Jest, Supertest ou outras dependências.

Teste a rota POST /api/validate-meal com Content-Type: application/json. Use o servidor local existente, iniciado pelo próprio teste em processo filho com PORT isolada (por exemplo 3210, se livre), aguarde a inicialização com timeout e encerre o processo em after, inclusive se ocorrer falha. Não dependa de npm run dev iniciado manualmente, Supabase, internet ou da aplicação em produção. Se a porta estiver ocupada, use outra porta livre. Não altere scripts/server.js para realizar os testes sem autorização do líder.

Implemente três casos: (1) alimento válido com name Arroz, calories 130, period lunch e date 2026-11-25 deve retornar HTTP 200 e valid true; (2) mesmo alimento com calories -10 deve retornar HTTP 422, valid false e erro de calories; (3) mesmo alimento sem o campo name deve retornar HTTP 422, valid false e erro de name. Verifique status e corpo JSON. Se o código atual tiver mudado, confira o contrato real e informe divergências ao líder antes de alterar a aplicação. Não invente resultados.

Execute npm test e npm run build. Preserve tests/domain.test.js e todos os demais arquivos. Explique o código e a diferença entre os testes unitários existentes e estes testes de integração HTTP. Mostre os comandos Git para enviar somente tests/api.test.js e abrir um Pull Request para main. A entrega é hoje às 21h30; mantenha a implementação simples.
```

#### Passo 3 — Conferir e enviar

```bash
npm test
npm run build
git status
```

Resultado esperado: os cinco testes anteriores e os três novos aprovados (oito no total se não houver outros testes), sem processos do servidor pendurados. Se algum teste falhar, investigue a causa antes de enviar. Não altere a lógica da aplicação para forçar um teste a passar.

```bash
git add tests/api.test.js
git commit -m "test: adiciona testes de integracao da API de alimentos"
git push -u origin feat/integration-tests
```

Abra o [Pull Request para main](https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/pull/new/feat/integration-tests) com o título `test: adiciona testes de integração da API de alimentos`. Descreva os três casos e o resultado observado. Confira o CI verde (o CD deve ficar pulado no PR) e peça ao Matheus Costa para revisar e integrar. Não faça merge por conta própria nem push na main.

#### Checklist de entrega ao grupo

- [ ] `tests/api.test.js` contém os três testes HTTP.
- [ ] `npm test` e `npm run build` executados com sucesso.
- [ ] Commit e PR enviados; CI aprovado.
- [ ] Print do terminal e link do PR enviados a Matheus Costa e Nelson.
- [ ] Explicação para a apresentação: testes unitários verificam funções isoladas; os novos testes verificam a comunicação HTTP, o status e o corpo da resposta da API.

**Fora do seu escopo:** autenticação, banco de dados, interface, alterações no CI/CD ou simulação de falha (já conduzida por Matheus Costa). Não modifique arquivos dos demais integrantes. Se terminar cedo, ajude Nelson a conferir as evidências dos testes.

## 6. Demonstração obrigatória do pipeline: sucesso → falha → recuperação

1. Após integrar as funcionalidades/testes e configurar Vercel, obtenha uma execução verde na `main`, gere artefato e publique. Anote o SHA, URL de produção e link do run.
2. Com os responsáveis, crie uma branch `demo/regressao` que altere temporariamente uma regra existente (por exemplo, permitir calorias negativas apesar do teste contrário). Commit e abra PR. Confirme CI reprovado. O deploy já seria bloqueado pelo fato de ser PR, então isso **não basta** para comprovar o bloqueio por falha.
3. Para evidência real do job de publicação condicionado ao CI, execute uma simulação controlada de push na branch alvo do deploy (preferencialmente ambiente/branch de demonstração configurado com as mesmas dependências e sem risco para produção; ou na main de um projeto acadêmico isolado, com acordo do grupo e sem contornar proteção indevidamente). A versão anteriormente publicada deve permanecer intacta. Capture o job CI falhando e o job CD `skipped` por `needs`.
4. Reverta somente o commit de regressão (`git revert SHA_DA_REGRESSAO`), integre a correção e capture a nova execução aprovada e a publicação da versão corrigida. Se proteção de branch impedir a regressão na main, use a branch/ambiente de demonstração, não desative a proteção só para criar evidência. Registre a configuração usada e a causalidade.
5. Confira `/version.json` na publicação e compare com o SHA validado pelo pipeline. Salve links e prints no relatório. Não declare êxito de uma execução que não ocorreu.

## 7. Cronograma sugerido para concluir até 21h30

Horários são metas internas, não resultados já obtidos. Trabalhar em paralelo. Matheus de Jesus deve iniciar a seção 5.5 imediatamente e entregar em aproximadamente 40–50 minutos, antes da integração final. Se começarem mais tarde, comprimam etapas sem eliminar testes, evidências e PDF.

**Corte de escopo:** se autenticação remota não estiver estável até 18h15, use modo local explicitamente rotulado, registre a limitação e priorize CI/CD. A aplicação mínima já permite cadastro/consulta. A professora recomenda armazenamento local, mas o login é um requisito adicional escolhido pela equipe, portanto não o declare cumprido se não estiver pronto.

## 8. Pipeline e links (atualizar na entrega final)

- CI: `npm ci` → `npm run build` → `npm test` → artefato `dietlife-build` (executado).
- CD: job dependente da CI aprovada, preparo do pacote Vercel e publicação controlada na main por Vercel CLI (executada).
- Continuous Delivery mantém uma versão pronta para disponibilização; Continuous Deployment publica automaticamente após passar as verificações. Como a publicação na main é automática após as verificações, o projeto também utiliza implantação contínua.
- Repositório: https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software
- Aplicação publicada: https://dietlife-xi.vercel.app/
- Execução aprovada: #12, commit `ef9ae19` (CI e CD aprovados). Histórico: https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/actions
- Execução reprovada e CD bloqueado: PENDENTE.
- Execução recuperada: PENDENTE.
- SHA da publicação confirmada na execução #12: `ef9ae19` (abreviado); atualizar com o SHA completo da entrega final.
- Documento técnico PDF: PENDENTE.

## 9. Limitações conhecidas e verificações pendentes

Na base inicial, não existia autenticação real nem banco remoto conectado, e edição/exclusão não estavam disponíveis na interface. Confirmar a implementação dessas funções após integrar os PRs de Alexandre e Camille. Os cinco testes unitários e o CI/CD já foram executados; os testes de integração HTTP adicionais ainda estão pendentes. Os dados de demonstração são locais ao navegador e podem ser apagados pelo usuário. A API valida dados, não grava registros. Não há metas nutricionais, cálculo automático de calorias por alimento ou orientação médica. As calorias são informadas manualmente.

## 10. Referências e uso de IA

- Enunciado Operação Deploy, Profa. Eduarda Maganha de Almeida.
- Node.js: https://nodejs.org/api/test.html
- GitHub Actions: https://docs.github.com/actions
- Vercel com GitHub Actions: https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel
- Configuração Git/Vercel: https://vercel.com/docs/project-configuration/git-configuration
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security

A IA ChatGPT auxiliou na criação desta base e no planejamento. Cada integrante deve registrar outras ferramentas utilizadas, tarefas realizadas, revisões e resultados reais. A equipe é responsável por compreender e explicar o código.