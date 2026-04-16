import { DataTypes, Sequelize } from "sequelize"

// Models
import cargoModel from "./cargo.model.js"
import funcionarioModel from "./funcionario.model.js"
import usuarioSistemaModel from "./usuario-sistema.model.js"
import fornecedorModel from "./fornecedor.model.js"
import telefoneFornecedorModel from "./telefone-fornecedor.model.js"
import enderecoFornecedorModel from "./endereco-fornecedor.model.js"
//import produtoModel from "./produto.model.js"
//import produtoFornecedorModel from "./produto-fornecedor.model.js"
//import enderecoAlmoxarifadoModel from "./endereco-almoxarifado.model.js"
//import almoxarifadoModel from "./almoxarifado.model.js"
//import gestaoAlmoxarifadoModel from "./gestao-almoxarifado.model.js"
//import estoqueModel from "./estoque.model.js"
//import saidaModel from "./saida.model.js"
//import saidaItemModel from "./saida-item.model.js"
//import compraModel from "./compra.model.js"
//import itemCompraModel from "./item-compra.model.js"

// ── Conexão com o banco ──
// ALTERAR PARAMETROS conforme seu ambiente
const sequelize = new Sequelize("bd_almoxarifado", "root", "desus", {
  host: "localhost",
  dialect: "mysql",
  logging: false
})

// ── Registrar Models ──
const db = {
  Cargo: cargoModel(sequelize, DataTypes),
  Funcionario: funcionarioModel(sequelize, DataTypes),
  UsuarioSistema: usuarioSistemaModel(sequelize, DataTypes),
  Fornecedor: fornecedorModel(sequelize, DataTypes),
  TelefoneFornecedor: telefoneFornecedorModel(sequelize, DataTypes),
  EnderecoFornecedor: enderecoFornecedorModel(sequelize, DataTypes),
  //Produto: produtoModel(sequelize, DataTypes),
  //ProdutoFornecedor: produtoFornecedorModel(sequelize, DataTypes),
  //EnderecoAlmoxarifado: enderecoAlmoxarifadoModel(sequelize, DataTypes),
  //Almoxarifado: almoxarifadoModel(sequelize, DataTypes),
  //GestaoAlmoxarifado: gestaoAlmoxarifadoModel(sequelize, DataTypes),
  //Estoque: estoqueModel(sequelize, DataTypes),
  //Saida: saidaModel(sequelize, DataTypes),
  //SaidaItem: saidaItemModel(sequelize, DataTypes),
  //Compra: compraModel(sequelize, DataTypes),
  //ItemCompra: itemCompraModel(sequelize, DataTypes)
}

// ── Associações ──

// Cargo ↔ Funcionário
db.Cargo.hasMany(db.Funcionario, { foreignKey: "id_cargo", as: "funcionarios" })
db.Funcionario.belongsTo(db.Cargo, { foreignKey: "id_cargo", as: "cargo" })

// Funcionário ↔ Usuário do Sistema (1:1)
db.Funcionario.hasOne(db.UsuarioSistema, { foreignKey: "id_funcionario", as: "usuario" })
db.UsuarioSistema.belongsTo(db.Funcionario, { foreignKey: "id_funcionario", as: "funcionario" })

// Fornecedor ↔ Telefones (1:N)
db.Fornecedor.hasMany(db.TelefoneFornecedor, { foreignKey: "id_fornecedor", as: "telefones", onDelete: "CASCADE" })
db.TelefoneFornecedor.belongsTo(db.Fornecedor, { foreignKey: "id_fornecedor", as: "fornecedor" })

// Fornecedor ↔ Endereços (1:N)
db.Fornecedor.hasMany(db.EnderecoFornecedor, { foreignKey: "id_fornecedor", as: "enderecos", onDelete: "CASCADE" })
db.EnderecoFornecedor.belongsTo(db.Fornecedor, { foreignKey: "id_fornecedor", as: "fornecedor" })

// Produto ↔ Fornecedor (N:M via Produto_Fornecedor)
//db.Produto.belongsToMany(db.Fornecedor, {
//  through: db.ProdutoFornecedor,
//  foreignKey: "id_produto",
//  otherKey: "id_fornecedor",
//  as: "fornecedores"
//})
//db.Fornecedor.belongsToMany(db.Produto, {
//  through: db.ProdutoFornecedor,
//  foreignKey: "id_fornecedor",
//  otherKey: "id_produto",
//  as: "produtos"
//})

// Endereço Almoxarifado ↔ Almoxarifado
//db.EnderecoAlmoxarifado.hasMany(db.Almoxarifado, { foreignKey: "id_endereco", as: "almoxarifados" })
//db.Almoxarifado.belongsTo(db.EnderecoAlmoxarifado, { foreignKey: "id_endereco", as: "endereco" })

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
//db.Produto.belongsToMany(db.Almoxarifado, {
//  through: db.Estoque,
//  foreignKey: "id_produto",
//  otherKey: "cod_almoxarifado",
//  as: "almoxarifados_estoque"
//})
//db.Almoxarifado.belongsToMany(db.Produto, {
//  through: db.Estoque,
//  foreignKey: "cod_almoxarifado",
//  otherKey: "id_produto",
//  as: "produtos_estoque"
//})
// Acesso direto ao Estoque
//db.Estoque.belongsTo(db.Produto, { foreignKey: "id_produto", as: "produto" })
//db.Estoque.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado", as: "almoxarifado" })

// Saída
//db.Saida.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado_origem", as: "origem" })
//db.Saida.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado_destino", as: "destino" })
//db.Saida.belongsTo(db.Funcionario, { foreignKey: "id_funcionario_responsavel", as: "responsavel" })

// Saída ↔ Itens
//db.Saida.hasMany(db.SaidaItem, { foreignKey: "id_saida", as: "itens", onDelete: "CASCADE" })
//db.SaidaItem.belongsTo(db.Saida, { foreignKey: "id_saida", as: "saida" })
//db.SaidaItem.belongsTo(db.Produto, { foreignKey: "id_produto", as: "produto" })

// Compra
//db.Compra.belongsTo(db.Fornecedor, { foreignKey: "id_fornecedor", as: "fornecedor" })
//db.Compra.belongsTo(db.Funcionario, { foreignKey: "id_funcionario_comprador", as: "comprador" })
//db.Compra.belongsTo(db.Almoxarifado, { foreignKey: "cod_almoxarifado_destino", as: "almoxarifado_destino" })

// Compra ↔ Itens
//db.Compra.hasMany(db.ItemCompra, { foreignKey: "id_compra", as: "itens", onDelete: "CASCADE" })
//db.ItemCompra.belongsTo(db.Compra, { foreignKey: "id_compra", as: "compra" })
//db.ItemCompra.belongsTo(db.Produto, { foreignKey: "id_produto", as: "produto" })

// ── Exportar ──
db.Sequelize = Sequelize
db.sequelize = sequelize

export default db
