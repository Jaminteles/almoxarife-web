// ──────────────────────────────────────────────────────────────
// Configuração de segurança do JWT.
//
// Em PRODUÇÃO defina JWT_SECRET como variável de ambiente. O valor
// padrão abaixo serve apenas para desenvolvimento local — se ele for
// usado, um aviso é emitido no console para não passar despercebido.
// ──────────────────────────────────────────────────────────────

const SEGREDO_PADRAO = "a7738cee3d710c514becbcb5248ef5e6fb651ee6cd16040bcbd77570615dbaaffcd5f1036c68da8c3efec3d92213d23c8bcea9d99184d38b93aa452c3df3771b"

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
