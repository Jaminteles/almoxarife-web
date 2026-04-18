export default (sequelize, DataTypes) => {
  const EnderecoFornecedor = sequelize.define("EnderecoFornecedor", {
    id_endereco: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    id_fornecedor: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    cep: {
      type: DataTypes.CHAR(8),
      allowNull: false
    },
    logradouro: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    numero: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    complemento: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bairro: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    estado: {
      type: DataTypes.CHAR(2),
      allowNull: false
    }
  }, {
    tableName: "Endereco_Fornecedor",
    timestamps: false,
    charset: 'utf8mb4'
  })

  return EnderecoFornecedor
}
