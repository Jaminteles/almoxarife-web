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
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import ClearIcon from "@mui/icons-material/Clear";
import { useAuth } from "../auth/AuthContext";

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
  // Ações extras por linha, renderizadas ANTES de Editar/Excluir. Recebe o
  // item e devolve um ReactNode (ex.: botão "Confirmar recebimento"). Só
  // aparecem quando o usuário tem permissão de escrita (canEdit).
  rowActions,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
  // Nome do módulo para checar permissão de escrita. Quando informado e o
  // usuário for somente-leitura, esconde "Novo", "Editar", "Inativar" e a
  // coluna Ações. Se omitido, mantém tudo visível (retrocompatível).
  modulo,
  // Permite esconder só o botão "Novo" mantendo as demais ações (ex.: usuário
  // restrito a um almoxarifado, que pode editar o seu mas não criar outros).
  canCreate = true,
  // Customização opcional do botão destrutivo (padrão = Inativar):
  actionLabel = "Inativar",
  actionIcon = <BlockIcon fontSize="small" />,
  actionColor = "warning.main"
}) {
  const { podeEditar } = useAuth();
  const canEdit = modulo ? podeEditar(modulo) : true;

  const theme = useTheme();
  // No celular (xs) trocamos a tabela larga por cartões, que leem melhor numa
  // tela estreita — sem scroll horizontal.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Botões de ação de uma linha/cartão (Editar + destrutivo + extras).
  const renderAcoes = (item) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      {rowActions && rowActions(item)}
      <Tooltip title="Editar">
        <IconButton
          size="small"
          onClick={(e) => {
            // CRÍTICO: impede que o clique no botão "vaze" para o onClick da
            // linha/cartão (event bubbling).
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
  );

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
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

        {canEdit && canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreate}
            sx={{ whiteSpace: "nowrap", width: { xs: "100%", sm: "auto" } }}
          >
            Novo
          </Button>
        )}
      </Box>

      {/* Linha de filtros — campos vêm via prop `filters`, botões à direita.
          No mobile os campos e botões ocupam a largura toda (empilhados). */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{
          mb: 2.5,
          // Cada campo/botão de filtro ocupa 100% no celular.
          "& > *": { width: { xs: "100%", md: "auto" } }
        }}
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

      {isMobile ? (
        /* ─── MOBILE: cartões ─── */
        <Stack spacing={1.5}>
          {loading ? (
            <Typography align="center" sx={{ py: 6, color: "text.secondary" }}>
              Carregando registros...
            </Typography>
          ) : data?.length ? (
            data.map((item, i) => (
              <Paper
                key={i}
                variant="outlined"
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: onRowClick ? "pointer" : "default"
                }}
              >
                {columns.map((col, j) => (
                  <Box
                    key={j}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 2,
                      py: 0.5
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, flexShrink: 0 }}
                    >
                      {col}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: "right", wordBreak: "break-word", minWidth: 0 }}
                    >
                      {item[col]}
                    </Typography>
                  </Box>
                ))}

                {canEdit && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    {renderAcoes(item)}
                  </>
                )}
              </Paper>
            ))
          ) : (
            <Typography align="center" sx={{ py: 6, color: "text.secondary" }}>
              {emptyMessage}
            </Typography>
          )}
        </Stack>
      ) : (
        /* ─── DESKTOP/TABLET: tabela ─── */
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((col, i) => (
                  <TableCell key={i} sx={{ color: "text.secondary", fontWeight: 600 }}>
                    {col}
                  </TableCell>
                ))}
                {canEdit && (
                  <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Ações
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (canEdit ? 1 : 0)} align="center" sx={{ py: 6, color: "text.secondary" }}>
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
                    {canEdit && (
                      <TableCell align="right">{renderAcoes(item)}</TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                // Mensagem quando não há dados — melhor UX que tabela vazia
                <TableRow>
                  <TableCell colSpan={columns.length + (canEdit ? 1 : 0)} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}
