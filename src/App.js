import { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { getTheme } from "./theme";
import ColorModeContext from "./ColorModeContext";
import MainLayout from "./layouts/MainLayout";

import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute, RequireModule, RequireCentral } from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import SolicitarCadastro from "./pages/SolicitarCadastro";
import SemPermissao from "./pages/SemPermissao";
import SolicitacoesList from "./pages/solicitacoes/List";

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
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/solicitar-cadastro" element={<SolicitarCadastro />} />

            {/* Área autenticada: MainLayout com <Outlet/>, protegida por login */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/sem-permissao" element={<SemPermissao />} />

              {/* Solicitações de cadastro (somente CENTRAL) */}
              <Route path="/solicitacoes" element={<RequireCentral><SolicitacoesList /></RequireCentral>} />

              {/*Rotas Funcionarios*/}
              <Route path="/funcionarios" element={<RequireModule modulo="funcionarios"><FuncionariosList /></RequireModule>} />
              <Route path="/funcionarios/cadastro" element={<RequireModule modulo="funcionarios" acao="editar"><FuncionarioForm /></RequireModule>} />
              <Route path="/funcionarios/:id/editar" element={<RequireModule modulo="funcionarios" acao="editar"><FuncionarioEdit /></RequireModule>} />

              {/*Rotas Fornecedores*/}
              <Route path="/fornecedores" element={<RequireModule modulo="fornecedores"><FornecedoresList /></RequireModule>} />
              <Route path="/fornecedores/cadastro" element={<RequireModule modulo="fornecedores" acao="editar"><FornecedorForm /></RequireModule>} />
              <Route path="/fornecedores/:id/editar" element={<RequireModule modulo="fornecedores" acao="editar"><FornecedorEdit /></RequireModule>} />

              {/*Rotas Almoxarifado*/}
              <Route path="/almoxarifados" element={<RequireModule modulo="almoxarifados"><AlmoxarifadosList /></RequireModule>} />
              <Route path="/almoxarifados/cadastro" element={<RequireModule modulo="almoxarifados" acao="editar"><AlmoxarifadoForm /></RequireModule>} />
              <Route path="/almoxarifados/:id/editar" element={<RequireModule modulo="almoxarifados" acao="editar"><AlmoxarifadoEdit /></RequireModule>} />
              <Route path="/almoxarifados/:id" element={<RequireModule modulo="almoxarifados"><AlmoxarifadoDetalhes /></RequireModule>} />

              {/*Rotas Saidas*/}
              <Route path="/saidas" element={<RequireModule modulo="saidas"><SaidasList /></RequireModule>} />
              <Route path="/saidas/cadastro" element={<RequireModule modulo="saidas" acao="editar"><SaidaForm /></RequireModule>} />
              <Route path="/saidas/:id/editar" element={<RequireModule modulo="saidas" acao="editar"><SaidaEdit /></RequireModule>} />

              {/*Rotas Compras*/}
              <Route path="/compras" element={<RequireModule modulo="compras"><ListCompras /></RequireModule>} />
              <Route path="/compras/cadastro" element={<RequireModule modulo="compras" acao="editar"><FormCompras /></RequireModule>} />
              <Route path="/compras/:id/editar" element={<RequireModule modulo="compras" acao="editar"><EditCompras /></RequireModule>} />

              {/*Rotas Produtos*/}
              <Route path="/produtos" element={<RequireModule modulo="produtos"><ProdutosList /></RequireModule>} />
              <Route path="/produtos/novo" element={<RequireModule modulo="produtos" acao="editar"><ProdutoForm /></RequireModule>} />
              <Route path="/produtos/editar/:id" element={<RequireModule modulo="produtos" acao="editar"><ProdutoEdit /></RequireModule>} />
            </Route>

            {/* Qualquer outra rota → início (ou login, se não autenticado) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
