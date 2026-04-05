/**
 * Mudar esse arquivo quando deicidir o banco de dados
*/
const { v4: uuidv4 } = require("uuid");

// "Banco de dados" em memória — resetado quando o servidor reinicia
let funcionarios = [];

function listarTodos() {
  return funcionarios;
}

function buscarPorId(id) {
  return funcionarios.find((f) => f.id === id) || null;
}

function criar(dados) {
  const novo = {
    id: uuidv4(),           // gera ID único automático
    ...dados,               // spread: copia nome, cpf, email, etc.
    ativo: true,
    dataCadastro: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
  };

  funcionarios.push(novo);
  return novo;
}

function atualizar(id, dados) {
  const index = funcionarios.findIndex((f) => f.id === id);
  if (index === -1) return null;

  funcionarios[index] = {
    ...funcionarios[index],  // mantém os dados antigos
    ...dados,                // sobrescreve com os novos
    dataAtualizacao: new Date().toISOString(),
  };

  return funcionarios[index];
}

function remover(id) {
  const index = funcionarios.findIndex((f) => f.id === id);
  if (index === -1) return false;

  funcionarios.splice(index, 1);
  return true;
}

function buscarPorCpf(cpf) {
  return funcionarios.find((f) => f.cpf === cpf) || null;
}

function buscarPorLogin(login) {
  return funcionarios.find((f) => f.login === login) || null;
}

module.exports = { listarTodos, buscarPorId, criar, atualizar, remover, buscarPorCpf, buscarPorLogin };