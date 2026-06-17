import db from "../models/index.js";
import * as produtoRepo from "../repositories/produto.repository.js";
import { Op } from "sequelize";

export const listarTodos = async () => {
  const produtos = await db.Produto.findAll({
    include: [
      {
        model: db.Almoxarifado,
        as: "almoxarifados_estoque", // <--- IDÊNTICO AO SEU MODEL
        through: {
          attributes: ["quantidade"], // O Sequelize acessa a tabela 'Estoque' via alias
        },
      },
      {
        model: db.Fornecedor, // A nova relação de fornecedores
        as: "fornecedores", 
        through: { attributes: [] } // Geralmente não queremos ver a tabela intermediária
      }
    ],
  });

  return produtos.map((produto) => {
    const prodJSON = produto.toJSON();

    // Verifique o nome da gaveta que o Sequelize criou
    if (prodJSON.almoxarifados_estoque) {
      prodJSON.almoxarifados_estoque = prodJSON.almoxarifados_estoque.map((almoxarifado) => {
        // Como o 'through' é db.Estoque, o Sequelize coloca o resultado em 'Estoque'
        const quantidadeAtual = almoxarifado.Estoque ? almoxarifado.Estoque.quantidade : 0;
        
        let statusEstoque = "REGULAR";

        if (prodJSON.estoqueMinimo && quantidadeAtual <= prodJSON.estoqueMinimo) {
          statusEstoque = "CRITICO";
        } else if (prodJSON.estoqueMaximo && quantidadeAtual >= prodJSON.estoqueMaximo) {
          statusEstoque = "EXCESSO";
        }

        return {
          ...almoxarifado,
          statusEstoque,
        };
      });
    }

    return prodJSON;
  });
};

export const buscarPorId = async (id) => {
  return await produtoRepo.buscarPorId(id);
};

export const criar = async (dadosProduto) => {
// 1. Validação de campos obrigatórios [RF001 - 5.1.1]
  // Certifique-se de que estes nomes batem com o que vem do Front/Postman
  const camposObrigatorios = ['nome', 'preco_custo', 'estoque_minimo', 'estoque_maximo'];
  
  for (const campo of camposObrigatorios) {
    // Usando dadosProduto[campo] para acessar a propriedade corretamente
    if (!dadosProduto[campo] || dadosProduto[campo].toString().trim() === "") {
      throw new Error("Por favor, preencha todos os campos obrigatórios antes de prosseguir.");
    }
  }

  // 2. Validação de formato numérico [RF001 - 5.3.1]
  if (
    isNaN(parseFloat(dadosProduto.preco_custo)) || 
    isNaN(parseFloat(dadosProduto.estoque_minimo)) || 
    isNaN(parseFloat(dadosProduto.estoque_maximo))
  ) {
    throw new Error("Formato de dado inválido. Corrija as informações e tente novamente.");
  }

  // 3. Validação: Duplicidade de nome [RF001 - 5.2.1]
  const duplicado = await db.Produto.findOne({ where: { nome: dadosProduto.nome } });
  if (duplicado) {
    throw new Error("O registro informado já existe no sistema. Verifique antes de continuar.");
  }

  // 4. Validação: Estoque [RF001 - Fluxo de Exceção]
  if (Number(dadosProduto.estoque_minimo) >= Number(dadosProduto.estoque_maximo)) {
    throw new Error("O estoque mínimo não pode ser maior ou igual ao estoque máximo.");
  }

  const dadosParaSalvar = {
    ...dadosProduto,
    preco_custo: parseFloat(dadosProduto.preco_custo),
    estoque_minimo: parseFloat(dadosProduto.estoque_minimo),
    estoque_maximo: parseFloat(dadosProduto.estoque_maximo)
  };

  // Novo: Validar se fornecedores foram enviados
  if (!dadosProduto.fornecedores || dadosProduto.fornecedores.length === 0) {
    throw new Error("Pelo menos um fornecedor é obrigatório.");
  }

  // Criar o produto
  const produto = await produtoRepo.criar(dadosProduto);

  // Criar a associação na tabela intermediária
  // O Sequelize cria métodos mágicos como setFornecedores
  await produto.setFornecedores(dadosProduto.fornecedores);
  
  return produto;
};

export const atualizar = async (id, dadosProduto) => {
  // Validação: Duplicidade (ignorando o próprio ID) [RF003 - 5.2.1]
  const duplicado = await db.Produto.findOne({ 
    where: { nome: dadosProduto.nome, id_produto: { [Op.ne]: id } } 
  });
  if (duplicado) throw new Error("O registro informado já existe no sistema.");

  if (Number(dadosProduto.estoqueMinimo) >= Number(dadosProduto.estoqueMaximo)) {
    throw new Error("O estoque mínimo não pode ser maior ou igual ao estoque máximo.");
  }
  return await produtoRepo.atualizar(id, dadosProduto);
};

export const excluir = async (id) => {
  const produto = await produtoRepo.buscarPorId(id);
  if (!produto) return false;

  // AJUSTE AQUI: Use a coluna exata que existe no seu banco (id_produto)
  const saldoTotal = await db.Estoque.sum('quantidade', { 
    where: { id_produto: id } // <--- MUDAMOS DE ProdutoIdProduto PARA id_produto
  });

  // Nota: Se saldoTotal for null (não encontrou registros), trate como 0
  if ((saldoTotal || 0) > 0) {
    throw new Error("Não é possível inativar um produto com estoque disponível.");
  }

  return await produtoRepo.atualizar(id, { ativo: 0 });
};

