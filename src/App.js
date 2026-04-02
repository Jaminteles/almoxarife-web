import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Home
import Home from "./pages/home";

// Funcionários
import FuncionariosList from "./pages/funcionarios/List";
import FuncionarioForm from "./pages/funcionarios/Form";

// Fornecedores
import FornecedoresList from "./pages/fornecedores/List";
import FornecedorForm from "./pages/fornecedores/Form";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
            {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Funcionários */}
          <Route path="/funcionarios" element={<FuncionariosList />} />
          <Route path="/funcionarios/novo" element={<FuncionarioForm />} />

          {/* Fornecedores */}
          <Route path="/fornecedores" element={<FornecedoresList />} />
          <Route path="/fornecedores/novo" element={<FornecedorForm />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;