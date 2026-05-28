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
import FuncionarioDetalhes from "./pages/funcionarios/Detalhes";

// Fornecedores (módulo real)
import FornecedoresList from "./pages/fornecedores/List";
import FornecedorForm from "./pages/fornecedores/Form";
import FornecedorEdit from "./pages/fornecedores/Edit";

// Almoxarifados (módulo novo — front-end completo, backend pendente)
import AlmoxarifadosList from "./pages/almoxarifados/List";
import AlmoxarifadoDetalhes from "./pages/almoxarifados/Detalhes";
import AlmoxarifadoForm from "./pages/almoxarifados/Form";
import AlmoxarifadoEdit from "./pages/almoxarifados/Edit";

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
            <Route path="/funcionarios/:id" element={<FuncionarioDetalhes />} />
            <Route path="/funcionarios/:id/editar" element={<FuncionarioEdit />} />

            <Route path="/fornecedores" element={<FornecedoresList />} />
            <Route path="/fornecedores/cadastro" element={<FornecedorForm />} />
            <Route path="/fornecedores/:id/editar" element={<FornecedorEdit />} />

            {/*
              Módulo Almoxarifados — fluxo:
              /almoxarifados            → listagem (com editar e inativar)
              /almoxarifados/cadastro   → cadastro (RF013)
              /almoxarifados/:id        → detalhes do almoxarifado (estoque, fornecedores)
              /almoxarifados/:id/editar → edição (RF015)

              Mantenho a ORDEM importante das rotas:
              - "/cadastro" PRECISA vir antes de "/:id" senão o React Router
                interpreta "cadastro" como se fosse um ID e abre a tela
                de detalhes ao invés do form. Padrão de rotas dinâmicas.
            */}
            <Route path="/almoxarifados" element={<AlmoxarifadosList />} />
            <Route path="/almoxarifados/cadastro" element={<AlmoxarifadoForm />} />
            <Route path="/almoxarifados/:id/editar" element={<AlmoxarifadoEdit />} />
            <Route path="/almoxarifados/:id" element={<AlmoxarifadoDetalhes />} />

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
