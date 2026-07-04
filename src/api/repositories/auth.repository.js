import db from "../models/index.js"

const Funcionario = db.Funcionario
const UsuarioSistema = db.UsuarioSistema
const Almoxarifado = db.Almoxarifado

// ──────────────────────────────────────────────────────────────
// Busca o funcionário ATIVO pelo e-mail, trazendo a credencial COM o
// password_hash (necessário para conferir a senha no login).
//
// Atenção: diferente das buscas do funcionario.repository, aqui o
// password_hash NÃO é excluído — este repositório é de uso exclusivo
// do fluxo de autenticação.
// ──────────────────────────────────────────────────────────────
export async function buscarCredencialPorEmail(email) {
  return await Funcionario.findOne({
    where: { email, is_active: 1 },
    include: [
      { model: UsuarioSistema, as: "usuario" },
      { model: db.Cargo, as: "cargo" },
      { model: Almoxarifado, as: "almoxarifado", attributes: ["cod_almoxarifado", "nome"] }
    ]
  })
}

// Registra o momento do último login bem-sucedido.
export async function registrarUltimoLogin(idFuncionario) {
  return await UsuarioSistema.update(
    { ultimo_login: new Date() },
    { where: { id_funcionario: idFuncionario } }
  )
}
