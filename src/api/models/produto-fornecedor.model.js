/**
 * Model da tabela de junção Produto_Fornecedor (N:M entre Produto e Fornecedor).
 *
 * Diferente de uma junção "pura" (só as duas FKs), esta tabela tem um atributo
 * próprio: preco_negociado (NOT NULL no banco). Por isso ela precisa de um model
 * explícito — sem ele, o Sequelize não saberia gravar/ler essa coluna, e o
 * INSERT do vínculo falharia por violar o NOT NULL.
 *
 * @param {import("sequelize").Sequelize} sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
  const ProdutoFornecedor = sequelize.define(
    "ProdutoFornecedor",
    {
      id_produto: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true
      },
      id_fornecedor: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true
      },
      preco_negociado: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: false
      }
    },
    {
      // Aponta para o nome EXATO da tabela no SQL (com underline).
      tableName: "Produto_Fornecedor",
      timestamps: false
    }
  )

  return ProdutoFornecedor
}
