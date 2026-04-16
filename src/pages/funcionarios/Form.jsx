import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  Alert,
  MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function FuncionarioForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    id_cargo: "",
    email: "",
    senha: "",
    access_level: "CONSULTA"
  });

  const [cargos, setCargos] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/cargos`)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) setCargos(result.dados);
      })
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    fetch(`${API_URL}/funcionarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          navigate("/funcionarios");
        } else {
          setError(result.erro || "Erro ao cadastrar funcionário");
        }
        setSaving(false);
      })
      .catch(err => {
        setError("Erro ao cadastrar: " + err.message);
        setSaving(false);
      });
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" mb={2}>
          Cadastrar Funcionário
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField name="nome" label="Nome" onChange={handleChange} required />
            <TextField name="cpf" label="CPF" onChange={handleChange} required
              helperText="Apenas números ou formato 000.000.000-00" />
            
            <TextField
              name="id_cargo"
              label="Cargo"
              select
              value={form.id_cargo}
              onChange={handleChange}
              required
            >
              {cargos.map(c => (
                <MenuItem key={c.id_cargo} value={c.id_cargo}>
                  {c.nome_cargo}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
              Dados de Acesso ao Sistema
            </Typography>

            <TextField name="email" label="Email" type="email" onChange={handleChange} required />
            <TextField name="senha" label="Senha" type="password" onChange={handleChange} required />

            <TextField
              name="access_level"
              label="Nível de Acesso"
              select
              value={form.access_level}
              onChange={handleChange}
            >
              <MenuItem value="CENTRAL">Central</MenuItem>
              <MenuItem value="ALMOXARIFE">Almoxarife</MenuItem>
              <MenuItem value="AUXILIAR">Auxiliar</MenuItem>
              <MenuItem value="CONSULTA">Consulta</MenuItem>
            </TextField>

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar</Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
