/**
 * Define o modelo Sequelize para a tabela Produtos.
 *
 * O modulo de saidas precisa listar produtos e vincular cada item de saida
 * a um produto existente.
 *
 * @param {import("sequelize").Sequelize} sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
  const Produto = sequelize.define("Produto", {
    id_produto: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preco_custo: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
      defaultValue: 0.0000
    },
    unidade_medida: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    estoque_minimo: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0.000
    },
    estoque_maximo: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0.000
    },
    ativo: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: "Produtos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    charset: "utf8mb4"
  })

  return Produto
}
