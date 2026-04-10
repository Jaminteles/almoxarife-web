import { DataTypes, Sequelize } from "sequelize";

import FornecedorModel from "./fornecedor.model.js"
// IMPORTAR AS OUTRAS ENTIDADES

// Conexão com o banco
// ALTERAR PARAMETROS
const sequelize = new Sequelize("nomeDoBanco", "user", "senha", {
    host: "localhost",
    dialect: "mysql"
})

// Cria um objeto que vai armazenar tudo (conexão + models)
const db = {}

// Salva o Sequelize dentro do objeto
db.Sequelize = Sequelize

// Salva a conexão
db.sequelize = sequelize

// Inicia o model Fornecedor passando a conexão e os tipos de dados
db.Fornecedor = FornecedorModel(sequelize, DataTypes)

// SALVAR AS OUTRAS ENTIDADES NO OBJETO (db)

// Exporta tudo para ser usado no projeto
export default db
