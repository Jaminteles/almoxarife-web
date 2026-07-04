import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import ListTemplate from "../../components/ListTemplate";

// Cor do chip conforme o status do pedido (ENUM status_pedido).
const CORES_STATUS = {
  PENDENTE: "warning",
  RECEBIDO: "success",
  CANCELADO: "default"
};

// Mesmo padrão das outras telas: fetch nativo + esta constante de URL.
const API_URL = "http://localhost:5000/api";

export default function ComprasList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Diálogo de confirmação da exclusão (RF de compras usa DELETE, igual Saídas).
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [removendo, setRemovendo] = useState(false);

  // Diálogo de confirmação do RECEBIMENTO (PENDENTE → RECEBIDO, dá entrada no estoque).
  const [openReceber, setOpenReceber] = useState(false);
  const [itemReceber, setItemReceber] = useState(null);
  const [recebendo, setRecebendo] = useState(false);

  // Filtros controlados. O compra.controller aceita numero_nota_fiscal e status
  // (entre outros) via query string.
  const [filtros, setFiltros] = useState({
    numero_nota_fiscal: "",
    status: "",
    produto: "",
    fornecedor: ""
  });

  useEffect(() => {
    carregarCompras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function carregarCompras(filtrosBusca = {}) {
    setLoading(true);
    setError("");

    // Monta a query string SÓ com os campos preenchidos — mesmo padrão de
    // Funcionários/Fornecedores/Saídas. Evita mandar ?status= vazio.
    const params = new URLSearchParams();
    Object.entries(filtrosBusca).forEach(([chave, valor]) => {
      if (valor && String(valor).trim() !== "") {
        params.append(chave, String(valor).trim());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/compras?${queryString}`
      : `${API_URL}/compras`;

    fetch(url)
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          // IMPORTANTE: o ListTemplate renderiza item[coluna]. Então cada objeto
          // precisa ter chaves com o NOME EXATO de cada coluna + um __id__ que as
          // ações (editar/excluir) usam. Por isso transformamos a resposta da API
          // nesse formato em vez de jogar o objeto cru do backend.
          const formatado = result.dados.map((c) => ({
            "Nota Fiscal": c.numero_nota_fiscal || "—",
            "Fornecedor":
              c.fornecedor?.razao_social ||
              c.fornecedor?.nome_fantasia ||
              "—",
            "Produtos":
              c.itens?.map((i) => i.produto?.nome || `Produto ${i.id_produto}`).join(", ") ||
              "—",
            "Data": formatarData(c.data_compra),
            "Status": (
              <Chip
                label={c.status}
                size="small"
                color={CORES_STATUS[c.status] || "default"}
                variant={c.status === "PENDENTE" ? "outlined" : "filled"}
              />
            ),
            __id__: c.id_compra,
            // Campos "crus" para a lógica das ações (o Status virou um Chip).
            __status__: c.status,
            __nota__: c.numero_nota_fiscal || "—"
          }));
          setData(formatado);
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

  function formatarData(valor) {
    if (!valor) return "—";
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
  }

  // ── Filtros ──
  function handleFiltroChange(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  }
  function handleBuscar() {
    carregarCompras(filtros);
  }
  function handleLimpar() {
    setFiltros({ numero_nota_fiscal: "", status: "", produto: "", fornecedor: "" });
    carregarCompras({});
  }
  function handleKeyDown(e) {
    if (e.key === "Enter") handleBuscar();
  }

  // ── Ações por linha ──
  function handleEdit(item) {
    // O ListTemplate passa o ITEM inteiro (não o id). Pegamos o __id__.
    navigate(`/compras/${item.__id__}/editar`);
  }
  function handleExcluirClick(item) {
    setSelectedItem(item);
    setOpenConfirm(true);
  }
  function handleConfirmRemove() {
    setRemovendo(true);
    setError("");

    fetch(`${API_URL}/compras/${selectedItem.__id__}`, {
      method: "DELETE"
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          carregarCompras(filtros); // recarrega mantendo os filtros atuais
        } else {
          setError(result.erro || "Erro ao excluir a compra");
        }
        finalizarDialogo();
      })
      .catch((err) => {
        setError("Erro ao excluir: " + err.message);
        finalizarDialogo();
      });
  }
  function finalizarDialogo() {
    setRemovendo(false);
    setOpenConfirm(false);
    setSelectedItem(null);
  }
  function handleCloseConfirm() {
    if (removendo) return; // não deixa fechar no meio da requisição
    setOpenConfirm(false);
    setSelectedItem(null);
  }

  // ── Confirmação de recebimento (PENDENTE → RECEBIDO) ──
  function handleReceberClick(item) {
    setItemReceber(item);
    setOpenReceber(true);
  }
  function handleConfirmReceber() {
    setRecebendo(true);
    setError("");

    fetch(`${API_URL}/compras/${itemReceber.__id__}/receber`, {
      method: "PATCH"
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          carregarCompras(filtros); // recarrega mantendo os filtros atuais
        } else {
          setError(result.erro || "Erro ao confirmar o recebimento");
        }
        finalizarReceber();
      })
      .catch((err) => {
        setError("Erro ao confirmar recebimento: " + err.message);
        finalizarReceber();
      });
  }
  function finalizarReceber() {
    setRecebendo(false);
    setOpenReceber(false);
    setItemReceber(null);
  }
  function handleCloseReceber() {
    if (recebendo) return;
    setOpenReceber(false);
    setItemReceber(null);
  }

  return (
    <Container maxWidth={false} disableGutters>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <ListTemplate
        modulo="compras"
        title="Compras"
        columns={["Nota Fiscal", "Fornecedor", "Produtos", "Data", "Status"]}
        data={data}
        loading={loading}
        onCreate={() => navigate("/compras/cadastro")}
        onEdit={handleEdit}
        onInactivate={handleExcluirClick}
        onSearch={handleBuscar}
        onClear={handleLimpar}
        emptyMessage="Nenhuma compra encontrada com os parâmetros informados."
        // Botão "Confirmar recebimento" — só nas compras PENDENTES. Ao confirmar,
        // o backend dá entrada no estoque e muda o status para RECEBIDO.
        rowActions={(item) =>
          item.__status__ === "PENDENTE" ? (
            <Tooltip title="Confirmar recebimento">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReceberClick(item);
                }}
                sx={{ color: "success.main" }}
              >
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null
        }
        // A ação destrutiva de compra é EXCLUSÃO (DELETE), não inativação —
        // por isso sobrescrevemos o botão padrão do template, igual em Saídas.
        actionLabel="Excluir"
        actionIcon={<DeleteOutlineIcon fontSize="small" />}
        actionColor="error.main"
        filters={
          <>
            <TextField
              label="Nota Fiscal"
              size="small"
              value={filtros.numero_nota_fiscal}
              onChange={(e) =>
                handleFiltroChange("numero_nota_fiscal", e.target.value)
              }
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Produto"
              size="small"
              value={filtros.produto}
              onChange={(e) =>
                handleFiltroChange("produto", e.target.value)
              }
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Fornecedor"
              size="small"
              value={filtros.fornecedor}
              onChange={(e) =>
                handleFiltroChange("fornecedor", e.target.value)
              }
              onKeyDown={handleKeyDown}
            />            
            <TextField
              select
              label="Status"
              size="small"
              value={filtros.status}
              onChange={(e) => handleFiltroChange("status", e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {/* Valores conforme o ENUM do schema: status_pedido
                  ENUM('PENDENTE','RECEBIDO','CANCELADO'). */}
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PENDENTE">Pendente</MenuItem>
              <MenuItem value="RECEBIDO">Recebido</MenuItem>
              <MenuItem value="CANCELADO">Cancelado</MenuItem>
            </TextField>
          </>
        }
      />

      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar exclusão da compra</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a compra da nota fiscal{" "}
            <strong>{selectedItem?.["Nota Fiscal"]}</strong>? Esta ação não pode
            ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={removendo}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
            disabled={removendo}
          >
            {removendo ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReceber} onClose={handleCloseReceber}>
        <DialogTitle>Confirmar recebimento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirmar o recebimento da compra da nota fiscal{" "}
            <strong>{itemReceber?.__nota__}</strong>? Os itens serão adicionados
            ao estoque do almoxarifado de destino e o status passará para{" "}
            <strong>RECEBIDO</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReceber} disabled={recebendo}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmReceber}
            color="success"
            variant="contained"
            disabled={recebendo}
          >
            {recebendo ? "Confirmando..." : "Confirmar recebimento"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
