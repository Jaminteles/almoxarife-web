import db from "../models/index.js"
import { Op } from "sequelize"

const Funcionario = db.Funcionario
const UsuarioSistema = db.UsuarioSistema

// ──────────────────────────────────────────────────────────────
// Abre uma transação do Sequelize.
// Mesmo padrão usado em saida.repository.js — quem chama é
// responsável por dar commit()/rollback().
// ──────────────────────────────────────────────────────────────
export function iniciarTransacao() {
  return db.sequelize.transaction()
}

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

// Lista enxuta para preencher selects em outros módulos (Compras, Saídas).
// Devolve apenas id + nome dos funcionários ativos — sem dados sensíveis
// (CPF, e-mail, credencial) — para poder ser exposta a qualquer usuário
// autenticado, mesmo sem acesso ao módulo de Funcionários.
export async function listarParaSelecao() {
  return await Funcionario.findAll({
    where: { is_active: 1 },
    attributes: ["id_funcionario", "nome"],
    order: [["nome", "ASC"]]
  })
}

// Buscar por ID
export async function buscarPorId(id) {
  return await Funcionario.findByPk(id, {
    include: [
      { model: db.Cargo, as: "cargo" },
      { model: UsuarioSistema, as: "usuario", attributes: { exclude: ["password_hash"] } },
      { model: db.Almoxarifado, as: "almoxarifado", attributes: ["cod_almoxarifado", "nome"] }
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

// Buscar por e-mail (e-mail é dado de contato do Funcionario)
export async function buscarPorEmail(email) {
  return await Funcionario.findOne({ where: { email } })
}

// ──────────────────────────────────────────────────────────────
// Escritas — todas aceitam um `transaction` OPCIONAL.
// Sem transação (null), o comportamento é idêntico ao anterior.
// ──────────────────────────────────────────────────────────────

// Criar funcionário
export async function criar(dados, transaction = null) {
  return await Funcionario.create(dados, { transaction })
}

// Criar usuário do sistema vinculado ao funcionário
export async function criarUsuario(dados, transaction = null) {
  return await UsuarioSistema.create(dados, { transaction })
}

// Atualizar funcionário
// Obs.: retorna o resultado do update ([affectedCount]). Não re-lê aqui de
// propósito — uma leitura com includes dentro de uma transação aberta poderia
// não enxergar a alteração (ou travar). Quem precisa do registro atualizado
// chama buscarPorId APÓS o commit.
export async function atualizar(id, dados, transaction = null) {
  return await Funcionario.update(dados, {
    where: { id_funcionario: id },
    transaction
  })
}

// Atualizar usuário do sistema
export async function atualizarUsuario(idFuncionario, dados, transaction = null) {
  await UsuarioSistema.update(dados, {
    where: { id_funcionario: idFuncionario },
    transaction
  })
  // A leitura usa a MESMA transação, então enxerga o que acabou de ser gravado.
  return await UsuarioSistema.findByPk(idFuncionario, { transaction })
}

// Verificar se um funcionário JÁ TEM credencial de acesso
export async function buscarUsuarioPorIdFuncionario(idFuncionario) {
  return await UsuarioSistema.findByPk(idFuncionario)
}

// Inativar (soft delete)
export async function inativar(id, transaction = null) {
  const funcionario = await Funcionario.findByPk(id, { transaction })
  if (funcionario && funcionario.is_active === 0) {
    throw new Error("Funcionário já está inativo")
  }
  return await Funcionario.update(
    { is_active: 0 },
    { where: { id_funcionario: id }, transaction }
  )
}
