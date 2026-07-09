import * as equipeService from "../services/equipe.service.js"

// GET /api/equipes?nome=...
export const listar = async (req, res) => {
  try {
    const dados = await equipeService.listarEquipes({ nome: req.query.nome })
    res.json({ sucesso: true, dados, total: dados.length })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// GET /api/equipes/:id
export const buscarPorId = async (req, res) => {
  try {
    const dados = await equipeService.buscarEquipePorId(req.params.id)
    res.json({ sucesso: true, dados })
  } catch (erro) {
    res.status(404).json({ sucesso: false, erro: erro.message })
  }
}

// POST /api/equipes
export const criar = async (req, res) => {
  try {
    const nova = await equipeService.criarEquipe(req.body)
    res.status(201).json({
      sucesso: true,
      mensagem: "Equipe cadastrada com sucesso",
      dados: nova
    })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// PUT /api/equipes/:id
export const atualizar = async (req, res) => {
  try {
    const atualizada = await equipeService.atualizarEquipe(req.params.id, req.body)
    res.json({
      sucesso: true,
      mensagem: "Equipe atualizada com sucesso",
      dados: atualizada
    })
  } catch (erro) {
    if (erro.message === "Equipe não encontrada") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// DELETE /api/equipes/:id  (inativação — soft delete)
export const inativar = async (req, res) => {
  try {
    await equipeService.inativarEquipe(req.params.id)
    res.json({ sucesso: true, mensagem: "Equipe inativada com sucesso" })
  } catch (erro) {
    if (erro.message === "Equipe não encontrada") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}
