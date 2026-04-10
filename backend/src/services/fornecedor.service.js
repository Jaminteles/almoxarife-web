import * as fornecedorRepository from "../repositories/fornecedor.repository.js"
import { validarEmail } from "../utils/validations/email.validation.js"

const validarCamposObrigatoriosFornecedor = (dados) => {
    if(!dados.nome || !dados.cnpj || !dados.telefone || !dados.telefone || !dados.email || !dados.endereco) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
    }

    validarEmail(dados.email)
}

const verificarDuplicidadeCnpj =  async (cnpj, idAtual = null) => {
    const existente = await fornecedorRepository.consultarFornecedores({ cnpj })

    if(existente.length > 0 && existente[0].id !== idAtual) {
        throw new Error("Fornecedor já registrado no sistema.")
    }
}

// Função responsável por validar o formato do CNPJ e limpar os caracteres especiais
const validarFormatoCnpj = (cnpj) => {

  //Remove espaços no começo e no final (caso o usuário digite com espaço)
  const cnpjTrim = cnpj.trim();

  // Regex que permite apenas: números, ponto, barra, traço
  const regexCnpj = /^[0-9./-]+$/;

  // Testa se o CNPJ segue o padrão permitido
  if (!regexCnpj.test(cnpjTrim)) {
    throw new Error("Formato de dado inválido. Corrija as informações e tente novamente.");
  }

  // Remove tudo que não for número0
  const cnpjLimpo = cnpjTrim.replace(/[^\d]+/g, "");

  return cnpjLimpo;
};

// Regras de negócio - Fornecedor

// Cadastrar: (ADMINISTRADOR - ALMOXARIFE)
// Fornecedor não deve estar previamente cadastrado
// Dados obrigatórios: Nome, CNPJ, telefone, e-mail, endereço OK
// Se der certo exibe a mensagem: "Fornecedor cadastrado com sucesso!" OK - controllers
// Se o usuário não preencher os dados obrigatórios deve aparecer a mensagem:  "Por favor, preencha todos os campos obrigatórios." OK
// Se CNPJ já é existente, aparece a  mensagem: "Fornecedor já registrado no sistema." OK
// Caso o E-mail informado seja inválido, aparece a mensagem: "E-mail informado inválido." OK
// Caso CNPJ conter letras, exibe a mensagem: "Formato de dado inválido. Corrija as informações e tente novamente." OK
export const cadastrarFornecedor = async(dados) => {
    
    validarCamposObrigatoriosFornecedor(dados)

    const cnpjLimpo = validarFormatoCnpj(dados.cnpj)

    await verificarDuplicidadeCnpj(dados.cnpj)

    return await fornecedorRepository.cadastrarFornecedor({
        ...dados,
        cnpj: cnpjLimpo
    })
}


// TODO: IMPLEMENTAR - Consultar: (ALMOXARIFE)


// Editar: (ADMINISTRADOR)
// O usuário acessa a rota /fornecedores e seleciona qual fornecedor quer atualizar - routes
// O usuário altera os campos desejados Nome, CNPJ, telefone, e-mail, endereço (Patch)
// Se der certo, exibe a mensagem: "Fornecedor atualizado com sucesso!" - controllers
// Se o usuário não preencher os dados obrigatórios deve aparecer a mensagem:  "Por favor, preencha todos os campos obrigatórios." OK
// Se CNPJ já é existente, exibe a menssagem "Fornecedor já registrado no sistema." OK
// Caso o E-mail informado seja inválido, aparece a mensagem: "E-mail informado inválido." OK
// Caso CNPJ conter letras, exibe a mensagem: "Formato de dado inválido. Corrija as informações e tente novamente." OK
export const editarFornecedores = async (id, dados) => {
    await fornecedorRepository.buscarPorId(id)

    validarCamposObrigatoriosFornecedor(dados)

    const cnpjLimpo = validarFormatoCnpj(dados.cnpj)

    await verificarDuplicidadeCnpj(dados.cnpj, id)

    return await produto.fornecedorRepository.editarFornecedores(id, {
        ...dados,
        cnpj: cnpjLimpo
    })
}


// Inativar: (ADMINISTRADOR)
// O usuário acessa a rota /fornecedores e seleciona qual fornecedor quer inativar - controllers
// O sistema solicita confirmação da inativação por meio de uma caixa de diálogo - front
// O usuário confirma clicando em "Sim" - front
// Se fornecedor estiver vincualdo a um pedido ativo, exibe a mensagem:
// "Não é possível inativar um fornecedor com pedidos em andamento." - ESPERAR A IMPLEMENTAÇãO DE PEDIDOS
// Se o fornecedor não existir, exibe a mensagem: "Fornecedor não encontrado."
export const inativarProduto = async (id) => {
    // ESPERAR A IMPLEMENTAÇÃO DE PEDIDOS
    return await fornecedorRepository.inativarFornecedor(id)
}
