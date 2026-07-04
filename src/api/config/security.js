// ──────────────────────────────────────────────────────────────
// Configuração de segurança do JWT.
//
// Em PRODUÇÃO defina JWT_SECRET como variável de ambiente. O valor
// padrão abaixo serve apenas para desenvolvimento local — se ele for
// usado, um aviso é emitido no console para não passar despercebido.
// ──────────────────────────────────────────────────────────────

const SEGREDO_PADRAO = "dev-secret-troque-em-producao-almoxarifado-gilfer"

export const JWT_SECRET = process.env.JWT_SECRET || SEGREDO_PADRAO

// Tempo de validade do token (formato aceito pelo jsonwebtoken: "8h", "1d"...).
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h"

// Custo do bcrypt para gerar hashes de senha (mesmo usado no cadastro).
export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10

if (JWT_SECRET === SEGREDO_PADRAO) {
  console.warn(
    "[SEGURANÇA] JWT_SECRET não definido — usando segredo de desenvolvimento. " +
    "Defina JWT_SECRET no ambiente antes de ir para produção."
  )
}
