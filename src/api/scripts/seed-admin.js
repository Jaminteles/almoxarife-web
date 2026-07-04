// ──────────────────────────────────────────────────────────────
// Script de bootstrap: cria (ou atualiza) um usuário com nível CENTRAL.
//
// Como as rotas de cadastro passaram a exigir autenticação, é preciso
// um caminho para criar o PRIMEIRO administrador. Rode este script uma
// vez, direto contra o banco.
//
// Uso (a partir de src/api):
//   node scripts/seed-admin.js <email> <senha> ["Nome do Admin"]
//
// Exemplo:
//   node scripts/seed-admin.js admin@gilfer.com senha12345 "Administrador"
//
// - Se já existir um funcionário com esse e-mail, apenas garante/atualiza
//   a credencial (senha + nível CENTRAL, desbloqueado).
// - Se não existir, cria o funcionário (com um cargo "Administrador") e a
//   credencial.
// ──────────────────────────────────────────────────────────────

import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import db from "../models/index.js"
import { BCRYPT_ROUNDS } from "../config/security.js"

async function main() {
  const [, , emailArg, senhaArg, nomeArg] = process.argv

  if (!emailArg || !senhaArg) {
    console.error("Uso: node scripts/seed-admin.js <email> <senha> [\"Nome do Admin\"]")
    process.exit(1)
  }

  const email = emailArg.trim().toLowerCase()
  const senha = senhaArg
  const nome = (nomeArg || "Administrador").trim()

  if (senha.length < 8) {
    console.error("A senha deve ter no mínimo 8 caracteres.")
    process.exit(1)
  }

  await db.sequelize.authenticate()

  const passwordHash = await bcrypt.hash(senha, BCRYPT_ROUNDS)

  // Faz tudo numa transação para não deixar dados pela metade.
  const t = await db.sequelize.transaction()
  try {
    let funcionario = await db.Funcionario.findOne({ where: { email }, transaction: t })

    if (!funcionario) {
      // Garante um cargo para o novo funcionário.
      const [cargo] = await db.Cargo.findOrCreate({
        where: { nome_cargo: "Administrador" },
        defaults: { nome_cargo: "Administrador" },
        transaction: t
      })

      // CPF é NOT NULL/UNIQUE — gera um placeholder de 11 dígitos.
      const cpf = String(Date.now()).padStart(11, "0").slice(-11)

      funcionario = await db.Funcionario.create(
        {
          id_funcionario: uuidv4(),
          nome,
          cpf,
          email,
          id_cargo: cargo.id_cargo,
          is_active: 1
        },
        { transaction: t }
      )
      console.log(`Funcionário criado: ${nome} <${email}>`)
    } else {
      console.log(`Funcionário já existe: ${funcionario.nome} <${email}>`)
    }

    // Cria ou atualiza a credencial (nível CENTRAL, desbloqueado).
    const existente = await db.UsuarioSistema.findByPk(funcionario.id_funcionario, { transaction: t })
    if (existente) {
      await db.UsuarioSistema.update(
        { password_hash: passwordHash, access_level: "CENTRAL", bloqueado: 0 },
        { where: { id_funcionario: funcionario.id_funcionario }, transaction: t }
      )
      console.log("Credencial atualizada (nível CENTRAL, senha redefinida).")
    } else {
      await db.UsuarioSistema.create(
        {
          id_funcionario: funcionario.id_funcionario,
          password_hash: passwordHash,
          access_level: "CENTRAL",
          bloqueado: 0
        },
        { transaction: t }
      )
      console.log("Credencial criada (nível CENTRAL).")
    }

    await t.commit()
    console.log("\n✔ Admin pronto. Faça login com:")
    console.log(`   email: ${email}`)
    console.log(`   senha: (a que você informou)`)
  } catch (erro) {
    await t.rollback()
    throw erro
  } finally {
    await db.sequelize.close()
  }
}

main().catch((erro) => {
  console.error("Falha ao criar admin:", erro.message)
  process.exit(1)
})
