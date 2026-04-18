/**
 * fornecedor.service.js — Camada de Serviço
 */

import * as fornecedorRepo from "../repositories/fornecedor.repository.js"

// ═══ VALIDAÇÕES ═══

function validarCamposObrigatorios(dados) {
  if (!dados.razao_social || dados.razao_social.trim().length < 2) {
    throw new Error("Razão Social deve ter pelo menos 2 caracteres")
  }
  if (!dados.cnpj) {
    throw new Error("CNPJ é obrigatório")
  }
  if (!dados.email) {
    throw new Error("Email é obrigatório")
  }
}

function validarFormatoCnpj(cnpj) {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "")
  if (cnpjLimpo.length !== 14) {
    throw new Error("CNPJ deve ter 14 dígitos")
  }
  return cnpjLimpo
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email)) {
    throw new Error("Formato de email inválido")
  }
}

function validarEnderecos(enderecos) {
  if (!Array.isArray(enderecos)) return
  for (const e of enderecos) {
    if (!e.logradouro || !e.cidade || !e.estado) {
      throw new Error("Endereço deve ter logradouro, cidade e estado")
    }
  }
}

// ═══ CRUD ═══

export const cadastrarFornecedor = async (dados) => {
  validarCamposObrigatorios(dados)
  validarEmail(dados.email)

  const cnpjLimpo = validarFormatoCnpj(dados.cnpj)

  // Verifica CNPJ duplicado
  const cnpjExistente = await fornecedorRepo.buscarPorCnpj(cnpjLimpo)
  if (cnpjExistente) {
    throw new Error("CNPJ já registrado no sistema")
  }

  // Verifica email duplicado
  const emailExistente = await fornecedorRepo.buscarPorEmail(dados.email)
  if (emailExistente) {
    throw new Error("Email já registrado no sistema")
  }

  // Monta dados para criação
  const dadosCriacao = {
    razao_social: dados.razao_social.trim(),
    nome_fantasia: dados.nome_fantasia?.trim() || null,
    cnpj: cnpjLimpo,
    email: dados.email.trim()
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
  validarEmail(dados.email)

  const cnpjLimpo = validarFormatoCnpj(dados.cnpj)

  /**
   * VERIFICAÇÃO DE CNPJ DUPLICADO — COM parseInt(id)
   * 
   * A lógica é: "Existe outro fornecedor com esse CNPJ?"
   * 
   * parseInt(id) converte a string "5" para o número 5,
   * permitindo a comparação correta com id_fornecedor (que é number).
   * 
   * Se o CNPJ encontrado pertence ao PRÓPRIO fornecedor sendo editado,
   * não é duplicata → deixa passar.
   * Se pertence a OUTRO → bloqueia.
   */
  const cnpjExistente = await fornecedorRepo.buscarPorCnpj(cnpjLimpo)
  if (cnpjExistente && cnpjExistente.id_fornecedor !== parseInt(id)) {
    throw new Error("CNPJ já registrado no sistema")
  }

  // Mesma lógica para email — parseInt no id
  const emailExistente = await fornecedorRepo.buscarPorEmail(dados.email)
  if (emailExistente && emailExistente.id_fornecedor !== parseInt(id)) {
    throw new Error("Email já registrado no sistema")
  }

  // Atualiza dados principais
  await fornecedorRepo.atualizar(id, {
    razao_social: dados.razao_social.trim(),
    nome_fantasia: dados.nome_fantasia?.trim() || null,
    cnpj: cnpjLimpo,
    email: dados.email.trim()
  })

  // Substitui telefones se informados
  if (dados.telefones !== undefined) {
    await fornecedorRepo.substituirTelefones(id, dados.telefones)
  }

  // Substitui endereços se informados
  if (dados.enderecos !== undefined) {
    validarEnderecos(dados.enderecos)
    await fornecedorRepo.substituirEnderecos(id, dados.enderecos)
  }

  return await fornecedorRepo.buscarPorId(id)
}

/**
 * INATIVAR FORNECEDOR (RF012)
 *
 * Validações antes de inativar:
 * 1. Fornecedor deve existir
 * 2. Fornecedor deve estar ativo (não inativar quem já está inativo)
 * 3. Fornecedor não pode ter pedidos pendentes
 */
export const inativarFornecedor = async (id) => {
  const fornecedor = await fornecedorRepo.buscarPorId(id)
  if (!fornecedor) {
    throw new Error("Fornecedor não encontrado")
  }

  if (fornecedor.ativo === false || fornecedor.ativo === 0) {
    throw new Error("Fornecedor já está inativo")
  }

  const pedidosPendentes = await fornecedorRepo.verificarPedidosPendentes(id)
  if (pedidosPendentes && pedidosPendentes > 0) {
    throw new Error(
      "Não é possível inativar um fornecedor com pedidos em andamento."
    )
  }

  return await fornecedorRepo.inativar(id)
}
