/**
 * Modelo da tabela Solicitacoes_Cadastro.
 *
 * Fila de pedidos de criação de conta. A pessoa preenche seus dados numa tela
 * pública; o CENTRAL analisa e aprova (criando o funcionário + credencial e
 * vinculando-o a um almoxarifado) ou rejeita.
 *
 * A senha já é guardada como hash (bcrypt) no momento da solicitação — nunca
 * em texto puro.
 */
export default (sequelize, DataTypes) => {
  const SolicitacaoCadastro = sequelize.define("SolicitacaoCadastro", {
    id_solicitacao: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cpf: {
      type: DataTypes.CHAR(11),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mensagem: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },
    status: {
      type: DataTypes.ENUM("PENDENTE", "APROVADO", "REJEITADO"),
      allowNull: false,
      defaultValue: "PENDENTE"
    },
    motivo_rejeicao: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },
    data_solicitacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    data_decisao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: "Solicitacoes_Cadastro",
    timestamps: false,
    charset: "utf8mb4"
  })

  return SolicitacaoCadastro
}
