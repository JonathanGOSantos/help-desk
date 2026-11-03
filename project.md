# Projeto: Sistema de Chamados (Help Desk)

## Missão
Prover uma plataforma interna centralizada, simples e rastreável para registro, triagem e acompanhamento de incidentes e solicitações de suporte de funcionários em uma empresa, eliminando a perda de chamados e a informalidade no atendimento de TI e manutenção.

## Público-alvo
- **Funcionários solicitantes:** Colaboradores da empresa que necessitam de auxílio de suporte técnico ou manutenção em suas estações de trabalho e sistemas internos.
- **Equipe de suporte/atendimento:** Técnicos e analistas responsáveis por triar, assumir, atualizar o status e registrar as intervenções realizadas.
- **Gestores internos:** Líderes que necessitam de visibilidade transparente sobre as demandas pendentes e o volume de solicitações atendidas.

## Problema
Atualmente, o processo de abertura de chamados na empresa é descentralizado e informal:
- As solicitações são enviadas por e-mails dispersos, conversas de corredor ou mensagens instantâneas;
- Solicitações são frequentemente esquecidas ou sofrem atrasos sem justificativa;
- Não há histórico organizado dos atendimentos anteriores nem base de conhecimento de soluções;
- Não é possível acompanhar facilmente a situação e a fila de atendimento de uma solicitação;
- Gestores encontram grande dificuldade para mensurar o volume de problemas em aberto e a carga de trabalho do suporte.

## Objetivos
- Centralizar o canal de abertura de solicitações em uma interface Web acessível e padronizada;
- Garantir que cada chamado possua identificador único, data de abertura, título, descrição, categoria e status;
- Prover uma visão consolidada de todos os chamados abertos e encerrados com indicadores visuais de status;
- Disponibilizar consulta detalhada contendo todo o histórico e anotações do atendimento;
- Permitir que a equipe de suporte altere o status de forma controlada e registre informações sobre o atendimento realizado;
- Assegurar a rastreabilidade e persistência das informações.

## Funcionalidades principais
1. **Cadastro de chamados:** Formulário intuitivo para abertura de novas solicitações com validação rigorosa dos campos obrigatórios.
2. **Listagem de chamados:** Painel tabular e em cartões exibindo chamados com identificador, solicitante, título, categoria, status e data.
3. **Consulta de chamado:** Tela de detalhes completa exibindo a descrição original, metadados e histórico de atendimento.
4. **Atualização de status e atendimento:** Mecanismo para avançar ou alterar a situação do chamado (Aberto, Em atendimento, Concluído, Cancelado) e registrar notas de resolução/atendimento.
5. **Filtro e busca (Evolução pós-MVP):** Recursos de filtragem rápida por status e busca textual por título ou código do chamado.

## Fora do escopo
Para manter o foco no MVP (Minimum Viable Product) e garantir entrega enxuta e verificável, estão fora do escopo inicial:
- Autenticação com senhas complexas, MFA ou login federado (SSO);
- Controle de acesso granular baseado em papéis (RBAC);
- Upload e armazenamento de anexos (prints, documentos);
- Notificações automáticas por e-mail, SMS ou integração com Microsoft Teams/Slack;
- Acordo de Nível de Serviço (SLA) com cronômetros regressivos automatizados;
- Geração de relatórios analíticos em PDF e dashboards com gráficos complexos;
- Classificação ou resposta automática utilizando modelos de Inteligência Artificial em tempo real.

## Restrições
- **Operacionalidade simples:** O sistema deve executar de maneira imediata no ambiente de desenvolvimento sem dependência de instalação e configuração de servidores de banco de dados externos pesados;
- **Compatibilidade:** Frontend Web executável nos navegadores modernos (Chrome, Firefox, Edge) com design responsivo;
- **Metodologia:** O código-fonte deve ser guiado estritamente pelos requisitos e critérios de aceitação formalizados na documentação (Spec-Driven Development);
- **Verificabilidade:** Todas as regras e critérios de aceitação devem ser passíveis de testes objetivos ("Passou ou não passou").

## Stack tecnológica
### Front-end
- **HTML5 semântico:** Estrutura clara e acessível;
- **CSS3 moderno:** Design limpo com variáveis de design (CSS custom properties), Flexbox, Grid e layout responsivo;
- **JavaScript (ES6+):** Manipulação reativa da interface via Fetch API assíncrona, sem dependência de frameworks front-end pesados para manter a aplicação enxuta e rápida.

### Back-end
- **Node.js (v18+ / v24+):** Ambiente de execução JavaScript rápido e assíncrono;
- **Express.js:** Framework minimalista para criação das rotas RESTful da API e servir a interface estática;
- **Camada de Validação:** Middleware para garantia e validação dos dados de entrada antes da persistência.

### Banco de dados
- **Persistência em JSON estruturado (`src/data/chamados.json`):** Módulo de repositório com operações de leitura e escrita atômica com isolamento e integridade de dados, facilitando a execução imediata em qualquer ambiente corporativo ou laboratório acadêmico sem configurações complexas.

### Outras tecnologias
- **Node.js Built-in Runner / Test Suite (`tests/test-acceptance.js`):** Bateria de testes automatizados executando asserções diretas contra os critérios de aceitação estabelecidos nas especificações;
- **Git:** Controle de versões e histórico de desenvolvimento incremental.
