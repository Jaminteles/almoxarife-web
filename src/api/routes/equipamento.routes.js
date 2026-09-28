import { Router } from "express"
import * as controller from "../controllers/equipamento.controller.js"
import * as manutencaoController from "../controllers/manutencao.controller.js"

const router = Router()

// As rotas de manutenção vêm antes de /:id para que "manutencao" nunca seja
// interpretado como id de equipamento.
router.get("/manutencao", manutencaoController.listarPainel)
router.get("/:id/manutencao", manutencaoController.detalhes)
router.get("/:id/horimetros", manutencaoController.listarHorimetros)
router.post("/:id/horimetros", manutencaoController.criarHorimetro)
router.put("/:id/horimetros/:idHorimetro", manutencaoController.atualizarHorimetro)
router.patch("/:id/horimetros/:idHorimetro", manutencaoController.atualizarHorimetro)
router.get("/:id/manutencoes", manutencaoController.listarManutencoes)
router.post("/:id/manutencoes", manutencaoController.criarManutencao)
router.put("/:id/manutencoes/:idManutencao", manutencaoController.atualizarManutencao)
router.patch("/:id/manutencoes/:idManutencao", manutencaoController.atualizarManutencao)

router.get("/", controller.listar)
router.get("/:id", controller.buscarPorId)
router.post("/", controller.criar)
router.put("/:id", controller.atualizar)
router.patch("/:id", controller.atualizar)
router.delete("/:id", controller.excluir)

export default router
