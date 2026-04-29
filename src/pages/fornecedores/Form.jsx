import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  Alert,
  IconButton,
  Divider,
  Grid,
  Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import FormPageHeader from "../../components/FormPageHeader";
import EnderecoFields from "../../components/EnderecoFields";

const API_URL = "http://localhost:5000/api";

const enderecoVazio = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };

export default function FornecedorForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    email: ""
  });

  const [telefones, setTelefones] = useState([""]);
  const [enderecos, setEnderecos] = useState([{ ...enderecoVazio }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // === Telefones ===
  function handleTelefoneChange(index, value) {
    const novos = [...telefones];
    novos[index] = value;
    setTelefones(novos);
  }
  function adicionarTelefone() {
    setTelefones([...telefones, ""]);
  }
  function removerTelefone(index) {
    if (telefones.length === 1) return;
    setTelefones(telefones.filter((_, i) => i !== index));
  }

  // === Endereços ===
  function handleEnderecoChange(index, campo, value) {
    const novos = [...enderecos];
    novos[index] = { ...novos[index], [campo]: value };
    setEnderecos(novos);
  }
  function adicionarEndereco() {
    setEnderecos([...enderecos, { ...enderecoVazio }]);
  }
  function removerEndereco(index) {
    if (enderecos.length === 1) return;
    setEnderecos(enderecos.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const dados = {
      ...form,
      telefones: telefones.filter(t => t.trim() !== ""),
      enderecos: enderecos.filter(e => e.cep.trim() !== "")
    };

    fetch(`${API_URL}/fornecedores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          navigate("/fornecedores");
        } else {
          setError(result.erro || "Erro ao cadastrar fornecedor");
        }
        setSaving(false);
      })
      .catch(err => {
        setError("Erro ao cadastrar: " + err.message);
        setSaving(false);
      });
  }

  return (
    <Container maxWidth="tg">
      <FormPageHeader
        title="Cadastrar Fornecedor"
        subtitle="Preencha os dados do novo fornecedor."
        backTo="/fornecedores"
      />

      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* === Dados principais === */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Dados do fornecedor
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField name="razao_social" label="Razão Social" onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="nome_fantasia" label="Nome Fantasia" onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="cnpj" label="CNPJ" onChange={handleChange} required fullWidth
                helperText="Apenas números ou formato 00.000.000/0000-00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="email" label="Email" type="email" onChange={handleChange} required fullWidth />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* === Telefones === */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Telefones
            </Typography>
            <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={adicionarTelefone}>
              Adicionar
            </Button>
          </Box>

          <Stack spacing={1.5}>
            {telefones.map((tel, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <TextField
                  fullWidth size="small"
                  label={`Telefone ${i + 1}`}
                  value={tel}
                  onChange={(e) => handleTelefoneChange(i, e.target.value)}
                  required
                />
                <IconButton color="error" onClick={() => removerTelefone(i)} disabled={telefones.length === 1}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* === Endereços === */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Endereços
            </Typography>
            <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={adicionarEndereco}>
              Adicionar
            </Button>
          </Box>

          <Stack spacing={2}>
            {enderecos.map((end, i) => (
              <EnderecoFields
                key={i}
                endereco={end}
                index={i}
                onChange={handleEnderecoChange}
                onRemove={removerEndereco}
                disableRemove={enderecos.length === 1}
              />
            ))}
          </Stack>

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
