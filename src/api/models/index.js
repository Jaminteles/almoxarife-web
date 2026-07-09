import { DataTypes, Sequelize } from "sequelize"

// Models
import cargoModel from "./cargo.model.js"
import equipeModel from "./equipe.model.js"
import funcionarioModel from "./funcionario.model.js"
import usuarioSistemaModel from "./usuario-sistema.model.js"
import fornecedorModel from "./fornecedor.model.js"
import telefoneFornecedorModel from "./telefone-fornecedor.model.js"
import enderecoFornecedorModel from "./endereco-fornecedor.model.js"
import produtoModel from "./produto.model.js"
import produtoFornecedorModel from "./produto-fornecedor.model.js"
import enderecoAlmoxarifadoModel from "./endereco-almoxarifado.model.js"
import telefoneAlmoxarifadoModel from "./telefone-almoxarifado.model.js"
import almoxarifadoModel from "./almoxarifado.model.js"
//import gestaoAlmoxarifadoModel from "./gestao-almoxarifado.model.js"
import estoqueModel from "./estoque.model.js"
import saidaModel from "./saida.model.js"
import saidaItemModel from "./saida-item.model.js"
import compraModel from "./compra.model.js"
import itemCompraModel from "./item-compra.model.js"
import solicitacaoCadastroModel from "./solicitacao-cadastro.model.js"

// ── Conexão com o banco ──
// ALTERAR PARAMETROS conforme seu ambiente
const sequelize = new Sequelize(
  process.env.DB_NAME || "bd_almoxarifado",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "desus",
  {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  dialect: "mysql",
  logging: false,
  // Conexão remota (ex.: API no Render → MySQL na HostGator) passa pela
  // internet, então damos mais folga de tempo para conectar/reconectar.
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

// ── Registrar Models ──
const db = {
  Cargo: cargoModel(sequelize, DataTypes),
  Equipe: equipeModel(sequelize, DataTypes),
  Funcionario: funcionarioModel(sequelize, DataTypes),
  UsuarioSistema: usuarioSistemaModel(sequelize, DataTypes),
  Fornecedor: fornecedorModel(sequelize, DataTypes),
  TelefoneFornecedor: telefoneFornecedorModel(sequelize, DataTypes),
  EnderecoFornecedor: enderecoFornecedorModel(sequelize, DataTypes),
  Produto: produtoModel(sequelize, DataTypes),
  ProdutoFornecedor: produtoFornecedorModel(sequelize, DataTypes),
  EnderecoAlmoxarifado: enderecoAlmoxarifadoModel(sequelize, DataTypes),
  TelefoneAlmoxarifado: telefoneAlmoxarifadoModel(sequelize, DataTypes),
  Almoxarifado: almoxarifadoModel(sequelize, DataTypes),
  //GestaoAlmoxarifado: gestaoAlmoxarifadoModel(sequelize, DataTypes),
  Estoque: estoqueModel(sequelize, DataTypes),
  Saida: saidaModel(sequelize, DataTypes),
  SaidaItem: saidaItemModel(sequelize, DataTypes),
  Compra: compraModel(sequelize, DataTypes),
  ItemCompra: itemCompraModel(sequelize, DataTypes),
  SolicitacaoCadastro: solicitacaoCadastroModel(sequelize, DataTypes)
}

// ── Associações ──

// Cargo ↔ Funcionário
db.Cargo.hasMany(db.Funcionario, { foreignKey: "id_cargo", as: "funcionarios" })
db.Funcionario.belongsTo(db.Cargo, { foreignKey: "id_cargo", as: "cargo" })

// Equipe ↔ Funcionário (1:N, opcional). Ao remover a equipe, os funcionários
// ficam sem equipe (SET NULL) — não são apagados.
db.Equipe.hasMany(db.Funcionario, { foreignKey: "id_equipe", as: "funcionarios", onDelete: "SET NULL" })
db.Funcionario.belongsTo(db.Equipe, { foreignKey: "id_equipe", as: "equipe" })

// Funcionário ↔ Usuário do Sistema (1:1)
db.Funcionario.hasOne(db.UsuarioSistema, { foreignKey: "id_funcionario", as: "usuario" })
db.UsuarioSistema.belongsTo(db.Funcionario, { foreignKey: "id_funcionario", as: "funcionario" })

// Funcionário ↔ Almoxarifado ao qual está restrito (N:1, opcional)
db.Funcionario.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado", as: "almoxarifado" })

// Fornecedor ↔ Telefones (1:N)
db.Fornecedor.hasMany(db.TelefoneFornecedor, { foreignKey: "id_fornecedor", as: "telefones", onDelete: "CASCADE" })
db.TelefoneFornecedor.belongsTo(db.Fornecedor, { foreignKey: "id_fornecedor", as: "fornecedor" })

// Fornecedor ↔ Endereços (1:N)
db.Fornecedor.hasMany(db.EnderecoFornecedor, { foreignKey: "id_fornecedor", as: "enderecos", onDelete: "CASCADE" })
db.EnderecoFornecedor.belongsTo(db.Fornecedor, { foreignKey: "id_fornecedor", as: "fornecedor" })

// Produto ↔ Fornecedor (N:M via Produto_Fornecedor)
db.Produto.belongsToMany(db.Fornecedor, {
  through: db.ProdutoFornecedor,
  foreignKey: "id_produto",
  otherKey: "id_fornecedor",
  as: "fornecedores"
})
db.Fornecedor.belongsToMany(db.Produto, {
  through: db.ProdutoFornecedor,
  foreignKey: "id_fornecedor",
  otherKey: "id_produto",
  as: "produtos"
})

// Endereço/Telefone Almoxarifado ↔ Almoxarifado
db.Almoxarifado.belongsTo(db.EnderecoAlmoxarifado, { foreignKey: "id_endereco", as: "endereco" })
db.EnderecoAlmoxarifado.hasMany(db.Almoxarifado, { foreignKey: "id_endereco", as: "almoxarifados" })

db.Almoxarifado.hasMany(db.TelefoneAlmoxarifado, { foreignKey: "cod_almoxarifado", as: "telefones", onDelete: "CASCADE" })
db.TelefoneAlmoxarifado.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado", as: "almoxarifado" })

// Gestão Almoxarifado (Funcionário ↔ Almoxarifado N:M)
//db.Funcionario.belongsToMany(db.Almoxarifado, {
//  through: db.GestaoAlmoxarifado,
//  foreignKey: "id_funcionario",
//  otherKey: "cod_almoxarifado",
//  as: "almoxarifados"
//})
//db.Almoxarifado.belongsToMany(db.Funcionario, {
//  through: db.GestaoAlmoxarifado,
//  foreignKey: "cod_almoxarifado",
//  otherKey: "id_funcionario",
//  as: "gestores"
//})

// Estoque (Produto ↔ Almoxarifado)
db.Produto.belongsToMany(db.Almoxarifado, {
  through: db.Estoque,
 foreignKey: "id_produto",
  otherKey: "cod_almoxarifado",
 as: "almoxarifados_estoque"
})
db.Almoxarifado.belongsToMany(db.Produto, {
  through: db.Estoque,
  foreignKey: "cod_almoxarifado",
  otherKey: "id_produto",
  as: "produtos_estoque"
})

// Acesso direto ao Estoque
db.Produto.hasMany(db.Estoque, { foreignKey: "id_produto", as: "estoques" })
db.Estoque.belongsTo(db.Produto, { foreignKey: "id_produto", as: "produto" })
db.Almoxarifado.hasMany(db.Estoque, { foreignKey: "cod_almoxarifado", as: "estoques" })
db.Estoque.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado", as: "almoxarifado" })

// Saída
db.Saida.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado_origem", as: "almoxarifadoOrigem" })
db.Saida.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado_destino", as: "almoxarifadoDestino" })
db.Saida.belongsTo(db.Funcionario, { foreignKey: "id_funcionario_responsavel", as: "responsavel" })
db.Saida.belongsTo(db.Equipe, { foreignKey: "id_equipe", as: "equipe" })

// Saída ↔ Itens
db.Saida.hasMany(db.SaidaItem, { foreignKey: "id_saida", as: "itens", onDelete: "CASCADE" })
db.SaidaItem.belongsTo(db.Saida, { foreignKey: "id_saida", as: "saida" })
db.SaidaItem.belongsTo(db.Produto, { foreignKey: "id_produto", as: "produto" })
db.Produto.hasMany(db.SaidaItem, { foreignKey: "id_produto", as: "itensSaida" })

// Compra
db.Compra.belongsTo(db.Fornecedor, { foreignKey: "id_fornecedor", as: "fornecedor" })
//db.Compra.belongsTo(db.Funcionario, { foreignKey: "id_funcionario_comprador", as: "comprador" })
db.Compra.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado_destino", as: "almoxarifadoDestino" })

// Compra ↔ Itens
db.Compra.hasMany(db.ItemCompra, { foreignKey: "id_compra", as: "itens", onDelete: "CASCADE" })
db.ItemCompra.belongsTo(db.Compra, { foreignKey: "id_compra", as: "compra" })
db.ItemCompra.belongsTo(db.Produto, { foreignKey: "id_produto", as: "produto" })

// ── Exportar ──
db.Sequelize = Sequelize
db.sequelize = sequelize

export default db
