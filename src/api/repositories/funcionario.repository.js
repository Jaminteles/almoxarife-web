/**
 * funcionario.repository.js — Camada de Acesso a Dados
 */

import db from "../models/index.js"

const Funcionario = db.Funcionario
const UsuarioSistema = db.UsuarioSistema

const includeRelacionamentos = [
  { model: db.Cargo, as: "cargo" },
  {
    model: db.UsuarioSistema,
    as: "usuario",
    attributes: { exclude: ["password_hash"] }
  }
]

// ═══ LEITURA ═══

/**
 * LISTA SOMENTE FUNCIONÁRIOS ATIVOS
 *
 * O campo se chama is_active (TINYINT: 1 = ativo, 0 = inativo).
 * Note que é diferente do fornecedor que usa `ativo`.
 * Essa inconsistência vem do schema original do banco.
 */
export async function listarTodos() {
  return await Funcionario.findAll({
    where: { is_active: 1 },
    include: includeRelacionamentos,
    order: [["nome", "ASC"]]
  })
}

export async function buscarPorId(id) {
  return await Funcionario.findByPk(id, {
    include: includeRelacionamentos
  })
}

// Sem filtro de ativo — usado p/ verificar duplicidade de CPF
export async function buscarPorCpf(cpf) {
  return await Funcionario.findOne({
    where: { cpf },
    include: includeRelacionamentos
  })
}

export async function buscarUsuarioPorEmail(email) {
  return await UsuarioSistema.findOne({
    where: { email },
    include: [{ model: db.Funcionario, as: "funcionario" }]
  })
}

// ═══ ESCRITA ═══

export async function criar(dados) {
  return await Funcionario.create(dados)
}

export async function criarUsuario(dados) {
  return await UsuarioSistema.create(dados)
}

export async function atualizar(id, dados) {
  await Funcionario.update(dados, { where: { id_funcionario: id } })
  return await buscarPorId(id)
}

export async function atualizarUsuario(idFuncionario, dados) {
  await UsuarioSistema.update(dados, { where: { id_funcionario: idFuncionario } })
  return await UsuarioSistema.findByPk(idFuncionario)
}

// ═══ INATIVAÇÃO ═══

export async function inativar(id) {
  return await Funcionario.update(
    { is_active: 0 },
    { where: { id_funcionario: id } }
  )
}

/**
 * Verifica se o funcionário tem compras pendentes como responsável.
 * Conta registros na tabela Compra com status 'PENDENTE'.
 */
export async function verificarPendencias(idFuncionario) {
  const [resultado] = await db.sequelize.query(
    `SELECT COUNT(*) AS total_pendencias
     FROM Compra
     WHERE id_funcionario_comprador = :id
       AND status_pedido = 'PENDENTE'`,
    {
      replacements: { id: idFuncionario },
      type: db.Sequelize.QueryTypes.SELECT
    }
  )
  return resultado?.total_pendencias || 0
}
