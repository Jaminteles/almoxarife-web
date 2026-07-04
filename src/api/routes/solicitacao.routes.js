import { Router } from "express"
import * as controller from "../controllers/solicitacao.controller.js"
import { autenticar, autorizar } from "../middlewares/auth.middleware.js"

const router = Router()

// Público: qualquer pessoa pode solicitar um cadastro.
router.post("/", controller.solicitar)

// Restrito ao CENTRAL: revisar e decidir.
router.get("/", autenticar, autorizar("CENTRAL"), controller.listar)
router.post("/:id/aprovar", autenticar, autorizar("CENTRAL"), controller.aprovar)
router.post("/:id/rejeitar", autenticar, autorizar("CENTRAL"), controller.rejeitar)

export default router
