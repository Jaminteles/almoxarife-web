import db from "../models/index.js"

// Pega o model do Fornecedor do db
const Fornecedor = db.Fornecedor

// Cadastrar
export const cadastrarFornecedor = async (dados) => {
    return await Fornecedor.create(dados)
}
// Consultar (Se o usuário não aplicar nenhum filtro irá mostrar todos os fornecedores)
export const consultarFornecedores = async (filtros) => {

    // Cria um objeto para armazenar os filtros
    const where = {}

    if(filtros.nome) {
        where.nome = filtros.nome
    }

    if(filtros.cnpj) {
        where.cnpj = filtros.cnpj
    }

    return await Fornecedor.findAll({ where })
}

// BUSCA POR ID - SE FOR USAR
export const buscarPorId = async (id) => {
  return await Fornecedor.findByPk(id);
}

// Editar
export const editarFornecedor = async (id, dados) => {
    await Fornecedor.update(dados, {
        where: { id }
    })

    return await Fornecedor.findByPk(id)
}

// Inativar
export const inativarFornecedor = async (id) => {
    return await Fornecedor.destroy({
        where: { id }
    })
}
