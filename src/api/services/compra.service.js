import * as compraRepo from "../repositories/compra.repository.js";
import db from "../models/index.js";
import { processarMovimentacao } from "../utils/estoqueHelper.js";

const STATUS_VALIDOS = ["PENDENTE", "RECEBIDO", "CANCELADO"];

const normalizarFiltros = (filtros = {}) => {
  const limpos = {};
  const trim = (v) => (typeof v === "string" ? v.trim() : v);

  if (trim(filtros.status)) limpos.status = trim(filtros.status);
  if (trim(filtros.numero_nota_fiscal))
    limpos.numero_nota_fiscal = trim(filtros.numero_nota_fiscal);
  if (trim(filtros.fornecedor)) limpos.fornecedor = trim(filtros.fornecedor);
  if (trim(filtros.produto)) limpos.produto = trim(filtros.produto);

  if (trim(filtros.data)) {
    const inicio = new Date(`${trim(filtros.data)}T00:00:00`);
    if (Number.isNaN(inicio.getTime())) {
      throw new Error(
        "Formato de dado inválido. Corrija as informações e tente novamente.",
      );
    }
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);
    limpos.data = { inicio, fim };
  }

  return limpos;
};

const normalizarItens = (itens = []) => {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error(
      "Por favor, preencha todos os campos obrigatórios antes de prosseguir.",
    );
  }

  const agrupados = new Map();

  for (const item of itens) {
    const idProduto = Number(item.id_produto);
    const qte = Number(item.quantidade);
    const vUnit = Number(item.valor_unitario);

    if (!idProduto || Number.isNaN(qte) || Number.isNaN(vUnit)) {
      throw new Error(
        "Formato de dado inválido. Corrija as informações e tente novamente.",
      );
    }

    if (qte <= 0 || vUnit <= 0) {
      throw new Error("A quantidade e o valor devem ser maiores que zero.");
    }

    const atual = agrupados.get(idProduto) || {
      quantidade: 0,
      valor_unitario: vUnit,
    };
    agrupados.set(idProduto, {
      quantidade: atual.quantidade + qte,
      valor_unitario: vUnit,
    });
  }

  return Array.from(agrupados.entries()).map(([id_produto, obj]) => ({
    id_produto,
    quantidade: obj.quantidade,
    valor_unitario: obj.valor_unitario,
  }));
};

const montarDadosCompra = (dados) => {
  if (
    !dados.id_fornecedor ||
    !dados.cod_almoxarifado_destino ||
    !dados.numero_nota_fiscal ||
    !dados.data_compra ||
    !dados.id_funcionario_comprador
  ) {
    throw new Error(
      "Por favor, preencha todos os campos obrigatórios antes de prosseguir.",
    );
  }

  const dataCompra = new Date(dados.data_compra);
  if (Number.isNaN(dataCompra.getTime())) {
    throw new Error(
      "Formato de dado inválido. Corrija as informações e tente novamente.",
    );
  }

  return {
    id_fornecedor: Number(dados.id_fornecedor),
    id_funcionario_comprador: String(dados.id_funcionario_comprador).trim(),
    cod_almoxarifado_destino: Number(dados.cod_almoxarifado_destino),
    numero_nota_fiscal: String(dados.numero_nota_fiscal).trim(),
    data_compra: dataCompra,
    status: dados.status || "PENDENTE",
  };
};

const garantirReferencias = async (dados, itens) => {
  const fornecedor = await compraRepo.buscarFornecedor(dados.id_fornecedor);
  if (!fornecedor || fornecedor.ativo === 0) {
    throw new Error("Fornecedor não encontrado.");
  }

  const destino = await compraRepo.buscarAlmoxarifado(
    dados.cod_almoxarifado_destino,
  );
  if (!destino || destino.ativo === 0) {
    throw new Error("Almoxarifado de destino não encontrado.");
  }

  for (const item of itens) {
    const produto = await compraRepo.buscarProduto(item.id_produto);
    if (!produto || produto.ativo === 0) {
      throw new Error("Produto informado não está cadastrado.");
    }
  }
};

const verificarDuplicidadeNota = async (
  numeroNota,
  idFornecedor,
  idCompraIgnorar = null,
) => {
  const compraExistente = await compraRepo.buscarPorNotaFiscal(
    numeroNota,
    idFornecedor,
  );
  if (compraExistente && compraExistente.id_compra !== idCompraIgnorar) {
    throw new Error(
      "O registro informado já existe no sistema. Verifique antes de continuar.",
    );
  }
};

// Aplica a entrada de estoque da compra (incrementa o destino).
const aplicarEntradaCompra = async (codAlmoxarifadoDestino, itens, transaction) => {
  for (const item of itens) {
    await processarMovimentacao(
      {
        tipo: "COMPRA",
        cod_produto: item.id_produto,
        cod_almoxarifado_destino: codAlmoxarifadoDestino,
        quantidade: Number(item.quantidade),
      },
      transaction,
    );
  }
};

// Reverte a entrada de estoque de uma compra (decrementa o destino). Reusa o
// fluxo SAIDA_CONSUMO, que valida se ainda há saldo suficiente para reverter.
const reverterEntradaCompra = async (compra, transaction) => {
  for (const item of compra.itens || []) {
    await processarMovimentacao(
      {
        tipo: "SAIDA_CONSUMO",
        cod_produto: item.id_produto,
        cod_almoxarifado_origem: compra.cod_almoxarifado_destino,
        quantidade: Number(item.quantidade),
      },
      transaction,
    );
  }
};

export const listarCompras = async (filtros = {}) => {
  return await compraRepo.listarTodos(filtros);
};

export const buscarCompraPorId = async (id) => {
  const compra = await compraRepo.buscarPorId(id);
  if (!compra) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.");
  }
  return compra;
};

export const cadastrarCompra = async (dados) => {
  const dadosCompra = montarDadosCompra(dados);
  // Ao registrar a compra, ela já entra como RECEBIDO para dar entrada no
  // estoque do almoxarifado de destino (a movimentação roda logo abaixo).
  // Assim o produto comprado passa a aparecer no estoque daquele almoxarifado.
  dadosCompra.status = "RECEBIDO";

  const itens = normalizarItens(dados.itens);
  await garantirReferencias(dadosCompra, itens);
  await verificarDuplicidadeNota(
    dadosCompra.numero_nota_fiscal,
    dadosCompra.id_fornecedor,
  );

  return await db.sequelize.transaction(async (t) => {
    const novaCompra = await compraRepo.criar(dadosCompra, itens, t);

    // A compra dá entrada no estoque do almoxarifado de destino.
    await aplicarEntradaCompra(dadosCompra.cod_almoxarifado_destino, itens, t);

    return await compraRepo.buscarPorId(novaCompra.id_compra, t);
  });
};

export const editarCompra = async (id, dados) => {
  const compraAtual = await compraRepo.buscarPorId(id);
  if (!compraAtual) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.");
  }

  const dadosParaAtualizar = {
    id_fornecedor: dados.id_fornecedor || compraAtual.id_fornecedor,
    cod_almoxarifado_destino:
      dados.cod_almoxarifado_destino || compraAtual.cod_almoxarifado_destino,
    numero_nota_fiscal:
      dados.numero_nota_fiscal || compraAtual.numero_nota_fiscal,
    data_compra: dados.data_compra || compraAtual.data_compra,
    // A compra sempre reflete entrada de estoque, então mantém-se RECEBIDO.
    status: "RECEBIDO",
  };

  let itens;
  if (dados.itens) {
    itens = normalizarItens(dados.itens);
  } else {
    itens = compraAtual.itens.map((item) => ({
      id_produto: item.id_produto,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
    }));
  }

  return await db.sequelize.transaction(async (t) => {
    // Reverte a entrada antiga e reaplica a nova, mantendo o estoque coerente
    // (mesma lógica da saída): desfaz o efeito anterior e aplica os itens novos.
    await reverterEntradaCompra(compraAtual, t);
    await compraRepo.atualizar(id, dadosParaAtualizar, itens, t);
    await aplicarEntradaCompra(dadosParaAtualizar.cod_almoxarifado_destino, itens, t);

    return await compraRepo.buscarPorId(id, t);
  });
};

export const excluirCompra = async (id) => {
  const compra = await compraRepo.buscarPorId(id);
  if (!compra) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.");
  }

  // Excluir a compra REVERTE a entrada de estoque que ela gerou (decrementa o
  // saldo do almoxarifado de destino). Se o saldo já tiver sido consumido, a
  // reversão falha com "Saldo insuficiente" — protegendo a integridade.
  return await db.sequelize.transaction(async (t) => {
    await reverterEntradaCompra(compra, t);
    return await compraRepo.excluir(id, t);
  });
};
