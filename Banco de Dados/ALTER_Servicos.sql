-- Execute uma vez em bancos já existentes. O módulo de Serviços não altera
-- estoque: apenas registra os gastos por aplicação e fornecedor.
CREATE TABLE IF NOT EXISTS Servico (
    id_servico INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor INT UNSIGNED NOT NULL,
    id_funcionario_responsavel CHAR(36) NOT NULL,
    data_servico TIMESTAMP NOT NULL,
    aplicacao VARCHAR(255) NOT NULL,
    observacao TEXT NULL,
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_servico_fornecedor
        FOREIGN KEY (id_fornecedor) REFERENCES Fornecedores(id_fornecedor),
    CONSTRAINT fk_servico_responsavel
        FOREIGN KEY (id_funcionario_responsavel) REFERENCES Funcionarios(id_funcionario)
);

CREATE TABLE IF NOT EXISTS Servico_Item (
    id_servico INT UNSIGNED NOT NULL,
    id_produto INT UNSIGNED NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL,
    valor_unitario DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id_servico, id_produto),
    CONSTRAINT fk_servico_item_servico
        FOREIGN KEY (id_servico) REFERENCES Servico(id_servico) ON DELETE CASCADE,
    CONSTRAINT fk_servico_item_produto
        FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto)
);
