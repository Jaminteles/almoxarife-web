import { useEffect, useState } from "react";
import {
  Box,
  GridLegacy as Grid,
  Paper,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Link,
  Stack,
  Divider,
  useTheme,
  useMediaQuery
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
import WarehouseIcon from "@mui/icons-material/Warehouse";
import UploadIcon from "@mui/icons-material/Upload";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";

import SummaryCard from "../components/SummaryCard";
import QuickAction from "../components/QuickAction";
import AlertItem from "../components/AlertItem";

const API_URL = `${window.location.origin}/api`;

// ── Helpers de data ──
const mesmaData = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const rotuloDia = (d) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

// Soma as quantidades dos itens de uma compra/saída.
const somaQtd = (itens = []) =>
  itens.reduce((s, it) => s + (Number(it.quantidade) || 0), 0);

// Nomes dos produtos de uma movimentação.
const nomesProdutos = (itens = []) =>
  itens.map((i) => i.produto?.nome || `Produto ${i.id_produto}`).join(", ") || "—";

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [carregando, setCarregando] = useState(true);
  const [resumo, setResumo] = useState({
    totalItens: 0,
    itensBaixoEstoque: 0,
    movimentacoesHoje: 0,
    entradasHoje: 0,
    saidasHoje: 0,
    totalFornecedores: 0,
    totalFuncionarios: 0,
    pedidosPendentes: 0
  });
  const [grafico, setGrafico] = useState([]);
  const [ultimasMovs, setUltimasMovs] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API_URL}/funcionarios`).then((r) => r.json()),
      fetch(`${API_URL}/fornecedores`).then((r) => r.json()),
      fetch(`${API_URL}/produtos`).then((r) => r.json()),
      fetch(`${API_URL}/compras`).then((r) => r.json()),
      fetch(`${API_URL}/saidas`).then((r) => r.json())
    ]).then(([resFunc, resForn, resProd, resCompras, resSaidas]) => {
      const dados = (res) =>
        res.status === "fulfilled" && res.value?.sucesso && Array.isArray(res.value.dados)
          ? res.value.dados
          : [];

      const funcionarios = dados(resFunc);
      const fornecedores = dados(resForn);
      const produtos = dados(resProd);
      const compras = dados(resCompras);
      const saidas = dados(resSaidas);

      // ── Estoque: total e itens abaixo do mínimo ──
      let totalItens = 0;
      let itensBaixoEstoque = 0;
      produtos.forEach((p) => {
        const qtdProduto = (p.almoxarifados_estoque || []).reduce(
          (s, a) => s + (Number(a.Estoque?.quantidade) || 0),
          0
        );
        totalItens += qtdProduto;
        const minimo = Number(p.estoque_minimo) || 0;
        if (minimo > 0 && qtdProduto <= minimo) itensBaixoEstoque += 1;
      });

      // ── Movimentações de hoje ──
      const hoje = new Date();
      const entradasHoje = compras.filter(
        (c) => c.data_compra && mesmaData(new Date(c.data_compra), hoje)
      ).length;
      const saidasHoje = saidas.filter(
        (s) => s.data_saida && mesmaData(new Date(s.data_saida), hoje)
      ).length;

      const pedidosPendentes = compras.filter((c) => c.status === "PENDENTE").length;

      setResumo({
        totalItens,
        itensBaixoEstoque,
        movimentacoesHoje: entradasHoje + saidasHoje,
        entradasHoje,
        saidasHoje,
        totalFornecedores: fornecedores.length,
        totalFuncionarios: funcionarios.length,
        pedidosPendentes
      });

      // ── Gráfico: últimos 7 dias (Entradas = compras, Saídas = saídas) ──
      const dias = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() - i);
        dias.push(d);
      }
      const graf = dias.map((d) => ({ dia: rotuloDia(d), Entradas: 0, Saidas: 0 }));
      const indicePorDia = {};
      dias.forEach((d, i) => (indicePorDia[d.toLocaleDateString("pt-BR")] = i));

      compras.forEach((c) => {
        if (!c.data_compra) return;
        const k = new Date(c.data_compra).toLocaleDateString("pt-BR");
        if (k in indicePorDia) graf[indicePorDia[k]].Entradas += somaQtd(c.itens);
      });
      saidas.forEach((s) => {
        if (!s.data_saida) return;
        const k = new Date(s.data_saida).toLocaleDateString("pt-BR");
        if (k in indicePorDia) graf[indicePorDia[k]].Saidas += somaQtd(s.itens);
      });
      setGrafico(graf);

      // ── Últimas movimentações (compras + saídas, mais recentes primeiro) ──
      const movs = [];
      compras.forEach((c) =>
        movs.push({
          dataRaw: c.data_compra,
          tipo: "Entrada",
          produto: nomesProdutos(c.itens),
          observacao: c.observacao || "—"
        })
      );
      saidas.forEach((s) =>
        movs.push({
          dataRaw: s.data_saida,
          tipo: "Saida",
          produto: nomesProdutos(s.itens),
          observacao: s.observacao || "—"
        })
      );
      movs.sort((a, b) => new Date(b.dataRaw) - new Date(a.dataRaw));
      setUltimasMovs(movs.slice(0, 6));

      setCarregando(false);
    });
  }, []);

  const fmt = (v) => (carregando ? "—" : Number(v).toLocaleString("pt-BR"));
  const formatarData = (valor) => {
    if (!valor) return "—";
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      {/* Cabeçalho da página */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">
          Resumo do Almoxarifado
        </Typography>
      </Box>

      {/* ====== PAINEL DE RESUMO ====== */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Painel de Resumo
        </Typography>

        <Grid container spacing={3} justifyContent="space-between">
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SummaryCard
                  icon={<Inventory2Icon />}
                  color="#3b82f6"
                  value={fmt(resumo.totalItens)}
                  label="Total de itens em estoque"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SummaryCard
                  icon={<WarningAmberIcon />}
                  color="#f59e0b"
                  value={fmt(resumo.itensBaixoEstoque)}
                  label="Itens com estoque baixo"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SummaryCard
                  icon={<SwapHorizIcon />}
                  color="#10b981"
                  value={fmt(resumo.movimentacoesHoje)}
                  label="Movimentações hoje"
                  footer={
                    <Typography variant="caption" color="text.secondary">
                      Entradas: {resumo.entradasHoje} &nbsp;|&nbsp; Saídas: {resumo.saidasHoje}
                    </Typography>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={2.4}>
                <SummaryCard
                  icon={<StorefrontIcon />}
                  color="#a855f7"
                  value={fmt(resumo.totalFornecedores)}
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
                  value={fmt(resumo.totalFuncionarios)}
                  label="Funcionários cadastrados"
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

      {/* ====== AÇÕES RÁPIDAS ====== */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Ações rápidas
        </Typography>
        <Grid container spacing={3} justifyContent="space-between">
              {/* Mesmos módulos (nome e ícone) do menu lateral. */}
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <QuickAction
                  icon={<PeopleIcon />} color="#06b6d4"
                  label="Cadastrar funcionário"
                  onClick={() => navigate("/funcionarios/cadastro")}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <QuickAction
                  icon={<StorefrontIcon />} color="#a855f7"
                  label="Cadastrar fornecedor"
                  onClick={() => navigate("/fornecedores/cadastro")}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <QuickAction
                  icon={<Inventory2Icon />} color="#3b82f6"
                  label="Cadastrar produto"
                  onClick={() => navigate("/produtos/novo")}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <QuickAction
                  icon={<WarehouseIcon />} color="#ef4444"
                  label="Cadastrar almoxarifado"
                  onClick={() => navigate("/almoxarifados/cadastro")}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <QuickAction
                  icon={<AssignmentIcon />} color="#10b981"
                  label="Registrar compra"
                  onClick={() => navigate("/compras/cadastro")}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <QuickAction
                  icon={<UploadIcon />} color="#f59e0b"
                  label="Registrar saída"
                  onClick={() => navigate("/saidas/cadastro")}
                />
              </Grid>
        </Grid>
      </Paper>

      {/* ====== ALERTAS + GRÁFICO ====== */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
          alignItems: "stretch"
        }}
      >
        <Paper sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Alertas importantes
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                flexGrow: 1,
                justifyContent: "center"
              }}
            >
              {resumo.itensBaixoEstoque > 0 ? (
                <AlertItem
                  icon={<ErrorOutlineIcon />}
                  color="#ef4444"
                  title="Estoque baixo"
                  description={`${resumo.itensBaixoEstoque} item(ns) com saldo igual ou abaixo do mínimo.`}
                  actionLabel="Ver produtos"
                  onAction={() => navigate("/produtos")}
                />
              ) : (
                <AlertItem
                  icon={<ErrorOutlineIcon />}
                  color="#10b981"
                  title="Estoque saudável"
                  description="Nenhum item abaixo do estoque mínimo."
                />
              )}
              {resumo.pedidosPendentes > 0 && (
                <AlertItem
                  icon={<AssignmentIcon />}
                  color="#3b82f6"
                  title="Pedidos pendentes"
                  description={`${resumo.pedidosPendentes} pedido(s) de compra pendente(s).`}
                  actionLabel="Ver compras"
                  onAction={() => navigate("/compras")}
                />
              )}
            </Box>
        </Paper>

        <Paper sx={{ p: 2.5, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Entradas vs Saídas (últimos 7 dias)
            </Typography>
            <Box sx={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={grafico}>
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
                  <Bar dataKey="Saidas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
        </Paper>
      </Box>

      {/* ====== ÚLTIMAS MOVIMENTAÇÕES ====== */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Últimas movimentações
        </Typography>
        {(() => {
          // Chip de tipo (Entrada/Saída), reaproveitado nas duas visões.
          const chipTipo = (tipo) => (
            <Chip
              label={tipo === "Entrada" ? "Entrada" : "Saída"}
              size="small"
              sx={{
                bgcolor: tipo === "Entrada" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: tipo === "Entrada" ? "#10b981" : "#ef4444",
                fontWeight: 600
              }}
            />
          );

          if (isMobile) {
            // ── Celular: cartões (sem scroll horizontal) ──
            if (!ultimasMovs.length) {
              return (
                <Typography align="center" sx={{ py: 4, color: "text.secondary" }}>
                  {carregando ? "Carregando..." : "Nenhuma movimentação registrada."}
                </Typography>
              );
            }
            return (
              <Stack spacing={1.5}>
                {ultimasMovs.map((m, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      {chipTipo(m.tipo)}
                      <Typography variant="caption" color="text.secondary">
                        {formatarData(m.dataRaw)}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                      {m.produto}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, wordBreak: "break-word" }}>
                      {m.observacao}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            );
          }

          // ── Desktop/tablet: tabela ──
          return (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "text.secondary" }}>Data</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>Tipo</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>Produto(s)</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>Observação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ultimasMovs.length ? (
                  ultimasMovs.map((m, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{formatarData(m.dataRaw)}</TableCell>
                      <TableCell>{chipTipo(m.tipo)}</TableCell>
                      <TableCell>{m.produto}</TableCell>
                      <TableCell>{m.observacao}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5, color: "text.secondary" }}>
                      {carregando ? "Carregando..." : "Nenhuma movimentação registrada."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </TableContainer>
          );
        })()}
      </Paper>
    </Box>
  );
}
