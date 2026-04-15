import * as fornecedorRepository from "../repositories/fornecedor.repository.js"
import { validarEmail } from "../utils/validations/email.validation.js"

const validarCamposObrigatoriosFornecedor = (dados) => {
    if(!dados.nome || !dados.cnpj || !dados.telefone || !dados.email || !dados.endereco) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
    }

    validarEmail(dados.email)
}

const verificarDuplicidadeCnpj = async (cnpj, idAtual = null) => {
    const existente = await fornecedorRepository.consultarFornecedores({ cnpj })

    if(existente.length > 0 && existente[0].id !== idAtual) {
        throw new Error("Fornecedor já registrado no sistema.")
    }
}

// Função responsável por validar o formato do CNPJ e limpar os caracteres especiais
const validarFormatoCnpj = (cnpj) => {
  //Remove espaços no começo e no final (caso o usuário digite com espaço)
  const cnpjTrim = cnpj.trim()

  // Regex que permite apenas: números, ponto, barra, traço
  const regexCnpj = /^[0-9./-]+$/

  // Testa se o CNPJ segue o padrão permitido
  if (!regexCnpj.test(cnpjTrim)) {
    throw new Error("Formato de dado inválido. Corrija as informações e tente novamente.")
  }

  // Remove tudo que não for número
  const cnpjLimpo = cnpjTrim.replace(/[^\d]+/g, "")

  return cnpjLimpo
}

// Regras de negócio - Fornecedor

export const cadastrarFornecedor = async(dados) => {
    validarCamposObrigatoriosFornecedor(dados)

    const cnpjLimpo = validarFormatoCnpj(dados.cnpj)

    await verificarDuplicidadeCnpj(dados.cnpj)

    return await fornecedorRepository.cadastrarFornecedor({
        ...dados,
        cnpj: cnpjLimpo
    })
}

export const listarFornecedores = async () => {
    return await fornecedorRepository.consultarFornecedores({})
}

export const editarFornecedores = async (id, dados) => {
    const fornecedor = await fornecedorRepository.buscarPorId(id)
    if(!fornecedor) {
        throw new Error("Fornecedor não encontrado")
    }

    validarCamposObrigatoriosFornecedor(dados)

    const cnpjLimpo = validarFormatoCnpj(dados.cnpj)

    await verificarDuplicidadeCnpj(dados.cnpj, id)

    return await fornecedorRepository.editarFornecedor(id, {
        ...dados,
        cnpj: cnpjLimpo
    })
}

export const inativarFornecedor = async (id) => {
    const fornecedor = await fornecedorRepository.buscarPorId(id)
    if(!fornecedor) {
        throw new Error("Fornecedor não encontrado")
    }
    return await fornecedorRepository.inativarFornecedor(id)
}
