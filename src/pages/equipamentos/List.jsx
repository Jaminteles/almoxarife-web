import { useEffect, useState } from "react"
import { Alert, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, TextField } from "@mui/material"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import { useNavigate } from "react-router-dom"
import ListTemplate from "../../components/ListTemplate"

const API_URL = `${window.location.origin}/api`
const colunas = ["Descrição", "Cód. Equip.", "Cap./Pot.", "Marca", "Série/Chassis", "Placa", "Ano de Fab.", "Localização"]

export default function EquipamentosList() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filtros, setFiltros] = useState({ descricao: "", codigo: "", obraId: "" })
  const [obras, setObras] = useState([])
  const [selecionado, setSelecionado] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  const carregarEquipamentos = async (filtrosBusca = {}) => {
    setLoading(true)
    setError("")
    const parametros = new URLSearchParams()
    Object.entries(filtrosBusca).forEach(([chave, valor]) => {
      if (String(valor || "").trim()) parametros.set(chave, String(valor).trim())
    })
    try {
      const sufixo = parametros.toString() ? `?${parametros}` : ""
      const resposta = await fetch(`${API_URL}/equipamentos${sufixo}`)
      const resultado = await resposta.json()
      if (!resultado.sucesso) return setError(resultado.erro || "Erro ao carregar equipamentos")
      setData(resultado.dados.map((equipamento) => ({
        "Descrição": equipamento.descricao,
        "Cód. Equip.": equipamento.codigo,
        "Cap./Pot.": equipamento.capacidadePotencia,
        "Marca": equipamento.marca,
        "Série/Chassis": equipamento.serieChassis,
        "Placa": equipamento.placa || "—",
        "Ano de Fab.": equipamento.anoFabricacao,
        "Localização": equipamento.obra?.nome || "—",
        __id__: equipamento.id_equipamento
      })))
    } catch (erro) {
      setError("Erro ao conectar com o servidor: " + erro.message)
    } finally {
      setLoading(false)
    }
  }

  const carregarObras = async () => {
    try {
      const resposta = await fetch(`${API_URL}/lookups/almoxarifados`)
      const resultado = await resposta.json()
      if (resultado.sucesso) setObras(resultado.dados)
      else setError(resultado.erro || "Não foi possível carregar as obras cadastradas")
    } catch (erro) {
      setError("Erro ao carregar as obras: " + erro.message)
    }
  }

  useEffect(() => {
    carregarEquipamentos()
    carregarObras()
  }, [])

  const handleLimpar = () => {
    const limpos = { descricao: "", codigo: "", obraId: "" }
    setFiltros(limpos)
    carregarEquipamentos(limpos)
  }

  const confirmarExclusao = async () => {
    setExcluindo(true)
    setError("")
    try {
      const resposta = await fetch(`${API_URL}/equipamentos/${selecionado.__id__}`, { method: "DELETE" })
      const resultado = await resposta.json()
      if (!resultado.sucesso) return setError(resultado.erro || "Não foi possível excluir o equipamento")
      setSelecionado(null)
      carregarEquipamentos(filtros)
    } catch (erro) {
      setError("Erro ao excluir o equipamento: " + erro.message)
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <Container maxWidth={false} disableGutters>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <ListTemplate
        modulo="equipamentos"
        title="Equipamentos"
        columns={colunas}
        data={data}
        loading={loading}
        onCreate={() => navigate("/equipamentos/cadastro")}
        onEdit={(item) => navigate(`/equipamentos/${item.__id__}/editar`)}
        onInactivate={(item) => setSelecionado(item)}
        onSearch={() => carregarEquipamentos(filtros)}
        onClear={handleLimpar}
        actionLabel="Excluir"
        actionIcon={<DeleteOutlineIcon fontSize="small" />}
        actionColor="error.main"
        emptyMessage="Nenhum equipamento encontrado."
        filters={<>
          <TextField label="Descrição" size="small" value={filtros.descricao} onChange={(event) => setFiltros((atual) => ({ ...atual, descricao: event.target.value }))} onKeyDown={(event) => event.key === "Enter" && carregarEquipamentos(filtros)} />
          <TextField label="Código" size="small" value={filtros.codigo} onChange={(event) => setFiltros((atual) => ({ ...atual, codigo: event.target.value }))} onKeyDown={(event) => event.key === "Enter" && carregarEquipamentos(filtros)} />
          <TextField select label="Obra / Localização" size="small" value={filtros.obraId} onChange={(event) => setFiltros((atual) => ({ ...atual, obraId: event.target.value }))} sx={{ minWidth: 220 }}>
            <MenuItem value="">Todas as obras</MenuItem>
            {obras.map((obra) => <MenuItem key={obra.cod_almoxarifado} value={obra.cod_almoxarifado}>{obra.nome}</MenuItem>)}
          </TextField>
        </>}
      />
      <Dialog open={Boolean(selecionado)} onClose={() => !excluindo && setSelecionado(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent><DialogContentText>Deseja excluir o equipamento <strong>{selecionado?.["Descrição"]}</strong>? Esta ação não poderá ser desfeita.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setSelecionado(null)} disabled={excluindo}>Cancelar</Button>
          <Button onClick={confirmarExclusao} color="error" variant="contained" disabled={excluindo}>{excluindo ? "Excluindo..." : "Excluir"}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
