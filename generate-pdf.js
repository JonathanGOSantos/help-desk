const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUTPUT_PDF = path.join(__dirname, 'Entrega-Atividade-Pratica-SDD.pdf');

const TOTAL_PAGES = 4;

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 20, left: 50, right: 50 },
  autoFirstPage: true
});

let pageCounter = 1;
doc.on('pageAdded', () => {
  pageCounter++;
});

const writeStream = fs.createWriteStream(OUTPUT_PDF);
doc.pipe(writeStream);

// Paleta visual profissional
const PRIMARY = '#1e3a8a';   // Azul marinho institucional
const SECONDARY = '#2563eb'; // Azul royal
const DARK = '#0f172a';      // Slate 900
const MUTED = '#475569';     // Slate 600
const BORDER = '#cbd5e1';    // Slate 300
const GREEN = '#059669';     // Emerald 600

function desenharCabecalhoERodape(numPagina) {
  doc.save();
  // Barra superior
  doc.rect(50, 30, 495, 3).fill(SECONDARY);

  // Rodapé inferior
  doc.rect(50, 785, 495, 0.5).fill(BORDER);
  doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(
    'Engenharia de Software — Spec-Driven Development (SDD) • Sistema de Chamados',
    50,
    792,
    { width: 350, lineBreak: false }
  );
  doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED).text(
    `Página ${numPagina} de ${TOTAL_PAGES}`,
    400,
    792,
    { width: 145, align: 'right', lineBreak: false }
  );
  doc.restore();
}

function secaoTitulo(texto) {
  doc.moveDown(0.5);
  const curY = doc.y;
  doc.rect(50, curY, 495, 17).fill('#e0e7ff');
  doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY).text(texto, 58, curY + 4, { width: 480 });
  doc.y = curY + 22;
}

function subsecaoTitulo(texto) {
  doc.moveDown(0.35);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(SECONDARY).text(texto, 50, doc.y, { width: 495 });
  doc.moveDown(0.15);
}

function paragrafo(texto) {
  doc.font('Helvetica').fontSize(8.7).fillColor(DARK).text(texto, 50, doc.y, {
    width: 495,
    align: 'justify',
    lineGap: 2.2
  });
  doc.moveDown(0.25);
}

function bullet(titulo, desc) {
  doc.font('Helvetica-Bold').fontSize(8.7).fillColor(DARK).text(`• ${titulo}: `, 50, doc.y, {
    width: 495,
    continued: true
  });
  doc.font('Helvetica').fillColor(MUTED).text(desc, {
    width: 495,
    align: 'justify',
    lineGap: 1.8
  });
  doc.moveDown(0.15);
}

// ==========================================
// PÁGINA 1: IDENTIFICAÇÃO E VISÃO GERAL
// ==========================================
doc.y = 45;

doc.font('Helvetica-Bold').fontSize(11).fillColor(MUTED).text('ENGENHARIA DE SOFTWARE — SISTEMAS DE INFORMAÇÃO', 50, doc.y, { align: 'center', width: 495 });
doc.moveDown(0.2);
doc.font('Helvetica-Bold').fontSize(16).fillColor(PRIMARY).text('Atividade Prática: Spec-Driven Development (SDD)', 50, doc.y, { align: 'center', width: 495 });
doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('Desenvolvimento Orientado por Especificações', 50, doc.y, { align: 'center', width: 495 });

doc.moveDown(0.6);
doc.rect(50, doc.y, 495, 1).fill(BORDER);
doc.moveDown(0.6);

// Card de Identificação
const cardY = doc.y;
doc.roundedRect(50, cardY, 495, 88, 6).fillAndStroke('#eff6ff', '#bfdbfe');
doc.font('Helvetica-Bold').fontSize(10.5).fillColor(PRIMARY).text('IDENTIFICAÇÃO DO TRABALHO & ENTREGA', 65, cardY + 10, { width: 460 });

doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text('Aluno: ', 65, cardY + 28, { continued: true });
doc.font('Helvetica').fillColor(DARK).text('Jonathan Santos (Jonathan G. O. Santos)');

doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text('Projeto: ', 65, cardY + 44, { continued: true });
doc.font('Helvetica').fillColor(DARK).text('Sistema de Chamados de Suporte (Help Desk MVP)');

doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text('Repositório GitHub: ', 65, cardY + 60, { continued: true });
doc.font('Helvetica-Bold').fillColor(SECONDARY).text('https://github.com/JonathanGOSantos/help-desk', {
  link: 'https://github.com/JonathanGOSantos/help-desk',
  underline: true
});

doc.y = cardY + 98;

secaoTitulo('1. RESUMO EXECUTIVO E VISÃO DO SISTEMA');
paragrafo('Este projeto implementa o Produto Mínimo Viável (MVP) de um Sistema de Chamados de Suporte (Help Desk), substituindo processos informais de abertura de chamados (e-mails dispersos e conversas de corredor) em uma empresa. O desenvolvimento seguiu estritamente o ciclo metodológico do Spec-Driven Development (SDD): Problema -> Especificação -> Esclarecimento -> Planejamento -> Tarefas -> Implementação -> Testes -> Validação.');

subsecaoTitulo('Arquitetura e Tecnologias Adotadas');
bullet('Back-end', 'Node.js com Express para fornecimento de API RESTful enxuta e robusta.');
bullet('Front-end', 'HTML5 semântico, CSS3 moderno responsivo e JavaScript ES6+ vanilla com Fetch API nativa.');
bullet('Persistência', 'Base estruturada em JSON (src/data/chamados.json) com operações atômicas de leitura e escrita.');
bullet('Testes Automatizados', 'Suíte de 28 testes de aceitação cobrindo 100% dos critérios definidos nas especificações.');

subsecaoTitulo('Funcionalidades Entregues no Repositório');
bullet('01 — Criar Chamado', 'Registro com solicitante, categoria homologada, título e descrição. Status inicial sempre "Aberto".');
bullet('02 — Listar Chamados', 'Visualização tabular em ordem cronológica decrescente com badges de status coloridos e KPIs.');
bullet('03 — Consultar Chamado', 'Modal acessível de detalhes exibindo a descrição integral preservada e metadados de auditoria.');
bullet('04 — Atualizar Atendimento', 'Transições de status e registro de parecer técnico da solução, com timestamps automáticos.');
bullet('05 — Filtro e Busca (Evolução)', 'Pesquisa em tempo real e filtros múltiplos simultâneos por status, cumprindo a Etapa 23 do SDD.');

desenharCabecalhoERodape(1);

// ==========================================
// PÁGINA 2: RELATO SOBRE O USO DE IA
// ==========================================
doc.addPage();
doc.y = 45;

secaoTitulo('2. RELATO SOBRE O USO DE INTELIGÊNCIA ARTIFICIAL (AI-USAGE)');
paragrafo('Em atendimento à Etapa 27 do roteiro, relata-se como ferramentas de IA Generativa foram incorporadas ao processo de engenharia, resguardando o papel do desenvolvedor como autoridade sobre as decisões do projeto.');

subsecaoTitulo('Ferramenta Utilizada e Etapas de Atuação');
paragrafo('Foi utilizado o ambiente Google Antigravity (com o modelo Gemini). A ferramenta atuou como assistente técnico de pair programming nas seguintes fases: revisão inicial de project.md e roadmap.md (Etapa 4); levantamento de ambiguidades e perguntas de esclarecimento (Etapa 6); decomposição de tarefas atômicas (Etapas 7 e 8); sugestão de estruturas de código e rotas REST (Etapa 9); e formulação das asserções da suíte de testes de aceitação (Etapa 10).');

subsecaoTitulo('Sugestões da IA que Foram Rejeitadas (Controle de Engenharia)');
paragrafo('Para assegurar fidelidade aos requisitos de negócio e evitar complexidade desnecessária, diversas propostas da IA foram ativamente rejeitadas:');
bullet('Rejeição de JWT e PostgreSQL no MVP', 'A IA sugeriu autenticação com tokens JWT e banco PostgreSQL com Prisma ORM. Foi rejeitado porque project.md definia autenticação e SGBDs pesados explicitamente fora do escopo inicial.');
bullet('Rejeição de Status Arbitrários', 'A IA sugeriu um endpoint aberto permitindo criar status livres ("Pausado", "Aguardando Peça"). Rejeitado para garantir o fluxo canônico homologado da empresa (Aberto -> Em atendimento -> Concluído / Cancelado).');
bullet('Rejeição de Alteração da Especificação diante de Falha', 'Quando um teste falhou na validação de parecer técnico, a IA propôs relaxar o critério para aprovar o código. A sugestão foi refutada, mantendo o critério e corrigindo o código da validação.');

subsecaoTitulo('Problemas Identificados nas Respostas da IA');
paragrafo('1. Tendência a assumir regras tácitas inexistentes (como inventar prioridades "Alta/Média" quando a especificação ainda não contemplava prioridades);');
paragrafo('2. Validações superficiais de strings (uso de verificações simples que permitiam strings preenchidas exclusivamente por espaços em branco, corrigidas pela exigência de trim());');
paragrafo('3. Confusão inicial entre testes unitários com mocks vazios e testes de aceitação reais que efetuam requisições HTTP fim a fim.');

subsecaoTitulo('Verificação do Código e Responsabilidade Decisória');
paragrafo('Todo o código gerado foi revisado manualmente e verificado pela suíte automatizada de 28 testes de aceitação em tests/test-acceptance.js. Permaneceram sob estrita responsabilidade humana: a delimitação de escopo do MVP, a garantia de imutabilidade do relato do solicitante, as regras de negócio para transição de status e a escolha de uma arquitetura leve e portável.');

desenharCabecalhoERodape(2);

// ==========================================
// PÁGINA 3: QUESTÕES PARA REFLEXÃO (1 a 5)
// ==========================================
doc.addPage();
doc.y = 45;

secaoTitulo('3. RESPOSTAS ÀS QUESTÕES PARA REFLEXÃO (ETAPA 28)');

subsecaoTitulo('Questão 1: Em que momentos a especificação evitou interpretações diferentes sobre o comportamento?');
paragrafo('A especificação evitou divergências cruciais em dois pontos centrais:');
paragrafo('a) Status inicial do chamado (Feature 01): Garantiu que todo chamado recém-criado nasça categoricamente com status "Aberto", impedindo que formulários da interface ou requisições maliciosas injetassem status prematuros como "Em atendimento" ou "Concluído";');
paragrafo('b) Exigência de parecer para conclusão (Feature 04): Definiu que a alteração de status para "Concluído" ou "Cancelado" exige obrigatoriamente o preenchimento de notas técnicas de atendimento com no mínimo 5 caracteres, sanando a dor crônica da empresa de encerramentos sem registro histórico.');

subsecaoTitulo('Questão 2: Quais ambiguidades foram identificadas antes da implementação?');
paragrafo('Na sessão de esclarecimento (Etapa 6), foram sanadas três ambiguidades importantes:');
bullet('Limites de caracteres', 'O requisito dizia apenas "título e descrição". Fixou-se 5 a 100 caracteres para título e 10 a 2000 para descrição, evitando cadastros inúteis como "deu pau";');
bullet('Categorias válidas', 'Homologou-se um conjunto fechado de 5 categorias (Hardware, Software, Rede e Internet, Acesso e Permissões, Outros), evitando termos livres inconsistentes;');
bullet('Strings com apenas espaços', 'Estabeleceu-se o uso de trim() mandatório no cliente e servidor para barrar envios de campos visualmente vazios.');

subsecaoTitulo('Questão 3: Houve alguma situação em que a IA sugeriu uma solução fora da especificação?');
paragrafo('Sim. Ao codificar o endpoint de atualização, a IA propôs um método genérico que permitia ao cliente sobrescrever o texto da descrição original e alterar manualmente os timestamps de auditoria (criadoEm). Essa sugestão foi prontamente descartada porque violava a regra de integridade do relato original do funcionário e o controle estrito de timestamps gerados exclusivamente pelo servidor.');

subsecaoTitulo('Questão 4: O que aconteceu quando uma implementação não passou em um critério de aceitação?');
paragrafo('Durante os testes da Feature 04, o critério CA03 (bloqueio de conclusão sem notas) falhou porque a validação aceitava strings vazias (""). Respeitando a Seção 25 do SDD ("A especificação como fonte de verdade"), não alteramos o critério. A equipe investigou a falha no repositório, ajustou a lógica defensiva para checar o comprimento após trim(), e reexecutou os testes até obter aprovação integral.');

subsecaoTitulo('Questão 5: Qual foi a relação entre requisitos, critérios de aceitação e testes?');
paragrafo('A relação seguiu uma cadeia de rastreabilidade formal e objetiva:');
bullet('Requisito', 'Declaração de negócio em nível qualitativo ("O técnico deve documentar a resolução antes de encerrar o ticket");');
bullet('Critério de Aceitação', 'Condição mensurável e binária ("Ao submeter status Concluído sem notas, a API deve retornar HTTP 400");');
bullet('Teste de Aceitação', 'Tradução executável em código no script tests/test-acceptance.js verificando o status code retornado.');

desenharCabecalhoERodape(3);

// ==========================================
// PÁGINA 4: QUESTÕES 6 a 9 & CONCLUSÃO
// ==========================================
doc.addPage();
doc.y = 45;

subsecaoTitulo('Questão 6: O trabalho de especificação tornou a implementação mais fácil ou mais difícil? Por quê?');
paragrafo('Tornou a implementação significativamente mais fácil e veloz. Embora a fase de especificação e esclarecimento exija esforço e disciplina preliminares, a fase de escrita de código tornou-se mecânica e sem retrabalho. Como as rotas, tipos, códigos HTTP (200, 201, 400, 404) e invariantes estavam pré-definidos, o desenvolvimento fluiu sem hesitação e sem necessidade de refatorações de arquitetura.');

subsecaoTitulo('Questão 7: Quais partes do processo poderiam ser automatizadas com ferramentas de IA?');
bullet('Geração de dados de teste', 'Criação de cenários sintéticos e casos de borda (inputs nulos, caracteres de escape, textos longos);');
bullet('Tradução de critérios em código', 'Conversão automática de critérios de aceitação formalizados em asserções de testes executáveis (scripts HTTP);');
bullet('Esqueletos repetitivos', 'Criação de código boilerplate (rotas REST CRUD, formulários HTML baseados em schemas).');

subsecaoTitulo('Questão 8: Quais decisões ainda precisam necessariamente de participação humana?');
bullet('Escopo e Visão', 'Definição da priorização de escopo e visão do produto (o que entra no MVP e o que fica para o futuro);');
bullet('Regras de Negócio', 'Arbitragem de regras de negócio fundamentais da organização;');
bullet('Ética e Governança', 'Decisão entre manter a especificação ou alterar o código quando ocorrem falhas;');
bullet('Experiência do Usuário', 'Avaliação ergonômica de UX no fluxo real de trabalho dos colaboradores.');

subsecaoTitulo('Questão 9: O que você faria diferente se esse sistema fosse um produto real utilizado por uma empresa?');
paragrafo('1. Autenticação e SSO: Integração com Microsoft Entra ID / Google Workspace para login corporativo;\n' +
          '2. Banco de Dados Relacional Concorrente: Substituição do arquivo JSON por PostgreSQL com migrations e pooling;\n' +
          '3. Mensageria e Notificações: Integração assíncrona (RabbitMQ/Redis) para disparar e-mails e alertas corporativos;\n' +
          '4. Anexos em Nuvem: Upload de fotos de telas e relatórios de erro em object storage (S3/GCS);\n' +
          '5. Gestão de SLAs: Cronômetros regressivos e métricas de tempo médio de atendimento (TMA) e resolução (TMR).');

secaoTitulo('4. RESULTADO DOS TESTES DE ACEITAÇÃO & CONCLUSÃO');

const boxY = doc.y;
doc.rect(50, boxY, 495, 52).fillAndStroke('#f0fdf4', '#bbf7d0');
doc.font('Helvetica-Bold').fontSize(9).fillColor(GREEN).text('SUÍTE DE TESTES (npm test): 28/28 TESTES PASSARAM COM SUCESSO', 60, boxY + 7);
doc.font('Helvetica').fontSize(7.8).fillColor(DARK).text(
  '• Feature 01 (Criar Chamado): 9 critérios validados (CA01 a CA06 + validações de segurança e regras).\n' +
  '• Feature 02 (Listar Chamados): 5 critérios validados (ordenação cronológica decrescente e campos).\n' +
  '• Feature 03 (Consultar Chamado): 5 critérios validados (IDs válidos, inválidos e retorno 404).\n' +
  '• Feature 04 (Atualizar Atendimento): 9 critérios validados (transições de status, timestamps e parecer obrigatório).',
  60,
  boxY + 20,
  { width: 475 }
);

doc.y = boxY + 60;
paragrafo('Conclusão: A prática demonstrou que a abordagem Spec-Driven Development transforma a especificação em um contrato claro e verificável entre a necessidade do usuário e a implementação técnica, conferindo previsibilidade, rastreabilidade e rigor de engenharia ao desenvolvimento de software.');

desenharCabecalhoERodape(4);

doc.end();

writeStream.on('finish', () => {
  console.log('PDF gerado com sucesso! Total de páginas:', pageCounter);
});
