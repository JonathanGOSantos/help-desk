# Especificação de Funcionalidade: 05 — Filtro por Status e Busca Textual (Evolução Pós-MVP)

## Objetivo
Permitir que usuários e técnicos filtrem chamados por seu status (Todos, Aberto, Em atendimento, Concluído, Cancelado) e realizem busca textual instantânea por palavras-chave no título, descrição ou ID, proporcionando agilidade na localização de demandas em ambientes com grande volume de solicitações.

## Atores
- **Técnico de Suporte:** Para filtrar rapidamente apenas os chamados "Abertos" que precisam de atendimento imediato.
- **Gestor:** Para acompanhar chamados "Em atendimento" e verificar o histórico de "Concluídos".
- **Funcionário Solicitante:** Para localizar seu chamado pelo ID ou termo-chave.

## User Story
**Como** técnico ou gestor,  
**quero** filtrar os chamados por status e pesquisar por termos no título, descrição ou ID,  
**para que** eu encontre rapidamente chamados específicos sem precisar rolar por toda a lista.

## Dados de entrada
- **Filtro de Status:** Seleção entre `Todos`, `Aberto`, `Em atendimento`, `Concluído`, `Cancelado`.
- **Termo de Busca:** String de texto livre para pesquisa (case-insensitive).

## Regras de negócio
- **RN01:** O filtro por status "Todos" exibe todos os registros sem restrição de estado.
- **RN02:** Ao selecionar um status específico, apenas os chamados correspondentes devem ser exibidos.
- **RN03:** A busca textual deve pesquisar de forma insensível a maiúsculas/minúsculas (*case-insensitive*) nos campos `titulo`, `descricao`, `solicitante` e pelo número exato do `id`.
- **RN04:** Os filtros de status e a busca textual devem operar de forma combinada (interseção lógica `AND`).
- **RN05:** A interface deve exibir um contador dinâmico indicando o número de chamados visíveis vs. o total cadastrado (ex: "Exibindo 3 de 10 chamados").
- **RN06:** Quando nenhum chamado corresponder aos filtros aplicados, deve ser exibida uma mensagem de busca sem resultados com botão para limpar os filtros.

## Comportamento esperado
1. O usuário digita um termo no campo de busca ou seleciona uma opção no seletor/botões de filtro.
2. A listagem é atualizada instantaneamente sem necessidade de recarregar a página.
3. Se nenhum item for encontrado, a mensagem informativa "Nenhum chamado encontrado para os filtros selecionados" é apresentada.
4. Ao clicar em "Limpar filtros", todos os chamados voltam a ser apresentados.

## Validações
- **V01:** Sanitização do termo de busca (remoção de caracteres de injeção e espaços excessivos).
- **V02:** Validação do status selecionado contra as opções aceitas.

## Critérios de aceitação
1. **CA01 — Filtro por status isolado:**  
   Ao selecionar o filtro "Aberto", somente chamados com status "Aberto" devem ser listados.
2. **CA02 — Busca textual:**  
   Ao digitar "impressora", apenas chamados cujo título, descrição ou solicitante contenham a palavra devem permanecer visíveis.
3. **CA03 — Filtro combinado:**  
   Ao selecionar "Em atendimento" e buscar por "rede", apenas chamados que satisfaçam ambos os critérios simultaneamente devem ser exibidos.
4. **CA04 — Limpeza de filtros:**  
   Ao clicar no botão de limpar ou apagar a busca e selecionar "Todos", a lista deve exibir novamente todos os chamados.
5. **CA05 — Estado de nenhum resultado:**  
   Ao filtrar por um termo inexistente (ex: "xyz987"), a interface deve exibir mensagem amigável de zero resultados.

## Casos de exceção
- **CE01 (Termo com espaços vazios):** O sistema ignora espaços adicionais no início e fim da consulta.

## Fora do escopo
- Operadores booleanos avançados (como AND/OR/NOT complexos);
- Busca em expressões regulares (Regex) pelo usuário final.

---

## Sessão de Esclarecimento (Etapa 6 do SDD aplicada à Evolução)
- **Pergunta 1:** A busca e o filtro devem ser feitos no front-end ou no back-end?  
  *Decisão:* No MVP e nesta primeira evolução, a busca e o filtro são executados de forma reativa no front-end sobre o conjunto de dados carregado, proporcionando resposta instantânea ao usuário (*instant search*) sem sobrecarregar o servidor com requisições a cada tecla digitada.
- **Pergunta 2:** A busca deve incluir o ID do chamado?  
  *Decisão:* Sim. Se o usuário digitar "1", chamados com ID 1 ou com o caractere "1" no texto devem ser encontrados, facilitando a busca direta pelo número do protocolo.

---

## Plano de Implementação e Micro-Tarefas (Etapas 7 e 8 do SDD)
- **Tarefa 5.1:** Adicionar barra de pesquisa e grupo de botões/chips de filtro por status no cabeçalho da listagem em `index.html`.
- **Tarefa 5.2:** Estilizar visualmente os filtros ativos com destaque em CSS.
- **Tarefa 5.3:** Desenvolver algoritmo de filtragem combinada em JavaScript (`app.js`).
- **Tarefa 5.4:** Implementar atualização do contador de registros encontrados.
- **Tarefa 5.5:** Implementar componente de feedback para "Nenhum resultado para os filtros aplicados" com botão de reset.
- **Tarefa 5.6:** Realizar testes de aceitação e registrar resultados.

---

## Tabela de Validação de Testes (Etapa 10 do SDD)

| Critério de Aceitação | Dados de Teste | Resultado Esperado | Resultado Obtido | Situação |
|---|---|---|---|---|
| **CA01 — Filtro por status** | Selecionar filtro "Aberto" em lista com 5 chamados variados | Exibir exclusivamente chamados com status "Aberto" | Apenas chamados "Aberto" foram exibidos na tabela | **Aprovado** |
| **CA02 — Busca textual** | Buscar pelo termo "teclado" | Exibir apenas os chamados que citam "teclado" no título ou descrição | Filtro textual refinou a lista corretamente | **Aprovado** |
| **CA03 — Filtro combinado** | Status: "Concluído" + Busca: "Internet" | Exibir apenas chamados "Concluído" que contenham "Internet" | Interseção exata dos dois critérios retornada | **Aprovado** |
| **CA04 — Limpeza de filtros** | Clicar em "Limpar Filtros" | Exibir todos os chamados da base e restaurar contador total | Todos os registros voltaram a ser renderizados | **Aprovado** |
| **CA05 — Nenhum resultado** | Busca: "termo_inexistente_12345" | Exibir mensagem "Nenhum chamado encontrado para os filtros selecionados" | Mensagem de estado vazio de busca exibida | **Aprovado** |

---

## Status
**Concluída**
