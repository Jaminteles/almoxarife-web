import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Container, Dialog, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import ListTemplate from "../../components/ListTemplate";

const API_URL = `${window.location.origin}/api`;
const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const data = (valor) => { const d = new Date(valor); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR"); };
const quantidade = (valor) => Number(valor || 0).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
const filtrarPorAplicacao = (dados, aplicacao) => {
  const termo = String(aplicacao || "").trim().toLocaleLowerCase("pt-BR");
  return termo
    ? dados.filter((item) => String(item.aplicacao || "").toLocaleLowerCase("pt-BR").includes(termo))
    : dados;
};
const ordenar = (dados, criterio) => {
  const registrosComGasto = criterio.startsWith("saida")
    ? dados.filter((item) => Number(item.total_saidas) > 0)
    : criterio.startsWith("servico")
      ? dados.filter((item) => Number(item.total_servicos) > 0)
      : dados;
  return [...registrosComGasto].sort((a, b) => {
    const porAplicacao = () => a.aplicacao.localeCompare(b.aplicacao, "pt-BR");
    if (criterio === "saida_maior") return b.total_saidas - a.total_saidas || porAplicacao();
    if (criterio === "saida_menor") return a.total_saidas - b.total_saidas || porAplicacao();
    if (criterio === "servico_maior") return b.total_servicos - a.total_servicos || porAplicacao();
    if (criterio === "servico_menor") return a.total_servicos - b.total_servicos || porAplicacao();
    return porAplicacao();
  });
};

export default function GastosAplicacoesList() {
  const [registros, setRegistros] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [filtros, setFiltros] = useState({ aplicacao: "" });
  const [ordenacao, setOrdenacao] = useState("alfabetica");
  const [detalhe, setDetalhe] = useState(null), [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const carregar = useCallback((ativos = {}, criterio = "alfabetica") => {
    setLoading(true); setError("");
    const params = new URLSearchParams(Object.entries(ativos).filter(([, valor]) => valor));
    fetch(`${API_URL}/gastos-aplicacoes${params.toString() ? `?${params}` : ""}`).then((r) => r.json()).then((res) => {
      if (!res.sucesso) throw new Error(res.erro || "Erro ao carregar gastos por aplicação");
      const filtrados = filtrarPorAplicacao(res.dados, ativos.aplicacao);
      setRegistros(ordenar(filtrados, criterio).map((item) => ({ Aplicação: item.aplicacao, "Gastos em Saídas": moeda(item.total_saidas), "Gastos em Serviços": moeda(item.total_servicos), "Gasto Total": moeda(item.total), __aplicacao__: item.aplicacao })));
      setLoading(false);
    }).catch((err) => { setError(err.message); setLoading(false); });
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  const abrirDetalhe = (item) => {
    setCarregandoDetalhe(true); setDetalhe({ aplicacao: item.__aplicacao__, detalhes: [] });
    fetch(`${API_URL}/gastos-aplicacoes/detalhes?${new URLSearchParams({ aplicacao: item.__aplicacao__ })}`).then((r) => r.json()).then((res) => {
      if (!res.sucesso) throw new Error(res.erro || "Erro ao detalhar aplicação");
      setDetalhe(res.dados);
    }).catch((err) => { setDetalhe(null); setError(err.message); }).finally(() => setCarregandoDetalhe(false));
  };
  return <Container maxWidth={false} disableGutters>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <ListTemplate modulo="gastos_aplicacoes" title="Gastos por Aplicação" columns={["Aplicação", "Gastos em Saídas", "Gastos em Serviços", "Gasto Total"]} data={registros} loading={loading} canCreate={false} onSearch={() => carregar(filtros, ordenacao)} onClear={() => { const limpos = { aplicacao: "" }; setFiltros(limpos); setOrdenacao("alfabetica"); carregar(limpos, "alfabetica"); }} onRowClick={abrirDetalhe} emptyMessage="Nenhuma aplicação com gastos registrada." filters={<>
      <TextField label="Aplicação" size="small" value={filtros.aplicacao} onChange={(e) => setFiltros({ aplicacao: e.target.value })} />
      <Stack direction={{ xs: "column", lg: "row" }} spacing={1} sx={{ alignItems: { lg: "center" } }}>
        <Button variant={ordenacao === "saida_maior" ? "contained" : "outlined"} size="small" onClick={() => { setOrdenacao("saida_maior"); carregar(filtros, "saida_maior"); }}>Maiores saídas</Button>
        <Button variant={ordenacao === "saida_menor" ? "contained" : "outlined"} size="small" onClick={() => { setOrdenacao("saida_menor"); carregar(filtros, "saida_menor"); }}>Menores saídas</Button>
        <Button variant={ordenacao === "servico_maior" ? "contained" : "outlined"} size="small" onClick={() => { setOrdenacao("servico_maior"); carregar(filtros, "servico_maior"); }}>Maiores serviços</Button>
        <Button variant={ordenacao === "servico_menor" ? "contained" : "outlined"} size="small" onClick={() => { setOrdenacao("servico_menor"); carregar(filtros, "servico_menor"); }}>Menores serviços</Button>
      </Stack>
      <Typography variant="body2" color="text.secondary">Clique em uma aplicação para consultar seus serviços e saídas.</Typography>
    </>} />
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
