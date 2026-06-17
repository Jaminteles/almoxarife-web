import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Box, Button, Grid, TextField, Paper } from "@mui/material"
import FormPageHeader from "../../components/FormPageHeader"
import BackButton from "../../components/BackButton"

const ProdutoEdit = () => {
const navigate = useNavigate()
const { id } = useParams()
const [loading, setLoading] = useState(false)
const [fetching, setFetching] = useState(true)
const [formData, setFormData] = useState({
nome: "",
descricao: "",
estoqueMinimo: 0,
estoqueMaximo: ""
})

useEffect(() => {
    carregarProduto()
}, [id])

const carregarProduto = async () => {
    try {
        setFetching(true)
        const response = await fetch(`/api/produtos/${id}`)
        if (!response.ok) throw new Error("Falha na requisição")
        const data = await response.json()
        
        setFormData({
            nome: data.nome || "",
            descricao: data.descricao || "",
            estoqueMinimo: data.estoqueMinimo || 0,
            estoqueMaximo: data.estoqueMaximo || ""
        })
    } catch (error) {
        console.error("Erro ao buscar produto:", error)
        alert("Não foi possível carregar os dados do produto.")
        navigate("/produtos")
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

    const min = Number(formData.estoqueMinimo)
    const max = formData.estoqueMaximo ? Number(formData.estoqueMaximo) : null

    if (max !== null && min >= max) {
        alert("O estoque mínimo não pode ser maior ou igual ao estoque máximo.")
        return
    }

    try {
        setLoading(true)
        const payload = {
            ...formData,
            estoqueMinimo: min,
            estoqueMaximo: max
        }

        const response = await fetch(`/api/produtos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.erro || "Ocorreu um erro ao atualizar o produto.")
        }

        alert("Produto atualizado com sucesso!")
        navigate("/produtos")
    } catch (error) {
        console.error("Erro ao atualizar produto:", error)
        alert(error.message)
    } finally {
        setLoading(false)
    }
}

if (fetching) {
    return <Box sx={{ p: 3 }}>Carregando dados do produto...</Box>
}

return (
    <Box sx={{ p: 3 }}>
        <FormPageHeader title={`Editar Produto #${id}`} />
        <Paper sx={{ p: 3, mt: 3 }}>
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
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <BackButton />
                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            {loading ? "Atualizando..." : "Atualizar Produto"}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    </Box>
)

}

export default ProdutoEdit