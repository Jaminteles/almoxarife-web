import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Grid,
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
  Alert,
  Tabs,
  Tab
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import BadgeIcon from "@mui/icons-material/Badge";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PaidIcon from "@mui/icons-material/Paid";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import FormPageHeader from "../../components/FormPageHeader";
import SummaryCard from "../../components/SummaryCard";

/**
 * Tela de Detalhes / Financeiro de um Funcionário específico.
 *
 * O QUE ESTA TELA RESOLVE
 * -----------------------
 * É aberta quando o usuário clica em uma linha da listagem de funcionários
 * (funcionarios/List.jsx). A rota é /funcionarios/:id.
 *
 * Mostra, para AQUELE funcionário:
 *   - Os dados cadastrais (nome, CPF, cargo, email, status, admissão).
 *   - Um resumo financeiro em 4 cards (salário base, horas no mês,
 *     faltas/atrasos no mês, líquido do último pagamento).
 *   - Duas abas:
 *       • "Ponto"      → registro de ponto (entradas/saídas e horas).
 *       • "Financeiro" → histórico de pagamentos / holerites.
 *
 * POR QUE ESTE LAYOUT (e não outro)?
 * ----------------------------------
 * É exatamente o mesmo esqueleto de almoxarifados/Detalhes.jsx
 * (cabeçalho → card de dados → SummaryCards → tabela). Reaproveitar o
 * padrão que já existe deixa o sistema visualmente coerente e evita
 * inventar componentes novos. A diferença é que aqui há DOIS conjuntos
 * de dados distintos (ponto e financeiro), então usei Tabs para separá-los
 * sem poluir a tela.
 *
 * POR QUE Table DIRETO (e não ListTemplate)?
 * ------------------------------------------
 * O ListTemplate é para listagens CRUD (com botões Novo/Editar/Inativar).
 * Aqui é consulta read-only, igual à tela de detalhes do almoxarifado.
 *
 * SOBRE OS DADOS MOCADOS
 * ----------------------
 * O banco atual (CREATE_DB_ALMOXARIFADO_GILFER.sql) só tem as tabelas
 * Funcionarios, Cargos e Usuarios_Sistema — NÃO existe tabela de ponto
 * nem de salário/pagamento. Como esta entrega é só front-end, os dados
 * de ponto e financeiro são mocados. Cada ponto de integração está
 * marcado com // TODO indicando qual endpoint plugar quando o backend
 * dessas funcionalidades existir.
 */

// Formata um número como moeda BRL: 3500 -> "R$ 3.500,00"
function formatarMoeda(valor) {
  return (valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Formata CPF: "12345678901" -> "123.456.789-01"
function formatarCpf(cpf) {
  if (!cpf || cpf.length !== 11) return cpf || "—";
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

// ─────────────────────────────────────────────────────────────────────
// MOCK: substituir por GET /api/funcionarios/:id (+ /ponto e /financeiro)
// quando o backend dessas funcionalidades existir.
//
// As chaves do objeto seriam os UUIDs reais (id_funcionario). Como não
// dá para prever quais UUIDs o backend vai mandar, há um fallback logo
// abaixo (gerarMockGenerico) que monta dados plausíveis para QUALQUER id,
// garantindo que a tela nunca quebre ao clicar num funcionário real.
// ─────────────────────────────────────────────────────────────────────
const MOCK_FUNCIONARIOS = {
  "1": {
    id_funcionario: "1",
    nome: "João Gabriel Silva",
    cpf: "12345678901",
    cargo: "Almoxarife",
    email: "joao.silva@gilferreira.com.br",
    is_active: 1,
    admissao: "2023-03-01",
    salario_base: 2800,
    ponto: [
      { data: "2026-05-26", entrada: "07:58", saida: "17:05", horas: "8:07", status: "Normal" },
      { data: "2026-05-25", entrada: "08:12", saida: "17:00", horas: "7:48", status: "Atraso" },
      { data: "2026-05-24", entrada: "—", saida: "—", horas: "0:00", status: "Falta" },
      { data: "2026-05-23", entrada: "07:55", saida: "17:10", horas: "8:15", status: "Normal" },
      { data: "2026-05-22", entrada: "08:00", saida: "17:02", horas: "8:02", status: "Normal" }
    ],
    financeiro: [
      { mes: "Maio/2026", base: 2800, extras: 180, descontos: 320, liquido: 2660, status: "Pendente" },
      { mes: "Abril/2026", base: 2800, extras: 0, descontos: 308, liquido: 2492, status: "Pago" },
      { mes: "Março/2026", base: 2800, extras: 220, descontos: 330, liquido: 2690, status: "Pago" }
    ]
  }
};

// Gera dados de ponto/financeiro plausíveis para um id qualquer.
// Usado quando o id clicado não está no MOCK acima (caso real do backend).
function gerarMockGenerico(id) {
  return {
    id_funcionario: id,
    nome: "Funcionário",
    cpf: "",
    cargo: "—",
    email: "—",
    is_active: 1,
    admissao: null,
    salario_base: 2500,
    ponto: [
      { data: "2026-05-26", entrada: "08:00", saida: "17:00", horas: "8:00", status: "Normal" },
      { data: "2026-05-25", entrada: "08:05", saida: "17:00", horas: "7:55", status: "Atraso" },
      { data: "2026-05-24", entrada: "08:00", saida: "17:00", horas: "8:00", status: "Normal" }
    ],
    financeiro: [
      { mes: "Maio/2026", base: 2500, extras: 0, descontos: 275, liquido: 2225, status: "Pendente" },
      { mes: "Abril/2026", base: 2500, extras: 100, descontos: 275, liquido: 2325, status: "Pago" }
    ]
  };
}

// Cor do Chip de status do ponto.
function corStatusPonto(status) {
  if (status === "Normal") return { bg: "rgba(16,185,129,0.15)", color: "#10b981" };
  if (status === "Atraso") return { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" };
  return { bg: "rgba(239,68,68,0.15)", color: "#ef4444" }; // Falta
}

// Cor do Chip de status do pagamento.
function corStatusPagamento(status) {
  return status === "Pago"
    ? { bg: "rgba(16,185,129,0.15)", color: "#10b981" }
    : { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" };
}

export default function FuncionarioDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [funcionario, setFuncionario] = useState(null);
  const [aba, setAba] = useState(0); // 0 = Ponto, 1 = Financeiro
  const [error, setError] = useState("");

  // Filtros do ponto (mês de referência). Read-only por enquanto: o filtro
  // só re-renderiza o mock; o filtro real iria no fetch (ver TODO).
  const [filtroMesPonto, setFiltroMesPonto] = useState("");

  useEffect(() => {
    setError("");

    // TODO: trocar por fetch quando o backend existir:
    // fetch(`${API_URL}/funcionarios/${id}`)            -> dados + cargo + email
    // fetch(`${API_URL}/funcionarios/${id}/ponto`)      -> registros de ponto
    // fetch(`${API_URL}/funcionarios/${id}/financeiro`) -> holerites/pagamentos
    //   .then(res => res.json())
    //   .then(result => { ... setFuncionario(result.dados) ... });

    const dados = MOCK_FUNCIONARIOS[id] || gerarMockGenerico(id);
    if (!dados) {
      setError("Funcionário não encontrado.");
      return;
    }
    setFuncionario(dados);
  }, [id]);

  // ── Estados de erro / carregando ──
  if (error) {
    return (
      <Container maxWidth="lg">
        <FormPageHeader title="Funcionário" backTo="/funcionarios" />
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  if (!funcionario) {
    return (
      <Container maxWidth="lg">
        <FormPageHeader title="Funcionário" backTo="/funcionarios" />
        <Typography color="text.secondary">Carregando...</Typography>
      </Container>
    );
  }

  // ── Métricas derivadas para os SummaryCards ──
  // Calculadas a partir do mock; com backend, viriam prontas ou seriam
  // calculadas do mesmo jeito sobre os dados reais.
  const faltas = funcionario.ponto.filter((p) => p.status === "Falta").length;
  const atrasos = funcionario.ponto.filter((p) => p.status === "Atraso").length;

  // Soma simples das horas "h:mm" do mês (apenas para exibição no card).
  const totalMinutos = funcionario.ponto.reduce((acc, p) => {
    const [h, m] = (p.horas || "0:00").split(":").map(Number);
    return acc + (h * 60 + (m || 0));
  }, 0);
  const horasMes = `${Math.floor(totalMinutos / 60)}h ${totalMinutos % 60}min`;

  const ultimoPagamento = funcionario.financeiro[0]; // mais recente primeiro

  // Aplica o filtro de mês ao ponto (só sobre o mock, ver TODO acima).
  const pontoFiltrado = filtroMesPonto
    ? funcionario.ponto.filter((p) => p.data.startsWith(filtroMesPonto))
    : funcionario.ponto;

  return (
    <Container maxWidth="lg">
      {/* === BLOCO 1: Cabeçalho com botão voltar === */}
      <FormPageHeader
        title={funcionario.nome}
        subtitle="Ponto e financeiro do funcionário."
        backTo="/funcionarios"
      />

      {/* === BLOCO 2: Card de dados cadastrais === */}
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "rgba(6,182,212,0.13)",
                color: "#06b6d4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <BadgeIcon />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Dados do funcionário
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={funcionario.is_active === 1 ? "Ativo" : "Inativo"}
              color={funcionario.is_active === 1 ? "success" : "default"}
              size="small"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/funcionarios/${id}/editar`)}
            >
              Editar
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">CPF</Typography>
            <Typography variant="body2">{formatarCpf(funcionario.cpf)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">Cargo</Typography>
            <Typography variant="body2">{funcionario.cargo || "—"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body2">{funcionario.email || "—"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="caption" color="text.secondary">Admissão</Typography>
            <Typography variant="body2">
              {funcionario.admissao
                ? new Date(funcionario.admissao).toLocaleDateString("pt-BR")
                : "—"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* === BLOCO 3: Resumo financeiro (4 cards) ===
          Reaproveita o SummaryCard do dashboard. Mesma paleta de cores
          do resto do sistema. */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<AttachMoneyIcon />}
            color="#10b981"
            value={formatarMoeda(funcionario.salario_base)}
            label="Salário base"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<AccessTimeIcon />}
            color="#3b82f6"
            value={horasMes}
            label="Horas trabalhadas (mês)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<EventBusyIcon />}
            color="#f59e0b"
            value={`${faltas} faltas / ${atrasos} atrasos`}
            label="Ocorrências no mês"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<PaidIcon />}
            color="#a78bfa"
            value={formatarMoeda(ultimoPagamento?.liquido)}
            label={`Líquido — ${ultimoPagamento?.mes || "—"}`}
          />
        </Grid>
      </Grid>

      {/* === BLOCO 4: Abas Ponto / Financeiro === */}
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Tabs
          value={aba}
          onChange={(_, novaAba) => setAba(novaAba)}
          sx={{ mb: 2.5 }}
        >
          <Tab icon={<AccessTimeIcon fontSize="small" />} iconPosition="start" label="Ponto" />
          <Tab icon={<ReceiptLongIcon fontSize="small" />} iconPosition="start" label="Financeiro" />
        </Tabs>

        {/* ───── ABA PONTO ───── */}
        {aba === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Registros de entrada e saída do funcionário. Filtre pelo mês de referência.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mb: 2.5 }}
              alignItems={{ sm: "center" }}
            >
              <TextField
                label="Mês de referência"
                type="month"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filtroMesPonto}
                onChange={(e) => setFiltroMesPonto(e.target.value)}
              />
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => { /* TODO: refazer fetch do ponto com o filtro de mês */ }}
                sx={{ whiteSpace: "nowrap" }}
              >
                Buscar
              </Button>
              <Button
                variant="text"
                onClick={() => setFiltroMesPonto("")}
                sx={{ whiteSpace: "nowrap" }}
              >
                Limpar
              </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Data</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Entrada</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Saída</TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Horas</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pontoFiltrado.length ? (
                    pontoFiltrado.map((p, i) => {
                      const c = corStatusPonto(p.status);
                      return (
                        <TableRow key={i} hover>
                          <TableCell>
                            {new Date(p.data).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>{p.entrada}</TableCell>
                          <TableCell>{p.saida}</TableCell>
                          <TableCell align="right">{p.horas}</TableCell>
                          <TableCell>
                            <Chip
                              label={p.status}
                              size="small"
                              sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                        Nenhum registro de ponto encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}

        {/* ───── ABA FINANCEIRO ───── */}
        {aba === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Histórico de pagamentos (holerites) do funcionário.
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Mês de referência</TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Salário base</TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Horas extras</TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Descontos</TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Líquido</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {funcionario.financeiro.length ? (
                    funcionario.financeiro.map((f, i) => {
                      const c = corStatusPagamento(f.status);
                      return (
                        <TableRow key={i} hover>
                          <TableCell>{f.mes}</TableCell>
                          <TableCell align="right">{formatarMoeda(f.base)}</TableCell>
                          <TableCell align="right">{formatarMoeda(f.extras)}</TableCell>
                          <TableCell align="right">- {formatarMoeda(f.descontos)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatarMoeda(f.liquido)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={f.status}
                              size="small"
                              sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                        Nenhum pagamento registrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
