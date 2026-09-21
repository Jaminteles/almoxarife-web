export default (sequelize, DataTypes) =>
  sequelize.define("Servico", {
    id_servico: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    id_fornecedor: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    id_funcionario_responsavel: { type: DataTypes.CHAR(36), allowNull: false },
    cod_almoxarifado: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    data_servico: { type: DataTypes.DATE, allowNull: false },
    numero_nota_fiscal: { type: DataTypes.STRING(50), allowNull: false },
    aplicacao: { type: DataTypes.STRING(255), allowNull: false },
    observacao: { type: DataTypes.TEXT, allowNull: true },
    valor_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 }
  }, { tableName: "Servico", timestamps: false, charset: "utf8mb4" })
