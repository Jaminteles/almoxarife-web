import app from "./app.js"

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})