const { Router } = require("express");
const controller = require("../controllers/funcionarioController");

const router = Router();

// GET    /api/funcionarios       → lista todos
// POST   /api/funcionarios       → cria um novo
// GET    /api/funcionarios/:id   → busca um pelo ID
// PUT    /api/funcionarios/:id   → atualiza um pelo ID
// DELETE /api/funcionarios/:id   → remove um pelo ID

router.get("/", controller.listar);
router.post("/", controller.criar);
router.get("/:id", controller.buscarUm);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.remover);

module.exports = router;