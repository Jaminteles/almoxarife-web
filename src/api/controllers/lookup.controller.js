import * as funcionarioService from "../services/funcionario.service.js"
import * as almoxarifadoRepo from "../repositories/almoxarifado.repository.js"

// ──────────────────────────────────────────────────────────────
// Dados de apoio ("lookups") para preencher selects em outros módulos.
// Expõem apenas o mínimo necessário e são acessíveis a qualquer usuário
// autenticado — sem depender de acesso ao módulo dono do dado.
// ──────────────────────────────────────────────────────────────

// GET /api/lookups/funcionarios → [{ id_funcionario, nome }]
export const funcionarios = async (req, res) => {
  try {
    const dados = await funcionarioService.listarFuncionariosParaSelecao()
    res.json({ sucesso: true, dados, total: dados.length })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

// GET /api/lookups/almoxarifados → [{ cod_almoxarifado, nome }]
// TODOS os almoxarifados ativos (sem filtro de escopo). Necessário, por
// exemplo, para o DESTINO de uma transferência feita por um usuário restrito.
export const almoxarifados = async (req, res) => {
  try {
    const dados = await almoxarifadoRepo.listarParaSelecao()
    res.json({ sucesso: true, dados, total: dados.length })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}
