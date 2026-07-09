import * as saidaRepo from "../repositories/saida.repository.js";
import db from "../models/index.js";
import { processarMovimentacao } from "../utils/estoqueHelper.js";
import { assertAcessoAlmoxarifado } from "../utils/escopo.js";

const TIPOS_VALIDOS = ["CONSUMO", "SERVIÇO", "TRANSFERENCIA"];

const normalizarFiltros = (filtros = {}) => {
  const limpos = {};
  const trim = (v) => (typeof v === "string" ? v.trim() : v);

  if (trim(filtros.destino)) limpos.destino = trim(filtros.destino);
  if (trim(filtros.responsavel)) limpos.responsavel = trim(filtros.responsavel);
  if (trim(filtros.produto)) limpos.produto = trim(filtros.produto);
  if (trim(filtros.tipo)) limpos.tipo = trim(filtros.tipo);

  if (trim(filtros.data)) {
    const inicio = new Date(`${trim(filtros.data)}T00:00:00`);
    if (Number.isNaN(inicio.getTime())) {
      throw new Error("Data inválida");
    }

    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);
    limpos.data = { inicio, fim };
  }

  return limpos;
};

const normalizarItens = (itens = []) => {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error("A saída deve ter ao menos um produto");
  }

  const agrupados = new Map();

  for (const item of itens) {
    const idProduto = Number(item.id_produto);
    const quantidade = Number(item.quantidade);

    if (!idProduto || quantidade <= 0) {
      throw new Error("Cada item deve ter produto e quantidade maior que zero");
    }

    agrupados.set(idProduto, (agrupados.get(idProduto) || 0) + quantidade);
  }

  return Array.from(agrupados.entries()).map(([id_produto, quantidade]) => ({
    id_produto,
    quantidade,
  }));
};

const montarDadosSaida = (dados) => {
  if (
    !dados.cod_almoxarifado_origem ||
    !dados.id_funcionario_responsavel ||
    !dados.tipo_saida
  ) {
    throw new Error("Campos obrigatórios: origem, responsável e tipo de saída");
  }

  if (!TIPOS_VALIDOS.includes(dados.tipo_saida)) {
    throw new Error("Tipo de saída inválido");
  }

  const origem = Number(dados.cod_almoxarifado_origem);
  const destino =
    dados.tipo_saida === "TRANSFERENCIA"
      ? Number(dados.cod_almoxarifado_destino)
      : null;

  if (dados.tipo_saida === "TRANSFERENCIA" && !destino) {
    throw new Error("Transferência exige almoxarifado de destino");
  }

  if (destino && destino === origem) {
    throw new Error(
      "O almoxarifado de destino deve ser diferente do de origem",
    );
  }

  return {
    cod_almoxarifado_origem: origem,
    id_funcionario_responsavel: dados.id_funcionario_responsavel,
    tipo_saida: dados.tipo_saida,
    cod_almoxarifado_destino: destino,
    observacao: dados.observacao || null,
    // Equipe que realizou a saída é opcional ("" / 0 → sem equipe).
    id_equipe: dados.id_equipe || null,
  };
};

const garantirReferencias = async (dados, itens) => {
  const origem = await saidaRepo.buscarAlmoxarifado(
    dados.cod_almoxarifado_origem,
  );
  if (!origem || origem.ativo === 0) {
    throw new Error("Almoxarifado de origem não encontrado");
  }

  if (dados.cod_almoxarifado_destino) {
    const destino = await saidaRepo.buscarAlmoxarifado(
      dados.cod_almoxarifado_destino,
    );
    if (!destino || destino.ativo === 0) {
      throw new Error("Almoxarifado de destino não encontrado");
    }
  }

  const responsavel = await saidaRepo.buscarFuncionario(
    dados.id_funcionario_responsavel,
  );
  if (!responsavel || responsavel.is_active === 0) {
    throw new Error("Responsável não encontrado");
  }

  for (const item of itens) {
    const produto = await saidaRepo.buscarProduto(item.id_produto);
    if (!produto || produto.ativo === 0) {
      throw new Error(`Produto ${item.id_produto} não encontrado`);
    }
  }
};

const aplicarMovimento = async (dados, itens, transaction) => {
  const tipoOperacao =
    dados.tipo_saida === "TRANSFERENCIA"
      ? "SAIDA_TRANSFERENCIA"
      : "SAIDA_CONSUMO";

  for (const item of itens) {
    await processarMovimentacao(
      {
        tipo: tipoOperacao,
        cod_produto: item.id_produto,
        cod_almoxarifado_origem: dados.cod_almoxarifado_origem,
        cod_almoxarifado_destino: dados.cod_almoxarifado_destino || null,
        quantidade: item.quantidade,
      },
      transaction,
    );
  }
};

const reverterMovimento = async (saida, transaction) => {
  for (const item of saida.itens || []) {
    if (saida.tipo_saida === "TRANSFERENCIA") {
      // Reverter transferência: tira do destino e volta para a origem
      await processarMovimentacao(
        {
          tipo: "SAIDA_TRANSFERENCIA",
          cod_produto: item.id_produto,
          cod_almoxarifado_origem: saida.cod_almoxarifado_destino,
          cod_almoxarifado_destino: saida.cod_almoxarifado_origem,
          quantidade: item.quantidade,
        },
        transaction,
      );
    } else {
      // Reverter consumo: funciona igual a uma compra (adiciona de volta na origem)
      await processarMovimentacao(
        {
          tipo: "COMPRA",
          cod_produto: item.id_produto,
          cod_almoxarifado_destino: saida.cod_almoxarifado_origem,
          quantidade: item.quantidade,
        },
        transaction,
      );
    }
  }
};

const garantirEditavel = (saida) => {
  if (saida.status === "FINALIZADA" || saida.finalizada === true) {
    throw new Error("Saída finalizada não pode ser alterada");
  }
};

// Reverter uma saída devolve estoque à ORIGEM (e, em transferência, retira do
// DESTINO). Não faz sentido movimentar estoque de/para um almoxarifado inativo,
// então bloqueia a edição/exclusão enquanto algum deles estiver inativo.
const garantirAlmoxarifadosAtivosParaReverter = async (saida) => {
  const origem = await saidaRepo.buscarAlmoxarifado(saida.cod_almoxarifado_origem);
  if (!origem || origem.ativo === 0) {
    const erro = new Error(
      "Não é possível reverter esta saída: o almoxarifado de origem está inativo. Reative-o antes de editar ou excluir a saída.",
    );
    erro.status = 409;
    throw erro;
  }

  if (saida.tipo_saida === "TRANSFERENCIA" && saida.cod_almoxarifado_destino) {
    const destino = await saidaRepo.buscarAlmoxarifado(saida.cod_almoxarifado_destino);
    if (!destino || destino.ativo === 0) {
      const erro = new Error(
        "Não é possível reverter esta transferência: o almoxarifado de destino está inativo. Reative-o antes de editar ou excluir a saída.",
      );
      erro.status = 409;
      throw erro;
    }
  }
};

export const listarSaidas = async (filtros = {}, escopo = null) => {
  const limpos = normalizarFiltros(filtros);
  // Usuário restrito só vê saídas cuja ORIGEM é o seu almoxarifado.
  if (escopo != null) limpos.origem = escopo;
  return await saidaRepo.listarTodos(limpos);
};

export const buscarSaidaPorId = async (id, escopo = null) => {
  const saida = await saidaRepo.buscarPorId(id);

  if (!saida) {
    throw new Error("Saída não encontrada");
  }

  assertAcessoAlmoxarifado(escopo, saida.cod_almoxarifado_origem);
  return saida;
};

export const cadastrarSaida = async (dados, escopo = null) => {
  // Usuário restrito: a origem é SEMPRE o seu almoxarifado (ignora o enviado).
  const entrada = escopo != null ? { ...dados, cod_almoxarifado_origem: escopo } : dados;
  const dadosSaida = montarDadosSaida(entrada);
  const itens = normalizarItens(dados.itens);

  await garantirReferencias(dadosSaida, itens);

  return await db.sequelize.transaction(async (t) => {
    await aplicarMovimento(dadosSaida, itens, t);
    const saida = await saidaRepo.criar(dadosSaida, itens, t);

    return await saidaRepo.buscarPorId(saida.id_saida, t);
  });
};

export const editarSaida = async (id, dados, escopo = null) => {
  const saidaAtual = await saidaRepo.buscarPorId(id);
  if (!saidaAtual) {
    throw new Error("Saída não encontrada");
  }
  // A saída existente precisa pertencer ao almoxarifado do usuário restrito.
  assertAcessoAlmoxarifado(escopo, saidaAtual.cod_almoxarifado_origem);
  garantirEditavel(saidaAtual);
  // Editar reverte o movimento antigo — exige os almoxarifados dele ativos.
  await garantirAlmoxarifadosAtivosParaReverter(saidaAtual);

  const entrada = escopo != null ? { ...dados, cod_almoxarifado_origem: escopo } : dados;
  const dadosSaida = montarDadosSaida(entrada);
  const itens = normalizarItens(dados.itens);

  await garantirReferencias(dadosSaida, itens);

  return await db.sequelize.transaction(async (t) => {
    await reverterMovimento(saidaAtual, t);
    await aplicarMovimento(dadosSaida, itens, t);
    await saidaRepo.atualizar(id, dadosSaida, itens, t);

    return await saidaRepo.buscarPorId(id, t);
  });
};

export const excluirSaida = async (id, escopo = null) => {
  const saida = await saidaRepo.buscarPorId(id);
  if (!saida) {
    throw new Error("Saída não encontrada");
  }
  assertAcessoAlmoxarifado(escopo, saida.cod_almoxarifado_origem);
  garantirEditavel(saida);
  // Excluir reverte o movimento — exige os almoxarifados dele ativos.
  await garantirAlmoxarifadosAtivosParaReverter(saida);

  return await db.sequelize.transaction(async (t) => {
    await reverterMovimento(saida, t);
    await saidaRepo.excluir(id, t);
  });
};
