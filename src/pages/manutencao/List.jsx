import { useCallback, useEffect, useState } from "react"
import { Alert, Chip, Container, GridLegacy as Grid, MenuItem, TextField, Typography } from "@mui/material"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import ScheduleIcon from "@mui/icons-material/Schedule"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import SpeedIcon from "@mui/icons-material/Speed"
import BuildCircleIcon from "@mui/icons-material/BuildCircle"
import { useNavigate } from "react-router-dom"
import SummaryCard from "../../components/SummaryCard"
import ListTemplate from "../../components/ListTemplate"

const API_URL = `${window.location.origin}/api`
const numero = (valor) => valor === null || valor === undefined ? "—" : `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} h`
const data = (valor) => valor ? new Date(`${valor}T00:00:00`).toLocaleDateString("pt-BR") : "—"
const statusColor = (status) => ({ REVISAO_VENCIDA: "error", PROXIMO_A_VENCER: "warning", AINDA_NAO_VENCEU: "success", SEM_LEITURA: "info", SEM_MANUTENCAO: "default" }[status] || "default")

export default function ManutencaoList() {
  const navigate = useNavigate()
  const [itens, setItens] = useState([]), [totais, setTotais] = useState({}), [obras, setObras] = useState([])
  const [loading, setLoading] = useState(true), [erro, setErro] = useState("")
  const [filtros, setFiltros] = useState({ equipamento: "", codigo: "", obraId: "", status: "", dataInicio: "", dataFim: "" })

  const carregar = useCallback(async (ativos = {}) => {
    setLoading(true); setErro("")
    const parametros = new URLSearchParams(Object.entries(ativos).filter(([, valor]) => String(valor || "").trim()))
    try {
      const resposta = await fetch(`${API_URL}/equipamentos/manutencao${parametros.toString() ? `?${parametros}` : ""}`)
      const resultado = await resposta.json()
      if (!resultado.sucesso) throw new Error(resultado.erro || "Não foi possível carregar o controle de manutenção")
      setItens(resultado.dados); setTotais(resultado.totais || {})
    } catch (error) { setErro(error.message) } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    carregar()
    fetch(`${API_URL}/lookups/almoxarifados`).then((res) => res.json()).then((res) => res.sucesso && setObras(res.dados)).catch(() => {})
  }, [carregar])

  const limpar = () => { const limpos = { equipamento: "", codigo: "", obraId: "", status: "", dataInicio: "", dataFim: "" }; setFiltros(limpos); carregar(limpos) }
  const dadosTabela = itens.map((item) => ({
    Equipamento: item.descricao,
    "Ativo fixo": item.codigo,
    Obra: item.obra?.nome || "—",
    "Horímetro atual": numero(item.horimetroAtual),
    "Última revisão": numero(item.horimetroUltimaRevisao),
    "Data última revisão": data(item.dataUltimaRevisao),
    Intervalo: numero(item.intervaloHoras),
    "Próx. revisão": numero(item.proximaRevisao),
    "Horas restantes": numero(item.horasRestantes),
    Status: <Chip label={item.statusRotulo} color={statusColor(item.status)} size="small" variant={item.status === "AINDA_NAO_VENCEU" ? "outlined" : "filled"} />,
    __id__: item.id_equipamento
  }))

  return <Container maxWidth={false} disableGutters>
    {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
    <Typography variant="h4" sx={{ mb: 0.5 }}>Controle de Horímetro e Manutenção</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>Acompanhe as revisões preventivas a partir do histórico real de leituras.</Typography>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={4} lg={2}><SummaryCard icon={<DirectionsCarIcon />} color="#3b82f6" value={totais.totalEquipamentos || 0} label="Equipamentos monitorados" /></Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}><SummaryCard icon={<WarningAmberIcon />} color="#ef4444" value={totais.revisoesVencidas || 0} label="Revisões vencidas" /></Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}><SummaryCard icon={<ScheduleIcon />} color="#f59e0b" value={totais.proximasAVencer || 0} label="Próximas a vencer" /></Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}><SummaryCard icon={<CheckCircleOutlineIcon />} color="#10b981" value={totais.dentroDoPrazo || 0} label="Dentro do prazo" /></Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}><SummaryCard icon={<SpeedIcon />} color="#3b82f6" value={totais.semLeitura || 0} label="Sem leitura" /></Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}><SummaryCard icon={<BuildCircleIcon />} color="#6b7280" value={totais.semManutencao || 0} label="Sem manutenção" /></Grid>
    </Grid>
    <ListTemplate modulo="equipamentos" title="Situação dos equipamentos" canCreate={false} showRowActions={false} loading={loading} data={dadosTabela}
      columns={["Equipamento", "Ativo fixo", "Obra", "Horímetro atual", "Última revisão", "Data última revisão", "Intervalo", "Próx. revisão", "Horas restantes", "Status"]}
      onSearch={() => carregar(filtros)} onClear={limpar} onRowClick={(item) => navigate(`/equipamentos/${item.__id__}/manutencao`)} emptyMessage="Nenhum equipamento encontrado para os filtros informados."
      filters={<>
        <TextField label="Equipamento" size="small" value={filtros.equipamento} onChange={(e) => setFiltros((atual) => ({ ...atual, equipamento: e.target.value }))} />
        <TextField label="Ativo fixo" size="small" value={filtros.codigo} onChange={(e) => setFiltros((atual) => ({ ...atual, codigo: e.target.value }))} />
        <TextField select label="Obra" size="small" value={filtros.obraId} onChange={(e) => setFiltros((atual) => ({ ...atual, obraId: e.target.value }))} sx={{ minWidth: 180 }}><MenuItem value="">Todas</MenuItem>{obras.map((obra) => <MenuItem key={obra.cod_almoxarifado} value={obra.cod_almoxarifado}>{obra.nome}</MenuItem>)}</TextField>
        <TextField select label="Situação" size="small" value={filtros.status} onChange={(e) => setFiltros((atual) => ({ ...atual, status: e.target.value }))} sx={{ minWidth: 190 }}>
          <MenuItem value="">Todas</MenuItem><MenuItem value="REVISAO_VENCIDA">Revisões vencidas</MenuItem><MenuItem value="PROXIMO_A_VENCER">Próximas a vencer</MenuItem><MenuItem value="AINDA_NAO_VENCEU">Ainda não vencidas</MenuItem><MenuItem value="SEM_LEITURA">Sem leitura</MenuItem><MenuItem value="SEM_MANUTENCAO">Sem manutenção</MenuItem>
        </TextField>
        <TextField label="Leituras de" size="small" type="date" value={filtros.dataInicio} onChange={(e) => setFiltros((atual) => ({ ...atual, dataInicio: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="até" size="small" type="date" value={filtros.dataFim} onChange={(e) => setFiltros((atual) => ({ ...atual, dataFim: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
      </>}
    />
  </Container>
}
