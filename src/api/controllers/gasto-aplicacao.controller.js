import * as service from "../services/gasto-aplicacao.service.js";

export const listar = async (_req, res) => {
  try { const dados = await service.listarGastosPorAplicacao(); res.json({ sucesso: true, dados, total: dados.length }); }
  catch (erro) { res.status(400).json({ sucesso: false, erro: erro.message }); }
};
export const detalhar = async (req, res) => {
  try { res.json({ sucesso: true, dados: await service.detalharAplicacao(req.query.aplicacao) }); }
  catch (erro) { res.status(erro.message === "Aplicação não encontrada" ? 404 : 400).json({ sucesso: false, erro: erro.message }); }
};
