import { useCallback, useEffect, useState } from "react"
import { Alert, Box, Button, Checkbox, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, GridLegacy as Grid, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Chip } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import BuildIcon from "@mui/icons-material/Build"
import EditIcon from "@mui/icons-material/Edit"
import { useParams } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"
import FormPageHeader from "../../components/FormPageHeader"

const API_URL = `${window.location.origin}/api`
const hoje = () => new Date().toISOString().slice(0, 10)
const numero = (valor) => valor === null || valor === undefined ? "—" : `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} h`
const data = (valor) => valor ? new Date(`${valor}T00:00:00`).toLocaleDateString("pt-BR") : "—"
const corStatus = (status) => ({ REVISAO_VENCIDA: "error", PROXIMO_A_VENCER: "warning", AINDA_NAO_VENCEU: "success", SEM_LEITURA: "info", SEM_MANUTENCAO: "default" }[status] || "default")
const formLeituraVazio = () => ({ horimetro: "", dataLeitura: hoje(), observacao: "", confirmarCorrecao: false })
const formManutencaoVazio = () => ({ dataManutencao: hoje(), horimetro: "", tipo: "Preventiva", intervaloHoras: "500", observacao: "", confirmarCorrecao: false })
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const filtroHistoricoVazio = { data: "", mes: "", ano: "" }
const filtrarHistorico = (registros, campoData, filtros) => registros.filter((registro) => {
  const valor = registro[campoData]
  if (!valor) return false
  const [ano, mes] = String(valor).split("-")
  return (!filtros.data || valor === filtros.data)
    && (!filtros.mes || Number(mes) === Number(filtros.mes))
    && (!filtros.ano || Number(ano) === Number(filtros.ano))
})

function Campo({ label, value }) { return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography fontWeight={600}>{value}</Typography></Box> }

function FiltrosHistorico({ filtros, setFiltros }) {
  const alterar = (evento) => setFiltros((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  return <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
    <TextField name="data" label="Data exata" type="date" size="small" value={filtros.data} onChange={alterar} slotProps={{ inputLabel: { shrink: true } }} />
    <TextField select name="mes" label="Mês" size="small" value={filtros.mes} onChange={alterar} sx={{ minWidth: 150 }}><MenuItem value="">Todos os meses</MenuItem>{meses.map((nome, indice) => <MenuItem key={nome} value={indice + 1}>{nome}</MenuItem>)}</TextField>
    <TextField name="ano" label="Ano" type="number" size="small" value={filtros.ano} onChange={alterar} inputProps={{ min: 1900, max: 9999 }} />
    <Button variant="text" onClick={() => setFiltros(filtroHistoricoVazio)}>Limpar filtros</Button>
  </Stack>
}

export default function ManutencaoDetalhes() {
  const { id } = useParams(); const { podeEditar } = useAuth()
  const podeGravar = podeEditar("equipamentos")
  const [detalhes, setDetalhes] = useState(null), [loading, setLoading] = useState(true), [erro, setErro] = useState("")
  const [modal, setModal] = useState(""), [leitura, setLeitura] = useState(formLeituraVazio()), [manutencao, setManutencao] = useState(formManutencaoVazio()), [salvando, setSalvando] = useState(false)
  const [filtrosHorimetro, setFiltrosHorimetro] = useState(filtroHistoricoVazio), [filtrosManutencao, setFiltrosManutencao] = useState(filtroHistoricoVazio)

  const carregar = useCallback(async () => {
    setLoading(true); setErro("")
    try { const resposta = await fetch(`${API_URL}/equipamentos/${id}/manutencao`); const resultado = await resposta.json(); if (!resultado.sucesso) throw new Error(resultado.erro || "Não foi possível carregar o equipamento"); setDetalhes(resultado.dados) }
    catch (error) { setErro(error.message) } finally { setLoading(false) }
  }, [id])
  useEffect(() => { carregar() }, [carregar])
  const alterar = (setForm) => (evento) => { const { name, value, checked, type } = evento.target; setForm((atual) => ({ ...atual, [name]: type === "checkbox" ? checked : value })) }
  const fechar = () => { setModal(""); setLeitura(formLeituraVazio()); setManutencao(formManutencaoVazio()) }

  const salvarLeitura = async (evento) => {
    evento.preventDefault(); setSalvando(true); setErro("")
    const editando = modal === "editarLeitura"
    try { const resposta = await fetch(`${API_URL}/equipamentos/${id}/horimetros${editando ? `/${leitura.id_horimetro}` : ""}`, { method: editando ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...leitura, horimetro: Number(leitura.horimetro) }) }); const resultado = await resposta.json(); if (!resultado.sucesso) throw new Error(resultado.erro || "Não foi possível salvar a leitura"); fechar(); carregar() }
    catch (error) { setErro(error.message) } finally { setSalvando(false) }
  }
  const salvarManutencao = async (evento) => {
    evento.preventDefault(); setSalvando(true); setErro("")
    const editando = modal === "editar"
    try { const resposta = await fetch(`${API_URL}/equipamentos/${id}/manutencoes${editando ? `/${manutencao.id_manutencao}` : ""}`, { method: editando ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...manutencao, horimetro: Number(manutencao.horimetro), intervaloHoras: Number(manutencao.intervaloHoras) }) }); const resultado = await resposta.json(); if (!resultado.sucesso) throw new Error(resultado.erro || "Não foi possível registrar a manutenção"); fechar(); carregar() }
    catch (error) { setErro(error.message) } finally { setSalvando(false) }
  }
  const abrirEdicao = (registro) => { setManutencao({ id_manutencao: registro.id_manutencao, dataManutencao: registro.data_manutencao, horimetro: String(registro.horimetro), tipo: registro.tipo, intervaloHoras: String(registro.intervalo_horas), observacao: registro.observacao || "", confirmarCorrecao: false }); setModal("editar") }
  const abrirEdicaoLeitura = (registro) => { setLeitura({ id_horimetro: registro.id_horimetro, dataLeitura: registro.data_leitura, horimetro: String(registro.horimetro), observacao: registro.observacao || "", confirmarCorrecao: false }); setModal("editarLeitura") }

  if (loading) return <Container><Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box></Container>
  if (!detalhes) return <Container>{erro && <Alert severity="error">{erro}</Alert>}</Container>
  const equipamento = detalhes.equipamento
  const horimetrosFiltrados = filtrarHistorico(detalhes.horimetros, "data_leitura", filtrosHorimetro)
  const manutencoesFiltradas = filtrarHistorico(detalhes.manutencoes, "data_manutencao", filtrosManutencao)
  return <Container maxWidth="xl">
    <FormPageHeader title={`Manutenção — ${detalhes.codigo}`} subtitle="Leituras e manutenções são preservadas como histórico." backTo="/equipamentos/manutencao" />
    {erro && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro("")}>{erro}</Alert>}
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end" sx={{ mb: 3 }}>
      {podeGravar && <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setModal("leitura")}>Registrar horímetro</Button>}
      {podeGravar && <Button variant="contained" startIcon={<BuildIcon />} onClick={() => setModal("manutencao")}>Registrar manutenção</Button>}
    </Stack>
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}><Paper sx={{ p: 3, height: "100%" }}><Typography variant="h6" sx={{ mb: 2 }}>Informações do equipamento</Typography><Grid container spacing={2}><Grid item xs={12}><Campo label="Descrição" value={equipamento.descricao} /></Grid><Grid item xs={6}><Campo label="Ativo fixo" value={equipamento.codigo} /></Grid><Grid item xs={6}><Campo label="Obra" value={equipamento.obra?.nome || "—"} /></Grid><Grid item xs={12}><Campo label="Horímetro atual" value={numero(detalhes.horimetroAtual)} /></Grid><Grid item xs={12}><Chip label={detalhes.statusRotulo} color={corStatus(detalhes.status)} /></Grid></Grid></Paper></Grid>
      <Grid item xs={12} md={7}><Paper sx={{ p: 3, height: "100%" }}><Typography variant="h6" sx={{ mb: 2 }}>Situação da manutenção</Typography><Grid container spacing={2}><Grid item xs={6} md={4}><Campo label="Última manutenção" value={data(detalhes.dataUltimaRevisao)} /></Grid><Grid item xs={6} md={4}><Campo label="Horímetro da manutenção" value={numero(detalhes.horimetroUltimaRevisao)} /></Grid><Grid item xs={6} md={4}><Campo label="Intervalo" value={numero(detalhes.intervaloHoras)} /></Grid><Grid item xs={6} md={4}><Campo label="Próxima manutenção" value={numero(detalhes.proximaRevisao)} /></Grid><Grid item xs={6} md={4}><Campo label="Horas restantes" value={numero(detalhes.horasRestantes)} /></Grid><Grid item xs={6} md={4}><Campo label="Data da última leitura" value={data(detalhes.dataUltimaLeitura)} /></Grid></Grid></Paper></Grid>
      <Grid item xs={12}><Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Histórico de horímetros</Typography>
        <FiltrosHistorico filtros={filtrosHorimetro} setFiltros={setFiltrosHorimetro} />
        <Box sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow><TableCell>Data</TableCell><TableCell align="right">Horímetro</TableCell><TableCell align="right">Horas trabalhadas</TableCell><TableCell>Observação</TableCell><TableCell>Responsável</TableCell>{podeGravar && <TableCell />}</TableRow></TableHead><TableBody>{horimetrosFiltrados.length ? horimetrosFiltrados.map((item) => <TableRow key={item.id_horimetro}><TableCell>{data(item.data_leitura)}</TableCell><TableCell align="right">{numero(item.horimetro)}</TableCell><TableCell align="right">{item.horasTrabalhadas === null ? "—" : numero(item.horasTrabalhadas)}</TableCell><TableCell>{item.observacao || "—"}</TableCell><TableCell>{item.responsavel?.nome || "—"}</TableCell>{podeGravar && <TableCell><Button size="small" startIcon={<EditIcon />} onClick={() => abrirEdicaoLeitura(item)}>Editar</Button></TableCell>}</TableRow>) : <TableRow><TableCell colSpan={podeGravar ? 6 : 5} align="center">Nenhuma leitura encontrada.</TableCell></TableRow>}</TableBody></Table></Box>
      </Paper></Grid>
      <Grid item xs={12}><Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Histórico de manutenções</Typography>
        <FiltrosHistorico filtros={filtrosManutencao} setFiltros={setFiltrosManutencao} />
        <Box sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow><TableCell>Data</TableCell><TableCell align="right">Horímetro</TableCell><TableCell>Tipo</TableCell><TableCell align="right">Intervalo</TableCell><TableCell>Observação</TableCell><TableCell>Responsável</TableCell>{podeGravar && <TableCell />}</TableRow></TableHead><TableBody>{manutencoesFiltradas.length ? manutencoesFiltradas.map((item) => <TableRow key={item.id_manutencao}><TableCell>{data(item.data_manutencao)}</TableCell><TableCell align="right">{numero(item.horimetro)}</TableCell><TableCell>{item.tipo}</TableCell><TableCell align="right">{numero(item.intervalo_horas)}</TableCell><TableCell>{item.observacao || "—"}</TableCell><TableCell>{item.responsavel?.nome || "—"}</TableCell>{podeGravar && <TableCell><Button size="small" startIcon={<EditIcon />} onClick={() => abrirEdicao(item)}>Editar</Button></TableCell>}</TableRow>) : <TableRow><TableCell colSpan={podeGravar ? 7 : 6} align="center">Nenhuma manutenção encontrada.</TableCell></TableRow>}</TableBody></Table></Box>
      </Paper></Grid>
    </Grid>
    <Dialog open={modal === "leitura" || modal === "editarLeitura"} onClose={() => !salvando && fechar()} fullWidth maxWidth="sm"><DialogTitle>{modal === "editarLeitura" ? "Editar leitura de horímetro" : "Registrar leitura de horímetro"}</DialogTitle><Box component="form" onSubmit={salvarLeitura}><DialogContent><Stack spacing={2}><TextField label="Equipamento" value={`${detalhes.codigo} — ${detalhes.descricao}`} disabled fullWidth /><TextField name="horimetro" label="Horímetro atual" type="number" inputProps={{ min: 0, step: "0.01" }} value={leitura.horimetro} onChange={alterar(setLeitura)} required fullWidth autoFocus /><TextField name="dataLeitura" label="Data da leitura" type="date" value={leitura.dataLeitura} onChange={alterar(setLeitura)} slotProps={{ inputLabel: { shrink: true } }} required fullWidth /><TextField name="observacao" label="Observação" value={leitura.observacao} onChange={alterar(setLeitura)} multiline minRows={2} fullWidth /><Stack direction="row" alignItems="center"><Checkbox name="confirmarCorrecao" checked={leitura.confirmarCorrecao} onChange={alterar(setLeitura)} /><Typography variant="body2">Confirmo que esta é uma correção, mesmo se o valor for menor que o já registrado.</Typography></Stack></Stack></DialogContent><DialogActions><Button onClick={fechar} disabled={salvando}>Cancelar</Button><Button type="submit" variant="contained" disabled={salvando}>{salvando ? "Salvando..." : modal === "editarLeitura" ? "Salvar alterações" : "Registrar"}</Button></DialogActions></Box></Dialog>
    <Dialog open={modal === "manutencao" || modal === "editar"} onClose={() => !salvando && fechar()} fullWidth maxWidth="sm"><DialogTitle>{modal === "editar" ? "Editar manutenção" : "Registrar manutenção"}</DialogTitle><Box component="form" onSubmit={salvarManutencao}><DialogContent><Stack spacing={2}><TextField label="Equipamento" value={`${detalhes.codigo} — ${detalhes.descricao}`} disabled fullWidth /><TextField name="dataManutencao" label="Data da manutenção" type="date" value={manutencao.dataManutencao} onChange={alterar(setManutencao)} slotProps={{ inputLabel: { shrink: true } }} required fullWidth /><TextField name="horimetro" label="Horímetro no momento da manutenção" type="number" inputProps={{ min: 0, step: "0.01" }} value={manutencao.horimetro} onChange={alterar(setManutencao)} required fullWidth /><TextField select name="tipo" label="Tipo de manutenção" value={manutencao.tipo} onChange={alterar(setManutencao)} required fullWidth><MenuItem value="Preventiva">Preventiva</MenuItem><MenuItem value="Corretiva">Corretiva</MenuItem><MenuItem value="Preditiva">Preditiva</MenuItem><MenuItem value="Outros">Outros</MenuItem></TextField><TextField name="intervaloHoras" label="Intervalo para próxima manutenção (h)" type="number" inputProps={{ min: 0.01, step: "0.01" }} value={manutencao.intervaloHoras} onChange={alterar(setManutencao)} required fullWidth /><TextField name="observacao" label="Observação" value={manutencao.observacao} onChange={alterar(setManutencao)} multiline minRows={2} fullWidth /><Stack direction="row" alignItems="center"><Checkbox name="confirmarCorrecao" checked={manutencao.confirmarCorrecao} onChange={alterar(setManutencao)} /><Typography variant="body2">Confirmo a correção caso o horímetro seja menor que a última manutenção.</Typography></Stack></Stack></DialogContent><DialogActions><Button onClick={fechar} disabled={salvando}>Cancelar</Button><Button type="submit" variant="contained" disabled={salvando}>{salvando ? "Salvando..." : modal === "editar" ? "Salvar alterações" : "Registrar manutenção"}</Button></DialogActions></Box></Dialog>
  </Container>
}
