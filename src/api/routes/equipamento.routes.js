import { Router } from "express"
import * as controller from "../controllers/equipamento.controller.js"

const router = Router()

router.get("/", controller.listar)
router.get("/:id", controller.buscarPorId)
router.post("/", controller.criar)
router.put("/:id", controller.atualizar)
router.patch("/:id", controller.atualizar)
router.delete("/:id", controller.excluir)

export default router
