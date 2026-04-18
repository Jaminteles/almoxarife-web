/**
 * fornecedor.repository.js — Camada de Acesso a Dados
 */

import db from "../models/index.js"

const Fornecedor = db.Fornecedor
const TelefoneFornecedor = db.TelefoneFornecedor
const EnderecoFornecedor = db.EnderecoFornecedor

const includeAll = [
  { model: TelefoneFornecedor, as: "telefones" },
  { model: EnderecoFornecedor, as: "enderecos" }
]

// ═══ LEITURA ═══

/**
 * LISTA SOMENTE FORNECEDORES ATIVOS
 *
 * O where: { ativo: 1 } é o que faz o soft delete funcionar de verdade.
 * Sem ele, o UPDATE ativo = 0 muda o campo no banco, mas o registro
 * continua aparecendo na tela — o usuário acha que não funcionou.
 */
export async function listarTodos() {
  return await Fornecedor.findAll({
    where: { ativo: 1 },
    include: includeAll,
    order: [["razao_social", "ASC"]]
  })
}

export async function buscarPorId(id) {
  return await Fornecedor.findByPk(id, { include: includeAll })
}

// Sem filtro de ativo — usado para verificar duplicidade
export async function buscarPorCnpj(cnpj) {
  return await Fornecedor.findOne({
    where: { cnpj },
    include: includeAll
  })
}

// Sem filtro de ativo — usado para verificar duplicidade
export async function buscarPorEmail(email) {
  return await Fornecedor.findOne({ where: { email } })
}

// ═══ ESCRITA ═══

export async function criar(dados) {
  return await Fornecedor.create(dados, {
    include: [
      { model: TelefoneFornecedor, as: "telefones" },
      { model: EnderecoFornecedor, as: "enderecos" }
    ]
  })
}

export async function atualizar(id, dados) {
  await Fornecedor.update(dados, { where: { id_fornecedor: id } })
  return await buscarPorId(id)
}

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

// ═══ INATIVAÇÃO ═══

export async function inativar(id) {
  return await Fornecedor.update(
    { ativo: 0 },
    { where: { id_fornecedor: id } }
  )
}

export async function verificarPedidosPendentes(idFornecedor) {
  const [resultado] = await db.sequelize.query(
    `SELECT COUNT(*) AS total_pendentes
     FROM Compra
     WHERE id_fornecedor = :id
       AND status_pedido = 'PENDENTE'`,
    {
      replacements: { id: idFornecedor },
      type: db.Sequelize.QueryTypes.SELECT
    }
  )
  return resultado?.total_pendentes || 0
}
