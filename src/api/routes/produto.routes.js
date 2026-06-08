import { Router } from "express"
import * as controller from "../controllers/produto.controller.js"

const router = Router()

router.get("/", controller.listar)
router.get("/:id", controller.buscarPorId)

export default router
