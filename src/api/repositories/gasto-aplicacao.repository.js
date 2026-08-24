import * as saidaRepo from "./saida.repository.js";
import * as servicoRepo from "./servico.repository.js";

// Os dois registros já trazem os itens e seus produtos. O relatório somente
// consulta esses dados; não cria movimentações nem altera estoque.
export const buscarSaidas = () => saidaRepo.listarTodos({});
export const buscarServicos = () => servicoRepo.listarTodos({});
