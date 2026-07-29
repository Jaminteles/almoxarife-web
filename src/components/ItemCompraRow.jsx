// src/components/ItemCompraRow.jsx
import { Stack, TextField, Autocomplete, IconButton, Switch, FormControlLabel } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { passoQuantidade, ehUnidadeInteira } from "../utils/quantidade";

/**
 * Uma linha de item da compra: seletor de Produto + Quantidade + Valor unitário
 * + switch "automático" + botão remover.
 *
 * Por que existe (mesma lógica do ItemSaidaRow):
 *   tanto Form quanto Edit de Compra renderizam essa mesma linha. Extrair
 *   evita duplicar os campos nos dois arquivos — manutenção em 1 lugar só.
 *
 * Props:
 *   - item:              { id_produto, quantidade, valor_unitario, automatico }
 *   - index:              posição no array de itens
 *   - produtos:           lista para o select [{ id_produto, nome }]
 *   - onChange:           callback (index, campo, valor)
 *   - onRemove:           callback (index)
 *   - disableRemove:      desabilita o botão quando há só 1 item
 *   - onToggleAutomatico: callback (index) — liga/desliga o preenchimento
 *     automático do valor unitário. Se omitido, o switch não é exibido e o
 *     campo de valor se comporta como antes (controlado só por valorReadOnly).
 */
export default function ItemCompraRow({
  item,
  index,
  produtos,
  onChange,
  onRemove,
  disableRemove,
  valorReadOnly = false,
  onToggleAutomatico
}) {
  const selecionado = produtos.find(
    (p) => Number(p.id_produto) === Number(item.id_produto)
  );
  const unidade = selecionado?.unidade_medida;
  const passo = passoQuantidade(unidade);

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
    >
      {/* Autocomplete: digita e filtra pelo nome do produto, em vez de rolar
          uma lista longa de MenuItem. selecionado pode ser undefined
          (nenhum produto escolhido ainda), o que o Autocomplete trata como
          "sem valor" normalmente. */}
      <Autocomplete
        options={produtos}
        getOptionLabel={(p) => p?.nome || ""}
        isOptionEqualToValue={(opcao, valor) =>
          Number(opcao.id_produto) === Number(valor?.id_produto)
        }
        value={selecionado || null}
        onChange={(_, novoValor) =>
          onChange(index, "id_produto", novoValor ? novoValor.id_produto : "")
        }
        noOptionsText="Nenhum produto encontrado"
        sx={{ width: { xs: "100%", sm: "35%" } }}
        renderInput={(params) => (
          <TextField {...params} size="small" label="Produto" required />
        )}
      />

      <TextField
        size="small"
        label="Quantidade"
        type="number"
        value={item.quantidade}
        onChange={(e) => onChange(index, "quantidade", e.target.value)}
        required
        // O passo depende da unidade do produto: inteiro (UN/PC/CX/SC) ou
        // fracionado (KG/LT/M...).
        inputProps={{ min: 0, step: passo }}
        helperText={
          unidade
            ? `${unidade}${ehUnidadeInteira(unidade) ? " (inteiro)" : ""}`
            : undefined
        }
        sx={{ width: { xs: "100%", sm: "18%" } }}
      />

      <TextField
        size="small"
        label="Valor unit."
        type="number"
        value={item.valor_unitario}
        onChange={(e) => onChange(index, "valor_unitario", e.target.value)}
        required
        // Quando valorReadOnly, o valor é calculado automaticamente (preço de
        // custo do produto) e o usuário não pode editá-lo.
        InputProps={{ readOnly: valorReadOnly }}
        disabled={valorReadOnly}
        // Enviado como valor_unitario; o model mapeia p/ preco_unitario_acordado.
        inputProps={{ min: 0, step: "0.01" }}
        sx={{ width: { xs: "100%", sm: "18%" } }}
      />

      {/* Só aparece se o form pai passar o callback — mantém o componente
          compatível com quem ainda não usa esse recurso (ex: Edit). */}
      {onToggleAutomatico && (
        <FormControlLabel
          sx={{ ml: 0, flexShrink: 0, whiteSpace: "nowrap" }}
          control={
            <Switch
              size="small"
              checked={!!item.automatico}
              onChange={() => onToggleAutomatico(index)}
            />
          }
          label="Automático"
        />
      )}

      <IconButton
        color="error"
        onClick={() => onRemove(index)}
        disabled={disableRemove}
        sx={{ flexShrink: 0 }}
      >
        <RemoveCircleOutlineIcon />
      </IconButton>
    </Stack>
  );
}
