import { Router } from "express"
import * as controller from "../controllers/funcionario.controller.js"

const router = Router()

// GET    /api/funcionarios           → lista todos
// POST   /api/funcionarios           → cria um novo
// GET    /api/funcionarios/:id       → busca por ID (UUID)
// GET    /api/funcionarios/cpf/:cpf  → busca por CPF
// PUT    /api/funcionarios/:id       → atualiza pelo ID
// DELETE /api/funcionarios/:id       → inativa pelo ID

router.get("/", controller.listar)
router.post("/", controller.criar)
router.get("/cpf/:cpf", controller.buscarPorCpf)
router.get("/:id", controller.buscarPorId)
router.put("/:id", controller.atualizar)
router.delete("/:id", controller.inativar)

export default router
