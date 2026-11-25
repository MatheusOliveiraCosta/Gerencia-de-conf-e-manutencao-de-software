# DietLife — Operação Deploy

Diário alimentar web desenvolvido para a disciplina de Gerência de Configuração e Manutenção de Software, do curso de Engenharia de Software da UTFPR. O objetivo é facilitar o registro de alimentos e calorias e demonstrar, na prática, um processo automatizado e confiável de integração e entrega de software.

**Aplicação:** [dietlife-xi.vercel.app](https://dietlife-xi.vercel.app/) · **[Repositório](https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software)** · **[GitHub Actions](https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/actions)**

## Funcionalidades

- Registro e consulta de alimentos por data e por turno: café da manhã, almoço, café da tarde e jantar.
- Edição e exclusão de registros; atualização dos totais de calorias e quantidade de alimentos.
- Validação de entradas no frontend e na API HTTP.
- Cadastro, login e logout implementados com Supabase Auth.
- Persistência por usuário no PostgreSQL, com políticas Row Level Security (RLS) previstas no schema; modo local disponível quando o Supabase não está configurado.

A integração do código está concluída. A autenticação e a persistência na implantação devem ser verificadas por teste manual com contas de demonstração; os testes automatizados atuais não cobrem o serviço remoto.

## Equipe

| Integrante | Responsabilidade principal |
|---|---|
| Matheus Costa | Liderança de integração, Git, testes unitários, CI/CD e publicação |
| Alexandre de Lucas | Autenticação, persistência e configuração do Supabase |
| Camille Dal´ Lin | Edição e exclusão de alimentos, interface e feedback |
| Matheus de Jesus | Testes de integração HTTP da API |
| Nelson Meirelles da Costa Junior | Documentação e organização das evidências |

## Tecnologias e estrutura

HTML, CSS e JavaScript (módulos ES), Node.js 22, Node Test Runner, Supabase Auth e PostgreSQL, Git/GitHub, GitHub Actions e Vercel.

```text
.github/workflows/ci-cd.yml   # automação de CI/CD
api/validate-meal.js        # validação HTTP
src/                        # interface, domínio, autenticação e armazenamento
scripts/                    # servidor local e build
tests/                      # testes unitários e de integração
supabase/                   # schema e instruções de configuração
docs/                       # documentação e evidências
vercel.json                 # configuração de hospedagem
```

## Execução local

Pré-requisitos: Git e Node.js 22.x com npm.

```bash
git clone https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software.git
cd Gerencia-de-conf-e-manutencao-de-software
npm ci
npm run dev
```

Acesse <http://localhost:3000>. Para configurar uma instância própria do Supabase, consulte [supabase/README.md](supabase/README.md) e aplique [supabase/schema.sql](supabase/schema.sql). Use somente URL e chave pública no cliente; nunca exponha chaves privadas ou tokens de deploy. Com Supabase configurado, é necessário autenticar-se para acessar os registros remotos.

## Build e testes

```bash
npm run build
npm test
```

O build prepara `dist/` e gera `dist/version.json` com a identificação do commit. A suíte contém oito testes:

| Tipo | Cenário | Resultado esperado |
|---|---|---|
| Unitário | Alimento válido | Aceito |
| Unitário | Calorias negativas | Rejeitado |
| Unitário | Nome vazio | Rejeitado |
| Unitário | Soma de 90 e 130 kcal | 220 kcal |
| Unitário | Turno inválido | Rejeitado |
| Integração | POST com alimento válido | HTTP 200 |
| Integração | POST com calorias negativas | HTTP 422 |
| Integração | POST sem nome | HTTP 422 |

Os testes de integração iniciam um servidor local e exercitam `POST /api/validate-meal`, verificando status e corpo da resposta. Não dependem de acesso ao Supabase.

## Versionamento e CI/CD

O fluxo adota branches de trabalho e Pull Requests para integração na `main`. Exemplos: [PR #5 – frontend](https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/pull/5), [PR #6 – autenticação](https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/pull/6) e [PR #7 – testes HTTP](https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/pull/7).

O workflow [ci-cd.yml](.github/workflows/ci-cd.yml) é disparado por push, Pull Request para `main` ou execução manual:

1. **CI:** checkout, Node.js 22, `npm ci`, `npm run build`, `npm test` e upload do artefato `dietlife-build`.
2. **CD:** depende de `ci` (`needs: ci`) e só publica quando a referência é `main` e o evento não é Pull Request. A Vercel CLI recupera a configuração, constrói a versão de produção e publica com `--prebuilt --prod`.
3. A publicação Git direta da Vercel foi desativada. O job de CD utiliza `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` armazenados nos secrets do GitHub.

O artefato do CI é uma saída de distribuição auditável; o job CD prepara separadamente o build da Vercel a partir do mesmo commit. A solução automatiza tanto a preparação da entrega quanto a implantação em produção após validação.

## Evidências e rastreabilidade

| Execução | Commit | Resultado |
|---|---|---|
| #12 | `ef9ae19` | CI e publicação aprovados |
| [#13](https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/actions/runs/45686777797) | `26abd6b` | Teste reprovado; publicação não executada |
| [#14](https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/actions/runs/45687103648) | `12fc3ff` | Recuperação e publicação aprovadas |
| [#31](https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software/actions/runs/45713082003) | `3458188` | Versão integrada aprovada (referência consultada em 25/11/2026) |

A falha controlada alterou o resultado esperado de 220 para 300 no teste de soma. A restauração do valor correto permitiu a retomada da publicação. Consulte o histórico de Actions para identificar a versão mais recente após futuras alterações neste README. O arquivo [version.json da aplicação](https://dietlife-xi.vercel.app/version.json) pode ser usado no navegador para conferir o commit publicado.

## Limitações

- Projeto acadêmico: não prescreve dietas nem calcula necessidades nutricionais; calorias são informadas pelo usuário.
- Depende da disponibilidade do Supabase, da CDN do cliente e da Vercel quando usado com autenticação remota.
- Os testes automatizados abrangem domínio e API de validação, não a interface completa, autenticação remota ou isolamento real entre contas.
- O modo de demonstração local não sincroniza dados entre dispositivos.

## Documentação e uso de IA

O relatório e as evidências ficam em `docs/`. ChatGPT foi utilizado no planejamento, geração de código inicial e testes, orientação do pipeline, resolução de problemas e apoio à documentação. A equipe executou comandos, integrou contribuições e verificou os resultados. As demais ferramentas usadas por cada integrante e a revisão efetivamente realizada devem ser registradas no documento técnico.

## Licença

MIT — consulte [LICENSE](LICENSE).


## Tutorial de execução

### 1. Pré-requisitos

Antes de executar o projeto, certifique-se de possuir:

- Git;
- Node.js 22.x;
- npm (incluído na instalação do Node.js);
- Um navegador web atualizado;
- Um editor de código, preferencialmente VS Code.

Verifique as instalações pelo terminal:

```bash
git --version
node -v
npm -v
```

### 2. Clonar o repositório

Abra o terminal e execute:

```bash
git clone https://github.com/MatheusOliveiraCosta/Gerencia-de-conf-e-manutencao-de-software.git
```

Acesse a pasta do projeto:

```bash
cd Gerencia-de-conf-e-manutencao-de-software
```

### 3. Instalar as dependências

Execute:

```bash
npm ci
```

Esse comando instala as dependências conforme as versões
definidas no package-lock.json, garantindo a consistência
do ambiente de desenvolvimento.

### 4. Iniciar a aplicação

Execute:

```bash
npm run dev
```

Após iniciar o servidor, acesse:

http://localhost:3000

Mantenha o terminal aberto enquanto estiver utilizando
a aplicação.

Para encerrar o servidor, pressione Ctrl+C.

### 5. Configuração do banco de dados

O projeto utiliza Supabase Auth e PostgreSQL para
autenticação e persistência das refeições.

A configuração pública do Supabase já está presente
no código da aplicação.

Para utilizar uma instância própria, consulte:

- [Instruções do Supabase](supabase/README.md)
- [Script de criação do banco](supabase/schema.sql)

Nunca exponha chaves privadas ou tokens de publicação.

### 6. Executar os testes automatizados

Execute:

```bash
npm test
```

Resultado esperado:

- 5 testes unitários aprovados;
- 3 testes de integração aprovados;
- 8 testes aprovados no total;
- 0 falhas.

### 7. Gerar o build de produção

Execute:

```bash
npm run build
```

Os arquivos construídos serão disponibilizados
no diretório dist/.

### 8. Acesso sem instalação

Também é possível utilizar a aplicação diretamente
pela versão publicada na Vercel:

https://dietlife-xi.vercel.app/

Nesse caso, não é necessário instalar nenhuma ferramenta.
