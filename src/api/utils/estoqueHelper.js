import db from "../models/index.js";

/**
 * Aplica uma movimentação de estoque na tabela Estoque.
 *
 * IMPORTANTE: a coluna que identifica o produto no Estoque é `id_produto`
 * (não `cod_produto`). O parâmetro continua chegando como `cod_produto`, mas
 * é gravado/consultado na coluna correta `id_produto` — usar `cod_produto`
 * no WHERE quebrava todas as movimentações (compra recebida e saídas).
 */
export const processarMovimentacao = async (movimentacao, transaction) => {
  const {
    tipo,
    cod_produto,
    cod_almoxarifado_origem,
    cod_almoxarifado_destino,
    quantidade
  } = movimentacao;

  if (tipo === "COMPRA") {
    const [estoqueDestino] = await db.Estoque.findOrCreate({
      where: { cod_almoxarifado: cod_almoxarifado_destino, id_produto: cod_produto },
      defaults: { quantidade: 0 },
      transaction
    });
    await estoqueDestino.increment("quantidade", { by: quantidade, transaction });
  }

  else if (tipo === "SAIDA_CONSUMO") {
    const estoqueOrigem = await db.Estoque.findOne({
      where: { cod_almoxarifado: cod_almoxarifado_origem, id_produto: cod_produto },
      transaction
    });

    if (!estoqueOrigem || Number(estoqueOrigem.quantidade) < quantidade) {
      const qtdAtual = estoqueOrigem ? estoqueOrigem.quantidade : 0;
      throw new Error(`Saldo insuficiente no almoxarifado para o produto ID ${cod_produto}. Quantidade disponível: ${qtdAtual}.`);
    }
    await estoqueOrigem.decrement("quantidade", { by: quantidade, transaction });
  }

  else if (tipo === "SAIDA_TRANSFERENCIA") {
    const estoqueOrigem = await db.Estoque.findOne({
      where: { cod_almoxarifado: cod_almoxarifado_origem, id_produto: cod_produto },
      transaction
    });

    if (!estoqueOrigem || Number(estoqueOrigem.quantidade) < quantidade) {
      const qtdAtual = estoqueOrigem ? estoqueOrigem.quantidade : 0;
      throw new Error(`Saldo insuficiente para transferir o produto ID ${cod_produto}. Quantidade disponível: ${qtdAtual}.`);
    }
    await estoqueOrigem.decrement("quantidade", { by: quantidade, transaction });

    const [estoqueDestino] = await db.Estoque.findOrCreate({
      where: { cod_almoxarifado: cod_almoxarifado_destino, id_produto: cod_produto },
      defaults: { quantidade: 0 },
      transaction
    });
    await estoqueDestino.increment("quantidade", { by: quantidade, transaction });
  }
};
