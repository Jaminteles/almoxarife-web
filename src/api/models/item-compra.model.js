/**
 * Define o modelo Sequelize para a tabela Item_Compra.
 * * PK COMPOSTA (id_compra, id_produto) para evitar duplicidade de itens na mesma compra.
 * @param {import("sequelize").Sequelize} sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
  const ItemCompra = sequelize.define("ItemCompra", {
    id_compra: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true
    },
    id_produto: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true
    },
    quantidade: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false
    },
    valor_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "preco_unitario_acordado"
    }
  }, {
    tableName: "Item_Compra",
    timestamps: false,
    charset: "utf8mb4"
  })

  return ItemCompra
}
