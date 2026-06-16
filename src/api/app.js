import express from "express"
import cors from "cors"
import funcionarioRoutes from "./routes/funcionario.routes.js"
import fornecedorRoutes from "./routes/fornecedor.routes.js"
import cargoRoutes from "./routes/cargo.routes.js"
import almoxarifadoRoutes from "./routes/almoxarifado.routes.js"
import produtosRoutes from "./routes/produtos.routes.js"
import saidaRoutes from "./routes/saida.routes.js"
import compraRoutes from "./routes/compra.routes.js"

const app = express()

app.use(express.json())
app.use(cors())

// Rotas
app.use("/api/funcionarios", funcionarioRoutes)
app.use("/api/fornecedores", fornecedorRoutes)
app.use("/api/cargos", cargoRoutes)
app.use("/api/almoxarifados", almoxarifadoRoutes)
app.use("/api/produtos", produtosRoutes)
app.use("/api/saidas", saidaRoutes)
app.use("/api/compras", compraRoutes)

export default app
