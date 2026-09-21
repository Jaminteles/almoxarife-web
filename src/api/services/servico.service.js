import * as repo from "../repositories/servico.repository.js";
import db from "../models/index.js";
import { assertAcessoAlmoxarifado } from "../utils/escopo.js";

const dataLocal = (valor) => {
  const [anoStr, mesStr, diaStr] = String(valor).split("-");
  const ano = Number(anoStr), mes = Number(mesStr), dia = Number(diaStr);
  const data = new Date(ano, mes - 1, dia);
  if (!anoStr || !mesStr || !diaStr || Number.isNaN(data.getTime()) || data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) throw new Error("Data do serviço inválida");
  return data;
};
const normalizarItens = (itens) => {
  if (!Array.isArray(itens) || !itens.length) throw new Error("Informe ao menos um produto");
  const agrupados = new Map();
  for (const item of itens) {
    const id_produto = Number(item.id_produto), quantidade = Number(item.quantidade), valor_unitario = Number(item.valor_unitario);
    if (!id_produto || !Number.isFinite(quantidade) || !Number.isFinite(valor_unitario) || quantidade <= 0 || valor_unitario < 0) throw new Error("Cada item deve ter produto, quantidade e valor válidos");
    const atual = agrupados.get(id_produto) || { quantidade: 0, valor_unitario };
    agrupados.set(id_produto, { quantidade: atual.quantidade + quantidade, valor_unitario });
  }
  return [...agrupados].map(([id_produto, item]) => ({ id_produto, ...item }));
};
const montarDados = (dados, itens) => {
  if (!dados.id_fornecedor || !dados.id_funcionario_responsavel || !dados.cod_almoxarifado || !dados.data_servico || !String(dados.numero_nota_fiscal || "").trim() || !String(dados.aplicacao || "").trim()) throw new Error("Fornecedor, responsável, almoxarifado, data, nota fiscal e aplicação são obrigatórios");
  return {
    id_fornecedor: Number(dados.id_fornecedor), id_funcionario_responsavel: String(dados.id_funcionario_responsavel).trim(), cod_almoxarifado: Number(dados.cod_almoxarifado), data_servico: dataLocal(dados.data_servico),
    numero_nota_fiscal: String(dados.numero_nota_fiscal).trim(), aplicacao: String(dados.aplicacao).trim(), observacao: String(dados.observacao || "").trim() || null,
    valor_total: itens.reduce((total, item) => total + item.quantidade * item.valor_unitario, 0)
  };
};
const validarReferencias = async (dados, itens) => {
  const fornecedor = await repo.buscarFornecedor(dados.id_fornecedor);
  if (!fornecedor || fornecedor.ativo === 0) throw new Error("Fornecedor não encontrado");
  const responsavel = await repo.buscarFuncionario(dados.id_funcionario_responsavel);
  if (!responsavel || responsavel.is_active === 0) throw new Error("Responsável não encontrado");
  const almoxarifado = await repo.buscarAlmoxarifado(dados.cod_almoxarifado);
  if (!almoxarifado || almoxarifado.ativo === 0) throw new Error("Almoxarifado não encontrado");
  for (const item of itens) { const produto = await repo.buscarProduto(item.id_produto); if (!produto || produto.ativo === 0) throw new Error("Produto informado não está cadastrado"); }
};
export const listarServicos = async (filtros = {}, escopo = null) => repo.listarTodos(escopo != null ? { ...filtros, cod_almoxarifado: escopo } : filtros);
export const buscarServicoPorId = async (id, escopo = null) => {
  const servico = await repo.buscarPorId(id);
  if (!servico) throw new Error("Serviço não encontrado");
  assertAcessoAlmoxarifado(escopo, servico.cod_almoxarifado);
  return servico;
};
export const cadastrarServico = async (entrada, escopo = null) => {
  const dadosEntrada = escopo != null ? { ...entrada, cod_almoxarifado: escopo } : entrada;
  const itens = normalizarItens(dadosEntrada.itens), dados = montarDados(dadosEntrada, itens);
  await validarReferencias(dados, itens);
  return db.sequelize.transaction(async (t) => { const servico = await repo.criar(dados, itens, t); return repo.buscarPorId(servico.id_servico, t); });
};
export const editarServico = async (id, entrada, escopo = null) => {
  await buscarServicoPorId(id, escopo);
  const dadosEntrada = escopo != null ? { ...entrada, cod_almoxarifado: escopo } : entrada;
  const itens = normalizarItens(dadosEntrada.itens), dados = montarDados(dadosEntrada, itens);
  await validarReferencias(dados, itens);
  return db.sequelize.transaction((t) => repo.atualizar(id, dados, itens, t));
};
export const excluirServico = async (id, escopo = null) => {
  await buscarServicoPorId(id, escopo);
  return db.sequelize.transaction((t) => repo.excluir(id, t));
};
