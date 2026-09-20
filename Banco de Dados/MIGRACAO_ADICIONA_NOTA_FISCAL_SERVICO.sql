-- Execute uma vez em bancos já existentes antes de publicar a aplicação.
ALTER TABLE Servico
  ADD COLUMN numero_nota_fiscal VARCHAR(50) NULL AFTER data_servico;
