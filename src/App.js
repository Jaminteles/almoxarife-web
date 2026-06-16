import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "./theme";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages";
import ComingSoon from "./pages/ComingSoon";

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

function App() {
  return (
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

            {/*
              Módulos "fantasma" — ainda não implementados, mas já têm rota
              reservada. Isso evita 404 quando o usuário clica no menu lateral
              e também deixa pronto para quando a equipe for implementar.
            */}

           <Route path="/compras" element={<ListCompras />} />
           <Route path="/compras/novo" element={<FormCompras />} />
           <Route path="/compras/editar/:id" element={<FormCompras />} />  

            <Route path="/produtos"       element={<ComingSoon title="Produtos / Itens" />} />
            <Route path="/entradas"       element={<ComingSoon title="Entradas" />} />
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
