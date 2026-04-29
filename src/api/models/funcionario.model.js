/**
 * Define o modelo Sequelize para a tabela Funcionarios.
 * O campo `email` armazena o contato do funcionário — distinto da credencial de login em Usuarios_Sistema.
 * @param {import("sequelize").Sequelize} sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
  const Funcionario = sequelize.define("Funcionario", {
    id_funcionario: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cpf: {
      type: DataTypes.CHAR(11),
      allowNull: false,
      unique: true
    },
 
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    // ────────────────────────────────────────────────────────────
 
    id_cargo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1
    }
  }, {
    tableName: "Funcionarios",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    charset: "utf8mb4"
  })
 
  return Funcionario
}

