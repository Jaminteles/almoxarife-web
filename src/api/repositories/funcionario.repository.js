import db from "../models/index.js"
import { Op } from "sequelize"
 
const Funcionario = db.Funcionario
const UsuarioSistema = db.UsuarioSistema
 
// ──────────────────────────────────────────────────────────────
// Listar com filtros opcionais
//   filtros = { nome?, cpf?, email?, cargo? }
// - nome/cpf/email → filtram na própria tabela Funcionarios (WHERE)
// - cargo          → filtra na tabela Cargos (JOIN)
// ──────────────────────────────────────────────────────────────
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
 
// Buscar por ID
export async function buscarPorId(id) {
  return await Funcionario.findByPk(id, {
    include: [
      { model: db.Cargo, as: "cargo" },
      { model: UsuarioSistema, as: "usuario", attributes: { exclude: ["password_hash"] } }
    ]
  })
}
 
// Buscar por CPF
export async function buscarPorCpf(cpf) {
  return await Funcionario.findOne({
    where: { cpf },
    include: [
      { model: db.Cargo, as: "cargo" },
      { model: UsuarioSistema, as: "usuario", attributes: { exclude: ["password_hash"] } }
    ]
  })
}
 
export async function buscarPorEmail(email) {
  return await Funcionario.findOne({ where: { email } })
}
// ─────────────────────────────────────────────────────────────
 
// Criar funcionário
export async function criar(dados) {
  return await Funcionario.create(dados)
}
 
// Criar usuário do sistema vinculado ao funcionário
export async function criarUsuario(dados) {
  return await UsuarioSistema.create(dados)
}
 
// Atualizar funcionário
export async function atualizar(id, dados) {
  await Funcionario.update(dados, { where: { id_funcionario: id } })
  return await buscarPorId(id)
}
 
// Atualizar usuário do sistema
export async function atualizarUsuario(idFuncionario, dados) {
  await UsuarioSistema.update(dados, { where: { id_funcionario: idFuncionario } })
  return await UsuarioSistema.findByPk(idFuncionario)
}
 
// Verificar se um funcionário JÁ TEM credencial de acesso
export async function buscarUsuarioPorIdFuncionario(idFuncionario) {
  return await UsuarioSistema.findByPk(idFuncionario)
}
 
// Inativar (soft delete)
export async function inativar(id) {
  const funcionario = await Funcionario.findByPk(id)
  if (funcionario && funcionario.is_active === 0) {
    throw new Error("Funcionário já está inativo")
  }
  return await Funcionario.update(
    { is_active: 0 },
    { where: { id_funcionario: id } }
  )
}
