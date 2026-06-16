import * as produtosRepo from "../repositories/produto.repository.js"

const normalizarFiltros = (filtros = {}) => {
  const limpos = {}
  const trim = (v) => (typeof v === "string" ? v.trim() : v)

  if (trim(filtros.nome)) limpos.nome = trim(filtros.nome)

  return limpos
}

export const listarProdutos = async (filtros = {}) => {
  return await produtosRepo.listarTodos(normalizarFiltros(filtros))
}

export const buscarProdutoPorId = async (id) => {
  const produto = await produtosRepo.buscarPorId(id)

  if (!produto) {
    throw new Error("Produto não encontrado")
  }

  return produto
}
