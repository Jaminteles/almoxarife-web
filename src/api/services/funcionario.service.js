import * as funcionarioRepo from "../repositories/funcionario.repository.js"
import * as cargoRepo from "../repositories/cargo.repository.js"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { validarEmail } from "../utils/validations/email.validation.js"

// ── Validações ──

const validarCamposFuncionario = (dados) => {
  if (!dados.nome || !dados.cpf || !dados.id_cargo) {
    throw new Error("Campos obrigatórios: nome, cpf, id_cargo")
  }
}

const validarCamposUsuario = (dados) => {
  if (!dados.email || !dados.senha) {
    throw new Error("Campos obrigatórios para usuário: email, senha")
  }
  validarEmail(dados.email)
}

const limparCpf = (cpf) => {
  const cpfTrim = cpf.trim()
  const cpfLimpo = cpfTrim.replace(/[^\d]/g, "")
  if (cpfLimpo.length !== 11) {
    throw new Error("CPF deve conter 11 dígitos")
  }
  return cpfLimpo
}

// ── Regras de Negócio ──

export const criarFuncionario = async (dados) => {
  validarCamposFuncionario(dados)

  const cpfLimpo = limparCpf(dados.cpf)

  // Verificar se o cargo existe
  const cargo = await cargoRepo.buscarPorId(dados.id_cargo)
  if (!cargo) {
    throw new Error("Cargo não encontrado")
  }

  // Verificar duplicidade de CPF
  const existente = await funcionarioRepo.buscarPorCpf(cpfLimpo)
  if (existente) {
    throw new Error("CPF já cadastrado no sistema")
  }

  const idFuncionario = uuidv4()

  // Criar funcionário
  const funcionario = await funcionarioRepo.criar({
    id_funcionario: idFuncionario,
    nome: dados.nome,
    cpf: cpfLimpo,
    id_cargo: dados.id_cargo
  })

  // Se veio dados de usuário, criar usuário do sistema
  if (dados.email && dados.senha) {
    validarCamposUsuario(dados)

    // Verificar email duplicado
    const emailExistente = await funcionarioRepo.buscarUsuarioPorEmail(dados.email)
    if (emailExistente) {
      throw new Error("Email já cadastrado no sistema")
    }

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

  // Validar campos do funcionário
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

export const inativarFuncionario = async (id) => {
  const funcionario = await funcionarioRepo.buscarPorId(id)
  if (!funcionario) {
    throw new Error("Funcionário não encontrado")
  }
  return await funcionarioRepo.inativar(id)
}
