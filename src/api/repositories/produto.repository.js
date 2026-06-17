import db from "../models/index.js" // Ajuste o caminho se a exportação do db for diferente

const Produto = db.Produto

export const buscarTodos = async () => {
    return await Produto.findAll()
}

export const buscarPorId = async (id) => {
    return await Produto.findByPk(id)
}

export const criar = async (dados) => {
    return await Produto.create(dados)
}

export const atualizar = async (id, dados) => {
    const produto = await Produto.findByPk(id)
    if (!produto) return null

    return await produto.update(dados)
}

export const excluir = async (id) => {
    const produto = await Produto.findByPk(id)
    if (!produto) return false

    await produto.destroy()
    return true
}