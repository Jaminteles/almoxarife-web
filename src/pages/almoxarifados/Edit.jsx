import { useEffect, useState } from "react";
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
  Box,
  CircularProgress
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import FormPageHeader from "../../components/FormPageHeader";
import EnderecoFields from "../../components/EnderecoFields";

/**
 * Tela de Edicao de Almoxarifado (RF015).
 *
 * INTEGRADO AO BACKEND:
 *  - useEffect carrega via GET /api/almoxarifados/:id
 *  - submit atualiza via PUT /api/almoxarifados/:id
 *
 * Telefones MULTIPLOS: a API devolve `telefones` como [{ telefone }, ...].
 * Lemos para um array de strings (UI) e reenviamos como array no submit.
 */

const API_URL = `${window.location.origin}/api`;

const enderecoVazio = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: ""
};

export default function AlmoxarifadoEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({ nome: "", email: "" });
  const [telefones, setTelefones] = useState([""]);
  const [endereco, setEndereco] = useState({ ...enderecoVazio });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_URL}/almoxarifados/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          const a = result.dados;
          setForm({ nome: a.nome, email: a.email });
          // API devolve telefones como [{ telefone }]. Mapeamos para strings.
          setTelefones(a.telefones?.length ? a.telefones.map(t => t.telefone) : [""]);
          setEndereco({
            cep: a.endereco?.cep || "",
            logradouro: a.endereco?.logradouro || "",
            numero: a.endereco?.numero || "",
            complemento: a.endereco?.complemento || "",
            bairro: a.endereco?.bairro || "",
            cidade: a.endereco?.cidade || "",
            estado: a.endereco?.estado || ""
          });
        } else {
          setError(result.erro || "Almoxarifado não encontrado");
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Erro ao carregar: " + err.message);
        setLoading(false);
      });
  }, [id]);

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

    // PUT (atualiza). Telefones vao como ARRAY (backend substitui todos).
    const dados = {
      nome: form.nome,
      email: form.email,
      telefones: telefonesValidos,
      endereco
    };

    fetch(`${API_URL}/almoxarifados/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          navigate("/almoxarifados");
        } else {
          setError(result.erro || "Erro ao atualizar almoxarifado");
        }
        setSaving(false);
      })
      .catch(err => {
        setError("Erro ao atualizar: " + err.message);
        setSaving(false);
      });
  }

  // Loading state — evita mostrar o form vazio enquanto os dados nao chegaram.
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <FormPageHeader
        title="Editar Almoxarifado"
        subtitle="Atualize os dados do almoxarifado."
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

          {/* === Endereco unico === */}
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
