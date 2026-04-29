CREATE DATABASE /*!32312 IF NOT EXISTS*/ `bd_almoxarifado` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `bd_almoxarifado`;


-- Script SQL para criação das tabelas de fornecedores

DROP TABLE IF EXISTS Fornecedores;
CREATE TABLE Fornecedores (
    id_fornecedor INT UNSIGNED AUTO_INCREMENT,
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150),
    cnpj CHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,

    -- Auditoria e Controle
    ativo TINYINT(1) DEFAULT 1 NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_fornecedor PRIMARY KEY (id_fornecedor)
);

DROP TABLE IF EXISTS Telefone_Fornecedor;
CREATE TABLE Telefone_Fornecedor (
    id_fornecedor INT UNSIGNED NOT NULL,
    telefone VARCHAR(25) NOT NULL,
    
    CONSTRAINT pk_telefone_fornecedor PRIMARY KEY (id_fornecedor, telefone),

    CONSTRAINT fk_telefone_fornecedor 
        FOREIGN KEY (id_fornecedor) 
        REFERENCES Fornecedores(id_fornecedor) 
        ON DELETE CASCADE
);

DROP TABLE IF EXISTS Endereco_Fornecedor;
CREATE TABLE Endereco_Fornecedor (
    id_endereco INT UNSIGNED AUTO_INCREMENT,
    id_fornecedor INT UNSIGNED NOT NULL,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    
    CONSTRAINT pk_endereco_fornecedor PRIMARY KEY (id_endereco),
    CONSTRAINT fk_endereco_fornecedor 
        FOREIGN KEY (id_fornecedor) 
        REFERENCES Fornecedores(id_fornecedor) 
        ON DELETE CASCADE
);

-- Script SQL para criação da tabela de funcionários

DROP TABLE IF EXISTS Cargos;
CREATE TABLE Cargos (
    id_cargo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome_cargo VARCHAR(50) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS Funcionarios;
CREATE TABLE Funcionarios (
    -- UUID
    id_funcionario CHAR(36) PRIMARY KEY, 
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    id_cargo INT UNSIGNED NOT NULL,
    
    -- Auditoria Básica
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,


    CONSTRAINT fk_func_cargo 
        FOREIGN KEY (id_cargo) 
        REFERENCES Cargos(id_cargo) 
        ON DELETE RESTRICT
);

DROP TABLE IF EXISTS Usuarios_Sistema;
CREATE TABLE Usuarios_Sistema (
    -- ID do funcionário UUID
    id_funcionario CHAR(36) PRIMARY KEY, 
    password_hash TEXT NOT NULL,
    access_level ENUM('CENTRAL', 'ALMOXARIFE', 'AUXILIAR', 'CONSULTA') NOT NULL DEFAULT 'CONSULTA',

    ultimo_login TIMESTAMP DEFAULT NULL,
    bloqueado TINYINT(1) DEFAULT 0,

    CONSTRAINT fk_usuario_funcionario 
        FOREIGN KEY (id_funcionario) 
        REFERENCES Funcionarios(id_funcionario) 
        ON DELETE CASCADE
);

-- Script SQL para criação da tabela de produtos

DROP TABLE IF EXISTS Produtos;
CREATE TABLE Produtos (
    id_produto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco_custo DECIMAL(12, 4) UNSIGNED NOT NULL DEFAULT 0.0000,
    unidade_medida VARCHAR(10) NOT NULL, -- Ex: UN, KG, LT, PC

    -- Auditoria e Controle
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nome_produto (nome)
);

DROP TABLE IF EXISTS Produto_Fornecedor;
CREATE TABLE Produto_Fornecedor (
    id_produto INT UNSIGNED NOT NULL,
    id_fornecedor INT UNSIGNED NOT NULL,
    preco_negociado DECIMAL(12, 4) NOT NULL, 
    
    PRIMARY KEY (id_produto, id_fornecedor), 
    CONSTRAINT fk_prod_forn_produto 
        FOREIGN KEY (id_produto) 
        REFERENCES Produtos(id_produto) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_prod_forn_fornecedor 
        FOREIGN KEY (id_fornecedor) 
        REFERENCES Fornecedores(id_fornecedor) 
        ON DELETE CASCADE
);

-- Script SQL para criação da tabela de Almoxarifado

DROP TABLE IF EXISTS Endereco_Almoxarifado;
CREATE TABLE Endereco_Almoxarifado (
    id_endereco INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(8) NOT NULL,

    CONSTRAINT uc_endereco_unico UNIQUE (cep, numero, logradouro) 
);

DROP TABLE IF EXISTS Almoxarifado;
CREATE TABLE Almoxarifado (
    cod_almoxarifado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL,
    id_endereco INT UNSIGNED NOT NULL,  
 
    -- Auditoria e Controle
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_almoxarifado_endereco 
        FOREIGN KEY (id_endereco) 
        REFERENCES Endereco_Almoxarifado(id_endereco) 
        ON DELETE RESTRICT
);

DROP TABLE IF EXISTS Gestao_Almoxarifado;
CREATE TABLE Gestao_Almoxarifado (
    -- UUID
    id_funcionario CHAR(36) NOT NULL, 
    cod_almoxarifado INT UNSIGNED NOT NULL, 

    -- Auditoria e Controle
    data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_funcionario, cod_almoxarifado),
    
    CONSTRAINT fk_gestao_funcionario 
        FOREIGN KEY (id_funcionario) 
        REFERENCES Funcionarios(id_funcionario) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_gestao_almoxarifado 
        FOREIGN KEY (cod_almoxarifado) 
        REFERENCES Almoxarifado(cod_almoxarifado) 
        ON DELETE CASCADE
);

-- Script SQL para criação da tabela de Estoque

DROP TABLE IF EXISTS Estoque;
CREATE TABLE Estoque (
    id_produto INT UNSIGNED NOT NULL,
    cod_almoxarifado INT UNSIGNED NOT NULL,
    quantidade DECIMAL(10, 3) NOT NULL DEFAULT 0.000,

    -- Auditoria e Controle
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id_produto, cod_almoxarifado),

    CONSTRAINT fk_estoque_produto 
        FOREIGN KEY (id_produto) 
        REFERENCES Produtos(id_produto) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_estoque_almoxarifado 
        FOREIGN KEY (cod_almoxarifado) 
        REFERENCES Almoxarifado(cod_almoxarifado) 
        ON DELETE RESTRICT
);

-- Script SQL para criação da tabela de Saida de Material

DROP TABLE IF EXISTS Saida;
CREATE TABLE Saida (
    id_saida INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cod_almoxarifado_origem INT UNSIGNED NOT NULL,
    id_funcionario_responsavel CHAR(36) NOT NULL,
    -- Lógica de Destino
    tipo_saida ENUM('CONSUMO', 'TRANSFERENCIA') NOT NULL,
    cod_almoxarifado_destino INT UNSIGNED DEFAULT NULL,
    
    -- Auditoria 
    data_saida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,

    CONSTRAINT fk_saida_origem 
        FOREIGN KEY (cod_almoxarifado_origem) 
        REFERENCES Almoxarifado(cod_almoxarifado),
        
    CONSTRAINT fk_saida_destino 
        FOREIGN KEY (cod_almoxarifado_destino) 
        REFERENCES Almoxarifado(cod_almoxarifado), 
        
    CONSTRAINT fk_saida_funcionario 
        FOREIGN KEY (id_funcionario_responsavel) 
        REFERENCES Funcionarios(id_funcionario),
        
    CONSTRAINT ck_destino_diferente CHECK (cod_almoxarifado_origem <> cod_almoxarifado_destino)
);

DROP TABLE IF EXISTS Saida_Item;
CREATE TABLE Saida_Item (
    id_saida INT UNSIGNED NOT NULL,
    id_produto INT UNSIGNED NOT NULL,
    quantidade DECIMAL(10, 3) NOT NULL,


    CONSTRAINT pk_saida_item PRIMARY KEY (id_saida, id_produto),
  
    CONSTRAINT fk_item_saida_pai 
        FOREIGN KEY (id_saida) 
        REFERENCES Saida(id_saida) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_item_saida_produto 
        FOREIGN KEY (id_produto) 
        REFERENCES Produtos(id_produto)
);

-- Script SQL para criação da tabela de Compra

DROP TABLE IF EXISTS Compra;
CREATE TABLE Compra (
    id_compra INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor INT UNSIGNED NOT NULL,
    -- UUID
    id_funcionario_comprador CHAR(36) NOT NULL,
    cod_almoxarifado_destino INT UNSIGNED NOT NULL, 
    
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_pedido ENUM('PENDENTE', 'RECEBIDO', 'CANCELADO') DEFAULT 'PENDENTE',
    valor_total_pedido DECIMAL(12, 4) DEFAULT 0.0000,


    CONSTRAINT fk_compra_fornecedor 
        FOREIGN KEY (id_fornecedor) 
        REFERENCES Fornecedores(id_fornecedor),
        
    CONSTRAINT fk_compra_funcionario 
        FOREIGN KEY (id_funcionario_comprador) 
        REFERENCES Funcionarios(id_funcionario),
        
    CONSTRAINT fk_compra_almoxarifado 
        FOREIGN KEY (cod_almoxarifado_destino) 
        REFERENCES Almoxarifado(cod_almoxarifado)
);

DROP TABLE IF EXISTS Item_Compra;
CREATE TABLE Item_Compra (
    id_compra INT UNSIGNED NOT NULL,
    id_produto INT UNSIGNED NOT NULL,
    quantidade DECIMAL(10, 3) NOT NULL,
    preco_unitario_acordado DECIMAL(12, 4) NOT NULL,
    
    CONSTRAINT pk_item_compra PRIMARY KEY (id_compra, id_produto),
    
    CONSTRAINT fk_item_compra_pai 
        FOREIGN KEY (id_compra) 
        REFERENCES Compra(id_compra) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_item_produto 
        FOREIGN KEY (id_produto) 
        REFERENCES Produtos(id_produto)
);