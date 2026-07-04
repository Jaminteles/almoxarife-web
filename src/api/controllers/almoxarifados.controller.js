import * as almoxarifadoService from "../services/almoxarifado.service.js"
import { escopoAlmoxarifado } from "../utils/escopo.js"

// Cadastrar
export const cadastrar = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const resultado = await almoxarifadoService.cadastrarAlmoxarifado(req.body, escopo)

    res.status(201).json({
      sucesso: true,
      mensagem: "Almoxarifado cadastrado com sucesso",
      dados: resultado
    })
  } catch (erro) {
    if (erro.message.includes("já registrado")) {
      return res.status(409).json({
        sucesso: false,
        erro: erro.message
      })
    }

    res.status(erro.status || 400).json({
      sucesso: false,
      erro: erro.message
    })
  }
}

// Listar
export const listar = async (req, res) => {
  try {
    const { nome, email, telefone, cidade, estado } = req.query
    const filtros = { nome, email, telefone, cidade, estado }

    const escopo = escopoAlmoxarifado(req.usuario)
    const resultado = await almoxarifadoService.listarAlmoxarifados(filtros, escopo)

    res.json({
      sucesso: true,
      dados: resultado,
      total: resultado.length
    })
  } catch (erro) {
    res.status(erro.status || 400).json({
      sucesso: false,
      erro: erro.message
    })
  }
}

// Buscar por ID
export const buscarPorId = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const resultado = await almoxarifadoService.buscarAlmoxarifadoPorId(req.params.id, escopo)

    res.json({
      sucesso: true,
      dados: resultado
    })
  } catch (erro) {
    res.status(erro.status || 404).json({
      sucesso: false,
      erro: erro.message
    })
  }
}

// Editar
export const editar = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const resultado = await almoxarifadoService.editarAlmoxarifado(req.params.id, req.body, escopo)

    res.json({
      sucesso: true,
      mensagem: "Almoxarifado atualizado com sucesso",
      dados: resultado
    })
  } catch (erro) {
    if (erro.message === "Almoxarifado não encontrado") {
      return res.status(404).json({
        sucesso: false,
        erro: erro.message
      })
    }

    res.status(erro.status || 400).json({
      sucesso: false,
      erro: erro.message
    })
  }
}

// Estoque do almoxarifado [RF014]
export const estoque = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const dados = await almoxarifadoService.listarEstoque(req.params.id, escopo)
    res.json({ sucesso: true, dados, total: dados.length })
  } catch (erro) {
    if (erro.message === "Almoxarifado não encontrado") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

// Inativar
export const inativar = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    await almoxarifadoService.inativarAlmoxarifado(req.params.id, escopo)

    res.json({
      sucesso: true,
      mensagem: "Almoxarifado inativado com sucesso"
    })
  } catch (erro) {
    if (erro.message === "Almoxarifado não encontrado") {
      return res.status(404).json({
        sucesso: false,
        erro: erro.message
      })
    }

    res.status(erro.status || 400).json({
      sucesso: false,
      erro: erro.message
    })
  }
}