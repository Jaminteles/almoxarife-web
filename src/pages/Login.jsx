import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Avatar,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Rota para onde voltar após logar (definida pelo ProtectedRoute).
  const destino = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await login(email, senha);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err.message || "Não foi possível entrar");
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
        sx={{ p: 4, width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 1 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <WarehouseIcon />
          </Avatar>
          <Typography variant="h5" fontWeight={700}>
            Sistema de Almoxarifado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Entre com suas credenciais
          </Typography>
        </Box>

        {erro && <Alert severity="error">{erro}</Alert>}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
          fullWidth
        />

        <TextField
          label="Senha"
          type={mostrarSenha ? "text" : "password"}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setMostrarSenha((v) => !v)} edge="end" size="small">
                  {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={enviando}
          sx={{ mt: 1 }}
        >
          {enviando ? "Entrando..." : "Entrar"}
        </Button>

        <Stack direction="row" justifyContent="center" sx={{ mt: 0.5 }}>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            onClick={() => navigate("/solicitar-cadastro")}
          >
            Não tem conta? Solicitar acesso
          </MuiLink>
        </Stack>
      </Paper>
    </Box>
  );
}
