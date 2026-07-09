import { Router } from "express"
import * as controller from "../controllers/equipe.controller.js"

const router = Router()

// GET    /api/equipes       → lista todas (ativas)
// POST   /api/equipes       → cria uma nova
// GET    /api/equipes/:id   → busca por ID
// PUT    /api/equipes/:id   → atualiza pelo ID
// DELETE /api/equipes/:id   → inativa pelo ID

router.get("/", controller.listar)
router.post("/", controller.criar)
router.get("/:id", controller.buscarPorId)
router.put("/:id", controller.atualizar)
router.delete("/:id", controller.inativar)

export default router
