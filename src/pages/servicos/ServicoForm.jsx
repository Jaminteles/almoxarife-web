import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Container, Divider, GridLegacy as Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useNavigate } from "react-router-dom";
import FormPageHeader from "../../components/FormPageHeader";
import ItemCompraRow from "../../components/ItemCompraRow";

const API_URL = `${window.location.origin}/api`;
const itemVazio = { id_produto: "", quantidade: "", valor_unitario: "", automatico: false };
const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const paraInput = (valor) => { const d = new Date(valor); return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

export default function ServicoForm({ id = null }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id_fornecedor: "", id_funcionario_responsavel: "", data_servico: hoje(), aplicacao: "", observacao: "" });
  const [itens, setItens] = useState([{ ...itemVazio }]);
  const [fornecedores, setFornecedores] = useState([]), [funcionarios, setFuncionarios] = useState([]), [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState("");

  useEffect(() => {
    const requisicoes = [fetch(`${API_URL}/fornecedores`).then((r) => r.json()), fetch(`${API_URL}/lookups/funcionarios`).then((r) => r.json()), fetch(`${API_URL}/produtos`).then((r) => r.json())];
    if (id) requisicoes.push(fetch(`${API_URL}/servicos/${id}`).then((r) => r.json()));
    Promise.all(requisicoes).then(([resForn, resFunc, resProd, resServico]) => {
      if (resForn.sucesso) setFornecedores(resForn.dados);
      if (resFunc.sucesso) setFuncionarios(resFunc.dados);
      if (resProd.sucesso) setProdutos(resProd.dados);
      if (id) {
        if (!resServico?.sucesso) throw new Error(resServico?.erro || "Serviço não encontrado");
        const s = resServico.dados;
        setForm({ id_fornecedor: s.id_fornecedor || "", id_funcionario_responsavel: s.id_funcionario_responsavel || "", data_servico: paraInput(s.data_servico), aplicacao: s.aplicacao || "", observacao: s.observacao || "" });
        setItens(s.itens?.length ? s.itens.map((i) => ({ id_produto: i.id_produto, quantidade: String(i.quantidade), valor_unitario: String(i.valor_unitario), automatico: false })) : [{ ...itemVazio }]);
      }
      setLoading(false);
    }).catch((err) => { setError(`Erro ao carregar os dados: ${err.message}`); setLoading(false); });
  }, [id]);

  const alterarItem = (index, campo, valor) => setItens((atual) => atual.map((item, i) => {
    if (i !== index) return item;
    const proximo = { ...item, [campo]: valor };
    if (campo === "id_produto" && proximo.automatico) {
      const produto = produtos.find((p) => Number(p.id_produto) === Number(valor));
      proximo.valor_unitario = produto ? String(produto.preco_custo ?? 0) : "";
    }
    return proximo;
  }));
  const alternarPrecoAutomatico = (index) => setItens((atual) => atual.map((item, i) => {
    if (i !== index) return item;
    const automatico = !item.automatico;
    const produto = produtos.find((p) => Number(p.id_produto) === Number(item.id_produto));
    return { ...item, automatico, valor_unitario: automatico && produto ? String(produto.preco_custo ?? 0) : item.valor_unitario };
  }));
  const removerItem = (index) => setItens((atual) => atual.length === 1 ? atual : atual.filter((_, i) => i !== index));
  function salvar(e) {
    e.preventDefault(); setError("");
    const itensValidos = itens.filter((i) => i.id_produto && Number(i.quantidade) > 0 && i.valor_unitario !== "" && Number(i.valor_unitario) >= 0);
    if (!itensValidos.length) return setError("Informe ao menos um produto, quantidade e valor.");
    setSaving(true);
    fetch(`${API_URL}/servicos${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, itens: itensValidos }) })
      .then((r) => r.json()).then((res) => { if (!res.sucesso) throw new Error(res.erro || "Não foi possível salvar o serviço"); navigate("/servicos"); })
      .catch((err) => { setError(err.message); setSaving(false); });
  }
  if (loading) return <Container maxWidth="md"><Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box></Container>;
  return <Container maxWidth="md">
    <FormPageHeader title={id ? "Editar Serviço" : "Registrar Serviço"} subtitle="Registre materiais fornecidos diretamente, sem movimentar o estoque." backTo="/servicos" />
    <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <form onSubmit={salvar}><Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Dados do serviço</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField select name="id_fornecedor" value={form.id_fornecedor} onChange={(e) => setForm({ ...form, id_fornecedor: e.target.value })} required fullWidth SelectProps={{ displayEmpty: true }}><MenuItem value="" disabled>Selecione o fornecedor</MenuItem>{fornecedores.map((f) => <MenuItem key={f.id_fornecedor} value={f.id_fornecedor}>{f.razao_social || f.nome_fantasia}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} sm={6}><TextField select name="id_funcionario_responsavel" value={form.id_funcionario_responsavel} onChange={(e) => setForm({ ...form, id_funcionario_responsavel: e.target.value })} required fullWidth SelectProps={{ displayEmpty: true }}><MenuItem value="" disabled>Selecione o responsável</MenuItem>{funcionarios.map((f) => <MenuItem key={f.id_funcionario} value={f.id_funcionario}>{f.nome}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} sm={6}><TextField name="data_servico" label="Data do serviço" type="date" value={form.data_servico} onChange={(e) => setForm({ ...form, data_servico: e.target.value })} required fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12}><TextField name="aplicacao" label="Aplicação" value={form.aplicacao} onChange={(e) => setForm({ ...form, aplicacao: e.target.value })} required fullWidth placeholder="Onde os materiais serão aplicados" /></Grid>
          <Grid item xs={12}><TextField name="observacao" label="Observação" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} fullWidth multiline minRows={2} /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} /><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}><Typography variant="subtitle2" color="text.secondary">Produtos e valores</Typography><Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => setItens((atual) => [...atual, { ...itemVazio }])}>Adicionar</Button></Box>
        <Stack spacing={1.5}>{itens.map((item, i) => <ItemCompraRow key={i} item={item} index={i} produtos={produtos} onChange={alterarItem} onRemove={removerItem} disableRemove={itens.length === 1} valorReadOnly={item.automatico} onToggleAutomatico={alternarPrecoAutomatico} />)}</Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}><Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>Cancelar</Button><Button type="submit" variant="contained" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></Stack>
      </form>
    </Paper>
  </Container>;
}
