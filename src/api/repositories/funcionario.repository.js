import db from "../models/index.js"
import { Op } from "sequelize"

const Funcionario = db.Funcionario
const UsuarioSistema = db.UsuarioSistema

/**
 * Lista todos os funcionários ativos com joins de Cargo e UsuarioSistema.
 * @param {{ nome?: string, cpf?: string, email?: string, cargo?: string }} filtros
 */
export async function listarTodos(filtros = {}) {
  const where = { is_active: 1 }

  if (filtros.nome) {
    where.nome = { [Op.like]: `%${filtros.nome}%` }
  }
  if (filtros.cpf) {
    where.cpf = { [Op.like]: `%${filtros.cpf}%` }
  }
  if (filtros.email) {
    where.email = { [Op.like]: `%${filtros.email}%` }
  }

  const includeCargo = {
    model: db.Cargo,
    as: "cargo"
  }
  if (filtros.cargo) {
    includeCargo.where = { nome_cargo: { [Op.like]: `%${filtros.cargo}%` } }
    includeCargo.required = true
  }

  const includeUsuario = {
    model: UsuarioSistema,
    as: "usuario",
    attributes: { exclude: ["password_hash"] }
  }

  return await Funcionario.findAll({
    where,
    include: [includeCargo, includeUsuario],
    order: [["nome", "ASC"]]
  })
}

/**
 * Busca funcionário pelo ID com joins de Cargo e UsuarioSistema.
 * @param {string} id UUID do funcionário
 */
export async function buscarPorId(id) {
  return await Funcionario.findByPk(id, {
    include: [
      { model: db.Cargo, as: "cargo" },
      { model: UsuarioSistema, as: "usuario", attributes: { exclude: ["password_hash"] } }
    ]
  })
}

/**
 * Busca funcionário pelo CPF (somente dígitos).
 * @param {string} cpf CPF com 11 dígitos
 */
export async function buscarPorCpf(cpf) {
  return await Funcionario.findOne({
    where: { cpf },
    include: [
      { model: db.Cargo, as: "cargo" },
      { model: UsuarioSistema, as: "usuario", attributes: { exclude: ["password_hash"] } }
    ]
  })
}

/**
 * Busca funcionário pelo email de contato. Usado para checar duplicidade.
 * @param {string} email
 */
export async function buscarPorEmail(email) {
  return await Funcionario.findOne({ where: { email } })
}

/**
 * Cria um novo funcionário.
 * @param {object} dados
 */
export async function criar(dados) {
  return await Funcionario.create(dados)
}

/**
 * Cria um usuário de sistema vinculado ao funcionário.
 * @param {{ id_funcionario: string, email: string, password_hash: string, access_level: string }} dados
 */
export async function criarUsuario(dados) {
  return await UsuarioSistema.create(dados)
}

/**
 * Busca usuário de sistema pelo email de credencial.
 * @param {string} email
 */
export async function buscarUsuarioPorEmail(email) {
  return await UsuarioSistema.findOne({ where: { email } })
}

/**
 * Atualiza dados do funcionário.
 * @param {string} id UUID do funcionário
 * @param {object} dados Campos a atualizar
 */
export async function atualizar(id, dados) {
  return await Funcionario.update(dados, {
    where: { id_funcionario: id }
  })
}

/**
 * Atualiza dados do usuário de sistema vinculado ao funcionário.
 * @param {string} id UUID do funcionário
 * @param {{ password_hash?: string, access_level?: string }} dados
 */
export async function atualizarUsuario(id, dados) {
  return await UsuarioSistema.update(dados, {
    where: { id_funcionario: id }
  })
}

/**
 * Inativa o funcionário (soft delete: is_active = 0).
 * @param {string} id UUID do funcionário
 */
export async function inativar(id) {
  return await Funcionario.update(
    { is_active: 0 },
    { where: { id_funcionario: id } }
  )
}
