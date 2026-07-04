import * as saidaService from "../services/saida.service.js"
import { escopoAlmoxarifado } from "../utils/escopo.js"

export const listar = async (req, res) => {
  try {
    const { data, destino, responsavel, produto, tipo } = req.query
    const escopo = escopoAlmoxarifado(req.usuario)
    const dados = await saidaService.listarSaidas({ data, destino, responsavel, produto, tipo }, escopo)

    res.json({
      sucesso: true,
      dados,
      total: dados.length
    })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

export const buscarPorId = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const dados = await saidaService.buscarSaidaPorId(req.params.id, escopo)
    res.json({ sucesso: true, dados })
  } catch (erro) {
    res.status(erro.status || 404).json({ sucesso: false, erro: erro.message })
  }
}

export const cadastrar = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const dados = await saidaService.cadastrarSaida(req.body, escopo)
    res.status(201).json({
      sucesso: true,
      mensagem: "Saída registrada com sucesso",
      dados
    })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

export const editar = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const dados = await saidaService.editarSaida(req.params.id, req.body, escopo)
    res.json({
      sucesso: true,
      mensagem: "Saída atualizada com sucesso",
      dados
    })
  } catch (erro) {
    if (erro.message === "Saída não encontrada") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }

    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

export const excluir = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    await saidaService.excluirSaida(req.params.id, escopo)
    res.json({ sucesso: true, mensagem: "Saída excluída com sucesso" })
  } catch (erro) {
    if (erro.message === "Saída não encontrada") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }

    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}
