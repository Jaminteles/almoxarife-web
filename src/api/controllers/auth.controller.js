import * as authService from "../services/auth.service.js"
import * as funcionarioRepo from "../repositories/funcionario.repository.js"

// POST /api/auth/login  { email, senha }
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body
    const resultado = await authService.login(email, senha)
    res.json({ sucesso: true, ...resultado })
  } catch (erro) {
    res.status(erro.status || 400).json({ sucesso: false, erro: erro.message })
  }
}

// GET /api/auth/me  (requer token)
// Reconsulta o funcionário para devolver o estado atual (nome, nível...).
export const me = async (req, res) => {
  try {
    const funcionario = await funcionarioRepo.buscarPorId(req.usuario.id_funcionario)
    if (!funcionario || funcionario.is_active === 0 || !funcionario.usuario) {
      return res.status(404).json({ sucesso: false, erro: "Usuário não encontrado" })
    }
    res.json({
      sucesso: true,
      usuario: {
        id_funcionario: funcionario.id_funcionario,
        nome: funcionario.nome,
        email: funcionario.email,
        cargo: funcionario.cargo?.nome_cargo || null,
        access_level: funcionario.usuario.access_level,
        cod_almoxarifado: funcionario.cod_almoxarifado ?? null,
        almoxarifado: funcionario.almoxarifado?.nome || null
      }
    })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}
