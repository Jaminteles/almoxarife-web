import { Container, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ListTemplate from "../../components/ListTemplate";

export default function FornecedoresList() {
  const navigate = useNavigate();

  const data = [
    {
      nome: "ABC Supplies Ltda",
      cnpj: "12.345.678/0001-90",
      telefone: "(11) 99999-1234"
    },
    {
      nome: "XYZ Distribuidora",
      cnpj: "98.765.432/0001-10",
      telefone: "(21) 88888-5678"
    },
    {
      nome: "Mega Fornecedores",
      cnpj: "11.222.333/0001-45",
      telefone: "(31) 77777-9012"
    },
    {
      nome: "Global Trade Co",
      cnpj: "44.555.666/0001-78",
      telefone: "(41) 66666-3456"
    },
    {
      nome: "Local Materiais",
      cnpj: "77.888.999/0001-23",
      telefone: "(51) 55555-7890"
    },
    {
      nome: "Indústria Nacional",
      cnpj: "33.444.555/0001-67",
      telefone: "(61) 44444-1234"
    },
    {
      nome: "Comércio Geral",
      cnpj: "66.777.888/0001-89",
      telefone: "(71) 33333-5678"
    },
    {
      nome: "Fornecedor Premium",
      cnpj: "22.333.444/0001-12",
      telefone: "(81) 22222-9012"
    }
  ];

  return (
    <Container maxWidth="lg">

      <ListTemplate
        title="Fornecedores"
        columns={["Nome", "CNPJ", "Telefone"]}
        data={data}
        onCreate={() => navigate("/fornecedores/cadastro")}
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