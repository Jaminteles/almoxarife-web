import { Container, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import ListTemplate from "../../components/ListTemplate";

export default function FuncionariosList() {
  const navigate = useNavigate();

  const data = [
    {
      nome: "João",
      cpf: "123",
      email: "joao@email.com",
      cargo: "Almoxarife"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <BackButton />

      <ListTemplate
        title="Funcionários"
        columns={["Nome", "CPF", "Email", "Cargo"]}
        data={data}
        onCreate={() => navigate("/funcionarios/novo")}
        filters={
          <>
            <TextField label="Nome" size="small" />
            <TextField label="CPF" size="small" />
            <TextField label="Email" size="small" />
          </>
        }
      />
    </Container>
  );
}