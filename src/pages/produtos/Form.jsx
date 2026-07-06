import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, GridLegacy as Grid, TextField, Paper, Alert, MenuItem, Chip, Container } from "@mui/material"
import FormPageHeader from "../../components/FormPageHeader"
import BackButton from "../../components/BackButton"

const API_URL = `http://${window.location.hostname}:5000/api`

// Unidades de medida. O valor (value) é o que vai pro banco (VARCHAR(10));
// o texto é só o rótulo amigável. Lista pensada para uma construtora.
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

const ProdutoForm = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState("")

    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        preco_custo: "",
        unidade_medida: "",
        estoqueMinimo: 0,
        estoqueMaximo: ""
    })

    // Lista de fornecedores vinda da API e os IDs selecionados no multi-select.
    const [fornecedores, setFornecedores] = useState([])
    const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState([])

    // Busca os fornecedores ao montar a tela, para popular o multi-select.
    useEffect(() => {
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
        carregarFornecedores()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErro("")

        const min = Number(formData.estoqueMinimo)
        const max = formData.estoqueMaximo ? Number(formData.estoqueMaximo) : null

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

            // Campos em snake_case, batendo com o model do backend.
            // `fornecedores` é um array de IDs; o backend grava o vínculo
            // na tabela Produto_Fornecedor usando o preço de custo como
            // preço negociado padrão.
            const payload = {
                nome: formData.nome,
                descricao: formData.descricao,
                preco_custo: Number(formData.preco_custo),
                unidade_medida: formData.unidade_medida,
                estoque_minimo: min,
                estoque_maximo: max,
                fornecedores: fornecedoresSelecionados
            }

            const response = await fetch(`${API_URL}/produtos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const contentType = response.headers.get("content-type") || ""
            const data = contentType.includes("application/json")
                ? await response.json()
                : null

            if (!response.ok) {
                throw new Error(
                    (data && data.erro) ||
                    `Erro ${response.status} ao salvar o produto.`
                )
            }

            navigate("/produtos")
        } catch (error) {
            console.error("Erro ao salvar produto:", error)
            setErro(
                error.message === "Failed to fetch"
                    ? "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
                    : error.message
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <FormPageHeader title="Novo Produto" />
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

                        {/* Unidade de Medida: mesmo padrão das Saídas. A primeira
                            opção (disabled) leva o nome do campo e, com displayEmpty,
                            aparece por padrão — mantém a caixa com largura normal. */}
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
                                name="estoqueMinimo"
                                value={formData.estoqueMinimo}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Estoque Máximo (Opcional)"
                                name="estoqueMaximo"
                                value={formData.estoqueMaximo}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        {/* Fornecedores (multi-select). Como um multi não tem uma
                            opção "fixa selecionada", o equivalente do placeholder é
                            o renderValue: quando nada está escolhido, mostra o nome
                            do campo, mantendo a caixa estendida. */}
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
                                {loading ? "Salvando..." : "Salvar Produto"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    )
}

export default ProdutoForm
