import { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { getTheme } from "./theme";
import ColorModeContext from "./ColorModeContext";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages";

// Funcionários
import FuncionariosList from "./pages/funcionarios/List";
import FuncionarioForm from "./pages/funcionarios/Form";
import FuncionarioEdit from "./pages/funcionarios/Edit";

// Fornecedores 
import FornecedoresList from "./pages/fornecedores/List";
import FornecedorForm from "./pages/fornecedores/Form";
import FornecedorEdit from "./pages/fornecedores/Edit";

// Almoxarifados
import AlmoxarifadosList from "./pages/almoxarifados/List";
import AlmoxarifadoDetalhes from "./pages/almoxarifados/Detalhes";
import AlmoxarifadoForm from "./pages/almoxarifados/Form";
import AlmoxarifadoEdit from "./pages/almoxarifados/Edit";

// Saidas 
import SaidasList from "./pages/saidas/List";
import SaidaForm from "./pages/saidas/Form";
import SaidaEdit from "./pages/saidas/Edit";

// Compras
import ListCompras from './pages/compras/List';
import FormCompras from './pages/compras/Form';
import EditCompras from './pages/compras/Edit';

// Produtos

import ProdutosList from "./pages/produtos/List"
import ProdutoForm from "./pages/produtos/Form"
import ProdutoEdit from "./pages/produtos/Edit"

function App() {
  // Modo do tema, persistido no navegador (mantém a escolha ao recarregar).
  const [mode, setMode] = useState(
    () => localStorage.getItem("colorMode") || "dark"
  );

  const colorMode = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((anterior) => {
          const novo = anterior === "dark" ? "light" : "dark";
          localStorage.setItem("colorMode", novo);
          return novo;
        })
    }),
    [mode]
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />

            {/*Rotas Funcionarios*/}
            <Route path="/funcionarios" element={<FuncionariosList />} />
            <Route path="/funcionarios/cadastro" element={<FuncionarioForm />} />
            <Route path="/funcionarios/:id/editar" element={<FuncionarioEdit />} />

            {/*Rotas Fornecedores*/}
            <Route path="/fornecedores" element={<FornecedoresList />} />
            <Route path="/fornecedores/cadastro" element={<FornecedorForm />} />
            <Route path="/fornecedores/:id/editar" element={<FornecedorEdit />} />

            {/*Rotas Almoxarifado*/}
            <Route path="/almoxarifados" element={<AlmoxarifadosList />} />
            <Route path="/almoxarifados/cadastro" element={<AlmoxarifadoForm />} />
            <Route path="/almoxarifados/:id/editar" element={<AlmoxarifadoEdit />} />
            <Route path="/almoxarifados/:id" element={<AlmoxarifadoDetalhes />} />

            {/*Rotas Saidas*/}
            <Route path="/saidas" element={<SaidasList />} />
            <Route path="/saidas/cadastro" element={<SaidaForm />} />
            <Route path="/saidas/:id/editar" element={<SaidaEdit />} />

            {/*Rotas Compras*/}
            <Route path="/compras" element={<ListCompras />} />
            <Route path="/compras/cadastro" element={<FormCompras />} />
            <Route path="/compras/:id/editar" element={<EditCompras />} />

            {/*Rotas Produtos*/}
            <Route path="/produtos" element={<ProdutosList />} />
            <Route path="/produtos/novo" element={<ProdutoForm />} />
            <Route path="/produtos/editar/:id" element={<ProdutoEdit />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
