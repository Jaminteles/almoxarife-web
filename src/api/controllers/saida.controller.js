import * as saidaService from "../services/saida.service.js"

export const listar = async (req, res) => {
  try {
    const { data, destino, responsavel, produto, tipo } = req.query
    const dados = await saidaService.listarSaidas({ data, destino, responsavel, produto, tipo })

    res.json({
      sucesso: true,
      dados,
      total: dados.length
    })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

export const buscarPorId = async (req, res) => {
  try {
    const dados = await saidaService.buscarSaidaPorId(req.params.id)
    res.json({ sucesso: true, dados })
  } catch (erro) {
    res.status(404).json({ sucesso: false, erro: erro.message })
  }
}

export const cadastrar = async (req, res) => {
  try {
    const dados = await saidaService.cadastrarSaida(req.body)
    res.status(201).json({
      sucesso: true,
      mensagem: "Saída registrada com sucesso",
      dados
    })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

export const editar = async (req, res) => {
  try {
    const dados = await saidaService.editarSaida(req.params.id, req.body)
    res.json({
      sucesso: true,
      mensagem: "Saída atualizada com sucesso",
      dados
    })
  } catch (erro) {
    if (erro.message === "Saída não encontrada") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }

    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

export const excluir = async (req, res) => {
  try {
    await saidaService.excluirSaida(req.params.id)
    res.json({ sucesso: true, mensagem: "Saída excluída com sucesso" })
  } catch (erro) {
    if (erro.message === "Saída não encontrada") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }

    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}
