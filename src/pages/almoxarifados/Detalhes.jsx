import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  GridLegacy as Grid,
  Typography,
  Stack,
  TextField,
  Button,
  Box,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import UpdateIcon from "@mui/icons-material/Update";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";

import FormPageHeader from "../../components/FormPageHeader";
import SummaryCard from "../../components/SummaryCard";
import { useAuth } from "../../auth/AuthContext";

/**
 * Tela de Detalhes de um Almoxarifado especifico.
 *
 * INTEGRACAO PARCIAL AO BACKEND:
 *  - BLOCO 1 (dados cadastrais): via GET /api/almoxarifados/:id  -> REAL.
 *  - BLOCOS 2 e 3 (estoque): AINDA MOCK. O modulo Estoque nao existe no
 *    backend (model comentado em models/index.js). Quando ele existir,
 *    troque MOCK_ESTOQUE por algo como:
 *        fetch(`${API_URL}/almoxarifados/${id}/estoque`)
 *    e remova este mock. O resto da tela ja esta pronto.
 *
 * RF014 (Consultar Almoxarifado): consulta o estoque com filtros por
 * produto, fornecedor, nota fiscal e data de atualizacao.
 */

const API_URL = `http://${window.location.hostname}:5000/api`;

export default function AlmoxarifadoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { podeEditar } = useAuth();
  // Só quem pode escrever no módulo (CENTRAL/ALMOXARIFE) vê o botão Editar.
  const podeEditarAlmox = podeEditar("almoxarifados");

  const [almoxarifado, setAlmoxarifado] = useState(null);
  const [estoque, setEstoque] = useState([]);
  const [estoqueFiltrado, setEstoqueFiltrado] = useState([]);
  const [error, setError] = useState("");

  // Filtros conforme RF014: produto, fornecedor, data.
  const [filtros, setFiltros] = useState({
    produto: "",
    fornecedor: "",
    data: ""
  });

  // Carrega dados quando o `id` da URL muda.
  useEffect(() => {
    setError("");

    // BLOCO 1 — dados cadastrais via API real.
    fetch(`${API_URL}/almoxarifados/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          setAlmoxarifado(result.dados);
        } else {
          setError(result.erro || "Almoxarifado não encontrado.");
        }
      })
      .catch(err => setError("Erro ao carregar: " + err.message));

    // BLOCOS 2 e 3 — estoque REAL via GET /almoxarifados/:id/estoque.
    fetch(`${API_URL}/almoxarifados/${id}/estoque`)
      .then(res => res.json())
      .then(result => {
        const itens = result.sucesso && Array.isArray(result.dados) ? result.dados : [];
        setEstoque(itens);
        setEstoqueFiltrado(itens);
      })
      .catch(err => setError("Erro ao carregar estoque: " + err.message));
  }, [id]);

  // ── Handlers dos filtros do estoque (filtragem LOCAL no mock) ──
  function handleFiltroChange(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }

  function handleBuscar() {
    const filtrados = estoque.filter(item => {
      if (filtros.produto && !item.produto.toLowerCase().includes(filtros.produto.toLowerCase())) return false;
      if (filtros.fornecedor && !item.fornecedor.toLowerCase().includes(filtros.fornecedor.toLowerCase())) return false;
      // Compara apenas a parte AAAA-MM-DD (o backend devolve timestamp ISO).
      if (filtros.data && String(item.data_atualizacao).slice(0, 10) !== filtros.data) return false;
      return true;
    });
    setEstoqueFiltrado(filtrados);
  }

  function handleLimpar() {
    setFiltros({ produto: "", fornecedor: "", data: "" });
    setEstoqueFiltrado(estoque);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleBuscar();
  }

  // ── Calculos derivados ──
  const totalItens = estoque.reduce((sum, it) => sum + it.qtd, 0);
  const valorTotal = estoque.reduce((sum, it) => sum + it.qtd * it.valor_unit, 0);
  const itensBaixoEstoque = estoque.filter(it => it.qtd < it.qtd_minima).length;
  const ultimaAtualizacao = almoxarifado
    ? new Date(almoxarifado.data_atualizacao).toLocaleDateString("pt-BR")
    : "—";

  // Formatacao BR de moeda — Intl.NumberFormat e nativo, nao precisa lib.
  const formatarMoeda = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (error) {
    return (
      <Container maxWidth="lg">
        <FormPageHeader title="Detalhes do Almoxarifado" backTo="/almoxarifados" />
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!almoxarifado) {
    return (
      <Container maxWidth="lg">
        <FormPageHeader title="Carregando..." backTo="/almoxarifados" />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Cabecalho + botao voltar para /almoxarifados */}
      <FormPageHeader
        title={almoxarifado.nome}
        subtitle={`Almoxarifado #${almoxarifado.cod_almoxarifado} — visualização de dados e estoque`}
        backTo="/almoxarifados"
      />

      {/* === BLOCO 1: Dados cadastrais (REAL) === */}
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Dados do almoxarifado
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              label={almoxarifado.ativo === 1 ? "Ativo" : "Inativo"}
              color={almoxarifado.ativo === 1 ? "success" : "default"}
              size="small"
            />
            {podeEditarAlmox && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/almoxarifados/${id}/editar`)}
              >
                Editar
              </Button>
            )}
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body2">{almoxarifado.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">Telefone</Typography>
            <Typography variant="body2">{almoxarifado.telefones?.map(t => t.telefone).join(", ") || "—"}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Endereço</Typography>
            <Typography variant="body2">
              {almoxarifado.endereco.logradouro}, {almoxarifado.endereco.numero}
              {" — "}{almoxarifado.endereco.bairro}
              {", "}{almoxarifado.endereco.cidade}/{almoxarifado.endereco.estado}
              {" — CEP "}{almoxarifado.endereco.cep}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* === BLOCO 2: Resumo do estoque (4 cards) — calculado sobre o MOCK === */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<Inventory2Icon />}
            color="#3b82f6"
            value={totalItens.toLocaleString("pt-BR")}
            label="Itens em estoque"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<WarningAmberIcon />}
            color="#f59e0b"
            value={itensBaixoEstoque}
            label="Produtos abaixo do mínimo"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<AttachMoneyIcon />}
            color="#10b981"
            value={formatarMoeda(valorTotal)}
            label="Valor total estocado"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<UpdateIcon />}
            color="#a78bfa"
            value={ultimaAtualizacao}
            label="Última atualização"
          />
        </Grid>
      </Grid>

      {/* === BLOCO 3: Tabela de estoque com filtros (RF014) — MOCK === */}
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
          Itens em estoque
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Consulte os materiais deste almoxarifado e aplique filtros para refinar a busca.
        </Typography>

        {/* Linha de filtros — espelha o padrao do List.jsx (TextField + botao Buscar) */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ mb: 2.5 }}
          alignItems={{ md: "center" }}
          flexWrap="wrap"
        >
          <TextField
            label="Produto"
            size="small"
            value={filtros.produto}
            onChange={(e) => handleFiltroChange("produto", e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <TextField
            label="Fornecedor"
            size="small"
            value={filtros.fornecedor}
            onChange={(e) => handleFiltroChange("fornecedor", e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <TextField
            label="Data de Atualização"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filtros.data}
            onChange={(e) => handleFiltroChange("data", e.target.value)}
          />
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleBuscar}
            sx={{ whiteSpace: "nowrap" }}
          >
            Buscar
          </Button>
          <Button variant="text" onClick={handleLimpar} sx={{ whiteSpace: "nowrap" }}>
            Limpar
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Tabela read-only (sem botoes de edit/inativar por linha). */}
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Produto</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Fornecedor</TableCell>
                <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Qtd. Atual</TableCell>
                <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Qtd. Mín.</TableCell>
                <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Valor Unit.</TableCell>
                <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Subtotal</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Atualizado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estoqueFiltrado.length ? (
                estoqueFiltrado.map((item) => {
                  const baixoEstoque = item.qtd < item.qtd_minima;
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.produto}</TableCell>
                      <TableCell>{item.fornecedor}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          <span>{item.qtd.toLocaleString("pt-BR")}</span>
                          {baixoEstoque && (
                            <Chip
                              label="Baixo"
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{item.qtd_minima.toLocaleString("pt-BR")}</TableCell>
                      <TableCell align="right">{formatarMoeda(item.valor_unit)}</TableCell>
                      <TableCell align="right">{formatarMoeda(item.qtd * item.valor_unit)}</TableCell>
                      <TableCell>{new Date(item.data_atualizacao).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    Nenhum item encontrado com os filtros informados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Container>
  );
}
