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
  GridLegacy as Grid,
  Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import FormPageHeader from "../../components/FormPageHeader";
import EnderecoFields from "../../components/EnderecoFields";

/**
 * Tela de Cadastro de Almoxarifado (RF013).
 *
 * INTEGRADO AO BACKEND: POST /api/almoxarifados.
 * Telefones sao MULTIPLOS: enviados como array `telefones` (mesmo padrao
 * do Fornecedor). O backend grava cada um na tabela Telefone_Almoxarifado.
 */

const API_URL = `http://${window.location.hostname}:5000/api`;

const enderecoVazio = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: ""
};

export default function AlmoxarifadoForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ nome: "", email: "" });
  const [telefones, setTelefones] = useState([""]);
  const [endereco, setEndereco] = useState({ ...enderecoVazio });

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

  // === Endereco unico ===
  function handleEnderecoChange(_index, campo, valor) {
    setEndereco(prev => ({ ...prev, [campo]: valor }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const telefonesValidos = telefones.filter(t => t.trim() !== "");
    if (telefonesValidos.length === 0) {
      setError("Informe ao menos um telefone para contato.");
      setSaving(false);
      return;
    }

    // Telefones vao como ARRAY de strings. O backend grava todos.
    const dados = {
      nome: form.nome,
      email: form.email,
      telefones: telefonesValidos,
      endereco // objeto unico (nao array)
    };

    fetch(`${API_URL}/almoxarifados`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          navigate("/almoxarifados");
        } else {
          setError(result.erro || "Erro ao cadastrar almoxarifado");
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
        title="Cadastrar Almoxarifado"
        subtitle="Preencha os dados do novo almoxarifado."
        backTo="/almoxarifados"
      />

      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* === Dados principais === */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Dados do almoxarifado
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
                helperText="Ex.: Almoxarifado Central, Almoxarifado Obra Norte"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
              />
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
                  fullWidth
                  size="small"
                  label={`Telefone ${i + 1}`}
                  value={tel}
                  onChange={(e) => handleTelefoneChange(i, e.target.value)}
                  required={i === 0}
                />
                <IconButton
                  color="error"
                  onClick={() => removerTelefone(i)}
                  disabled={telefones.length === 1}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* === Endereco (unico) === */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Endereço
          </Typography>

          <EnderecoFields
            endereco={endereco}
            index={0}
            onChange={handleEnderecoChange}
          />

          {/* === Acoes === */}
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
