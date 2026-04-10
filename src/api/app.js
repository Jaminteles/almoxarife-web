const express = require("express");
const cors = require("cors");

const funcionarioRoutes = require("./routes/funcionario");

const app = express();

// Permite receber JSON no corpo das requisições
app.use(express.json());

// Permite o frontend React chamar este backend
app.use(cors());

// Registra as rotas de funcionários sob o prefixo /api/funcionarios
app.use("/api/funcionarios", funcionarioRoutes);

module.exports = app;