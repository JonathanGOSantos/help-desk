# Especificação de Funcionalidade: 02 — Listar Chamados

## Objetivo
Permitir que usuários e técnicos visualizem a lista completa e organizada dos chamados registrados no sistema, fornecendo visão geral do fluxo de demandas e facilitando a identificação rápida do estado de cada solicitação.

## Atores
- **Funcionário Solicitante:** Para consultar a lista de solicitações existentes e acompanhar o panorama geral.
- **Técnico de Suporte:** Para identificar chamados abertos que requerem atendimento.
- **Gestor:** Para acompanhar o volume de demandas pendentes e concluídas.

## User Story
**Como** membro da equipe ou solicitante,  
**quero** visualizar uma listagem consolidada de todos os chamados com identificador, solicitante, título, categoria, status e data,  
**para que** eu tenha visibilidade imediata das demandas pendentes e possa priorizar o trabalho.

## Dados de entrada
- Não há parâmetros obrigatórios na listagem padrão.
- Parâmetro opcional de consulta: ordenação e paginação simples (se aplicável).

## Regras de negócio
- **RN01:** O sistema deve listar todos os chamados persistidos na base de dados.
- **RN02:** A ordenação padrão dos chamados deve ser por ordem cronológica decrescente (chamados mais recentes aparecem primeiro).
- **RN03:** Cada linha ou card de chamado deve exibir de forma visível:
  - Identificador único (`#ID`);
  - Nome do solicitante;
  - Título do chamado;
  - Categoria;
  - Status atual com indicação visual/estilizada;
  - Data e hora de abertura formatada no padrão brasileiro (`DD/MM/AAAA HH:mm`).
- **RN04:** O status do chamado deve possuir identidade visual distinta (ex.: Aberto em tom âmbar/amarelo, Em Atendimento em azul, Concluído em verde, Cancelado em cinza escuro).
- **RN05:** Cada item listado deve conter um gatilho de ação ("Ver Detalhes" / "Atender") para abrir a consulta detalhada.
- **RN06:** Quando o banco estiver sem registros, deve ser exibida uma mensagem de estado vazio (*empty state*) instruindo o usuário a criar o primeiro chamado.

## Comportamento esperado
1. Ao carregar a página inicial ou clicar na guia "Chamados", o sistema realiza requisição assíncrona ao backend.
2. O backend responde com o array de chamados ordenados.
3. A interface renderiza uma tabela responsiva ou grid de cards informativos.
4. Badges coloridos indicam com clareza o estado de cada ticket.
5. Um contador no topo indica a quantidade total de chamados listados.

## Validações
- **V01:** Validação da estrutura de dados retornada pelo backend (garantir presença dos campos obrigatórios: `id`, `solicitante`, `titulo`, `categoria`, `status`, `criadoEm`).
- **V02:** Tratamento de datas nulas ou inválidas, assegurando formatação segura.

## Critérios de aceitação
1. **CA01 — Recuperação completa de registros:**  
   A rota `GET /api/chamados` deve responder com status HTTP 200 e retornar um array contendo todos os chamados cadastrados.
2. **CA02 — Ordenação cronológica decrescente:**  
   O chamado cadastrado por último deve obrigatoriamente figurar na primeira posição da listagem.
3. **CA03 — Apresentação visual completa dos campos:**  
   A interface deve exibir claramente ID, Solicitante, Título, Categoria, Data de Abertura formatada e Badge de Status para cada registro.
4. **CA04 — Identificação visual por status:**  
   Diferentes status ("Aberto", "Em atendimento", "Concluído", "Cancelado") devem possuir classes CSS distintas com diferenciação cromática inequívoca.
5. **CA05 — Tratamento de lista vazia:**  
   Quando nenhum chamado existir, a tela deve exibir uma mensagem indicativa amigável ("Nenhum chamado registrado até o momento").

## Casos de exceção
- **CE01 (Servidor indisponível / Falha de rede):** A interface deve exibir uma mensagem de erro ("Erro ao carregar chamados. Verifique se o servidor está ativo.") com botão de tentar novamente.

## Fora do escopo
- Paginação complexa com múltiplos limites por página no MVP (a listagem exibirá todos os registros com rolagem limpa);
- Exportação da lista para planilhas Excel ou relatórios PDF.

---

## Sessão de Esclarecimento (Etapa 6 do SDD)
- **Pergunta 1:** Qual deve ser a ordenação inicial dos chamados?  
  *Decisão:* Ordenação decrescente por data de criação (`criadoEm`). Os técnicos precisam ver imediatamente os incidentes mais recentes que acabaram de chegar.
- **Pergunta 2:** O que acontece quando não houver nenhum chamado cadastrado?  
  *Decisão:* A tabela não deve ficar em branco sem explicação. Deve ser exibido um componente de *Empty State* amigável com um botão convidando a cadastrar o primeiro chamado.
- **Pergunta 3:** As datas devem ser exibidas em formato bruto ISO ou formatadas?  
  *Decisão:* As datas devem ser apresentadas de forma amigável no formato local (`DD/MM/AAAA às HH:mm`), melhorando a usabilidade.

---

## Plano de Implementação e Micro-Tarefas (Etapas 7 e 8 do SDD)
- **Tarefa 2.1:** Implementar endpoint REST `GET /api/chamados` no servidor Express.
- **Tarefa 2.2:** Adicionar rotina de ordenação decrescente por timestamp na camada de dados.
- **Tarefa 2.3:** Criar componente de tabela/grid no arquivo `index.html`.
- **Tarefa 2.4:** Criar estilização CSS com badges padronizados para cada tipo de status (`status-aberto`, `status-atendimento`, `status-concluido`, `status-cancelado`).
- **Tarefa 2.5:** Desenvolver script JavaScript para efetuar `fetch('/api/chamados')` e renderizar dinamicamente os registros.
- **Tarefa 2.6:** Adicionar tratamento visual de lista vazia e contador dinâmico de chamados.
- **Tarefa 2.7:** Implementar tratamento de erro de rede com feedback ao usuário.

---

## Tabela de Validação de Testes (Etapa 10 do SDD)

| Critério de Aceitação | Dados de Teste | Resultado Esperado | Resultado Obtido | Situação |
|---|---|---|---|---|
| **CA01 — Retorno da API** | Requisição `GET /api/chamados` com 3 chamados na base | Status 200 e JSON com array de tamanho 3 | Array com 3 objetos contendo todos os atributos retornados | **Aprovado** |
| **CA02 — Ordenação decrescente** | Chamado A criado às 10:00 e Chamado B criado às 10:30 | Chamado B deve ser o primeiro item do array | Chamado B retornado no índice 0 | **Aprovado** |
| **CA03 — Renderização dos campos** | Chamado com ID #1, solicitante "Ana", título "Falha no ERP" | Interface exibe `#1`, "Ana", "Falha no ERP", data e badge | Todos os campos renderizados nas colunas correspondentes | **Aprovado** |
| **CA04 — Badges visuais por status** | Chamados com status "Aberto", "Em atendimento" e "Concluído" | Classes CSS com cores distintas (amarelo, azul, verde) | Classes `.badge-aberto`, `.badge-atendimento`, etc. aplicadas | **Aprovado** |
| **CA05 — Estado de lista vazia** | Base de dados sem registros (`[]`) | Mensagem "Nenhum chamado encontrado" exibida | Mensagem amigável renderizada com ícone ilustrativo | **Aprovado** |

---

## Status
**Concluída**
