// src/pages/compras/List.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ListTemplate from '../../components/ListTemplate';

const List = () => {
  const [compras, setCompras] = useState([]);
  const navigate = useNavigate();

  const fetchCompras = async (filtros = {}) => {
    try {
      // Ajuste a URL conforme o seu servidor (5000 é o padrão no seu código)
      const response = await axios.get('http://localhost:5000/api/compras', { params: filtros });
      setCompras(response.data.dados);
    } catch (err) {
      console.error("Erro ao carregar compras", err);
    }
  };

  useEffect(() => { fetchCompras(); }, []);

  const columns = [
    { title: 'Nota Fiscal', field: 'numero_nota_fiscal' },
    { title: 'Fornecedor', field: 'fornecedor.nome_fantasia' },
    { title: 'Data', field: 'data_compra' },
    { title: 'Status', field: 'status' }
  ];

  return (
    <ListTemplate 
      title="Gestão de Compras"
      data={compras}
      columns={columns}
      onAdd={() => navigate('/compras/novo')}
      onEdit={(id) => navigate(`/compras/editar/${id}`)}
      onFilter={fetchCompras}
    />
  );
};
export default List;