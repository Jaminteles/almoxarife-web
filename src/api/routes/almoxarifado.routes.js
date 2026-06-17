import { Router } from "express"
import * as controller from "../controllers/almoxarifados.controller.js"

const router = Router()

router.post("/", controller.cadastrar)
router.get("/", controller.listar)
router.get("/:id", controller.buscarPorId)
router.get("/:id/estoque", controller.estoque)
router.put("/:id", controller.editar)
router.delete("/:id", controller.inativar)

export default router