import { useEffect, useState } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  GridLegacy as Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import FormPageHeader from "../../components/FormPageHeader"

const API_URL = `${window.location.origin}/api`
const anoAtual = new Date().getFullYear()

const formularioVazio = {
  descricao: "",
  codigo: "",
  capacidadePotencia: "",
  marca: "",
  serieChassis: "",
  placa: "",
  anoFabricacao: "",
  obraId: ""
}

export default function EquipamentoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editando = Boolean(id)
  const [form, setForm] = useState(formularioVazio)
  const [obras, setObras] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const requisicoes = [fetch(`${API_URL}/lookups/almoxarifados`).then((res) => res.json())]
    if (editando) requisicoes.push(fetch(`${API_URL}/equipamentos/${id}`).then((res) => res.json()))

    Promise.all(requisicoes)
      .then(([resObras, resEquipamento]) => {
        if (resObras.sucesso) setObras(resObras.dados)
        else setError(resObras.erro || "Não foi possível carregar as obras cadastradas")

        if (editando) {
          if (resEquipamento?.sucesso) {
            const equipamento = resEquipamento.dados
            setForm({
              descricao: equipamento.descricao || "",
              codigo: equipamento.codigo || "",
              capacidadePotencia: equipamento.capacidadePotencia || "",
              marca: equipamento.marca || "",
              serieChassis: equipamento.serieChassis || "",
              placa: equipamento.placa || "",
              anoFabricacao: equipamento.anoFabricacao || "",
              obraId: equipamento.obraId || ""
            })
          } else {
            setError(resEquipamento?.erro || "Equipamento não encontrado")
          }
        }
      })
      .catch((erro) => setError("Erro ao carregar os dados: " + erro.message))
      .finally(() => setLoading(false))
  }, [editando, id])

  const handleChange = ({ target: { name, value } }) => {
    setForm((atual) => ({ ...atual, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    const ano = Number(form.anoFabricacao)
    if (!Number.isInteger(ano) || ano < 1800 || ano > anoAtual) {
      setError(`Informe um ano de fabricação válido entre 1800 e ${anoAtual}.`)
      return
    }
    if (!form.obraId) {
      setError("Selecione a localização / obra do equipamento.")
      return
    }

    setSaving(true)
    try {
      const resposta = await fetch(editando ? `${API_URL}/equipamentos/${id}` : `${API_URL}/equipamentos`, {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, obraId: Number(form.obraId), anoFabricacao: ano })
      })
      const resultado = await resposta.json()
      if (!resultado.sucesso) {
        setError(resultado.erro || "Não foi possível salvar o equipamento")
        return
      }
      navigate("/equipamentos")
    } catch (erro) {
      setError("Erro ao salvar o equipamento: " + erro.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Container maxWidth="md"><Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box></Container>
  }

  return (
    <Container maxWidth="md">
      <FormPageHeader
        title={editando ? "Editar Equipamento" : "Cadastrar Equipamento"}
        subtitle="Informe os dados do equipamento e selecione a obra onde ele está localizado."
        backTo="/equipamentos"
      />
      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Dados do equipamento</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}><TextField name="descricao" label="Descrição do equipamento" value={form.descricao} onChange={handleChange} required fullWidth /></Grid>
            <Grid item xs={12} sm={4}><TextField name="codigo" label="Código do equipamento" value={form.codigo} onChange={handleChange} required fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField name="capacidadePotencia" label="Capacidade / Potência" value={form.capacidadePotencia} onChange={handleChange} required fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField name="marca" label="Marca" value={form.marca} onChange={handleChange} required fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField name="serieChassis" label="Série / Chassis" value={form.serieChassis} onChange={handleChange} required fullWidth /></Grid>
            <Grid item xs={12} sm={3}><TextField name="placa" label="Placa" value={form.placa} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={3}>
              <TextField name="anoFabricacao" label="Ano de fabricação" type="number" value={form.anoFabricacao} onChange={handleChange} required fullWidth slotProps={{ htmlInput: { min: 1800, max: anoAtual } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField select name="obraId" label="Localização / Obra" value={form.obraId} onChange={handleChange} required fullWidth helperText="A obra corresponde a um almoxarifado já cadastrado no sistema.">
                <MenuItem value="" disabled>Selecione uma obra</MenuItem>
                {obras.map((obra) => <MenuItem key={obra.cod_almoxarifado} value={obra.cod_almoxarifado}>{obra.nome}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving || obras.length === 0}>{saving ? "Salvando..." : editando ? "Salvar alterações" : "Salvar"}</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
