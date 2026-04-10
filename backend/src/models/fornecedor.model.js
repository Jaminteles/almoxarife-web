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
    
    // ALTERAR
    tableName: "NOME_DA_TABELA",

    //timestamps: false, -> DESCOMENTAR ISSO SE NÃO TIVER createdAt/updatedAt

    //createdAt: "nome", -> Caso possua esses campos mas com outro nome
    //updatedAt: "data_ atualizacao"

  })

  return Fornecedor
}
