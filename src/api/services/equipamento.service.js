import * as equipamentoRepo from "../repositories/equipamento.repository.js"

const ANO_MINIMO = 1800

const textoObrigatorio = (valor, nome) => {
  if (valor === undefined || valor === null || !String(valor).trim()) {
    const erro = new Error(`O campo ${nome} é obrigatório`)
    erro.status = 400
    throw erro
  }
  return String(valor).trim()
}

const normalizarAno = (valor) => {
  const ano = Number(valor)
  const anoAtual = new Date().getFullYear()
  if (!Number.isInteger(ano) || ano < ANO_MINIMO || ano > anoAtual) {
    const erro = new Error(`Informe um ano de fabricação válido entre ${ANO_MINIMO} e ${anoAtual}`)
    erro.status = 400
    throw erro
  }
  return ano
}

const normalizarObraId = (valor) => {
  const obraId = Number(valor)
  if (!Number.isInteger(obraId) || obraId <= 0) {
    const erro = new Error("Selecione uma obra válida")
    erro.status = 400
    throw erro
  }
  return obraId
}

const normalizarDados = (dados) => ({
  descricao: textoObrigatorio(dados.descricao, "Descrição do equipamento"),
  codigo: textoObrigatorio(dados.codigo, "Código do equipamento"),
  capacidadePotencia: textoObrigatorio(dados.capacidadePotencia, "Capacidade / Potência"),
  marca: textoObrigatorio(dados.marca, "Marca"),
  serieChassis: textoObrigatorio(dados.serieChassis, "Série / Chassis"),
  placa: dados.placa === undefined || dados.placa === null || !String(dados.placa).trim()
    ? null
    : String(dados.placa).trim().toUpperCase(),
  anoFabricacao: normalizarAno(dados.anoFabricacao),
  obraId: normalizarObraId(dados.obraId)
})

const validarObra = async (obraId) => {
  const obra = await equipamentoRepo.buscarObraAtivaPorId(obraId)
  if (!obra) {
    const erro = new Error("A obra selecionada não existe ou está inativa")
    erro.status = 400
    throw erro
  }
}

const validarCodigoUnico = async (codigo, idIgnorado = null) => {
  const existente = await equipamentoRepo.buscarPorCodigo(codigo, idIgnorado)
  if (existente) {
    const erro = new Error("Já existe um equipamento cadastrado com este código")
    erro.status = 409
    throw erro
  }
}

const normalizarFiltros = (filtros = {}) => {
  const limpos = {}
  if (filtros.descricao && String(filtros.descricao).trim()) limpos.descricao = String(filtros.descricao).trim()
  if (filtros.codigo && String(filtros.codigo).trim()) limpos.codigo = String(filtros.codigo).trim()
  if (filtros.obraId !== undefined && String(filtros.obraId).trim()) limpos.obraId = normalizarObraId(filtros.obraId)
  return limpos
}

export const listarEquipamentos = async (filtros = {}) => {
  return await equipamentoRepo.listarTodos(normalizarFiltros(filtros))
}

export const buscarEquipamentoPorId = async (id) => {
  const equipamento = await equipamentoRepo.buscarPorId(id)
  if (!equipamento) {
    const erro = new Error("Equipamento não encontrado")
    erro.status = 404
    throw erro
  }
  return equipamento
}

export const criarEquipamento = async (dados) => {
  const normalizados = normalizarDados(dados || {})
  await validarObra(normalizados.obraId)
  await validarCodigoUnico(normalizados.codigo)

  const criado = await equipamentoRepo.criar(normalizados)
  return await equipamentoRepo.buscarPorId(criado.id_equipamento)
}

export const atualizarEquipamento = async (id, dados) => {
  const existente = await equipamentoRepo.buscarPorId(id)
  if (!existente) {
    const erro = new Error("Equipamento não encontrado")
    erro.status = 404
    throw erro
  }

  // PUT aceita o formulário completo e PATCH preserva os campos omitidos.
  const normalizados = normalizarDados({ ...existente.toJSON(), ...(dados || {}) })
  await validarObra(normalizados.obraId)
  await validarCodigoUnico(normalizados.codigo, existente.id_equipamento)

  return await equipamentoRepo.atualizar(id, normalizados)
}

export const excluirEquipamento = async (id) => {
  const equipamento = await equipamentoRepo.buscarPorId(id)
  if (!equipamento) {
    const erro = new Error("Equipamento não encontrado")
    erro.status = 404
    throw erro
  }
  await equipamentoRepo.excluir(id)
}
