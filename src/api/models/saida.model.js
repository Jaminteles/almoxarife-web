/**
 * Define o modelo Sequelize para a tabela Saida.
 *
 * Cabeçalho de uma saída de material. O `tipo_saida` decide a regra:
 *   - CONSUMO        → material sai do almoxarifado (sem destino)
 *   - TRANSFERENCIA  → vai para outro almoxarifado (cod_almoxarifado_destino)
 *
 * `data_saida` funciona como data de criação do registro, então mapeamos
 * como createdAt e desligamos o updatedAt (o SQL não tem coluna de update).
 * Os itens ficam em Saida_Item (ver saida-item.model.js).
 *
 * @param {import("sequelize").Sequelize} sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
  const Saida = sequelize.define("Saida", {
    id_saida: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    // FK -> Almoxarifado (origem). Associação em index.js.
    cod_almoxarifado_origem: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    // FK -> Funcionario (responsável). CHAR(36) por causa do UUID.
    id_funcionario_responsavel: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    tipo_saida: {
      type: DataTypes.ENUM("CONSUMO", "SERVIÇO","TRANSFERENCIA"),
      allowNull: false
    },
    // FK -> Almoxarifado (destino). Nulo quando tipo_saida = CONSUMO.
    cod_almoxarifado_destino: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null
    },
    // FK -> Equipe que realizou a saída (opcional). Associação em index.js.
    id_equipe: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: "Saida",
    timestamps: true,
    createdAt: "data_saida",
    updatedAt: false,
    charset: "utf8mb4",
    validate: {
      destinoDiferenteDaOrigem() {
        if (
          this.cod_almoxarifado_destino != null &&
          this.cod_almoxarifado_destino === this.cod_almoxarifado_origem
        ) {
          throw new Error("O almoxarifado de destino deve ser diferente do de origem")
        }
      }
    }
  })

  return Saida
}
