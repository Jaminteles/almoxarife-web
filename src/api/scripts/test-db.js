// ──────────────────────────────────────────────────────────────
// Testa a conexão com o banco usando os dados do .env.
// Rode com:  npm run test:db   (ou: node scripts/test-db.js)
//
// Serve para validar o MySQL remoto (HostGator) antes do deploy.
// ──────────────────────────────────────────────────────────────
import "../config/load-env.js"
import { Sequelize } from "sequelize"

const {
  DB_NAME = "bd_almoxarifado",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_HOST = "localhost",
  DB_PORT = "3306"
} = process.env

console.log("Tentando conectar em:")
console.log(`  host: ${DB_HOST}:${DB_PORT}`)
console.log(`  banco: ${DB_NAME}`)
console.log(`  usuário: ${DB_USER}`)
console.log("")

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: "mysql",
  logging: false,
  pool: { max: 1, acquire: 15000, idle: 5000 }
})

try {
  await sequelize.authenticate()
  console.log("✅  Conexão OK! O banco está acessível.")
  process.exit(0)
} catch (erro) {
  console.error("❌  Falha ao conectar:", erro.message)
  console.error("")
  console.error("Causas comuns (MySQL remoto na HostGator):")
  console.error("  • Seu IP não está liberado em cPanel > 'MySQL Remoto'.")
  console.error("  • DB_HOST errado (use o servidor da HostGator, não localhost).")
  console.error("  • DB_NAME/DB_USER sem o prefixo do cPanel (ex.: cpaneluser_...).")
  console.error("  • Senha incorreta ou plano não permite conexão remota.")
  process.exit(1)
}
