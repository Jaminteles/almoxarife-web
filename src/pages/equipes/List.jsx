import { useEffect, useState } from "react";
import {
  Container,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import ListTemplate from "../../components/ListTemplate";

const API_URL = `${window.location.origin}/api`;

export default function EquipesList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtroNome, setFiltroNome] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inativando, setInativando] = useState(false);

  useEffect(() => {
    carregarEquipes("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function carregarEquipes(nome) {
    setLoading(true);
    setError("");

    const query = nome && nome.trim() ? `?nome=${encodeURIComponent(nome.trim())}` : "";

    fetch(`${API_URL}/equipes${query}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          const formatado = result.dados.map((e) => ({
            "Nome": e.nome,
            // Mostra os nomes dos funcionários da equipe (o 2º campo pedido).
            "Funcionários":
              e.funcionarios?.length
                ? e.funcionarios.map((f) => f.nome).join(", ")
                : "—",
            __id__: e.id_equipe
          }));
          setData(formatado);
        } else {
          setError(result.erro || "Erro ao carregar equipes");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao conectar com o servidor: " + err.message);
        setLoading(false);
      });
  }

  function handleBuscar() {
    carregarEquipes(filtroNome);
  }

  function handleLimpar() {
    setFiltroNome("");
    carregarEquipes("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleBuscar();
  }

  function handleEdit(item) {
    navigate(`/equipes/${item.__id__}/editar`);
  }

  function handleInativarClick(item) {
    setSelectedItem(item);
    setOpenConfirm(true);
  }

  function handleConfirmInativar() {
    setInativando(true);
    setError("");

    fetch(`${API_URL}/equipes/${selectedItem.__id__}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          carregarEquipes(filtroNome);
        } else {
          setError(result.erro || "Erro ao inativar a equipe");
        }
        finalizarDialogo();
      })
      .catch((err) => {
        setError("Erro ao inativar: " + err.message);
        finalizarDialogo();
      });
  }

  function finalizarDialogo() {
    setInativando(false);
    setOpenConfirm(false);
    setSelectedItem(null);
  }

  function handleCloseConfirm() {
    if (inativando) return;
    setOpenConfirm(false);
    setSelectedItem(null);
  }

  return (
    <Container maxWidth={false} disableGutters>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ListTemplate
        modulo="equipes"
        title="Equipes"
        columns={["Nome", "Funcionários"]}
        data={data}
        loading={loading}
        onCreate={() => navigate("/equipes/cadastro")}
        onEdit={handleEdit}
        onInactivate={handleInativarClick}
        onSearch={handleBuscar}
        onClear={handleLimpar}
        emptyMessage="Nenhuma equipe encontrada."
        filters={
          <TextField
            label="Nome"
            size="small"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        }
      />

      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar inativação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja inativar a equipe <strong>{selectedItem?.Nome}</strong>? Os
            funcionários dela ficarão sem equipe. Esta ação pode ser revertida
            pelo administrador.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={inativando}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmInativar} color="warning" variant="contained" disabled={inativando}>
            {inativando ? "Inativando..." : "Inativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
