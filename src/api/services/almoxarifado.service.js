import * as almoxarifadoRepo from "../repositories/almoxarifado.repository.js"
import db from "../models/index.js"
import { assertAcessoAlmoxarifado } from "../utils/escopo.js"

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

export const listarAlmoxarifados = async (filtros = {}, escopo = null) => {
  const filtrosLimpos = normalizarFiltros(filtros)
  const lista = await almoxarifadoRepo.listarTodos(filtrosLimpos)
  // Usuário restrito só enxerga o próprio almoxarifado.
  if (escopo != null) {
    return lista.filter((a) => Number(a.cod_almoxarifado) === Number(escopo))
  }
  return lista
}

export const buscarAlmoxarifadoPorId = async (id, escopo = null) => {
  assertAcessoAlmoxarifado(escopo, id)
  const almoxarifado = await almoxarifadoRepo.buscarPorId(id)

  if (!almoxarifado) {
    throw new Error("Almoxarifado não encontrado")
  }

  return almoxarifado
}

export const cadastrarAlmoxarifado = async (dados, escopo = null) => {
  // Usuário restrito a um almoxarifado não pode criar novos.
  if (escopo != null) {
    const erro = new Error("Acesso restrito ao seu almoxarifado")
    erro.status = 403
    throw erro
  }
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

export const editarAlmoxarifado = async (id, dados, escopo = null) => {
  assertAcessoAlmoxarifado(escopo, id)
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
// Custo médio ponderado de cada produto num almoxarifado, baseado em todas
// as compras RECEBIDAS: Σ(quantidade × valor unitário) ÷ Σ(quantidade).
// Isso absorve as variações de preço entre compras, em vez de avaliar todo o
// estoque pelo valor da última compra. Retorna um Map<id_produto, custo_medio>.
// Produto sem nenhuma compra
// recebida nesse almoxarifado (ex: estoque inicial cadastrado à mão) fica
// de fora do Map — quem chama decide o fallback (hoje, preco_custo).
// ──────────────────────────────────────────────────────────────
const buscarCustosMedios = async (codAlmoxarifado) => {
  const itensRecebidos = await db.ItemCompra.findAll({
    attributes: ["id_produto", "quantidade", "valor_unitario"],
    include: [
      {
        model: db.Compra,
        as: "compra",
        attributes: [],
        where: {
          cod_almoxarifado_destino: codAlmoxarifado,
          status: "RECEBIDO"
        },
        required: true
      }
    ]
  })

  const acumuladosPorProduto = new Map()
  for (const registro of itensRecebidos) {
    const item = registro.toJSON()
    const quantidade = Number(item.quantidade) || 0
    const valorUnitario = Number(item.valor_unitario) || 0
    const atual = acumuladosPorProduto.get(item.id_produto) || {
      quantidade: 0,
      valorTotal: 0
    }
    atual.quantidade += quantidade
    atual.valorTotal += quantidade * valorUnitario
    acumuladosPorProduto.set(item.id_produto, atual)
  }

  const custos = new Map()
  for (const [idProduto, info] of acumuladosPorProduto) {
    if (info.quantidade > 0) custos.set(idProduto, info.valorTotal / info.quantidade)
  }
  return custos
}

// Todos os valores monetários dos cards são formados a partir dos itens:
// quantidade × valor unitário. Centralizar a conta evita que um card use um
// campo total antigo enquanto outro usa os valores realmente informados nos
// itens da movimentação.
const somarValorDosItens = (itens, obterValorUnitario) =>
  itens.reduce((soma, item) => {
    const registro = typeof item.toJSON === "function" ? item.toJSON() : item
    const quantidade = Number(registro.quantidade) || 0
    const valorUnitario = Number(obterValorUnitario(registro)) || 0
    return soma + quantidade * valorUnitario
  }, 0)

// ──────────────────────────────────────────────────────────────
// Estoque de um almoxarifado [RF014 - Consultar Almoxarifado].
// Lê a tabela Estoque (saldo por produto) e junta com Produto para obter
// nome e estoque mínimo (qtd. mínima). O valor unitário usa o custo da
// custo médio ponderado das compras RECEBIDAS do produto nesse almoxarifado
// (ver buscarCustosMedios) — só cai para o preço de cadastro do produto
// (preco_custo) se ele nunca tiver sido comprado nesse almoxarifado.
// O fornecedor é derivado do primeiro fornecedor vinculado ao produto.
// Nota fiscal não é armazenada no Estoque (vem do histórico de compras),
// então retorna "—" por enquanto.
// ──────────────────────────────────────────────────────────────
export const listarEstoque = async (id, escopo = null) => {
  assertAcessoAlmoxarifado(escopo, id)
  const almoxarifado = await almoxarifadoRepo.buscarPorId(id)
  if (!almoxarifado) {
    throw new Error("Almoxarifado não encontrado")
  }

  const [itens, custosMedios] = await Promise.all([
    db.Estoque.findAll({
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
    }),
    buscarCustosMedios(id)
  ])

  // Normaliza para o formato que a tela de Detalhes espera (campos numéricos
  // como Number — o DECIMAL do Sequelize vem como string).
  return itens.map((registro) => {
    const item = registro.toJSON()
    const produto = item.produto || {}
    const primeiroFornecedor =
      Array.isArray(produto.fornecedores) && produto.fornecedores.length > 0
        ? produto.fornecedores[0].razao_social
        : "—"
    const custoMedio = custosMedios.get(item.id_produto)
    const valorUnit = custoMedio !== undefined ? custoMedio : Number(produto.preco_custo) || 0

    return {
      id: `${item.cod_almoxarifado}-${item.id_produto}`,
      id_produto: item.id_produto,
      produto: produto.nome || `Produto ${item.id_produto}`,
      unidade_medida: produto.unidade_medida || null,
      fornecedor: primeiroFornecedor,
      nota_fiscal: "—",
      qtd: Number(item.quantidade) || 0,
      qtd_minima: Number(produto.estoque_minimo) || 0,
      valor_unit: valorUnit,
      data_atualizacao: item.ultima_atualizacao
    }
  })
}

// ──────────────────────────────────────────────────────────────
// Totais de entrada/saída de um almoxarifado, calculados só em cima de
// produtos comprados.
//
// Entrada: soma de quantidade * preco_unitario_acordado dos itens das
// compras já RECEBIDAS com destino este almoxarifado. Pedidos
// PENDENTE/CANCELADO ainda não entraram fisicamente no estoque, então não
// contam.
//
// Saída: Saida_Item não guarda valor_unitario (ver comentário em
// saida-item.model.js), então o valor de cada item de saída usa o custo da
// custo médio ponderado das compras RECEBIDAS daquele produto nesse
// almoxarifado (mesma lógica de buscarCustosMedios usada no card de Estoque)
// — não o preço
// de cadastro do produto, que não reflete o valor realmente pago.
// ──────────────────────────────────────────────────────────────
export const calcularTotaisMovimentacao = async (id, escopo = null) => {
  assertAcessoAlmoxarifado(escopo, id)
  const codAlmoxarifado = Number(id)
  const almoxarifado = await almoxarifadoRepo.buscarPorId(codAlmoxarifado)
  if (!almoxarifado) {
    throw new Error("Almoxarifado não encontrado")
  }

  // Entrada: soma direto de Item_Compra (quantidade * preco_unitario_acordado)
  // das compras já RECEBIDAS com destino este almoxarifado. Somamos pelos
  // itens em vez de usar Compra.valor_total porque esse campo não estava
  // sendo calculado no cadastro/edição da compra (ver correção em
  // compra.service.js) — compras antigas ficariam de fora se usássemos ele.
  const [itensCompra, custosMedios, itensServico] = await Promise.all([
    db.ItemCompra.findAll({
      attributes: ["id_produto", "quantidade", "valor_unitario"],
      include: [
        {
          model: db.Compra,
          as: "compra",
          attributes: [],
          where: {
            cod_almoxarifado_destino: codAlmoxarifado,
            status: "RECEBIDO"
          },
          required: true
        }
      ]
    }),
    buscarCustosMedios(codAlmoxarifado),
    db.ServicoItem.findAll({
      attributes: ["quantidade", "valor_unitario"],
      include: [
        {
          model: db.Servico,
          as: "servico",
          attributes: [],
          where: { cod_almoxarifado: codAlmoxarifado },
          required: true
        }
      ]
    })
  ])

  const valorEntrada = somarValorDosItens(
    itensCompra,
    (item) => custosMedios.get(item.id_produto) ?? item.valor_unitario
  )
  const valorServicos = somarValorDosItens(
    itensServico,
    (item) => item.valor_unitario
  )

  const itensSaida = await db.SaidaItem.findAll({
    attributes: ["id_produto", "quantidade"],
    include: [
      {
        model: db.Saida,
        as: "saida",
        attributes: ["aplicacao"],
        where: { cod_almoxarifado_origem: codAlmoxarifado },
        required: true
      },
      {
        model: db.Produto,
        as: "produto",
        attributes: ["preco_custo"]
      }
    ]
  })

  const valorUnitarioDaSaida = (registro) => {
    const custoMedio = custosMedios.get(registro.id_produto)
    return custoMedio !== undefined
      ? custoMedio
      : Number(registro.produto?.preco_custo) || 0
  }
  const valorSaida = somarValorDosItens(itensSaida, valorUnitarioDaSaida)
  const valorAbastecimentoTanque = somarValorDosItens(
    itensSaida.filter((item) => {
      const registro = item.toJSON()
      return String(registro.saida?.aplicacao || "").trim().toLocaleUpperCase("pt-BR") === "ABASTECIMENTO TANQUE"
    }),
    valorUnitarioDaSaida
  )

  return {
    valor_entrada: Number(valorEntrada) || 0,
    valor_saida: valorSaida,
    valor_servicos: Number(valorServicos) || 0,
    valor_abastecimento_tanque: Number(valorAbastecimentoTanque) || 0
  }
}

export const inativarAlmoxarifado = async (id, escopo = null) => {
  assertAcessoAlmoxarifado(escopo, id)
  const almoxarifado = await almoxarifadoRepo.buscarPorId(id)
  if (!almoxarifado) {
    throw new Error("Almoxarifado não encontrado")
  }

  // Regra: não faz sentido inativar um almoxarifado que ainda tem estoque.
  // O saldo precisa ser zerado (consumo/serviço ou transferência) antes.
  const produtosComSaldo = await almoxarifadoRepo.contarProdutosComSaldo(id)
  if (produtosComSaldo > 0) {
    const erro = new Error(
      `Não é possível inativar: o almoxarifado ainda tem ${produtosComSaldo} ` +
      `produto(s) com saldo em estoque. Zere o estoque (por consumo/serviço ou ` +
      `transferência) antes de inativar.`
    )
    erro.status = 409
    throw erro
  }

  return await almoxarifadoRepo.inativar(id)
}
