/**
 * funcionario.service.js — Camada de Serviço
 */

import * as funcionarioRepo from "../repositories/funcionario.repository.js"
import * as cargoRepo from "../repositories/cargo.repository.js"
import bcrypt from "bcrypt"

// ═══ VALIDAÇÕES ═══

function validarCamposFuncionario(dados) {
  if (!dados.nome || dados.nome.trim().length < 3) {
    throw new Error("Nome deve ter pelo menos 3 caracteres")
  }
  if (!dados.cpf) {
    throw new Error("CPF é obrigatório")
  }
  if (!dados.id_cargo) {
    throw new Error("Cargo é obrigatório")
  }
}

function validarCamposUsuario(dados) {
  if (!dados.email) throw new Error("Email é obrigatório")
  validarEmail(dados.email)
  if (!dados.senha || dados.senha.length < 6) {
    throw new Error("Senha deve ter pelo menos 6 caracteres")
  }
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email)) {
    throw new Error("Formato de email inválido")
  }
}

function limparCpf(cpf) {
  return cpf.replace(/[^\d]/g, "")
}

// ═══ CRUD ═══

export const criarFuncionario = async (dados) => {
  // ═══ VALIDAÇÕES - ANTES DE QUALQUER INSERÇÃO ═══
  
  validarCamposFuncionario(dados)
  const cpfLimpo = limparCpf(dados.cpf)

  // Se informou email/senha, valida campos do usuário ANTES de inserir funcionário
  if (dados.email || dados.senha) {
    validarCamposUsuario(dados)
  }

  // ═══ VERIFICAÇÕES - Verifica duplicatas e referências ═══
  
  const existente = await funcionarioRepo.buscarPorCpf(cpfLimpo)
  if (existente) {
    throw new Error("CPF já cadastrado no sistema")
  }

  const cargo = await cargoRepo.buscarPorId(dados.id_cargo)
  if (!cargo) throw new Error("Cargo não encontrado")

  if (dados.email) {
    const emailExistente = await funcionarioRepo.buscarUsuarioPorEmail(dados.email)
    if (emailExistente) {
      throw new Error("Email já cadastrado no sistema")
    }
  }

  // ═══ CRIAÇÕES - Agora que TUDO foi validado ═══
  
  const dadosFuncionario = {
    nome: dados.nome.trim(),
    cpf: cpfLimpo,
    id_cargo: dados.id_cargo
  }
  const novoFuncionario = await funcionarioRepo.criar(dadosFuncionario)
  const idFuncionario = novoFuncionario.id_funcionario

  // Cria usuário do sistema se email e senha foram informados
  if (dados.email && dados.senha) {
    const passwordHash = await bcrypt.hash(dados.senha, 10)

    await funcionarioRepo.criarUsuario({
      id_funcionario: idFuncionario,
      email: dados.email,
      password_hash: passwordHash,
      access_level: dados.access_level || "CONSULTA"
    })
  }

  return await funcionarioRepo.buscarPorId(idFuncionario)
}

export const listarFuncionarios = async () => {
  return await funcionarioRepo.listarTodos()
}

export const buscarFuncionarioPorId = async (id) => {
  const funcionario = await funcionarioRepo.buscarPorId(id)
  if (!funcionario) {
    throw new Error("Funcionário não encontrado")
  }
  return funcionario
}

export const buscarFuncionarioPorCpf = async (cpf) => {
  const cpfLimpo = cpf.replace(/[^\d]/g, "")
  const funcionario = await funcionarioRepo.buscarPorCpf(cpfLimpo)
  if (!funcionario) {
    throw new Error("Funcionário não encontrado")
  }
  return funcionario
}

export const atualizarFuncionario = async (id, dados) => {
  const funcionario = await funcionarioRepo.buscarPorId(id)
  if (!funcionario) {
    throw new Error("Funcionário não encontrado")
  }

  if (dados.nome !== undefined || dados.cpf !== undefined || dados.id_cargo !== undefined) {
    const dadosFunc = {
      nome: dados.nome || funcionario.nome,
      cpf: dados.cpf || funcionario.cpf,
      id_cargo: dados.id_cargo || funcionario.id_cargo
    }
    validarCamposFuncionario(dadosFunc)

    if (dados.cpf) {
      const cpfLimpo = limparCpf(dados.cpf)
      const existente = await funcionarioRepo.buscarPorCpf(cpfLimpo)
      // UUID é string dos dois lados, !== funciona corretamente
      if (existente && existente.id_funcionario !== id) {
        throw new Error("CPF já cadastrado no sistema")
      }
      dadosFunc.cpf = cpfLimpo
    }

    if (dados.id_cargo) {
      const cargo = await cargoRepo.buscarPorId(dados.id_cargo)
      if (!cargo) throw new Error("Cargo não encontrado")
    }

    await funcionarioRepo.atualizar(id, dadosFunc)
  }

  // Atualizar dados do usuário se informados
  if (dados.email || dados.senha || dados.access_level !== undefined) {
    const dadosUsuario = {}

    if (dados.email) {
      validarEmail(dados.email)
      const emailExistente = await funcionarioRepo.buscarUsuarioPorEmail(dados.email)
      if (emailExistente && emailExistente.id_funcionario !== id) {
        throw new Error("Email já cadastrado no sistema")
      }
      dadosUsuario.email = dados.email
    }

    if (dados.senha) {
      dadosUsuario.password_hash = await bcrypt.hash(dados.senha, 10)
    }

    if (dados.access_level !== undefined) {
      dadosUsuario.access_level = dados.access_level
    }

    if (Object.keys(dadosUsuario).length > 0) {
      await funcionarioRepo.atualizarUsuario(id, dadosUsuario)
    }
  }

  return await funcionarioRepo.buscarPorId(id)
}

/**
 * INATIVAR FUNCIONÁRIO (RF008)
 *
 * Validações:
 * 1. Funcionário deve existir
 * 2. Deve estar ativo
 * 3. Não pode ter compras pendentes como responsável
 */
export const inativarFuncionario = async (id) => {
  const funcionario = await funcionarioRepo.buscarPorId(id)
  if (!funcionario) {
    throw new Error("Funcionário não encontrado")
  }

  if (funcionario.is_active === false || funcionario.is_active === 0) {
    throw new Error("Funcionário já está inativo")
  }

  const pendencias = await funcionarioRepo.verificarPendencias(id)
  if (pendencias && pendencias > 0) {
    throw new Error(
      "Não é possível inativar. Funcionário possui solicitações ou compras pendentes."
    )
  }

  return await funcionarioRepo.inativar(id)
}
