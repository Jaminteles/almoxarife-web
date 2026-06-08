import * as produtoService from "../services/produto.service.js"

export const listar = async (req, res) => {
  try {
    const { nome } = req.query
    const dados = await produtoService.listarProdutos({ nome })

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
    const dados = await produtoService.buscarProdutoPorId(req.params.id)
    res.json({ sucesso: true, dados })
  } catch (erro) {
    res.status(404).json({ sucesso: false, erro: erro.message })
  }
}
