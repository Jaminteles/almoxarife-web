import { Container, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ListTemplate from "../../components/ListTemplate";

const API_URL = "http://localhost:5000/api";

export default function FuncionariosList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inactivating, setInactivating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Carrega funcionários da API
  useEffect(() => {
    carregarFuncionarios();
  }, []);

  function carregarFuncionarios() {
    setLoading(true);
    fetch(`${API_URL}/funcionarios`)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          // Mapeia para o formato da tabela
          const formatado = result.dados.map(f => ({
            id_funcionario: f.id_funcionario,
            nome: f.nome,
            cpf: formatarCpf(f.cpf),
            cargo: f.cargo?.nome_cargo || "—",
            email: f.usuario?.email || "—"
          }));
          setData(formatado);
        } else {
          setError(result.erro || "Erro ao carregar funcionários");
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Erro ao conectar com o servidor: " + err.message);
        setLoading(false);
      });
  }

  function formatarCpf(cpf) {
    if (!cpf || cpf.length !== 11) return cpf;
    return `${cpf.slice(0,3)}.${cpf.slice(3,6)}.${cpf.slice(6,9)}-${cpf.slice(9)}`;
  }

  function handleEdit(item) {
    navigate(`/funcionarios/${item.id_funcionario}/editar`);
  }

  function handleInactivateClick(item) {
    setSelectedItem(item);
    setOpenConfirm(true);
  }

  function handleConfirmInactivate() {
    setInactivating(true);
    setError("");

    fetch(`${API_URL}/funcionarios/${selectedItem.id_funcionario}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          carregarFuncionarios();
        } else {
          setError(result.erro || "Erro ao inativar funcionário");
        }
        setInactivating(false);
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

  // Filtra apenas as colunas visíveis (sem o id_funcionario)
  const dataTabela = data.map(({ id_funcionario, ...rest }) => ({ ...rest, id_funcionario }));

  return (
    <Container maxWidth="lg">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ListTemplate
        title="Funcionários"
        columns={["Nome", "CPF", "Cargo", "Email"]}
        data={dataTabela.map(({ id_funcionario, ...visivel }) => visivel)}
        onCreate={() => navigate("/funcionarios/cadastro")}
        onEdit={(item) => {
          // Recupera o id_funcionario pelo índice
          const idx = dataTabela.findIndex(d => d.nome === item.nome && d.cpf === item.cpf);
          if (idx >= 0) handleEdit(dataTabela[idx]);
        }}
        onInactivate={(item) => {
          const idx = dataTabela.findIndex(d => d.nome === item.nome && d.cpf === item.cpf);
          if (idx >= 0) handleInactivateClick(dataTabela[idx]);
        }}
        filters={
          <>
            <TextField label="Nome" size="small" />
            <TextField label="CPF" size="small" />
          </>
        }
      />

      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar Inativação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja inativar o funcionário <strong>{selectedItem?.nome}</strong>?
            <br />
            Esta ação pode ser revertida pelo administrador.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={inactivating}>Cancelar</Button>
          <Button onClick={handleConfirmInactivate} color="warning" variant="contained" disabled={inactivating}>
            {inactivating ? "Inativando..." : "Inativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
