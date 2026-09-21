import * as repo from "../repositories/gasto-aplicacao.repository.js";

const chaveAplicacao = (valor) => String(valor || "").trim().toLocaleLowerCase("pt-BR");
const numero = (valor) => Number(valor || 0);

const movimentos = async () => {
  const [saidas, servicos] = await Promise.all([repo.buscarSaidas(), repo.buscarServicos()]);
  const resultado = [];

  for (const saida of saidas) {
    const aplicacao = String(saida.aplicacao || "").trim();
    if (!aplicacao) continue;
    for (const item of saida.itens || []) {
      const valorUnitario = numero(item.produto?.preco_custo);
      resultado.push({
        chave: chaveAplicacao(aplicacao), aplicacao, origem: "SAÍDA", id: saida.id_saida,
        data: saida.data_saida, responsavel: saida.responsavel?.nome || "—",
        fornecedor: null, produto: item.produto?.nome || `Produto ${item.id_produto}`,
        quantidade: numero(item.quantidade), valor_unitario: valorUnitario,
        total: numero(item.quantidade) * valorUnitario
      });
    }
  }

  for (const servico of servicos) {
    const aplicacao = String(servico.aplicacao || "").trim();
    if (!aplicacao) continue;
    for (const item of servico.itens || []) {
      const valorUnitario = numero(item.valor_unitario);
      resultado.push({
        chave: chaveAplicacao(aplicacao), aplicacao, origem: "SERVIÇO", id: servico.id_servico,
        data: servico.data_servico, responsavel: servico.responsavel?.nome || "—",
        fornecedor: servico.fornecedor?.razao_social || servico.fornecedor?.nome_fantasia || "—",
        produto: item.produto?.nome || `Produto ${item.id_produto}`,
        quantidade: numero(item.quantidade), valor_unitario: valorUnitario,
        total: numero(item.quantidade) * valorUnitario
      });
    }
  }
  return resultado;
};

export const listarGastosPorAplicacao = async (filtros = {}) => {
  const agrupados = new Map();
  for (const movimento of await movimentos()) {
    const atual = agrupados.get(movimento.chave) || { aplicacao: movimento.aplicacao, total: 0, total_saidas: 0, total_servicos: 0, itens: 0 };
    atual.total += movimento.total;
    atual.itens += 1;
    if (movimento.origem === "SAÍDA") atual.total_saidas += movimento.total;
    else atual.total_servicos += movimento.total;
    agrupados.set(movimento.chave, atual);
  }
  const aplicacao = String(filtros.aplicacao || "").trim().toLocaleLowerCase("pt-BR");
  return [...agrupados.values()]
    .filter((item) => !aplicacao || item.aplicacao.toLocaleLowerCase("pt-BR").includes(aplicacao))
    .sort((a, b) => a.aplicacao.localeCompare(b.aplicacao, "pt-BR"));
};

export const detalharAplicacao = async (aplicacao) => {
  const chave = chaveAplicacao(aplicacao);
  if (!chave) throw new Error("Aplicação é obrigatória");
  const detalhes = (await movimentos()).filter((movimento) => movimento.chave === chave).sort((a, b) => new Date(b.data) - new Date(a.data));
  if (!detalhes.length) throw new Error("Aplicação não encontrada");
  return { aplicacao: detalhes[0].aplicacao, total: detalhes.reduce((soma, item) => soma + item.total, 0), detalhes };
};
