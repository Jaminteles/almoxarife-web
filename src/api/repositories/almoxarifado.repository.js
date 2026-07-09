import db from "../models/index.js"
import { Op } from "sequelize"

const Almoxarifado = db.Almoxarifado
const EnderecoAlmoxarifado = db.EnderecoAlmoxarifado
const TelefoneAlmoxarifado = db.TelefoneAlmoxarifado

// Sempre trazemos endereco + telefones junto do almoxarifado.
// (corrige tambem o antigo bug do `includeAll` indefinido)
const includeAll = [
    { model: EnderecoAlmoxarifado, as: "endereco" },
    { model: TelefoneAlmoxarifado, as: "telefones" }
]

// Cria o almoxarifado JA com os telefones. Para isso funcionar,
// `dados.telefones` deve ser [{ telefone: "..." }, ...] — o Sequelize
// preenche o cod_almoxarifado nos telefones automaticamente.
export async function criar(dados) {
    return await Almoxarifado.create(dados, {
        include: [{ model: TelefoneAlmoxarifado, as: "telefones" }]
    })
}

// Lista enxuta (cod + nome) dos almoxarifados ativos, para selects de apoio.
export async function listarParaSelecao() {
    return await Almoxarifado.findAll({
        where: { ativo: 1 },
        attributes: ["cod_almoxarifado", "nome"],
        order: [["nome", "ASC"]]
    })
}

export async function listarTodos(filtros = {}) {
    const where = { ativo: 1 }

    const includeEndereco = { model: EnderecoAlmoxarifado, as: "endereco" }
    const includeTelefones = { model: TelefoneAlmoxarifado, as: "telefones" }

    if (filtros.nome) {
        where.nome = { [Op.like]: `%${filtros.nome}%` }
    }
    if (filtros.email) {
        where.email = { [Op.like]: `%${filtros.email}%` }
    }

    if (filtros.cidade) {
        includeEndereco.where = {
            ...(includeEndereco.where || {}),
            cidade: { [Op.like]: `%${filtros.cidade}%` }
        }
    }
    if (filtros.estado) {
        includeEndereco.where = {
            ...(includeEndereco.where || {}),
            estado: { [Op.like]: `%${filtros.estado}%` }
        }
    }

    // O filtro de telefone agora vive na tabela de telefones (via include).
    // Obs.: com `required: true` + where, a resposta so traz os telefones
    // que casam com o filtro. Como o front nao filtra por telefone, isso
    // raramente e usado; mantido por compatibilidade com o controller.
    if (filtros.telefone) {
        includeTelefones.where = { telefone: { [Op.like]: `%${filtros.telefone}%` } }
        includeTelefones.required = true
    }

    return await Almoxarifado.findAll({
        where,
        include: [includeEndereco, includeTelefones],
        order: [["nome", "ASC"]]
    })
}

export async function criarEndereco(dadosEndereco) {
    return await EnderecoAlmoxarifado.create(dadosEndereco)
}

export async function atualizarEndereco(id, dadosEndereco) {
    await EnderecoAlmoxarifado.update(dadosEndereco, {
        where: { id_endereco: id }
    })

    return await EnderecoAlmoxarifado.findByPk(id)
}

// Substitui TODOS os telefones do almoxarifado (apaga e recria).
// Mesmo padrao do fornecedor.repository.js. Aceita array de strings
// OU array de objetos { telefone }.
export async function substituirTelefones(codAlmoxarifado, telefones) {
    await TelefoneAlmoxarifado.destroy({ where: { cod_almoxarifado: codAlmoxarifado } })

    if (telefones && telefones.length > 0) {
        const registros = telefones.map(t => ({
            cod_almoxarifado: codAlmoxarifado,
            telefone: typeof t === "string" ? t : t.telefone
        }))
        await TelefoneAlmoxarifado.bulkCreate(registros)
    }
}

export async function buscarPorId(id) {
    return await Almoxarifado.findByPk(id, {
        include: includeAll
    })
}

export async function buscarPorEmail(email) {
    return await Almoxarifado.findOne({
        where: { email }
    })
}

export async function atualizar(id, dados) {
    await Almoxarifado.update(dados, {
        where: { cod_almoxarifado: id }
    })

    return await buscarPorId(id)
}

// Conta quantos PRODUTOS ATIVOS ainda têm saldo (> 0) neste almoxarifado.
// Usado para impedir a inativação de um almoxarifado que ainda guarda estoque.
// Considera só produtos ativos para casar com o que aparece na tela de Estoque.
export async function contarProdutosComSaldo(codAlmoxarifado) {
    return await db.Estoque.count({
        where: {
            cod_almoxarifado: codAlmoxarifado,
            quantidade: { [Op.gt]: 0 }
        },
        include: [
            { model: db.Produto, as: "produto", where: { ativo: 1 }, required: true, attributes: [] }
        ]
    })
}

export async function inativar(id) {
    const almoxarifado = await Almoxarifado.findByPk(id)

    if (almoxarifado && almoxarifado.ativo === 0) {
        throw new Error("Almoxarifado já está inativo")
    }

    return await Almoxarifado.update(
        { ativo: 0 },
        { where: { cod_almoxarifado: id } }
    )
}
