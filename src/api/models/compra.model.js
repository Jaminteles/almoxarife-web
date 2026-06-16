/**
 * Define o modelo Sequelize para a tabela Compra.
 * * Mapeia os dados dos pedidos de compras e faz a ponte com o banco de dados,
 * respeitando as colunas exatas da tabela física do MySQL.
 * * @param {import("sequelize").Sequelize} sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
  const Compra = sequelize.define("Compra", {
    id_compra: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    id_fornecedor: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    id_funcionario_comprador: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    cod_almoxarifado_destino: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    data_compra: {
      type: DataTypes.DATE,
      field: "data_pedido" // Traduz 'data_compra' em JS para 'data_pedido' no MySQL
    },
    status: {
      type: DataTypes.ENUM("PENDENTE", "RECEBIDO", "CANCELADO"),
      defaultValue: "PENDENTE",
      field: "status_pedido" // Traduz 'status' em JS para 'status_pedido' no MySQL
    },
    // Adicione este campo dentro do const Compra = sequelize.define(...)
    numero_nota_fiscal: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "numero_nota_fiscal"
    },
    valor_total: {
      type: DataTypes.DECIMAL(12, 4),
      defaultValue: 0.0000,
      field: "valor_total_pedido" // Traduz 'valor_total' em JS para 'valor_total_pedido' no MySQL
    }
  }, {
    tableName: "Compra",
    timestamps: false, // O MySQL já gerencia o CURRENT_TIMESTAMP no 'data_pedido'
    charset: "utf8mb4"
  })

  return Compra
}
