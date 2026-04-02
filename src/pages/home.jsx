import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="80vh"
        gap={4}
      >
        <Typography variant="h4" fontWeight="bold">
          Sistema de Almoxarifado
        </Typography>

        <Box display="flex" gap={3}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/funcionarios")}
          >
            Funcionários
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/fornecedores")}
          >
            Fornecedores
          </Button>
        </Box>
      </Box>
    </Container>
  );
}