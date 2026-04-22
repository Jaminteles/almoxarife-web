import { Box, Stack, TextField, IconButton, Typography } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

/**
 * Bloco de campos de um único endereço.
 *
 * Motivo de existir: tanto Form quanto Edit de Fornecedor renderizam essa
 * mesma estrutura (CEP, estado, cidade, logradouro, número, bairro,
 * complemento). Se eu não extraísse, ficaria ~40 linhas duplicadas.
 * Componente isolado = manutenção em 1 lugar.
 *
 * Props:
 *  - endereco: objeto { cep, estado, cidade, ... }
 *  - index: posição no array de endereços (usado para pertencer a qual linha)
 *  - onChange: callback (index, campo, valor)
 *  - onRemove: callback opcional (index). Se não fornecido, não exibe botão remover.
 *  - disableRemove: desabilita o botão de remover (caso seja o único endereço)
 */
export default function EnderecoFields({ endereco, index, onChange, onRemove, disableRemove }) {
  const handleField = (campo) => (e) => onChange(index, campo, e.target.value);

  return (
    <Box sx={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Endereço {index + 1}
          </Typography>
          {onRemove && (
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(index)}
              disabled={disableRemove}
            >
              <RemoveCircleOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField size="small" label="CEP"     value={endereco.cep}     onChange={handleField("cep")}     sx={{ width: { sm: "40%" } }} />
          <TextField size="small" label="Estado"  value={endereco.estado}  onChange={handleField("estado")}  sx={{ width: { sm: "20%" } }} inputProps={{ maxLength: 2 }} />
          <TextField size="small" label="Cidade"  value={endereco.cidade}  onChange={handleField("cidade")}  sx={{ width: { sm: "40%" } }} />
        </Stack>

        <TextField size="small" label="Logradouro" value={endereco.logradouro} onChange={handleField("logradouro")} fullWidth />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField size="small" label="Número" value={endereco.numero} onChange={handleField("numero")} sx={{ width: { sm: "30%" } }} />
          <TextField size="small" label="Bairro" value={endereco.bairro} onChange={handleField("bairro")} sx={{ width: { sm: "70%" } }} />
        </Stack>

        <TextField size="small" label="Complemento" value={endereco.complemento} onChange={handleField("complemento")} fullWidth />
      </Stack>
    </Box>
  );
}
