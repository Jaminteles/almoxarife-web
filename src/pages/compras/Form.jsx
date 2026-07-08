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
import { useNavigate } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import FormPageHeader from "../../components/FormPageHeader";
import ItemCompraRow from "../../components/ItemCompraRow";
import { useAuth } from "../../auth/AuthContext";

const API_URL = `${window.location.origin}/api`;

// Campos EXATAMENTE como o compra.service.js (montarDadosCompra) espera.
// Sem "status" aqui: na criação o backend força "PENDENTE" automaticamente (RF021).
const formVazio = {
  id_fornecedor: "",
  id_funcionario_comprador: "",
  cod_almoxarifado_destino: "",
  numero_nota_fiscal: "",
  data_compra: ""
};

const itemVazio = { id_produto: "", quantidade: "", valor_unitario: "" };

export default function CompraForm() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Usuário restrito: o DESTINO é fixo no seu almoxarifado.
  const destinoTravado =
    user && user.access_level !== "CENTRAL" && user.cod_almoxarifado
      ? user.cod_almoxarifado
      : null;

  const [form, setForm] = useState({ ...formVazio });
  const [itens, setItens] = useState([{ ...itemVazio }]);

  // Listas que alimentam os selects.
  const [fornecedores, setFornecedores] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sincroniza o destino sempre que destinoTravado mudar.
  useEffect(() => {
    if (!destinoTravado) return;
    setForm((prev) =>
      prev.cod_almoxarifado_destino === destinoTravado
        ? prev
        : { ...prev, cod_almoxarifado_destino: destinoTravado }
    );
  }, [destinoTravado]);

  // Carrega as 4 listas EM PARALELO (Promise.all) ao montar a tela.
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/fornecedores`).then((r) => r.json()),
      // Lookup de apoio: funciona mesmo para quem não acessa o módulo Funcionários.
      fetch(`${API_URL}/lookups/funcionarios`).then((r) => r.json()),
      fetch(`${API_URL}/almoxarifados`).then((r) => r.json()),
      // produtos pode ainda não ter seed; o catch evita derrubar o resto.
      fetch(`${API_URL}/produtos`)
        .then((r) => r.json())
        .catch(() => ({ sucesso: false }))
    ])
      .then(([resForn, resFunc, resAlm, resProd]) => {
        if (resForn.sucesso) setFornecedores(resForn.dados);
        if (resFunc.sucesso) setFuncionarios(resFunc.dados);
        if (resAlm.sucesso) setAlmoxarifados(resAlm.dados);
        if (resProd.sucesso) setProdutos(resProd.dados);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao carregar os dados do formulário: " + err.message);
        setLoading(false);
      });
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    // Ao trocar o fornecedor, os produtos disponíveis mudam — zera os itens
    // para não deixar produto de outro fornecedor selecionado.
    if (name === "id_fornecedor") {
      setForm((prev) => ({ ...prev, id_fornecedor: value }));
      setItens([{ ...itemVazio }]);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Só os produtos vinculados ao fornecedor selecionado podem ser comprados.
  const produtosDoFornecedor = form.id_fornecedor
    ? produtos.filter((p) =>
        (p.fornecedores || []).some(
          (f) => Number(f.id_fornecedor) === Number(form.id_fornecedor)
        )
      )
    : [];

  // === Itens ===
  function handleItemChange(index, campo, valor) {
    setItens((prev) => {
      const novos = [...prev];
      novos[index] = { ...novos[index], [campo]: valor };
      // Ao escolher o produto, preenche o valor unitário automaticamente com o
      // preço de custo do produto (o usuário não define o valor manualmente).
      if (campo === "id_produto") {
        const produto = produtos.find(
          (p) => Number(p.id_produto) === Number(valor)
        );
        novos[index].valor_unitario = produto ? Number(produto.preco_custo) : "";
      }
      return novos;
    });
  }
  function adicionarItem() {
    setItens((prev) => [...prev, { ...itemVazio }]);
  }
  function removerItem(index) {
    setItens((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validação mínima no front (o backend revalida tudo de qualquer forma).
    const itensValidos = itens.filter(
      (it) => it.id_produto && it.quantidade && it.valor_unitario
    );
    if (itensValidos.length === 0) {
      setError("Adicione ao menos um item com produto, quantidade e valor.");
      return;
    }

    setSaving(true);
    const payload = { ...form, itens: itensValidos };

    fetch(`${API_URL}/compras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          navigate("/compras");
        } else {
          setError(result.erro || "Erro ao registrar a compra");
          setSaving(false);
        }
      })
      .catch((err) => {
        setError("Erro ao salvar: " + err.message);
        setSaving(false);
      });
  }

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
        title="Registrar Compra"
        subtitle="Registre um novo pedido de compra de materiais."
        backTo="/compras"
      />

      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Dados da compra
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="id_fornecedor"
                value={form.id_fornecedor}
                onChange={handleChange}
                required
                fullWidth
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>
                  Selecione o fornecedor
                </MenuItem>
                {fornecedores.map((f) => (
                  <MenuItem key={f.id_fornecedor} value={f.id_fornecedor}>
                    {f.razao_social || f.nome_fantasia}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="id_funcionario_comprador"
                value={form.id_funcionario_comprador}
                onChange={handleChange}
                required
                fullWidth
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>
                  Selecione o funcionário comprador
                </MenuItem>
                {funcionarios.map((f) => (
                  <MenuItem key={f.id_funcionario} value={f.id_funcionario}>
                    {f.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="cod_almoxarifado_destino"
                value={form.cod_almoxarifado_destino}
                onChange={handleChange}
                required
                fullWidth
                disabled={!!destinoTravado}
                SelectProps={{ displayEmpty: true }}
                helperText={destinoTravado ? "Fixo no seu almoxarifado." : undefined}
              >
                <MenuItem value="" disabled>
                  Selecione o destino
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
                name="numero_nota_fiscal"
                label="Nota Fiscal"
                value={form.numero_nota_fiscal}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="data_compra"
                label="Data da compra"
                type="date"
                value={form.data_compra}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* === Itens da compra === */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Itens da compra
            </Typography>
            <Button
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              onClick={adicionarItem}
            >
              Adicionar
            </Button>
          </Box>

          {!form.id_fornecedor && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Selecione um fornecedor para listar os produtos disponíveis.
            </Typography>
          )}

          <Stack spacing={1.5}>
            {itens.map((item, i) => (
              <ItemCompraRow
                key={i}
                item={item}
                index={i}
                produtos={produtosDoFornecedor}
                onChange={handleItemChange}
                onRemove={removerItem}
                disableRemove={itens.length === 1}
                valorReadOnly
              />
            ))}
          </Stack>

          {/* === Ações === */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
