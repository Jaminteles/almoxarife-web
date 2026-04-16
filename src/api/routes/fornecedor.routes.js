import { Router } from "express"
import * as controller from "../controllers/fornecedor.controller.js"

const router = Router()

// POST   /api/fornecedores        → cadastra
// GET    /api/fornecedores        → lista todos
// GET    /api/fornecedores/:id    → busca por ID
// PUT    /api/fornecedores/:id    → edita
// DELETE /api/fornecedores/:id    → inativa

router.post("/", controller.cadastrar)
router.get("/", controller.listar)
router.get("/:id", controller.buscarPorId)
router.put("/:id", controller.editar)
router.delete("/:id", controller.inativar)

export default router
