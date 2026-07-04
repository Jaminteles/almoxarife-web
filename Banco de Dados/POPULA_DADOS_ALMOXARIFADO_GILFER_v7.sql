-- ============================================================
--  POPULA_DADOS_ALMOXARIFADO_GILFER  —  versao 7 (dados de exemplo)
--
--  Cria uma base minima para testar o sistema, com contas que DAO LOGIN.
--
--  Contas (senha de TODAS = "admin"):
--    - admin@gilfer.com    -> CENTRAL    (acesso total, sem restricao)
--    - carlos@gilfer.com   -> ALMOXARIFE (restrito ao Almoxarifado Central, cod 1)
--
--  Rode DEPOIS de criar o banco pelo CREATE v7, uma vez, em banco vazio:
--    mysql -u root -p bd_almoxarifado < "Banco de Dados/POPULA_DADOS_ALMOXARIFADO_GILFER_v7.sql"
--
--  Obs.: o hash abaixo e o bcrypt de "admin". A validacao de tamanho minimo
--  de senha so vale no cadastro pela API; o login apenas compara o hash, entao
--  "admin" funciona normalmente.
-- ============================================================

USE bd_almoxarifado;

SET FOREIGN_KEY_CHECKS = 0;

-- ── Cargos ──
INSERT INTO Cargos (id_cargo, nome_cargo) VALUES
    (1, 'Administrador'),
    (2, 'Almoxarife'),
    (3, 'Auxiliar');

-- ── Enderecos dos almoxarifados ──
INSERT INTO Endereco_Almoxarifado (id_endereco, logradouro, numero, bairro, cidade, estado, cep) VALUES
    (1, 'Avenida Sete de Setembro', '1000', 'Centro',      'Salvador',       'BA', '40060001'),
    (2, 'Rua das Obras',            '250',  'Distrito Industrial', 'Feira de Santana', 'BA', '44100002');

-- ── Almoxarifados ──
INSERT INTO Almoxarifado (cod_almoxarifado, nome, email, id_endereco, ativo) VALUES
    (1, 'Almoxarifado Central',    'central@gilfer.com',    1, 1),
    (2, 'Almoxarifado Obra Norte', 'obranorte@gilfer.com',  2, 1);

INSERT INTO Telefone_Almoxarifado (cod_almoxarifado, telefone) VALUES
    (1, '7133001000'),
    (2, '7599002000');

-- ── Funcionarios ──
-- admin  = CENTRAL (cod_almoxarifado NULL = sem restricao)
-- carlos = ALMOXARIFE restrito ao Almoxarifado Central (cod 1)
INSERT INTO Funcionarios (id_funcionario, nome, cpf, email, id_cargo, cod_almoxarifado, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Administrador',    '00000000001', 'admin@gilfer.com',  1, NULL, 1),
    ('22222222-2222-2222-2222-222222222222', 'Carlos Almoxarife','00000000002', 'carlos@gilfer.com', 2, 1,    1);

-- ── Credenciais (senha = "admin" para as duas) ──
INSERT INTO Usuarios_Sistema (id_funcionario, password_hash, access_level, bloqueado) VALUES
    ('11111111-1111-1111-1111-111111111111', '$2b$10$Ets729mDEGJexBcxcFj.X..SnjbILbYNGmYO1f/Fc5u3Ku5tk8zL2', 'CENTRAL',    0),
    ('22222222-2222-2222-2222-222222222222', '$2b$10$Ets729mDEGJexBcxcFj.X..SnjbILbYNGmYO1f/Fc5u3Ku5tk8zL2', 'ALMOXARIFE', 0);

-- ── Fornecedores ──
INSERT INTO Fornecedores (id_fornecedor, razao_social, nome_fantasia, cnpj, email, ativo) VALUES
    (1, 'Acos Bahia LTDA',        'Acos Bahia',      '11111111000111', 'contato@acosbahia.com',    1),
    (2, 'Cimentos do Nordeste SA','CimNordeste',     '22222222000122', 'vendas@cimnordeste.com',   1);

INSERT INTO Telefone_Fornecedor (id_fornecedor, telefone) VALUES
    (1, '7134001000'),
    (2, '8134002000');

INSERT INTO Endereco_Fornecedor (id_fornecedor, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES
    (1, '40070100', 'Rua do Aco',      '55',  NULL, 'Comercio',  'Salvador', 'BA'),
    (2, '50030200', 'Avenida Cimento', '120', 'Galpao 3', 'Boa Vista', 'Recife', 'PE');

-- ── Produtos ──
INSERT INTO Produtos (id_produto, nome, descricao, preco_custo, unidade_medida, estoque_minimo, estoque_maximo, ativo) VALUES
    (1, 'Cimento CP-II 50kg',   'Saco de cimento 50kg',              32.5000, 'SC', 50.000, 500.000, 1),
    (2, 'Vergalhao 10mm',       'Barra de aco CA-50 10mm (12m)',     48.9000, 'UN', 30.000, 300.000, 1),
    (3, 'Areia media (m3)',     'Areia media lavada',                90.0000, 'M3', 10.000, 100.000, 1),
    (4, 'Tijolo ceramico 8f',   'Tijolo ceramico 8 furos',            0.9500, 'UN', 1000.000, 20000.000, 1);

-- ── Vinculo produto x fornecedor ──
INSERT INTO Produto_Fornecedor (id_produto, id_fornecedor, preco_negociado) VALUES
    (1, 2, 32.5000),
    (2, 1, 48.9000),
    (3, 1, 90.0000),
    (4, 1, 0.9500);

-- ── Estoque inicial (Almoxarifado Central, cod 1) ──
INSERT INTO Estoque (id_produto, cod_almoxarifado, quantidade) VALUES
    (1, 1, 120.000),
    (2, 1, 80.000),
    (3, 1, 25.000),
    (4, 1, 5000.000),
    -- Um item tambem no Almoxarifado Obra Norte (cod 2)
    (1, 2, 40.000);

SET FOREIGN_KEY_CHECKS = 1;

-- Login: admin@gilfer.com / admin   (CENTRAL)
--        carlos@gilfer.com / admin  (ALMOXARIFE, so ve o Almoxarifado Central)
