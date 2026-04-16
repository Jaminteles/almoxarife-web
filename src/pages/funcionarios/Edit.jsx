import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  MenuItem
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function FuncionarioEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    id_cargo: "",
    email: "",
    access_level: "CONSULTA"
  });

  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Carregar cargos
    fetch(`${API_URL}/cargos`)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) setCargos(result.dados);
      })
      .catch(() => {});

    // Carregar dados do funcionário
    fetch(`${API_URL}/funcionarios/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          const f = result.dados;
          setForm({
            nome: f.nome,
            cpf: f.cpf,
            id_cargo: f.id_cargo,
            email: f.usuario?.email || "",
            access_level: f.usuario?.access_level || "CONSULTA"
          });
        } else {
          setError("Funcionário não encontrado");
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Erro ao carregar funcionário: " + err.message);
        setLoading(false);
      });
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    fetch(`${API_URL}/funcionarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          navigate("/funcionarios");
        } else {
          setError(result.erro || "Erro ao atualizar funcionário");
        }
        setSaving(false);
      })
      .catch(err => {
        setError("Erro ao atualizar: " + err.message);
        setSaving(false);
      });
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" mb={2}>Editar Funcionário</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField name="nome" label="Nome" value={form.nome} onChange={handleChange} required />
            <TextField name="cpf" label="CPF" value={form.cpf} onChange={handleChange} required />

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

            <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} />

            <TextField
              name="senha"
              label="Nova Senha (deixe vazio para não alterar)"
              type="password"
              onChange={handleChange}
            />

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
