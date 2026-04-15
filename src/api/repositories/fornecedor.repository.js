/**
 * Repository de Fornecedor - Usando Sequelize ORM
*/
import db from "../models/index.js"

// Pega o model do Fornecedor do db
const Fornecedor = db.Fornecedor

// Cadastrar
export async function cadastrarFornecedor(dados) {
    return await Fornecedor.create(dados)
}

// Consultar (Se o usuário não aplicar nenhum filtro irá mostrar todos os fornecedores)
export async function consultarFornecedores(filtros) {
    // Cria um objeto para armazenar os filtros
    const where = {}

    if(filtros && filtros.nome) {
        where.nome = filtros.nome
    }

    if(filtros && filtros.cnpj) {
        where.cnpj = filtros.cnpj
    }

    return await Fornecedor.findAll({ where })
}

// Buscar por ID
export async function buscarPorId(id) {
    return await Fornecedor.findByPk(id)
}

// Editar
export async function editarFornecedor(id, dados) {
    await Fornecedor.update(dados, {
        where: { id }
    })

    return await Fornecedor.findByPk(id)
}

// Inativar
export async function inativarFornecedor(id) {
    return await Fornecedor.destroy({
        where: { id }
    })
}
