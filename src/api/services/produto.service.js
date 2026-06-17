import db from "../models/index.js";
import * as produtoRepo from "../repositories/produto.repository.js";

export const listarTodos = async () => {
  // Retorna os produtos trazendo junto a quantidade atual em cada almoxarifado
  const produtos = await db.Produto.findAll({
    include: [
      {
        model: db.Almoxarifado,
        through: {
          attributes: ["quantidade"],
        },
      },
    ],
  });

  return produtos.map((produto) => {
    const prodJSON = produto.toJSON();

    if (prodJSON.Almoxarifados) {
      prodJSON.Almoxarifados = prodJSON.Almoxarifados.map((almoxarifado) => {
        const quantidadeAtual = almoxarifado.Estoque.quantidade || 0;
        let statusEstoque = "REGULAR";

        if (
          prodJSON.estoqueMinimo &&
          quantidadeAtual <= prodJSON.estoqueMinimo
        ) {
          statusEstoque = "CRITICO";
        } else if (
          prodJSON.estoqueMaximo &&
          quantidadeAtual >= prodJSON.estoqueMaximo
        ) {
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
  if (
    dadosProduto.estoqueMaximo !== undefined &&
    dadosProduto.estoqueMinimo !== undefined
  ) {
    if (
      Number(dadosProduto.estoqueMinimo) >= Number(dadosProduto.estoqueMaximo)
    ) {
      throw new Error(
        "O estoque mínimo não pode ser maior ou igual ao estoque máximo.",
      );
    }
  }
  return await produtoRepo.criar(dadosProduto);
};

export const atualizar = async (id, dadosProduto) => {
  if (
    dadosProduto.estoqueMaximo !== undefined &&
    dadosProduto.estoqueMinimo !== undefined
  ) {
    if (
      Number(dadosProduto.estoqueMinimo) >= Number(dadosProduto.estoqueMaximo)
    ) {
      throw new Error(
        "O estoque mínimo não pode ser maior ou igual ao estoque máximo.",
      );
    }
  }
  return await produtoRepo.atualizar(id, dadosProduto);
};

export const excluir = async (id) => {
  return await produtoRepo.excluir(id);
};

Arquivo: src / api / controllers / produto.controller.js;

import * as produtoService from "../services/produto.service.js";

export const listar = async (req, res) => {
  try {
    const produtos = await produtoService.listarTodos();
    res.status(200).json(produtos);
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao listar produtos.", detalhe: error.message });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await produtoService.buscarPorId(id);
    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }
    res.status(200).json(produto);
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao buscar produto.", detalhe: error.message });
  }
};

export const criar = async (req, res) => {
  try {
    const novoProduto = await produtoService.criar(req.body);
    res.status(201).json(novoProduto);
  } catch (error) {
    res
      .status(400)
      .json({ erro: "Erro ao criar produto.", detalhe: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const produtoAtualizado = await produtoService.atualizar(id, req.body);
    if (!produtoAtualizado) {
      return res
        .status(404)
        .json({ erro: "Produto não encontrado para atualização." });
    }
    res.status(200).json(produtoAtualizado);
  } catch (error) {
    res
      .status(400)
      .json({ erro: "Erro ao atualizar produto.", detalhe: error.message });
  }
};

export const excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const deletado = await produtoService.excluir(id);
    if (!deletado) {
      return res
        .status(404)
        .json({ erro: "Produto não encontrado para exclusão." });
    }
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao excluir produto.", detalhe: error.message });
  }
};
