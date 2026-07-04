import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import * as solicitacaoRepo from "../repositories/solicitacao.repository.js"
import * as funcionarioRepo from "../repositories/funcionario.repository.js"
import * as cargoRepo from "../repositories/cargo.repository.js"
import * as almoxarifadoRepo from "../repositories/almoxarifado.repository.js"
import { validarEmail } from "../utils/validations/email.validation.js"
import { NIVEIS } from "../config/permissions.js"
import { BCRYPT_ROUNDS } from "../config/security.js"

const erroHttp = (mensagem, status) => Object.assign(new Error(mensagem), { status })

const limparCpf = (cpf) => {
  const digitos = String(cpf || "").replace(/[^\d]/g, "")
  if (digitos.length !== 11) {
    throw erroHttp("CPF deve conter 11 dígitos", 400)
  }
  return digitos
}

// ──────────────────────────────────────────────────────────────
// Pedido público de cadastro. A pessoa informa seus dados e uma senha;
// gravamos a solicitação como PENDENTE (senha já em hash). O CENTRAL
// decide depois.
// ──────────────────────────────────────────────────────────────
export const solicitarCadastro = async (dados) => {
  if (!dados.nome || !dados.cpf || !dados.email || !dados.senha) {
    throw erroHttp("Campos obrigatórios: nome, cpf, email e senha", 400)
  }
  if (String(dados.senha).length < 8) {
    throw erroHttp("Senha deve ter no mínimo 8 caracteres", 400)
  }
  validarEmail(dados.email)

  const cpf = limparCpf(dados.cpf)
  const email = String(dados.email).trim().toLowerCase()
  const nome = String(dados.nome).trim()

  // Já é funcionário? (e-mail/CPF já cadastrados)
  const existeEmail = await funcionarioRepo.buscarPorEmail(email)
  if (existeEmail) {
    throw erroHttp("Este e-mail já possui cadastro no sistema", 409)
  }
  const existeCpf = await funcionarioRepo.buscarPorCpf(cpf)
  if (existeCpf) {
    throw erroHttp("Este CPF já possui cadastro no sistema", 409)
  }

  // Já há uma solicitação pendente com estes dados?
  const pendente = await solicitacaoRepo.existePendentePorEmailOuCpf(email, cpf)
  if (pendente) {
    throw erroHttp("Já existe uma solicitação pendente para este e-mail ou CPF", 409)
  }

  const passwordHash = await bcrypt.hash(dados.senha, BCRYPT_ROUNDS)

  const criada = await solicitacaoRepo.criar({
    nome,
    cpf,
    email,
    password_hash: passwordHash,
    mensagem: dados.mensagem ? String(dados.mensagem).trim().slice(0, 255) : null,
    status: "PENDENTE"
  })

  // Nunca devolve o hash.
  return {
    id_solicitacao: criada.id_solicitacao,
    nome: criada.nome,
    email: criada.email,
    status: criada.status
  }
}

export const listarSolicitacoes = async (status) => {
  return await solicitacaoRepo.listar(status)
}

// ──────────────────────────────────────────────────────────────
// Aprovação (CENTRAL). Cria o funcionário + credencial, define o nível e,
// se não for CENTRAL, vincula a UM almoxarifado. Marca a solicitação como
// APROVADO. Tudo numa transação.
// ──────────────────────────────────────────────────────────────
export const aprovarSolicitacao = async (id, dados) => {
  const solicitacao = await solicitacaoRepo.buscarPorId(id)
  if (!solicitacao) {
    throw erroHttp("Solicitação não encontrada", 404)
  }
  if (solicitacao.status !== "PENDENTE") {
    throw erroHttp("Esta solicitação já foi decidida", 400)
  }

  const accessLevel = dados.access_level
  if (!NIVEIS.includes(accessLevel)) {
    throw erroHttp("Nível de acesso inválido", 400)
  }

  if (!dados.id_cargo) {
    throw erroHttp("Selecione o cargo do funcionário", 400)
  }
  const cargo = await cargoRepo.buscarPorId(dados.id_cargo)
  if (!cargo) {
    throw erroHttp("Cargo não encontrado", 400)
  }

  // Regra central do pedido: quem NÃO é CENTRAL precisa de um almoxarifado e
  // ficará restrito a ele. CENTRAL nunca tem vínculo.
  let codAlmoxarifado = null
  if (accessLevel !== "CENTRAL") {
    if (!dados.cod_almoxarifado) {
      throw erroHttp("Usuários que não são CENTRAL precisam ser vinculados a um almoxarifado", 400)
    }
    const almox = await almoxarifadoRepo.buscarPorId(dados.cod_almoxarifado)
    if (!almox || almox.ativo === 0) {
      throw erroHttp("Almoxarifado não encontrado", 400)
    }
    codAlmoxarifado = almox.cod_almoxarifado
  }

  // Revalida duplicidade (algo pode ter mudado desde a solicitação).
  if (await funcionarioRepo.buscarPorEmail(solicitacao.email)) {
    throw erroHttp("Este e-mail já possui cadastro no sistema", 409)
  }
  if (await funcionarioRepo.buscarPorCpf(solicitacao.cpf)) {
    throw erroHttp("Este CPF já possui cadastro no sistema", 409)
  }

  const idFuncionario = uuidv4()

  const transacao = await funcionarioRepo.iniciarTransacao()
  try {
    await funcionarioRepo.criar(
      {
        id_funcionario: idFuncionario,
        nome: solicitacao.nome,
        cpf: solicitacao.cpf,
        email: solicitacao.email,
        id_cargo: cargo.id_cargo,
        // O vínculo de almoxarifado fica no Funcionário.
        cod_almoxarifado: codAlmoxarifado
      },
      transacao
    )

    await funcionarioRepo.criarUsuario(
      {
        id_funcionario: idFuncionario,
        password_hash: solicitacao.password_hash, // já é hash
        access_level: accessLevel
      },
      transacao
    )

    await solicitacaoRepo.atualizarDecisao(
      id,
      { status: "APROVADO", data_decisao: new Date() },
      transacao
    )

    await transacao.commit()
  } catch (erro) {
    await transacao.rollback()
    throw erro
  }

  return await funcionarioRepo.buscarPorId(idFuncionario)
}

export const rejeitarSolicitacao = async (id, motivo) => {
  const solicitacao = await solicitacaoRepo.buscarPorId(id)
  if (!solicitacao) {
    throw erroHttp("Solicitação não encontrada", 404)
  }
  if (solicitacao.status !== "PENDENTE") {
    throw erroHttp("Esta solicitação já foi decidida", 400)
  }

  await solicitacaoRepo.atualizarDecisao(id, {
    status: "REJEITADO",
    motivo_rejeicao: motivo ? String(motivo).trim().slice(0, 255) : null,
    data_decisao: new Date()
  })

  return { id_solicitacao: Number(id), status: "REJEITADO" }
}
