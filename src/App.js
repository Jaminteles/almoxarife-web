import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

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

const darkTheme = createTheme({
  palette: {
    mode: "dark"
  }
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/funcionarios" element={<FuncionariosList />} />
            <Route path="/funcionarios/cadastro" element={<FuncionarioForm />} />
            <Route path="/funcionarios/:id/editar" element={<FuncionarioEdit />} />

            <Route path="/fornecedores" element={<FornecedoresList />} />
            <Route path="/fornecedores/cadastro" element={<FornecedorForm />} />
            <Route path="/fornecedores/:id/editar" element={<FornecedorEdit />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
