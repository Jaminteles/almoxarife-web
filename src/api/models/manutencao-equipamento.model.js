/** Histórico de manutenções preventivas/corretivas de cada equipamento. */
export default (sequelize, DataTypes) =>
  sequelize.define("ManutencaoEquipamento", {
    id_manutencao: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    id_equipamento: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    data_manutencao: { type: DataTypes.DATEONLY, allowNull: false },
    horimetro: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    tipo: { type: DataTypes.STRING(100), allowNull: false },
    intervalo_horas: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    observacao: { type: DataTypes.TEXT, allowNull: true },
    id_funcionario: { type: DataTypes.CHAR(36), allowNull: false }
  }, {
    tableName: "Manutencoes_Equipamento",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    charset: "utf8mb4"
  })
