import db from "../models/index.js"
import * as repo from "../repositories/manutencao.repository.js"
import { assertAcessoAlmoxarifado } from "../utils/escopo.js"

export const STATUS = {
  VENCIDA: "REVISAO_VENCIDA",
  PROXIMA: "PROXIMO_A_VENCER",
  DENTRO_PRAZO: "AINDA_NAO_VENCEU",
  SEM_LEITURA: "SEM_LEITURA",
  SEM_MANUTENCAO: "SEM_MANUTENCAO"
}

export const ROTULO_STATUS = {
  [STATUS.VENCIDA]: "Revisão vencida",
  [STATUS.PROXIMA]: "Próximo a vencer",
  [STATUS.DENTRO_PRAZO]: "Ainda não venceu",
  [STATUS.SEM_LEITURA]: "Sem leitura de horímetro",
  [STATUS.SEM_MANUTENCAO]: "Sem manutenção registrada"
}

const erroHttp = (mensagem, status = 400) => Object.assign(new Error(mensagem), { status })
const numero = (valor, campo, { maiorQueZero = false } = {}) => {
  const valorNumerico = Number(valor)
  if (!Number.isFinite(valorNumerico) || valorNumerico < 0 || (maiorQueZero && valorNumerico <= 0)) {
    throw erroHttp(`Informe ${campo} válido${maiorQueZero ? " maior que zero" : ""}`)
  }
  return valorNumerico
}
const texto = (valor, campo) => {
  if (valor === undefined || valor === null || !String(valor).trim()) throw erroHttp(`O campo ${campo} é obrigatório`)
  return String(valor).trim()
}
const data = (valor, campo) => {
  const correspondencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor || ""))
  if (!correspondencia) throw erroHttp(`Informe uma ${campo} válida`)
  const [ano, mes, dia] = correspondencia.slice(1).map(Number)
  const teste = new Date(Date.UTC(ano, mes - 1, dia))
  if (teste.getUTCFullYear() !== ano || teste.getUTCMonth() !== mes - 1 || teste.getUTCDate() !== dia) throw erroHttp(`Informe uma ${campo} válida`)
  return String(valor)
}

const validarEquipamento = async (id, escopo = null) => {
  const equipamento = await repo.buscarEquipamento(id)
  if (!equipamento) throw erroHttp("Equipamento não encontrado", 404)
  assertAcessoAlmoxarifado(escopo, equipamento.obraId)
  return equipamento
}

const normalizarLeitura = (entrada = {}) => ({
  horimetro: numero(entrada.horimetro, "um horímetro"),
  data_leitura: data(entrada.dataLeitura ?? entrada.data_leitura, "data da leitura"),
  observacao: String(entrada.observacao || "").trim() || null
})

const normalizarManutencao = (entrada = {}) => ({
  data_manutencao: data(entrada.dataManutencao ?? entrada.data_manutencao, "data da manutenção"),
  horimetro: numero(entrada.horimetro, "um horímetro"),
  tipo: texto(entrada.tipo, "tipo de manutenção"),
  intervalo_horas: numero(entrada.intervaloHoras ?? entrada.intervalo_horas, "intervalo em horas", { maiorQueZero: true }),
  observacao: String(entrada.observacao || "").trim() || null
})

function primeiraPorEquipamento(registros) {
  const porEquipamento = new Map()
  registros.forEach((registro) => {
    if (!porEquipamento.has(registro.id_equipamento)) porEquipamento.set(registro.id_equipamento, registro)
  })
  return porEquipamento
}

/** Regra central de cálculo; o limite de aviso permanece concentrado aqui. */
export function calcularSituacao(leitura, manutencao) {
  if (!manutencao) return { status: STATUS.SEM_MANUTENCAO, proximaRevisao: null, horasRestantes: null }
  if (!leitura) return { status: STATUS.SEM_LEITURA, proximaRevisao: Number(manutencao.horimetro) + Number(manutencao.intervalo_horas), horasRestantes: null }
  const proximaRevisao = Number(manutencao.horimetro) + Number(manutencao.intervalo_horas)
  const horasRestantes = proximaRevisao - Number(leitura.horimetro)
  const status = horasRestantes <= 0 ? STATUS.VENCIDA : horasRestantes <= 50 ? STATUS.PROXIMA : STATUS.DENTRO_PRAZO
  return { status, proximaRevisao, horasRestantes }
}

function resumir(equipamento, leitura, manutencao) {
  const situacao = calcularSituacao(leitura, manutencao)
  return {
    id_equipamento: equipamento.id_equipamento,
    descricao: equipamento.descricao,
    codigo: equipamento.codigo,
    obra: equipamento.obra,
    horimetroAtual: leitura ? Number(leitura.horimetro) : null,
    dataUltimaLeitura: leitura?.data_leitura || null,
    horimetroUltimaRevisao: manutencao ? Number(manutencao.horimetro) : null,
    dataUltimaRevisao: manutencao?.data_manutencao || null,
    intervaloHoras: manutencao ? Number(manutencao.intervalo_horas) : null,
    proximaRevisao: situacao.proximaRevisao,
    horasRestantes: situacao.horasRestantes,
    status: situacao.status,
    statusRotulo: ROTULO_STATUS[situacao.status],
    possuiLeitura: Boolean(leitura),
    possuiManutencao: Boolean(manutencao)
  }
}

export async function listarPainel(filtros = {}, escopo = null) {
  const equipamentos = await repo.listarEquipamentos({ ...filtros, obraId: escopo ?? filtros.obraId })
  const ids = equipamentos.map(({ id_equipamento }) => id_equipamento)
  const [leituras, manutencoes] = await Promise.all([repo.listarLeiturasRecentes(ids), repo.listarManutencoesRecentes(ids)])
  const ultimasLeituras = primeiraPorEquipamento(leituras)
  const ultimasManutencoes = primeiraPorEquipamento(manutencoes)
  const todosItens = equipamentos.map((equipamento) => resumir(equipamento, ultimasLeituras.get(equipamento.id_equipamento), ultimasManutencoes.get(equipamento.id_equipamento)))
  let itens = todosItens

  const situacao = filtros.status || filtros.situacao
  if (situacao) {
    itens = itens.filter((item) => (situacao === STATUS.SEM_LEITURA ? !item.possuiLeitura
      : situacao === STATUS.SEM_MANUTENCAO ? !item.possuiManutencao
        : item.status === situacao))
  }
  if (filtros.dataInicio) itens = itens.filter((item) => item.dataUltimaLeitura && item.dataUltimaLeitura >= filtros.dataInicio)
  if (filtros.dataFim) itens = itens.filter((item) => item.dataUltimaLeitura && item.dataUltimaLeitura <= filtros.dataFim)

  const totais = {
    totalEquipamentos: equipamentos.length,
    revisoesVencidas: todosItens.filter((item) => item.status === STATUS.VENCIDA).length,
    proximasAVencer: todosItens.filter((item) => item.status === STATUS.PROXIMA).length,
    dentroDoPrazo: todosItens.filter((item) => item.status === STATUS.DENTRO_PRAZO).length,
    semLeitura: todosItens.filter((item) => !item.possuiLeitura).length,
    semManutencao: todosItens.filter((item) => !item.possuiManutencao).length
  }
  return { itens, totais }
}

export async function buscarDetalhes(id, escopo = null) {
  const equipamento = await validarEquipamento(id, escopo)
  const [horimetros, manutencoes] = await Promise.all([repo.listarHorimetros(id), repo.listarManutencoes(id)])
  const leituraAtual = horimetros[0] || null
  const manutencaoAtual = manutencoes[0] || null
  const resumo = resumir(equipamento, leituraAtual, manutencaoAtual)
  const historicoHorimetros = [...horimetros].reverse().map((registro, indice, lista) => ({
    ...registro.toJSON(),
    horimetro: Number(registro.horimetro),
    horasTrabalhadas: indice === 0 ? null : Number(registro.horimetro) - Number(lista[indice - 1].horimetro)
  })).reverse()
  return { ...resumo, equipamento, horimetros: historicoHorimetros, manutencoes }
}

export async function registrarHorimetro(id, entrada, usuario, escopo = null) {
  await validarEquipamento(id, escopo)
  const dados = normalizarLeitura(entrada)
  return db.sequelize.transaction(async (transaction) => {
    const maiorLeitura = await repo.buscarMaiorHorimetro(id, transaction)
    if (maiorLeitura && dados.horimetro < Number(maiorLeitura.horimetro) && entrada.confirmarCorrecao !== true) {
      throw erroHttp(`O horímetro não pode ser menor que a maior leitura registrada (${maiorLeitura.horimetro} h). Marque a correção explícita para prosseguir.`)
    }
    return repo.criarHorimetro({ ...dados, id_equipamento: id, id_funcionario: usuario.id_funcionario }, transaction)
  })
}

export async function atualizarHorimetro(id, idHorimetro, entrada, escopo = null) {
  await validarEquipamento(id, escopo)
  const existente = await repo.buscarHorimetro(id, idHorimetro)
  if (!existente) throw erroHttp("Leitura de horímetro não encontrada", 404)
  const dados = normalizarLeitura({ ...existente.toJSON(), ...entrada })
  return db.sequelize.transaction(async (transaction) => {
    const maiorLeitura = await repo.buscarMaiorHorimetroExceto(id, idHorimetro, transaction)
    if (maiorLeitura && dados.horimetro < Number(maiorLeitura.horimetro) && entrada.confirmarCorrecao !== true) {
      throw erroHttp(`O horímetro não pode ser menor que a maior leitura registrada (${maiorLeitura.horimetro} h). Marque a correção explícita para prosseguir.`)
    }
    return repo.atualizarHorimetro(id, idHorimetro, dados, transaction)
  })
}

export async function registrarManutencao(id, entrada, usuario, escopo = null) {
  await validarEquipamento(id, escopo)
  const dados = normalizarManutencao(entrada)
  return db.sequelize.transaction(async (transaction) => {
    const ultima = await repo.buscarUltimaManutencao(id, transaction)
    if (ultima && dados.horimetro < Number(ultima.horimetro) && entrada.confirmarCorrecao !== true) {
      throw erroHttp(`O horímetro da manutenção não pode ser menor que a última manutenção (${ultima.horimetro} h) sem confirmação de correção.`)
    }
    return repo.criarManutencao({ ...dados, id_equipamento: id, id_funcionario: usuario.id_funcionario }, transaction)
  })
}

export async function atualizarManutencao(id, idManutencao, entrada, escopo = null) {
  await validarEquipamento(id, escopo)
  const existente = await repo.buscarManutencao(id, idManutencao)
  if (!existente) throw erroHttp("Manutenção não encontrada", 404)
  const dados = normalizarManutencao({ ...existente.toJSON(), ...entrada })
  const ultima = await repo.buscarUltimaManutencao(id)
  if (ultima && ultima.id_manutencao !== existente.id_manutencao && dados.horimetro < Number(ultima.horimetro) && entrada.confirmarCorrecao !== true) {
    throw erroHttp(`O horímetro da manutenção não pode ser menor que a última manutenção (${ultima.horimetro} h) sem confirmação de correção.`)
  }
  return repo.atualizarManutencao(id, idManutencao, dados)
}
