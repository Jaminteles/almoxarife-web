import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";
import ListTemplate from "../../components/ListTemplate";

const API_URL = "http://localhost:5000/api";

const ProdutosList = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  // Estado de erro: em vez de engolir a falha no console, mostramos uma
  // faixa vermelha. Assim, se a lista vier vazia por erro do backend,
  // o motivo aparece na tela.
  const [erro, setErro] = useState("");

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      setErro("");

      const response = await fetch(`${API_URL}/produtos`);

      // Trata resposta que não seja JSON (ex.: página HTML de erro 500/404),
      // evitando o "Unexpected token '<'" e expondo o status real.
      const contentType = response.headers.get("content-type") || "";
      const dados = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          (dados && dados.erro) ||
          `Erro ${response.status} ao carregar os produtos.`
        );
      }

      // Se o backend retornar erro em formato { erro: ... } com status 200,
      // ou algo que não seja um array, não tentamos mapear.
      if (!Array.isArray(dados)) {
        throw new Error(
          (dados && dados.erro) ||
          "Resposta inesperada do servidor ao listar produtos."
        );
      }

      // O ListTemplate espera objetos cujas CHAVES batem com `columns`.
      const formatado = dados.map((p) => ({
        "ID": p.id_produto,
        "Nome do Produto": p.nome,
        "Estoque Mín.": p.estoque_minimo,
        "Estoque Máx.": p.estoque_maximo,
        __id__: p.id_produto,
      }));

      setProdutos(formatado);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setErro(
        error.message === "Failed to fetch"
          ? "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const handleInativar = async (item) => {
    if (!window.confirm("Tem certeza que deseja inativar este produto?")) return;
    try {
      const response = await fetch(`${API_URL}/produtos/${item.__id__}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao inativar");
      carregarProdutos();
    } catch (error) {
      console.error("Erro ao inativar produto:", error);
      setErro("Erro ao inativar o produto. Verifique se ele não possui estoque disponível.");
    }
  };

  return (
    <>
      {erro && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro("")}>
          {erro}
        </Alert>
      )}
      <ListTemplate
        title="Gerenciamento de Produtos"
        loading={loading}
        columns={["ID", "Nome do Produto", "Estoque Mín.", "Estoque Máx."]}
        data={produtos}
        onCreate={() => navigate("/produtos/novo")}
        onEdit={(item) => navigate(`/produtos/editar/${item.__id__}`)}
        onInactivate={handleInativar}
        actionLabel="Inativar"
      />
    </>
  );
};

export default ProdutosList;
