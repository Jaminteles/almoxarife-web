import * as funcionarioService from "../services/funcionario.service.js"

// Listar / Buscar com filtros
// GET /api/funcionarios
// GET /api/funcionarios?nome=maria&cpf=123&cargo=almoxarife&email=teste
export const listar = async (req, res) => {
  try {
    const { nome, cpf, email, cargo } = req.query
    const filtros = { nome, cpf, email, cargo }

    const dados = await funcionarioService.listarFuncionarios(filtros)
    res.json({ sucesso: true, dados, total: dados.length })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// Buscar por ID (UUID)
export const buscarPorId = async (req, res) => {
  try {
    const dados = await funcionarioService.buscarFuncionarioPorId(req.params.id)
    res.json({ sucesso: true, dados })
  } catch (erro) {
    res.status(404).json({ sucesso: false, erro: erro.message })
  }
}

// Buscar por CPF
export const buscarPorCpf = async (req, res) => {
  try {
    const dados = await funcionarioService.buscarFuncionarioPorCpf(req.params.cpf)
    res.json({ sucesso: true, dados })
  } catch (erro) {
    res.status(404).json({ sucesso: false, erro: erro.message })
  }
}

// Criar
export const criar = async (req, res) => {
  try {
    const novo = await funcionarioService.criarFuncionario(req.body)
    res.status(201).json({
      sucesso: true,
      mensagem: "Funcionário cadastrado com sucesso",
      dados: novo
    })
  } catch (erro) {
    if (erro.message.includes("já cadastrado")) {
      return res.status(409).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// Atualizar
export const atualizar = async (req, res) => {
  try {
    const atualizado = await funcionarioService.atualizarFuncionario(req.params.id, req.body)
    res.json({
      sucesso: true,
      mensagem: "Funcionário atualizado com sucesso",
      dados: atualizado
    })
  } catch (erro) {
    if (erro.message === "Funcionário não encontrado") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// Inativar
export const inativar = async (req, res) => {
  try {
    await funcionarioService.inativarFuncionario(req.params.id)
    res.json({ sucesso: true, mensagem: "Funcionário inativado com sucesso" })
  } catch (erro) {
    if (erro.message === "Funcionário não encontrado") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}
