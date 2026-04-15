export default (sequelize, DataTypes) => {
  const Fornecedor = sequelize.define("Fornecedor", {
    
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },

    cnpj: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    telefone: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    endereco: {
      type: DataTypes.STRING,
      allowNull: false
    }

  }, {
    
    tableName: "FORNECEDORES",
    timestamps: true,
    createdAt: "dataCadastro",
    updatedAt: "dataAtualizacao"

  })

  return Fornecedor
}
