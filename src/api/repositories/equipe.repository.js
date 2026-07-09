import db from "../models/index.js"
import { Op } from "sequelize"

const Equipe = db.Equipe
const Funcionario = db.Funcionario

// Quem chama é responsável por commit()/rollback() (mesmo padrão dos demais).
export function iniciarTransacao() {
  return db.sequelize.transaction()
}

// Lista as equipes ATIVAS, já com os funcionários de cada uma.
export async function listarTodos(filtros = {}) {
  const where = { is_active: 1 }
  if (filtros.nome) {
    where.nome = { [Op.like]: `%${filtros.nome}%` }
  }

  return await Equipe.findAll({
    where,
    include: [
      {
        model: Funcionario,
        as: "funcionarios",
        attributes: ["id_funcionario", "nome"],
        required: false,
        where: { is_active: 1 }
      }
    ],
    order: [["nome", "ASC"]]
  })
}

// Lista enxuta (id + nome) para selects de outros módulos (ex.: Saídas).
export async function listarParaSelecao() {
  return await Equipe.findAll({
    where: { is_active: 1 },
    attributes: ["id_equipe", "nome"],
    order: [["nome", "ASC"]]
  })
}

export async function buscarPorId(id) {
  return await Equipe.findByPk(id, {
    include: [
      {
        model: Funcionario,
        as: "funcionarios",
        attributes: ["id_funcionario", "nome"],
        required: false,
        where: { is_active: 1 }
      }
    ]
  })
}

export async function criar(dados, transaction = null) {
  return await Equipe.create(dados, { transaction })
}

export async function atualizar(id, dados, transaction = null) {
  return await Equipe.update(dados, {
    where: { id_equipe: id },
    transaction
  })
}

export async function inativar(id, transaction = null) {
  return await Equipe.update(
    { is_active: 0 },
    { where: { id_equipe: id }, transaction }
  )
}

// ── Vínculo dos funcionários com a equipe ──

// Tira TODOS os funcionários da equipe (usado antes de reatribuir na edição
// e ao inativar a equipe).
export async function limparMembros(idEquipe, transaction = null) {
  return await Funcionario.update(
    { id_equipe: null },
    { where: { id_equipe: idEquipe }, transaction }
  )
}

// Coloca a lista de funcionários informada NA equipe. Como um funcionário
// pertence a no máximo uma equipe, isso também os remove de qualquer outra.
export async function definirMembros(idEquipe, idsFuncionarios, transaction = null) {
  if (!idsFuncionarios || idsFuncionarios.length === 0) return
  return await Funcionario.update(
    { id_equipe: idEquipe },
    { where: { id_funcionario: { [Op.in]: idsFuncionarios } }, transaction }
  )
}
