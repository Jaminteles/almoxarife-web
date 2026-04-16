import db from "../models/index.js"

const Cargo = db.Cargo

export async function listarTodos() {
  return await Cargo.findAll({ order: [["nome_cargo", "ASC"]] })
}

export async function buscarPorId(id) {
  return await Cargo.findByPk(id)
}

export async function criar(dados) {
  return await Cargo.create(dados)
}

export async function atualizar(id, dados) {
  await Cargo.update(dados, { where: { id_cargo: id } })
  return await Cargo.findByPk(id)
}

export async function remover(id) {
  return await Cargo.destroy({ where: { id_cargo: id } })
}
