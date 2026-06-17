import db from "../models/index.js";
import * as produtoRepo from "../repositories/produto.repository.js";
import { Op } from "sequelize";

export const listarTodos = async (filtros = {}) => {
  // Monta o WHERE dinamicamente a partir dos filtros recebidos da query.
  // Por padrão lista só produtos ATIVOS — inativados (ativo=0) não devem
  // aparecer na lista nem nos selects de outros módulos.
  // Filtros do RF002: ID, nome, preço de custo, fornecedor, estoque mín/máx.
  const where = { ativo: 1 };

  const limpar = (v) => (v === undefined || v === null ? "" : String(v).trim());

  if (limpar(filtros.id_produto)) where.id_produto = limpar(filtros.id_produto);
  if (limpar(filtros.nome)) where.nome = { [Op.like]: `%${limpar(filtros.nome)}%` };
  if (limpar(filtros.preco_custo)) where.preco_custo = limpar(filtros.preco_custo);
  if (limpar(filtros.estoque_minimo)) where.estoque_minimo = limpar(filtros.estoque_minimo);
  if (limpar(filtros.estoque_maximo)) where.estoque_maximo = limpar(filtros.estoque_maximo);
  if (limpar(filtros.unidade_medida)) where.unidade_medida = limpar(filtros.unidade_medida);

  // Filtro por fornecedor (razão social): descobre os IDs de produto que têm
  // algum fornecedor cuja razão social bate, e restringe a busca a eles.
  // Mantém a lista COMPLETA de fornecedores de cada produto no resultado.
  if (limpar(filtros.fornecedor)) {
    const fornecedores = await db.Fornecedor.findAll({
      where: { razao_social: { [Op.like]: `%${limpar(filtros.fornecedor)}%` } },
      include: [
        {
          model: db.Produto,
          as: "produtos",
          attributes: ["id_produto"],
          through: { attributes: [] }
        }
      ]
    });
    const ids = fornecedores.flatMap((f) => (f.produtos || []).map((p) => p.id_produto));
    // Se nenhum fornecedor casou, força resultado vazio com um ID impossível.
    where.id_produto = { [Op.in]: ids.length ? [...new Set(ids)] : [0] };
  }

  const produtos = await db.Produto.findAll({
    where,
    include: [
      {
        model: db.Almoxarifado,
        as: "almoxarifados_estoque", // <--- IDÊNTICO AO SEU MODEL
        through: {
          attributes: ["quantidade"], // O Sequelize acessa a tabela 'Estoque' via alias
        },
      },
      {
        model: db.Fornecedor, // A nova relação de fornecedores
        as: "fornecedores", 
        through: { attributes: [] } // Geralmente não queremos ver a tabela intermediária
      }
    ],
  });

  return produtos.map((produto) => {
    const prodJSON = produto.toJSON();

    // Verifique o nome da gaveta que o Sequelize criou
    if (prodJSON.almoxarifados_estoque) {
      prodJSON.almoxarifados_estoque = prodJSON.almoxarifados_estoque.map((almoxarifado) => {
        // Como o 'through' é db.Estoque, o Sequelize coloca o resultado em 'Estoque'
        const quantidadeAtual = almoxarifado.Estoque ? almoxarifado.Estoque.quantidade : 0;
        
        let statusEstoque = "REGULAR";

        // Os campos do model são snake_case (estoque_minimo/_maximo).
        // Antes liam camelCase (undefined), então o status era sempre REGULAR.
        if (prodJSON.estoque_minimo && quantidadeAtual <= prodJSON.estoque_minimo) {
          statusEstoque = "CRITICO";
        } else if (prodJSON.estoque_maximo && quantidadeAtual >= prodJSON.estoque_maximo) {
          statusEstoque = "EXCESSO";
        }

        return {
          ...almoxarifado,
          statusEstoque,
        };
      });
    }

    return prodJSON;
  });
};

export const buscarPorId = async (id) => {
  return await produtoRepo.buscarPorId(id);
};

export const criar = async (dadosProduto) => {
  // 1. Validação de campos obrigatórios [RF001 - 5.1.1]
  // unidade_medida entra por ser NOT NULL no banco (sem default).
  // estoque_maximo NÃO é obrigatório: o formulário o trata como opcional
  // (envia null quando vazio) e o model tem default.
  const camposObrigatorios = ['nome', 'preco_custo', 'unidade_medida', 'estoque_minimo'];

  for (const campo of camposObrigatorios) {
    const valor = dadosProduto[campo];
    // Aceita 0 como valor válido (estoque_minimo pode ser 0); só barra
    // valores ausentes ou string vazia. O `!valor` anterior rejeitava 0.
    if (valor === undefined || valor === null || valor.toString().trim() === "") {
      throw new Error("Por favor, preencha todos os campos obrigatórios antes de prosseguir.");
    }
  }

  // estoque_maximo é opcional, mas quando informado precisa ser numérico.
  const temEstoqueMaximo =
    dadosProduto.estoque_maximo !== undefined &&
    dadosProduto.estoque_maximo !== null &&
    dadosProduto.estoque_maximo.toString().trim() !== "";

  // 2. Validação de formato numérico [RF001 - 5.3.1]
  if (
    isNaN(parseFloat(dadosProduto.preco_custo)) ||
    isNaN(parseFloat(dadosProduto.estoque_minimo)) ||
    (temEstoqueMaximo && isNaN(parseFloat(dadosProduto.estoque_maximo)))
  ) {
    throw new Error("Formato de dado inválido. Corrija as informações e tente novamente.");
  }

  // 3. Validação: Duplicidade de nome [RF001 - 5.2.1]
  // Considera apenas produtos ATIVOS: um produto inativado (ativo=0) não deve
  // bloquear o cadastro de um novo com o mesmo nome. O trim evita falso
  // "duplicado" por espaços nas pontas.
  const nomeNormalizado = dadosProduto.nome.trim();
  const duplicado = await db.Produto.findOne({
    where: { nome: nomeNormalizado, ativo: 1 }
  });
  if (duplicado) {
    throw new Error("O registro informado já existe no sistema. Verifique antes de continuar.");
  }

  // 4. Validação: Estoque [RF001 - Fluxo de Exceção]
  // Só compara mínimo x máximo quando o máximo foi informado.
  if (temEstoqueMaximo && Number(dadosProduto.estoque_minimo) >= Number(dadosProduto.estoque_maximo)) {
    throw new Error("O estoque mínimo não pode ser maior ou igual ao estoque máximo.");
  }

  // 5. Validação: pelo menos um fornecedor
  if (!dadosProduto.fornecedores || dadosProduto.fornecedores.length === 0) {
    throw new Error("Pelo menos um fornecedor é obrigatório.");
  }

  // Escrita multi-tabela (Produtos + Produto_Fornecedor) dentro de uma
  // transação: se qualquer passo falhar, nada é gravado (atomicidade).
  return await db.sequelize.transaction(async (t) => {
    const produto = await db.Produto.create(
      {
        nome: nomeNormalizado,
        descricao: dadosProduto.descricao || null,
        preco_custo: parseFloat(dadosProduto.preco_custo),
        unidade_medida: dadosProduto.unidade_medida,
        estoque_minimo: parseFloat(dadosProduto.estoque_minimo),
        // Quando o máximo não é informado, deixa o default do model (0) agir
        // em vez de gravar NaN/null numa coluna NOT NULL.
        ...(temEstoqueMaximo ? { estoque_maximo: parseFloat(dadosProduto.estoque_maximo) } : {})
      },
      { transaction: t }
    );

    // A tabela Produto_Fornecedor exige preco_negociado (NOT NULL).
    // Nesta versão usamos o preço de custo como preço negociado padrão
    // para todos os fornecedores. O `through` aplica esse valor a cada
    // vínculo criado pelo setFornecedores.
    await produto.setFornecedores(dadosProduto.fornecedores, {
      through: { preco_negociado: parseFloat(dadosProduto.preco_custo) },
      transaction: t
    });

    return produto;
  });
};

export const atualizar = async (id, dadosProduto) => {
  // Validação: Duplicidade (ignorando o próprio ID e inativos) [RF003 - 5.2.1]
  if (dadosProduto.nome) {
    const duplicado = await db.Produto.findOne({
      where: { nome: dadosProduto.nome.trim(), ativo: 1, id_produto: { [Op.ne]: id } }
    });
    if (duplicado) throw new Error("O registro informado já existe no sistema.");
  }

  // Campos em snake_case (iguais ao model). estoque_maximo é opcional.
  const temEstoqueMaximo =
    dadosProduto.estoque_maximo !== undefined &&
    dadosProduto.estoque_maximo !== null &&
    dadosProduto.estoque_maximo.toString().trim() !== "";

  if (
    temEstoqueMaximo &&
    Number(dadosProduto.estoque_minimo) >= Number(dadosProduto.estoque_maximo)
  ) {
    throw new Error("O estoque mínimo não pode ser maior ou igual ao estoque máximo.");
  }
  return await produtoRepo.atualizar(id, dadosProduto);
};

export const excluir = async (id) => {
  const produto = await produtoRepo.buscarPorId(id);
  if (!produto) return false;

  // AJUSTE AQUI: Use a coluna exata que existe no seu banco (id_produto)
  const saldoTotal = await db.Estoque.sum('quantidade', { 
    where: { id_produto: id } // <--- MUDAMOS DE ProdutoIdProduto PARA id_produto
  });

  // Nota: Se saldoTotal for null (não encontrou registros), trate como 0
  if ((saldoTotal || 0) > 0) {
    throw new Error("Não é possível inativar um produto com estoque disponível.");
  }

  return await produtoRepo.atualizar(id, { ativo: 0 });
};