export default (sequelize, DataTypes) => {
  const TelefoneFornecedor = sequelize.define("TelefoneFornecedor", {
    id_fornecedor: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true
    },
    telefone: {
      type: DataTypes.STRING(25),
      primaryKey: true,
      allowNull: false
    }
  }, {
    tableName: "Telefone_Fornecedor",
    timestamps: false,
    charset: 'utf8mb4'
  })

  return TelefoneFornecedor
}
