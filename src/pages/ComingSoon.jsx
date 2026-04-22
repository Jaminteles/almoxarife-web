import { Container, Box, Typography, Paper, Button } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

/**
 * Placeholder para módulos ainda não implementados.
 *
 * Recebe `title` como prop para que cada rota mostre o nome correto do módulo.
 * Componente reutilizável = 1 arquivo, N módulos pendentes.
 */
export default function ComingSoon({ title = "Em desenvolvimento" }) {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            bgcolor: "rgba(239, 68, 68, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3
          }}
        >
          <ConstructionIcon sx={{ fontSize: 48, color: "primary.main" }} />
        </Box>

        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: "auto" }}>
          Este módulo ainda está em desenvolvimento. Em breve você poderá gerenciar
          todas as funcionalidades relacionadas a <strong>{title}</strong> por aqui.
        </Typography>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
        >
          Voltar para o início
        </Button>
      </Paper>
    </Container>
  );
}
