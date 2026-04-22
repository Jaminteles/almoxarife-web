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
  IconButton,
  Divider,
  Grid,
  Box
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import FormPageHeader from "../../components/FormPageHeader";
import EnderecoFields from "../../components/EnderecoFields";

const API_URL = "http://localhost:5000/api";

const enderecoVazio = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };

export default function FornecedorEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    email: ""
  });

  const [telefones, setTelefones] = useState([""]);
  const [enderecos, setEnderecos] = useState([{ ...enderecoVazio }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/fornecedores/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          const f = result.dados;
          setForm({
            razao_social: f.razao_social,
            nome_fantasia: f.nome_fantasia || "",
            cnpj: f.cnpj,
            email: f.email
          });

          if (f.telefones && f.telefones.length > 0) {
            setTelefones(f.telefones.map(t => t.telefone));
          }

          if (f.enderecos && f.enderecos.length > 0) {
            setEnderecos(f.enderecos.map(e => ({
              cep: e.cep || "",
              logradouro: e.logradouro || "",
              numero: e.numero || "",
              complemento: e.complemento || "",
              bairro: e.bairro || "",
              cidade: e.cidade || "",
              estado: e.estado || ""
            })));
          }
        } else {
          setError("Fornecedor não encontrado");
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Erro ao carregar fornecedor: " + err.message);
        setLoading(false);
      });
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleTelefoneChange(index, value) {
    const novos = [...telefones];
    novos[index] = value;
    setTelefones(novos);
  }
  function adicionarTelefone() { setTelefones([...telefones, ""]); }
  function removerTelefone(index) {
    if (telefones.length === 1) return;
    setTelefones(telefones.filter((_, i) => i !== index));
  }

  function handleEnderecoChange(index, campo, value) {
    const novos = [...enderecos];
    novos[index] = { ...novos[index], [campo]: value };
    setEnderecos(novos);
  }
  function adicionarEndereco() { setEnderecos([...enderecos, { ...enderecoVazio }]); }
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

    fetch(`${API_URL}/fornecedores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          navigate("/fornecedores");
        } else {
          setError(result.erro || "Erro ao atualizar fornecedor");
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
        title="Editar Fornecedor"
        subtitle="Atualize as informações do fornecedor."
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
              <TextField name="razao_social" label="Razão Social *" value={form.razao_social} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="nome_fantasia" label="Nome Fantasia" value={form.nome_fantasia} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="cnpj" label="CNPJ *" value={form.cnpj} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="email" label="Email *" type="email" value={form.email} onChange={handleChange} required fullWidth />
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
