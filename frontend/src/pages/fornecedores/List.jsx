import { Container, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ListTemplate from "../../components/ListTemplate";

export default function FornecedoresList() {
  const navigate = useNavigate();

  const data = [
    {
      nome: "Fornecedor X",
      cnpj: "000111222",
      telefone: "9999-9999"
    }
  ];

  return (
    <Container maxWidth="lg">

      <ListTemplate
        title="Fornecedores"
        columns={["Nome", "CNPJ", "Telefone"]}
        data={data}
        onCreate={() => navigate("/fornecedores/novo")}
        filters={
          <>
            <TextField label="Nome" size="small" />
            <TextField label="CNPJ" size="small" />
          </>
        }
      />
    </Container>
  );
}