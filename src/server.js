const express = require('express');
const path = require('path');
const repository = require('./repository');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// ROTAS DA API RESTful (Baseadas nas Specs)
// ==========================================

// 02 — Listar chamados (Fase 3)
app.get('/api/chamados', (req, res, next) => {
  try {
    const chamados = repository.listarTodos();
    res.status(200).json(chamados);
  } catch (err) {
    next(err);
  }
});

// 03 — Consultar detalhes do chamado (Fase 3)
app.get('/api/chamados/:id', (req, res, next) => {
  try {
    const chamado = repository.buscarPorId(req.params.id);
    if (!chamado) {
      return res.status(404).json({
        erro: 'Chamado não encontrado',
        mensagem: `Não existe chamado cadastrado com o identificador #${req.params.id}.`
      });
    }
    res.status(200).json(chamado);
  } catch (err) {
    next(err);
  }
});

// 01 — Criar chamado (Fase 2)
app.post('/api/chamados', (req, res, next) => {
  try {
    const novoChamado = repository.criar(req.body);
    res.status(201).json({
      mensagem: 'Chamado criado com sucesso.',
      chamado: novoChamado
    });
  } catch (err) {
    next(err);
  }
});

// 04 — Atualizar status e informações do atendimento (Fase 4)
const tratarAtualizacaoAtendimento = (req, res, next) => {
  try {
    const chamadoAtualizado = repository.atualizarAtendimento(req.params.id, req.body);
    res.status(200).json({
      mensagem: 'Atendimento do chamado atualizado com sucesso.',
      chamado: chamadoAtualizado
    });
  } catch (err) {
    next(err);
  }
};

app.put('/api/chamados/:id/atendimento', tratarAtualizacaoAtendimento);
app.patch('/api/chamados/:id/atendimento', tratarAtualizacaoAtendimento);

// Middleware centralizado de tratamento de erros
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Erro interno no servidor.';
  if (status >= 500) {
    console.error('Erro de servidor:', err);
  }
  res.status(status).json({
    erro: message,
    status
  });
});

// Exporta app para testes automatizados
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Sistema de Chamados (Help Desk) em execução!`);
    console.log(`📡 URL Local: http://localhost:${PORT}`);
    console.log(`📋 Metodologia: Spec-Driven Development (SDD)`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
