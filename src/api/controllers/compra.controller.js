import * as compraService from "../services/compra.service.js"
import { escopoAlmoxarifado } from "../utils/escopo.js"

export const listar = async (req, res) => {
  try {
    // 1. Extraímos tudo que vem da URL
    const { 
      data_inicio, 
      data_fim, 
      numero_nota_fiscal, 
      fornecedor, 
      produto, 
      status 
    } = req.query;

    // 2. Montamos o objeto de filtros seguindo a estrutura que o seu repository espera
    const filtros = {
      status,
      numero_nota_fiscal,
      fornecedor,
      produto,
      // Se o usuário informar as duas datas, montamos o objeto esperado pelo repository
      data: (data_inicio && data_fim) ? { inicio: data_inicio, fim: data_fim } : null
    };

    // 3. Chamamos o service passando o objeto filtros + escopo de almoxarifado
    const escopo = escopoAlmoxarifado(req.usuario);
    const dados = await compraService.listarCompras(filtros, escopo);

    // 4. Retornamos a resposta
    return res.status(200).json({
      sucesso: true,
      total: dados.length,
      dados
    });

  } catch (erro) {
    console.error("Erro ao listar compras:", erro);
    return res.status(400).json({ 
      sucesso: false, 
      erro: erro.message 
    });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const dados = await compraService.buscarCompraPorId(req.params.id, escopo)
    res.json({ sucesso: true, dados })
  } catch (erro) {
    res.status(erro.status || 404).json({ sucesso: false, erro: erro.message })
  }
}

export const cadastrar = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const dados = await compraService.cadastrarCompra(req.body, escopo)
    res.status(201).json({
      sucesso: true,
      mensagem: "Compra registrada com sucesso!",
      dados
    })
  } catch (erro) {
    res.status(400).json({ sucesso: false, erro: erro.message })
  }
}

export const editar = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const dados = await compraService.editarCompra(req.params.id, req.body, escopo)
    res.json({
      sucesso: true,
      mensagem: "Operação realizada com sucesso!",
      dados
    })
  } catch (erro) {
    const status = erro.status || (erro.message.includes("Nenhum pedido encontrado") ? 404 : 400)
    res.status(status).json({ sucesso: false, erro: erro.message })
  }
}

export const receber = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    const dados = await compraService.confirmarRecebimento(req.params.id, escopo)
    res.json({
      sucesso: true,
      mensagem: "Recebimento confirmado! O estoque do almoxarifado foi atualizado.",
      dados
    })
  } catch (erro) {
    const status = erro.status || (erro.message.includes("Nenhum pedido encontrado") ? 404 : 400)
    res.status(status).json({ sucesso: false, erro: erro.message })
  }
}

export const excluir = async (req, res) => {
  try {
    const escopo = escopoAlmoxarifado(req.usuario)
    await compraService.excluirCompra(req.params.id, escopo)
    res.json({ sucesso: true, mensagem: "Compra excluída com sucesso!" })
  } catch (erro) {
    const status = erro.status || (erro.message.includes("Nenhum pedido encontrado") ? 404 : 400)
    res.status(status).json({ sucesso: false, erro: erro.message })
  }
}
