// src/components/ItemCompraRow.jsx
import { Stack, TextField, MenuItem, IconButton } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { passoQuantidade, ehUnidadeInteira } from "../utils/quantidade";

/**
 * Uma linha de item da compra: seletor de Produto + Quantidade + Valor unitário
 * + botão remover.
 *
 * Por que existe (mesma lógica do ItemSaidaRow):
 *   tanto Form quanto Edit de Compra renderizam essa mesma linha. Extrair
 *   evita duplicar os campos nos dois arquivos — manutenção em 1 lugar só.
 *
 * Props:
 *   - item:          { id_produto, quantidade, valor_unitario }
 *   - index:         posição no array de itens
 *   - produtos:      lista para o select [{ id_produto, nome }]
 *   - onChange:      callback (index, campo, valor)
 *   - onRemove:      callback (index)
 *   - disableRemove: desabilita o botão quando há só 1 item
 */
export default function ItemCompraRow({
  item,
  index,
  produtos,
  onChange,
  onRemove,
  disableRemove,
  valorReadOnly = false
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
    >
      <TextField
        select
        size="small"
        value={item.id_produto}
        onChange={(e) => onChange(index, "id_produto", e.target.value)}
        required
        SelectProps={{ displayEmpty: true }}
        sx={{ width: { xs: "100%", sm: "45%" } }}
      >
        <MenuItem value="" disabled>
          Selecione
        </MenuItem>
        {produtos.map((p) => (
          <MenuItem key={p.id_produto} value={p.id_produto}>
            {p.nome}
          </MenuItem>
        ))}
      </TextField>

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
        sx={{ width: { xs: "100%", sm: "25%" } }}
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
        helperText={valorReadOnly ? "Automático" : undefined}
        // Enviado como valor_unitario; o model mapeia p/ preco_unitario_acordado.
        inputProps={{ min: 0, step: "0.01" }}
        sx={{ width: { xs: "100%", sm: "25%" } }}
      />

      <IconButton
        color="error"
        onClick={() => onRemove(index)}
        disabled={disableRemove}
      >
        <RemoveCircleOutlineIcon />
      </IconButton>
    </Stack>
  );
}
