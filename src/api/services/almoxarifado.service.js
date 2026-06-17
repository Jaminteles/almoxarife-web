import * as almoxarifadoRepo from "../repositories/almoxarifado.repository.js"
import db from "../models/index.js"

// ──────────────────────────────────────────────────────────────
// Validacao de campos obrigatorios.
// `telefones` e um ARRAY (>= 1 telefone). O endereco precisa dos campos
// que a tabela Endereco_Almoxarifado exige (sem complemento, que nao
// existe nessa tabela).
// ──────────────────────────────────────────────────────────────
function validarCamposObrigatorios(dados) {
  if (!dados.nome || !String(dados.nome).trim()) {
    throw new Error("O nome do almoxarifado é obrigatório")
  }
  if (!dados.email || !String(dados.email).trim()) {
    throw new Error("O email é obrigatório")
  }

  const telefonesValidos = Array.isArray(dados.telefones)
    ? dados.telefones.filter(t => String(t).trim() !== "")
    : []
  if (telefonesValidos.length === 0) {
    throw new Error("Informe ao menos um telefone para contato")
  }

  if (!dados.endereco) {
    throw new Error("O endereço é obrigatório")
  }
  const e = dados.endereco
  for (const campo of ["cep", "logradouro", "numero", "bairro", "cidade", "estado"]) {
    if (!e[campo] || !String(e[campo]).trim()) {
      throw new Error(`O campo de endereço "${campo}" é obrigatório`)
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Limpa e valida o CEP — mesmo padrao do fornecedor.service.js.
// A coluna `cep` guarda SO os 8 digitos. Se o usuario digita com mascara
// ("12345-678" = 9 caracteres), estoura "Data too long for column 'cep'".
// Aqui removemos tudo que nao e digito e validamos o tamanho.
// ──────────────────────────────────────────────────────────────
function normalizarCep(cep) {
  const digitos = String(cep || "").replace(/[^\d]/g, "")
  if (digitos.length !== 8) {
    throw new Error("CEP deve conter 8 dígitos")
  }
  return digitos
}

// Remove espacos e descarta telefones vazios; sempre retorna array de strings.
function normalizarTelefones(telefones) {
  return (telefones || [])
    .map(t => (typeof t === "string" ? t.trim() : String(t?.telefone || "").trim()))
    .filter(t => t !== "")
}

function normalizarFiltros(filtros = {}) {
  const limpos = {}
  const trim = (v) => (typeof v === "string" ? v.trim() : v)

  if (trim(filtros.nome)) limpos.nome = trim(filtros.nome)
  if (trim(filtros.email)) limpos.email = trim(filtros.email)
  if (trim(filtros.telefone)) limpos.telefone = trim(filtros.telefone)
  if (trim(filtros.cidade)) limpos.cidade = trim(filtros.cidade)
  if (trim(filtros.estado)) limpos.estado = trim(filtros.estado)

  return limpos
}

export const listarAlmoxarifados = async (filtros = {}) => {
  const filtrosLimpos = normalizarFiltros(filtros)
  return await almoxarifadoRepo.listarTodos(filtrosLimpos)
}

export const buscarAlmoxarifadoPorId = async (id) => {
  const almoxarifado = await almoxarifadoRepo.buscarPorId(id)

  if (!almoxarifado) {
    throw new Error("Almoxarifado não encontrado")
  }

  return almoxarifado
}

export const cadastrarAlmoxarifado = async (dados) => {
  validarCamposObrigatorios(dados)

  const emailExistente = await almoxarifadoRepo.buscarPorEmail(dados.email)
  if (emailExistente) {
    throw new Error("Email já registrado no sistema")
  }

  // 1) Cria o endereco (tabela independente, criada antes do almoxarifado).
  //    O CEP entra ja limpo (so digitos).
  const enderecoCriado = await almoxarifadoRepo.criarEndereco({
    cep: normalizarCep(dados.endereco.cep),
    logradouro: dados.endereco.logradouro,
    numero: dados.endereco.numero,
    bairro: dados.endereco.bairro,
    cidade: dados.endereco.cidade,
    estado: dados.endereco.estado
  })

  // 2) Cria o almoxarifado + telefones de uma vez (include no repository).
  const telefones = normalizarTelefones(dados.telefones)
  const almoxarifadoCriado = await almoxarifadoRepo.criar({
    nome: dados.nome,
    email: dados.email,
    id_endereco: enderecoCriado.id_endereco,
    telefones: telefones.map(t => ({ telefone: t }))
  })

  return await almoxarifadoRepo.buscarPorId(almoxarifadoCriado.cod_almoxarifado)
}

export const editarAlmoxarifado = async (id, dados) => {
  const almoxarifado = await almoxarifadoRepo.buscarPorId(id)
  if (!almoxarifado) {
    throw new Error("Almoxarifado não encontrado")
  }

  validarCamposObrigatorios(dados)

  const emailExistente = await almoxarifadoRepo.buscarPorEmail(dados.email)
  if (emailExistente && emailExistente.cod_almoxarifado !== parseInt(id)) {
    throw new Error("Email já registrado no sistema")
  }

  // Atualiza o endereco vinculado. CEP tambem entra limpo.
  await almoxarifadoRepo.atualizarEndereco(almoxarifado.id_endereco, {
    cep: normalizarCep(dados.endereco.cep),
    logradouro: dados.endereco.logradouro,
    numero: dados.endereco.numero,
    bairro: dados.endereco.bairro,
    cidade: dados.endereco.cidade,
    estado: dados.endereco.estado
  })

  // Atualiza os dados principais.
  await almoxarifadoRepo.atualizar(id, {
    nome: dados.nome,
    email: dados.email
  })

  // Substitui todos os telefones (apaga os antigos e grava os novos).
  await almoxarifadoRepo.substituirTelefones(id, normalizarTelefones(dados.telefones))

  return await almoxarifadoRepo.buscarPorId(id)
}

// ──────────────────────────────────────────────────────────────
// Estoque de um almoxarifado [RF014 - Consultar Almoxarifado].
// Lê a tabela Estoque (saldo por produto) e junta com Produto para obter
// nome, estoque mínimo (qtd. mínima) e preço de custo (valor unitário).
// O fornecedor é derivado do primeiro fornecedor vinculado ao produto.
// Nota fiscal não é armazenada no Estoque (vem do histórico de compras),
// então retorna "—" por enquanto.
// ──────────────────────────────────────────────────────────────
export const listarEstoque = async (id) => {
  const almoxarifado = await almoxarifadoRepo.buscarPorId(id)
  if (!almoxarifado) {
    throw new Error("Almoxarifado não encontrado")
  }

  const itens = await db.Estoque.findAll({
    where: { cod_almoxarifado: id },
    include: [
      {
        model: db.Produto,
        as: "produto",
        where: { ativo: 1 }, // não lista saldo de produtos inativados
        include: [
          {
            model: db.Fornecedor,
            as: "fornecedores",
            through: { attributes: [] }
          }
        ]
      }
    ]
  })

  // Normaliza para o formato que a tela de Detalhes espera (campos numéricos
  // como Number — o DECIMAL do Sequelize vem como string).
  return itens.map((registro) => {
    const item = registro.toJSON()
    const produto = item.produto || {}
    const primeiroFornecedor =
      Array.isArray(produto.fornecedores) && produto.fornecedores.length > 0
        ? produto.fornecedores[0].razao_social
        : "—"

    return {
      id: `${item.cod_almoxarifado}-${item.id_produto}`,
      id_produto: item.id_produto,
      produto: produto.nome || `Produto ${item.id_produto}`,
      unidade_medida: produto.unidade_medida || null,
      fornecedor: primeiroFornecedor,
      nota_fiscal: "—",
      qtd: Number(item.quantidade) || 0,
      qtd_minima: Number(produto.estoque_minimo) || 0,
      valor_unit: Number(produto.preco_custo) || 0,
      data_atualizacao: item.ultima_atualizacao
    }
  })
}

export const inativarAlmoxarifado = async (id) => {
  const almoxarifado = await almoxarifadoRepo.buscarPorId(id)
  if (!almoxarifado) {
    throw new Error("Almoxarifado não encontrado")
  }

  return await almoxarifadoRepo.inativar(id)
}
