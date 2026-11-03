const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'chamados.json');

const CATEGORIAS_VALIDAS = [
  'Hardware',
  'Software',
  'Rede e Internet',
  'Acesso e Permissões',
  'Outros'
];

const STATUS_VALIDOS = [
  'Aberto',
  'Em atendimento',
  'Concluído',
  'Cancelado'
];

// Garante existência da pasta e do arquivo
function garantirArquivo() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Lê chamados do arquivo
function lerChamados() {
  garantirArquivo();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Erro ao ler base de dados JSON:', err);
    return [];
  }
}

// Salva chamados no arquivo
function salvarChamados(chamados) {
  garantirArquivo();
  fs.writeFileSync(DATA_FILE, JSON.stringify(chamados, null, 2), 'utf-8');
}

// 02 — Listar todos os chamados (ordenados por criadoEm decrescente)
function listarTodos() {
  const chamados = lerChamados();
  return chamados.slice().sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}

// 03 — Consultar detalhes por ID
function buscarPorId(id) {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    throw { status: 400, message: 'ID inválido. Deve ser um número inteiro positivo.' };
  }
  const chamados = lerChamados();
  return chamados.find((c) => c.id === numId) || null;
}

// 01 — Criar novo chamado com validações de especificação
function criar(dados) {
  const solicitante = (dados.solicitante || '').trim();
  const titulo = (dados.titulo || '').trim();
  const categoria = (dados.categoria || '').trim();
  const descricao = (dados.descricao || '').trim();

  // Validação: Solicitante
  if (!solicitante || solicitante.length < 3 || solicitante.length > 100) {
    throw {
      status: 400,
      message: 'O campo solicitante é obrigatório e deve ter entre 3 e 100 caracteres.'
    };
  }

  // Validação: Título
  if (!titulo || titulo.length < 5 || titulo.length > 100) {
    throw {
      status: 400,
      message: 'O título é obrigatório e deve possuir entre 5 e 100 caracteres.'
    };
  }

  // Validação: Categoria
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    throw {
      status: 400,
      message: `Categoria inválida. Categorias aceitas: ${CATEGORIAS_VALIDAS.join(', ')}.`
    };
  }

  // Validação: Descrição
  if (!descricao || descricao.length < 10 || descricao.length > 2000) {
    throw {
      status: 400,
      message: 'A descrição é obrigatória e deve possuir entre 10 e 2000 caracteres.'
    };
  }

  const chamados = lerChamados();
  const maxId = chamados.reduce((max, c) => (c.id > max ? c.id : max), 0);
  const novoId = maxId + 1;

  const novoChamado = {
    id: novoId,
    solicitante,
    titulo,
    categoria,
    descricao,
    status: 'Aberto', // RN06: Todo chamado recém-criado nasce categoricamente como "Aberto"
    criadoEm: new Date().toISOString(),
    atualizadoEm: null,
    encerradoEm: null,
    tecnico: null,
    notasAtendimento: null
  };

  chamados.push(novoChamado);
  salvarChamados(chamados);

  return novoChamado;
}

// 04 — Atualizar status e registrar informações de atendimento
function atualizarAtendimento(id, dados) {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    throw { status: 400, message: 'ID inválido. Deve ser um número inteiro positivo.' };
  }

  const status = (dados.status || '').trim();
  const tecnico = dados.tecnico ? dados.tecnico.trim() : null;
  const notasAtendimento = dados.notasAtendimento ? dados.notasAtendimento.trim() : null;

  // Validação: Status permitido
  if (!STATUS_VALIDOS.includes(status)) {
    throw {
      status: 400,
      message: `Status inválido. Status permitidos: ${STATUS_VALIDOS.join(', ')}.`
    };
  }

  // Validação: Técnico obrigatório para status diferente de "Aberto"
  if (status !== 'Aberto' && (!tecnico || tecnico.length < 3)) {
    throw {
      status: 400,
      message: 'O nome do técnico responsável é obrigatório e deve ter no mínimo 3 caracteres para atendimentos em andamento ou finalizados.'
    };
  }

  // Validação: Notas de atendimento obrigatórias para "Concluído" ou "Cancelado"
  if ((status === 'Concluído' || status === 'Cancelado') && (!notasAtendimento || notasAtendimento.length < 5)) {
    throw {
      status: 400,
      message: 'Notas de atendimento com no mínimo 5 caracteres são obrigatórias para concluir ou cancelar o chamado.'
    };
  }

  const chamados = lerChamados();
  const index = chamados.findIndex((c) => c.id === numId);

  if (index === -1) {
    throw { status: 404, message: 'Chamado não encontrado.' };
  }

  const chamado = chamados[index];
  const agora = new Date().toISOString();

  chamado.status = status;
  chamado.atualizadoEm = agora;

  if (tecnico) {
    chamado.tecnico = tecnico;
  }

  if (notasAtendimento) {
    chamado.notasAtendimento = notasAtendimento;
  }

  if (status === 'Concluído' || status === 'Cancelado') {
    chamado.encerradoEm = agora;
  } else {
    chamado.encerradoEm = null;
  }

  chamados[index] = chamado;
  salvarChamados(chamados);

  return chamado;
}

module.exports = {
  CATEGORIAS_VALIDAS,
  STATUS_VALIDOS,
  listarTodos,
  buscarPorId,
  criar,
  atualizarAtendimento,
  salvarChamados,
  lerChamados
};
