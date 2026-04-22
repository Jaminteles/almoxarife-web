import { Container, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ListTemplate from "../../components/ListTemplate";

const API_URL = "http://localhost:5000/api";

export default function FornecedoresList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inactivating, setInactivating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Estado dos filtros de busca (controlled inputs)
  const [filtros, setFiltros] = useState({
    razao_social: "",
    cnpj: ""
  });

  // Carrega tudo na primeira vez
  useEffect(() => {
    carregarFornecedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Função central de busca ──
  // Aceita filtros como parâmetro OU usa os do state
  function carregarFornecedores(filtrosBusca = {}) {
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
      ? `${API_URL}/fornecedores?${queryString}`
      : `${API_URL}/fornecedores`;

    fetch(url)
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
    return `${cnpj.slice(0,2)}.${cnpj.slice(2,5)}.${cnpj.slice(5,8)}/${cnpj.slice(8,12)}-${cnpj.slice(12)}`;
  }

  // ── Handlers dos filtros ──
  function handleFiltroChange(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }

  function handleBuscar() {
    carregarFornecedores(filtros);
  }

  function handleLimpar() {
    setFiltros({ razao_social: "", cnpj: "" });
    carregarFornecedores({});
  }

  // Permitir buscar apertando Enter em qualquer campo de filtro
  function handleKeyDown(e) {
    if (e.key === "Enter") handleBuscar();
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
          carregarFornecedores(filtros); // recarrega mantendo filtros atuais
        } else {
          setError(result.erro || "Erro ao inativar fornecedor");
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

  const dataTabela = data.map(({ id_fornecedor, ...rest }) => rest);

  return (
    <Container maxWidth="lg">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ListTemplate
        title="Fornecedores"
        columns={["Razão Social", "CNPJ", "Email", "Telefone"]}
        data={dataTabela}
        loading={loading}
        onCreate={() => navigate("/fornecedores/cadastro")}
        onEdit={handleEdit}
        onInactivate={handleInactivateClick}
        onSearch={handleBuscar}
        onClear={handleLimpar}
        emptyMessage="Nenhum fornecedor encontrado com os parâmetros informados."
        filters={
          <>
            <TextField
              label="Razão Social"
              size="small"
              value={filtros.razao_social}
              onChange={(e) => handleFiltroChange("razao_social", e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="CNPJ"
              size="small"
              value={filtros.cnpj}
              onChange={(e) => handleFiltroChange("cnpj", e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </>
        }
      />

      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar Inativação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja inativar o fornecedor <strong>{selectedItem?.razao_social}</strong>?
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
