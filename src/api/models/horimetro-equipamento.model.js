/**
 * Leitura imutável do horímetro. O valor atual de um equipamento é sempre
 * obtido pela leitura mais recente; ele não é gravado em Equipamentos.
 */
export default (sequelize, DataTypes) =>
  sequelize.define("HorimetroEquipamento", {
    id_horimetro: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    id_equipamento: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    horimetro: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    data_leitura: { type: DataTypes.DATEONLY, allowNull: false },
    observacao: { type: DataTypes.TEXT, allowNull: true },
    id_funcionario: { type: DataTypes.CHAR(36), allowNull: false }
  }, {
    tableName: "Horimetros_Equipamento",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    charset: "utf8mb4"
  })
