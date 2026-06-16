import * as compraRepo from "../repositories/compra.repository.js"
import db from "../models/index.js"

const STATUS_VALIDOS = ["PENDENTE", "RECEBIDO", "CANCELADO"]

const normalizarFiltros = (filtros = {}) => {
  const limpos = {}
  const trim = (v) => (typeof v === "string" ? v.trim() : v)

  if (trim(filtros.status)) limpos.status = trim(filtros.status)
  if (trim(filtros.numero_nota_fiscal)) limpos.numero_nota_fiscal = trim(filtros.numero_nota_fiscal)
  if (trim(filtros.fornecedor)) limpos.fornecedor = trim(filtros.fornecedor)
  if (trim(filtros.produtos)) limpos.produtos = trim(filtros.produtos)

  if (trim(filtros.data)) {
    const inicio = new Date(`${trim(filtros.data)}T00:00:00`)
    if (Number.isNaN(inicio.getTime())) {
      throw new Error("Formato de dado inválido. Corrija as informações e tente novamente.")
    }
    const fim = new Date(inicio)
    fim.setDate(fim.getDate() + 1)
    limpos.data = { inicio, fim }
  }

  return limpos
}

const normalizarItens = (itens = []) => {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error("Por favor, preencha todos os campos obrigatórios antes de prosseguir.")
  }

  const agrupados = new Map()

  for (const item of itens) {
    const idProduto = Number(item.id_produto)
    const qte = Number(item.quantidade)
    const vUnit = Number(item.valor_unitario)

    if (!idProduto || Number.isNaN(qte) || Number.isNaN(vUnit)) {
      throw new Error("Formato de dado inválido. Corrija as informações e tente novamente.")
    }

    if (qte <= 0 || vUnit <= 0) {
      throw new Error("A quantidade e o valor devem ser maiores que zero.")
    }

    // Se houver repetição do produto, agrupa e pondera ou soma de acordo com o desejado (aqui somamos)
    const atual = agrupados.get(idProduto) || { quantidade: 0, valor_unitario: vUnit }
    agrupados.set(idProduto, {
      quantidade: atual.quantidade + qte,
      valor_unitario: vUnit // prevalece o último valor informado
    })
  }

  return Array.from(agrupados.entries()).map(([id_produto, obj]) => ({
    id_produto,
    quantidade: obj.quantidade,
    valor_unitario: obj.valor_unitario
  }))
}

const montarDadosCompra = (dados) => {
  // Agora validamos também o id_funcionario_comprador que é obrigatório no banco
  if (
    !dados.id_fornecedor || 
    !dados.cod_almoxarifado_destino || 
    !dados.numero_nota_fiscal || 
    !dados.data_compra ||
    !dados.id_funcionario_comprador
  ) {
    throw new Error("Por favor, preencha todos os campos obrigatórios antes de prosseguir.");
  }

  const dataCompra = new Date(dados.data_compra);
  if (Number.isNaN(dataCompra.getTime())) {
    throw new Error("Formato de dado inválido. Corrija as informações e tente novamente.");
  }

  // O retorno abaixo garante que o campo chegue ao Sequelize/Banco
  return {
    id_fornecedor: Number(dados.id_fornecedor),
    id_funcionario_comprador: String(dados.id_funcionario_comprador).trim(),
    cod_almoxarifado_destino: Number(dados.cod_almoxarifado_destino),
    numero_nota_fiscal: String(dados.numero_nota_fiscal).trim(),
    data_compra: dataCompra,
    status: dados.status || "PENDENTE",
    observacao: dados.observacao || null
  };
}

const garantirReferencias = async (dados, itens) => {
  const fornecedor = await compraRepo.buscarFornecedor(dados.id_fornecedor)
  if (!fornecedor || fornecedor.ativo === 0) {
    throw new Error("Fornecedor não encontrado.")
  }

  const destino = await compraRepo.buscarAlmoxarifado(dados.cod_almoxarifado_destino)
  if (!destino || destino.ativo === 0) {
    throw new Error("Almoxarifado de destino não encontrado.")
  }

  for (const item of itens) {
    const produto = await compraRepo.buscarProduto(item.id_produto)
    if (!produto || produto.ativo === 0) {
      throw new Error("Produto informado não está cadastrado.")
    }
  }
}

const verificarDuplicidadeNota = async (numeroNota, idFornecedor, idCompraIgnorar = null) => {
  const compraExistente = await compraRepo.buscarPorNotaFiscal(numeroNota, idFornecedor)
  if (compraExistente && compraExistente.id_compra !== idCompraIgnorar) {
    throw new Error("O registro informado já existe no sistema. Verifique antes de continuar.")
  }
}

export const listarCompras = async (filtros = {}) => {
  return await compraRepo.listarTodos(filtros);
  //return await compraRepo.listarTodos(normalizarFiltros(filtros))
}

export const buscarCompraPorId = async (id) => {
  const compra = await compraRepo.buscarPorId(id)
  if (!compra) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.")
  }
  return compra
}

export const cadastrarCompra = async (dados) => {
  const dadosCompra = montarDadosCompra(dados);
  dadosCompra.status = "PENDENTE";

  const itens = normalizarItens(dados.itens);
  await garantirReferencias(dadosCompra, itens);
  await verificarDuplicidadeNota(dadosCompra.numero_nota_fiscal, dadosCompra.id_fornecedor);

  // O Sequelize gerencia o commit/rollback automaticamente
  return await db.sequelize.transaction(async (t) => {
    const novaCompra = await compraRepo.criar(dadosCompra, itens, t);
    return await compraRepo.buscarPorId(novaCompra.id_compra, t);
  });
};

export const editarCompra = async (id, dados) => {
  const compraAtual = await compraRepo.buscarPorId(id);
  if (!compraAtual) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.");
  }

  if (compraAtual.status !== "PENDENTE") {
    throw new Error("Apenas pedidos com status 'PENDENTE' podem ser editados.");
  }

  // Mesclagem de dados (mantém o valor original se o novo não for enviado)
  const dadosParaAtualizar = {
    id_fornecedor: dados.id_fornecedor || compraAtual.id_fornecedor,
    cod_almoxarifado_destino: dados.cod_almoxarifado_destino || compraAtual.cod_almoxarifado_destino,
    numero_nota_fiscal: dados.numero_nota_fiscal || compraAtual.numero_nota_fiscal,
    data_compra: dados.data_compra || compraAtual.data_compra,
    status: dados.status || compraAtual.status,
    observacao: dados.observacao !== undefined ? dados.observacao : compraAtual.observacao
  };

  if (dados.status && !STATUS_VALIDOS.includes(dados.status)) {
    throw new Error("Status inválido. Use: PENDENTE, RECEBIDO ou CANCELADO.");
  }

  // Limpeza dos itens (garante que apenas campos necessários sejam enviados ao banco)
  let itens;
  if (dados.itens) {
    itens = normalizarItens(dados.itens);
  } else {
    itens = compraAtual.itens.map(item => ({
      id_produto: item.id_produto,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario
    }));
  }

  // Transação Gerenciada
  return await db.sequelize.transaction(async (t) => {
    await compraRepo.atualizar(id, dadosParaAtualizar, itens, t);
    return await compraRepo.buscarPorId(id, t);
  });
};

export const excluirCompra = async (id) => {
  const compra = await compraRepo.buscarPorId(id)
  if (!compra) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.")
  }

  // Validações de Status
  if (compra.status === "APROVADO") {
    throw new Error("Não é possível excluir um pedido de compra aprovado.")
  }
  if (compra.status === "CONCLUIDO") {
    throw new Error("Exclusão não permitida: pedido já vinculado a uma entrada de estoque.")
  }
  if (compra.status !== "PENDENTE") {
    throw new Error("O pedido de compra deve estar cadastrado e com status “Pendente”.")
  }

  // Uso da transação gerenciada (Managed Transaction)
  return await db.sequelize.transaction(async (t) => {
    return await compraRepo.excluir(id, t);
  });
}

