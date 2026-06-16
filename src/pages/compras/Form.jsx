import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Button, Grid, Typography, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import FormPageHeader from '../../components/FormPageHeader';

const Form = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_fornecedor: '',
    id_almoxarifado_destino: '',
    numero_nota_fiscal: '',
    data_compra: '',
    status: 'PENDENTE',
    itens: [{ id_produto: '', quantidade: '', valor_unitario: '' }]
  });

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/compras/${id}`)
        .then(res => setFormData(res.data.dados))
        .catch(err => console.error("Erro ao carregar dados:", err));
    }
  }, [id]);

  const handleItemChange = (index, field, value) => {
    const newItens = [...formData.itens];
    newItens[index][field] = value;
    setFormData({ ...formData, itens: newItens });
  };

  const addItem = () => {
    setFormData({ ...formData, itens: [...formData.itens, { id_produto: '', quantidade: '', valor_unitario: '' }] });
  };

  const removeItem = (index) => {
    setFormData({ ...formData, itens: formData.itens.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/compras/${id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/compras', formData);
      }
      navigate('/compras');
    } catch (err) {
      alert("Erro ao salvar: " + (err.response?.data?.erro || err.message));
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <FormPageHeader title={id ? "Editar Compra" : "Nova Compra"} />
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth label="Nota Fiscal" value={formData.numero_nota_fiscal} onChange={(e) => setFormData({...formData, numero_nota_fiscal: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="ID Fornecedor" value={formData.id_fornecedor} onChange={(e) => setFormData({...formData, id_fornecedor: e.target.value})} />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Itens da Compra</Typography>
          {formData.itens.map((item, index) => (
            <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
              <Grid item xs={4}>
                <TextField fullWidth size="small" label="ID Produto" value={item.id_produto} onChange={(e) => handleItemChange(index, 'id_produto', e.target.value)} />
              </Grid>
              <Grid item xs={3}>
                <TextField fullWidth size="small" label="Qtd" value={item.quantidade} onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth size="small" label="Valor Unit." value={item.valor_unitario} onChange={(e) => handleItemChange(index, 'valor_unitario', e.target.value)} />
              </Grid>
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => removeItem(index)}><DeleteIcon /></IconButton>
              </Grid>
            </Grid>
          ))}

          <Button variant="outlined" sx={{ mt: 2 }} onClick={addItem}>Adicionar Produto</Button>
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }}>Salvar Compra</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Form;