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
import ItemSaidaRow from "../../components/ItemSaidaRow";

const API_URL = "http://localhost:5000/api";
const formVazio = {
  cod_almoxarifado_origem: "",
  id_funcionario_responsavel: "",
  tipo_saida: "",
  cod_almoxarifado_destino: "",
  observacao: ""
};

const itemVazio = { id_produto: "", quantidade: "" };

export default function SaidaForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...formVazio });
  const [itens, setItens] = useState([{ ...itemVazio }]);

  // Listas dos selects.
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  // Produtos disponíveis = estoque do almoxarifado de ORIGEM selecionado.
  const [estoqueOrigem, setEstoqueOrigem] = useState([]);

  const [loading, setLoading] = useState(true); // carregando as listas
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Carrega as listas fixas EM PARALELO ao montar a tela.
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/almoxarifados`).then((r) => r.json()),
      fetch(`${API_URL}/funcionarios`).then((r) => r.json())
    ])
      .then(([resAlm, resFunc]) => {
        if (resAlm.sucesso) setAlmoxarifados(resAlm.dados);
        if (resFunc.sucesso) setFuncionarios(resFunc.dados);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao carregar os dados do formulário: " + err.message);
        setLoading(false);
      });
  }, []);

  // Quando o almoxarifado de origem muda, busca o estoque dele para listar
  // só os produtos que existem nesse almoxarifado (com a qtd. disponível).
  useEffect(() => {
    if (!form.cod_almoxarifado_origem) {
      setEstoqueOrigem([]);
      return;
    }
    fetch(`${API_URL}/almoxarifados/${form.cod_almoxarifado_origem}/estoque`)
      .then((r) => r.json())
      .then((result) => {
        setEstoqueOrigem(result.sucesso && Array.isArray(result.dados) ? result.dados : []);
      })
      .catch(() => setEstoqueOrigem([]));
  }, [form.cod_almoxarifado_origem]);

  // Produtos disponíveis no formato esperado pelo ItemSaidaRow, com a
  // quantidade em estoque (para limitar a quantidade da saída).
  const produtosDisponiveis = estoqueOrigem.map((e) => ({
    id_produto: e.id_produto,
    nome: e.produto,
    disponivel: Number(e.qtd) || 0
  }));

  function handleChange(e) {
    const { name, value } = e.target;

    // Ao trocar a origem, os produtos disponíveis mudam — zera os itens.
    if (name === "cod_almoxarifado_origem") {
      setForm((prev) => ({ ...prev, cod_almoxarifado_origem: value }));
      setItens([{ ...itemVazio }]);
      return;
    }

    // Ao voltar para CONSUMO, zera o destino (consumo nao tem destino).
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

    // Validacoes de front (o backend revalida + checa estoque, RF017).
    if (ehTransferencia && !form.cod_almoxarifado_destino) {
      setError("Para transferência, informe o almoxarifado de destino.");
      return;
    }
    if (ehTransferencia && form.cod_almoxarifado_destino === form.cod_almoxarifado_origem) {
      setError("O destino deve ser diferente da origem.");
      return;
    }

    // So manda itens preenchidos (produto + quantidade > 0).
    const itensValidos = itens.filter(
      (it) => it.id_produto && Number(it.quantidade) > 0
    );
    if (itensValidos.length === 0) {
      setError("Adicione ao menos um produto com quantidade maior que zero.");
      return;
    }

    // A quantidade de saída não pode ultrapassar o saldo do almoxarifado.
    for (const it of itensValidos) {
      const disp = produtosDisponiveis.find(
        (p) => Number(p.id_produto) === Number(it.id_produto)
      );
      if (!disp) {
        setError("Há um produto que não existe no almoxarifado de origem.");
        return;
      }
      if (Number(it.quantidade) > disp.disponivel) {
        setError(
          `Quantidade da saída (${it.quantidade}) maior que o disponível para "${disp.nome}" (${disp.disponivel}).`
        );
        return;
      }
    }

    setSaving(true);

    const dados = {
      cod_almoxarifado_origem: form.cod_almoxarifado_origem,
      id_funcionario_responsavel: form.id_funcionario_responsavel,
      tipo_saida: form.tipo_saida,
      // Consumo nao tem destino -> envia null.
      cod_almoxarifado_destino: ehTransferencia ? form.cod_almoxarifado_destino : null,
      observacao: form.observacao,
      itens: itensValidos.map((it) => ({
        id_produto: it.id_produto,
        quantidade: Number(it.quantidade)
      }))
    };

    fetch(`${API_URL}/saidas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          navigate("/saidas");
        } else {
          setError(result.erro || "Erro ao registrar a saída");
        }
        setSaving(false);
      })
      .catch((err) => {
        setError("Erro ao registrar: " + err.message);
        setSaving(false);
      });
  }

  const ehTransferencia = form.tipo_saida === "TRANSFERENCIA";
  // Destino nunca pode ser a origem (CHECK do banco) -> filtra a lista.
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
        title="Registrar Saída"
        subtitle="Registre a saída de materiais do estoque."
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
                SelectProps={{ displayEmpty: true }}
              >
                {/* Opcao-placeholder com o nome do campo: aparece por padrao
                    (displayEmpty), deixa a caixa "estendida" e e disabled,
                    entao nao pode ser escolhida para concluir o cadastro. */}
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

            {/* Destino so aparece em transferencia. */}
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

          {!form.cod_almoxarifado_origem && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Selecione o almoxarifado de origem para listar os produtos disponíveis.
            </Typography>
          )}

          <Stack spacing={1.5}>
            {itens.map((item, i) => (
              <ItemSaidaRow
                key={i}
                item={item}
                index={i}
                produtos={produtosDisponiveis}
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
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
