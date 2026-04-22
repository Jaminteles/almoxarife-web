import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack
} from "@mui/material";

export default function ListTemplate({
  title,
  filters,
  columns,
  data,
  onCreate,
  onEdit,
  onInactivate,
  onSearch,          // callback do botão "Buscar"
  onClear,           // callback do botão "Limpar" (opcional)
  loading = false,
  emptyMessage = "Nenhum registro encontrado."
}) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      {/* Header */}
      {title && (
        <Typography variant="h5" mb={2}>
          {title}
        </Typography>
      )}

      {/* Filtros */}
      <Box mb={3}>
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          {filters}
          <Button
            variant="outlined"
            onClick={onSearch}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </Button>
          {onClear && (
            <Button
              variant="text"
              onClick={onClear}
              disabled={loading}
            >
              Limpar
            </Button>
          )}
        </Stack>
      </Box>

      {/* Botão novo */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" onClick={onCreate}>
          CADASTRAR
        </Button>
      </Box>

      {/* Tabela */}
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col, i) => (
              <TableCell key={i}>{col}</TableCell>
            ))}
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data && data.length > 0 ? (
            data.map((item, i) => (
              <TableRow key={i}>
                {Object.values(item).map((val, j) => (
                  <TableCell key={j}>{val}</TableCell>
                ))}
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onEdit && onEdit(item)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="warning"
                      variant="outlined"
                      onClick={() => onInactivate && onInactivate(item)}
                    >
                      Inativar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4, color: "text.secondary" }}>
                {loading ? "Carregando..." : emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
