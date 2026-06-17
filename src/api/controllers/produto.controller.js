import * as produtoService from "../services/produto.service.js"

export const listar = async (req, res) => {
    try {
        const produtos = await produtoService.listarTodos(req.query)
        // Mesmo formato dos demais módulos: { sucesso, dados, total }.
        res.status(200).json({ sucesso: true, dados: produtos, total: produtos.length })
    } catch (error) {
        res
            .status(500)
            .json({ sucesso: false, erro: "Erro ao listar produtos.", detalhe: error.message })
    }
}

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params
        const produto = await produtoService.buscarPorId(id)
        if (!produto) {
            return res.status(404).json({ sucesso: false, erro: "Produto não encontrado." })
        }
        res.status(200).json({ sucesso: true, dados: produto })
    } catch (error) {
        res
            .status(500)
            .json({ sucesso: false, erro: "Erro ao buscar produto.", detalhe: error.message })
    }
}

export const criar = async (req, res) => {
  try {
    const novoProduto = await produtoService.criar(req.body);
    res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", data: novoProduto });
  } catch (error) {
    // [RF001 - 5.1.1 / 5.2.1]
    res.status(400).json({ erro: error.message });
  }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params
        const produtoAtualizado = await produtoService.atualizar(id, req.body)
        if (!produtoAtualizado) {
            return res
                .status(404)
                .json({ erro: "Produto não encontrado para atualização." })
        }
        res.status(200).json(produtoAtualizado)
    } catch (error) {
        res
            .status(400)
            .json({ erro: "Erro ao atualizar produto.", detalhe: error.message })
    }
}

export const excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const sucesso = await produtoService.excluir(id);
    if (!sucesso) return res.status(404).json({ erro: "Produto não encontrado." });
    
    res.status(200).json({ mensagem: "Produto inativado com sucesso!" });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};