import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  Alert,
  MenuItem,
  Grid,
  Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FormPageHeader from "../../components/FormPageHeader";

const API_URL = "http://localhost:5000/api";

export default function FuncionarioForm() {
  const navigate = useNavigate();

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

    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem");
      setSaving(false);
      return;
    }

    const { confirmarSenha, ...dadosParaEnviar } = form;

    fetch(`${API_URL}/funcionarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosParaEnviar)
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
    <Container maxWidth="md">
      <FormPageHeader
        title="Cadastrar Funcionário"
        subtitle="Preencha os dados do novo funcionário do sistema."
        backTo="/funcionarios"
      />

      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* === Seção: Dados pessoais === */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Dados pessoais
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                name="nome"
                label="Nome"
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                name="cpf"
                label="CPF"
                onChange={handleChange}
                required
                fullWidth
                helperText="Apenas números ou formato 000.000.000-00"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
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

          {/* === Seção: Acesso ao sistema === */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Dados de acesso ao sistema
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="senha"
                label="Senha"
                type="password"
                onChange={handleChange}
                required
                fullWidth
                // Mostra erro visual se tiver entre 1 e 7 caracteres
                error={form.senha.length > 0 && form.senha.length < 8}
                helperText={
                  form.senha.length > 0 && form.senha.length < 8 
                  ? "A senha deve ter pelo menos 8 caracteres" 
                  : "A senha deve ter pelo menos 8 caracteres"
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="confirmarSenha"
                label="Confirmar Senha"
                type="password"
                onChange={handleChange}
                required
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

          {/* === Ações === */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
