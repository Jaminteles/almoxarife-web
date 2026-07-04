import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/security.js"
import { nivelPodeAcessar } from "../config/permissions.js"

// ──────────────────────────────────────────────────────────────
// autenticar
// Exige um token JWT válido no header Authorization: Bearer <token>.
// Em caso de sucesso, popula req.usuario = { id_funcionario, nome, access_level }.
// ──────────────────────────────────────────────────────────────
export function autenticar(req, res, next) {
  const header = req.headers.authorization || ""
  const [tipo, token] = header.split(" ")

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ sucesso: false, erro: "Token de acesso não fornecido" })
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ sucesso: false, erro: "Token inválido ou expirado" })
  }
}

// ──────────────────────────────────────────────────────────────
// autorizar(...niveis)
// Permite apenas os níveis informados. Ex.: autorizar("CENTRAL").
// Deve vir DEPOIS de `autenticar`.
// ──────────────────────────────────────────────────────────────
export function autorizar(...niveis) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ sucesso: false, erro: "Não autenticado" })
    }
    if (!niveis.includes(req.usuario.access_level)) {
      return res.status(403).json({ sucesso: false, erro: "Acesso negado para o seu nível de permissão" })
    }
    next()
  }
}

// ──────────────────────────────────────────────────────────────
// autorizarModulo(modulo)
// Autorização baseada na matriz de permissões: consulta a leitura vs
// escrita conforme o método HTTP da requisição.
// Deve vir DEPOIS de `autenticar`.
// ──────────────────────────────────────────────────────────────
export function autorizarModulo(modulo) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ sucesso: false, erro: "Não autenticado" })
    }
    if (!nivelPodeAcessar(req.usuario.access_level, modulo, req.method)) {
      return res.status(403).json({ sucesso: false, erro: "Acesso negado para o seu nível de permissão" })
    }
    next()
  }
}
