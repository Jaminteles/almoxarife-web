import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes.js"
import funcionarioRoutes from "./routes/funcionario.routes.js"
import fornecedorRoutes from "./routes/fornecedor.routes.js"
import cargoRoutes from "./routes/cargo.routes.js"
import almoxarifadoRoutes from "./routes/almoxarifado.routes.js"
import produtoRoutes from "./routes/produto.routes.js"
import saidaRoutes from "./routes/saida.routes.js"
import compraRoutes from "./routes/compra.routes.js"
import lookupRoutes from "./routes/lookup.routes.js"
import solicitacaoRoutes from "./routes/solicitacao.routes.js"
import { autenticar, autorizarModulo } from "./middlewares/auth.middleware.js"

const app = express()

app.use(express.json())
app.use(cors())

// ── Rota pública de autenticação ──
app.use("/api/auth", authRoutes)

// ── Solicitações de cadastro ──
// O POST (pedido) é público; as demais rotas exigem CENTRAL (aplicado
// dentro do próprio router, por isso não há autenticar no mount).
app.use("/api/solicitacoes", solicitacaoRoutes)

// ── Dados de apoio (lookups) — qualquer usuário autenticado ──
// Selects de outros módulos (ex.: funcionário comprador/responsável) sem
// exigir acesso ao módulo dono do dado.
app.use("/api/lookups", autenticar, lookupRoutes)

// ── Rotas protegidas ──
// Toda rota exige token válido (autenticar) e respeita a matriz de
// permissões por módulo (autorizarModulo): leitura x escrita conforme
// o método HTTP e o nível de acesso do usuário.
app.use("/api/funcionarios",  autenticar, autorizarModulo("funcionarios"),  funcionarioRoutes)
app.use("/api/fornecedores",  autenticar, autorizarModulo("fornecedores"),  fornecedorRoutes)
app.use("/api/cargos",        autenticar, autorizarModulo("cargos"),        cargoRoutes)
app.use("/api/almoxarifados", autenticar, autorizarModulo("almoxarifados"), almoxarifadoRoutes)
app.use("/api/produtos",      autenticar, autorizarModulo("produtos"),      produtoRoutes)
app.use("/api/saidas",        autenticar, autorizarModulo("saidas"),        saidaRoutes)
app.use("/api/compras",       autenticar, autorizarModulo("compras"),       compraRoutes)

export default app
