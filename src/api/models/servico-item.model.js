export default (sequelize, DataTypes) =>
  sequelize.define("ServicoItem", {
    id_servico: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    id_produto: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    quantidade: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
    valor_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
  }, { tableName: "Servico_Item", timestamps: false, charset: "utf8mb4" })
