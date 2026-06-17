import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ListTemplate from "../../components/ListTemplate";

const ProdutosList = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      // Certifique-se que o backend esteja rodando na porta correta (ex: 3001)
      const response = await fetch("http://localhost:3001/api/produtos");
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const response = await fetch(`/api/produtos/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Falha ao excluir");
        carregarProdutos();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        alert(
          "Erro ao excluir o produto. Verifique se ele não possui vínculos com estoques ou compras.",
        );
      }
    }
  };

  const colunas = [
    { key: "id", label: "ID" },
    { key: "nome", label: "Nome do Produto" },
    { key: "estoqueMinimo", label: "Estoque Mín." },
    { key: "estoqueMaximo", label: "Estoque Máx." },
    {
      key: "acoes",
      label: "Ações",
      render: (item) => (
        <>
          <Tooltip title="Editar">
            <IconButton
              onClick={() => navigate(`/produtos/editar/${item.id}`)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton onClick={() => handleExcluir(item.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <ListTemplate
      title="Gerenciamento de Produtos"
      loading={loading}
      columns={colunas}
      data={produtos}
      actionButton={
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/produtos/novo")}
        >
          Novo Produto
        </Button>
      }
    />
  );
};

export default ProdutosList;
