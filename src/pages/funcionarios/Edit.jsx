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
  MenuItem,
  Grid,
  Divider,
  Box
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import FormPageHeader from "../../components/FormPageHeader";

const API_URL = "http://localhost:5000/api";

export default function FuncionarioEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    id_cargo: "",
    email: "",
    senha: "",
    confirmarSenha: "",
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
            senha: "",
            confirmarSenha: "",
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

    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem");
      setSaving(false);
      return;
    }

    if (form.senha.length > 0 && form.senha.length < 8) {
    setError("A nova senha deve ter no mínimo 8 caracteres");
    return;
    }

    setSaving(true);
    const { confirmarSenha, ...dadosParaEnviar } = form;

    fetch(`${API_URL}/funcionarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosParaEnviar)
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <FormPageHeader
        title="Editar Funcionário"
        subtitle="Atualize as informações do funcionário."
        backTo="/funcionarios"
      />

      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Dados pessoais
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                name="nome"
                label="Nome"
                value={form.nome}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                name="cpf"
                label="CPF"
                value={form.cpf}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="id_cargo"
                label="Cargo"
                select
                value={form.id_cargo}
                onChange={handleChange}
                required
                fullWidth
              >
                {cargos.map(c => (
                  <MenuItem key={c.id_cargo} value={c.id_cargo}>
                    {c.nome_cargo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Dados de acesso ao sistema
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
                name="senha"
                label="Nova Senha"
                type="password"
                value={form.senha}
                onChange={handleChange}
                fullWidth
                // Mostra erro visual se tiver entre 1 e 7 caracteres
                error={form.senha.length > 0 && form.senha.length < 8}
                helperText={
                  form.senha.length > 0 && form.senha.length < 8 
                  ? "A senha deve ter pelo menos 8 caracteres" 
                  : "Deixe vazio para não alterar"
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="confirmarSenha"
                label="Confirmar Nova Senha"
                type="password"
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="access_level"
                label="Nível de Acesso"
                select
                value={form.access_level}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="CENTRAL">Central</MenuItem>
                <MenuItem value="ALMOXARIFE">Almoxarife</MenuItem>
                <MenuItem value="AUXILIAR">Auxiliar</MenuItem>
                <MenuItem value="CONSULTA">Consulta</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
