import { Container, Typography, Box } from "@mui/material";

export default function Home() {

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

        </Box>
      </Box>
    </Container>
  );
}