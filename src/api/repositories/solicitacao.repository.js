import db from "../models/index.js"
import { Op } from "sequelize"

const SolicitacaoCadastro = db.SolicitacaoCadastro

export function iniciarTransacao() {
  return db.sequelize.transaction()
}

export async function criar(dados, transaction = null) {
  return await SolicitacaoCadastro.create(dados, { transaction })
}

// Lista as solicitações (sem o hash de senha), opcionalmente filtrando por status.
export async function listar(status) {
  const where = {}
  if (status) where.status = status
  return await SolicitacaoCadastro.findAll({
    where,
    attributes: { exclude: ["password_hash"] },
    order: [["data_solicitacao", "DESC"]]
  })
}

export async function buscarPorId(id, transaction = null) {
  return await SolicitacaoCadastro.findByPk(id, { transaction })
}

// Já existe uma solicitação PENDENTE com este e-mail ou CPF?
export async function existePendentePorEmailOuCpf(email, cpf) {
  return await SolicitacaoCadastro.findOne({
    where: { status: "PENDENTE", [Op.or]: [{ email }, { cpf }] }
  })
}

export async function atualizarDecisao(id, dados, transaction = null) {
  return await SolicitacaoCadastro.update(dados, {
    where: { id_solicitacao: id },
    transaction
  })
}
