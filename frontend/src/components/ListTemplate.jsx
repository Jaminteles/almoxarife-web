import {
  Paper,
  Typography,
  Box,
  TextField,
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
  onCreate
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
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {filters}
          <Button variant="outlined">Buscar</Button>
        </Stack>
      </Box>

      {/* Botão novo */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" onClick={onCreate}>
          + Novo
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
          {data?.map((item, i) => (
            <TableRow key={i}>
              {Object.values(item).map((val, j) => (
                <TableCell key={j}>{val}</TableCell>
              ))}
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined">
                    Editar
                  </Button>
                  <Button size="small" color="warning" variant="outlined">
                    Inativar
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}