import db from "../models/index.js" // Ajuste o caminho se a exportação do db for diferente

const Produto = db.Produto

export const buscarTodos = async () => {
    return await Produto.findAll()
}

export const buscarPorId = async (id) => {
    // Precisa do include de Fornecedor pra tela de edição conseguir
    // preencher o multi-select com os fornecedores já vinculados.
    // Mantém também o include de Almoxarifado, igual ao listarTodos do
    // service, pra não perder informação de estoque ao abrir um produto.
    return await Produto.findByPk(id, {
        include: [
            {
                model: db.Almoxarifado,
                as: "almoxarifados_estoque",
                through: { attributes: ["quantidade"] }
            },
            {
                model: db.Fornecedor,
                as: "fornecedores",
                through: { attributes: [] }
            }
        ]
    })
}

export const criar = async (dados) => {
    return await Produto.create(dados)
}

export const atualizar = async (id, dados) => {
    const produto = await Produto.findByPk(id)
    if (!produto) return null

    // `fornecedores` não é uma coluna da tabela Produto, é a relação N:N
    // com Fornecedor via Produto_Fornecedor. Precisa ser tratada à parte
    // com setFornecedores, senão o update ignora esse campo silenciosamente.
    const { fornecedores, ...dadosProduto } = dados

    await produto.update(dadosProduto)

    if (fornecedores) {
        // Mesmo padrão do criar: usa o preço de custo (já atualizado ou o
        // existente) como preço negociado padrão para os vínculos.
        // setFornecedores substitui a lista inteira de vínculos pela nova.
        await produto.setFornecedores(fornecedores, {
            through: { preco_negociado: produto.preco_custo }
        })
    }

    // Recarrega com o include pra devolver os fornecedores atualizados
    // na resposta, igual ao buscarPorId.
    return await buscarPorId(id)
}

export const excluir = async (id) => {
    const produto = await Produto.findByPk(id)
    if (!produto) return false

    await produto.destroy()
    return true
}