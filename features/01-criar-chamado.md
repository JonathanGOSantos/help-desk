# Especificação de Funcionalidade: 01 — Criar Chamado

## Objetivo
Permitir que qualquer funcionário registre uma nova solicitação de suporte técnico ou manutenção, formalizando a demanda no sistema e gerando um protocolo rastreável com status inicial padronizado.

## Atores
- **Funcionário Solicitante:** Usuário que vivenciou uma falha ou precisa de assistência e deseja registrar o pedido de atendimento.

## User Story
**Como** funcionário da empresa,  
**quero** cadastrar um novo chamado de suporte informando os detalhes do meu problema,  
**para que** a equipe de TI/atendimento tome conhecimento da ocorrência e possa providenciar a solução.

## Dados de entrada
- **Solicitante (Nome do funcionário):** Texto simples, obrigatório (mínimo 3 caracteres).
- **Título do Chamado:** Texto explicativo sucinto, obrigatório (entre 5 e 100 caracteres).
- **Categoria:** Seleção obrigatória a partir de uma lista pré-definida:
  - `Hardware` (computador, impressora, periféricos);
  - `Software` (instalação de programas, erros de sistema operacional);
  - `Rede e Internet` (conectividade, lentidão, Wi-Fi);
  - `Acesso e Permissões` (senhas, liberação de pastas/e-mail);
  - `Outros`.
- **Descrição detalhada:** Texto longo com o relato do problema, obrigatório (mínimo 10 caracteres e máximo 2000 caracteres).

## Regras de negócio
- **RN01:** O solicitante é obrigatório e identifica quem requisitou o suporte.
- **RN02:** O título do chamado é obrigatório e deve ser informativo.
- **RN03:** A descrição é obrigatória e deve conter detalhes mínimos do incidente.
- **RN04:** A categoria deve obrigatoriamente pertencer à lista homologada pela organização.
- **RN05:** Todo novo chamado criado deve receber automaticamente um identificador único numérico sequencial (`id`).
- **RN06:** O status inicial de qualquer chamado recém-criado deve ser categoricamente **"Aberto"**.
- **RN07:** A data e hora de criação (`criadoEm`) devem ser geradas automaticamente pelo servidor no momento da gravação no formato ISO 8601.
- **RN08:** Não são permitidos registros com espaços em branco exclusivos (trimming obrigatório).

## Comportamento esperado
1. O usuário acessa a aba/seção de cadastro de chamados.
2. O formulário exibe os campos devidamente identificados com indicação de preenchimento obrigatório.
3. O usuário preenche os campos e aciona o botão **"Registrar Chamado"**.
4. O sistema valida os campos no cliente e no servidor.
5. Em caso de sucesso:
   - Os dados são persistidos;
   - Uma notificação de sucesso é exibida contendo o ID gerado (ex: "Chamado #101 registrado com sucesso!");
   - Os campos do formulário são limpos;
   - A lista de chamados é atualizada automaticamente para refletir o novo registro.

## Validações
- **V01 (Solicitante):** Campo presente, não vazio após `trim()`, comprimento entre 3 e 100 caracteres.
- **V02 (Título):** Campo presente, não vazio após `trim()`, comprimento entre 5 e 100 caracteres.
- **V03 (Categoria):** Deve ser exatamente um dos valores permitidos (`Hardware`, `Software`, `Rede e Internet`, `Acesso e Permissões`, `Outros`).
- **V04 (Descrição):** Campo presente, não vazio após `trim()`, comprimento entre 10 e 2000 caracteres.

## Critérios de aceitação
1. **CA01 — Cadastro válido com campos preenchidos corretamente:**  
   Ao submeter o formulário com solicitante, título, categoria e descrição válidos, o sistema deve salvar o chamado com status "Aberto", gerar um ID numérico e retornar código HTTP 201 (Created).
2. **CA02 — Bloqueio por título ausente ou inválido:**  
   Ao tentar registrar sem informar o título ou com menos de 5 caracteres, o cadastro deve ser impedido com mensagem de erro explícita e código HTTP 400.
3. **CA03 — Bloqueio por descrição ausente ou curta:**  
   Ao tentar registrar sem descrição ou com menos de 10 caracteres, o cadastro deve ser impedido com indicação clara do campo com erro e código HTTP 400.
4. **CA04 — Bloqueio por solicitante ausente:**  
   Ao submeter sem o nome do solicitante, o sistema deve rejeitar o envio informando a obrigatoriedade.
5. **CA05 — Categoria padrão ou inválida:**  
   Caso a categoria enviada não conste nas opções válidas, o cadastro deve ser bloqueado.
6. **CA06 — Status inicial obrigatório:**  
   Mesmo que o cliente envie qualquer valor de status malicioso na requisição, o backend deve forçar o status inicial para "Aberto".

## Casos de exceção
- **CE01 (Campos em branco ou apenas espaços):** O sistema deve aplicar `trim()` e sinalizar erro de preenchimento obrigatório nos campos afetados.
- **CE02 (Falha de comunicação/servidor):** Se ocorrer erro interno ao salvar o registro, o sistema deve exibir alerta amigável na interface ("Não foi possível salvar o chamado. Tente novamente.") e registrar o erro no log do servidor sem corromper os dados existentes.

## Fora do escopo
- Envio de anexos (prints de tela, relatórios);
- Notificação de confirmação por e-mail ou SMS;
- Seleção de múltiplos solicitantes ou atribuição de técnicos no momento da abertura.

---

## Sessão de Esclarecimento (Etapa 6 do SDD)
Durante a revisão dos requisitos iniciais com apoio de IA, os seguintes pontos foram questionados e decididos:
- **Pergunta 1:** O solicitante deve poder escolher o status inicial (ex: "Urgente" ou "Em atendimento")?  
  *Decisão:* Não. Todo chamado nasce como "Aberto". Status é controle da equipe de suporte, nunca do solicitante.
- **Pergunta 2:** Quais são as categorias homologadas?  
  *Decisão:* Definimos 5 categorias fixas: Hardware, Software, Rede e Internet, Acesso e Permissões, Outros.
- **Pergunta 3:** Qual o tamanho mínimo e máximo do título e da descrição?  
  *Decisão:* Título: 5 a 100 caracteres; Descrição: 10 a 2000 caracteres. Textos excessivamente curtos como "ajuda" ou "deu erro" não fornecem contexto ao suporte.
- **Pergunta 4:** O que fazer se o usuário tentar enviar apenas espaços em branco?  
  *Decisão:* Realizar `trim()` obrigatório antes da validação tanto no frontend quanto no backend.

---

## Plano de Implementação e Micro-Tarefas (Etapas 7 e 8 do SDD)
- **Tarefa 1.1:** Criar formulário HTML com os campos Solicitante, Título, Categoria (`<select>`) e Descrição (`<textarea>`).
- **Tarefa 1.2:** Estilizar formulário com feedback visual para campos válidos e inválidos.
- **Tarefa 1.3:** Implementar validação preventiva no cliente (JavaScript) impedindo submissão de campos vazios.
- **Tarefa 1.4:** Implementar endpoint REST `POST /api/chamados` no Express.
- **Tarefa 1.5:** Implementar sanitização e validação defensiva dos dados recebidos no backend.
- **Tarefa 1.6:** Implementar lógica de geração de ID sequencial e injeção de status "Aberto" e timestamp `criadoEm`.
- **Tarefa 1.7:** Implementar persistência dos dados no arquivo `chamados.json`.
- **Tarefa 1.8:** Implementar retorno HTTP 201 com JSON do chamado criado e tratamento de erros (HTTP 400/500).

---

## Tabela de Validação de Testes (Etapa 10 do SDD)

| Critério de Aceitação | Dados de Teste | Resultado Esperado | Resultado Obtido | Situação |
|---|---|---|---|---|
| **CA01 — Criar chamado válido** | Solicitante: "Carlos Silva", Título: "Impressora não liga", Categoria: "Hardware", Descrição: "Liguei na tomada e o LED não acende." | Chamado salvo com ID sequencial, status "Aberto", HTTP 201 | Chamado persistido com ID #1, status "Aberto", HTTP 201 | **Aprovado** |
| **CA02 — Título vazio ou curto** | Título: "Erro" (< 5 caracteres) ou vazio | Bloqueio do cadastro com mensagem explicativa e HTTP 400 | Validação barrou submissão com erro "Título deve ter no mínimo 5 caracteres" | **Aprovado** |
| **CA03 — Descrição curta** | Descrição: "quebrou" (< 10 caracteres) | Bloqueio com HTTP 400 | Cadastro impedido com erro de descrição insuficiente | **Aprovado** |
| **CA04 — Solicitante vazio** | Solicitante: "   " (espaços) | Bloqueio imediato indicando campo obrigatório | Rejeição por validação de solicitante ausente | **Aprovado** |
| **CA05 — Categoria inválida** | Categoria: "Inexistente" | Bloqueio com erro de categoria não permitida | Rejeitado com HTTP 400 | **Aprovado** |
| **CA06 — Status inicial forçado** | Payload com `"status": "Concluído"` | Chamado é criado categoricamente com `"status": "Aberto"` | Payload malicioso ignorado, gravado como "Aberto" | **Aprovado** |

---

## Status
**Concluída**
