import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { NIVEIS, ROTULO_NIVEL } from "../../auth/permissions";

const API_URL = "http://localhost:5000/api";

const CORES_STATUS = { PENDENTE: "warning", APROVADO: "success", REJEITADO: "default" };

function formatarCpf(cpf) {
  if (!cpf || cpf.length !== 11) return cpf || "—";
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}
function formatarData(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

export default function SolicitacoesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("PENDENTE");

  // Listas de apoio para a aprovação.
  const [cargos, setCargos] = useState([]);
  const [almoxarifados, setAlmoxarifados] = useState([]);

  // Diálogo de aprovação.
  const [openAprovar, setOpenAprovar] = useState(false);
  const [alvo, setAlvo] = useState(null);
  const [aprovacao, setAprovacao] = useState({ access_level: "CONSULTA", id_cargo: "", cod_almoxarifado: "" });
  const [processando, setProcessando] = useState(false);

  // Diálogo de rejeição.
  const [openRejeitar, setOpenRejeitar] = useState(false);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    carregar(statusFiltro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFiltro]);

  useEffect(() => {
    // Carrega cargos e almoxarifados uma vez (para o diálogo de aprovação).
    Promise.all([
      fetch(`${API_URL}/cargos`).then((r) => r.json()).catch(() => ({ sucesso: false })),
      fetch(`${API_URL}/almoxarifados`).then((r) => r.json()).catch(() => ({ sucesso: false })),
    ]).then(([resCargos, resAlm]) => {
      if (resCargos.sucesso) setCargos(resCargos.dados);
      if (resAlm.sucesso) setAlmoxarifados(resAlm.dados);
    });
  }, []);

  function carregar(status) {
    setLoading(true);
    setError("");
    const url = status ? `${API_URL}/solicitacoes?status=${status}` : `${API_URL}/solicitacoes`;
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.sucesso) setData(json.dados);
        else setError(json.erro || "Erro ao carregar solicitações");
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao conectar: " + err.message);
        setLoading(false);
      });
  }

  // ── Aprovação ──
  function abrirAprovar(item) {
    setAlvo(item);
    setAprovacao({ access_level: "CONSULTA", id_cargo: "", cod_almoxarifado: "" });
    setError("");
    setOpenAprovar(true);
  }
  function confirmarAprovar() {
    setProcessando(true);
    setError("");
    fetch(`${API_URL}/solicitacoes/${alvo.id_solicitacao}/aprovar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aprovacao),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.sucesso) {
          setSucesso(`Conta de ${alvo.nome} criada com sucesso.`);
          setOpenAprovar(false);
          carregar(statusFiltro);
        } else {
          setError(json.erro || "Erro ao aprovar");
        }
        setProcessando(false);
      })
      .catch((err) => {
        setError("Erro ao aprovar: " + err.message);
        setProcessando(false);
      });
  }

  // ── Rejeição ──
  function abrirRejeitar(item) {
    setAlvo(item);
    setMotivo("");
    setError("");
    setOpenRejeitar(true);
  }
  function confirmarRejeitar() {
    setProcessando(true);
    setError("");
    fetch(`${API_URL}/solicitacoes/${alvo.id_solicitacao}/rejeitar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.sucesso) {
          setSucesso(`Solicitação de ${alvo.nome} rejeitada.`);
          setOpenRejeitar(false);
          carregar(statusFiltro);
        } else {
          setError(json.erro || "Erro ao rejeitar");
        }
        setProcessando(false);
      })
      .catch((err) => {
        setError("Erro ao rejeitar: " + err.message);
        setProcessando(false);
      });
  }

  const exigeAlmoxarifado = aprovacao.access_level !== "CENTRAL";

  return (
    <Container maxWidth={false} disableGutters>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {sucesso && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSucesso("")}>{sucesso}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>Solicitações de acesso</Typography>
            <Typography variant="body2" color="text.secondary">
              Aprove ou rejeite pedidos de criação de conta.
            </Typography>
          </Box>
          <TextField
            select
            label="Status"
            size="small"
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="PENDENTE">Pendentes</MenuItem>
            <MenuItem value="APROVADO">Aprovadas</MenuItem>
            <MenuItem value="REJEITADO">Rejeitadas</MenuItem>
            <MenuItem value="">Todas</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                {["Nome", "Email", "CPF", "Data", "Mensagem", "Status"].map((c) => (
                  <TableCell key={c} sx={{ color: "text.secondary", fontWeight: 600 }}>{c}</TableCell>
                ))}
                <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>Carregando...</TableCell></TableRow>
              ) : data.length ? (
                data.map((s) => (
                  <TableRow key={s.id_solicitacao} hover>
                    <TableCell>{s.nome}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{formatarCpf(s.cpf)}</TableCell>
                    <TableCell>{formatarData(s.data_solicitacao)}</TableCell>
                    <TableCell sx={{ maxWidth: 220, whiteSpace: "normal" }}>{s.mensagem || "—"}</TableCell>
                    <TableCell><Chip label={s.status} size="small" color={CORES_STATUS[s.status] || "default"} /></TableCell>
                    <TableCell align="right">
                      {s.status === "PENDENTE" ? (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Aprovar">
                            <IconButton size="small" sx={{ color: "success.main" }} onClick={() => abrirAprovar(s)}>
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeitar">
                            <IconButton size="small" sx={{ color: "error.main" }} onClick={() => abrirRejeitar(s)}>
                              <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {s.motivo_rejeicao ? `Motivo: ${s.motivo_rejeicao}` : "—"}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>Nenhuma solicitação encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Diálogo de aprovação */}
      <Dialog open={openAprovar} onClose={() => !processando && setOpenAprovar(false)} fullWidth maxWidth="xs">
        <DialogTitle>Aprovar acesso de {alvo?.nome}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Nível de acesso"
              value={aprovacao.access_level}
              onChange={(e) => setAprovacao((p) => ({ ...p, access_level: e.target.value }))}
              fullWidth
            >
              {NIVEIS.map((n) => (
                <MenuItem key={n} value={n}>{ROTULO_NIVEL[n] || n}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Cargo"
              value={aprovacao.id_cargo}
              onChange={(e) => setAprovacao((p) => ({ ...p, id_cargo: e.target.value }))}
              fullWidth
              required
            >
              <MenuItem value="" disabled>Selecione o cargo</MenuItem>
              {cargos.map((c) => (
                <MenuItem key={c.id_cargo} value={c.id_cargo}>{c.nome_cargo}</MenuItem>
              ))}
            </TextField>

            {exigeAlmoxarifado && (
              <TextField
                select
                label="Almoxarifado"
                helperText="Usuário não-central fica restrito a este almoxarifado."
                value={aprovacao.cod_almoxarifado}
                onChange={(e) => setAprovacao((p) => ({ ...p, cod_almoxarifado: e.target.value }))}
                fullWidth
                required
              >
                <MenuItem value="" disabled>Selecione o almoxarifado</MenuItem>
                {almoxarifados.map((a) => (
                  <MenuItem key={a.cod_almoxarifado} value={a.cod_almoxarifado}>{a.nome}</MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAprovar(false)} disabled={processando}>Cancelar</Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmarAprovar}
            disabled={processando || !aprovacao.id_cargo || (exigeAlmoxarifado && !aprovacao.cod_almoxarifado)}
          >
            {processando ? "Aprovando..." : "Aprovar e criar conta"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de rejeição */}
      <Dialog open={openRejeitar} onClose={() => !processando && setOpenRejeitar(false)} fullWidth maxWidth="xs">
        <DialogTitle>Rejeitar solicitação de {alvo?.nome}</DialogTitle>
        <DialogContent>
          <TextField
            label="Motivo (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejeitar(false)} disabled={processando}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmarRejeitar} disabled={processando}>
            {processando ? "Rejeitando..." : "Rejeitar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
