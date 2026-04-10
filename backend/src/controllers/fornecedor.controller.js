import * as fornecedorService from "../services/fornecedor.service.js"

// Cadastrar
export const cadastrarFornecedor = async (req, res) => {
    try {
        const resultado = await fornecedorService.cadastrarFornecedor(req.body)
        res.status(201).json({
            mensagem: "Produto cadastrado com sucesso.",
            data: resultado
        })
    } catch (erro) {
        res.status(400).json({ erro: erro.message })
    }
}

// Consultar - TODO



// Editar
export const editarFornecedor = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await fornecedorService.editarFornecedores(id, req.body)
        res.json({ 
            mensagem: "Fornecedor atualizado com sucesso!",
            data: resultado
        })
    } catch(erro) {
        res.status(400).json({ erro: erro.message })
    }
}



// Inativar - TODO