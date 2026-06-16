import db from "../models/index.js"
import { Op } from "sequelize"

const Saida = db.Saida
const SaidaItem = db.SaidaItem
const Almoxarifado = db.Almoxarifado
const Funcionario = db.Funcionario
const Produtos = db.Produtos 
const Estoque = db.Estoque

const includeCompleto = [
  { model: Almoxarifado, as: "almoxarifadoOrigem" },
  { model: Almoxarifado, as: "almoxarifadoDestino" },
  { model: Funcionario, as: "responsavel" },
  {
    model: SaidaItem,
    as: "itens",
    include: [{ model: Produtos, as: "produtos" }]
  }
]

export function iniciarTransacao() {
  return db.sequelize.transaction()
}

export async function listarTodos(filtros = {}) {
  const where = {}
  const includeResponsavel = { model: Funcionario, as: "responsavel" }
  const includeItens = {
    model: SaidaItem,
    as: "itens",
    include: [{ model: Produtos, as: "produtos" }]
  }

  if (filtros.data) {
    where.data_saida = { [Op.gte]: filtros.data.inicio, [Op.lt]: filtros.data.fim }
  }

  if (filtros.destino) {
    where.cod_almoxarifado_destino = filtros.destino
  }

  if (filtros.responsavel) {
    includeResponsavel.required = true
    includeResponsavel.where = {
      [Op.or]: [
        { id_funcionario: filtros.responsavel },
        { nome: { [Op.like]: `%${filtros.responsavel}%` } }
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

  return await Saida.findAll({
    where,
    include: [
      { model: Almoxarifado, as: "almoxarifadoOrigem" },
      { model: Almoxarifado, as: "almoxarifadoDestino" },
      includeResponsavel,
      includeItens
    ],
    order: [["data_saida", "DESC"]]
  })
}

export async function buscarPorId(id, transaction = null) {
  return await Saida.findByPk(id, {
    include: includeCompleto,
    transaction
  })
}

export async function criar(dados, itens, transaction) {
  return await Saida.create(
    {
      ...dados,
      itens
    },
    {
      include: [{ model: SaidaItem, as: "itens" }],
      transaction
    }
  )
}

export async function atualizar(id, dados, itens, transaction) {
  await Saida.update(dados, {
    where: { id_saida: id },
    transaction
  })

  await SaidaItem.destroy({
    where: { id_saida: id },
    transaction
  })

  await SaidaItem.bulkCreate(
    itens.map(item => ({ id_saida: id, ...item })),
    { transaction }
  )

  return await buscarPorId(id, transaction)
}

export async function excluir(id, transaction) {
  await SaidaItem.destroy({ where: { id_saida: id }, transaction })
  return await Saida.destroy({ where: { id_saida: id }, transaction })
}

export async function buscarAlmoxarifado(id) {
  return await Almoxarifado.findByPk(id)
}

export async function buscarFuncionario(id) {
  return await Funcionario.findByPk(id)
}

export async function buscarProduto(id) {
  return await Produtos.findByPk(id)
}

export async function buscarEstoque(idProduto, codAlmoxarifado, transaction) {
  return await Estoque.findOne({
    where: {
      id_produto: idProduto,
      cod_almoxarifado: codAlmoxarifado
    },
    transaction,
    lock: transaction?.LOCK?.UPDATE
  })
}

export async function criarEstoque(dados, transaction) {
  return await Estoque.create(dados, { transaction })
}

export async function atualizarEstoque(idProduto, codAlmoxarifado, quantidade, transaction) {
  return await Estoque.update(
    { quantidade },
    {
      where: {
        id_produto: idProduto,
        cod_almoxarifado: codAlmoxarifado
      },
      transaction
    }
  )
}
