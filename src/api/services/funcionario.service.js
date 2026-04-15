import * as funcionarioRepository from "../repositories/funcionarioRepository.js"
import bcrypt from "bcrypt"

const validarCamposObrigatorios = (dados) => {
    if(!dados.nome || !dados.cpf || !dados.email || !dados.cargo || !dados.login || !dados.senha) {
        throw new Error("Todos os campos são obrigatórios")
    }
}

const validarCamposAtualizacao = (dados) => {
    if(!dados.nome || !dados.cpf || !dados.email || !dados.cargo || !dados.login) {
        throw new Error("Todos os campos são obrigatórios")
    }
}

const verificarDuplicidadeCpf = async (cpf, idAtual = null) => {
    const existente = await funcionarioRepository.buscarPorCpf(cpf)
    if(existente && existente.id !== idAtual) {
        throw new Error("CPF já cadastrado")
    }
}

const verificarDuplicidadeLogin = async (login, idAtual = null) => {
    const existente = await funcionarioRepository.buscarPorLogin(login)
    if(existente && existente.id !== idAtual) {
        throw new Error("Login já cadastrado")
    }
}

// Regras de negócio - Funcionário

export const criarFuncionario = async(dados) => {
    validarCamposObrigatorios(dados)
    await verificarDuplicidadeCpf(dados.cpf)
    await verificarDuplicidadeLogin(dados.login)
    
    const senhaHash = await bcrypt.hash(dados.senha, 10)
    
    return await funcionarioRepository.criar({
        ...dados,
        senha: senhaHash
    })
}

export const listarFuncionarios = async () => {
    return await funcionarioRepository.listarTodos()
}

export const buscarFuncionarioPorId = async (id) => {
    const funcionario = await funcionarioRepository.buscarPorId(id)
    if(!funcionario) {
        throw new Error("Funcionário não encontrado")
    }
    return funcionario
}

export const atualizarFuncionario = async(id, dados) => {
    const funcionario = await funcionarioRepository.buscarPorId(id)
    if(!funcionario) {
        throw new Error("Funcionário não encontrado")
    }

    validarCamposAtualizacao(dados)
    await verificarDuplicidadeCpf(dados.cpf, id)
    await verificarDuplicidadeLogin(dados.login, id)

    // Se estiver atualizando a senha, faz o hash
    let dadosAtualizar = { ...dados }
    if(dados.senha) {
        dadosAtualizar.senha = await bcrypt.hash(dados.senha, 10)
    }

    return await funcionarioRepository.atualizar(id, dadosAtualizar)
}

export const removerFuncionario = async (id) => {
    const funcionario = await funcionarioRepository.buscarPorId(id)
    if(!funcionario) {
        throw new Error("Funcionário não encontrado")
    }

    return await funcionarioRepository.remover(id)
}
