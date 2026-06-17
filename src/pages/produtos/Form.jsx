import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, Grid, TextField, Paper } from "@mui/material"
import FormPageHeader from "../../components/FormPageHeader"
import BackButton from "../../components/BackButton"

const ProdutoForm = () => {
const navigate = useNavigate()
const [loading, setLoading] = useState(false)
const [formData, setFormData] = useState({
nome: "",
descricao: "",
estoqueMinimo: 0,
estoqueMaximo: ""
})

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

        const response = await fetch("/api/produtos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.erro || "Ocorreu um erro ao salvar o produto.")
        }

        alert("Produto cadastrado com sucesso!")
        navigate("/produtos")
    } catch (error) {
        console.error("Erro ao salvar produto:", error)
        alert(error.message)
    } finally {
        setLoading(false)
    }
}

return (
    <Box sx={{ p: 3 }}>
        <FormPageHeader title="Novo Produto" />
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
                            {loading ? "Salvando..." : "Salvar Produto"}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    </Box>
)

}

export default ProdutoForm