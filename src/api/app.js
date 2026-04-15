import express from "express"
import cors from "cors"
import funcionarioRoutes from "./routes/funcionario.js"
import fornecedorRoutes from "./routes/fornecedor.routes.js"

const app = express()

// Permite receber JSON no corpo das requisições
app.use(express.json())

// Permite o frontend React chamar este backend
app.use(cors())

// Registra as rotas de funcionários sob o prefixo /api/funcionarios
app.use("/api/funcionarios", funcionarioRoutes)

// Registra as rotas de fornecedores sob o prefixo /api/fornecedores
app.use("/api/fornecedores", fornecedorRoutes)

export default app