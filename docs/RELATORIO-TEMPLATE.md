# Relatório Técnico – CI/CD do DietLife

## 1. Implementação dos testes automatizados

Foram implementados cinco testes automatizados para validar o funcionamento das principais regras de negócio da aplicação DietLife.

Os testes verificam:

- Aceitação de alimentos com dados válidos.
- Rejeição de calorias negativas.
- Rejeição de nomes vazios.
- Cálculo correto do total de calorias.
- Rejeição de alimentos inexistentes.

A execução dos testes foi realizada utilizando o comando `npm test`, apresentando cinco testes aprovados e nenhuma falha.

**Evidência 1 – Execução dos testes e build local:**  
![Execução dos testes e build local](evidencias/01-testes-e-build-local.png)

---

## 2. Integração por Pull Request

Os testes automatizados foram implementados em uma branch específica e posteriormente integrados à branch principal (`main`) por meio de um Pull Request.

Após a revisão e integração, as alterações passaram a compor o código principal do projeto.

**Evidência 2 – Pull Request integrado:**  
![Pull Request dos testes](evidencias/02-pr-testes-automatizados.png)

---

## 3. Pipeline de integração contínua (CI)

Foi configurado um pipeline de integração contínua utilizando GitHub Actions, responsável por executar automaticamente o processo de build e os testes automatizados sempre que alterações são enviadas ao repositório.

Na execução registrada, o build e os testes foram concluídos com sucesso.

**Evidência 3 – Pipeline CI com sucesso:**  
![Pipeline CI](evidencias/03-pipeline-ci-sucesso.png)

---

## 4. Pipeline de integração e entrega contínua (CI/CD)

O pipeline foi ampliado para incluir a publicação automatizada da aplicação na Vercel.

O fluxo realiza a execução do build e dos testes automatizados e, caso essas etapas sejam aprovadas, prossegue para a publicação da aplicação.

**Evidência 4 – Pipeline CI/CD com publicação na Vercel:**  
![Pipeline CI CD](evidencias/04-pipeline-cicd-vercel.png)

Aplicação: https://dietlife-xi.vercel.app/

---

## 5. Simulação de falha no pipeline

Para validar o funcionamento do pipeline, foi realizada uma alteração proposital no teste responsável pelo cálculo do total de calorias.

O resultado esperado foi alterado de `220` para `300`, provocando a reprovação do teste automatizado.

Com a falha identificada, o pipeline foi interrompido, impedindo que a etapa de publicação na Vercel fosse executada.

**Evidência 5 – Falha proposital no teste:**  
![Falha no pipeline](evidencias/05-falha-proposital-teste.png)

---

## 6. Recuperação do pipeline

Após a simulação da falha, o valor esperado foi restaurado para `220`, corrigindo a condição do teste.

Com a restauração do valor correto, os testes voltaram a ser aprovados e o pipeline pôde prosseguir normalmente, permitindo a execução da etapa de publicação.

**Evidência 6 – Recuperação do pipeline:**  
![Recuperação do pipeline](evidencias/06-recuperacao-pipeline.png)

---

## 7. Conclusão

A implementação do pipeline CI/CD permitiu automatizar a validação do código, a execução dos testes e a publicação da aplicação DietLife.

A simulação de falha demonstrou que a reprovação de um teste impede a continuidade do processo de publicação, contribuindo para evitar que alterações inconsistentes sejam disponibilizadas.

O processo também demonstrou a integração entre GitHub, GitHub Actions e Vercel, permitindo maior confiabilidade e automatização no fluxo de desenvolvimento.
