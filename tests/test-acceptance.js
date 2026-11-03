/**
 * Bateria de Testes Automatizados de Aceitação (Spec-Driven Development)
 * Verifica cada Critério de Aceitação (CA) formalizado nas especificações.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Garante isolamento para testes: salva backup do banco e restaura no final
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'chamados.json');
let backupDados = null;

if (fs.existsSync(DATA_FILE)) {
  backupDados = fs.readFileSync(DATA_FILE, 'utf-8');
}

process.env.NODE_ENV = 'test';
const app = require('../src/server');

let server;
let baseUrl = '';

// Helper para fazer requisições HTTP locais
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Suite de Execução
async function executarTestes() {
  console.log('================================================================');
  console.log('🧪 INICIANDO TESTES DE ACEITAÇÃO BASEADOS EM ESPECIFICAÇÕES (SDD)');
  console.log('================================================================\n');

  let totalTestes = 0;
  let sucessos = 0;
  let falhas = 0;

  function asserir(descricao, condicao) {
    totalTestes++;
    if (condicao) {
      sucessos++;
      console.log(`  ✅ [PASSOU] ${descricao}`);
    } else {
      falhas++;
      console.log(`  ❌ [FALHOU] ${descricao}`);
    }
  }

  try {
    // Sobe servidor em porta dinâmica
    server = app.listen(0);
    const porta = server.address().port;
    baseUrl = `http://127.0.0.1:${porta}`;

    // -------------------------------------------------------------
    // FEATURE 01: CRIAR CHAMADO
    // -------------------------------------------------------------
    console.log('📌 Testando Feature 01 — Criar Chamado (01-criar-chamado.md):');

    // CA01: Cadastro válido
    const resCA01 = await request('POST', '/api/chamados', {
      solicitante: 'Eduardo Pereira',
      titulo: 'Mouse óptico parou de responder',
      categoria: 'Hardware',
      descricao: 'O cursor travou e o laser inferior do mouse não acende mais.'
    });
    asserir('CA01: Criar chamado com dados válidos retorna HTTP 201', resCA01.status === 201);
    asserir('CA01: Chamado criado possui ID numérico gerado', typeof resCA01.body.chamado.id === 'number');
    asserir('CA01: Chamado criado nasce com status "Aberto"', resCA01.body.chamado.status === 'Aberto');
    asserir('CA01: Timestamp de criação preenchido', !!resCA01.body.chamado.criadoEm);

    const idCriado = resCA01.body.chamado.id;

    // CA02: Bloqueio por título inválido
    const resCA02 = await request('POST', '/api/chamados', {
      solicitante: 'Eduardo Pereira',
      titulo: 'Erro', // Menos de 5 caracteres
      categoria: 'Hardware',
      descricao: 'Descrição com mais de dez caracteres.'
    });
    asserir('CA02: Bloqueia cadastro com título < 5 caracteres (HTTP 400)', resCA02.status === 400);

    // CA03: Bloqueio por descrição curta
    const resCA03 = await request('POST', '/api/chamados', {
      solicitante: 'Eduardo Pereira',
      titulo: 'Falha geral',
      categoria: 'Hardware',
      descricao: 'curta' // Menos de 10 caracteres
    });
    asserir('CA03: Bloqueia cadastro com descrição < 10 caracteres (HTTP 400)', resCA03.status === 400);

    // CA04: Bloqueio por solicitante ausente
    const resCA04 = await request('POST', '/api/chamados', {
      solicitante: '   ',
      titulo: 'Monitor apagado',
      categoria: 'Hardware',
      descricao: 'Descrição detalhada do problema que ocorreu.'
    });
    asserir('CA04: Bloqueia cadastro com solicitante vazio ou espaços (HTTP 400)', resCA04.status === 400);

    // CA05: Categoria inválida
    const resCA05 = await request('POST', '/api/chamados', {
      solicitante: 'Eduardo Pereira',
      titulo: 'Monitor apagado',
      categoria: 'CategoriaInexistente',
      descricao: 'Descrição detalhada do problema que ocorreu.'
    });
    asserir('CA05: Bloqueia cadastro com categoria inválida (HTTP 400)', resCA05.status === 400);

    // CA06: Status inicial forçado (inviolabilidade da regra de negócio)
    const resCA06 = await request('POST', '/api/chamados', {
      solicitante: 'Eduardo Pereira',
      titulo: 'Teclado com tecla presa',
      categoria: 'Hardware',
      descricao: 'A tecla espaço não retorna quando pressionada.',
      status: 'Concluído' // Tentativa de forçar status na criação
    });
    asserir('CA06: Novo chamado categoricamente nasce como "Aberto", ignorando payload arbitrário', resCA06.body.chamado.status === 'Aberto');

    // -------------------------------------------------------------
    // FEATURE 02: LISTAR CHAMADOS
    // -------------------------------------------------------------
    console.log('\n📌 Testando Feature 02 — Listar Chamados (02-listar-chamados.md):');

    const resListar = await request('GET', '/api/chamados');
    asserir('CA01: Rota GET /api/chamados responde com HTTP 200', resListar.status === 200);
    asserir('CA01: Retorna lista de chamados em formato de array', Array.isArray(resListar.body));
    asserir('CA01: Lista contém os chamados previamente persistidos', resListar.body.length > 0);

    // CA02: Ordenação decrescente por data
    let ordenacaoCorreta = true;
    for (let i = 0; i < resListar.body.length - 1; i++) {
      const dataA = new Date(resListar.body[i].criadoEm).getTime();
      const dataB = new Date(resListar.body[i + 1].criadoEm).getTime();
      if (dataA < dataB) {
        ordenacaoCorreta = false;
        break;
      }
    }
    asserir('CA02: Chamados estão ordenados por data decrescente (mais recentes no topo)', ordenacaoCorreta);

    // CA03: Todos os campos presentes
    const primeiro = resListar.body[0];
    const possuiCamposObrigatorios = primeiro.id && primeiro.solicitante && primeiro.titulo && primeiro.categoria && primeiro.status && primeiro.criadoEm;
    asserir('CA03: Todos os campos obrigatórios estão presentes nos itens listados', !!possuiCamposObrigatorios);

    // -------------------------------------------------------------
    // FEATURE 03: CONSULTAR DETALHES DO CHAMADO
    // -------------------------------------------------------------
    console.log('\n📌 Testando Feature 03 — Consultar Chamado (03-consultar-chamado.md):');

    const resConsultar = await request('GET', `/api/chamados/${idCriado}`);
    asserir('CA01: Consulta de chamado com ID existente retorna HTTP 200', resConsultar.status === 200);
    asserir('CA01: Retorna o chamado correspondente com dados corretos', resConsultar.body.id === idCriado);
    asserir('CA02: Descrição completa preservada sem truncamento', resConsultar.body.descricao.length >= 10);

    // CA03: ID inexistente
    const resInexistente = await request('GET', '/api/chamados/999999');
    asserir('CA03: ID inexistente retorna HTTP 404 (Not Found)', resInexistente.status === 404);

    // CA04: ID com formato inválido
    const resInvalido = await request('GET', '/api/chamados/abc-invalido');
    asserir('CA04: ID não numérico retorna HTTP 400 (Bad Request)', resInvalido.status === 400);

    // -------------------------------------------------------------
    // FEATURE 04: ATUALIZAR STATUS E ATENDIMENTO
    // -------------------------------------------------------------
    console.log('\n📌 Testando Feature 04 — Atualizar Status e Atendimento (04-atualizar-chamado.md):');

    // CA01: Atualizar para 'Em atendimento'
    const resAtendimento = await request('PUT', `/api/chamados/${idCriado}/atendimento`, {
      status: 'Em atendimento',
      tecnico: 'Guilherme Santos'
    });
    asserir('CA01: Atualizar para "Em atendimento" com técnico retorna HTTP 200', resAtendimento.status === 200);
    asserir('CA01: Status atualizado para "Em atendimento"', resAtendimento.body.chamado.status === 'Em atendimento');
    asserir('CA01: Timestamp atualizadoEm preenchido', !!resAtendimento.body.chamado.atualizadoEm);

    // CA03: Bloqueio ao tentar concluir sem notas de atendimento
    const resConcluirSemNotas = await request('PUT', `/api/chamados/${idCriado}/atendimento`, {
      status: 'Concluído',
      tecnico: 'Guilherme Santos',
      notasAtendimento: '' // Vazio
    });
    asserir('CA03: Bloqueia conclusão sem notas de atendimento (HTTP 400)', resConcluirSemNotas.status === 400);

    // CA02: Concluir chamado com sucesso
    const resConcluirValido = await request('PUT', `/api/chamados/${idCriado}/atendimento`, {
      status: 'Concluído',
      tecnico: 'Guilherme Santos',
      notasAtendimento: 'Substituição do cabo USB realizada com sucesso. Funcionamento normalizado.'
    });
    asserir('CA02: Concluir com notas e técnico retorna HTTP 200', resConcluirValido.status === 200);
    asserir('CA02: Status atualizado para "Concluído"', resConcluirValido.body.chamado.status === 'Concluído');
    asserir('CA02: Timestamp encerradoEm preenchido', !!resConcluirValido.body.chamado.encerradoEm);

    // CA04: Bloqueio por status inválido
    const resStatusInvalido = await request('PUT', `/api/chamados/${idCriado}/atendimento`, {
      status: 'StatusDesconhecido',
      tecnico: 'Guilherme'
    });
    asserir('CA04: Status não homologado retorna HTTP 400', resStatusInvalido.status === 400);

    // CA05: Atualização de chamado inexistente
    const resAtualizarInexistente = await request('PUT', '/api/chamados/999999/atendimento', {
      status: 'Concluído',
      tecnico: 'Guilherme',
      notasAtendimento: 'Chamado fantasma'
    });
    asserir('CA05: Atualizar chamado inexistente retorna HTTP 404', resAtualizarInexistente.status === 404);

    // -------------------------------------------------------------
    // RESUMO FINAL
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`📊 RESULTADO DOS TESTES: ${sucessos}/${totalTestes} PASSARAM`);
    if (falhas === 0) {
      console.log('🎉 TODOS OS CRITÉRIOS DE ACEITAÇÃO FORAM ATENDIDOS COM SUCESSO!');
    } else {
      console.log(`⚠️ ${falhas} TESTE(S) FALHARAM. REVISAR ESPECIFICAÇÕES.`);
    }
    console.log('================================================================\n');

  } catch (erroGlobal) {
    console.error('Erro fatal durante os testes:', erroGlobal);
    falhas++;
  } finally {
    if (server) {
      server.close();
    }
    // Restaura backup dos dados se existia
    if (backupDados !== null) {
      fs.writeFileSync(DATA_FILE, backupDados, 'utf-8');
    }
    process.exit(falhas > 0 ? 1 : 0);
  }
}

executarTestes();
