import Router from "express"
import * as fornecedorController from "../controllers/fornecedor.controller.js"

const router = Router()

// Rotas
router.post("/fornecedor", fornecedorController.cadastrarFornecedor);
router.put("/fornecedor/:id", fornecedorController.editarFornecedor);
router.get("/fornecedor", fornecedorController.consultar);
//router.get("/fornecedor/:id", fornecedorController.buscarPorId);
router.delete("/fornecedor/:id", fornecedorController.inativar);

export default router;