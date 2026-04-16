import db from "../models/index.js"

const Funcionario = db.Funcionario
const UsuarioSistema = db.UsuarioSistema

// Listar todos (com cargo e usuario)
export async function listarTodos() {
  return await Funcionario.findAll({
    include: [
      { model: db.Cargo, as: "cargo" },
      { model: db.UsuarioSistema, as: "usuario", attributes: { exclude: ["password_hash"] } }
    ],
    order: [["nome", "ASC"]]
  })
}

// Buscar por ID
export async function buscarPorId(id) {
  return await Funcionario.findByPk(id, {
    include: [
      { model: db.Cargo, as: "cargo" },
      { model: db.UsuarioSistema, as: "usuario", attributes: { exclude: ["password_hash"] } }
    ]
  })
}

// Buscar por CPF
export async function buscarPorCpf(cpf) {
  return await Funcionario.findOne({
    where: { cpf },
    include: [
      { model: db.Cargo, as: "cargo" },
      { model: db.UsuarioSistema, as: "usuario", attributes: { exclude: ["password_hash"] } }
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
  return await Funcionario.update({ is_active: 0 }, { where: { id_funcionario: id } })
}

// Buscar usuário por email
export async function buscarUsuarioPorEmail(email) {
  return await UsuarioSistema.findOne({
    where: { email },
    include: [{ model: db.Funcionario, as: "funcionario" }]
  })
}
