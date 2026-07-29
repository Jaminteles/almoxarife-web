import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Box, Button, GridLegacy as Grid, TextField, Paper, Alert, MenuItem, Chip, Container } from "@mui/material"
import FormPageHeader from "../../components/FormPageHeader"
import BackButton from "../../components/BackButton"

const API_URL = `${window.location.origin}/api`

// Mesma lista de unidades do cadastro (value = o que vai pro banco).
const UNIDADES = [
    { value: "UN", label: "Unidade (UN)" },
    { value: "PC", label: "Peça (PC)" },
    { value: "CX", label: "Caixa (CX)" },
    { value: "SC", label: "Saco (SC)" },
    { value: "KG", label: "Quilograma (KG)" },
    { value: "LT", label: "Litro (LT)" },
    { value: "M", label: "Metro (M)" },
    { value: "M2", label: "Metro quadrado (M²)" },
    { value: "M3", label: "Metro cúbico (M³)" }
]

const ProdutoEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [erro, setErro] = useState("")
    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        preco_custo: "",
        unidade_medida: "",
        estoque_minimo: 0,
        estoque_maximo: ""
    })

    // Lista de fornecedores vinda da API e os IDs selecionados no multi-select.
    const [fornecedores, setFornecedores] = useState([])
    const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState([])

    useEffect(() => {
        carregarFornecedores()
        carregarProduto()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    // Busca a lista completa de fornecedores para popular o multi-select.
    const carregarFornecedores = async () => {
        try {
            const response = await fetch(`${API_URL}/fornecedores`)
            const result = await response.json()
            // O controller responde { sucesso, dados, total }.
            if (result.sucesso) {
                setFornecedores(result.dados)
            }
        } catch (error) {
            console.error("Erro ao carregar fornecedores:", error)
        }
    }

    const carregarProduto = async () => {
        try {
            setFetching(true)
            setErro("")
            const response = await fetch(`${API_URL}/produtos/${id}`)

            const contentType = response.headers.get("content-type") || ""
            const result = contentType.includes("application/json")
                ? await response.json()
                : null

            if (!response.ok || !result || result.sucesso === false) {
                throw new Error(
                    (result && result.erro) ||
                    "Não foi possível carregar os dados do produto."
                )
            }

            // Backend responde { sucesso, dados }. Campos em snake_case.
            const data = result.dados || {}
            setFormData({
                nome: data.nome || "",
                descricao: data.descricao || "",
                preco_custo: data.preco_custo ?? "",
                unidade_medida: data.unidade_medida || "",
                estoque_minimo: data.estoque_minimo ?? 0,
                estoque_maximo: data.estoque_maximo ?? ""
            })

            // Os fornecedores já vinculados ao produto vêm dentro de
            // `data.fornecedores` (relação Produto_Fornecedor). Extraímos
            // só os IDs para preencher o multi-select.
            const idsVinculados = (data.fornecedores || []).map(
                (f) => f.id_fornecedor ?? f.fornecedor?.id_fornecedor ?? f
            )
            setFornecedoresSelecionados(idsVinculados)
        } catch (error) {
            console.error("Erro ao buscar produto:", error)
            setErro(
                error.message === "Failed to fetch"
                    ? "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
                    : error.message
            )
        } finally {
            setFetching(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErro("")

        const min = Number(formData.estoque_minimo)
        const max = formData.estoque_maximo !== "" ? Number(formData.estoque_maximo) : null

        if (max !== null && min >= max) {
            setErro("O estoque mínimo não pode ser maior ou igual ao estoque máximo.")
            return
        }

        if (fornecedoresSelecionados.length === 0) {
            setErro("Selecione pelo menos um fornecedor.")
            return
        }

        try {
            setLoading(true)
            // Payload em snake_case, batendo com o model do backend.
            const payload = {
                nome: formData.nome,
                descricao: formData.descricao,
                preco_custo: Number(formData.preco_custo),
                unidade_medida: formData.unidade_medida,
                estoque_minimo: min,
                estoque_maximo: max,
                fornecedores: fornecedoresSelecionados
            }

            const response = await fetch(`${API_URL}/produtos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const contentType = response.headers.get("content-type") || ""
            const data = contentType.includes("application/json")
                ? await response.json()
                : null

            if (!response.ok || (data && data.sucesso === false)) {
                throw new Error(
                    (data && data.erro) || "Ocorreu um erro ao atualizar o produto."
                )
            }

            navigate("/produtos")
        } catch (error) {
            console.error("Erro ao atualizar produto:", error)
            setErro(
                error.message === "Failed to fetch"
                    ? "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
                    : error.message
            )
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <Box sx={{ p: 3 }}>Carregando dados do produto...</Box>
    }

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <FormPageHeader title={`Editar Produto #${id}`} />
            <Paper sx={{ p: 3, mt: 3 }}>
                {erro && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErro("")}>
                        {erro}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                label="Nome do Produto"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Descrição"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Preço de Custo (R$)"
                                name="preco_custo"
                                value={formData.preco_custo}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: "0.01" }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                required
                                name="unidade_medida"
                                value={formData.unidade_medida}
                                onChange={handleChange}
                                SelectProps={{ displayEmpty: true }}
                            >
                                <MenuItem value="" disabled>
                                    Unidade de Medida
                                </MenuItem>
                                {UNIDADES.map((u) => (
                                    <MenuItem key={u.value} value={u.value}>
                                        {u.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Estoque Mínimo"
                                name="estoque_minimo"
                                value={formData.estoque_minimo}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Estoque Máximo (Opcional)"
                                name="estoque_maximo"
                                value={formData.estoque_maximo}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        {/* Fornecedores (multi-select), mesmo padrão do cadastro. */}
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                required
                                name="fornecedores"
                                value={fornecedoresSelecionados}
                                onChange={(e) => setFornecedoresSelecionados(e.target.value)}
                                SelectProps={{
                                    multiple: true,
                                    displayEmpty: true,
                                    renderValue: (selecionados) => {
                                        if (!selecionados || selecionados.length === 0) {
                                            return (
                                                <Box sx={{ color: "text.disabled" }}>
                                                    Fornecedores
                                                </Box>
                                            )
                                        }
                                        return (
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                {selecionados.map((id) => {
                                                    const f = fornecedores.find((x) => x.id_fornecedor === id)
                                                    return (
                                                        <Chip
                                                            key={id}
                                                            size="small"
                                                            label={f ? f.razao_social : id}
                                                        />
                                                    )
                                                })}
                                            </Box>
                                        )
                                    }
                                }}
                            >
                                {fornecedores.map((f) => (
                                    <MenuItem key={f.id_fornecedor} value={f.id_fornecedor}>
                                        {f.razao_social}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                            <BackButton />
                            <Button type="submit" variant="contained" color="primary" disabled={loading}>
                                {loading ? "Atualizando..." : "Atualizar Produto"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    )
}

export default ProdutoEdit
