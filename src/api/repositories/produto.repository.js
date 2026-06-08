import db from "../models/index.js"
import { Op } from "sequelize"

const Produto = db.Produto

export async function listarTodos(filtros = {}) {
  const where = { ativo: 1 }

  if (filtros.nome) {
    where.nome = { [Op.like]: `%${filtros.nome}%` }
  }

  return await Produto.findAll({
    where,
    order: [["nome", "ASC"]]
  })
}

export async function buscarPorId(id) {
  return await Produto.findByPk(id)
}
