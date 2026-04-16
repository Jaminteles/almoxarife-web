import * as fornecedorRepo from "../repositories/fornecedor.repository.js"
import { validarEmail } from "../utils/validations/email.validation.js"

// ── Validações ──

const validarCamposObrigatorios = (dados) => {
  if (!dados.razao_social || !dados.cnpj || !dados.email) {
    throw new Error("Campos obrigatórios: razao_social, cnpj, email")
  }
  validarEmail(dados.email)
}

const validarFormatoCnpj = (cnpj) => {
  const cnpjTrim = cnpj.trim()
  const regexCnpj = /^[0-9./-]+$/

  if (!regexCnpj.test(cnpjTrim)) {
    throw new Error("Formato de CNPJ inválido. Use apenas números, pontos, barras e traços.")
  }

  const cnpjLimpo = cnpjTrim.replace(/[^\d]+/g, "")

  if (cnpjLimpo.length !== 14) {
    throw new Error("CNPJ deve conter 14 dígitos")
  }

  return cnpjLimpo
}

const validarEnderecos = (enderecos) => {
  if (!enderecos || enderecos.length === 0) return

  for (const end of enderecos) {
    if (!end.cep || !end.logradouro || !end.numero || !end.bairro || !end.cidade || !end.estado) {
      throw new Error("Endereço incompleto. Campos obrigatórios: cep, logradouro, numero, bairro, cidade, estado")
    }
    // Limpar CEP
    end.cep = end.cep.replace(/[^\d]/g, "")
    if (end.cep.length !== 8) {
      throw new Error("CEP deve conter 8 dígitos")
    }
  }
}

// ── Regras de Negócio ──

export const cadastrarFornecedor = async (dados) => {
  validarCamposObrigatorios(dados)

  const cnpjLimpo = validarFormatoCnpj(dados.cnpj)

  // Verificar duplicidade de CNPJ
  const cnpjExistente = await fornecedorRepo.buscarPorCnpj(cnpjLimpo)
  if (cnpjExistente) {
    throw new Error("CNPJ já registrado no sistema")
  }

  // Verificar duplicidade de email
  const emailExistente = await fornecedorRepo.buscarPorEmail(dados.email)
  if (emailExistente) {
    throw new Error("Email já registrado no sistema")
  }

  // Validar endereços se informados
  validarEnderecos(dados.enderecos)

  // Montar objeto para criação (com nested create)
  const dadosCriacao = {
    razao_social: dados.razao_social,
    nome_fantasia: dados.nome_fantasia || null,
    cnpj: cnpjLimpo,
    email: dados.email
  }

  // Telefones
  if (dados.telefones && dados.telefones.length > 0) {
    dadosCriacao.telefones = dados.telefones.map(t => ({ telefone: t }))
  }

  // Endereços
  if (dados.enderecos && dados.enderecos.length > 0) {
    dadosCriacao.enderecos = dados.enderecos
  }

  const fornecedor = await fornecedorRepo.criar(dadosCriacao)
  return await fornecedorRepo.buscarPorId(fornecedor.id_fornecedor)
}

export const listarFornecedores = async () => {
  return await fornecedorRepo.listarTodos()
}

export const buscarFornecedorPorId = async (id) => {
  const fornecedor = await fornecedorRepo.buscarPorId(id)
  if (!fornecedor) {
    throw new Error("Fornecedor não encontrado")
  }
  return fornecedor
}

export const editarFornecedor = async (id, dados) => {
  const fornecedor = await fornecedorRepo.buscarPorId(id)
  if (!fornecedor) {
    throw new Error("Fornecedor não encontrado")
  }

  validarCamposObrigatorios(dados)

  const cnpjLimpo = validarFormatoCnpj(dados.cnpj)

  // Verificar duplicidade de CNPJ (excluindo o próprio)
  const cnpjExistente = await fornecedorRepo.buscarPorCnpj(cnpjLimpo)
  if (cnpjExistente && cnpjExistente.id_fornecedor !== parseInt(id)) {
    throw new Error("CNPJ já registrado no sistema")
  }

  // Verificar duplicidade de email
  const emailExistente = await fornecedorRepo.buscarPorEmail(dados.email)
  if (emailExistente && emailExistente.id_fornecedor !== parseInt(id)) {
    throw new Error("Email já registrado no sistema")
  }

  // Atualizar dados principais
  await fornecedorRepo.atualizar(id, {
    razao_social: dados.razao_social,
    nome_fantasia: dados.nome_fantasia || null,
    cnpj: cnpjLimpo,
    email: dados.email
  })

  // Atualizar telefones (substituir todos)
  if (dados.telefones !== undefined) {
    await fornecedorRepo.substituirTelefones(id, dados.telefones)
  }

  // Atualizar endereços (substituir todos)
  if (dados.enderecos !== undefined) {
    validarEnderecos(dados.enderecos)
    await fornecedorRepo.substituirEnderecos(id, dados.enderecos)
  }

  return await fornecedorRepo.buscarPorId(id)
}

export const inativarFornecedor = async (id) => {
  const fornecedor = await fornecedorRepo.buscarPorId(id)
  if (!fornecedor) {
    throw new Error("Fornecedor não encontrado")
  }
  return await fornecedorRepo.inativar(id)
}
