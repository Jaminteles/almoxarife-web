import * as funcionarioService from "../services/funcionario.service.js"

export const listar = async (req, res) => {
  try {
    const dados = await funcionarioService.listarFuncionarios()
    const dadosSemSenha = dados.map(f => {
      const { senha, ...resto } = f.toJSON()
      return resto
    })
    res.json({ sucesso: true, dados: dadosSemSenha, total: dadosSemSenha.length })
  } catch(erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

export const buscarUm = async (req, res) => {
  try {
    const funcionario = await funcionarioService.buscarFuncionarioPorId(req.params.id)
    const { senha, ...dados } = funcionario.toJSON()
    res.json({ sucesso: true, dados })
  } catch(erro) {
    res.status(404).json({ sucesso: false, erro: erro.message })
  }
}

export const criar = async (req, res) => {
  try {
    const novo = await funcionarioService.criarFuncionario(req.body)
    const { senha, ...dados } = novo.toJSON()

    res.status(201).json({
      sucesso: true,
      mensagem: "Funcionário cadastrado com sucesso",
      dados,
    })
  } catch(erro) {
    if(erro.message.includes("já cadastrado")) {
      return res.status(409).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

export const atualizar = async (req, res) => {
  try {
    const atualizado = await funcionarioService.atualizarFuncionario(req.params.id, req.body)
    const { senha, ...retorno } = atualizado.toJSON()
    res.json({ sucesso: true, mensagem: "Funcionário atualizado com sucesso", dados: retorno })
  } catch(erro) {
    if(erro.message === "Funcionário não encontrado") {
      return res.status(404).json({ sucesso: false, erro: erro.message })
    }
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

export const remover = async (req, res) => {
  try {
    await funcionarioService.removerFuncionario(req.params.id)
    res.json({ sucesso: true, mensagem: "Funcionário removido com sucesso" })
  } catch(erro) {
    res.status(404).json({ sucesso: false, erro: erro.message })
  }
}