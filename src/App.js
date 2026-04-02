import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";

// Funcionários
import FuncionariosList from "./pages/funcionarios/List";
import FuncionarioForm from "./pages/funcionarios/Form";

// Fornecedores
import FornecedoresList from "./pages/fornecedores/List";
import FornecedorForm from "./pages/fornecedores/Form";

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
            <Route path="/funcionarios/novo" element={<FuncionarioForm />} />

            <Route path="/fornecedores" element={<FornecedoresList />} />
            <Route path="/fornecedores/novo" element={<FornecedorForm />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;