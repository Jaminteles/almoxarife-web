export default (sequelize, DataTypes) => {
  const Cargo = sequelize.define("Cargo", {
    id_cargo: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nome_cargo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: "Cargos",
    timestamps: false
  })

  return Cargo
}
