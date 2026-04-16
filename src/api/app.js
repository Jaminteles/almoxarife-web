import express from "express"
import cors from "cors"
import funcionarioRoutes from "./routes/funcionario.routes.js"
import fornecedorRoutes from "./routes/fornecedor.routes.js"
import cargoRoutes from "./routes/cargo.routes.js"

const app = express()

app.use(express.json())
app.use(cors())

// Rotas
app.use("/api/funcionarios", funcionarioRoutes)
app.use("/api/fornecedores", fornecedorRoutes)
app.use("/api/cargos", cargoRoutes)

export default app
