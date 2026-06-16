import { useEffect, useState } from "react";
import {
  Container,
  Alert,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TableRow,
  TableCell
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import ListTemplate from "../../components/ListTemplate";

const API_URL = "http://localhost:5000/api";
const filtrosVazios = { data: "", fornecedor: "", status: "" };

export default function ListCompras() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState({ ...filtrosVazios });
  const [fornecedores, setFornecedores] = useState([]);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [removendo, setRemovendo] = useState(false);

  useEffect(() => {
    carregarCompras({});
    carregarOpcoesFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function carregarOpcoesFiltros() {
    fetch(`${API_URL}/fornecedores`)
      .then((res) => res.json())
      .then((res) => {
        if (res.sucesso) setFornecedores(res.dados || []);
        else if (Array.isArray(res)) setFornecedores(res);
      })
      .catch(() => {});
  }

  function formatarData(valor) {
    if (!valor) return "—";
    const d = new Date(valor);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR", { timeZone: 'UTC' }); 
  }

  function carregarCompras(filtrosAtuais) {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (filtrosAtuais.data) params.append("data", filtrosAtuais.data);
    if (filtrosAtuais.fornecedor) params.append("fornecedor", filtrosAtuais.fornecedor);
    if (filtrosAtuais.status) params.append("status", filtrosAtuais.status);
    const query = params.toString() ? `?${params.toString()}` : "";

    fetch(`${API_URL}/compras${query}`)
      .then((res) => res.json())
      .then((result) => {
        const isPadrao = result.sucesso !== undefined;
        const listaBruta = isPadrao ? result.dados : result;

        if (!isPadrao || result.sucesso) {
          setData(listaBruta || []);
        } else {
          setError(result.erro || "Erro ao carregar compras");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao conectar com o servidor: " + err.message);
        setLoading(false);
      });
  }

  function handleFiltroChange(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleBuscar() {
    carregarCompras(filtros);
  }

  function handleLimpar() {
    setFiltros({ ...filtrosVazios });
    carregarCompras({});
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleBuscar();
  }

  function handleExcluirClick(item) {
    setSelectedItem(item);
    setOpenConfirm(true);
  }

  function handleConfirmRemove() {
    setRemovendo(true);
    setError("");

    fetch(`${API_URL}/compras/${selectedItem.id_compra}`, { method: "DELETE" })
      .then((res) => {
        if (res.status === 204) return { sucesso: true };
        return res.json();
      })
      .then((result) => {
        if (result.sucesso || result.message) {
          carregarCompras(filtros);
        } else {
          setError(result.erro || "Erro ao remover a compra");
        }
        finalizarDialogo();
      })
      .catch((err) => {
        setError("Erro ao remover: " + err.message);
        finalizarDialogo();
      });
  }

  function finalizarDialogo() {
    setRemovendo(false);
    setOpenConfirm(false);
    setSelectedItem(null);
  }

  const columns = ["ID", "Data", "NF", "Fornecedor", "Status", "Valor Total", "Ações"];

  const renderRow = (compra) => (
    <TableRow key={compra.id_compra} hover>
      <TableCell>#{compra.id_compra}</TableCell>
      <TableCell>{formatarData(compra.data_pedido)}</TableCell>
      <TableCell>{compra.numero_nota_fiscal || "—"}</TableCell>
      <TableCell>{compra.Fornecedor?.nome || compra.fornecedor?.nome || "—"}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          compra.status_pedido === 'RECEBIDO' ? 'bg-green-100 text-green-800' :
          compra.status_pedido === 'CANCELADO' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {compra.status_pedido || 'PENDENTE'}
        </span>
      </TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>
        {compra.valor_total_pedido 
          ? Number(compra.valor_total_pedido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
          : 'R$ 0,00'}
      </TableCell>
      <TableCell>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            component={Link} 
            to={`/compras/editar/${compra.id_compra}`} 
            variant="outlined" 
            size="small" 
          >
            Editar
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="error"
            onClick={() => handleExcluirClick(compra)}
          >
            <DeleteOutlineIcon fontSize="small" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Container maxWidth="lg">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ListTemplate
        title="Listagem de Compras"
        columns={columns}
        data={data}
        renderRow={renderRow}
        loading={loading}
        onCreate={() => navigate("/compras/novo")}
        onSearch={handleBuscar}
        onClear={handleLimpar}
        emptyMessage="Nenhuma compra encontrada com os parâmetros informados."
        filters={
          <>
            <TextField
              label="Data do Pedido"
              type="date"
              size="small"
              value={filtros.data}
              onChange={(e) => handleFiltroChange("data", e.target.value)}
              InputLabelProps={{ shrink: true }}
              onKeyDown={handleKeyDown}
            />
            <TextField
              select
              label="Fornecedor"
              size="small"
              value={filtros.fornecedor}
              onChange={(e) => handleFiltroChange("fornecedor", e.target.value)}
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {fornecedores.map((fornecedor) => (
                <MenuItem key={fornecedor.id_fornecedor || fornecedor.id} value={fornecedor.id_fornecedor || fornecedor.id}>
                  {fornecedor.nome || fornecedor.razao_social}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              value={filtros.status}
              onChange={(e) => handleFiltroChange("status", e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PENDENTE">Pendente</MenuItem>
              <MenuItem value="RECEBIDO">Recebido</MenuItem>
              <MenuItem value="CANCELADO">Cancelado</MenuItem>
            </TextField>
          </>
        }
      />

      <Dialog open={openConfirm} onClose={finalizarDialogo}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover esta compra? Esta ação não pode ser desfeita e removerá os itens associados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={finalizarDialogo} disabled={removendo}>Cancelar</Button>
          <Button onClick={handleConfirmRemove} color="error" disabled={removendo}>
            {removendo ? "Removendo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}