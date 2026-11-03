# Especificação de Funcionalidade: 03 — Consultar Detalhes do Chamado

## Objetivo
Disponibilizar a visualização aprofundada de um chamado específico a partir de seu identificador (`ID`), exibindo a descrição integral da solicitação, informações do solicitante, timestamps de auditoria e eventuais anotações técnicas do atendimento.

## Atores
- **Funcionário Solicitante:** Para rever o texto completo que enviou e verificar se o suporte já deixou alguma instrução ou parecer.
- **Técnico de Suporte:** Para analisar o relato do problema com riqueza de detalhes antes de iniciar a resolução.
- **Gestor:** Para auditar os dados do incidente.

## User Story
**Como** colaborador ou atendente de TI,  
**quero** consultar todos os dados de um chamado através de seu identificador,  
**para que** eu possa compreender exatamente o problema relatado e consultar o histórico completo de intervenções técnicas.

## Dados de entrada
- **ID do Chamado:** Número inteiro positivo fornecido como parâmetro na rota da API (`/api/chamados/:id`) ou acionado pelo clique na interface.

## Regras de negócio
- **RN01:** A consulta deve retornar o registro íntegro associado unicamente àquele identificador.
- **RN02:** O texto da descrição deve ser exibido na íntegra, respeitando quebras de linha e formatação do texto original, sem truncamentos.
- **RN03:** O sistema deve exibir os seguintes metadados de auditoria:
  - Identificador do chamado (`id`);
  - Solicitante;
  - Categoria;
  - Título;
  - Descrição completa;
  - Status atual;
  - Data e hora de criação (`criadoEm`);
  - Data e hora da última atualização (`atualizadoEm`, se houver);
  - Data e hora de conclusão/fechamento (`encerradoEm`, se houver);
  - Informações do atendimento (Técnico responsável e notas de solução, se houver).
- **RN04:** Se o chamado solicitado não existir na base, o sistema deve retornar código HTTP 404 (Not Found) com mensagem "Chamado não encontrado".
- **RN05:** Se o identificador fornecido não for um número inteiro válido, o sistema deve retornar código HTTP 400 (Bad Request).

## Comportamento esperado
1. Na lista de chamados, o usuário clica sobre a linha ou no botão **"Detalhes"**.
2. A aplicação faz a requisição assíncrona para `GET /api/chamados/:id`.
3. Um modal responsivo ou painel lateral se abre com transição suave exibindo os dados consolidados.
4. Caso o chamado possua histórico de atendimento ou solução técnica, essa seção é destacada com card específico.
5. O usuário pode fechar o painel de detalhes a qualquer momento sem perder o estado da listagem.

## Validações
- **V01 (Parâmetro ID):** O ID deve ser um valor numérico inteiro maior que zero (`Number.isInteger(id) && id > 0`).
- **V02 (Existência):** O registro correspondente deve existir na base de dados.

## Critérios de aceitação
1. **CA01 — Consulta com ID válido existente:**  
   A rota `GET /api/chamados/:id` deve responder com status HTTP 200 e retornar o objeto JSON integral do chamado correspondente.
2. **CA02 — Exibição completa na interface:**  
   A interface deve exibir título, descrição completa preservada, categoria, status formatado, nome do solicitante, data de criação e histórico de atendimento.
3. **CA03 — Consulta de ID inexistente:**  
   Ao requisitar um ID inexistente (ex: `/api/chamados/9999`), a API deve responder com código HTTP 404 e a interface deve notificar que o registro não foi localizado.
4. **CA04 — Parâmetro de ID inválido:**  
   Ao fornecer um ID não numérico (ex: `/api/chamados/abc`), o sistema deve retornar código HTTP 400 com indicação de parâmetro inválido.
5. **CA05 — Exibição de notas técnicas:**  
   Caso o chamado contenha anotações de atendimento preenchidas pelo suporte, estas devem ser renderizadas de forma legível na seção técnica.

## Casos de exceção
- **CE01 (Chamado excluído ou inexistente):** O sistema exibe um alerta de "Chamado não encontrado" e fecha o modal ou retorna à listagem principal.
- **CE02 (Erro no carregamento dos dados):** Notificar o usuário com botão para fechar a visualização.

## Fora do escopo
- Edição do texto original do solicitante na tela de consulta (preservação do relato inicial);
- Histórico versionado de múltiplos comentários em formato de chat (previsto apenas para pós-MVP).

---

## Sessão de Esclarecimento (Etapa 6 do SDD)
- **Pergunta 1:** O solicitante pode alterar o texto original que escreveu após criar o chamado?  
  *Decisão:* Não. Para fins de auditoria e integridade do processo de suporte, o relato original é imutável. Apenas a equipe de atendimento insere notas técnicas de evolução e conclusão.
- **Pergunta 2:** Como deve ser a interface de detalhes para não perder o contexto da lista?  
  *Decisão:* Utilizaremos uma janela modal acessível sobreposta à lista, permitindo que o usuário consulte os detalhes e retorne instantaneamente à listagem com um único clique ou tecla ESC.
- **Pergunta 3:** Como lidar com IDs não numéricos na rota da API?  
  *Decisão:* Validação estrita no backend; converter para inteiro e retornar HTTP 400 caso `isNaN(id)` seja verdadeiro.

---

## Plano de Implementação e Micro-Tarefas (Etapas 7 e 8 do SDD)
- **Tarefa 3.1:** Implementar endpoint REST `GET /api/chamados/:id` com validação de parâmetro inteiro.
- **Tarefa 3.2:** Implementar busca no repositório com retorno adequado para 200, 400 e 404.
- **Tarefa 3.3:** Criar componente de modal na interface HTML para exibição de detalhes e notas técnicas.
- **Tarefa 3.4:** Implementar função JavaScript para interceptar o clique em "Ver Detalhes", disparar o fetch e preencher os elementos do modal.
- **Tarefa 3.5:** Implementar controle de abertura, fechamento (botão fechar, clique fora e tecla ESC) e foco acessível.
- **Tarefa 3.6:** Testar integração completa e verificar critérios de aceitação.

---

## Tabela de Validação de Testes (Etapa 10 do SDD)

| Critério de Aceitação | Dados de Teste | Resultado Esperado | Resultado Obtido | Situação |
|---|---|---|---|---|
| **CA01 — Consulta com ID válido** | `GET /api/chamados/1` (chamado existente) | Retorno HTTP 200 contendo todos os dados do chamado 1 | Dados do chamado 1 retornados corretamente com descrição integral | **Aprovado** |
| **CA02 — Exibição completa na UI** | Abrir chamado #1 na interface | Modal abre exibindo solicitante, categoria, texto e datas | Todos os dados renderizados com clareza no modal de detalhes | **Aprovado** |
| **CA03 — ID inexistente** | `GET /api/chamados/999` | Retorno HTTP 404 com `{ "erro": "Chamado não encontrado" }` | Respondeu 404 com mensagem padronizada de recurso não encontrado | **Aprovado** |
| **CA04 — ID com formato inválido** | `GET /api/chamados/xyz` | Retorno HTTP 400 com `{ "erro": "ID inválido" }` | Validação rejeitou requisição com HTTP 400 | **Aprovado** |
| **CA05 — Exibição de notas técnicas** | Chamado com parecer "Troca de cabo realizada" | Seção de atendimento exibe o parecer e o técnico | Parecer renderizado em destaque no card de atendimento | **Aprovado** |

---

## Status
**Concluída**
