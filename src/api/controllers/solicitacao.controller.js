import * as solicitacaoService from "../services/solicitacao.service.js"

// POST /api/solicitacoes  (público) — pedido de cadastro
export const solicitar = async (req, res) => {
  try {
    const dados = await solicitacaoService.solicitarCadastro(req.body)
    res.status(201).json({
      sucesso: true,
      mensagem: "Solicitação enviada! Aguarde a aprovação da administração central.",
      dados
    })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

// GET /api/solicitacoes?status=PENDENTE  (CENTRAL)
export const listar = async (req, res) => {
  try {
    const dados = await solicitacaoService.listarSolicitacoes(req.query.status)
    res.json({ sucesso: true, dados, total: dados.length })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

// POST /api/solicitacoes/:id/aprovar  (CENTRAL)
export const aprovar = async (req, res) => {
  try {
    const dados = await solicitacaoService.aprovarSolicitacao(req.params.id, req.body)
    res.json({ sucesso: true, mensagem: "Conta criada com sucesso!", dados })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

// POST /api/solicitacoes/:id/rejeitar  (CENTRAL)
export const rejeitar = async (req, res) => {
  try {
    const dados = await solicitacaoService.rejeitarSolicitacao(req.params.id, req.body?.motivo)
    res.json({ sucesso: true, mensagem: "Solicitação rejeitada.", dados })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}
