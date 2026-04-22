import * as fornecedorService from "../services/fornecedor.service.js"

// Cadastrar
export const cadastrar = async (req, res) => {
  try {
    const resultado = await fornecedorService.cadastrarFornecedor(req.body)
    res.status(201).json({
      sucesso: true,
      mensagem: "Fornecedor cadastrado com sucesso",
      dados: resultado
    })
  } catch (erro) {
    if (erro.message.includes("já registrado")) {
      return res.status(409).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// Listar / Buscar com filtros
// GET /api/fornecedores
// GET /api/fornecedores?razao_social=joao&cnpj=11222333
export const listar = async (req, res) => {
  try {
    // Extrai só as chaves que nos interessam — evita passar coisa aleatória
    const { razao_social, nome_fantasia, cnpj, email } = req.query
    const filtros = { razao_social, nome_fantasia, cnpj, email }

    const resultado = await fornecedorService.listarFornecedores(filtros)
    res.json({
      sucesso: true,
      dados: resultado,
      total: resultado.length
    })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// Buscar por ID
export const buscarPorId = async (req, res) => {
  try {
    const resultado = await fornecedorService.buscarFornecedorPorId(req.params.id)
    res.json({ sucesso: true, dados: resultado })
  } catch (erro) {
    res.status(404).json({ sucesso: false, erro: erro.message })
  }
}

// Editar
export const editar = async (req, res) => {
  try {
    const resultado = await fornecedorService.editarFornecedor(req.params.id, req.body)
    res.json({
      sucesso: true,
      mensagem: "Fornecedor atualizado com sucesso",
      dados: resultado
    })
  } catch (erro) {
    if (erro.message === "Fornecedor não encontrado") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// Inativar
export const inativar = async (req, res) => {
  try {
    await fornecedorService.inativarFornecedor(req.params.id)
    res.json({ sucesso: true, mensagem: "Fornecedor inativado com sucesso" })
  } catch (erro) {
    if (erro.message === "Fornecedor não encontrado") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}
