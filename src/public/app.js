/**
 * Help Desk TI — Aplicação Frontend (Spec-Driven Development)
 * Controla a renderização de chamados, filtros dinâmicos, modais e integração com a API REST.
 */

// Estado global da aplicação
let todosChamados = [];
let filtroStatusAtivo = 'Todos';
let termoBuscaAtivo = '';

// ==========================================
// INICIALIZAÇÃO E CICLO DE VIDA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  carregarChamados();
  configurarContadorCaracteres();
  configurarAtalhosTeclado();
});

// Configura contador de caracteres para o campo de descrição
function configurarContadorCaracteres() {
  const descricaoInput = document.getElementById('descricao');
  const contador = document.getElementById('char-counter');
  if (descricaoInput && contador) {
    descricaoInput.addEventListener('input', () => {
      const len = descricaoInput.value.length;
      contador.textContent = `${len} / 2000`;
      if (len < 10) {
        contador.style.color = '#ef4444';
      } else {
        contador.style.color = '#94a3b8';
      }
    });
  }
}

// Suporte à tecla ESC para fechar modal
function configurarAtalhosTeclado() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fecharModal();
    }
  });
}

// ==========================================
// NAVEGAÇÃO ENTRE ABAS
// ==========================================
function alternarAba(aba) {
  const secaoLista = document.getElementById('secao-lista-chamados');
  const secaoNovo = document.getElementById('secao-novo-chamado');
  const btnTabLista = document.getElementById('btn-tab-lista');
  const btnTabNovo = document.getElementById('btn-tab-novo');

  if (aba === 'novo') {
    secaoLista.style.display = 'none';
    secaoNovo.style.display = 'block';
    btnTabLista.classList.remove('active');
    btnTabNovo.classList.add('active');
    document.getElementById('solicitante').focus();
  } else {
    secaoNovo.style.display = 'none';
    secaoLista.style.display = 'block';
    btnTabNovo.classList.remove('active');
    btnTabLista.classList.add('active');
  }
}

// ==========================================
// COMUNICAÇÃO COM API (REST Fetch)
// ==========================================

// 02 — Carregar lista de chamados
async function carregarChamados() {
  const contadorElem = document.getElementById('contador-listagem');
  if (contadorElem) contadorElem.textContent = 'Carregando...';

  try {
    const resposta = await fetch('/api/chamados');
    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status}: Falha ao buscar lista de chamados.`);
    }

    todosChamados = await resposta.json();
    atualizarKPIs();
    filtrarChamados();
  } catch (erro) {
    console.error('Erro na requisição:', erro);
    mostrarToast('Não foi possível carregar os chamados do servidor.', 'error');
    if (contadorElem) contadorElem.textContent = 'Erro ao carregar';
  }
}

// 01 — Submissão do novo chamado
async function submeterNovoChamado(evento) {
  evento.preventDefault();

  const solicitanteInput = document.getElementById('solicitante');
  const categoriaInput = document.getElementById('categoria');
  const tituloInput = document.getElementById('titulo');
  const descricaoInput = document.getElementById('descricao');
  const btnSubmit = document.getElementById('btn-submit-chamado');

  const payload = {
    solicitante: solicitanteInput.value.trim(),
    categoria: categoriaInput.value.trim(),
    titulo: tituloInput.value.trim(),
    descricao: descricaoInput.value.trim()
  };

  // Validação prévia no frontend (Alinhada com a Spec 01)
  if (!payload.solicitante || payload.solicitante.length < 3) {
    mostrarToast('O solicitante é obrigatório e deve ter ao menos 3 caracteres.', 'error');
    solicitanteInput.focus();
    return;
  }

  if (!payload.categoria) {
    mostrarToast('Selecione uma categoria válida.', 'error');
    categoriaInput.focus();
    return;
  }

  if (!payload.titulo || payload.titulo.length < 5) {
    mostrarToast('O título deve conter pelo menos 5 caracteres.', 'error');
    tituloInput.focus();
    return;
  }

  if (!payload.descricao || payload.descricao.length < 10) {
    mostrarToast('A descrição deve conter no mínimo 10 caracteres informativos.', 'error');
    descricaoInput.focus();
    return;
  }

  try {
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Salvando...';

    const resposta = await fetch('/api/chamados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Falha ao registrar chamado.');
    }

    mostrarToast(`Chamado #${dados.chamado.id} registrado com sucesso!`, 'success');
    limparFormulario();
    alternarAba('lista');
    await carregarChamados();
  } catch (erro) {
    console.error('Erro ao cadastrar:', erro);
    mostrarToast(erro.message || 'Erro inesperado ao salvar chamado.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      Registrar Chamado
    `;
  }
}

// 03 — Consultar detalhes do chamado
async function abrirDetalhes(id) {
  try {
    const resposta = await fetch(`/api/chamados/${id}`);
    if (!resposta.ok) {
      throw new Error('Chamado não localizado no servidor.');
    }

    const chamado = await resposta.json();
    preencherModal(chamado);

    const modal = document.getElementById('modal-detalhes');
    modal.style.display = 'flex';
  } catch (erro) {
    console.error('Erro ao carregar detalhes:', erro);
    mostrarToast(erro.message || 'Erro ao carregar dados do chamado.', 'error');
  }
}

// Preenche dados do modal
function preencherModal(chamado) {
  document.getElementById('modal-chamado-id').textContent = `#${chamado.id}`;
  document.getElementById('modal-chamado-titulo').textContent = chamado.titulo;
  
  // Badge de Status
  const badgeStatus = document.getElementById('modal-chamado-status-badge');
  badgeStatus.textContent = chamado.status;
  badgeStatus.className = `badge ${obterClasseBadge(chamado.status)}`;

  // Informações da Solicitação
  document.getElementById('modal-solicitante').textContent = chamado.solicitante;
  document.getElementById('modal-categoria').textContent = chamado.categoria;
  document.getElementById('modal-criado-em').textContent = formatarData(chamado.criadoEm);
  document.getElementById('modal-atualizado-em').textContent = chamado.atualizadoEm ? formatarData(chamado.atualizadoEm) : 'Nenhuma';
  document.getElementById('modal-descricao').textContent = chamado.descricao;

  // Informações de Atendimento
  document.getElementById('modal-tecnico-nome').textContent = chamado.tecnico || 'Nenhum técnico atribuído';
  document.getElementById('modal-encerrado-em').textContent = chamado.encerradoEm ? formatarData(chamado.encerradoEm) : 'Em aberto';
  document.getElementById('modal-notas-atendimento').textContent = chamado.notasAtendimento || 'Nenhuma anotação técnica registrada até o momento.';

  // Formulário de Atualização (04-atualizar-chamado)
  document.getElementById('atualizar-chamado-id').value = chamado.id;
  document.getElementById('atualizar-status').value = chamado.status;
  document.getElementById('atualizar-tecnico').value = chamado.tecnico || '';
  document.getElementById('atualizar-notas').value = chamado.notasAtendimento || '';

  aoMudarStatusAtendimento();
}

// 04 — Atualizar status e informações do atendimento
async function submeterAtualizacaoAtendimento(evento) {
  evento.preventDefault();

  const id = document.getElementById('atualizar-chamado-id').value;
  const status = document.getElementById('atualizar-status').value;
  const tecnico = document.getElementById('atualizar-tecnico').value.trim();
  const notasAtendimento = document.getElementById('atualizar-notas').value.trim();
  const btnSalvar = document.getElementById('btn-salvar-atendimento');

  // Validações da Spec 04
  if (status !== 'Aberto' && (!tecnico || tecnico.length < 3)) {
    mostrarToast('Informe o nome do técnico responsável (mínimo de 3 caracteres).', 'error');
    document.getElementById('atualizar-tecnico').focus();
    return;
  }

  if ((status === 'Concluído' || status === 'Cancelado') && (!notasAtendimento || notasAtendimento.length < 5)) {
    mostrarToast('Para concluir ou cancelar, as notas de atendimento são obrigatórias (mínimo de 5 caracteres).', 'error');
    document.getElementById('atualizar-notas').focus();
    return;
  }

  try {
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    const resposta = await fetch(`/api/chamados/${id}/atendimento`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tecnico, notasAtendimento })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Falha ao atualizar atendimento.');
    }

    mostrarToast('Atendimento atualizado com sucesso!', 'success');
    preencherModal(resultado.chamado);
    await carregarChamados();
  } catch (erro) {
    console.error('Erro ao atualizar atendimento:', erro);
    mostrarToast(erro.message || 'Erro inesperado.', 'error');
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Salvar Atualização
    `;
  }
}

// Ajusta a exigência visual dos campos conforme o status selecionado
function aoMudarStatusAtendimento() {
  const status = document.getElementById('atualizar-status').value;
  const tecnicoMark = document.getElementById('tecnico-required-mark');
  const notasMark = document.getElementById('notas-required-mark');

  if (status === 'Aberto') {
    tecnicoMark.style.display = 'none';
    notasMark.style.display = 'none';
  } else if (status === 'Em atendimento') {
    tecnicoMark.style.display = 'inline';
    notasMark.style.display = 'none';
  } else {
    // Concluído ou Cancelado
    tecnicoMark.style.display = 'inline';
    notasMark.style.display = 'inline';
  }
}

function fecharModal() {
  const modal = document.getElementById('modal-detalhes');
  if (modal) modal.style.display = 'none';
}

function fecharModalSeClicarFora(evento) {
  if (evento.target.id === 'modal-detalhes') {
    fecharModal();
  }
}

// ==========================================
// FILTROS E BUSCA (Feature 05 - Evolução)
// ==========================================
function filtrarChamados() {
  const campoBusca = document.getElementById('campo-busca');
  const btnLimpar = document.getElementById('btn-limpar-busca');
  termoBuscaAtivo = (campoBusca.value || '').trim().toLowerCase();

  btnLimpar.style.display = termoBuscaAtivo ? 'block' : 'none';

  let filtrados = todosChamados;

  // Filtro por Status
  if (filtroStatusAtivo !== 'Todos') {
    filtrados = filtrados.filter((c) => c.status === filtroStatusAtivo);
  }

  // Filtro Textual por termo (ID, Solicitante, Título, Descrição)
  if (termoBuscaAtivo) {
    filtrados = filtrados.filter((c) => {
      const idMatch = c.id.toString() === termoBuscaAtivo || `#${c.id}` === termoBuscaAtivo;
      const tituloMatch = (c.titulo || '').toLowerCase().includes(termoBuscaAtivo);
      const descMatch = (c.descricao || '').toLowerCase().includes(termoBuscaAtivo);
      const solicitanteMatch = (c.solicitante || '').toLowerCase().includes(termoBuscaAtivo);
      const categoriaMatch = (c.categoria || '').toLowerCase().includes(termoBuscaAtivo);
      return idMatch || tituloMatch || descMatch || solicitanteMatch || categoriaMatch;
    });
  }

  renderizarTabela(filtrados);
}

function selecionarFiltroStatus(status, botao) {
  filtroStatusAtivo = status;

  // Atualiza estilização dos botões
  document.querySelectorAll('.filter-chips .chip').forEach((chip) => chip.classList.remove('active'));
  if (botao) {
    botao.classList.add('active');
  }

  filtrarChamados();
}

function aplicarFiltroRapido(status) {
  alternarAba('lista');
  const botaoChip = document.querySelector(`.filter-chips .chip[data-status="${status}"]`);
  selecionarFiltroStatus(status, botaoChip);
}

function limparBusca() {
  const campoBusca = document.getElementById('campo-busca');
  campoBusca.value = '';
  filtrarChamados();
  campoBusca.focus();
}

function limparFiltros() {
  document.getElementById('campo-busca').value = '';
  const chipTodos = document.querySelector('.filter-chips .chip[data-status="Todos"]');
  selecionarFiltroStatus('Todos', chipTodos);
}

// ==========================================
// RENDERIZAÇÃO DA TABELA (Feature 02)
// ==========================================
function renderizarTabela(chamados) {
  const corpoTabela = document.getElementById('tabela-chamados-corpo');
  const emptyState = document.getElementById('empty-state');
  const contador = document.getElementById('contador-listagem');

  corpoTabela.innerHTML = '';

  contador.textContent = `Exibindo ${chamados.length} de ${todosChamados.length} chamados`;

  if (chamados.length === 0) {
    emptyState.style.display = 'block';
    if (todosChamados.length === 0) {
      document.getElementById('empty-state-title').textContent = 'Nenhum chamado registrado';
      document.getElementById('empty-state-desc').textContent = 'Seja o primeiro a abrir um chamado de suporte no sistema!';
      document.getElementById('empty-state-action').textContent = 'Abrir Novo Chamado';
      document.getElementById('empty-state-action').onclick = () => alternarAba('novo');
    } else {
      document.getElementById('empty-state-title').textContent = 'Nenhum resultado encontrado';
      document.getElementById('empty-state-desc').textContent = 'Não encontramos chamados que correspondam aos filtros informados.';
      document.getElementById('empty-state-action').textContent = 'Limpar Filtros';
      document.getElementById('empty-state-action').onclick = limparFiltros;
    }
    return;
  }

  emptyState.style.display = 'none';

  chamados.forEach((chamado) => {
    const tr = document.createElement('tr');
    tr.onclick = (e) => {
      // Evita disparar se clicar direto no botão interno
      if (!e.target.closest('button')) {
        abrirDetalhes(chamado.id);
      }
    };

    tr.innerHTML = `
      <td><span class="badge-id">#${chamado.id}</span></td>
      <td><strong>${escaparHTML(chamado.solicitante)}</strong></td>
      <td>
        <span class="ticket-title">${escaparHTML(chamado.titulo)}</span>
      </td>
      <td><span class="ticket-category-tag">${escaparHTML(chamado.categoria)}</span></td>
      <td>
        <span class="badge ${obterClasseBadge(chamado.status)}">${chamado.status}</span>
      </td>
      <td style="color: var(--text-secondary); font-size: 0.8rem;">
        ${formatarData(chamado.criadoEm)}
      </td>
      <td style="text-align: center;">
        <button class="action-btn" title="Ver detalhes e atendimento" onclick="abrirDetalhes(${chamado.id})">
          Ver Detalhes
        </button>
      </td>
    `;

    corpoTabela.appendChild(tr);
  });
}

// ==========================================
// UTILITÁRIOS E HELPERS
// ==========================================
function atualizarKPIs() {
  const total = todosChamados.length;
  const abertos = todosChamados.filter((c) => c.status === 'Aberto').length;
  const atendimento = todosChamados.filter((c) => c.status === 'Em atendimento').length;
  const concluidos = todosChamados.filter((c) => c.status === 'Concluído').length;

  document.getElementById('kpi-total').textContent = total;
  document.getElementById('kpi-abertos').textContent = abertos;
  document.getElementById('kpi-atendimento').textContent = atendimento;
  document.getElementById('kpi-concluidos').textContent = concluidos;
}

function obterClasseBadge(status) {
  switch (status) {
    case 'Aberto':
      return 'badge-aberto';
    case 'Em atendimento':
      return 'badge-atendimento';
    case 'Concluído':
      return 'badge-concluido';
    case 'Cancelado':
      return 'badge-cancelado';
    default:
      return '';
  }
}

function formatarData(isoString) {
  if (!isoString) return '-';
  try {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

function escaparHTML(texto) {
  if (!texto) return '';
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function limparFormulario() {
  document.getElementById('form-novo-chamado').reset();
  const contador = document.getElementById('char-counter');
  if (contador) contador.textContent = '0 / 2000';
}

function mostrarToast(mensagem, tipo = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  
  let icone = '&#8505;&#65039;';
  if (tipo === 'success') icone = '&#9989;';
  if (tipo === 'error') icone = '&#10060;';

  toast.innerHTML = `<span>${icone}</span> <span>${mensagem}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
