import { Router } from "express"
import * as controller from "../controllers/auth.controller.js"
import { autenticar } from "../middlewares/auth.middleware.js"

const router = Router()

// POST /api/auth/login → autentica e devolve o token
router.post("/login", controller.login)

// GET  /api/auth/me    → dados do usuário logado (valida o token)
router.get("/me", autenticar, controller.me)

export default router
