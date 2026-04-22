import db from "../models/index.js"
import { Op } from "sequelize"

const Fornecedor = db.Fornecedor
const TelefoneFornecedor = db.TelefoneFornecedor
const EnderecoFornecedor = db.EnderecoFornecedor

const includeAll = [
  { model: TelefoneFornecedor, as: "telefones" },
  { model: EnderecoFornecedor, as: "enderecos" }
]

// ──────────────────────────────────────────────────────────────
// Listar com filtros opcionais
//   filtros = { razao_social?, nome_fantasia?, cnpj?, email? }
// Se filtros for {} ou não for passado, retorna todos.
// ──────────────────────────────────────────────────────────────
export async function listarTodos(filtros = {}) {
  const where = {}

  // Busca parcial (substring) — case-insensitive pela collation padrão do MySQL
  if (filtros.razao_social) {
    where.razao_social = { [Op.like]: `%${filtros.razao_social}%` }
  }
  if (filtros.nome_fantasia) {
    where.nome_fantasia = { [Op.like]: `%${filtros.nome_fantasia}%` }
  }
  if (filtros.cnpj) {
    where.cnpj = { [Op.like]: `%${filtros.cnpj}%` }
  }
  if (filtros.email) {
    where.email = { [Op.like]: `%${filtros.email}%` }
  }

  return await Fornecedor.findAll({
    where,
    include: includeAll,
    order: [["razao_social", "ASC"]]
  })
}

// Buscar por ID
export async function buscarPorId(id) {
  return await Fornecedor.findByPk(id, { include: includeAll })
}

// Buscar por CNPJ (exato — usado em validação de duplicidade)
export async function buscarPorCnpj(cnpj) {
  return await Fornecedor.findOne({
    where: { cnpj },
    include: includeAll
  })
}

// Buscar por Email (exato — usado em validação de duplicidade)
export async function buscarPorEmail(email) {
  return await Fornecedor.findOne({ where: { email } })
}

// Cadastrar fornecedor (com telefones e endereços)
export async function criar(dados) {
  return await Fornecedor.create(dados, {
    include: [
      { model: TelefoneFornecedor, as: "telefones" },
      { model: EnderecoFornecedor, as: "enderecos" }
    ]
  })
}

// Atualizar fornecedor
export async function atualizar(id, dados) {
  await Fornecedor.update(dados, { where: { id_fornecedor: id } })
  return await buscarPorId(id)
}

// Substituir telefones
export async function substituirTelefones(idFornecedor, telefones) {
  await TelefoneFornecedor.destroy({ where: { id_fornecedor: idFornecedor } })
  if (telefones && telefones.length > 0) {
    const registros = telefones.map(t => ({
      id_fornecedor: idFornecedor,
      telefone: t
    }))
    await TelefoneFornecedor.bulkCreate(registros)
  }
}

// Substituir endereços
export async function substituirEnderecos(idFornecedor, enderecos) {
  await EnderecoFornecedor.destroy({ where: { id_fornecedor: idFornecedor } })
  if (enderecos && enderecos.length > 0) {
    const registros = enderecos.map(e => ({
      id_fornecedor: idFornecedor,
      ...e
    }))
    await EnderecoFornecedor.bulkCreate(registros)
  }
}

// Inativar (soft delete)
export async function inativar(id) {
  return await Fornecedor.update({ ativo: 0 }, { where: { id_fornecedor: id } })
}
