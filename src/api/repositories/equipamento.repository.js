import db from "../models/index.js"
import { Op } from "sequelize"

const Equipamento = db.Equipamento

const incluirObra = {
  model: db.Almoxarifado,
  as: "obra",
  attributes: ["cod_almoxarifado", "nome"]
}

export async function listarTodos(filtros = {}) {
  const where = {}

  if (filtros.descricao) where.descricao = { [Op.like]: `%${filtros.descricao}%` }
  if (filtros.codigo) where.codigo = { [Op.like]: `%${filtros.codigo}%` }
  if (filtros.obraId) where.obraId = filtros.obraId

  return await Equipamento.findAll({
    where,
    include: [incluirObra],
    order: [["descricao", "ASC"]]
  })
}

export async function buscarPorId(id) {
  return await Equipamento.findByPk(id, { include: [incluirObra] })
}

export async function buscarPorCodigo(codigo, idIgnorado = null) {
  const where = { codigo }
  if (idIgnorado !== null) where.id_equipamento = { [Op.ne]: idIgnorado }
  return await Equipamento.findOne({ where })
}

// "Obra" é o Almoxarifado já cadastrado. Só obras ativas podem receber
// novos equipamentos ou ser selecionadas em uma edição.
export async function buscarObraAtivaPorId(id) {
  return await db.Almoxarifado.findOne({
    where: { cod_almoxarifado: id, ativo: 1 },
    attributes: ["cod_almoxarifado", "nome"]
  })
}

export async function criar(dados) {
  return await Equipamento.create(dados)
}

export async function atualizar(id, dados) {
  await Equipamento.update(dados, { where: { id_equipamento: id } })
  return await buscarPorId(id)
}

export async function excluir(id) {
  return await Equipamento.destroy({ where: { id_equipamento: id } })
}
