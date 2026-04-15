import { Router } from "express"
import * as fornecedorController from "../controllers/fornecedor.controller.js"

const router = Router()

// Rotas
router.post("/", fornecedorController.cadastrarFornecedor)
router.get("/", fornecedorController.consultar)
router.put("/:id", fornecedorController.editarFornecedor)
router.delete("/:id", fornecedorController.inativar)

export default router
