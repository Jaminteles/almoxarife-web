-- Migração não destrutiva para instalações que já possuem Equipamentos.
-- Obra/localização continua sendo Equipamentos.obra_id -> Almoxarifado.
-- Execute uma única vez no banco bd_almoxarifado.

CREATE TABLE IF NOT EXISTS Horimetros_Equipamento (
    id_horimetro INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_equipamento INT UNSIGNED NOT NULL,
    horimetro DECIMAL(14,2) UNSIGNED NOT NULL,
    data_leitura DATE NOT NULL,
    observacao TEXT NULL,
    id_funcionario CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_horimetro_equipamento
        FOREIGN KEY (id_equipamento) REFERENCES Equipamentos(id_equipamento)
        ON DELETE RESTRICT,
    CONSTRAINT fk_horimetro_funcionario
        FOREIGN KEY (id_funcionario) REFERENCES Funcionarios(id_funcionario)
        ON DELETE RESTRICT,
    INDEX idx_horimetro_equipamento_data (id_equipamento, data_leitura)
);

CREATE TABLE IF NOT EXISTS Manutencoes_Equipamento (
    id_manutencao INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_equipamento INT UNSIGNED NOT NULL,
    data_manutencao DATE NOT NULL,
    horimetro DECIMAL(14,2) UNSIGNED NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    intervalo_horas DECIMAL(14,2) UNSIGNED NOT NULL,
    observacao TEXT NULL,
    id_funcionario CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_manutencao_equipamento
        FOREIGN KEY (id_equipamento) REFERENCES Equipamentos(id_equipamento)
        ON DELETE RESTRICT,
    CONSTRAINT fk_manutencao_funcionario
        FOREIGN KEY (id_funcionario) REFERENCES Funcionarios(id_funcionario)
        ON DELETE RESTRICT,
    INDEX idx_manutencao_equipamento_data (id_equipamento, data_manutencao)
);
