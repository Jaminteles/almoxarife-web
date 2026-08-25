import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Container, Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import ListTemplate from "../../components/ListTemplate";

const API_URL = `${window.location.origin}/api`;
const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const data = (valor) => { const d = new Date(valor); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR"); };
const quantidade = (valor) => Number(valor || 0).toLocaleString("pt-BR", { maximumFractionDigits: 3 });

export default function GastosAplicacoesList() {
  const [registros, setRegistros] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [detalhe, setDetalhe] = useState(null), [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const carregar = () => {
    setLoading(true); setError("");
    fetch(`${API_URL}/gastos-aplicacoes`).then((r) => r.json()).then((res) => {
      if (!res.sucesso) throw new Error(res.erro || "Erro ao carregar gastos por aplicação");
      setRegistros(res.dados.map((item) => ({ Aplicação: item.aplicacao, "Gastos em Saídas": moeda(item.total_saidas), "Gastos em Serviços": moeda(item.total_servicos), "Gasto Total": moeda(item.total), __aplicacao__: item.aplicacao })));
      setLoading(false);
    }).catch((err) => { setError(err.message); setLoading(false); });
  };
  useEffect(() => { carregar(); }, []);
  const abrirDetalhe = (item) => {
    setCarregandoDetalhe(true); setDetalhe({ aplicacao: item.__aplicacao__, detalhes: [] });
    fetch(`${API_URL}/gastos-aplicacoes/detalhes?${new URLSearchParams({ aplicacao: item.__aplicacao__ })}`).then((r) => r.json()).then((res) => {
      if (!res.sucesso) throw new Error(res.erro || "Erro ao detalhar aplicação");
      setDetalhe(res.dados);
    }).catch((err) => { setDetalhe(null); setError(err.message); }).finally(() => setCarregandoDetalhe(false));
  };
  return <Container maxWidth={false} disableGutters>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <ListTemplate modulo="gastos_aplicacoes" title="Gastos por Aplicação" columns={["Aplicação", "Gastos em Saídas", "Gastos em Serviços", "Gasto Total"]} data={registros} loading={loading} canCreate={false} onSearch={carregar} onClear={carregar} onRowClick={abrirDetalhe} emptyMessage="Nenhuma aplicação com gastos registrada." filters={<Typography variant="body2" color="text.secondary">Clique em uma aplicação para consultar seus serviços e saídas.</Typography>} />
    <Dialog open={!!detalhe} onClose={() => !carregandoDetalhe && setDetalhe(null)} maxWidth="xl" fullWidth>
      <DialogTitle>{detalhe?.aplicacao || "Detalhes da aplicação"}</DialogTitle>
      <DialogContent>
        {carregandoDetalhe ? <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress /></Box> : <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Gasto total: <strong>{moeda(detalhe?.total)}</strong></Typography>
          <Box sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow><TableCell>Origem</TableCell><TableCell>Data</TableCell><TableCell>Produto</TableCell><TableCell align="right">Quantidade</TableCell><TableCell align="right">Valor unit.</TableCell><TableCell align="right">Total</TableCell><TableCell>Responsável</TableCell><TableCell>Fornecedor</TableCell></TableRow></TableHead><TableBody>
            {detalhe?.detalhes?.map((item, indice) => <TableRow key={`${item.origem}-${item.id}-${indice}`}><TableCell>{item.origem}</TableCell><TableCell>{data(item.data)}</TableCell><TableCell>{item.produto}</TableCell><TableCell align="right">{quantidade(item.quantidade)}</TableCell><TableCell align="right">{moeda(item.valor_unitario)}</TableCell><TableCell align="right">{moeda(item.total)}</TableCell><TableCell>{item.responsavel}</TableCell><TableCell>{item.fornecedor || "—"}</TableCell></TableRow>)}
          </TableBody></Table></Box>
        </>}
      </DialogContent>
    </Dialog>
  </Container>;
}
