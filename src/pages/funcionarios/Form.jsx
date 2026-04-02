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

export default function FuncionarioForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    cargo: "",
    login: "",
    senha: ""
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log("Funcionário cadastrado:", form);

    // depois aqui vai API

    navigate("/funcionarios");
  }

  return (
    <Container maxWidth="sm">

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" mb={2}>
          Cadastrar Funcionário
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField name="nome" label="Nome" onChange={handleChange} required />
            <TextField name="cpf" label="CPF" onChange={handleChange} required />
            <TextField name="email" label="Email" onChange={handleChange} required />
            <TextField name="cargo" label="Cargo" onChange={handleChange} required />
            <TextField name="login" label="Login" onChange={handleChange} required />
            <TextField
              name="senha"
              label="Senha"
              type="password"
              onChange={handleChange}
              required
            />

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