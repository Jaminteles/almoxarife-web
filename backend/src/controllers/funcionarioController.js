const bcrypt = require("bcrypt");
const repo = require("../repositories/funcionarioRepository");

function listar(req, res) {
  const dados = repo.listarTodos().map(({ senha, ...resto }) => resto);
  // O map remove a senha de TODOS os itens antes de enviar
  // { senha, ...resto } = desestruturação: separa senha do restante
  res.json({ sucesso: true, dados, total: dados.length });
}

function buscarUm(req, res) {
  const funcionario = repo.buscarPorId(req.params.id);

  if (!funcionario) {
    return res.status(404).json({ sucesso: false, erro: "Funcionário não encontrado" });
  }

  // Remove a senha antes de enviar
  const { senha, ...dados } = funcionario;
  res.json({ sucesso: true, dados });
}

async function criar(req, res) {
  const { nome, cpf, email, cargo, login, senha } = req.body;

  // Validação de campos obrigatórios
  if (!nome || !cpf || !email || !cargo || !login || !senha) {
    return res.status(400).json({ sucesso: false, erro: "Todos os campos são obrigatórios" });
  }

  // Validação de duplicatas
  if (repo.buscarPorCpf(cpf)) {
    return res.status(409).json({ sucesso: false, erro: "CPF já cadastrado" });
  }

  if (repo.buscarPorLogin(login)) {
    return res.status(409).json({ sucesso: false, erro: "Login já cadastrado" });
  }

  // Hash da senha — o 10 é o "salt rounds" (quanto mais alto, mais seguro e mais lento)
  // 10 é o valor padrão recomendado para a maioria dos sistemas
  const senhaHash = await bcrypt.hash(senha, 10);

  const novo = repo.criar({ nome, cpf, email, cargo, login, senha: senhaHash });

  // Remove a senha do retorno
  const { senha: _, ...dados } = novo;

  res.status(201).json({
    sucesso: true,
    mensagem: "Funcionário cadastrado com sucesso",
    dados,
  });
}

async function atualizar(req, res) {
  const dados = { ...req.body };

  // Se estiver atualizando a senha, faz o hash antes de salvar
  if (dados.senha) {
    dados.senha = await bcrypt.hash(dados.senha, 10);
  }

  const atualizado = repo.atualizar(req.params.id, dados);

  if (!atualizado) {
    return res.status(404).json({ sucesso: false, erro: "Funcionário não encontrado" });
  }

  const { senha, ...retorno } = atualizado;
  res.json({ sucesso: true, mensagem: "Funcionário atualizado com sucesso", dados: retorno });
}

function remover(req, res) {
  const removido = repo.remover(req.params.id);

  if (!removido) {
    return res.status(404).json({ sucesso: false, erro: "Funcionário não encontrado" });
  }

  res.json({ sucesso: true, mensagem: "Funcionário removido com sucesso" });
}

module.exports = { listar, buscarUm, criar, atualizar, remover };