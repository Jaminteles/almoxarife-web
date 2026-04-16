import * as cargoRepo from "../repositories/cargo.repository.js"

export const listar = async (req, res) => {
  try {
    const dados = await cargoRepo.listarTodos()
    res.json({ sucesso: true, dados })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

export const criar = async (req, res) => {
  try {
    const novo = await cargoRepo.criar(req.body)
    res.status(201).json({ sucesso: true, dados: novo })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}
