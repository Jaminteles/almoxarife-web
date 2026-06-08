import { Router } from "express"
import * as controller from "../controllers/saida.controller.js"

const router = Router()

router.post("/", controller.cadastrar)
router.get("/", controller.listar)
router.get("/:id", controller.buscarPorId)
router.put("/:id", controller.editar)
router.delete("/:id", controller.excluir)

export default router
