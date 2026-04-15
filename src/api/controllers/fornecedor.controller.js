import * as fornecedorService from "../services/fornecedor.service.js"

// Cadastrar
export const cadastrarFornecedor = async (req, res) => {
    try {
        const resultado = await fornecedorService.cadastrarFornecedor(req.body)
        res.status(201).json({
            mensagem: "Fornecedor cadastrado com sucesso.",
            data: resultado
        })
    } catch (erro) {
        if(erro.message.includes("já registrado")) {
            return res.status(409).json({ erro: erro.message })
        }
        res.status(400).json({ erro: erro.message })
    }
}

// Consultar
export const consultar = async (req, res) => {
    try {
        const resultado = await fornecedorService.listarFornecedores()
        res.json({
            mensagem: "Fornecedores listados com sucesso.",
            data: resultado
        })
    } catch(erro) {
        res.status(400).json({ erro: erro.message })
    }
}

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
        if(erro.message === "Fornecedor não encontrado") {
            return res.status(404).json({ erro: erro.message })
        }
        res.status(400).json({ erro: erro.message })
    }
}

// Inativar
export const inativar = async (req, res) => {
    try {
        const { id } = req.params
        await fornecedorService.inativarFornecedor(id)
        res.json({ 
            mensagem: "Fornecedor inativado com sucesso!"
        })
    } catch(erro) {
        if(erro.message === "Fornecedor não encontrado") {
            return res.status(404).json({ erro: erro.message })
        }
        res.status(400).json({ erro: erro.message })
    }
}
