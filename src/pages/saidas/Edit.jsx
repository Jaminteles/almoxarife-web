import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
  Paper,
  Alert,
  Divider,
  GridLegacy as Grid,
  Box,
  CircularProgress
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import FormPageHeader from "../../components/FormPageHeader";
import ItemSaidaRow from "../../components/ItemSaidaRow";
import { useAuth } from "../../auth/AuthContext";

const API_URL = `${window.location.origin}/api`;

const itemVazio = { id_produto: "", quantidade: "" };

export default function SaidaEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // Usuário restrito: a ORIGEM é fixa no seu almoxarifado.
  const origemTravada =
    user && user.access_level !== "CENTRAL" && user.cod_almoxarifado
      ? user.cod_almoxarifado
      : null;

  const [form, setForm] = useState({
    cod_almoxarifado_origem: "",
    id_funcionario_responsavel: "",
    tipo_saida: "",
    cod_almoxarifado_destino: "",
    observacao: ""
  });
  const [itens, setItens] = useState([{ ...itemVazio }]);

  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Carrega listas + registro EM PARALELO. Assim a tela so renderiza
  // quando tem tudo pronto, sem "piscar" os selects vazios.
  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([
      // Lookup: TODOS os almoxarifados (necessário para o destino de transferência).
      fetch(`${API_URL}/lookups/almoxarifados`).then((r) => r.json()),
      // Lookup de apoio: funciona mesmo para quem não acessa o módulo Funcionários.
      fetch(`${API_URL}/lookups/funcionarios`).then((r) => r.json()),
      fetch(`${API_URL}/produtos`).then((r) => r.json()).catch(() => ({ sucesso: false })),
      fetch(`${API_URL}/saidas/${id}`).then((r) => r.json())
    ])
      .then(([resAlm, resFunc, resProd, resSaida]) => {
        if (resAlm.sucesso) setAlmoxarifados(resAlm.dados);
        if (resFunc.sucesso) setFuncionarios(resFunc.dados);
        if (resProd.sucesso) setProdutos(resProd.dados);

        if (resSaida.sucesso) {
          const s = resSaida.dados;
          setForm({
            cod_almoxarifado_origem: s.cod_almoxarifado_origem ?? "",
            id_funcionario_responsavel: s.id_funcionario_responsavel ?? "",
            tipo_saida: s.tipo_saida ?? "",
            cod_almoxarifado_destino: s.cod_almoxarifado_destino ?? "",
            observacao: s.observacao ?? ""
          });
          // itens vem como [{ id_produto, quantidade }]. Garante ao menos 1 linha.
          setItens(
            s.itens?.length
              ? s.itens.map((it) => ({
                  id_produto: it.id_produto,
                  quantidade: String(it.quantidade)
                }))
              : [{ ...itemVazio }]
          );
        } else {
          setError(resSaida.erro || "Saída não encontrada");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao carregar a saída: " + err.message);
        setLoading(false);
      });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "tipo_saida" && value === "CONSUMO") {
      setForm((prev) => ({ ...prev, tipo_saida: value, cod_almoxarifado_destino: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // === Itens ===
  function handleItemChange(index, campo, valor) {
    setItens((prev) => {
      const novos = [...prev];
      novos[index] = { ...novos[index], [campo]: valor };
      return novos;
    });
  }
  function adicionarItem() {
    setItens((prev) => [...prev, { ...itemVazio }]);
  }
  function removerItem(index) {
    setItens((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const ehTransferencia = form.tipo_saida === "TRANSFERENCIA";

    if (ehTransferencia && !form.cod_almoxarifado_destino) {
      setError("Para transferência, informe o almoxarifado de destino.");
      return;
    }
    if (ehTransferencia && form.cod_almoxarifado_destino === form.cod_almoxarifado_origem) {
      setError("O destino deve ser diferente da origem.");
      return;
    }

    const itensValidos = itens.filter(
      (it) => it.id_produto && Number(it.quantidade) > 0
    );
    if (itensValidos.length === 0) {
      setError("A saída precisa ter ao menos um produto com quantidade maior que zero.");
      return;
    }

    setSaving(true);

    const dados = {
      cod_almoxarifado_origem: form.cod_almoxarifado_origem,
      id_funcionario_responsavel: form.id_funcionario_responsavel,
      tipo_saida: form.tipo_saida,
      cod_almoxarifado_destino: ehTransferencia ? form.cod_almoxarifado_destino : null,
      observacao: form.observacao,
      itens: itensValidos.map((it) => ({
        id_produto: it.id_produto,
        quantidade: Number(it.quantidade)
      }))
    };

    fetch(`${API_URL}/saidas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          navigate("/saidas");
        } else {
          setError(result.erro || "Erro ao atualizar a saída");
        }
        setSaving(false);
      })
      .catch((err) => {
        setError("Erro ao atualizar: " + err.message);
        setSaving(false);
      });
  }

  const ehTransferencia = form.tipo_saida === "TRANSFERENCIA";
  const destinosDisponiveis = almoxarifados.filter(
    (a) => a.cod_almoxarifado !== form.cod_almoxarifado_origem
  );

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <FormPageHeader
        title="Editar Saída"
        subtitle="Altere as informações da saída registrada."
        backTo="/saidas"
      />

      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* === Dados da saida === */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Dados da saída
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="cod_almoxarifado_origem"
                value={form.cod_almoxarifado_origem}
                onChange={handleChange}
                required
                fullWidth
                disabled={!!origemTravada}
                SelectProps={{ displayEmpty: true }}
                helperText={origemTravada ? "Fixo no seu almoxarifado." : undefined}
              >
                <MenuItem value="" disabled>
                  Almoxarifado de origem
                </MenuItem>
                {almoxarifados.map((a) => (
                  <MenuItem key={a.cod_almoxarifado} value={a.cod_almoxarifado}>
                    {a.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="id_funcionario_responsavel"
                value={form.id_funcionario_responsavel}
                onChange={handleChange}
                required
                fullWidth
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>
                  Responsável
                </MenuItem>
                {funcionarios.map((f) => (
                  <MenuItem key={f.id_funcionario} value={f.id_funcionario}>
                    {f.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={ehTransferencia ? 6 : 12}>
              <TextField
                select
                name="tipo_saida"
                value={form.tipo_saida}
                onChange={handleChange}
                required
                fullWidth
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>
                  Tipo de saída
                </MenuItem>
                <MenuItem value="CONSUMO">Consumo</MenuItem>
                <MenuItem value="TRANSFERENCIA">Transferência para outro almoxarifado</MenuItem>
              </TextField>
            </Grid>

            {ehTransferencia && (
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="cod_almoxarifado_destino"
                  value={form.cod_almoxarifado_destino}
                  onChange={handleChange}
                  required
                  fullWidth
                  SelectProps={{ displayEmpty: true }}
                  helperText="Deve ser diferente da origem."
                >
                  <MenuItem value="" disabled>
                    Almoxarifado de destino
                  </MenuItem>
                  {destinosDisponiveis.map((a) => (
                    <MenuItem key={a.cod_almoxarifado} value={a.cod_almoxarifado}>
                      {a.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                name="observacao"
                label="Observação"
                value={form.observacao}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* === Itens === */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Produtos
            </Typography>
            <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={adicionarItem}>
              Adicionar
            </Button>
          </Box>

          <Stack spacing={1.5}>
            {itens.map((item, i) => (
              <ItemSaidaRow
                key={i}
                item={item}
                index={i}
                produtos={produtos}
                onChange={handleItemChange}
                onRemove={removerItem}
                disableRemove={itens.length === 1}
              />
            ))}
          </Stack>

          {/* === Acoes === */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
