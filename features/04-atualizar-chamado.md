# Especificação de Funcionalidade: 04 — Atualizar Status e Atendimento

## Objetivo
Permitir que a equipe de suporte técnico assuma um chamado, altere seu status operacional (Aberto, Em atendimento, Concluído ou Cancelado) e registre informações e pareceres técnicos sobre o atendimento realizado, garantindo rastreabilidade do ciclo de vida da demanda.

## Atores
- **Técnico de Suporte / Atendente:** Responsável por realizar a triagem técnica, executar a manutenção e registrar o laudo e resolução.

## User Story
**Como** técnico de suporte,  
**quero** atualizar o status de um chamado e registrar informações técnicas sobre as ações tomadas,  
**para que** o solicitante saiba em qual estágio seu chamado se encontra e fique documentada a resolução aplicada.

## Dados de entrada
- **ID do Chamado:** Identificador único via rota `/api/chamados/:id/atendimento`.
- **Status:** Seleção obrigatória entre:
  - `Aberto`
  - `Em atendimento`
  - `Concluído`
  - `Cancelado`
- **Técnico Responsável:** Nome do profissional que está atuando no chamado (obrigatório para "Em atendimento", "Concluído" e "Cancelado", mínimo 3 caracteres).
- **Notas de Atendimento / Parecer Técnico:** Texto descritivo das ações tomadas ou justificativa do cancelamento (obrigatório ao marcar como "Concluído" ou "Cancelado", mínimo 5 caracteres e máximo 2000 caracteres).

## Regras de negócio
- **RN01:** Apenas transições para os status permitidos (`Aberto`, `Em atendimento`, `Concluído`, `Cancelado`) são aceitas.
- **RN02:** Ao avançar o status para **"Em atendimento"**, o nome do técnico responsável deve ser obrigatoriamente preenchido.
- **RN03:** Ao definir o status como **"Concluído"** ou **"Cancelado"**, tanto o nome do técnico quanto as **notas de atendimento** tornam-se de preenchimento obrigatório para documentar o desfecho da solicitação.
- **RN04:** A cada atualização, o sistema deve registrar o timestamp `atualizadoEm` com a data e hora do servidor.
- **RN05:** Quando o status transitar para "Concluído" ou "Cancelado", o sistema deve preencher o timestamp `encerradoEm`. Se retornar para "Em atendimento" ou "Aberto", o campo `encerradoEm` é limpo (`null`).
- **RN06:** O sistema deve manter o histórico das notas anteriores ou atualizar o parecer com transparência.

## Comportamento esperado
1. Na visualização de detalhes do chamado, o técnico clica no botão **"Atualizar Atendimento"**.
2. É exibido um formulário de atendimento contendo:
   - Seletor de novo status;
   - Campo para nome do técnico responsável;
   - Campo de texto para notas/solução do atendimento.
3. O técnico preenche as informações e confirma o envio.
4. O backend valida as regras de transição de status e preenchimento dos campos obrigatórios.
5. Em caso de sucesso:
   - Os dados são atualizados no arquivo de persistência;
   - O modal de detalhes é atualizado em tempo real exibindo o novo status e parecer;
   - A listagem geral de chamados atualiza o badge de status e os dados correspondentes;
   - Uma mensagem de sucesso confirma a operação ("Atendimento atualizado com sucesso!").

## Validações
- **V01 (Status):** O valor enviado deve pertencer rigorosamente à lista de status permitidos.
- **V02 (Técnico):** Obrigatório quando o status for diferente de "Aberto".
- **V03 (Notas de Atendimento):** Obrigatório e com no mínimo 5 caracteres quando o status for "Concluído" ou "Cancelado".
- **V04 (Existência):** O ID informado na rota deve corresponder a um chamado existente na base.

## Critérios de aceitação
1. **CA01 — Atualização válida para 'Em atendimento':**  
   Ao enviar status "Em atendimento" com nome de técnico válido, o sistema atualiza o registro, define `atualizadoEm` e responde com HTTP 200.
2. **CA02 — Conclusão de chamado com parecer:**  
   Ao enviar status "Concluído" com técnico e parecer da solução, o chamado é salvo com status "Concluído", `encerradoEm` preenchido e retorna HTTP 200.
3. **CA03 — Bloqueio de conclusão sem notas:**  
   Ao tentar marcar como "Concluído" sem fornecer as notas de atendimento, a requisição deve ser rejeitada com código HTTP 400 e mensagem indicando obrigatoriedade da descrição da solução.
4. **CA04 — Bloqueio por status inválido:**  
   Caso seja enviado um status não homologado (ex: "Em espera" ou "Finalizado"), a API deve responder com código HTTP 400.
5. **CA05 — Atualização de chamado inexistente:**  
   Ao tentar atualizar um ID que não existe na base, o sistema deve retornar HTTP 404 com erro explicativo.

## Casos de exceção
- **CE01 (Tentativa de salvar campos vazios com status final):** A interface e a API bloqueiam a ação e avisam que para concluir é necessário detalhar a resolução do problema.
- **CE02 (Erro ao persistir):** Caso ocorra erro de I/O no disco, o sistema retorna erro 500 sem corromper os dados preexistentes.

## Fora do escopo
- Reabertura por votação ou aprovação formal do solicitante;
- Notificação push para o celular do usuário;
- Avaliação por estrelas (pesquisa de satisfação pós-atendimento).

---

## Sessão de Esclarecimento (Etapa 6 do SDD)
- **Pergunta 1:** Um chamado pode ser concluído sem descrever o que foi feito?  
  *Decisão:* Não. Uma das maiores queixas descritas no problema da empresa é a falta de histórico organizado. Para concluir ou cancelar, o técnico é obrigado a descrever a ação realizada ou o motivo do cancelamento.
- **Pergunta 2:** É permitido reabrir um chamado concluído?  
  *Decisão:* Sim, caso o problema reapareça, o chamado pode ser retornado para "Aberto" ou "Em atendimento", mantendo o registro da ação anterior.
- **Pergunta 3:** Quais os status canônicos?  
  *Decisão:* Quatro status exclusivos: `Aberto`, `Em atendimento`, `Concluído`, `Cancelado`.

---

## Plano de Implementação e Micro-Tarefas (Etapas 7 e 8 do SDD)
- **Tarefa 4.1:** Implementar endpoint REST `PUT /api/chamados/:id/atendimento` no servidor Express.
- **Tarefa 4.2:** Implementar camada de validação de regras de negócio (status válidos, exigência de técnico e de notas para status de fechamento).
- **Tarefa 4.3:** Implementar lógica de atualização dos timestamps (`atualizadoEm` e `encerradoEm`) no repositório.
- **Tarefa 4.4:** Criar formulário de atualização de status e atendimento integrado ao modal de detalhes do chamado.
- **Tarefa 4.5:** Adicionar validação no front-end para orientar o técnico antes da submissão.
- **Tarefa 4.6:** Integrar requisição `fetch` com método PUT e refletir as alterações no modal e na tabela imediatamente.
- **Tarefa 4.7:** Executar testes automatizados e preencher tabela de validação.

---

## Tabela de Validação de Testes (Etapa 10 do SDD)

| Critério de Aceitação | Dados de Teste | Resultado Esperado | Resultado Obtido | Situação |
|---|---|---|---|---|
| **CA01 — Atualizar para 'Em atendimento'** | ID #1, Status: "Em atendimento", Técnico: "Lucas Santos" | Status atualizado para "Em atendimento", HTTP 200 | Atualizado com sucesso, `atualizadoEm` registrado | **Aprovado** |
| **CA02 — Conclusão de chamado** | ID #1, Status: "Concluído", Técnico: "Lucas Santos", Notas: "Substituído cabo de força defeituoso." | Status atualizado para "Concluído", `encerradoEm` gerado, HTTP 200 | Chamado finalizado com notas registradas | **Aprovado** |
| **CA03 — Concluir sem notas** | ID #1, Status: "Concluído", Técnico: "Lucas", Notas: "" | Rejeição imediata com código HTTP 400 | Erro "Notas de atendimento são obrigatórias para concluir ou cancelar o chamado" retornado | **Aprovado** |
| **CA04 — Status inválido** | ID #1, Status: "Desconhecido" | Rejeição com código HTTP 400 | Erro "Status inválido" retornado | **Aprovado** |
| **CA05 — Chamado inexistente** | ID #9999, Status: "Em atendimento" | Código HTTP 404 | Retornou 404 Not Found conforme especificado | **Aprovado** |

---

## Status
**Concluída**
