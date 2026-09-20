import { Autocomplete, TextField } from "@mui/material";

/**
 * Campo pesquisável para entidades guardadas no formulário pelo seu ID.
 * Pode ser usado tanto para uma única escolha quanto para vários fornecedores.
 */
export default function EntityAutocomplete({
  options = [],
  value,
  onChange,
  getOptionId,
  getOptionLabel,
  label,
  multiple = false,
  required = false,
  disabled = false,
  helperText,
  size,
  sx
}) {
  const idsSelecionados = multiple ? value || [] : value;
  const valorSelecionado = multiple
    ? options.filter((option) =>
        idsSelecionados.some((id) => String(getOptionId(option)) === String(id))
      )
    : options.find((option) => String(getOptionId(option)) === String(idsSelecionados)) || null;

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={valorSelecionado}
      disabled={disabled}
      sx={sx}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, selected) =>
        String(getOptionId(option)) === String(getOptionId(selected))
      }
      onChange={(_, selected) =>
        onChange(
          multiple
            ? selected.map((option) => getOptionId(option))
            : selected ? getOptionId(selected) : ""
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          // Em múltipla seleção o input fica vazio mesmo com chips
          // selecionados; a validação nativa `required` bloquearia o envio.
          required={required && !multiple}
          helperText={helperText}
          size={size}
        />
      )}
    />
  );
}
