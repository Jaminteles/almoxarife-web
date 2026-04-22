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

/**
 * Template de listagem padrão do sistema.
 *
 * IMPORTANTE: a API (os props) foi mantida igual à versão original:
 *   - title, columns, data, onCreate, onEdit, onInactivate, filters
 *
 * Sobre os filtros:
 *   Cada página passa via prop `filters` os TextFields específicos do
 *   contexto (ex.: Funcionários -> Nome + CPF; Fornecedores -> Razão
 *   Social + CNPJ). Aqui dentro só colocamos esses campos em linha e
 *   adicionamos o botão "Buscar" à direita.
 *
 *   Esse padrão é interessante porque cada módulo controla os próprios
 *   filtros (nome, CPF, CNPJ, categoria, etc.) sem que o ListTemplate
 *   precise "saber" quais são. Isso é o princípio de "inversão de
 *   controle" — o componente pai diz o que mostrar, o filho só organiza.
 */
export default function ListTemplate({
  title,
  filters,
  columns,
  data,
  onCreate,
  onEdit,
  onInactivate,
  onSearch // opcional — se a página quiser reagir ao clique em Buscar
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
            {data?.length ? (
              data.map((item, i) => (
                <TableRow key={i} hover>
                  {columns.map((col, j) => (
                    <TableCell key={j}>{item[col]}</TableCell>
                  ))}
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEdit && onEdit(item)}
                          sx={{ color: "primary.main" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Inativar">
                        <IconButton
                          size="small"
                          onClick={() => onInactivate && onInactivate(item)}
                          sx={{ color: "warning.main" }}
                        >
                          <BlockIcon fontSize="small" />
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
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
