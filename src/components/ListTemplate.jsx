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
  Stack,
  CircularProgress
} from "@mui/material";

/**
 * ListTemplate — Componente reutilizável de listagem com tabela.
 *
 * POR QUE O BOTÃO INATIVAR É CONDICIONAL?
 * ----------------------------------------
 * Conforme os requisitos RF008 e RF012, o botão "Inativar" só existe nos módulos
 * de Funcionário e Fornecedor (soft delete — muda status para inativo sem apagar dados).
 * Outros módulos (Compras, Saídas) usam "Excluir" (hard delete).
 *
 * Ao tornar o botão condicional via prop `onInactivate`, o mesmo componente
 * serve para TODOS os módulos sem exibir botões desnecessários.
 *
 * Props:
 * - title: string — título da seção
 * - filters: ReactNode — campos de filtro (TextField, Select, etc.)
 * - columns: string[] — nomes das colunas do cabeçalho
 * - data: object[] — dados da tabela (cada objeto vira uma linha)
 * - onCreate: function — callback do botão "Cadastrar"
 * - onEdit: function — callback do botão "Editar" (por linha)
 * - onInactivate: function | undefined — callback do botão "Inativar" (CONDICIONAL)
 *   → Se NÃO for passado, o botão simplesmente não aparece.
 *   → Usado APENAS em Funcionários e Fornecedores.
 * - onDelete: function | undefined — callback do botão "Excluir" (CONDICIONAL)
 *   → Para módulos que usam exclusão real (Compras, Saídas, etc.)
 * - loading: boolean — exibe spinner enquanto carrega dados
 */
export default function ListTemplate({
  title,
  filters,
  columns,
  data,
  onCreate,
  onEdit,
  onInactivate,  // ← Só funcionário e fornecedor passam isso
  onDelete,      // ← Para módulos que usam exclusão real
  loading = false
}) {
  // Verifica se há alguma ação disponível para decidir se mostra a coluna "Ações"
  const temAcoes = !!(onEdit || onInactivate || onDelete);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      {/* ═══ CABEÇALHO ═══ */}
      {title && (
        <Typography variant="h5" mb={2}>
          {title}
        </Typography>
      )}

      {/* ═══ FILTROS ═══ */}
      {filters && (
        <Box mb={3}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {filters}
            <Button variant="outlined">Buscar</Button>
          </Stack>
        </Box>
      )}

      {/* ═══ BOTÃO CADASTRAR ═══ */}
      {onCreate && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button variant="contained" onClick={onCreate}>
            CADASTRAR
          </Button>
        </Box>
      )}

      {/* ═══ ESTADO DE LOADING ═══ */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        /* ═══ TABELA ═══ */
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col, i) => (
                <TableCell key={i}>{col}</TableCell>
              ))}
              {/* Só exibe coluna de Ações se houver pelo menos uma ação */}
              {temAcoes && <TableCell>Ações</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {data?.length > 0 ? (
              data.map((item, i) => (
                <TableRow key={i}>
                  {Object.values(item).map((val, j) => (
                    <TableCell key={j}>{val}</TableCell>
                  ))}

                  {temAcoes && (
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {/* EDITAR — sempre presente quando passado */}
                        {onEdit && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onEdit(item)}
                          >
                            Editar
                          </Button>
                        )}

                        {/*
                          INATIVAR — RENDERIZAÇÃO CONDICIONAL
                          ===================================
                          Este botão SÓ aparece se a prop onInactivate for passada.
                          
                          Por que não usar onDelete aqui?
                          Porque "inativar" é um SOFT DELETE: o registro continua
                          no banco com status "inativo". Isso preserva o histórico
                          conforme exigido pelos requisitos RF008 e RF012.
                          
                          Módulos que usam isso: Funcionários, Fornecedores.
                          Módulos que NÃO usam: Compras, Saídas (esses usam onDelete).
                        */}
                        {onInactivate && (
                          <Button
                            size="small"
                            color="warning"
                            variant="outlined"
                            onClick={() => onInactivate(item)}
                          >
                            Inativar
                          </Button>
                        )}

                        {/* EXCLUIR — para módulos com hard delete */}
                        {onDelete && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => onDelete(item)}
                          >
                            Excluir
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (temAcoes ? 1 : 0)} align="center">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
