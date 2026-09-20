import { useEffect, useState } from "react";
import { Alert, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, TextField } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";
import ListTemplate from "../../components/ListTemplate";
import EntityAutocomplete from "../../components/EntityAutocomplete";

const API_URL = `${window.location.origin}/api`;
const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const data = (valor) => { const d = new Date(valor); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR"); };

export default function ServicosList() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [filtros, setFiltros] = useState({ data: "", fornecedor: "", produto: "", numero_nota_fiscal: "", aplicacao: "" });
  const [fornecedores, setFornecedores] = useState([]), [produtos, setProdutos] = useState([]), [confirmar, setConfirmar] = useState(null), [removendo, setRemovendo] = useState(false);
  const carregar = (ativos = {}) => {
    setLoading(true); setError(""); const params = new URLSearchParams(Object.entries(ativos).filter(([, v]) => v));
    fetch(`${API_URL}/servicos${params.toString() ? `?${params}` : ""}`).then((r) => r.json()).then((res) => {
      if (!res.sucesso) throw new Error(res.erro || "Erro ao carregar serviços");
      setRegistros(res.dados.map((s) => ({ Data: data(s.data_servico), Almoxarifado: s.almoxarifado?.nome || "—", "Nota Fiscal": s.numero_nota_fiscal || "—", Fornecedor: s.fornecedor?.razao_social || s.fornecedor?.nome_fantasia || "—", Responsável: s.responsavel?.nome || "—", Aplicação: s.aplicacao, Produtos: s.itens?.map((i) => i.produto?.nome || `Produto ${i.id_produto}`).join(", ") || "—", Total: moeda(s.valor_total), __id__: s.id_servico })));
      setLoading(false);
    }).catch((err) => { setError(err.message); setLoading(false); });
  };
  useEffect(() => {
    carregar();
    Promise.all([fetch(`${API_URL}/fornecedores`).then((r) => r.json()), fetch(`${API_URL}/produtos`).then((r) => r.json())])
      .then(([resForn, resProd]) => { if (resForn.sucesso) setFornecedores(resForn.dados); if (resProd.sucesso) setProdutos(resProd.dados); })
      .catch(() => {});
  }, []);
  const excluir = () => { setRemovendo(true); fetch(`${API_URL}/servicos/${confirmar.__id__}`, { method: "DELETE" }).then((r) => r.json()).then((res) => { if (!res.sucesso) throw new Error(res.erro || "Erro ao excluir serviço"); setConfirmar(null); carregar(filtros); }).catch((err) => setError(err.message)).finally(() => setRemovendo(false)); };
  return <Container maxWidth={false} disableGutters>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <ListTemplate modulo="servicos" title="Serviços" columns={["Data", "Almoxarifado", "Nota Fiscal", "Fornecedor", "Responsável", "Aplicação", "Produtos", "Total"]} data={registros} loading={loading} onCreate={() => navigate("/servicos/cadastro")} onEdit={(item) => navigate(`/servicos/${item.__id__}/editar`)} onInactivate={setConfirmar} onSearch={() => carregar(filtros)} onClear={() => { const limpos = { data: "", fornecedor: "", produto: "", numero_nota_fiscal: "", aplicacao: "" }; setFiltros(limpos); carregar(); }} emptyMessage="Nenhum serviço encontrado." actionLabel="Excluir" actionIcon={<DeleteOutlineIcon fontSize="small" />} actionColor="error.main" filters={<>
      <TextField label="Data" type="date" size="small" value={filtros.data} onChange={(e) => setFiltros({ ...filtros, data: e.target.value })} InputLabelProps={{ shrink: true }} />
      <TextField label="Nota fiscal" size="small" value={filtros.numero_nota_fiscal} onChange={(e) => setFiltros({ ...filtros, numero_nota_fiscal: e.target.value })} />
      <EntityAutocomplete options={fornecedores} value={filtros.fornecedor} onChange={(value) => setFiltros({ ...filtros, fornecedor: value })} getOptionId={(fornecedor) => fornecedor.id_fornecedor} getOptionLabel={(fornecedor) => fornecedor.razao_social || fornecedor.nome_fantasia || ""} label="Fornecedor" size="small" sx={{ minWidth: 180 }} />
      <TextField select label="Produto" size="small" value={filtros.produto} onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })} sx={{ minWidth: 180 }}><MenuItem value="">Todos</MenuItem>{produtos.map((p) => <MenuItem key={p.id_produto} value={p.id_produto}>{p.nome}</MenuItem>)}</TextField>
      <TextField label="Aplicação" size="small" value={filtros.aplicacao} onChange={(e) => setFiltros({ ...filtros, aplicacao: e.target.value })} />
    </>} />
    <Dialog open={!!confirmar} onClose={() => !removendo && setConfirmar(null)}><DialogTitle>Confirmar exclusão do serviço</DialogTitle><DialogContent><DialogContentText>Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setConfirmar(null)} disabled={removendo}>Cancelar</Button><Button color="error" variant="contained" onClick={excluir} disabled={removendo}>{removendo ? "Excluindo..." : "Excluir"}</Button></DialogActions></Dialog>
  </Container>;
}
