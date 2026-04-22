import db from "../models/index.js"
import { Op } from "sequelize"

const Funcionario = db.Funcionario
const UsuarioSistema = db.UsuarioSistema

// ──────────────────────────────────────────────────────────────
// Listar com filtros opcionais
//   filtros = { nome?, cpf?, email?, cargo? }
// - nome/cpf  → filtram na própria tabela Funcionarios (WHERE)
// - email     → filtra na tabela Usuarios_Sistema  (JOIN)
// - cargo     → filtra na tabela Cargos            (JOIN)
// ──────────────────────────────────────────────────────────────
export async function listarTodos(filtros = {}) {
  const where = { is_active: 1 }; // Filtrar apenas funcionários ativos

  if (filtros.nome) {
    where.nome = { [Op.like]: `%${filtros.nome}%` }
  }
  if (filtros.cpf) {
    where.cpf = { [Op.like]: `%${filtros.cpf}%` }
  }

  // Include do cargo — INNER JOIN apenas quando há filtro
  const includeCargo = {
    model: db.Cargo,
    as: "cargo"
  }
  if (filtros.cargo) {
    includeCargo.where = { nome_cargo: { [Op.like]: `%${filtros.cargo}%` } }
    includeCargo.required = true // força INNER JOIN p/ filtrar
  }

  // Include do usuário — INNER JOIN apenas quando há filtro por email
  const includeUsuario = {
    model: UsuarioSistema,
    as: "usuario",
    attributes: { exclude: ["password_hash"] }
  }
  if (filtros.email) {
    includeUsuario.where = { email: { [Op.like]: `%${filtros.email}%` } }
    includeUsuario.required = true // força INNER JOIN p/ filtrar
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

// Inativar (soft delete)
export async function inativar(id) {
  const funcionario = await Funcionario.findByPk(id)
  if (funcionario && funcionario.is_active === 0) {
    throw new Error("Funcionário já está inativo")
  }
  return await Funcionario.update({ is_active: 0 }, { where: { id_funcionario: id } })
}

// Buscar usuário por email
export async function buscarUsuarioPorEmail(email) {
  return await UsuarioSistema.findOne({
    where: { email },
    include: [{ model: db.Funcionario, as: "funcionario" }]
  })
}
