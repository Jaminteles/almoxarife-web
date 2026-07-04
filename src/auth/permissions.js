// ──────────────────────────────────────────────────────────────
// Espelho da matriz de permissões do back-end
// (src/api/config/permissions.js). Mantenha os dois em sincronia.
//
// Usado para:
//   - filtrar o menu por nível de acesso (o que o usuário VÊ);
//   - guardas de rota (RequireModule);
//   - esconder/mostrar botões de escrita (podeEditar).
// ──────────────────────────────────────────────────────────────

export const NIVEIS = ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"];

// Rótulos amigáveis para exibição.
export const ROTULO_NIVEL = {
  CENTRAL: "Administração Central",
  ALMOXARIFE: "Almoxarife",
  AUXILIAR: "Auxiliar",
  CONSULTA: "Consulta",
};

export const PERMISSOES = {
  funcionarios:  { viewers: ["CENTRAL"],                                       editors: ["CENTRAL"] },
  fornecedores:  { viewers: ["CENTRAL", "ALMOXARIFE"],                         editors: ["CENTRAL", "ALMOXARIFE"] },
  produtos:      { viewers: ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"], editors: ["CENTRAL", "ALMOXARIFE"] },
  almoxarifados: { viewers: ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"], editors: ["CENTRAL", "ALMOXARIFE"] },
  compras:       { viewers: ["CENTRAL", "ALMOXARIFE", "CONSULTA"],             editors: ["CENTRAL", "ALMOXARIFE"] },
  saidas:        { viewers: ["CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"], editors: ["CENTRAL", "ALMOXARIFE", "AUXILIAR"] },
};

export function podeVer(nivel, modulo) {
  return !!PERMISSOES[modulo]?.viewers.includes(nivel);
}

export function podeEditar(nivel, modulo) {
  return !!PERMISSOES[modulo]?.editors.includes(nivel);
}
