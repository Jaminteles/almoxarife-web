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

export default function FornecedorEdit() {
  const navigate = useNavigate();
  const { cnpj } = useParams();

  // Remove formatação (. / -) do CPF/CNPJ
  function removeFormatting(value) {
    return value.replace(/[\.\/-]/g, "");
  }

  const cnpjClean = removeFormatting(cnpj);

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Buscar dados do fornecedor
    fetch(`http://localhost:3001/api/fornecedores/${cnpjClean}`)
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          setForm(data.dados);
          setLoading(false);
        } else {
          setError("Fornecedor não encontrado");
          setLoading(false);
        }
      })
      .catch(err => {
        setError("Erro ao carregar fornecedor: " + err.message);
        setLoading(false);
      });
  }, [cnpjClean]);

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

    fetch(`http://localhost:3001/api/fornecedores/${cnpjClean}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          console.log("Fornecedor atualizado:", data.dados);
          navigate("/fornecedores");
        } else {
          setError(data.erro || "Erro ao atualizar fornecedor");
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
          Editar Fornecedor
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
              name="cnpj"
              label="CNPJ"
              value={form.cnpj}
              onChange={handleChange}
              required
            />
            <TextField
              name="telefone"
              label="Telefone"
              value={form.telefone}
              onChange={handleChange}
            />
            <TextField
              name="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              name="endereco"
              label="Endereço"
              value={form.endereco}
              onChange={handleChange}
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
