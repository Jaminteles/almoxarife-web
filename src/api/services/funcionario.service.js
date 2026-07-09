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
  // 1) Validações que não dependem do banco — falham cedo, antes da transação.
  validarCamposFuncionario(dados)

  const cpfLimpo = limparCpf(dados.cpf)
  const emailLimpo = dados.email.trim().toLowerCase()

  if (dados.criarUsuario === true) {
    validarCamposUsuario(dados)
  }

  // 2) Validações de existência (leituras). As restrições UNIQUE do banco
  //    são a garantia final; aqui é só para devolver mensagens amigáveis.
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

  // 3) Transação: funcionário + usuário entram JUNTOS ou NENHUM entra.
  //    Se a criação do usuário falhar, o rollback desfaz também o funcionário
  //    (evita o "funcionário órfão" que ficava gravado sem credencial).
  const transacao = await funcionarioRepo.iniciarTransacao()
  try {
    await funcionarioRepo.criar(
      {
        id_funcionario: idFuncionario,
        nome: dados.nome.trim(),
        cpf: cpfLimpo,
        email: emailLimpo,
        id_cargo: dados.id_cargo,
        // Equipe é opcional: "" / 0 / undefined viram NULL (sem equipe).
        id_equipe: dados.id_equipe || null
      },
      transacao
    )

    if (dados.criarUsuario === true) {
      const passwordHash = await bcrypt.hash(dados.senha, 10)

      await funcionarioRepo.criarUsuario(
        {
          id_funcionario: idFuncionario,
          password_hash: passwordHash,
          access_level: dados.access_level || "CONSULTA"
        },
        transacao
      )
    }

    await transacao.commit()
  } catch (erro) {
    await transacao.rollback()
    throw erro
  }

  // 4) Leitura final já com tudo commitado.
  return await funcionarioRepo.buscarPorId(idFuncionario)
}

// ──────────────────────────────────────────────────────────────
// Listar / Buscar
// ──────────────────────────────────────────────────────────────

export const listarFuncionarios = async (filtros = {}) => {
  const filtrosLimpos = normalizarFiltros(filtros)
  return await funcionarioRepo.listarTodos(filtrosLimpos)
}

// Lista enxuta (id + nome) para selects de outros módulos. Ver repository.
export const listarFuncionariosParaSelecao = async () => {
  return await funcionarioRepo.listarParaSelecao()
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

  // 1) Monta e valida os dados do Funcionario (se vieram).
  let dadosFunc = null
  if (
    dados.nome !== undefined ||
    dados.cpf !== undefined ||
    dados.id_cargo !== undefined ||
    dados.email !== undefined ||
    dados.id_equipe !== undefined
  ) {
    dadosFunc = {
      nome: dados.nome ?? funcionario.nome,
      cpf: dados.cpf ?? funcionario.cpf,
      id_cargo: dados.id_cargo ?? funcionario.id_cargo,
      email: dados.email ?? funcionario.email,
      // "" / 0 → NULL (remove da equipe); undefined → mantém a atual.
      id_equipe:
        dados.id_equipe !== undefined ? (dados.id_equipe || null) : funcionario.id_equipe
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
  }

  // 2) Monta os dados de credencial (se vieram senha e/ou nível de acesso).
  let dadosUsuario = null
  if (dados.senha || dados.access_level !== undefined) {
    dadosUsuario = {}

    if (dados.senha) {
      if (dados.senha.length < 8) {
        throw new Error("Senha deve ter no mínimo 8 caracteres")
      }
      dadosUsuario.password_hash = await bcrypt.hash(dados.senha, 10)
    }

    if (dados.access_level !== undefined) {
      dadosUsuario.access_level = dados.access_level
    }

    if (Object.keys(dadosUsuario).length === 0) {
      dadosUsuario = null
    }
  }

  // 3) Nada para gravar → devolve o estado atual sem abrir transação.
  if (!dadosFunc && !dadosUsuario) {
    return funcionario
  }

  // Saber se o usuário já existe (leitura) antes de abrir a transação.
  let usuarioExistente = null
  if (dadosUsuario) {
    usuarioExistente = await funcionarioRepo.buscarUsuarioPorIdFuncionario(id)
  }

  // 4) Transação: funcionário e credencial são atualizados juntos.
  const transacao = await funcionarioRepo.iniciarTransacao()
  try {
    if (dadosFunc) {
      await funcionarioRepo.atualizar(id, dadosFunc, transacao)
    }

    if (dadosUsuario) {
      if (usuarioExistente) {
        await funcionarioRepo.atualizarUsuario(id, dadosUsuario, transacao)
      } else if (dados.senha) {
        // Só cria credencial se vier senha — ativar acesso exige senha.
        // Atualizar só o nível em quem não tem usuário não faz sentido.
        await funcionarioRepo.criarUsuario(
          {
            id_funcionario: id,
            password_hash: dadosUsuario.password_hash,
            access_level: dadosUsuario.access_level || "CONSULTA"
          },
          transacao
        )
      }
    }

    await transacao.commit()
  } catch (erro) {
    await transacao.rollback()
    throw erro
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
