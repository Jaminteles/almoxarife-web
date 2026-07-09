import { Router } from "express"
import * as controller from "../controllers/lookup.controller.js"

const router = Router()

// Dados de apoio para selects. A autenticação é aplicada no mount (app.js);
// aqui não há trava por módulo — qualquer usuário logado pode ler.
router.get("/funcionarios", controller.funcionarios)
router.get("/almoxarifados", controller.almoxarifados)
router.get("/equipes", controller.equipes)

export default router
