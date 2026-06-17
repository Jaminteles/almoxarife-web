// Define se a unidade de medida é contável em inteiros ou aceita frações.
// Unidades inteiras: não faz sentido 0,5 unidade/peça/caixa/saco.
// Unidades fracionadas: KG, LT, M, M2, M3 podem ter casas decimais (ex.: 0,5 kg).
const UNIDADES_INTEIRAS = ["UN", "PC", "CX", "SC"];

export function ehUnidadeInteira(unidade) {
  return UNIDADES_INTEIRAS.includes(String(unidade || "").toUpperCase());
}

// Passo do <input type="number"> conforme a unidade: inteiro sobe de 1 em 1;
// fracionado sobe de 0,1 em 0,1 nas setinhas.
export function passoQuantidade(unidade) {
  return ehUnidadeInteira(unidade) ? "1" : "0.1";
}
