import db from "../models/index.js"

const Fornecedor = db.Fornecedor
const TelefoneFornecedor = db.TelefoneFornecedor
const EnderecoFornecedor = db.EnderecoFornecedor

const includeAll = [
  { model: TelefoneFornecedor, as: "telefones" },
  { model: EnderecoFornecedor, as: "enderecos" }
]

// Listar todos
export async function listarTodos() {
  return await Fornecedor.findAll({
    include: includeAll,
    order: [["razao_social", "ASC"]]
  })
}

// Buscar por ID
export async function buscarPorId(id) {
  return await Fornecedor.findByPk(id, { include: includeAll })
}

// Buscar por CNPJ
export async function buscarPorCnpj(cnpj) {
  return await Fornecedor.findOne({
    where: { cnpj },
    include: includeAll
  })
}

// Buscar por Email
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
