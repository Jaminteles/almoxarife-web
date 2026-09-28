import * as service from "../services/manutencao.service.js"
import { escopoAlmoxarifado } from "../utils/escopo.js"

const responder = (res, erro, padrao = 400) => res.status(erro.status || padrao).json({ sucesso: false, erro: erro.message })

export const listarPainel = async (req, res) => {
  try {
    const dados = await service.listarPainel(req.query, escopoAlmoxarifado(req.usuario))
    res.json({ sucesso: true, dados: dados.itens, totais: dados.totais, total: dados.itens.length })
  } catch (erro) { responder(res, erro) }
}
export const detalhes = async (req, res) => {
  try { res.json({ sucesso: true, dados: await service.buscarDetalhes(req.params.id, escopoAlmoxarifado(req.usuario)) }) }
  catch (erro) { responder(res, erro, 404) }
}
export const listarHorimetros = async (req, res) => {
  try { res.json({ sucesso: true, dados: (await service.buscarDetalhes(req.params.id, escopoAlmoxarifado(req.usuario))).horimetros }) }
  catch (erro) { responder(res, erro, 404) }
}
export const criarHorimetro = async (req, res) => {
  try { res.status(201).json({ sucesso: true, mensagem: "Leitura de horímetro registrada com sucesso", dados: await service.registrarHorimetro(req.params.id, req.body, req.usuario, escopoAlmoxarifado(req.usuario)) }) }
  catch (erro) { responder(res, erro) }
}
export const atualizarHorimetro = async (req, res) => {
  try { res.json({ sucesso: true, mensagem: "Leitura de horímetro atualizada com sucesso", dados: await service.atualizarHorimetro(req.params.id, req.params.idHorimetro, req.body, escopoAlmoxarifado(req.usuario)) }) }
  catch (erro) { responder(res, erro) }
}
export const listarManutencoes = async (req, res) => {
  try { res.json({ sucesso: true, dados: (await service.buscarDetalhes(req.params.id, escopoAlmoxarifado(req.usuario))).manutencoes }) }
  catch (erro) { responder(res, erro, 404) }
}
export const criarManutencao = async (req, res) => {
  try { res.status(201).json({ sucesso: true, mensagem: "Manutenção registrada com sucesso", dados: await service.registrarManutencao(req.params.id, req.body, req.usuario, escopoAlmoxarifado(req.usuario)) }) }
  catch (erro) { responder(res, erro) }
}
export const atualizarManutencao = async (req, res) => {
  try { res.json({ sucesso: true, mensagem: "Manutenção atualizada com sucesso", dados: await service.atualizarManutencao(req.params.id, req.params.idManutencao, req.body, escopoAlmoxarifado(req.usuario)) }) }
  catch (erro) { responder(res, erro) }
}
