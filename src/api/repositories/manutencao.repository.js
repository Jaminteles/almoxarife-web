import db from "../models/index.js"
import { Op } from "sequelize"

const { Equipamento, Almoxarifado, HorimetroEquipamento, ManutencaoEquipamento, Funcionario } = db

const incluirObra = { model: Almoxarifado, as: "obra", attributes: ["cod_almoxarifado", "nome"] }
const incluirResponsavel = { model: Funcionario, as: "responsavel", attributes: ["id_funcionario", "nome"] }

export async function listarEquipamentos(filtros = {}) {
  const where = {}
  if (filtros.equipamento) where.descricao = { [Op.like]: `%${filtros.equipamento}%` }
  if (filtros.codigo) where.codigo = { [Op.like]: `%${filtros.codigo}%` }
  if (filtros.obraId) where.obraId = filtros.obraId
  return Equipamento.findAll({ where, include: [incluirObra], order: [["descricao", "ASC"]] })
}

export const buscarEquipamento = (id) => Equipamento.findByPk(id, { include: [incluirObra] })

export async function listarLeiturasRecentes(ids) {
  if (!ids.length) return []
  return HorimetroEquipamento.findAll({
    where: { id_equipamento: { [Op.in]: ids } },
    order: [["id_equipamento", "ASC"], ["data_leitura", "DESC"], ["id_horimetro", "DESC"]]
  })
}

export async function listarManutencoesRecentes(ids) {
  if (!ids.length) return []
  return ManutencaoEquipamento.findAll({
    where: { id_equipamento: { [Op.in]: ids } },
    order: [["id_equipamento", "ASC"], ["data_manutencao", "DESC"], ["id_manutencao", "DESC"]]
  })
}

export const listarHorimetros = (id) => HorimetroEquipamento.findAll({
  where: { id_equipamento: id }, include: [incluirResponsavel],
  order: [["data_leitura", "DESC"], ["id_horimetro", "DESC"]]
})

export const listarManutencoes = (id) => ManutencaoEquipamento.findAll({
  where: { id_equipamento: id }, include: [incluirResponsavel],
  order: [["data_manutencao", "DESC"], ["id_manutencao", "DESC"]]
})

export const buscarMaiorHorimetro = (id, transaction = null) => HorimetroEquipamento.findOne({
  where: { id_equipamento: id }, order: [["horimetro", "DESC"]], transaction
})

export const buscarMaiorHorimetroExceto = (id, idHorimetro, transaction = null) => HorimetroEquipamento.findOne({
  where: { id_equipamento: id, id_horimetro: { [Op.ne]: idHorimetro } }, order: [["horimetro", "DESC"]], transaction
})

export const buscarUltimaManutencao = (id, transaction = null) => ManutencaoEquipamento.findOne({
  where: { id_equipamento: id }, order: [["data_manutencao", "DESC"], ["id_manutencao", "DESC"]], transaction
})

export const buscarManutencao = (id, idManutencao) => ManutencaoEquipamento.findOne({
  where: { id_manutencao: idManutencao, id_equipamento: id }
})

export const buscarHorimetro = (id, idHorimetro) => HorimetroEquipamento.findOne({
  where: { id_horimetro: idHorimetro, id_equipamento: id }
})

export const criarHorimetro = (dados, transaction) => HorimetroEquipamento.create(dados, { transaction })
export const criarManutencao = (dados, transaction) => ManutencaoEquipamento.create(dados, { transaction })

export async function atualizarHorimetro(id, idHorimetro, dados, transaction) {
  await HorimetroEquipamento.update(dados, { where: { id_horimetro: idHorimetro, id_equipamento: id }, transaction })
  return buscarHorimetro(id, idHorimetro)
}

export async function atualizarManutencao(id, idManutencao, dados, transaction) {
  await ManutencaoEquipamento.update(dados, { where: { id_manutencao: idManutencao, id_equipamento: id }, transaction })
  return buscarManutencao(id, idManutencao)
}
