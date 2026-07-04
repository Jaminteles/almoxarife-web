import { Router } from "express"
import * as controller from "../controllers/compra.controller.js"

const router = Router()

router.post("/", controller.cadastrar)
router.get("/", controller.listar)
router.get("/:id", controller.buscarPorId)
router.put("/:id", controller.editar)
router.patch("/:id/receber", controller.receber)
router.delete("/:id", controller.excluir)

export default router
