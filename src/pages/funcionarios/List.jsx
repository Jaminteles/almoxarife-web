import { Container, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ListTemplate from "../../components/ListTemplate";

export default function FuncionariosList() {
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inactivating, setInactivating] = useState(false);
  const [error, setError] = useState("");

  // Remove formatação (. / -) do CPF/CNPJ
  function removeFormatting(value) {
    return value.replace(/[.\/-]/g, "");
  }

  function handleEdit(item) {
    const cpfClean = removeFormatting(item.cpf);
    navigate(`/funcionarios/${cpfClean}/editar`);
  }

  function handleInactivateClick(item) {
    setSelectedItem(item);
    setOpenConfirm(true);
  }

  function handleConfirmInactivate() {
    setInactivating(true);
    setError("");

    const cpfClean = removeFormatting(selectedItem.cpf);

    fetch(`http://localhost:3001/api/funcionarios/${cpfClean}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          // Recarregar a página ou remover da lista
          window.location.reload();
        } else {
          setError(data.erro || "Erro ao inativar funcionário");
          setInactivating(false);
        }
      })
      .catch(err => {
        setError("Erro ao inativar: " + err.message);
        setInactivating(false);
      });

    setOpenConfirm(false);
  }

  function handleCloseConfirm() {
    setOpenConfirm(false);
    setSelectedItem(null);
  }

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
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ListTemplate
        title="Funcionários"
        columns={["Nome", "CPF", "Email", "Cargo"]}
        data={data}
        onCreate={() => navigate("/funcionarios/cadastro")}
        onEdit={handleEdit}
        onInactivate={handleInactivateClick}
        filters={
          <>
            <TextField label="Nome" size="small" />
            <TextField label="CPF" size="small" />
            <TextField label="Email" size="small" />
          </>
        }
      />

      {/* Dialog de confirmação */}
      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
      >
        <DialogTitle>Confirmar Inativação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja inativar o funcionário <strong>{selectedItem?.nome}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={inactivating}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmInactivate}
            color="warning"
            variant="contained"
            disabled={inactivating}
          >
            {inactivating ? "Inativando..." : "Inativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}