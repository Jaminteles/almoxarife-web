-- Migração: módulo de Equipes.
-- Cria a tabela Equipes e adiciona o vínculo opcional de equipe em
-- Funcionarios e em Saida. Rodar UMA vez no banco de produção (preserva dados).
-- Ex.: mysql -u USUARIO -p NOME_DO_BANCO < ALTER_Equipes.sql

-- 1) Tabela de equipes (soft-delete via is_active).
CREATE TABLE IF NOT EXISTS Equipes (
    id_equipe INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2) Funcionarios.id_equipe (opcional) + FK.
ALTER TABLE Funcionarios
    ADD COLUMN id_equipe INT UNSIGNED NULL AFTER cod_almoxarifado;

ALTER TABLE Funcionarios
    ADD CONSTRAINT fk_funcionario_equipe
        FOREIGN KEY (id_equipe)
        REFERENCES Equipes(id_equipe)
        ON DELETE SET NULL;

-- 3) Saida.id_equipe (opcional) + FK.
ALTER TABLE Saida
    ADD COLUMN id_equipe INT UNSIGNED DEFAULT NULL AFTER cod_almoxarifado_destino;

ALTER TABLE Saida
    ADD CONSTRAINT fk_saida_equipe
        FOREIGN KEY (id_equipe)
        REFERENCES Equipes(id_equipe)
        ON DELETE SET NULL;
