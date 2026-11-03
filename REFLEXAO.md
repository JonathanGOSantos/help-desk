# Questões para Reflexão — Spec-Driven Development (SDD)

Este documento reúne as respostas analíticas para as 9 questões da **Etapa 28 do roteiro da atividade prática**, avaliando a aplicação do desenvolvimento orientado por especificações na construção do Sistema de Chamados de Suporte (Help Desk).

---

### 1. Em que momentos a especificação evitou interpretações diferentes sobre o comportamento do sistema?
A especificação prévia foi decisiva principalmente em dois momentos críticos:
- **Status inicial do chamado:** Sem a especificação explícita na Feature 01 (RN06 e CA06), desenvolvedores ou assistentes de IA poderiam permitir que o formulário de cadastro incluísse um seletor para o usuário escolher o status (ex: alguém abrindo o chamado já como "Urgente" ou "Em atendimento"). A especificação delimitou claramente que o status de abertura é **sempre e exclusivamente "Aberto"**, eliminando ambiguidades entre o desejo do cliente e o fluxo operacional de suporte;
- **Requisitos para fechamento do chamado:** Na Feature 04 (RN03 e CA03), a especificação definiu de forma objetiva que um chamado só pode ter o status alterado para "Concluído" ou "Cancelado" se houver registro de um parecer técnico/notas de atendimento com no mínimo 5 caracteres. Sem essa regra documentada, o sistema poderia aceitar o fechamento do ticket sem nenhuma justificativa, perpetuando o problema da empresa de falta de histórico.

---

### 2. Quais ambiguidades foram identificadas antes da implementação?
Durante a sessão de esclarecimento (Etapa 6), várias lacunas do requisito original foram identificadas e sanadas antes de escrever uma única linha de código:
- **Tamanho dos textos:** O requisito inicial dizia apenas "usuário informa título e descrição". Identificou-se que títulos de 1 ou 2 letras ou descrições vazias ("ajuda") quebravam a utilidade do sistema. Estabeleceu-se o mínimo de 5 caracteres para título e 10 para descrição;
- **Definição das categorias:** O problema da empresa mencionava categorias genéricas. Identificou-se a ambiguidade de o usuário poder digitar qualquer texto como categoria, o que geraria dados inconsistentes na base. Foram fixadas 5 categorias homologadas (`Hardware`, `Software`, `Rede e Internet`, `Acesso e Permissões`, `Outros`);
- **Comportamento diante de strings de espaços:** Identificou-se que entradas compostas apenas por espaços em branco (`"    "`) passavam em validações ingênuas de campos não nulos. Foi estabelecido que o `trim()` é obrigatório em todas as entradas.

---

### 3. Houve alguma situação em que a IA sugeriu uma solução que não estava de acordo com a especificação?
Sim. Durante a geração das rotas no Express, a IA sugeriu permitir um endpoint de atualização genérica que aceitava um payload livre contendo qualquer propriedade do chamado, incluindo a alteração direta do texto original do solicitante e a manipulação manual dos timestamps de auditoria (`criadoEm` e `encerradoEm`).  
Essa sugestão **conflitava diretamente** com a especificação das Features 03 e 04, que determinavam que:
1. O relato original do usuário é imutável após o cadastro para resguardar a integridade da solicitação;
2. Timestamps são geridos de forma restrita pelo servidor no momento da gravação, nunca injetados pelo cliente.  
A sugestão foi rejeitada e a rota foi ajustada para aceitar apenas os campos permitidos no atendimento (`status`, `tecnico`, `notasAtendimento`).

---

### 4. O que aconteceu quando uma implementação não passou em um critério de aceitação?
Durante os testes da Feature 04, a verificação automatizada do critério **CA03 (bloqueio ao tentar concluir sem parecer)** falhou, pois a validação inicial do backend apenas verificava se o campo `notasAtendimento` existia no corpo da requisição, mas aceitava strings vazias (`""`).  
Seguindo o princípio da **Seção 25 do SDD ("A especificação como fonte de verdade")**, a equipe **não flexibilizou o critério de aceitação**. Em vez de afrouxar a regra, foi investigada a causa raiz no código, corrigida a condicional no repositório (`!notasAtendimento || notasAtendimento.trim().length < 5`) e reexecutada a suíte de testes até a obtenção do status **Aprovado**.

---

### 5. Qual foi a relação entre requisitos, critérios de aceitação e testes?
A relação foi direta, hierárquica e rastreável:
- O **Requisito** descreve a intenção de negócio em nível qualitativo (*"O sistema deve registrar a solução antes de fechar o chamado"*);
- O **Critério de Aceitação** transforma essa intenção em uma condição objetiva e mensurável no formato binário (*"Ao enviar PUT com status 'Concluído' e notas vazias, a resposta deve ter código HTTP 400 e mensagem explicativa"*);
- O **Teste** é a tradução em código executável dessa condição (*asserção `assert(res.status === 400)`*).  
Essa cadeia garante que o software não é considerado pronto porque "não deu erro na execução", mas sim porque **comprovadamente atende a todos os critérios previamente formalizados**.

---

### 6. O trabalho de especificação tornou a implementação mais fácil ou mais difícil? Por quê?
**Tornou a implementação sensivelmente mais fácil, fluida e segura.**  
Embora a fase inicial de especificação e esclarecimento exija maior esforço intelectual e disciplina antes de ver o código rodar, o tempo gasto codificando foi drasticamente reduzido. Quando a implementação começou:
- Não havia dúvidas sobre o nome dos campos nem tipos de dados;
- Os status códigos HTTP a retornar em cada cenário já estavam definidos (200, 201, 400, 404);
- Não houve retrabalho estrutural de ter que refazer rotas ou banco por regras esquecidas;
- A equipe sabia exatamente quando a funcionalidade estava "pronta" (quando a tabela de testes fechou em 100% verde).

---

### 7. Quais partes do processo poderiam ser automatizadas com ferramentas de IA?
- **Geração preliminar de cenários de teste de borda:** A IA é muito eficiente em sugerir combinações inesperadas de dados (valores nulos, textos gigantescos, caracteres especiais, tags HTML maliciosas);
- **Tradução de critérios de aceitação em código de teste:** Uma vez redigido o critério de aceitação em formato claro, a IA consegue automatizar quase instantaneamente a escrita dos scripts de teste HTTP;
- **Geração de esqueletos de documentação técnica e UI:** Criação de tabelas Markdown e layouts semânticos baseados na lista de campos da especificação.

---

### 8. Quais decisões ainda precisam necessariamente de participação humana?
- **Priorização de escopo e visão de produto:** Determinar o que é essencial para o MVP e o que deve ser empurrado para pós-MVP (evitando o vício do over-engineering);
- **Definição das regras fundamentais de negócio da empresa:** Por exemplo, decidir se um usuário pode ou não reabrir um chamado fechado ou se o parecer técnico deve ser obrigatório;
- **Arbitragem de conflitos e validação de conformidade:** Decidir se uma falha no teste requer correção de código ou ajuste no requisito de negócio (a IA tende a mudar o requisito para fazer o teste passar sem compreender o impacto organizacional);
- **Sensibilidade de experiência do usuário (UX):** Julgar se o fluxo de atendimento é ergonômico e intuitivo para o técnico no dia a dia real.

---

### 9. O que você faria diferente se esse sistema fosse um produto real utilizado por uma empresa?
Se estivéssemos desenvolvendo um produto real de mercado ou corporativo, adotaríamos as seguintes evoluções arquiteturais e de processo:
1. **Controle de Acesso e Autenticação Robusta:** Integração com Single Sign-On corporativo (Active Directory / OAuth2 / SAML) para que os funcionários não precisem digitar seus nomes manualmente;
2. **Banco de Dados Relacional Concorrente com Migrations:** Substituir a persistência em arquivo JSON por um SGBD transacional (PostgreSQL) gerenciado via pool de conexões e migrations automatizadas (Prisma ou Flyway), garantindo consistência sob concorrência intensa de milhares de funcionários simultâneos;
3. **Módulo de Notificações Assíncronas:** Uso de mensageria (RabbitMQ ou Redis) para disparo de e-mails transacionais e notificações no canal de suporte do Microsoft Teams ou Slack;
4. **Anexos em Armazenamento em Nuvem (Object Storage):** Integração com AWS S3 ou Google Cloud Storage para permitir que colaboradores enviem capturas de tela e arquivos de log;
5. **Métricas de SLA e Auditoria Detalhada:** Implementação de cronômetros regressivos vinculados a tabelas de SLA de acordo com a severidade do incidente e logs de auditoria imutáveis (*audit trail*).
