/**
 * Define o modelo Sequelize para a tabela Equipes.
 *
 * Uma equipe agrupa funcionários (relação 1:N: Funcionario.id_equipe aponta
 * para cá). É usada, por exemplo, para registrar QUAL equipe realizou uma saída.
 * Usa soft-delete (is_active) para não quebrar saídas que já referenciam a
 * equipe — inativar esconde da listagem mas preserva o histórico.
 *
 * @param {import("sequelize").Sequelize} sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
  const Equipe = sequelize.define("Equipe", {
    id_equipe: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1
    }
  }, {
    tableName: "Equipes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    charset: "utf8mb4"
  })

  return Equipe
}
