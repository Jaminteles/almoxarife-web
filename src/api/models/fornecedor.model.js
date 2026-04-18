export default (sequelize, DataTypes) => {
  const Fornecedor = sequelize.define("Fornecedor", {
    id_fornecedor: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    razao_social: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    nome_fantasia: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    cnpj: {
      type: DataTypes.CHAR(14),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    ativo: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: "Fornecedores",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: "atualizado_em",
    charset: 'utf8mb4'
  })

  return Fornecedor
}
