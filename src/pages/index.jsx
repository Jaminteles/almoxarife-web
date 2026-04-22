import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Link
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  CartesianGrid
} from "recharts";
import { useNavigate } from "react-router-dom";

// Ícones
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PeopleIcon from "@mui/icons-material/People";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import DescriptionIcon from "@mui/icons-material/Description";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import SummaryCard from "../components/SummaryCard";
import QuickAction from "../components/QuickAction";
import AlertItem from "../components/AlertItem";

const API_URL = "http://localhost:5000/api";

/**
 * Dados mocados para gráfico e últimas movimentações.
 *
 * IMPORTANTE: estes dados são "fake" porque os módulos de produtos/entradas/
 * saídas ainda não estão implementados no backend. Assim que você implementar
 * as APIs correspondentes, troque esses arrays por chamadas `fetch` como
 * fazemos para funcionários e fornecedores logo abaixo no componente.
 */
const DADOS_GRAFICO_MOCK = [
  { dia: "18/05", Entradas: 62, Saidas: 35 },
  { dia: "19/05", Entradas: 45, Saidas: 52 },
  { dia: "20/05", Entradas: 48, Saidas: 50 },
  { dia: "21/05", Entradas: 88, Saidas: 60 },
  { dia: "22/05", Entradas: 60, Saidas: 72 },
  { dia: "23/05", Entradas: 55, Saidas: 40 },
  { dia: "24/05", Entradas: 42, Saidas: 50 }
];

const MOVIMENTACOES_MOCK = [
  { data: "24/05/2025 14:21", tipo: "Entrada", produto: "Parafuso 4.0 x 40mm", qtd: "200 un", resp: "João Silva" },
  { data: "24/05/2025 13:47", tipo: "Saida",   produto: "Chave Phillips",      qtd: "10 un",  resp: "Maria Santos" },
  { data: "24/05/2025 11:15", tipo: "Entrada", produto: "Luva de Segurança",   qtd: "50 un",  resp: "Carlos Oliveira" },
  { data: "24/05/2025 10:02", tipo: "Saida",   produto: "Fita Isolante",        qtd: "5 un",   resp: "Ana Costa" },
  { data: "24/05/2025 09:30", tipo: "Entrada", produto: "Cabo Flexível 2,5mm",  qtd: "100 m",  resp: "João Silva" }
];

export default function Home() {
  const navigate = useNavigate();

  // Contadores que vêm da API real
  const [totalFuncionarios, setTotalFuncionarios] = useState(null);
  const [totalFornecedores, setTotalFornecedores] = useState(null);

  /**
   * Busca contagens reais assim que o dashboard abre.
   * Usa Promise.allSettled para que, se uma API falhar, a outra ainda funcione.
   * Isso é mais robusto que Promise.all, que falha tudo se qualquer um falhar.
   */
  useEffect(() => {
    Promise.allSettled([
      fetch(`${API_URL}/funcionarios`).then(r => r.json()),
      fetch(`${API_URL}/fornecedores`).then(r => r.json())
    ]).then(([func, forn]) => {
      if (func.status === "fulfilled" && func.value.sucesso) {
        setTotalFuncionarios(func.value.dados.length);
      } else {
        setTotalFuncionarios(0);
      }
      if (forn.status === "fulfilled" && forn.value.sucesso) {
        setTotalFornecedores(forn.value.dados.length);
      } else {
        setTotalFornecedores(0);
      }
    });
  }, []);

  // Helper para mostrar "—" enquanto ainda está carregando
  const fmt = (v) => (v === null ? "—" : v.toLocaleString("pt-BR"));

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      {/* Cabeçalho da página */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">
          Bem-vindo, João Silva! <span role="img" aria-label="aceno">👋</span>
        </Typography>
        <Typography color="text.secondary">
          Aqui está o resumo do seu almoxarifado hoje.
        </Typography>
      </Box>

      {/* ====== PAINEL DE RESUMO + AÇÕES RÁPIDAS ====== */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Painel de Resumo — ocupa 8/12 no desktop */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Painel de Resumo
            </Typography>

            <Grid container spacing={2}>
              {/* Mocados: total de itens, estoque baixo, movimentações */}
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SummaryCard
                  icon={<Inventory2Icon />}
                  color="#3b82f6"
                  value="1.245"
                  label="Total de itens em estoque"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SummaryCard
                  icon={<WarningAmberIcon />}
                  color="#f59e0b"
                  value="23"
                  label="Itens com estoque baixo"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SummaryCard
                  icon={<SwapHorizIcon />}
                  color="#10b981"
                  value="58"
                  label="Movimentações hoje"
                  footer={
                    <Typography variant="caption" color="text.secondary">
                      Entradas: 32 &nbsp;|&nbsp; Saídas: 26
                    </Typography>
                  }
                />
              </Grid>

              {/* Reais (vêm da API) */}
              <Grid item xs={12} sm={6} md={6} lg={2.4}>
                <SummaryCard
                  icon={<StorefrontIcon />}
                  color="#a855f7"
                  value={fmt(totalFornecedores)}
                  label="Fornecedores cadastrados"
                  footer={
                    <Link
                      component="button"
                      onClick={() => navigate("/fornecedores")}
                      variant="caption"
                      sx={{ color: "primary.main", textDecoration: "none" }}
                    >
                      Ver fornecedores →
                    </Link>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={2.4}>
                <SummaryCard
                  icon={<PeopleIcon />}
                  color="#06b6d4"
                  value={fmt(totalFuncionarios)}
                  label="Funcionários ativos"
                  footer={
                    <Link
                      component="button"
                      onClick={() => navigate("/funcionarios")}
                      variant="caption"
                      sx={{ color: "primary.main", textDecoration: "none" }}
                    >
                      Ver funcionários →
                    </Link>
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Ações rápidas — 4/12 no desktop */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Ações rápidas
            </Typography>
            <Grid container spacing={1}>
              {/* Os "fantasmas" ficam desabilitados */}
              <Grid item xs={6}>
                <QuickAction icon={<AddCircleIcon />} color="#ef4444" label="Cadastrar item" disabled />
              </Grid>
              <Grid item xs={6}>
                <QuickAction icon={<DownloadIcon />} color="#10b981" label="Registrar entrada" disabled />
              </Grid>
              <Grid item xs={6}>
                <QuickAction icon={<UploadIcon />} color="#f59e0b" label="Registrar saída" disabled />
              </Grid>
              {/* Módulos implementados são clicáveis e navegam */}
              <Grid item xs={6}>
                <QuickAction
                  icon={<PersonAddIcon />} color="#06b6d4"
                  label="Novo funcionário"
                  onClick={() => navigate("/funcionarios/cadastro")}
                />
              </Grid>
              <Grid item xs={6}>
                <QuickAction
                  icon={<AddBusinessIcon />} color="#a855f7"
                  label="Novo fornecedor"
                  onClick={() => navigate("/fornecedores/cadastro")}
                />
              </Grid>
              <Grid item xs={6}>
                <QuickAction icon={<DescriptionIcon />} color="#3b82f6" label="Gerar relatório" disabled />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ====== ALERTAS + GRÁFICO ====== */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Alertas importantes
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <AlertItem
                icon={<ErrorOutlineIcon />}
                color="#ef4444"
                title="Estoque baixo"
                description="23 itens estão com estoque abaixo do mínimo."
              />
              <AlertItem
                icon={<ScheduleIcon />}
                color="#f59e0b"
                title="Itens vencendo"
                description="7 itens vencem nos próximos 30 dias."
              />
              <AlertItem
                icon={<AssignmentIcon />}
                color="#3b82f6"
                title="Pedidos pendentes"
                description="5 pedidos de compra estão pendentes."
                actionLabel="Ver pedidos"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Entradas vs Saídas (últimos 7 dias)
            </Typography>
            <Box sx={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={DADOS_GRAFICO_MOCK}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="dia" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <ReTooltip
                    contentStyle={{
                      background: "#171b24",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Saidas"   fill="#ef4444" radius={[4, 4, 0, 0]} name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ====== ÚLTIMAS MOVIMENTAÇÕES ====== */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Últimas movimentações
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "text.secondary" }}>Data / Hora</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>Tipo</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>Produto</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>Quantidade</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>Responsável</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOVIMENTACOES_MOCK.map((m, i) => (
              <TableRow key={i} hover>
                <TableCell>{m.data}</TableCell>
                <TableCell>
                  <Chip
                    label={m.tipo === "Entrada" ? "Entrada" : "Saída"}
                    size="small"
                    sx={{
                      bgcolor: m.tipo === "Entrada" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color:   m.tipo === "Entrada" ? "#10b981"              : "#ef4444",
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>{m.produto}</TableCell>
                <TableCell>{m.qtd}</TableCell>
                <TableCell>{m.resp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Link
            component="button"
            variant="body2"
            sx={{ color: "primary.main", textDecoration: "none", display: "flex", alignItems: "center", gap: 0.5 }}
          >
            Ver todas movimentações <ArrowForwardIcon fontSize="small" />
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
