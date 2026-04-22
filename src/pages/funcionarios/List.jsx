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

  // Estado dos filtros de busca (controlled inputs)
  const [filtros, setFiltros] = useState({
    nome: "",
    cpf: "",
    email: "",
    cargo: ""
  });

  // Carrega tudo na primeira vez
  useEffect(() => {
    carregarFuncionarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Função central de busca ──
  function carregarFuncionarios(filtrosBusca = {}) {
    setLoading(true);
    setError("");

    // Monta a query string apenas com campos preenchidos
    const params = new URLSearchParams();
    Object.entries(filtrosBusca).forEach(([chave, valor]) => {
      if (valor && String(valor).trim() !== "") {
        params.append(chave, String(valor).trim());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/funcionarios?${queryString}`
      : `${API_URL}/funcionarios`;

    fetch(url)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          const formatado = result.dados.map(f => ({
            "Nome": f.nome,
            "CPF": formatarCpf(f.cpf),
            "Cargo": f.cargo?.nome_cargo || "—",
            "Email": f.usuario?.email || "—",
            __id__: f.id_funcionario
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

  // ── Handlers dos filtros ──
  function handleFiltroChange(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }

  function handleBuscar() {
    carregarFuncionarios(filtros);
  }

  function handleLimpar() {
    setFiltros({ nome: "", cpf: "", email: "", cargo: "" });
    carregarFuncionarios({});
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleBuscar();
  }

  function handleEdit(item) {
    navigate(`/funcionarios/${item.__id__}/editar`);
  }

  function handleInactivateClick(item) {
    setSelectedItem(item);
    setOpenConfirm(true);
  }

  function handleConfirmInactivate() {
    setInactivating(true);
    setError("");

    fetch(`${API_URL}/funcionarios/${selectedItem.__id__}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          carregarFuncionarios(filtros); // recarrega mantendo os filtros atuais
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

  // Dados já têm __id__ incluído
  const dataTabela = data;

  return (
    <Container maxWidth="lg">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ListTemplate
        title="Funcionários"
        columns={["Nome", "CPF", "Cargo", "Email"]}
        data={dataTabela}
        loading={loading}
        onCreate={() => navigate("/funcionarios/cadastro")}
        onEdit={handleEdit}
        onInactivate={handleInactivateClick}
        onSearch={handleBuscar}
        onClear={handleLimpar}
        emptyMessage="Nenhum funcionário encontrado."
        filters={
          <>
            <TextField
              label="Nome"
              size="small"
              value={filtros.nome}
              onChange={(e) => handleFiltroChange("nome", e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="CPF"
              size="small"
              value={filtros.cpf}
              onChange={(e) => handleFiltroChange("cpf", e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Cargo"
              size="small"
              value={filtros.cargo}
              onChange={(e) => handleFiltroChange("cargo", e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Email"
              size="small"
              value={filtros.email}
              onChange={(e) => handleFiltroChange("email", e.target.value)}
              onKeyDown={handleKeyDown}
            />
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
