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
 * FuncionariosList — Tela de listagem de funcionários.
 */
export default function FuncionariosList() {
  const navigate = useNavigate();

  // ═══ ESTADOS ═══
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados do Dialog de confirmação de inativação
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inactivating, setInactivating] = useState(false);

  // Estado do Snackbar de feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // ═══ CARREGAMENTO INICIAL ═══
  useEffect(() => {
    carregarFuncionarios();
  }, []);

  /**
   * Carrega a lista de funcionários da API.
   */
  function carregarFuncionarios() {
    setLoading(true);
    fetch(`${API_URL}/funcionarios`)
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
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

  /**
   * Formata CPF de "12345678901" para "123.456.789-01"
   */
  function formatarCpf(cpf) {
    if (!cpf || cpf.length !== 11) return cpf;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
  }

  // ═══ HANDLERS ═══

  function handleEdit(item) {
    navigate(`/funcionarios/${item.id_funcionario}/editar`);
  }

  function handleInactivateClick(item) {
    setSelectedItem(item);
    setOpenConfirm(true);
  }

  /**
   * Executa a inativação após confirmação do usuário.
   */
  function handleConfirmInactivate() {
    setInactivating(true);
    setError("");

    fetch(`${API_URL}/funcionarios/${selectedItem.id_funcionario}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(result => {
        if (result.sucesso) {
          // Recarrega a lista para refletir a mudança
          carregarFuncionarios();
          // Mostra feedback de sucesso via Snackbar
          setSnackbar({
            open: true,
            message: `Funcionário "${selectedItem.nome}" inativado com sucesso`,
            severity: "success"
          });
        } else {
          // Mostra erro retornado pelo backend (ex: "Funcionário possui solicitações pendentes")
          setSnackbar({
            open: true,
            message: result.erro || "Erro ao inativar funcionário",
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

  // ═══ PREPARAÇÃO DOS DADOS PARA A TABELA ═══
  const dataTabela = data;

  // Remove o id_funcionario antes de passar para o template visual
  const dataVisivel = data.map(({ id_funcionario, ...visivel }) => visivel);

  return (
    <Container maxWidth="lg">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ListTemplate
        title="Funcionários"
        columns={["Nome", "CPF", "Cargo", "Email"]}
        data={dataVisivel}
        loading={loading}
        onCreate={() => navigate("/funcionarios/cadastro")}
        onEdit={(item) => {
          // Encontra o item original (com ID) pelo nome e CPF
          const original = dataTabela.find(d => d.nome === item.nome && d.cpf === item.cpf);
          if (original) handleEdit(original);
        }}
        /**
         * onInactivate — ESTA É A PROP QUE FAZ O BOTÃO APARECER
         * ======================================================
         * Como o ListTemplate agora renderiza o botão "Inativar" de forma
         * CONDICIONAL (só se onInactivate for passado), este é o ponto
         * que "ativa" o botão para o módulo de Funcionários.
         * 
         * Módulos que NÃO passam essa prop simplesmente não terão o botão.
         */
        onInactivate={(item) => {
          const original = dataTabela.find(d => d.nome === item.nome && d.cpf === item.cpf);
          if (original) handleInactivateClick(original);
        }}
        filters={
          <>
            <TextField label="Nome" size="small" />
            <TextField label="CPF" size="small" />
          </>
        }
      />

      {/* ═══ DIALOG DE CONFIRMAÇÃO ═══ 
          Conforme RF008: "O sistema exibe a mensagem de confirmação: 
          'Deseja inativar [Nome do Funcionário]?'"
      */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar Inativação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja inativar o funcionário <strong>{selectedItem?.nome}</strong>?
            <br />
            <br />
            Esta ação altera o status para "Inativo". O registro será mantido
            no sistema para fins de histórico e auditoria.
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
