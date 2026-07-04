import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import * as authRepo from "../repositories/auth.repository.js"
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/security.js"

// Erro com status HTTP embutido, para o controller responder o código certo.
const erroHttp = (mensagem, status) => Object.assign(new Error(mensagem), { status })

// ──────────────────────────────────────────────────────────────
// login(email, senha)
// - Valida credenciais contra Funcionarios (e-mail) + Usuarios_Sistema (hash).
// - Mensagem genérica para email/senha inválidos (evita enumeração de usuários).
// - Bloqueia usuários com `bloqueado = 1`.
// - Atualiza `ultimo_login` e devolve { token, usuario }.
// ──────────────────────────────────────────────────────────────
export async function login(email, senha) {
  if (!email || !senha) {
    throw erroHttp("Email e senha são obrigatórios", 400)
  }

  const emailLimpo = String(email).trim().toLowerCase()
  const funcionario = await authRepo.buscarCredencialPorEmail(emailLimpo)

  // Funcionário inexistente OU sem credencial de acesso → mesma mensagem.
  if (!funcionario || !funcionario.usuario) {
    throw erroHttp("Email ou senha inválidos", 401)
  }

  const usuario = funcionario.usuario

  if (usuario.bloqueado) {
    throw erroHttp("Usuário bloqueado. Contate o administrador.", 403)
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.password_hash)
  if (!senhaConfere) {
    throw erroHttp("Email ou senha inválidos", 401)
  }

  await authRepo.registrarUltimoLogin(funcionario.id_funcionario)

  const payload = {
    id_funcionario: funcionario.id_funcionario,
    nome: funcionario.nome,
    access_level: usuario.access_level,
    // Escopo de almoxarifado embutido no token (null para CENTRAL).
    // O vínculo fica no Funcionário (não na credencial).
    cod_almoxarifado: funcionario.cod_almoxarifado ?? null
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

  return {
    token,
    usuario: {
      id_funcionario: funcionario.id_funcionario,
      nome: funcionario.nome,
      email: funcionario.email,
      cargo: funcionario.cargo?.nome_cargo || null,
      access_level: usuario.access_level,
      cod_almoxarifado: funcionario.cod_almoxarifado ?? null,
      almoxarifado: funcionario.almoxarifado?.nome || null
    }
  }
}
