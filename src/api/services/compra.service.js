import * as compraRepo from "../repositories/compra.repository.js";
import db from "../models/index.js";
import { processarMovimentacao } from "../utils/estoqueHelper.js";
import { assertAcessoAlmoxarifado } from "../utils/escopo.js";

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

// Reverter uma compra recebida retira estoque do almoxarifado de DESTINO. Não
// faz sentido movimentar um almoxarifado inativo, então bloqueia a
// edição/exclusão da compra recebida enquanto o destino estiver inativo.
const garantirDestinoAtivoParaReverter = async (compra) => {
  const destino = await compraRepo.buscarAlmoxarifado(compra.cod_almoxarifado_destino);
  if (!destino || destino.ativo === 0) {
    const erro = new Error(
      "Não é possível reverter esta compra: o almoxarifado de destino está inativo. Reative-o antes de editar ou excluir a compra recebida.",
    );
    erro.status = 409;
    throw erro;
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

export const listarCompras = async (filtros = {}, escopo = null) => {
  // Usuário restrito só vê compras cujo DESTINO é o seu almoxarifado.
  const f = escopo != null ? { ...filtros, cod_almoxarifado_destino: escopo } : filtros;
  return await compraRepo.listarTodos(f);
};

export const buscarCompraPorId = async (id, escopo = null) => {
  const compra = await compraRepo.buscarPorId(id);
  if (!compra) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.");
  }
  assertAcessoAlmoxarifado(escopo, compra.cod_almoxarifado_destino);
  return compra;
};

export const cadastrarCompra = async (dados, escopo = null) => {
  // Usuário restrito: o destino é SEMPRE o seu almoxarifado (ignora o enviado).
  const entrada = escopo != null ? { ...dados, cod_almoxarifado_destino: escopo } : dados;
  const dadosCompra = montarDadosCompra(entrada);
  // A compra nasce PENDENTE e NÃO movimenta estoque ainda. A entrada no
  // almoxarifado de destino só ocorre quando o recebimento for confirmado
  // (confirmarRecebimento), que muda o status para RECEBIDO.
  dadosCompra.status = "PENDENTE";

  const itens = normalizarItens(dados.itens);
  await garantirReferencias(dadosCompra, itens);
  await verificarDuplicidadeNota(
    dadosCompra.numero_nota_fiscal,
    dadosCompra.id_fornecedor,
  );

  return await db.sequelize.transaction(async (t) => {
    const novaCompra = await compraRepo.criar(dadosCompra, itens, t);
    return await compraRepo.buscarPorId(novaCompra.id_compra, t);
  });
};

// Confirma o recebimento de uma compra PENDENTE: dá entrada no estoque do
// almoxarifado de destino e marca a compra como RECEBIDO — tudo na mesma
// transação, para o estoque nunca ficar inconsistente com o status.
export const confirmarRecebimento = async (id, escopo = null) => {
  const compra = await compraRepo.buscarPorId(id);
  if (!compra) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.");
  }
  assertAcessoAlmoxarifado(escopo, compra.cod_almoxarifado_destino);
  if (compra.status === "RECEBIDO") {
    throw new Error("Esta compra já foi recebida.");
  }
  if (compra.status === "CANCELADO") {
    throw new Error("Uma compra cancelada não pode ser recebida.");
  }

  return await db.sequelize.transaction(async (t) => {
    await aplicarEntradaCompra(compra.cod_almoxarifado_destino, compra.itens, t);
    await compraRepo.atualizarStatus(id, "RECEBIDO", t);
    return await compraRepo.buscarPorId(id, t);
  });
};

export const editarCompra = async (id, dados, escopo = null) => {
  const compraAtual = await compraRepo.buscarPorId(id);
  if (!compraAtual) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.");
  }
  // A compra existente precisa ter como destino o almoxarifado do usuário restrito.
  assertAcessoAlmoxarifado(escopo, compraAtual.cod_almoxarifado_destino);

  const dadosParaAtualizar = {
    id_fornecedor: dados.id_fornecedor || compraAtual.id_fornecedor,
    // Usuário restrito não pode mudar o destino para fora do seu almoxarifado.
    cod_almoxarifado_destino:
      escopo != null
        ? escopo
        : dados.cod_almoxarifado_destino || compraAtual.cod_almoxarifado_destino,
    numero_nota_fiscal:
      dados.numero_nota_fiscal || compraAtual.numero_nota_fiscal,
    data_compra: dados.data_compra || compraAtual.data_compra,
    // Editar NÃO altera o status: uma compra PENDENTE continua pendente e uma
    // RECEBIDO continua recebida (o estoque é reajustado abaixo, se preciso).
    status: compraAtual.status,
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

  // Só há estoque a ajustar quando a compra já deu entrada (RECEBIDO).
  // Enquanto PENDENTE, a edição apenas atualiza os dados do pedido.
  const jaRecebida = compraAtual.status === "RECEBIDO";

  // Editar uma compra recebida reverte a entrada no destino — exige-o ativo.
  if (jaRecebida) {
    await garantirDestinoAtivoParaReverter(compraAtual);
  }

  return await db.sequelize.transaction(async (t) => {
    if (jaRecebida) {
      // Reverte a entrada antiga e reaplica a nova, mantendo o estoque coerente.
      await reverterEntradaCompra(compraAtual, t);
    }
    await compraRepo.atualizar(id, dadosParaAtualizar, itens, t);
    if (jaRecebida) {
      await aplicarEntradaCompra(dadosParaAtualizar.cod_almoxarifado_destino, itens, t);
    }

    return await compraRepo.buscarPorId(id, t);
  });
};

export const excluirCompra = async (id, escopo = null) => {
  const compra = await compraRepo.buscarPorId(id);
  if (!compra) {
    throw new Error("Nenhum pedido encontrado com os parâmetros informados.");
  }
  assertAcessoAlmoxarifado(escopo, compra.cod_almoxarifado_destino);

  // Excluir REVERTE a entrada de estoque APENAS se a compra já tinha sido
  // recebida (RECEBIDO). Uma compra PENDENTE nunca movimentou estoque, então é
  // só removê-la. Se o saldo já tiver sido consumido, a reversão falha com
  // "Saldo insuficiente" — protegendo a integridade.
  if (compra.status === "RECEBIDO") {
    await garantirDestinoAtivoParaReverter(compra);
  }

  return await db.sequelize.transaction(async (t) => {
    if (compra.status === "RECEBIDO") {
      await reverterEntradaCompra(compra, t);
    }
    return await compraRepo.excluir(id, t);
  });
};
