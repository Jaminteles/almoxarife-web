import { Container, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ListTemplate from "../../components/ListTemplate";

export default function FuncionariosList() {
  const navigate = useNavigate();

  const data = [
    {
      nome: "João Silva",
      cpf: "123.456.789-01",
      email: "joao.silva@email.com",
      cargo: "Almoxarife"
    },
    {
      nome: "Maria Santos",
      cpf: "987.654.321-00",
      email: "maria.santos@email.com",
      cargo: "Ajudante"
    },
    {
      nome: "Pedro Oliveira",
      cpf: "456.789.123-45",
      email: "pedro.oliveira@email.com",
      cargo: "Almoxarife"
    },
    {
      nome: "Ana Costa",
      cpf: "321.654.987-12",
      email: "ana.costa@email.com",
      cargo: "Ajudante"
    },
    {
      nome: "Carlos Pereira",
      cpf: "789.123.456-78",
      email: "carlos.pereira@email.com",
      cargo: "Engenheiro"
    },
    {
      nome: "Fernanda Lima",
      cpf: "654.321.987-65",
      email: "fernanda.lima@email.com",
      cargo: "Ajudante"
    },
    {
      nome: "Roberto Alves",
      cpf: "147.258.369-14",
      email: "roberto.alves@email.com",
      cargo: "Engenheiro"
    },
    {
      nome: "Juliana Rocha",
      cpf: "963.852.741-96",
      email: "juliana.rocha@email.com",
      cargo: "Administrador"
    }
  ];

  return (
    <Container maxWidth="lg">

      <ListTemplate
        title="Funcionários"
        columns={["Nome", "CPF", "Email", "Cargo"]}
        data={data}
        onCreate={() => navigate("/funcionarios/cadastro")}
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