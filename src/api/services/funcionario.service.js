import * as funcionarioRepo from "../repositories/funcionario.repository.js"
import * as cargoRepo from "../repositories/cargo.repository.js"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { validarEmail } from "../utils/validations/email.validation.js"
 
// ──────────────────────────────────────────────────────────────
// VALIDAÇÕES
// ──────────────────────────────────────────────────────────────
const validarCamposFuncionario = (dados) => {
  if (!dados.nome || !dados.cpf || !dados.id_cargo || !dados.email) {
    throw new Error("Campos obrigatórios: nome, cpf, id_cargo, email")
  }
  validarEmail(dados.email)
}
 
const validarCamposUsuario = (dados) => {
  if (!dados.senha) {
    throw new Error("Senha é obrigatória para criar acesso ao sistema")
  }
  if (dados.senha.length < 8) {
    throw new Error("Senha deve ter no mínimo 8 caracteres")
  }
}
 
const limparCpf = (cpf) => {
  const cpfTrim = cpf.trim()
  const cpfLimpo = cpfTrim.replace(/[^\d]/g, "")
  if (cpfLimpo.length !== 11) {
    throw new Error("CPF deve conter 11 dígitos")
  }
  return cpfLimpo
}
 
// ──────────────────────────────────────────────────────────────
// Normalização de filtros de busca
// ──────────────────────────────────────────────────────────────
const normalizarFiltros = (filtros = {}) => {
  const limpos = {}
  const trim = (v) => (typeof v === "string" ? v.trim() : v)
 
  if (trim(filtros.nome)) limpos.nome = trim(filtros.nome)
  if (trim(filtros.email)) limpos.email = trim(filtros.email)
  if (trim(filtros.cargo)) limpos.cargo = trim(filtros.cargo)
 
  if (trim(filtros.cpf)) {
    const cpfDigitos = trim(filtros.cpf).replace(/[^\d]/g, "")
    if (cpfDigitos.length > 0) limpos.cpf = cpfDigitos
  }
 
  return limpos
}
 
// ──────────────────────────────────────────────────────────────
// REGRAS DE NEGÓCIO
// ──────────────────────────────────────────────────────────────
 
export const criarFuncionario = async (dados) => {
  validarCamposFuncionario(dados)
 
  const cpfLimpo = limparCpf(dados.cpf)
  const emailLimpo = dados.email.trim().toLowerCase()
  const cargo = await cargoRepo.buscarPorId(dados.id_cargo)
  if (!cargo) {
    throw new Error("Cargo não encontrado")
  }
 
  const existenteCpf = await funcionarioRepo.buscarPorCpf(cpfLimpo)
  if (existenteCpf) {
    throw new Error("CPF já cadastrado no sistema")
  }
 
  const existenteEmail = await funcionarioRepo.buscarPorEmail(emailLimpo)
  if (existenteEmail) {
    throw new Error("Email já cadastrado no sistema")
  }
 
  const idFuncionario = uuidv4()
 
  await funcionarioRepo.criar({
    id_funcionario: idFuncionario,
    nome: dados.nome.trim(),
    cpf: cpfLimpo,
    email: emailLimpo,
    id_cargo: dados.id_cargo
  })

  if (dados.criarUsuario === true) {
    validarCamposUsuario(dados)
 
    const passwordHash = await bcrypt.hash(dados.senha, 10)
 
    await funcionarioRepo.criarUsuario({
      id_funcionario: idFuncionario,
      password_hash: passwordHash,
      access_level: dados.access_level || "CONSULTA"
    })
  }
 
  return await funcionarioRepo.buscarPorId(idFuncionario)
}
 
// ──────────────────────────────────────────────────────────────
// Listar / Buscar
// ──────────────────────────────────────────────────────────────
 
export const listarFuncionarios = async (filtros = {}) => {
  const filtrosLimpos = normalizarFiltros(filtros)
  return await funcionarioRepo.listarTodos(filtrosLimpos)
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
 
// ──────────────────────────────────────────────────────────────
// Atualizar
// ──────────────────────────────────────────────────────────────
 
export const atualizarFuncionario = async (id, dados) => {
  const funcionario = await funcionarioRepo.buscarPorId(id)
  if (!funcionario) {
    throw new Error("Funcionário não encontrado")
  }
 
  // ── Atualiza dados do Funcionario ───────────────────────────
  if (
    dados.nome !== undefined ||
    dados.cpf !== undefined ||
    dados.id_cargo !== undefined ||
    dados.email !== undefined
  ) {
    const dadosFunc = {
      nome: dados.nome ?? funcionario.nome,
      cpf: dados.cpf ?? funcionario.cpf,
      id_cargo: dados.id_cargo ?? funcionario.id_cargo,
      email: dados.email ?? funcionario.email
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
 
    if (dados.email && dados.email.trim().toLowerCase() !== funcionario.email) {
      const emailLimpo = dados.email.trim().toLowerCase()
      const existenteEmail = await funcionarioRepo.buscarPorEmail(emailLimpo)
      if (existenteEmail && existenteEmail.id_funcionario !== id) {
        throw new Error("Email já cadastrado no sistema")
      }
      dadosFunc.email = emailLimpo
    }
 
    if (dados.id_cargo) {
      const cargo = await cargoRepo.buscarPorId(dados.id_cargo)
      if (!cargo) throw new Error("Cargo não encontrado")
    }
 
    await funcionarioRepo.atualizar(id, dadosFunc)
  }
 
  // ── Atualiza credencial de acesso (se enviou senha ou nível) ─
  if (dados.senha || dados.access_level !== undefined) {
    const dadosUsuario = {}
 
    if (dados.senha) {
      if (dados.senha.length < 8) {
        throw new Error("Senha deve ter no mínimo 8 caracteres")
      }
      dadosUsuario.password_hash = await bcrypt.hash(dados.senha, 10)
    }
 
    if (dados.access_level !== undefined) {
      dadosUsuario.access_level = dados.access_level
    }
 
    if (Object.keys(dadosUsuario).length > 0) {
      // Se o funcionário já tem usuário → atualiza.
      // Se não tem → cria (caso o admin esteja "ativando" o acesso na edição).
      const usuarioExistente = await funcionarioRepo.buscarUsuarioPorIdFuncionario(id)
      if (usuarioExistente) {
        await funcionarioRepo.atualizarUsuario(id, dadosUsuario)
      } else if (dados.senha) {
        // Só cria se vier senha — atualizar só nível em alguém sem usuário não faz sentido.
        await funcionarioRepo.criarUsuario({
          id_funcionario: id,
          password_hash: dadosUsuario.password_hash,
          access_level: dadosUsuario.access_level || "CONSULTA"
        })
      }
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
