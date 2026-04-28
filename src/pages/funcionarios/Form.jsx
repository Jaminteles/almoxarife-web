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
  Divider,
  FormControlLabel,
  Switch,
  Box,
  Collapse
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useNavigate } from "react-router-dom";
import FormPageHeader from "../../components/FormPageHeader";

const API_URL = "http://localhost:5000/api";

/** Formulário de cadastro de novo funcionário. */
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

  const [criarUsuario, setCriarUsuario] = useState(false);
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

    if (criarUsuario) {
      if (!form.senha) {
        setError("Senha é obrigatória para criar acesso ao sistema.");
        return;
      }
      if (form.senha.length < 8) {
        setError("A senha deve ter pelo menos 8 caracteres.");
        return;
      }
      if (form.senha !== form.confirmarSenha) {
        setError("As senhas não coincidem.");
        return;
      }
    }

    setSaving(true);

    const body = {
      nome: form.nome,
      cpf: form.cpf,
      id_cargo: form.id_cargo,
      email: form.email,
      criarUsuario,
      ...(criarUsuario && {
        senha: form.senha,
        access_level: form.access_level
      })
    };

    fetch(`${API_URL}/funcionarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
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

  const senhaTemErro = form.senha.length > 0 && form.senha.length < 8;
  const senhasNaoConferem =
    form.confirmarSenha.length > 0 && form.senha !== form.confirmarSenha;

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

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <PersonAddIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" color="text.secondary">
              Dados pessoais
            </Typography>
          </Stack>

          <Grid container spacing={2}>

            <Grid item xs={12} sm={7}>
              <TextField
                name="nome"
                label="Nome *"
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                name="cpf"
                label="CPF *"
                onChange={handleChange}
                required
                fullWidth
                helperText="Apenas números ou formato 000.000.000-00"
              />
            </Grid>

            <Grid item xs={12} sm={7}>
              <TextField
                name="email"
                label="Email *"
                type="email"
                onChange={handleChange}
                required
                fullWidth
                helperText="Usado para contato e, se habilitado, como login"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                name="id_cargo"
                label="Cargo *"
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

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <LockOpenIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" color="text.secondary">
              Acesso ao sistema
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: criarUsuario ? "primary.main" : "divider",
              backgroundColor: criarUsuario ? "primary.50" : "transparent",
              transition: "all 0.2s ease",
              mb: 2
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Criar usuário de acesso ao sistema
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {criarUsuario
                  ? "O funcionário poderá fazer login no sistema."
                  : "O funcionário será cadastrado sem acesso ao sistema."}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={criarUsuario}
                  onChange={(e) => {
                    setCriarUsuario(e.target.checked);
                    if (!e.target.checked) {
                      setForm(prev => ({
                        ...prev,
                        senha: "",
                        confirmarSenha: "",
                        access_level: "CONSULTA"
                      }));
                    }
                  }}
                  color="primary"
                />
              }
              label=""
              sx={{ mr: 0 }}
            />
          </Box>

          <Collapse in={criarUsuario} timeout={300}>
            <Grid container spacing={2} sx={{ mb: 1 }}>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="senha"
                  label="Senha *"
                  type="password"
                  value={form.senha}
                  onChange={handleChange}
                  required={criarUsuario}
                  fullWidth
                  error={senhaTemErro}
                  helperText={
                    senhaTemErro
                      ? "A senha deve ter pelo menos 8 caracteres"
                      : "A senha deve ter pelo menos 8 caracteres"
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="confirmarSenha"
                  label="Confirmar Senha *"
                  type="password"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  required={criarUsuario}
                  fullWidth
                  error={senhasNaoConferem}
                  helperText={
                    senhasNaoConferem
                      ? "As senhas não coincidem"
                      : "Digite a mesma senha novamente"
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="access_level"
                  label="Nível de Acesso *"
                  select
                  value={form.access_level}
                  onChange={handleChange}
                  required={criarUsuario}
                  fullWidth
                  helperText="Define o que o usuário pode fazer no sistema"
                >
                  <MenuItem value="CENTRAL">Central</MenuItem>
                  <MenuItem value="ALMOXARIFE">Almoxarife</MenuItem>
                  <MenuItem value="AUXILIAR">Auxiliar</MenuItem>
                  <MenuItem value="CONSULTA">Consulta (somente leitura)</MenuItem>
                </TextField>
              </Grid>

            </Grid>
          </Collapse>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </Stack>

        </form>
      </Paper>
    </Container>
  );
}
