import db from "../models/index.js";
import { Op } from "sequelize";

const { Servico, ServicoItem, Fornecedor, Funcionario, Almoxarifado, Produto } = db;
const includeCompleto = [
  { model: Fornecedor, as: "fornecedor" },
  { model: Funcionario, as: "responsavel" },
  { model: Almoxarifado, as: "almoxarifado" },
  { model: ServicoItem, as: "itens", include: [{ model: Produto, as: "produto" }] }
];

export async function listarTodos(filtros = {}) {
  const where = {};
  const fornecedor = { model: Fornecedor, as: "fornecedor" };
  const almoxarifado = { model: Almoxarifado, as: "almoxarifado" };
  const itens = { model: ServicoItem, as: "itens", include: [{ model: Produto, as: "produto" }] };
  if (filtros.data) where.data_servico = { [Op.gte]: filtros.data.inicio, [Op.lt]: filtros.data.fim };
  if (filtros.cod_almoxarifado) where.cod_almoxarifado = filtros.cod_almoxarifado;
  if (filtros.numero_nota_fiscal) where.numero_nota_fiscal = { [Op.like]: `%${filtros.numero_nota_fiscal}%` };
  if (filtros.aplicacao) where.aplicacao = { [Op.like]: `%${filtros.aplicacao}%` };
  if (filtros.fornecedor) {
    fornecedor.required = true;
    fornecedor.where = { [Op.or]: [
      { id_fornecedor: filtros.fornecedor },
      { razao_social: { [Op.like]: `%${filtros.fornecedor}%` } },
      { nome_fantasia: { [Op.like]: `%${filtros.fornecedor}%` } }
    ] };
  }
  if (filtros.produto) {
    itens.required = true;
    itens.where = { id_produto: filtros.produto };
  }
  return Servico.findAll({ where, include: [fornecedor, { model: Funcionario, as: "responsavel" }, almoxarifado, itens], order: [["data_servico", "DESC"]] });
}
export const buscarPorId = (id, transaction = null) => Servico.findByPk(id, { include: includeCompleto, transaction });
export const criar = (dados, itens, transaction) => Servico.create({ ...dados, itens }, { include: [{ model: ServicoItem, as: "itens" }], transaction });
export async function atualizar(id, dados, itens, transaction) {
  await Servico.update(dados, { where: { id_servico: id }, transaction });
  await ServicoItem.destroy({ where: { id_servico: id }, transaction });
  await ServicoItem.bulkCreate(itens.map((item) => ({ id_servico: id, ...item })), { transaction });
  return buscarPorId(id, transaction);
}
export async function excluir(id, transaction) {
  await ServicoItem.destroy({ where: { id_servico: id }, transaction });
  return Servico.destroy({ where: { id_servico: id }, transaction });
}
export const buscarFornecedor = (id) => Fornecedor.findByPk(id);
export const buscarFuncionario = (id) => Funcionario.findByPk(id);
export const buscarProduto = (id) => Produto.findByPk(id);
export const buscarAlmoxarifado = (id) => Almoxarifado.findByPk(id);
