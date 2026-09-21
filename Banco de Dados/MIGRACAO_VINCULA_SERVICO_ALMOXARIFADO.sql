-- Execute uma vez em bancos já existentes.
-- Serviços antigos ficarão sem vínculo até serem editados e associados a um
-- almoxarifado; eles não entram no total exclusivo de nenhum almoxarifado.
ALTER TABLE Servico
  ADD COLUMN cod_almoxarifado INT UNSIGNED NULL AFTER id_funcionario_responsavel,
  ADD CONSTRAINT fk_servico_almoxarifado
    FOREIGN KEY (cod_almoxarifado) REFERENCES Almoxarifado(cod_almoxarifado);
