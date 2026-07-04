// ──────────────────────────────────────────────────────────────
// Escopo de almoxarifado do usuário.
//
// Um usuário não-CENTRAL pode ficar restrito a UM almoxarifado
// (Usuarios_Sistema.cod_almoxarifado). O CENTRAL nunca tem restrição.
//
// Estas funções são a base do isolamento de dados: os services usam o
// valor devolvido por `escopoAlmoxarifado` para filtrar listas e para
// travar/validar as operações de escrita.
// ──────────────────────────────────────────────────────────────

/**
 * Devolve o cod_almoxarifado ao qual o usuário está restrito,
 * ou null quando NÃO há restrição (CENTRAL, ou usuário sem vínculo).
 */
export function escopoAlmoxarifado(usuario) {
  if (!usuario) return null
  if (usuario.access_level === "CENTRAL") return null
  return usuario.cod_almoxarifado ?? null
}

/**
 * Garante que o usuário pode operar sobre o almoxarifado `cod`.
 * Se houver escopo e ele for diferente, lança um erro 403.
 */
export function assertAcessoAlmoxarifado(escopo, cod) {
  if (escopo != null && Number(cod) !== Number(escopo)) {
    const erro = new Error("Acesso restrito ao seu almoxarifado")
    erro.status = 403
    throw erro
  }
}
