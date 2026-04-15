import { DataTypes, Sequelize } from "sequelize"

import funcionarioModel from "./funcionario.model.js"
import fornecedorModel from "./fornecedor.model.js"

// Conexão com o banco
// ALTERAR PARAMETROS
const sequelize = new Sequelize("almoxarife", "root", "", {
    host: "localhost",
    dialect: "mysql"
})

// Cria um objeto que vai armazenar tudo (conexão + models)
const db = {
    Funcionario: funcionarioModel(sequelize, DataTypes),
    Fornecedor: fornecedorModel(sequelize, DataTypes)
}

// Salva o Sequelize dentro do objeto
db.Sequelize = Sequelize

// Salva a conexão
db.sequelize = sequelize

// Exporta tudo para ser usado no projeto
export default db
