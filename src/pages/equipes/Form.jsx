import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
  Paper,
  Alert,
  Checkbox,
  ListItemText,
  Box,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import FormPageHeader from "../../components/FormPageHeader";

const API_URL = `${window.location.origin}/api`;

export default function EquipeForm() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  // Ids (UUID) dos funcionários escolhidos para a equipe. Opcional.
  const [funcionariosSel, setFuncionariosSel] = useState([]);

  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/lookups/funcionarios`)
      .then((r) => r.json())
      .then((result) => {
        if (result.sucesso) setFuncionarios(result.dados);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao carregar funcionários: " + err.message);
        setLoading(false);
      });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!nome.trim()) {
      setError("Informe o nome da equipe.");
      return;
    }

    setSaving(true);

    fetch(`${API_URL}/equipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim(), funcionarios: funcionariosSel })
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          navigate("/equipes");
        } else {
          setError(result.erro || "Erro ao cadastrar a equipe");
        }
        setSaving(false);
      })
      .catch((err) => {
        setError("Erro ao cadastrar: " + err.message);
        setSaving(false);
      });
  }

  // Mostra os nomes escolhidos no campo (o value guarda ids).
  const renderFuncionarios = (selecionados) =>
    funcionarios
      .filter((f) => selecionados.includes(f.id_funcionario))
      .map((f) => f.nome)
      .join(", ");

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <FormPageHeader
        title="Cadastrar Equipe"
        subtitle="Dê um nome à equipe e, opcionalmente, escolha os funcionários."
        backTo="/equipes"
      />

      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Dados da equipe
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Nome da equipe"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              fullWidth
            />

            <TextField
              select
              label="Funcionários (opcional)"
              value={funcionariosSel}
              onChange={(e) => setFuncionariosSel(e.target.value)}
              fullWidth
              helperText="Você pode deixar em branco e adicionar funcionários depois."
              SelectProps={{
                multiple: true,
                renderValue: renderFuncionarios,
                displayEmpty: true
              }}
            >
              {funcionarios.length === 0 && (
                <MenuItem value="" disabled>
                  Nenhum funcionário disponível
                </MenuItem>
              )}
              {funcionarios.map((f) => (
                <MenuItem key={f.id_funcionario} value={f.id_funcionario}>
                  <Checkbox checked={funcionariosSel.includes(f.id_funcionario)} />
                  <ListItemText primary={f.nome} />
                </MenuItem>
              ))}
            </TextField>
          </Stack>

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
