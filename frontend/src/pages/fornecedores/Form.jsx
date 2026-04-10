import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Stack,
  Typography,
  Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function FornecedorForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: ""
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log("Fornecedor cadastrado:", form);

    navigate("/fornecedores");
  }

  return (
    <Container maxWidth="sm">

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" mb={2}>
          Cadastrar Fornecedor
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField name="nome" label="Nome" onChange={handleChange} required />
            <TextField name="cnpj" label="CNPJ" onChange={handleChange} required />
            <TextField name="telefone" label="Telefone" onChange={handleChange} />
            <TextField name="email" label="Email" onChange={handleChange} />
            <TextField name="endereco" label="Endereço" onChange={handleChange} />

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained">
                Salvar
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}