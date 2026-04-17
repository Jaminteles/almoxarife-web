export default (sequelize, DataTypes) => {
  const UsuarioSistema = sequelize.define("UsuarioSistema", {
    id_funcionario: {
      type: DataTypes.CHAR(36),
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    access_level: {
      type: DataTypes.ENUM("CENTRAL", "ALMOXARIFE", "AUXILIAR", "CONSULTA"),
      allowNull: false,
      defaultValue: "CONSULTA"
    },
    ultimo_login: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    bloqueado: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0
    }
  }, {
    tableName: "Usuarios_Sistema",
    timestamps: false,
    charset: 'utf8mb4'
  })

  return UsuarioSistema
}
