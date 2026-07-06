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
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import ListTemplate from "../../components/ListTemplate";

const API_URL = `http://${window.location.hostname}:5000/api`;
const filtrosVazios = { data: "", destino: "", responsavel: "", produto: "", tipo: "" };

export default function SaidasList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState({ ...filtrosVazios });
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // Estado do dialogo de confirmacao (Inativar/Excluir).
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [removendo, setRemovendo] = useState(false);

  // Carrega ao montar a tela.
  useEffect(() => {
    carregarSaidas({});
    carregarOpcoesFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function carregarOpcoesFiltros() {
    Promise.all([
      fetch(`${API_URL}/almoxarifados`).then((res) => res.json()),
      // Lookup de apoio: funciona mesmo para quem não acessa o módulo Funcionários.
      fetch(`${API_URL}/lookups/funcionarios`).then((res) => res.json()),
      fetch(`${API_URL}/produtos`).then((r) => r.json()).catch(() => ({ sucesso: false }))
    ])
      .then(([resAlmoxarifados, resFuncionarios, resProdutos]) => {
        if (resAlmoxarifados.sucesso) setAlmoxarifados(resAlmoxarifados.dados);
        if (resFuncionarios.sucesso) setFuncionarios(resFuncionarios.dados);
        if (resProdutos.sucesso) setProdutos(resProdutos.dados);
      })
      .catch(() => {
        // A listagem principal ainda mostra seu proprio erro se a API falhar.
      });
  }

  /**
   * Formata o timestamp do banco para dd/mm/aaaa (pt-BR).
   * Defensivo: se vier vazio/invalido, devolve travessao.
   */
  function formatarData(valor) {
    if (!valor) return "—";
    const d = new Date(valor);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR");
  }

  /**
   * Busca as saidas na API aplicando os filtros como querystring.
   * Mantem a mesma assinatura/contrato dos outros modulos.
   */
  function carregarSaidas(filtrosAtuais) {
    setLoading(true);
    setError("");

    // Monta a querystring so com os filtros preenchidos.
    const params = new URLSearchParams();
    if (filtrosAtuais.data) params.append("data", filtrosAtuais.data);
    if (filtrosAtuais.destino) params.append("destino", filtrosAtuais.destino);
    if (filtrosAtuais.responsavel) params.append("responsavel", filtrosAtuais.responsavel);
    if (filtrosAtuais.produto) params.append("produto", filtrosAtuais.produto);
    if (filtrosAtuais.tipo) params.append("tipo", filtrosAtuais.tipo);
    const query = params.toString() ? `?${params.toString()}` : "";

    fetch(`${API_URL}/saidas${query}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          // Mapeia o registro cru da API para o formato que a tabela exibe.
          const formatado = result.dados.map((s) => ({
            "Data": formatarData(s.data_saida),
            "Origem": s.almoxarifadoOrigem?.nome || "—",
            "Tipo": s.tipo_saida === "TRANSFERENCIA" ? "Transferência" : "Consumo",
            // Destino so faz sentido em transferencia; em consumo nao ha destino.
            "Destino":
              s.tipo_saida === "TRANSFERENCIA"
                ? s.almoxarifadoDestino?.nome || "—"
                : "—",
            "Responsável": s.responsavel?.nome || "—",
            "Produtos": s.itens?.map((item) => item.produto?.nome || `Produto ${item.id_produto}`).join(", ") || "—",
            "Observação": s.observacao || "—",
            // Campo "oculto" para recuperar o id nos handlers (mesmo truque do almoxarifado).
            __id__: s.id_saida
          }));
          setData(formatado);
        } else {
          setError(result.erro || "Erro ao carregar saídas");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao conectar com o servidor: " + err.message);
        setLoading(false);
      });
  }

  // ── Handlers dos filtros ──
  function handleFiltroChange(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleBuscar() {
    carregarSaidas(filtros);
  }

  function handleLimpar() {
    setFiltros({ ...filtrosVazios });
    carregarSaidas({});
  }

  // Permite buscar apertando Enter dentro de qualquer campo de filtro.
  function handleKeyDown(e) {
    if (e.key === "Enter") handleBuscar();
  }

  // ── Acoes por linha ──
  function handleEdit(item) {
    navigate(`/saidas/${item.__id__}/editar`);
  }

  function handleExcluirClick(item) {
    setSelectedItem(item);
    setOpenConfirm(true);
  }

  function handleConfirmRemove() {
    setRemovendo(true);
    setError("");

    fetch(`${API_URL}/saidas/${selectedItem.__id__}`, {
      method: "DELETE"
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.sucesso) {
          carregarSaidas(filtros); // recarrega mantendo os filtros atuais
        } else {
          setError(result.erro || "Erro ao remover a saída");
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

  function handleCloseConfirm() {
    if (removendo) return; // evita fechar no meio da requisicao
    setOpenConfirm(false);
    setSelectedItem(null);
  }

  return (
    <Container maxWidth={false} disableGutters>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <ListTemplate
        modulo="saidas"
        title="Saídas"
        columns={["Data", "Origem", "Tipo", "Destino", "Responsável", "Produtos", "Observação"]}
        data={data}
        loading={loading}
        onCreate={() => navigate("/saidas/cadastro")}
        onEdit={handleEdit}
        onInactivate={handleExcluirClick}
        onSearch={handleBuscar}
        onClear={handleLimpar}
        emptyMessage="Nenhuma saída encontrada com os parâmetros informados."
        // Caminho A: a acao da saida e EXCLUSAO real (RF020), nao inativacao.
        // Por isso sobrescrevemos o botao destrutivo padrao do template.
        actionLabel="Excluir"
        actionIcon={<DeleteOutlineIcon fontSize="small" />}
        actionColor="error.main"
        filters={
          <>
            <TextField
              label="Data"
              type="date"
              size="small"
              value={filtros.data}
              onChange={(e) => handleFiltroChange("data", e.target.value)}
              InputLabelProps={{ shrink: true }}
              onKeyDown={handleKeyDown}
            />
            <TextField
              select
              label="Tipo"
              size="small"
              value={filtros.tipo}
              onChange={(e) => handleFiltroChange("tipo", e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="CONSUMO">Consumo</MenuItem>
              <MenuItem value="TRANSFERENCIA">Transferência</MenuItem>
            </TextField>
            <TextField
              select
              label="Destino"
              size="small"
              value={filtros.destino}
              onChange={(e) => handleFiltroChange("destino", e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {almoxarifados.map((almoxarifado) => (
                <MenuItem
                  key={almoxarifado.cod_almoxarifado}
                  value={almoxarifado.cod_almoxarifado}
                >
                  {almoxarifado.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Responsável"
              size="small"
              value={filtros.responsavel}
              onChange={(e) => handleFiltroChange("responsavel", e.target.value)}
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {funcionarios.map((funcionario) => (
                <MenuItem
                  key={funcionario.id_funcionario}
                  value={funcionario.id_funcionario}
                >
                  {funcionario.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Produto"
              size="small"
              value={filtros.produto}
              onChange={(e) => handleFiltroChange("produto", e.target.value)}
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {produtos.map((produto) => (
                <MenuItem key={produto.id_produto} value={produto.id_produto}>
                  {produto.nome}
                </MenuItem>
              ))}
            </TextField>
          </>
        }
      />

      {/* Dialogo de confirmacao da acao destrutiva (RF020 - Excluir Saida). */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar remoção da saída</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover esta saída? Conforme o RF020, a
            exclusão devolve ao estoque a quantidade que havia sido baixada.
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={removendo}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmRemove} color="error" disabled={removendo}>
            {removendo ? "Removendo..." : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
