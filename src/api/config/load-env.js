// ──────────────────────────────────────────────────────────────
// Carrega o arquivo .env ANTES de qualquer outro módulo.
//
// Precisa ser o PRIMEIRO import do server.js: o security.js lê
// process.env no momento em que é importado, então o .env tem que
// já estar carregado nesse ponto.
//
// Usa process.loadEnvFile (nativo do Node 20.12+/24) — não depende
// da flag --env-file nem do pacote dotenv, então funciona rodando
// com `node server.js`, `nodemon` ou pelo botão de run da IDE.
// ──────────────────────────────────────────────────────────────

// Resolve o caminho do .env relativo a este arquivo (src/api/.env),
// não ao diretório de onde o comando foi executado.
const caminhoEnv = new URL("../.env", import.meta.url)

try {
  process.loadEnvFile(caminhoEnv)
} catch (erro) {
  // Sem .env (ex.: produção usando variáveis do sistema) — segue em frente.
  console.warn("[ENV] Arquivo .env não encontrado — usando variáveis do sistema.")
}
