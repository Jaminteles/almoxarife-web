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
  Box
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

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
      <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" mb={2}>Editar Fornecedor</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField name="razao_social" label="Razão Social" value={form.razao_social} onChange={handleChange} required />
            <TextField name="nome_fantasia" label="Nome Fantasia" value={form.nome_fantasia} onChange={handleChange} />
            <TextField name="cnpj" label="CNPJ" value={form.cnpj} onChange={handleChange} required />
            <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} required />

            {/* Telefones */}
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">Telefones</Typography>
            {telefones.map((tel, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <TextField fullWidth size="small" label={`Telefone ${i + 1}`} value={tel}
                  onChange={(e) => handleTelefoneChange(i, e.target.value)} />
                <IconButton color="error" onClick={() => removerTelefone(i)} disabled={telefones.length === 1}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Stack>
            ))}
            <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={adicionarTelefone}>
              Adicionar Telefone
            </Button>

            {/* Endereços */}
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">Endereço</Typography>
            {enderecos.map((end, i) => (
              <Box key={i} sx={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, p: 2, mb: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption">Endereço {i + 1}</Typography>
                    <IconButton size="small" color="error" onClick={() => removerEndereco(i)} disabled={enderecos.length === 1}>
                      <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField size="small" label="CEP" value={end.cep}
                      onChange={(e) => handleEnderecoChange(i, "cep", e.target.value)} sx={{ width: "40%" }} />
                    <TextField size="small" label="Estado" value={end.estado}
                      onChange={(e) => handleEnderecoChange(i, "estado", e.target.value)} sx={{ width: "20%" }}
                      inputProps={{ maxLength: 2 }} />
                    <TextField size="small" label="Cidade" value={end.cidade}
                      onChange={(e) => handleEnderecoChange(i, "cidade", e.target.value)} sx={{ width: "40%" }} />
                  </Stack>
                  <TextField size="small" label="Logradouro" value={end.logradouro}
                    onChange={(e) => handleEnderecoChange(i, "logradouro", e.target.value)} fullWidth />
                  <Stack direction="row" spacing={1}>
                    <TextField size="small" label="Número" value={end.numero}
                      onChange={(e) => handleEnderecoChange(i, "numero", e.target.value)} sx={{ width: "30%" }} />
                    <TextField size="small" label="Bairro" value={end.bairro}
                      onChange={(e) => handleEnderecoChange(i, "bairro", e.target.value)} sx={{ width: "70%" }} />
                  </Stack>
                  <TextField size="small" label="Complemento" value={end.complemento}
                    onChange={(e) => handleEnderecoChange(i, "complemento", e.target.value)} fullWidth />
                </Stack>
              </Box>
            ))}
            <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={adicionarEndereco}>
              Adicionar Endereço
            </Button>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar</Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
