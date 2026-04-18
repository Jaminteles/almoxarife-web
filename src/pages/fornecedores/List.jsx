import {
  Container,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Snackbar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ListTemplate from "../../components/ListTemplate";

const API_URL = "http://localhost:5000/api";

/**
 * FornecedoresList — Tela de listagem de fornecedores.
 * 
 * VALIDAÇÃO DO BACKEND (RF012 - Fluxo de Exceção):
 * Se o fornecedor tiver pedidos em andamento (status 'PENDENTE'),
 * o backend retorna erro: "Não é possível inativar fornecedor com pedidos em andamento."
 */
export default function FornecedoresList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inactivating, setInactivating] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    carregarFornecedores();
  }, []);

  function carregarFornecedores() {
    setLoading(true);
    fetch(`${API_URL}/fornecedores`)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          const formatado = result.dados.map(f => ({
            id_fornecedor: f.id_fornecedor,
            razao_social: f.razao_social,
            cnpj: formatarCnpj(f.cnpj),
            email: f.email,
            telefone: f.telefones?.map(t => t.telefone).join(", ") || "—"
          }));
          setData(formatado);
        } else {
          setError(result.erro || "Erro ao carregar fornecedores");
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Erro ao conectar com o servidor: " + err.message);
        setLoading(false);
      });
  }

  function formatarCnpj(cnpj) {
    if (!cnpj || cnpj.length !== 14) return cnpj;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
  }

  function handleEdit(item) {
    const original = data.find(d => d.razao_social === item.razao_social && d.cnpj === item.cnpj);
    if (original) navigate(`/fornecedores/${original.id_fornecedor}/editar`);
  }

  function handleInactivateClick(item) {
    const original = data.find(d => d.razao_social === item.razao_social && d.cnpj === item.cnpj);
    if (original) {
      setSelectedItem(original);
      setOpenConfirm(true);
    }
  }

  function handleConfirmInactivate() {
    setInactivating(true);
    setError("");

    fetch(`${API_URL}/fornecedores/${selectedItem.id_fornecedor}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          carregarFornecedores();
          setSnackbar({
            open: true,
            message: `Fornecedor "${selectedItem.razao_social}" inativado com sucesso`,
            severity: "success"
          });
        } else {
          setSnackbar({
            open: true,
            message: result.erro || "Erro ao inativar fornecedor",
            severity: "error"
          });
        }
        setInactivating(false);
      })
      .catch(err => {
        setSnackbar({
          open: true,
          message: "Erro ao inativar: " + err.message,
          severity: "error"
        });
        setInactivating(false);
      });

    setOpenConfirm(false);
  }

  function handleCloseConfirm() {
    setOpenConfirm(false);
    setSelectedItem(null);
  }

  // Remove o id_fornecedor dos dados visíveis na tabela
  const dataVisivel = data.map(({ id_fornecedor, ...visivel }) => visivel);

  return (
    <Container maxWidth="lg">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ListTemplate
        title="Fornecedores"
        columns={["Razão Social", "CNPJ", "Email", "Telefone"]}
        data={dataVisivel}
        loading={loading}
        onCreate={() => navigate("/fornecedores/cadastro")}
        onEdit={handleEdit}
        /* onInactivate ativa o botão "Inativar" neste módulo */
        onInactivate={handleInactivateClick}
        filters={
          <>
            <TextField label="Razão Social" size="small" />
            <TextField label="CNPJ" size="small" />
          </>
        }
      />

      {/* Dialog de confirmação conforme RF012 */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar Inativação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja inativar o fornecedor <strong>{selectedItem?.razao_social}</strong>?
            <br />
            <br />
            O registro será mantido no sistema para histórico e referência futura.
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
