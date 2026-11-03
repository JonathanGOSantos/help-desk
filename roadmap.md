# Roadmap do Projeto

Este roadmap representa a visão geral da evolução iterativa e incremental do Sistema de Chamados (Help Desk), organizada de acordo com os princípios de *Spec-Driven Development* (SDD).

---

## MVP (Produto Mínimo Viável)

### Fase 1 — Estrutura inicial
- [x] Definir a missão, público-alvo e escopo do projeto (`project.md`)
- [x] Estruturar os diretórios do projeto (`src/`, `features/`, `tests/`)
- [x] Configurar ambiente Node.js e gerenciamento de dependências (`package.json`)
- [x] Configurar servidor HTTP base e servir ativos estáticos
- [x] Desenvolver layout base responsivo com cabeçalho, barra de navegação e container principal

### Fase 2 — Cadastro de chamados (Feature 01)
- [x] Especificar funcionalidade em `features/01-criar-chamado.md`
- [x] Realizar sessão de esclarecimento e refinar critérios de aceitação
- [x] Elaborar plano de implementação em micro-tarefas
- [x] Criar formulário Web para cadastro com campos (Solicitante, Título, Categoria, Descrição)
- [x] Implementar validação de campos obrigatórios (frontend e backend)
- [x] Implementar endpoint REST `POST /api/chamados`
- [x] Persistir chamados com identificador autoincrementado, data de criação e status inicial "Aberto"
- [x] Apresentar feedback visual de sucesso ou mensagens claras de erro
- [x] Executar testes de aceitação e preencher tabela de validação

### Fase 3 — Consulta e Listagem (Features 02 e 03)
- [x] Especificar listagem em `features/02-listar-chamados.md` e consulta em `features/03-consultar-chamado.md`
- [x] Realizar sessões de esclarecimento de requisitos
- [x] Elaborar plano de tarefas e testes
- [x] Implementar endpoint REST `GET /api/chamados` (listagem ordenada)
- [x] Construir visualização em tabela e cartões informativos com badges coloridos por status
- [x] Implementar endpoint REST `GET /api/chamados/:id` para consulta detalhada
- [x] Construir modal/painel de detalhes completos (histórico, descrição, datas e parecer técnico)
- [x] Tratar cenário de chamado não encontrado (404)
- [x] Executar testes de aceitação e validar critérios

### Fase 4 — Atendimento e Atualização de Status (Feature 04)
- [x] Especificar funcionalidade em `features/04-atualizar-chamado.md`
- [x] Conduzir esclarecimento das transições de status válidas e regras de negócio
- [x] Elaborar plano de implementação
- [x] Implementar endpoint REST `PATCH /api/chamados/:id/status` ou `PUT /api/chamados/:id`
- [x] Implementar controle e validação de fluxo de status ("Aberto" -> "Em atendimento" -> "Concluído" / "Cancelado")
- [x] Implementar registro de notas de atendimento e técnico responsável
- [x] Atualizar timestamps de modificação (`atualizadoEm`) e encerramento (`encerradoEm`)
- [x] Executar testes de aceitação e validar critérios

---

## Evolução Pós-MVP (Etapa 23 do SDD)

### Fase 5 — Filtro e Busca Avançada (Feature 05)
- [x] Especificar funcionalidade em `features/05-filtro-busca-chamados.md`
- [x] Esclarecer critérios para múltiplos filtros combinados (status + busca textual)
- [x] Implementar filtros dinâmicos na interface por status (Todos, Aberto, Em atendimento, Concluído, Cancelado)
- [x] Implementar barra de pesquisa em tempo real por termo no título, descrição ou ID
- [x] Implementar indicador de contagem de registros filtrados vs. total de chamados
- [x] Executar testes de aceitação da funcionalidade evolutiva

---

## Próximos Passos (Backlog Futuro)
- [ ] **Autenticação e Perfis:** Login seguro diferenciando Solicitante e Técnico de Suporte
- [ ] **Anexos:** Upload de capturas de tela e arquivos de log
- [ ] **Notificações:** Envio de alertas por e-mail ou webhook na alteração de status
- [ ] **Prioridades e SLA:** Definição de prioridade (Baixa, Média, Alta, Crítica) com tempo limite de atendimento
- [ ] **Dashboard Gerencial:** Gráficos com tempo médio de resolução e volume por categoria
