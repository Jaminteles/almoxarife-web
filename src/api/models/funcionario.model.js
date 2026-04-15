export default (sequelize, DataTypes) => {
  const Funcionario = sequelize.define("Funcionario", {
    
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },

    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    cargo: {
      type: DataTypes.STRING,
      allowNull: false
    },

    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    senha: {
      type: DataTypes.STRING,
      allowNull: false
    },

    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }

  }, {
    
    tableName: "FUNCIONARIOS",
    timestamps: true,
    createdAt: "dataCadastro",
    updatedAt: "dataAtualizacao"

  })

  return Funcionario
}
