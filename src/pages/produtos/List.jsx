import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, TextField } from "@mui/material";
import ListTemplate from "../../components/ListTemplate";

const API_URL = `http://${window.location.hostname}:5000/api`;

const ProdutosList = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  // Estado de erro: em vez de engolir a falha no console, mostramos uma
  // faixa vermelha. Assim, se a lista vier vazia por erro do backend,
  // o motivo aparece na tela.
  const [erro, setErro] = useState("");

  // Filtros de busca [RF002]: ID, nome, preço de custo, fornecedor,
  // estoque mínimo e estoque máximo.
  const filtrosVazios = {
    id_produto: "",
    nome: "",
    preco_custo: "",
    fornecedor: "",
    estoque_minimo: "",
    estoque_maximo: ""
  };
  const [filtros, setFiltros] = useState(filtrosVazios);

  // Formata número como moeda BRL (preço de custo).
  const formatarMoeda = (v) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const carregarProdutos = async (filtrosBusca = {}) => {
    try {
      setLoading(true);
      setErro("");

      // Monta a query string apenas com campos preenchidos.
      const params = new URLSearchParams();
      Object.entries(filtrosBusca).forEach(([chave, valor]) => {
        if (valor && String(valor).trim() !== "") {
          params.append(chave, String(valor).trim());
        }
      });
      const queryString = params.toString();
      const url = queryString
        ? `${API_URL}/produtos?${queryString}`
        : `${API_URL}/produtos`;

      const response = await fetch(url);

      // Trata resposta que não seja JSON (ex.: página HTML de erro 500/404),
      // evitando o "Unexpected token '<'" e expondo o status real.
      const contentType = response.headers.get("content-type") || "";
      const dados = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok || !dados || dados.sucesso === false) {
        throw new Error(
          (dados && dados.erro) ||
          `Erro ${response.status} ao carregar os produtos.`
        );
      }

      // Backend responde { sucesso, dados, total }; a lista fica em `dados`.
      const lista = Array.isArray(dados.dados) ? dados.dados : [];

      // O ListTemplate espera objetos cujas CHAVES batem com `columns`.
      const formatado = lista.map((p) => ({
        "ID": p.id_produto,
        "Nome do Produto": p.nome,
        "Preço de Custo": formatarMoeda(p.preco_custo),
        "Unidade": p.unidade_medida,
        "Fornecedor(es)": Array.isArray(p.fornecedores) && p.fornecedores.length
          ? p.fornecedores.map((f) => f.razao_social).join(", ")
          : "—",
        "Estoque Mín.": p.estoque_minimo,
        "Estoque Máx.": p.estoque_maximo ?? "—",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuscar = () => carregarProdutos(filtros);

  const handleLimpar = () => {
    setFiltros(filtrosVazios);
    carregarProdutos({});
  };

  const handleFiltroChange = (campo, valor) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  const handleInativar = async (item) => {
    if (!window.confirm("Tem certeza que deseja inativar este produto?")) return;
    try {
      const response = await fetch(`${API_URL}/produtos/${item.__id__}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao inativar");
      carregarProdutos(filtros);
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
        modulo="produtos"
        title="Gerenciamento de Produtos"
        loading={loading}
        columns={[
          "ID",
          "Nome do Produto",
          "Preço de Custo",
          "Unidade",
          "Fornecedor(es)",
          "Estoque Mín.",
          "Estoque Máx."
        ]}
        data={produtos}
        onCreate={() => navigate("/produtos/novo")}
        onEdit={(item) => navigate(`/produtos/editar/${item.__id__}`)}
        onInactivate={handleInativar}
        onSearch={handleBuscar}
        onClear={handleLimpar}
        actionLabel="Inativar"
        emptyMessage="Nenhum produto encontrado com os parâmetros informados."
        filters={
          <>
            <TextField
              label="ID"
              size="small"
              type="number"
              sx={{ width: 90 }}
              value={filtros.id_produto}
              onChange={(e) => handleFiltroChange("id_produto", e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Nome do Produto"
              size="small"
              value={filtros.nome}
              onChange={(e) => handleFiltroChange("nome", e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Preço de Custo"
              size="small"
              type="number"
              sx={{ width: 140 }}
              value={filtros.preco_custo}
              onChange={(e) => handleFiltroChange("preco_custo", e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Fornecedor"
              size="small"
              value={filtros.fornecedor}
              onChange={(e) => handleFiltroChange("fornecedor", e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Estoque Mín."
              size="small"
              type="number"
              sx={{ width: 120 }}
              value={filtros.estoque_minimo}
              onChange={(e) => handleFiltroChange("estoque_minimo", e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Estoque Máx."
              size="small"
              type="number"
              sx={{ width: 120 }}
              value={filtros.estoque_maximo}
              onChange={(e) => handleFiltroChange("estoque_maximo", e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </>
        }
      />
    </>
  );
};

export default ProdutosList;
