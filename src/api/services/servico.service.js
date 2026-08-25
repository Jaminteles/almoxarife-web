import * as repo from "../repositories/servico.repository.js";
import db from "../models/index.js";

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
  if (!dados.id_fornecedor || !dados.id_funcionario_responsavel || !dados.data_servico || !String(dados.aplicacao || "").trim()) throw new Error("Fornecedor, responsável, data e aplicação são obrigatórios");
  return {
    id_fornecedor: Number(dados.id_fornecedor), id_funcionario_responsavel: String(dados.id_funcionario_responsavel).trim(), data_servico: dataLocal(dados.data_servico),
    aplicacao: String(dados.aplicacao).trim(), observacao: String(dados.observacao || "").trim() || null,
    valor_total: itens.reduce((total, item) => total + item.quantidade * item.valor_unitario, 0)
  };
};
const validarReferencias = async (dados, itens) => {
  const fornecedor = await repo.buscarFornecedor(dados.id_fornecedor);
  if (!fornecedor || fornecedor.ativo === 0) throw new Error("Fornecedor não encontrado");
  const responsavel = await repo.buscarFuncionario(dados.id_funcionario_responsavel);
  if (!responsavel || responsavel.is_active === 0) throw new Error("Responsável não encontrado");
  for (const item of itens) { const produto = await repo.buscarProduto(item.id_produto); if (!produto || produto.ativo === 0) throw new Error("Produto informado não está cadastrado"); }
};
export const listarServicos = async (filtros) => repo.listarTodos(filtros);
export const buscarServicoPorId = async (id) => { const servico = await repo.buscarPorId(id); if (!servico) throw new Error("Serviço não encontrado"); return servico; };
export const cadastrarServico = async (entrada) => {
  const itens = normalizarItens(entrada.itens), dados = montarDados(entrada, itens);
  await validarReferencias(dados, itens);
  return db.sequelize.transaction(async (t) => { const servico = await repo.criar(dados, itens, t); return repo.buscarPorId(servico.id_servico, t); });
};
export const editarServico = async (id, entrada) => {
  await buscarServicoPorId(id);
  const itens = normalizarItens(entrada.itens), dados = montarDados(entrada, itens);
  await validarReferencias(dados, itens);
  return db.sequelize.transaction((t) => repo.atualizar(id, dados, itens, t));
};
export const excluirServico = async (id) => {
  await buscarServicoPorId(id);
  return db.sequelize.transaction((t) => repo.excluir(id, t));
};
