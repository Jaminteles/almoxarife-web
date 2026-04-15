/**
 * Repository de Funcionário - Usando Sequelize ORM
*/
import db from "../models/index.js"

// Pega o model do Funcionário do db
const Funcionario = db.Funcionario

// Listar todos
export async function listarTodos() {
  return await Funcionario.findAll()
}

// Buscar por ID
export async function buscarPorId(id) {
  return await Funcionario.findByPk(id)
}

// Criar novo
export async function criar(dados) {
  return await Funcionario.create(dados)
}

// Atualizar
export async function atualizar(id, dados) {
  await Funcionario.update(dados, {
    where: { id }
  })
  return await Funcionario.findByPk(id)
}

// Remover
export async function remover(id) {
  return await Funcionario.destroy({
    where: { id }
  })
}

// Buscar por CPF
export async function buscarPorCpf(cpf) {
  return await Funcionario.findOne({
    where: { cpf }
  })
}

// Buscar por Login
export async function buscarPorLogin(login) {
  return await Funcionario.findOne({
    where: { login }
  })
}