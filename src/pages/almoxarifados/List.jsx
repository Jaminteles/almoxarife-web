import {
  Container,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ListTemplate from "../../components/ListTemplate";
import { useAuth } from "../../auth/AuthContext";

/**
 * Tela de Listagem de Almoxarifados (RF014 — Consultar Almoxarifado).
 *
 * INTEGRADO AO BACKEND: esta tela agora consome a API real
 * (GET /api/almoxarifados e DELETE /api/almoxarifados/:id), no mesmo
 * padrao de Funcionarios e Fornecedores. O mock foi removido.
 */

const API_URL = "http://localhost:5000/api";

export default function AlmoxarifadosList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Usuário restrito a um almoxarifado não pode criar novos.
  const restrito = !!(user && user.access_level !== "CENTRAL" && user.cod_almoxarifado);
  const [data, setData] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inactivating, setInactivating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Estado dos filtros (controlled inputs). Conforme RF014: filtra pelos
  // dados do proprio almoxarifado (nome, cidade), no mesmo padrao das
  // telas de Funcionarios/Fornecedores.
  const [filtros, setFiltros] = useState({
    nome: "",
    cidade: ""
  });

  // Carrega a lista assim que a tela monta.
  useEffect(() => {
    carregarAlmoxarifados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Funcao central de busca ──
  // Recebe filtros opcionais; se vazio, retorna tudo. Monta a query string
  // apenas com campos preenchidos.
  function carregarAlmoxarifados(filtrosBusca = {}) {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    Object.entries(filtrosBusca).forEach(([chave, valor]) => {
      if (valor && String(valor).trim() !== "") {
        params.append(chave, String(valor).trim());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/almoxarifados?${queryString}`
      : `${API_URL}/almoxarifados`;

    fetch(url)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          // As CHAVES do objeto formatado precisam bater com `columns`.
          const formatado = result.dados.map(a => ({
            "Nome": a.nome,
            "Cidade": a.endereco
              ? `${a.endereco.cidade}/${a.endereco.estado}`
              : "—",
            "Telefone": a.telefones?.map(t => t.telefone).join(", ") || "—",
            "Email": a.email,
            // Campo "oculto" para recuperar o id nos handlers.
            __id__: a.cod_almoxarifado
          }));
          setData(formatado);
        } else {
          setError(result.erro || "Erro ao carregar almoxarifados");
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Erro ao conectar com o servidor: " + err.message);
        setLoading(false);
      });
  }

  // ── Handlers dos filtros ──
  function handleFiltroChange(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }

  function handleBuscar() {
    carregarAlmoxarifados(filtros);
  }

  function handleLimpar() {
    setFiltros({ nome: "", cidade: "" });
    carregarAlmoxarifados({});
  }

  // Permite buscar apertando Enter dentro de qualquer campo de filtro.
  function handleKeyDown(e) {
    if (e.key === "Enter") handleBuscar();
  }

  // ── Acoes por linha ──

  // Clique na LINHA (nao nos botoes): abre a tela de detalhes.
  function handleRowClick(item) {
    navigate(`/almoxarifados/${item.__id__}`);
  }

  function handleEdit(item) {
    navigate(`/almoxarifados/${item.__id__}/editar`);
  }

  function handleInactivateClick(item) {
    setSelectedItem(item);
    setOpenConfirm(true);
  }

  function handleConfirmInactivate() {
    setInactivating(true);
    setError("");

    fetch(`${API_URL}/almoxarifados/${selectedItem.__id__}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          carregarAlmoxarifados(filtros); // recarrega mantendo filtros atuais
        } else {
          setError(result.erro || "Erro ao inativar almoxarifado");
        }
        setInactivating(false);
        setOpenConfirm(false);
        setSelectedItem(null);
      })
      .catch(err => {
        setError("Erro ao inativar: " + err.message);
        setInactivating(false);
        setOpenConfirm(false);
        setSelectedItem(null);
      });
  }

  function handleCloseConfirm() {
    setOpenConfirm(false);
    setSelectedItem(null);
  }

  return (
    <Container maxWidth={false} disableGutters>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ListTemplate
        modulo="almoxarifados"
        canCreate={!restrito}
        title="Almoxarifados"
        columns={["Nome", "Cidade", "Telefone", "Email"]}
        data={data}
        loading={loading}
        onCreate={() => navigate("/almoxarifados/cadastro")}
        onEdit={handleEdit}
        onInactivate={handleInactivateClick}
        onSearch={handleBuscar}
        onClear={handleLimpar}
        onRowClick={handleRowClick}
        emptyMessage="Nenhum almoxarifado encontrado com os parâmetros informados."
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
              label="Cidade"
              size="small"
              value={filtros.cidade}
              onChange={(e) => handleFiltroChange("cidade", e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </>
        }
      />

      {/* Dialogo de confirmacao de inativacao (RF016). */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar inativação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja inativar o almoxarifado
            {selectedItem ? ` "${selectedItem.Nome}"` : ""}? Ele deixará de
            aparecer na listagem, mas o histórico será preservado.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={inactivating}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmInactivate}
            color="error"
            disabled={inactivating}
          >
            {inactivating ? "Inativando..." : "Inativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
