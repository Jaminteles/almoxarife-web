import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MainLayout from "../../layouts/MainLayout";
import axios from "axios";

// Porta corrigida para a da sua API
const API_URL = "http://localhost:5000/api";

export default function FormCompras() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [fornecedores, setFornecedores] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [formData, setFormData] = useState({
    id_fornecedor: "",
    id_funcionario_comprador: "",
    cod_almoxarifado_destino: "",
    status_pedido: "PENDENTE",
    numero_nota_fiscal: "",
    data_pedido: new Date().toISOString().slice(0, 10)
  });

  const [itens, setItens] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarDependencias();
    if (isEdit) {
      carregarCompra();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const carregarDependencias = async () => {
    try {
      const [resFornecedores, resFuncionarios, resAlmoxarifados, resProdutos] = await Promise.all([
        axios.get(`${API_URL}/fornecedores`),
        axios.get(`${API_URL}/funcionarios`),
        axios.get(`${API_URL}/almoxarifados`),
        axios.get(`${API_URL}/produtos`)
      ]);

      setFornecedores(resFornecedores.data.dados || resFornecedores.data || []);
      setFuncionarios(resFuncionarios.data.dados || resFuncionarios.data || []);
      setAlmoxarifados(resAlmoxarifados.data.dados || resAlmoxarifados.data || []);
      setProdutos(resProdutos.data.dados || resProdutos.data || []);
    } catch (err) {
      console.error("Erro ao carregar dependências", err);
      setError("Falha ao carregar opções para o formulário. Verifique a conexão com o servidor.");
    }
  };

  const carregarCompra = async () => {
    try {
      const res = await axios.get(`${API_URL}/compras/${id}`);
      const dados = res.data.dados || res.data;
      
      setFormData({
        id_fornecedor: dados.id_fornecedor || "",
        id_funcionario_comprador: dados.id_funcionario_comprador || "",
        cod_almoxarifado_destino: dados.cod_almoxarifado_destino || "",
        status_pedido: dados.status_pedido || "PENDENTE",
        numero_nota_fiscal: dados.numero_nota_fiscal || "",
        data_pedido: dados.data_pedido ? new Date(dados.data_pedido).toISOString().slice(0, 10) : ""
      });

      const itensRecebidos = dados.Item_Compras || dados.Itens || [];
      setItens(itensRecebidos.map(i => ({
        id_produto: i.id_produto,
        quantidade: i.quantidade,
        preco_unitario_acordado: i.preco_unitario_acordado
      })));

    } catch (err) {
      setError("Erro ao carregar os dados da compra.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    setItens([...itens, { id_produto: "", quantidade: 1, preco_unitario_acordado: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const novosItens = itens.filter((_, i) => i !== index);
    setItens(novosItens);
  };

  const handleItemChange = (index, campo, valor) => {
    const novosItens = [...itens];
    novosItens[index][campo] = valor;
    setItens(novosItens);
  };

  const calcularValorTotal = () => {
    return itens.reduce((acc, item) => {
      const qtd = parseFloat(item.quantidade) || 0;
      const preco = parseFloat(item.preco_unitario_acordado) || 0;
      return acc + (qtd * preco);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (itens.length === 0) {
      setError("É necessário adicionar pelo menos um item à compra.");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      valor_total_pedido: calcularValorTotal(),
      itens: itens
    };

    try {
      if (isEdit) {
        await axios.put(`${API_URL}/compras/${id}`, payload);
      } else {
        await axios.post(`${API_URL}/compras`, payload);
      }
      navigate("/compras");
    } catch (err) {
      setError(err.response?.data?.erro || "Erro ao salvar a compra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* O disableGutters garante que o container não conflite com as margens do MainLayout */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column' }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, bgcolor: 'background.paper', width: '100%' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
            {isEdit ? "Editar Compra" : "Nova Compra"}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Adicionado width: '100%' para forçar o formulário a expandir */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            
            <Typography variant="h6" color="text.primary" sx={{ mt: 2, mb: 3, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              Dados Gerais
            </Typography>
            
            {/* O spacing e o width garantem a expansão do Grid */}
            <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  required
                  variant="outlined"
                  label="Fornecedor"
                  name="id_fornecedor"
                  value={formData.id_fornecedor}
                  onChange={handleChange}
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {fornecedores.map((f) => (
                    <MenuItem key={f.id_fornecedor || f.id} value={f.id_fornecedor || f.id}>
                      {f.nome || f.razao_social}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  required
                  variant="outlined"
                  label="Comprador"
                  name="id_funcionario_comprador"
                  value={formData.id_funcionario_comprador}
                  onChange={handleChange}
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {funcionarios.map((func) => (
                    <MenuItem key={func.id_funcionario} value={func.id_funcionario}>
                      {func.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  required
                  variant="outlined"
                  label="Almoxarifado Destino"
                  name="cod_almoxarifado_destino"
                  value={formData.cod_almoxarifado_destino}
                  onChange={handleChange}
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {almoxarifados.map((a) => (
                    <MenuItem key={a.cod_almoxarifado} value={a.cod_almoxarifado}>
                      {a.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  required
                  variant="outlined"
                  type="date"
                  label="Data do Pedido"
                  name="data_pedido"
                  value={formData.data_pedido}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Número da Nota Fiscal"
                  name="numero_nota_fiscal"
                  value={formData.numero_nota_fiscal}
                  onChange={handleChange}
                  placeholder="Ex: 001.234.567"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  required
                  variant="outlined"
                  label="Status do Pedido"
                  name="status_pedido"
                  value={formData.status_pedido}
                  onChange={handleChange}
                >
                  <MenuItem value="PENDENTE">Pendente</MenuItem>
                  <MenuItem value="RECEBIDO">Recebido</MenuItem>
                  <MenuItem value="CANCELADO">Cancelado</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* Seção de Itens da Compra */}
            <Box sx={{ mt: 6, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', pb: 1, width: '100%' }}>
              <Typography variant="h6" color="text.primary">
                Itens da Compra
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleAddItem}
              >
                Adicionar Item
              </Button>
            </Box>

            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              <Table size="small" sx={{ minWidth: 650, mb: 4 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Produto</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }} width="20%">Quantidade</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }} width="20%">Preço Unitário (R$)</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }} width="20%">Subtotal</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }} width="10%" align="center">Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itens.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          required
                          variant="outlined"
                          value={item.id_produto}
                          onChange={(e) => handleItemChange(index, "id_produto", e.target.value)}
                        >
                          <MenuItem value="">Selecione...</MenuItem>
                          {produtos.map((p) => (
                            <MenuItem key={p.id_produto} value={p.id_produto}>{p.nome}</MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          fullWidth
                          size="small"
                          required
                          variant="outlined"
                          inputProps={{ min: 0.001, step: "0.001" }}
                          value={item.quantidade}
                          onChange={(e) => handleItemChange(index, "quantidade", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          fullWidth
                          size="small"
                          required
                          variant="outlined"
                          inputProps={{ min: 0, step: "0.01" }}
                          value={item.preco_unitario_acordado}
                          onChange={(e) => handleItemChange(index, "preco_unitario_acordado", e.target.value)}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        {((parseFloat(item.quantidade) || 0) * (parseFloat(item.preco_unitario_acordado) || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {itens.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Nenhum item adicionado. Clique no botão acima para incluir produtos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, width: '100%' }}>
              <Typography variant="h5" color="primary" fontWeight="bold">
                Total do Pedido: {calcularValorTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            </Box>

            {/* Ações Finais */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, width: '100%' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate("/compras")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Compra"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}