import { Router } from "express";
import * as controller from "../controllers/gasto-aplicacao.controller.js";
const router = Router();
router.get("/", controller.listar);
router.get("/detalhes", controller.detalhar);
export default router;
