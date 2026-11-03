# Sistema de Chamados de Suporte (Help Desk)

> Projeto desenvolvido para a disciplina de **Engenharia de Software (Sistemas de Informação)** aplicando a metodologia **Spec-Driven Development (SDD)**.

---

## 1. Descrição do Sistema
O **Help Desk TI** é uma aplicação Web interna projetada para substituir processos informais de abertura de chamados (e-mails dispersos, mensagens de chat ou pedidos verbais) em uma organização. O sistema centraliza o ciclo de vida dos incidentes, garantindo que nenhuma solicitação seja esquecida e oferecendo total rastreabilidade tanto para os colaboradores quanto para a equipe técnica e gestores.

---

## 2. Objetivo
- Formalizar e organizar a entrada de demandas de suporte em um canal único;
- Permitir o acompanhamento em tempo real da situação de cada chamado através de indicadores visuais de status;
- Assegurar que manutenções e intervenções sejam devidamente registradas com notas técnicas de resolução;
- Demonstrar na prática o fluxo metodológico do **Spec-Driven Development (SDD)**:
  $$\text{Problema} \rightarrow \text{Especificação} \rightarrow \text{Esclarecimento} \rightarrow \text{Planejamento} \rightarrow \text{Tarefas} \rightarrow \text{Implementação} \rightarrow \text{Testes} \rightarrow \text{Validação}$$

---

## 3. Estrutura do Repositório

```text
help-desk/
│
├── project.md                          # Definição do problema, missão, escopo e restrições
├── roadmap.md                          # Roadmap de desenvolvimento incremental (MVP e Evolução)
│
├── features/                           # Especificações formais por funcionalidade
│   ├── 01-criar-chamado.md             # Spec: Abertura e validação de chamado
│   ├── 02-listar-chamados.md           # Spec: Listagem e badges visuais de status
│   ├── 03-consultar-chamado.md         # Spec: Detalhamento integral e histórico
│   ├── 04-atualizar-chamado.md         # Spec: Transição de status e parecer técnico
│   └── 05-filtro-busca-chamados.md     # Spec: Evolução pós-MVP (busca e filtros dinâmicos)
│
├── src/                                # Código-fonte da aplicação
│   ├── server.js                       # Servidor Express com API RESTful
│   ├── repository.js                   # Camada de persistência e regras de negócio
│   ├── data/
│   │   └── chamados.json               # Base de dados estruturada em JSON
│   └── public/                         # Interface Web Frontend
│       ├── index.html                  # Interface gráfica semântica
│       ├── styles.css                  # Folha de estilos moderna e responsiva
│       └── app.js                      # Controladora cliente (Fetch API e reatividade)
│
├── tests/
│   └── test-acceptance.js              # Bateria automatizada de testes de aceitação
│
├── AI-USAGE.md                         # Relato reflexivo sobre o uso de Inteligência Artificial
├── REFLEXAO.md                         # Respostas detalhadas às 9 questões de reflexão do SDD
├── package.json                        # Configuração do ecossistema Node.js
└── README.md                           # Documentação central do projeto
```

---

## 4. Funcionalidades Implementadas

### MVP (Produto Mínimo Viável)
1. **Cadastro de Chamados (`01-criar-chamado`):**
   - Registro de novas ocorrências com nome do solicitante, categoria homologada, título e descrição;
   - Validação defensiva (comprimentos mínimos, categorias aceitas, rejeição de strings com apenas espaços);
   - Injeção obrigatória do status inicial `"Aberto"` e geração automática de protocolo sequencial (`#ID`).

2. **Listagem Consolidada (`02-listar-chamados`):**
   - Visualização organizada em tabela moderna com ordenação cronológica decrescente (mais recentes no topo);
   - Badges coloridos indicativos de status (`Aberto` em amarelo, `Em atendimento` em azul, `Concluído` em verde, `Cancelado` em cinza);
   - Indicadores numéricos resumidos (KPIs no topo do painel).

3. **Consulta Detalhada (`03-consultar-chamado`):**
   - Modal acessível exibindo a descrição integral preservada, metadados e histórico de atendimento técnico;
   - Tratamento adequado para IDs inexistentes (HTTP 404) ou inválidos (HTTP 400).

4. **Atendimento e Atualização de Status (`04-atualizar-chamado`):**
   - Transição controlada de estados operacionais (`Aberto` $\rightarrow$ `Em atendimento` $\rightarrow$ `Concluído` / `Cancelado`);
   - Obrigatoriedade de atribuição de técnico ao assumir o chamado;
   - Obrigatoriedade de parecer técnico / notas de solução ao concluir ou cancelar o chamado;
   - Registro de timestamps automáticos de atualização (`atualizadoEm`) e encerramento (`encerradoEm`).

### Evolução Pós-MVP (Etapa 23 do SDD)
5. **Filtros por Status e Busca Textual Instantânea (`05-filtro-busca-chamados`):**
   - Filtros instantâneos por status com botões interativos (*chips*);
   - Pesquisa textual reativa em tempo real por `#ID`, solicitante, categoria, título ou descrição;
   - Combinação lógica de critérios e tratamento de estados vazios (*empty search*).

---

## 5. Tecnologias Utilizadas

- **Front-end:** HTML5 semântico, CSS3 moderno (Custom Properties, Flexbox, Grid, Modal com efeito *backdrop-filter*, animações CSS), JavaScript ES6+ vanilla com Fetch API nativa.
- **Back-end:** Node.js com Express.js para criação da API RESTful e fornecimento dos arquivos estáticos.
- **Persistência de Dados:** Arquivo estruturado JSON (`src/data/chamados.json`) com leitura e gravação atômica, eliminando dependência de configuração manual de SGBDs externos para avaliação imediata.
- **Testes Automatizados:** Test runner nativo em Node.js (`tests/test-acceptance.js`) executando 28 asserções contra os critérios de aceitação formalizados.

---

## 6. Instruções para Executar o Projeto

### Pré-requisitos
- Node.js instalado (versão 18 ou superior).

### Passo a passo
1. Abra o terminal na raiz do projeto (`help-desk/`);
2. Instale as dependências (caso seja a primeira execução):
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
4. Acesse a aplicação no seu navegador:
   ```text
   http://localhost:3000
   ```

---

## 7. Instruções para Executar os Testes de Aceitação

Para rodar a suíte completa de 28 testes automatizados baseados nos Critérios de Aceitação das especificações:

```bash
npm test
```

A suíte executará as validações de todos os endpoints HTTP, checando regras de negócio, bloqueios de segurança e consistência de dados, gerando um relatório em formato legível no console.

---

## 8. Limitações Conhecidas

- **Autenticação:** Não há tela de login com credenciais individuais no MVP; qualquer usuário pode abrir chamados ou assumir atendimentos (deliberadamente postergado para manter foco no fluxo central de tickets);
- **Anexos:** Não há suporte para upload de fotos ou capturas de tela;
- **Notificações:** Não realiza disparos de e-mail ou mensagens instantâneas;
- **Concorrência extrema:** A persistência em JSON em disco é adequada para MVP/uso interno com volume moderado, mas não substitui um banco relacional (PostgreSQL/MySQL) com controle transacional ACID em alta escala concorrente.

---

## 9. Funcionalidades Futuras (Backlog)

- Módulo de autenticação com separação de perfis (Solicitante vs. Técnico vs. Gestor);
- Upload de imagens e logs anexados ao chamado;
- Notificações automáticas por e-mail quando o status do chamado for alterado;
- Definição de prioridades (Baixa, Média, Alta, Crítica) com SLA e tempo restante regressivo;
- Dashboard com métricas de tempo médio de atendimento (TMA) e resolução (TMR).

---

## 10. Documentos de Apoio Metodológico
- [AI-USAGE.md](file:///z:/help-desk/AI-USAGE.md): Relatório sobre a incorporação e governança do uso de IA durante o projeto.
- [REFLEXAO.md](file:///z:/help-desk/REFLEXAO.md): Respostas analíticas às 9 questões de reflexão sobre Spec-Driven Development.
