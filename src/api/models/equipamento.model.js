/**
 * Equipamentos pertencem a um almoxarifado, que neste sistema representa a
 * obra/localização onde o bem está alocado. A API expõe a chave como `obraId`
 * para manter o contrato do módulo, enquanto o banco usa `obra_id`.
 */
export default (sequelize, DataTypes) => {
  const Equipamento = sequelize.define("Equipamento", {
    id_equipamento: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    descricao: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    capacidadePotencia: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "capacidade_potencia"
    },
    marca: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    serieChassis: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "serie_chassis"
    },
    placa: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    anoFabricacao: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "ano_fabricacao"
    },
    obraId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "obra_id"
    }
  }, {
    tableName: "Equipamentos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    charset: "utf8mb4"
  })

  return Equipamento
}
