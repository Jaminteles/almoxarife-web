// ──────────────────────────────────────────────────────────────
// Matriz de permissões por nível de acesso.
//
// Para cada módulo definimos:
//   - viewers: níveis que podem LER (métodos GET/HEAD)
//   - editors: níveis que podem ESCREVER (POST/PUT/PATCH/DELETE)
//
// Esta é a ÚNICA fonte da verdade no back-end. O front-end tem um
// espelho em src/auth/permissions.js — mantenha os dois em sincronia.
//
// Níveis (ENUM da tabela Usuarios_Sistema):
//   CENTRAL    → administração central (acesso total, inclui usuários)
//   ALMOXARIFE → gestor de almoxarifado (operacional, sem funcionários)
//   AUXILIAR   → auxiliar (cria saídas; demais telas só leitura)
//   CONSULTA   → somente leitura
// ──────────────────────────────────────────────────────────────

export const NIVEIS = ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"]

export const PERMISSOES = {
  funcionarios:  { viewers: ["CENTRAL"],                                      editors: ["CENTRAL"] },
  fornecedores:  { viewers: ["CENTRAL", "ALMOXARIFE"],                        editors: ["CENTRAL", "ALMOXARIFE"] },
  produtos:      { viewers: ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"], editors: ["CENTRAL", "ALMOXARIFE"] },
  almoxarifados: { viewers: ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"], editors: ["CENTRAL", "ALMOXARIFE"] },
  compras:       { viewers: ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"],            editors: ["CENTRAL", "ALMOXARIFE"] },
  saidas:        { viewers: ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"], editors: ["CENTRAL", "ALMOXARIFE", "AUXILIAR"] },
  // Módulo de apoio: o combo de cargos é lido por quem cadastra funcionários.
  cargos:        { viewers: ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"], editors: ["CENTRAL"] }
}

const METODOS_LEITURA = ["GET", "HEAD", "OPTIONS"]

/**
 * Diz se um nível pode acessar um módulo para o método HTTP informado.
 * Leitura usa `viewers`; escrita usa `editors`.
 */
export function nivelPodeAcessar(nivel, modulo, metodo) {
  const regra = PERMISSOES[modulo]
  if (!regra) return false
  const lista = METODOS_LEITURA.includes(metodo) ? regra.viewers : regra.editors
  return lista.includes(nivel)
}
