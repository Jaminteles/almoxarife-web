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
  Stack,
  IconButton,
  Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import ClearIcon from "@mui/icons-material/Clear";

export default function ListTemplate({
  title,
  filters,
  columns,
  data,
  onCreate,
  onEdit,
  onInactivate,
  onSearch,
  onClear,
  onRowClick, // opcional: ativa clique na linha
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
  // Customização opcional do botão destrutivo (padrão = Inativar):
  actionLabel = "Inativar",
  actionIcon = <BlockIcon fontSize="small" />,
  actionColor = "warning.main"
}) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      {/* Cabeçalho: título (esquerda) + botão "+ Novo" (direita) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 2.5
        }}
      >
        <Box>
          {title && (
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Gerencie os registros de {title?.toLowerCase()}.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreate}
          sx={{ whiteSpace: "nowrap" }}
        >
          Novo
        </Button>
      </Box>

      {/* Linha de filtros — campos vêm via prop `filters`, botão Buscar fica à direita */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
        alignItems={{ md: "center" }}
        flexWrap="wrap"
      >
        {filters}
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={onSearch}
          sx={{ whiteSpace: "nowrap" }}
        >
          Buscar
        </Button>
        {onClear && (
          <Button
            variant="text"
            startIcon={<ClearIcon />}
            onClick={onClear}
            sx={{ whiteSpace: "nowrap" }}
          >
            Limpar
          </Button>
        )}
      </Stack>

      {/* Tabela */}
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col, i) => (
                <TableCell key={i} sx={{ color: "text.secondary", fontWeight: 600 }}>
                  {col}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  Carregando registros...
                </TableCell>
              </TableRow>
            ) : data?.length ? (
              data.map((item, i) => (
                <TableRow
                  key={i}
                  hover
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  // Só ativa cursor pointer se a linha for clicável
                  sx={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((col, j) => (
                    <TableCell key={j}>{item[col]}</TableCell>
                  ))}
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            // CRÍTICO: impede que o clique no botão "vaze"
                            // para o onClick da TableRow (event bubbling).
                            // Sem isso, clicar em "Editar" abriria os
                            // detalhes E iria para edição ao mesmo tempo.
                            e.stopPropagation();
                            onEdit && onEdit(item);
                          }}
                          sx={{ color: "primary.main" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={actionLabel}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInactivate && onInactivate(item);
                          }}
                          sx={{ color: actionColor }}
                        >
                          {actionIcon}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Mensagem quando não há dados — melhor UX que tabela vazia
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
