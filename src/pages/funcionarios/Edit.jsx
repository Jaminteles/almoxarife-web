import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function FuncionarioEdit() {
  const navigate = useNavigate();
  const { cpf } = useParams();

  // Remove formatação (. / -) do CPF/CNPJ
  function removeFormatting(value) {
    return value.replace(/[.\/-]/g, "");
  }

  const cpfClean = removeFormatting(cpf);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    cargo: "",
    login: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Buscar dados do funcionário
    fetch(`http://localhost:3001/api/funcionarios/${cpfClean}`)
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          setForm(data.dados);
          setLoading(false);
        } else {
          setError("Funcionário não encontrado");
          setLoading(false);
        }
      })
      .catch(err => {
        setError("Erro ao carregar funcionário: " + err.message);
        setLoading(false);
      });
  }, [cpfClean]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Não enviar campos que não devem ser alterados
    const dados = { ...form };
    delete dados.id;

    fetch(`http://localhost:3001/api/funcionarios/${cpfClean}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          console.log("Funcionário atualizado:", data.dados);
          navigate("/funcionarios");
        } else {
          setError(data.erro || "Erro ao atualizar funcionário");
        }
      })
      .catch(err => {
        setError("Erro ao atualizar: " + err.message);
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
        <Typography variant="h5" mb={2}>
          Editar Funcionário
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              name="nome"
              label="Nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
            <TextField
              name="cpf"
              label="CPF"
              value={form.cpf}
              onChange={handleChange}
              required
            />
            <TextField
              name="cargo"
              label="Cargo"
              value={form.cargo}
              onChange={handleChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              name="login"
              label="Login"
              value={form.login}
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
