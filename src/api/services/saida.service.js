import * as saidaRepo from "../repositories/saida.repository.js"

const TIPOS_VALIDOS = ["CONSUMO", "TRANSFERENCIA"]

const normalizarFiltros = (filtros = {}) => {
  const limpos = {}
  const trim = (v) => (typeof v === "string" ? v.trim() : v)

  if (trim(filtros.destino)) limpos.destino = trim(filtros.destino)
  if (trim(filtros.responsavel)) limpos.responsavel = trim(filtros.responsavel)
  if (trim(filtros.produtos)) limpos.produtos = trim(filtros.produtos)

  if (trim(filtros.data)) {
    const inicio = new Date(`${trim(filtros.data)}T00:00:00`)
    if (Number.isNaN(inicio.getTime())) {
      throw new Error("Data inválida")
    }

    const fim = new Date(inicio)
    fim.setDate(fim.getDate() + 1)
    limpos.data = { inicio, fim }
  }

  return limpos
}

const normalizarItens = (itens = []) => {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error("A saída deve ter ao menos um produto")
  }

  const agrupados = new Map()

  for (const item of itens) {
    const idProduto = Number(item.id_produto)
    const quantidade = Number(item.quantidade)

    if (!idProduto || quantidade <= 0) {
      throw new Error("Cada item deve ter produto e quantidade maior que zero")
    }

    agrupados.set(idProduto, (agrupados.get(idProduto) || 0) + quantidade)
  }

  return Array.from(agrupados.entries()).map(([id_produto, quantidade]) => ({
    id_produto,
    quantidade
  }))
}

const montarDadosSaida = (dados) => {
  if (!dados.cod_almoxarifado_origem || !dados.id_funcionario_responsavel || !dados.tipo_saida) {
    throw new Error("Campos obrigatórios: origem, responsável e tipo de saída")
  }

  if (!TIPOS_VALIDOS.includes(dados.tipo_saida)) {
    throw new Error("Tipo de saída inválido")
  }

  const origem = Number(dados.cod_almoxarifado_origem)
  const destino = dados.tipo_saida === "TRANSFERENCIA"
    ? Number(dados.cod_almoxarifado_destino)
    : null

  if (dados.tipo_saida === "TRANSFERENCIA" && !destino) {
    throw new Error("Transferência exige almoxarifado de destino")
  }

  if (destino && destino === origem) {
    throw new Error("O almoxarifado de destino deve ser diferente do de origem")
  }

  return {
    cod_almoxarifado_origem: origem,
    id_funcionario_responsavel: dados.id_funcionario_responsavel,
    tipo_saida: dados.tipo_saida,
    cod_almoxarifado_destino: destino,
    observacao: dados.observacao || null
  }
}

const garantirReferencias = async (dados, itens) => {
  const origem = await saidaRepo.buscarAlmoxarifado(dados.cod_almoxarifado_origem)
  if (!origem || origem.ativo === 0) {
    throw new Error("Almoxarifado de origem não encontrado")
  }

  if (dados.cod_almoxarifado_destino) {
    const destino = await saidaRepo.buscarAlmoxarifado(dados.cod_almoxarifado_destino)
    if (!destino || destino.ativo === 0) {
      throw new Error("Almoxarifado de destino não encontrado")
    }
  }

  const responsavel = await saidaRepo.buscarFuncionario(dados.id_funcionario_responsavel)
  if (!responsavel || responsavel.is_active === 0) {
    throw new Error("Responsável não encontrado")
  }

  for (const item of itens) {
    const produto = await saidaRepo.buscarProduto(item.id_produto)
    if (!produto || produto.ativo === 0) {
      throw new Error(`Produto ${item.id_produto} não encontrado`)
    }
  }
}

const ajustarEstoque = async (idProduto, codAlmoxarifado, delta, transaction) => {
  const estoque = await saidaRepo.buscarEstoque(idProduto, codAlmoxarifado, transaction)
  const quantidadeAtual = Number(estoque?.quantidade || 0)
  const novaQuantidade = quantidadeAtual + Number(delta)

  if (novaQuantidade < 0) {
    throw new Error(`Estoque insuficiente para o produto ${idProduto}`)
  }

  if (!estoque) {
    return await saidaRepo.criarEstoque({
      id_produto: idProduto,
      cod_almoxarifado: codAlmoxarifado,
      quantidade: novaQuantidade.toFixed(3)
    }, transaction)
  }

  return await saidaRepo.atualizarEstoque(
    idProduto,
    codAlmoxarifado,
    novaQuantidade.toFixed(3),
    transaction
  )
}

const aplicarMovimento = async (dados, itens, transaction) => {
  for (const item of itens) {
    await ajustarEstoque(
      item.id_produto,
      dados.cod_almoxarifado_origem,
      -Number(item.quantidade),
      transaction
    )

    if (dados.tipo_saida === "TRANSFERENCIA") {
      await ajustarEstoque(
        item.id_produto,
        dados.cod_almoxarifado_destino,
        Number(item.quantidade),
        transaction
      )
    }
  }
}

const reverterMovimento = async (saida, transaction) => {
  for (const item of saida.itens || []) {
    await ajustarEstoque(
      item.id_produto,
      saida.cod_almoxarifado_origem,
      Number(item.quantidade),
      transaction
    )

    if (saida.tipo_saida === "TRANSFERENCIA" && saida.cod_almoxarifado_destino) {
      await ajustarEstoque(
        item.id_produto,
        saida.cod_almoxarifado_destino,
        -Number(item.quantidade),
        transaction
      )
    }
  }
}

const garantirEditavel = (saida) => {
  if (saida.status === "FINALIZADA" || saida.finalizada === true) {
    throw new Error("Saída finalizada não pode ser alterada")
  }
}

export const listarSaidas = async (filtros = {}) => {
  return await saidaRepo.listarTodos(normalizarFiltros(filtros))
}

export const buscarSaidaPorId = async (id) => {
  const saida = await saidaRepo.buscarPorId(id)

  if (!saida) {
    throw new Error("Saída não encontrada")
  }

  return saida
}

export const cadastrarSaida = async (dados) => {
  const dadosSaida = montarDadosSaida(dados)
  const itens = normalizarItens(dados.itens)

  await garantirReferencias(dadosSaida, itens)

  const transaction = await saidaRepo.iniciarTransacao()

  try {
    await aplicarMovimento(dadosSaida, itens, transaction)
    const saida = await saidaRepo.criar(dadosSaida, itens, transaction)

    await transaction.commit()
    return await saidaRepo.buscarPorId(saida.id_saida)
  } catch (erro) {
    await transaction.rollback()
    throw erro
  }
}

export const editarSaida = async (id, dados) => {
  const saidaAtual = await saidaRepo.buscarPorId(id)
  if (!saidaAtual) {
    throw new Error("Saída não encontrada")
  }
  garantirEditavel(saidaAtual)

  const dadosSaida = montarDadosSaida(dados)
  const itens = normalizarItens(dados.itens)

  await garantirReferencias(dadosSaida, itens)

  const transaction = await saidaRepo.iniciarTransacao()

  try {
    await reverterMovimento(saidaAtual, transaction)
    await aplicarMovimento(dadosSaida, itens, transaction)
    await saidaRepo.atualizar(id, dadosSaida, itens, transaction)

    await transaction.commit()
    return await saidaRepo.buscarPorId(id)
  } catch (erro) {
    await transaction.rollback()
    throw erro
  }
}

export const excluirSaida = async (id) => {
  const saida = await saidaRepo.buscarPorId(id)
  if (!saida) {
    throw new Error("Saída não encontrada")
  }
  garantirEditavel(saida)

  const transaction = await saidaRepo.iniciarTransacao()

  try {
    await reverterMovimento(saida, transaction)
    await saidaRepo.excluir(id, transaction)

    await transaction.commit()
  } catch (erro) {
    await transaction.rollback()
    throw erro
  }
}
