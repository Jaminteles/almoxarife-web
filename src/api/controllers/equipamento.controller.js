import * as equipamentoService from "../services/equipamento.service.js"

export const listar = async (req, res) => {
  try {
    const dados = await equipamentoService.listarEquipamentos(req.query)
    res.json({ sucesso: true, dados, total: dados.length })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

export const buscarPorId = async (req, res) => {
  try {
    const dados = await equipamentoService.buscarEquipamentoPorId(req.params.id)
    res.json({ sucesso: true, dados })
  } catch (erro) {
    res.status(erro.status || 404).json({ sucesso: false, erro: erro.message })
  }
}

export const criar = async (req, res) => {
  try {
    const dados = await equipamentoService.criarEquipamento(req.body)
    res.status(201).json({ sucesso: true, mensagem: "Equipamento cadastrado com sucesso", dados })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

export const atualizar = async (req, res) => {
  try {
    const dados = await equipamentoService.atualizarEquipamento(req.params.id, req.body)
    res.json({ sucesso: true, mensagem: "Equipamento atualizado com sucesso", dados })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

export const excluir = async (req, res) => {
  try {
    await equipamentoService.excluirEquipamento(req.params.id)
    res.json({ sucesso: true, mensagem: "Equipamento excluído com sucesso" })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}
