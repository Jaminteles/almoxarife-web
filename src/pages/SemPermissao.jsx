import { Box, Typography, Button, Paper } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";

/**
 * Exibida quando o usuário tenta acessar um módulo fora do seu nível.
 */
export default function SemPermissao() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
      <Paper elevation={0} sx={{ p: 5, maxWidth: 460, textAlign: "center" }}>
        <LockIcon sx={{ fontSize: 56, color: "primary.main", mb: 1 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Acesso negado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Você não tem permissão para acessar esta tela. Se acha que isso é um
          engano, fale com a administração central.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Voltar ao início
        </Button>
      </Paper>
    </Box>
  );
}
