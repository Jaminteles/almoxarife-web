-- Migracao nao destrutiva para bancos existentes.
-- "Obra" reutiliza a tabela Almoxarifado ja cadastrada no sistema.
CREATE TABLE IF NOT EXISTS Equipamentos (
    id_equipamento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    capacidade_potencia VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    serie_chassis VARCHAR(100) NOT NULL,
    placa VARCHAR(20) NULL,
    ano_fabricacao SMALLINT UNSIGNED NOT NULL,
    obra_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_equipamentos_codigo UNIQUE (codigo),
    CONSTRAINT fk_equipamento_obra
        FOREIGN KEY (obra_id)
        REFERENCES Almoxarifado(cod_almoxarifado)
        ON DELETE RESTRICT,
    INDEX idx_equipamentos_obra (obra_id)
);
