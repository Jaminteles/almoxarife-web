import db from "../models/index.js"
import { Op } from "sequelize"

const Fornecedor = db.Fornecedor
const TelefoneFornecedor = db.TelefoneFornecedor
const EnderecoFornecedor = db.EnderecoFornecedor

const includeAll = [
  { model: TelefoneFornecedor, as: "telefones" },
  { model: EnderecoFornecedor, as: "enderecos" }
]

/**
 * Lista todos os fornecedores ativos com telefones e endereços.
 * @param {{ razao_social?: string, nome_fantasia?: string, cnpj?: string, email?: string }} filtros
 */
export async function listarTodos(filtros = {}) {
  const where = { ativo: 1 }

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

/**
 * Busca fornecedor pelo ID, incluindo telefones e endereços.
 * @param {number} id
 */
export async function buscarPorId(id) {
  return await Fornecedor.findByPk(id, { include: includeAll })
}

/**
 * Busca fornecedor pelo CNPJ exato. Usado na validação de duplicidade.
 * @param {string} cnpj CNPJ com 14 dígitos
 */
export async function buscarPorCnpj(cnpj) {
  return await Fornecedor.findOne({
    where: { cnpj },
    include: includeAll
  })
}

/**
 * Busca fornecedor pelo email exato. Usado na validação de duplicidade.
 * @param {string} email
 */
export async function buscarPorEmail(email) {
  return await Fornecedor.findOne({ where: { email } })
}

/**
 * Cria um fornecedor com telefones e endereços via associações Sequelize.
 * @param {object} dados Dados do fornecedor com arrays `telefones` e `enderecos`
 */
export async function criar(dados) {
  return await Fornecedor.create(dados, {
    include: [
      { model: TelefoneFornecedor, as: "telefones" },
      { model: EnderecoFornecedor, as: "enderecos" }
    ]
  })
}

/**
 * Atualiza os dados principais do fornecedor.
 * @param {number} id
 * @param {object} dados
 */
export async function atualizar(id, dados) {
  await Fornecedor.update(dados, { where: { id_fornecedor: id } })
  return await buscarPorId(id)
}

/**
 * Substitui todos os telefones do fornecedor (destroy + bulkCreate).
 * @param {number} idFornecedor
 * @param {string[]} telefones
 */
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

/**
 * Substitui todos os endereços do fornecedor (destroy + bulkCreate).
 * @param {number} idFornecedor
 * @param {object[]} enderecos
 */
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

/**
 * Inativa o fornecedor (soft delete: ativo = 0).
 * @param {number} id
 */
export async function inativar(id) {
  const fornecedor = await Fornecedor.findByPk(id)
  if (fornecedor && fornecedor.ativo === 0) {
    throw new Error("Fornecedor já está inativo")
  }
  return await Fornecedor.update({ ativo: 0 }, { where: { id_fornecedor: id } })
}
