import * as equipeRepo from "../repositories/equipe.repository.js"

// ──────────────────────────────────────────────────────────────
// Normalização / validação
// ──────────────────────────────────────────────────────────────
const normalizarNome = (nome) => {
  if (!nome || !String(nome).trim()) {
    throw new Error("O nome da equipe é obrigatório")
  }
  return String(nome).trim()
}

// Os funcionários são OPCIONAIS. Aceita [] / undefined e devolve uma lista
// de ids únicos (strings — o id do funcionário é UUID).
const normalizarFuncionarios = (funcionarios = []) => {
  if (!Array.isArray(funcionarios)) return []
  const ids = funcionarios
    .map((f) => (typeof f === "object" ? f.id_funcionario : f))
    .filter((id) => typeof id === "string" && id.trim() !== "")
  return Array.from(new Set(ids))
}

const normalizarFiltros = (filtros = {}) => {
  const limpos = {}
  if (filtros.nome && String(filtros.nome).trim()) {
    limpos.nome = String(filtros.nome).trim()
  }
  return limpos
}

// ──────────────────────────────────────────────────────────────
// Regras de negócio
// ──────────────────────────────────────────────────────────────
export const listarEquipes = async (filtros = {}) => {
  return await equipeRepo.listarTodos(normalizarFiltros(filtros))
}

export const listarEquipesParaSelecao = async () => {
  return await equipeRepo.listarParaSelecao()
}

export const buscarEquipePorId = async (id) => {
  const equipe = await equipeRepo.buscarPorId(id)
  if (!equipe) {
    throw new Error("Equipe não encontrada")
  }
  return equipe
}

export const criarEquipe = async (dados) => {
  const nome = normalizarNome(dados.nome)
  const funcionarios = normalizarFuncionarios(dados.funcionarios)

  const transacao = await equipeRepo.iniciarTransacao()
  try {
    const equipe = await equipeRepo.criar({ nome }, transacao)
    await equipeRepo.definirMembros(equipe.id_equipe, funcionarios, transacao)
    await transacao.commit()
    return await equipeRepo.buscarPorId(equipe.id_equipe)
  } catch (erro) {
    await transacao.rollback()
    throw erro
  }
}

export const atualizarEquipe = async (id, dados) => {
  const equipe = await equipeRepo.buscarPorId(id)
  if (!equipe) {
    throw new Error("Equipe não encontrada")
  }

  const nome = dados.nome !== undefined ? normalizarNome(dados.nome) : equipe.nome
  const funcionarios = normalizarFuncionarios(dados.funcionarios)

  const transacao = await equipeRepo.iniciarTransacao()
  try {
    await equipeRepo.atualizar(id, { nome }, transacao)
    // Reconcilia a composição: limpa os atuais e coloca a nova lista.
    await equipeRepo.limparMembros(id, transacao)
    await equipeRepo.definirMembros(id, funcionarios, transacao)
    await transacao.commit()
    return await equipeRepo.buscarPorId(id)
  } catch (erro) {
    await transacao.rollback()
    throw erro
  }
}

export const inativarEquipe = async (id) => {
  const equipe = await equipeRepo.buscarPorId(id)
  if (!equipe) {
    throw new Error("Equipe não encontrada")
  }

  const transacao = await equipeRepo.iniciarTransacao()
  try {
    // Solta os funcionários antes de inativar (a equipe deixa de existir para eles).
    await equipeRepo.limparMembros(id, transacao)
    await equipeRepo.inativar(id, transacao)
    await transacao.commit()
  } catch (erro) {
    await transacao.rollback()
    throw erro
  }
}
