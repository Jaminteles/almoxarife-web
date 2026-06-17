import db from "../models/index.js";

/**
 * Consulta a posição atual do estoque de um almoxarifado específico
 */
export const consultarPorAlmoxarifado = async (codAlmoxarifado) => {
  const registros = await db.Estoque.findAll({
    where: { cod_almoxarifado: codAlmoxarifado },
    include: [{
      model: db.Produto,
      attributes: ['id', 'nome', 'estoqueMinimo', 'estoqueMaximo']
    }]
  });

  // Mapeia os registros para calcular o status individual de cada item naquele almoxarifado
  return registros.map(item => {
    const itemJSON = item.toJSON();
    const produto = itemJSON.Produto;
    let statusEstoque = 'REGULAR';

    if (produto) {
      const qtd = itemJSON.quantidade || 0;
      if (produto.estoqueMinimo && qtd <= produto.estoqueMinimo) {
        statusEstoque = 'CRITICO';
      } else if (produto.estoqueMaximo && qtd >= produto.estoqueMaximo) {
        statusEstoque = 'EXCESSO';
      }
    }

    return {
      cod_produto: itemJSON.cod_produto,
      nome_produto: produto ? produto.nome : "Não identificado",
      quantidade: itemJSON.quantidade,
      estoque_minimo: produto ? produto.estoqueMinimo : 0,
      estoque_maximo: produto ? produto.estoqueMaximo : null,
      statusEstoque
    };
  });
};