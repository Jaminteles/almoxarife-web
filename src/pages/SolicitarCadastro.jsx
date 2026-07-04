import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { API_BASE } from "../auth/http";

const vazio = { nome: "", cpf: "", email: "", senha: "", confirmar: "", mensagem: "" };

export default function SolicitarCadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...vazio });
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (form.senha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (form.senha !== form.confirmar) {
      setErro("As senhas não conferem.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`${API_BASE}/api/solicitacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          cpf: form.cpf,
          email: form.email,
          senha: form.senha,
          mensagem: form.mensagem,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.sucesso) {
        throw new Error(json.erro || "Não foi possível enviar a solicitação");
      }
      setOk(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{ p: 4, width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 1 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <PersonAddIcon />
          </Avatar>
          <Typography variant="h5" fontWeight={700}>
            Solicitar acesso
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Preencha seus dados. A administração central irá analisar e criar sua conta.
          </Typography>
        </Box>

        {ok ? (
          <>
            <Alert severity="success">
              Solicitação enviada! Você poderá entrar assim que a administração central aprovar seu acesso.
            </Alert>
            <Button variant="contained" onClick={() => navigate("/login")}>
              Voltar ao login
            </Button>
          </>
        ) : (
          <>
            {erro && <Alert severity="error">{erro}</Alert>}

            <TextField label="Nome completo" name="nome" value={form.nome} onChange={handleChange} required fullWidth />
            <TextField label="CPF (somente números)" name="cpf" value={form.cpf} onChange={handleChange} required fullWidth inputProps={{ maxLength: 14 }} />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
            <TextField label="Senha (mín. 8 caracteres)" name="senha" type="password" value={form.senha} onChange={handleChange} required fullWidth />
            <TextField label="Confirmar senha" name="confirmar" type="password" value={form.confirmar} onChange={handleChange} required fullWidth />
            <TextField label="Mensagem (opcional)" name="mensagem" value={form.mensagem} onChange={handleChange} fullWidth multiline minRows={2} placeholder="Ex.: cargo pretendido, almoxarifado onde atua…" />

            <Button type="submit" variant="contained" size="large" disabled={enviando} sx={{ mt: 1 }}>
              {enviando ? "Enviando..." : "Enviar solicitação"}
            </Button>

            <Stack direction="row" justifyContent="center">
              <MuiLink component="button" type="button" variant="body2" onClick={() => navigate("/login")}>
                Já tem conta? Entrar
              </MuiLink>
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}
