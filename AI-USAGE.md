# Relato sobre o Uso de Inteligência Artificial no Projeto

Este documento atende às diretrizes da **Etapa 27 do roteiro de Spec-Driven Development (SDD)**, descrevendo criticamente como as ferramentas de Inteligência Artificial Generativa foram incorporadas ao processo de engenharia de software do Sistema de Chamados (Help Desk).

---

## 1. Qual ferramenta de IA foi utilizada?
- **Ferramenta Principal:** Google Antigravity (ambiente com modelo avançado Gemini).
- **Papel desempenhado:** Assistente técnico de pair programming, apoio na identificação de ambiguidades em requisitos, geração inicial de esqueletos de documentação e código, e auxílio na formulação de asserções de teste.

---

## 2. Em quais etapas ela foi utilizada?
A ferramenta foi utilizada em diversas etapas do ciclo de desenvolvimento, mantendo a especificação como fonte primária da verdade:
1. **Etapa 4 (Revisão da Definição do Projeto):** Análise crítica dos arquivos `project.md` e `roadmap.md` para identificar requisitos implícitos, ambiguidades e escopo desnecessário no MVP;
2. **Etapa 6 (Sessão de Esclarecimento das Features):** Identificação de casos de borda, indefinições de tamanho de campos e transições de status;
3. **Etapas 7 e 8 (Planejamento e Decomposição em Tarefas):** Sugestão de divisões lógicas das tarefas de implementação;
4. **Etapa 9 (Implementação):** Apoio na geração das rotas RESTful no Express, manipulação de arquivos JSON e componentes da interface gráfica;
5. **Etapa 10 (Testes e Validação):** Auxílio na construção do script automatizado de testes de aceitação (`test-acceptance.js`).

---

## 3. Exemplos de tarefas realizadas com auxílio da IA

- **Elaboração de Casos de Borda:** Durante a especificação de `01-criar-chamado.md`, a IA sugeriu tratar o envio de entradas contendo apenas espaços em branco (`"   "`), o que levou à regra explícita de `trim()` obrigatório antes da contagem de caracteres;
- **Decomposição em Micro-tarefas:** Na Feature 04, a IA auxiliou a desdobrar a atualização de status em pequenas etapas verificáveis: validação dos dados de entrada, verificação de existência do chamado, atualização dos timestamps (`atualizadoEm` e `encerradoEm`), e resposta HTTP correspondente;
- **Construção do Runner de Testes:** Criação do script nativo em Node.js com o módulo `http`, permitindo rodar 28 asserções sem necessidade de frameworks pesados externos como Jest ou Mocha;
- **Design de Interface Responsiva:** Apoio na estruturação do CSS moderno utilizando variáveis nativas, layout Flexbox/Grid e modal de consulta com acessibilidade para teclado (tecla ESC).

---

## 4. Quais sugestões da IA foram rejeitadas?

Ao longo das sessões de esclarecimento e implementação, várias propostas da IA foram rejeitadas pela equipe humana para preservar a simplicidade e a aderência à especificação:

1. **Rejeição de Autenticação JWT e Banco de Dados Relacional no MVP:**  
   Em uma das interações iniciais, a IA sugeriu utilizar Prisma ORM com PostgreSQL e autenticação com JWT e refresh tokens. A sugestão foi **prontamente rejeitada** porque o documento de requisitos do projeto (`project.md`) definia expressamente que autenticação e SGBDs pesados estavam fora do escopo do primeiro MVP. Aceitar essa sugestão violaria a regra de "começar pequeno" e adicionaria dependências desnecessárias para demonstrar o conceito central.

2. **Rejeição de Status Customizáveis Arbitrários:**  
   A IA sugeriu criar um endpoint onde o usuário pudesse cadastrar novos status de chamado dinamicamente (ex: "Aguardando Peça", "Pausado"). A equipe rejeitou a sugestão porque as regras de negócio exigem um fluxo canônico e previsível (`Aberto` $\rightarrow$ `Em atendimento` $\rightarrow$ `Concluído` ou `Cancelado`).

3. **Rejeição de Alteração da Especificação para Acomodar Código:**  
   Ao testar a criação de chamados, a IA sugeriu inicialmente permitir que chamados fossem concluídos sem notas técnicas se o técnico estivesse preenchido. Isso contradizia o critério de aceitação previamente aprovado (CA03 da Feature 04). A equipe **não alterou a especificação**; em vez disso, corrigiu a validação no código do backend para manter a fidelidade ao requisito acordado.

---

## 5. Quais problemas foram encontrados nas respostas da IA?

- **Tendência a assumir premissas não especificadas:** Em mais de uma oportunidade, a IA gerou código assumindo valores padrão que não constavam nas regras de negócio (por exemplo, assumindo que a prioridade "Média" deveria existir, quando o conceito de prioridade ainda nem havia sido incluído no escopo do MVP);
- **Tratamento frouxo de validações de strings vazias:** Inicialmente, a IA utilizava verificações simples como `if (!titulo)`, que falhavam em detectar títulos compostos apenas por múltiplos espaços em branco (`"    "`). Foi necessário intervir e exigir o uso explícito de `trim()`;
- **Confusão entre testes unitários e testes de aceitação:** A IA tentou inicialmente gerar testes com mocks excessivos, que apenas testavam se funções eram chamadas. A equipe redirecionou o foco para **testes de aceitação reais**, que disparam requisições HTTP e verificam respostas reais do servidor (status code, payloads e efeitos de persistência).

---

## 6. Como você verificou o código produzido?

A verificação do código ocorreu por meio de três camadas rigorosas:
1. **Revisão Manual do Código:** Cada linha de código gerada foi inspecionada para verificar clareza, legibilidade, integridade e ausência de complexidade desnecessária;
2. **Execução da Suíte Automatizada de Aceitação:** O script `tests/test-acceptance.js` executou 28 asserções contra todas as rotas da API, testando tanto o "caminho feliz" quanto tentativas de envio de dados inválidos (título curto, status inexistente, encerramento sem parecer, ID inválido);
3. **Teste Exploratório na Interface Web:** O sistema foi executado no navegador (`http://localhost:3000`), onde foram realizados testes manuais de usabilidade: cadastro de novos chamados, busca em tempo real, filtros por status, abertura do modal de detalhes e transições de status.

---

## 7. Quais decisões permaneceram sob responsabilidade da equipe?

Em estrito alinhamento com a diretriz de que **"a IA não deve ser tratada como autoridade sobre o projeto"**:
- **Definição dos Limites de Escopo:** O que pertence ao MVP e o que fica para evolução pós-MVP;
- **Regras de Negócio e Invariantes:** A regra inviolável de que todo chamado nasce categoricamente como "Aberto" e que a conclusão exige parecer técnico;
- **Seleção da Stack Tecnológica:** A escolha consciente por uma solução enxuta em Node.js com Express e persistência em JSON em disco, garantindo portabilidade imediata em qualquer ambiente de laboratório ou avaliação acadêmica;
- **Aprovação Final das Especificações:** Apenas a equipe humana validou se cada critério de aceitação atendia à dor de negócio descrita no cenário da empresa.
