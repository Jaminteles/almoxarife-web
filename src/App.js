import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "./theme";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages";
import ComingSoon from "./pages/ComingSoon";

// Funcionários (módulo real)
import FuncionariosList from "./pages/funcionarios/List";
import FuncionarioForm from "./pages/funcionarios/Form";
import FuncionarioEdit from "./pages/funcionarios/Edit";

// Fornecedores (módulo real)
import FornecedoresList from "./pages/fornecedores/List";
import FornecedorForm from "./pages/fornecedores/Form";
import FornecedorEdit from "./pages/fornecedores/Edit";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Módulos implementados */}
            <Route path="/funcionarios" element={<FuncionariosList />} />
            <Route path="/funcionarios/cadastro" element={<FuncionarioForm />} />
            <Route path="/funcionarios/:id/editar" element={<FuncionarioEdit />} />

            <Route path="/fornecedores" element={<FornecedoresList />} />
            <Route path="/fornecedores/cadastro" element={<FornecedorForm />} />
            <Route path="/fornecedores/:id/editar" element={<FornecedorEdit />} />

            {/*
              Módulos "fantasma" — ainda não implementados, mas já têm rota
              reservada. Isso evita 404 quando o usuário clica no menu lateral
              e também deixa pronto para quando a equipe for implementar.
            */}
            <Route path="/produtos"       element={<ComingSoon title="Produtos / Itens" />} />
            <Route path="/entradas"       element={<ComingSoon title="Entradas" />} />
            <Route path="/saidas"         element={<ComingSoon title="Saídas" />} />
            <Route path="/movimentacoes"  element={<ComingSoon title="Movimentações" />} />
            <Route path="/relatorios"     element={<ComingSoon title="Relatórios" />} />
            <Route path="/configuracoes"  element={<ComingSoon title="Configurações" />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
