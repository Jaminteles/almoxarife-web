import db from "../models/index.js"
import { Op } from "sequelize"

const Compra = db.Compra
const ItemCompra = db.ItemCompra
const Fornecedor = db.Fornecedor
const Almoxarifado = db.Almoxarifado
const Produto = db.Produto

const includeCompleto = [
  { model: Fornecedor, as: "fornecedor" },
  { model: Almoxarifado, as: "almoxarifadoDestino" },
  {
    model: ItemCompra,
    as: "itens",
    include: [{ model: Produto, as: "produto" }]
  }
]

//export function iniciarTransacao() {
//  return db.sequelize.transaction()
//}

export async function listarTodos(filtros = {}) {
  const where = {}
  const includeFornecedor = { model: Fornecedor, as: "fornecedor" }
  const includeItens = {
    model: ItemCompra,
    as: "itens",
    include: [{ model: Produto, as: "produto" }]
  }

  if (filtros.status) {
    where.status = filtros.status
  }

  if (filtros.numero_nota_fiscal) {
    where.numero_nota_fiscal = filtros.numero_nota_fiscal
  }

  if (filtros.data) {
    where.data_compra = { [Op.gte]: filtros.data.inicio, [Op.lt]: filtros.data.fim }
  }

  if (filtros.fornecedor) {
    includeFornecedor.required = true
    includeFornecedor.where = {
      [Op.or]: [
        { id_fornecedor: filtros.fornecedor },
        { nome_fantasia: { [Op.like]: `%${filtros.fornecedor}%` } },
        { razao_social: { [Op.like]: `%${filtros.fornecedor}%` } }
      ]
    }
  }

  if (filtros.produto) {
    includeItens.required = true
    if (/^\d+$/.test(String(filtros.produto))) {
      includeItens.where = { id_produto: filtros.produto }
    } else {
      includeItens.include[0].required = true
      includeItens.include[0].where = { nome: { [Op.like]: `%${filtros.produto}%` } }
    }
  }

  return await Compra.findAll({
    where,
    include: [
      includeFornecedor,
      { model: Almoxarifado, as: "almoxarifadoDestino" },
      includeItens
    ],
    order: [["data_compra", "DESC"]]
  })
}

export async function buscarPorId(id, transaction = null) {
  return await Compra.findByPk(id, {
    include: includeCompleto,
    transaction
  })
}

export async function buscarPorNotaFiscal(numeroNota, idFornecedor, transaction = null) {
  return await Compra.findOne({
    where: { numero_nota_fiscal: numeroNota, id_fornecedor: idFornecedor },
    transaction
  })
}

export async function criar(dados, itens, transaction) {
  return await Compra.create(
    {
      ...dados,
      itens
    },
    {
      include: [{ model: ItemCompra, as: "itens" }],
      transaction
    }
  )
}

export async function atualizar(id, dados, itens, transaction) {
  await Compra.update(dados, {
    where: { id_compra: id },
    transaction
  })

  await ItemCompra.destroy({
    where: { id_compra: id },
    transaction
  })

  await ItemCompra.bulkCreate(
    itens.map(item => ({ id_compra: id, ...item })),
    { transaction }
  )

  return await buscarPorId(id, transaction)
}

export async function excluir(id, transaction) {
  await ItemCompra.destroy({ where: { id_compra: id }, transaction })
  return await Compra.destroy({ where: { id_compra: id }, transaction })
}

export async function buscarFornecedor(id) {
  return await Fornecedor.findByPk(id)
}

export async function buscarAlmoxarifado(id) {
  return await Almoxarifado.findByPk(id)
}

export async function buscarProduto(id) {
  return await Produto.findByPk(id)
}
