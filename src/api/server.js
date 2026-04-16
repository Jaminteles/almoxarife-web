import app from "./app.js"
import db from "./models/index.js"

const PORT = 5000

// Testa a conexão e sincroniza os models com o banco
db.sequelize
  .authenticate()
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida com sucesso.")
    // alter: true ajusta as tabelas existentes sem apagar dados
    // Use { force: true } apenas em desenvolvimento para recriar as tabelas
    return db.sequelize.sync({ alter: false })
  })
  .then(() => {
    console.log("Models sincronizados com o banco de dados.")
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`)
    })
  })
  .catch((erro) => {
    console.error("Erro ao conectar com o banco de dados:", erro.message)
  })
